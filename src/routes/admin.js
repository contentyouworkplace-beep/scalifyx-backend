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
  const { data } = await supabaseAdmin.from('app_settings').select('value').eq('key', 'ai_chat_enabled').maybeSingle();
  _aiChatEnabled = data === null ? true : (data?.value === true || data?.value === 'true');
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

// POST /api/admin/ai-settings (alias for PUT)
router.post('/ai-settings', authMiddleware, adminMiddleware, async (req, res) => {
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
      .maybeSingle();

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
      .maybeSingle();

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
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [allUsers, trialSubs, paidSubs, domainUsers, monthlyNewUsers, expiredTrialSubs, monthlySubs, allSubs] = await Promise.all([
      // All non-admin users
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      // Users with active/expired trials
      supabaseAdmin.from('subscriptions').select('user_id', { count: 'exact', head: true }).eq('plan', 'trial'),
      // Users with paid plans (upgraded)
      supabaseAdmin.from('subscriptions').select('user_id', { count: 'exact' }).neq('plan', 'trial').eq('status', 'active'),
      // Users who purchased domain
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('domain_purchased', true),
      // New users this month
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
      // Trial expired but not upgraded (trial ended + no paid subscription)
      supabaseAdmin.from('subscriptions').select('user_id').eq('plan', 'trial').lt('end_date', now.toISOString()),
      // Monthly subscriptions revenue (this month's active subscriptions)
      supabaseAdmin.from('subscriptions').select('amount').neq('plan', 'trial').eq('status', 'active').gte('created_at', monthStart.toISOString()),
      // All active subscriptions revenue (lifetime)
      supabaseAdmin.from('subscriptions').select('amount').neq('plan', 'trial').eq('status', 'active'),
    ]);

    // Calculate unique paid users
    const paidUserIds = new Set((paidSubs.data || []).map(s => s.user_id));
    const uniquePaidUsers = paidUserIds.size;

    // Calculate trial-expired-not-upgraded
    const expiredTrialUserIds = new Set((expiredTrialSubs.data || []).map(s => s.user_id));
    const trialExpiredNotUpgraded = expiredTrialUserIds.size;

    // Calculate monthly revenue (from this month's paid subscriptions)
    const monthlyRevenue = ((monthlySubs.data || [])
      .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0));

    // Calculate total revenue (from all active paid subscriptions)
    const totalRevenue = ((allSubs.data || [])
      .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0));

    res.json({
      metrics: {
        totalFreeTrialUsers: trialSubs.count || 0,
        domainPurchasedUsers: domainUsers.count || 0,
        uniquePaidUsers: uniquePaidUsers,
        trialExpiredNotUpgraded: trialExpiredNotUpgraded,
        monthly: {
          newUsers: monthlyNewUsers.count || 0,
          revenue: Math.round(monthlyRevenue * 100) / 100,
        },
        totalRevenue: Math.round(totalRevenue * 100) / 100,
      },
      totals: {
        totalUsers: allUsers.count || 0,
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/admin/activity — Recent activity
router.get('/activity', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [recentUsers, recentTransactions, recentSites] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, name, email, phone, created_at').order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('transactions').select('id, user_id, type, amount, created_at').order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('websites').select('business_name, deployed_url, created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    res.json({
      recentUsers: recentUsers.data || [],
      recentPayments: recentTransactions.data || [],
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
      .maybeSingle();

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
      const { data: existing } = await supabaseAdmin.from('offers').select('name, plan_type').eq('id', req.params.id).maybeSingle();
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
      .maybeSingle();

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
      .maybeSingle();
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

// GET /api/admin/users — Get all users with onboarding status
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id, name, email, phone, plan,
        business_name, business_category, business_city,
        whatsapp_number, business_address, business_description,
        logo_url, instagram_url, facebook_url, existing_website_url,
        services, gallery_images,
        domain_purchased, domain_name,
        google_maps_link, onboarding_completed,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Batch fetch all subscriptions in one query
    const userIds = (profiles || []).map(u => u.id);
    const { data: allSubs } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, plan, status, end_date, amount')
      .in('user_id', userIds)
      .order('end_date', { ascending: false });

    const subMap = {};
    (allSubs || []).forEach(sub => {
      if (!subMap[sub.user_id]) subMap[sub.user_id] = sub;
    });

    const enrichedUsers = (profiles || []).map(user => {
      const sub = subMap[user.id];
      return {
        ...user,
        subscription: {
          plan: sub?.plan || 'free',
          status: sub?.status || 'inactive',
          end_date: sub?.end_date || null,
          amount: sub?.amount || 0,
        },
      };
    });

    res.json({ success: true, users: enrichedUsers });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/admin/users/:id/toggle-domain — Toggle domain purchased status
router.post('/users/:id/toggle-domain', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Get current status
    const { data: user } = await supabaseAdmin
      .from('profiles')
      .select('domain_purchased')
      .eq('id', id)
      .maybeSingle();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Toggle status
    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update({ domain_purchased: !user.domain_purchased })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;

    // Log transaction if domain was purchased
    if (!user.domain_purchased) {
      await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: id,
          type: 'domain_purchased',
          status: 'completed',
        });
    }

    res.json({ success: true, domain_purchased: updated.domain_purchased });
  } catch (error) {
    console.error('Toggle domain error:', error);
    res.status(500).json({ error: 'Failed to update domain status' });
  }
});

// GET /api/admin/funnel — Conversion funnel metrics
router.get('/funnel', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [totalSignups, activeTrials, paidUsers, domainPurchased] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).neq('role', 'admin'),
      supabaseAdmin.from('subscriptions').select('id', { count: 'exact', head: true }).eq('plan', 'trial'),
      supabaseAdmin.from('subscriptions').select('id', { count: 'exact', head: true }).neq('plan', 'trial').eq('status', 'active'),
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('domain_purchased', true),
    ]);

    const totalCount = totalSignups.count || 1;

    res.json({
      success: true,
      funnel: {
        totalSignups: totalSignups.count || 0,
        signupToTrial: Math.round(((activeTrials.count || 0) / totalCount) * 100),
        trialToUpgrade: Math.round(((paidUsers.count || 0) / totalCount) * 100),
        domainPurchaseRate: Math.round(((domainPurchased.count || 0) / totalCount) * 100),
      },
    });
  } catch (error) {
    console.error('Funnel error:', error);
    res.status(500).json({ error: 'Failed to fetch funnel metrics' });
  }
});

module.exports = router;
