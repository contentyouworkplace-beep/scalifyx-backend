const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

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

module.exports = router;
