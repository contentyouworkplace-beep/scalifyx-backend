const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { sendPushNotification } = require('../lib/pushNotifications');
const { sendWebPushBroadcast } = require('../lib/webPush');

let _Razorpay = null;
function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  try {
    if (!_Razorpay) _Razorpay = require('razorpay');
    return new _Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (e) {
    console.error('Razorpay init error:', e.message);
    return null;
  }
}

async function createRazorpayLink(offer) {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) return null;
    const link = await razorpay.paymentLink.create({
      amount: offer.price * 100,
      currency: 'INR',
      description: `${offer.name} — Monthly`,
      notify: { sms: true, email: true },
      reminder_enable: true,
      notes: { plan: offer.plan_type, offerId: offer.id || '' },
      callback_url: `${process.env.FRONTEND_URL || 'https://scalifyapp.com'}/dashboard/plans?payment=success`,
      callback_method: 'get',
    });
    return link.short_url;
  } catch (err) {
    console.error('Razorpay link creation error:', err.message);
    return null;
  }
}

// ─── In-memory cache for AI setting (loaded from DB on first request) ───
let _aiChatEnabled = null; // null = not loaded yet

async function getAiChatEnabled() {
  if (_aiChatEnabled !== null) return _aiChatEnabled;
  const { data } = await supabaseAdmin.from('app_settings').select('value').eq('key', 'ai_chat_enabled').single();
  _aiChatEnabled = data?.value === true || data?.value === 'true';
  return _aiChatEnabled;
}

// Exported so chat routes can check it
router.getAiChatEnabled = getAiChatEnabled;

// GET /api/admin/ai-settings
router.get('/ai-settings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const enabled = await getAiChatEnabled();
    res.json({ ai_chat_enabled: enabled });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI settings' });
  }
});

// PUT /api/admin/ai-settings
router.put('/ai-settings', authMiddleware, adminMiddleware, async (req, res) => {
  const { ai_chat_enabled } = req.body;
  if (typeof ai_chat_enabled !== 'boolean') {
    return res.status(400).json({ error: 'ai_chat_enabled must be boolean' });
  }
  try {
    await supabaseAdmin.from('app_settings').upsert({ key: 'ai_chat_enabled', value: ai_chat_enabled, updated_at: new Date().toISOString() });
    _aiChatEnabled = ai_chat_enabled; // update cache
    res.json({ success: true, ai_chat_enabled });
  } catch (error) {
    console.error('Update AI settings error:', error);
    res.status(500).json({ error: 'Failed to update AI settings' });
  }
});

// GET /api/admin/notifications — Get all notifications
router.get('/notifications', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ notifications: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /api/admin/notifications — Create and send notification
router.post('/notifications', authMiddleware, adminMiddleware, async (req, res) => {
  const { title, body, target, status } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'title and body required' });
  }

  try {
    // Count recipients
    let recipientsCount = 0;
    if (target === 'all' || !target) {
      const { count } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin');
      recipientsCount = count || 0;
    } else if (target === 'pro') {
      const { count } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin').eq('plan', 'pro');
      recipientsCount = count || 0;
    } else if (target === 'free') {
      const { count } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin').eq('plan', 'free');
      recipientsCount = count || 0;
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        title,
        body,
        target: target || 'all',
        status: status || 'sent',
        sent_by: req.user.id,
        sent_at: status === 'draft' ? null : new Date().toISOString(),
        recipients_count: recipientsCount,
      })
      .select()
      .single();

    if (error) throw error;

    // Send web push broadcast (non-blocking)
    if (status !== 'draft') {
      sendWebPushBroadcast(title, body, target || 'all').catch(() => {});

      // Also send Expo push to users who have mobile tokens
      const planFilter = target === 'pro' ? { plan: 'pro' } : target === 'free' ? { plan: 'free' } : {};
      let profileQuery = supabaseAdmin.from('profiles').select('id, push_token').not('push_token', 'is', null);
      if (planFilter.plan) profileQuery = profileQuery.eq('plan', planFilter.plan);
      const { data: profiles } = await profileQuery;
      (profiles || []).forEach((p) => {
        if (p.push_token) sendPushNotification(p.id, title, body).catch(() => {});
      });
    }

    res.json({ success: true, notification: data });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// PUT /api/admin/notifications/:id — Update notification
router.put('/notifications/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { title, body, target, status } = req.body;

  try {
    const updates = {};
    if (title) updates.title = title;
    if (body) updates.body = body;
    if (target) updates.target = target;
    if (status) {
      updates.status = status;
      if (status === 'sent') updates.sent_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, notification: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// DELETE /api/admin/notifications/:id
router.delete('/notifications/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// GET /api/admin/dashboard — Dashboard stats
router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [users, websites, payments, subscriptions] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
      supabaseAdmin.from('websites').select('*', { count: 'exact', head: true }).eq('status', 'live'),
      supabaseAdmin.from('payments').select('amount').eq('status', 'completed'),
      supabaseAdmin.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    const totalRevenue = (payments.data || []).reduce((sum, p) => sum + (p.amount || 0), 0);

    res.json({
      totalUsers: users.count || 0,
      activeSites: websites.count || 0,
      totalRevenue,
      pendingPayments: subscriptions.count || 0,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/admin/activity — Recent activity
router.get('/activity', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [recentUsers, recentPayments, recentSites] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, name, phone, created_at').order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('payments').select('*, profiles(name)').order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('websites').select('business_name, deployed_url, created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    res.json({
      recentUsers: recentUsers.data || [],
      recentPayments: recentPayments.data || [],
      recentSites: recentSites.data || [],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// ============================================
// OFFERS CRUD (admin-managed packages/deals)
// ============================================

// GET /api/admin/offers — All offers (admin)
router.get('/offers', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('offers')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json({ offers: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// POST /api/admin/offers — Create offer
router.post('/offers', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, description, plan_type, price, original_price, trial_days, features, is_active, sort_order } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('offers')
      .insert({
        name,
        description: description || '',
        plan_type: plan_type || 'pro',
        price: price || 0,
        original_price: original_price || 0,
        trial_days: trial_days || 0,
        features: features || [],
        is_active: is_active !== undefined ? is_active : true,
        sort_order: sort_order || 0,
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-generate Razorpay payment link for paid plans
    let paymentLinkUrl = null;
    if ((plan_type || 'pro') === 'pro' && (price || 0) > 0) {
      paymentLinkUrl = await createRazorpayLink({ ...data, price: price || 0 });
      if (paymentLinkUrl) {
        await supabaseAdmin.from('offers').update({ razorpay_payment_link_url: paymentLinkUrl }).eq('id', data.id);
        data.razorpay_payment_link_url = paymentLinkUrl;
      }
    }

    res.json({ success: true, offer: data });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

// PUT /api/admin/offers/:id — Update offer
router.put('/offers/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, description, plan_type, price, original_price, trial_days, features, is_active, sort_order } = req.body;

  try {
    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (plan_type !== undefined) updates.plan_type = plan_type;
    if (price !== undefined) updates.price = price;
    if (original_price !== undefined) updates.original_price = original_price;
    if (trial_days !== undefined) updates.trial_days = trial_days;
    if (features !== undefined) updates.features = features;
    if (is_active !== undefined) updates.is_active = is_active;
    if (sort_order !== undefined) updates.sort_order = sort_order;

    // Regenerate Razorpay payment link if price changed and it's a paid plan
    if (price !== undefined && (plan_type || 'pro') !== 'trial' && price > 0) {
      const { data: existing } = await supabaseAdmin.from('offers').select('name, plan_type').eq('id', req.params.id).single();
      const offerName = name || existing?.name || 'Scalify Pro';
      const offerPlanType = plan_type || existing?.plan_type || 'pro';
      if (offerPlanType !== 'trial') {
        const newLink = await createRazorpayLink({ name: offerName, price, id: req.params.id, plan_type: offerPlanType });
        if (newLink) updates.razorpay_payment_link_url = newLink;
      }
    }

    const { data, error } = await supabaseAdmin
      .from('offers')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, offer: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

// DELETE /api/admin/offers/:id — Delete offer
router.delete('/offers/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('offers')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete offer' });
  }
});

// ============================================
// USER OFFERS — custom per-user offers
// ============================================

// GET /api/admin/user-offers/:userId — list all custom offers for a user
router.get('/user-offers/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_offers')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ offers: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user offers' });
  }
});

// POST /api/admin/user-offers — create custom offer for a user
router.post('/user-offers', authMiddleware, adminMiddleware, async (req, res) => {
  const { user_id, name, description, plan_type, price, original_price, trial_days, features, expires_at } = req.body;
  if (!user_id || !name) return res.status(400).json({ error: 'user_id and name are required' });
  try {
    const { data, error } = await supabaseAdmin
      .from('user_offers')
      .insert({
        user_id,
        created_by: req.user.id,
        name,
        description: description || '',
        plan_type: plan_type || 'pro',
        price: price || 0,
        original_price: original_price || 0,
        trial_days: trial_days || 0,
        features: features || [],
        is_active: true,
        expires_at: expires_at || null,
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, offer: data });
  } catch (error) {
    console.error('Create user offer error:', error);
    res.status(500).json({ error: 'Failed to create user offer' });
  }
});

// PUT /api/admin/user-offers/:id — update (e.g. deactivate)
router.put('/user-offers/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const allowed = ['name', 'description', 'plan_type', 'price', 'original_price', 'trial_days', 'features', 'is_active', 'expires_at'];
  const updates = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  try {
    const { data, error } = await supabaseAdmin.from('user_offers').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, offer: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user offer' });
  }
});

// DELETE /api/admin/user-offers/:id — delete custom offer
router.delete('/user-offers/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('user_offers').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user offer' });
  }
});

module.exports = router;
