const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /api/user/:userId — Get user profile
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.params.userId)
      .maybeSingle();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(404).json({ error: 'User not found' });
  }
});

// PUT /api/user/:userId — Update user profile
router.put('/:userId', authMiddleware, async (req, res) => {
  const { name, email, businessName, business_type } = req.body;

  // Users can only update their own profile
  if (req.user.id !== req.params.userId && req.profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  try {
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (businessName !== undefined) updates.business_name = businessName;
    if (business_type !== undefined) updates.business_type = business_type;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.params.userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    res.json({ success: true, user: data });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/user/:userId/analytics — Get website analytics
router.get('/:userId/analytics', authMiddleware, async (req, res) => {
  try {
    // Get user's website
    const { data: website } = await supabaseAdmin
      .from('websites')
      .select('id')
      .eq('user_id', req.params.userId)
      .eq('status', 'live')
      .limit(1)
      .maybeSingle();

    if (!website) {
      return res.json({ visitors: 0, pageViews: 0, leads: 0, uptime: 99.9, topPages: [] });
    }

    // Count analytics
    const { count: visitors } = await supabaseAdmin
      .from('analytics')
      .select('*', { count: 'exact', head: true })
      .eq('website_id', website.id);

    // Get top pages
    const { data: pageData } = await supabaseAdmin
      .from('analytics')
      .select('page')
      .eq('website_id', website.id);

    const pageCounts = {};
    (pageData || []).forEach((row) => {
      pageCounts[row.page] = (pageCounts[row.page] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    res.json({
      visitors: visitors || 0,
      pageViews: visitors || 0,
      leads: website.leads || 0,
      uptime: 99.9,
      topPages,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// POST /api/user/referral/apply — Apply referral code
router.post('/referral/apply', authMiddleware, async (req, res) => {
  const { referralCode } = req.body;

  if (!referralCode) {
    return res.status(400).json({ error: 'Referral code required' });
  }

  try {
    // Find referrer by code
    const { data: referrer, error: findErr } = await supabaseAdmin
      .from('profiles')
      .select('id, credits')
      .eq('referral_code', referralCode.toUpperCase())
      .maybeSingle();

    if (findErr || !referrer) {
      return res.status(400).json({ error: 'Invalid referral code' });
    }

    if (referrer.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot use your own referral code' });
    }

    // Check if already referred
    const { data: existing } = await supabaseAdmin
      .from('referral_ledger')
      .select('id')
      .eq('referred_id', req.user.id)
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Referral already applied' });
    }

    // Credit both users
    await supabaseAdmin.from('referral_ledger').insert({
      referrer_id: referrer.id,
      referred_id: req.user.id,
      credits_earned: 50,
    });

    // Update referrer credits
    await supabaseAdmin
      .from('profiles')
      .update({
        credits: (referrer.credits || 0) + 50,
        referral_count: supabaseAdmin.rpc ? undefined : (referrer.referral_count || 0) + 1,
      })
      .eq('id', referrer.id);

    // Update referred user
    await supabaseAdmin
      .from('profiles')
      .update({ referred_by: referrer.id, credits: (req.profile?.credits || 0) + 50 })
      .eq('id', req.user.id);

    res.json({ success: true, creditsApplied: 50 });
  } catch (error) {
    console.error('Referral error:', error);
    res.status(500).json({ error: 'Failed to apply referral' });
  }
});

// === ADMIN ROUTES ===

// GET /api/user/admin/all — Get all users (admin only)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .neq('role', 'admin')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ users: data });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/user/admin/create — Create a new user (admin only)
router.post('/admin/create', authMiddleware, adminMiddleware, async (req, res) => {
  const { email, password, name, phone, plan, business_name, business_type } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // Create auth user via Supabase Admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;

    const userId = authData.user.id;

    // Update profile with additional info
    const profileUpdates = { plan: plan || 'free' };
    if (name) profileUpdates.name = name;
    if (phone) profileUpdates.phone = phone;
    if (email) profileUpdates.email = email;
    if (business_name) profileUpdates.business_name = business_name;
    if (business_type) profileUpdates.business_type = business_type;

    await supabaseAdmin
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId);

    // If plan is trial, create a trial subscription
    if (plan === 'trial') {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      await supabaseAdmin.from('subscriptions').insert({
        user_id: userId,
        plan: 'trial',
        amount: 0,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: false,
      });
    } else if (plan === 'pro') {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      await supabaseAdmin.from('subscriptions').insert({
        user_id: userId,
        plan: 'pro',
        amount: 749,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: true,
      });
    }

    res.json({ success: true, userId });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({ error: error.message || 'Failed to create user' });
  }
});

// PUT /api/user/admin/:userId/update — Update user plan/profile (admin only)
router.put('/admin/:userId/update', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, phone, email, plan, business_name, business_type } = req.body;
  const userId = req.params.userId;

  try {
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (plan !== undefined) updates.plan = plan;
    if (business_name !== undefined) updates.business_name = business_name;
    if (business_type !== undefined) updates.business_type = business_type;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    res.json({ success: true, user: data });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// POST /api/user/admin/:userId/reset-password — Reset user password (admin only)
router.post('/admin/:userId/reset-password', authMiddleware, adminMiddleware, async (req, res) => {
  const { password } = req.body;
  const userId = req.params.userId;

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
    });

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: error.message || 'Failed to reset password' });
  }
});

// DELETE /api/user/admin/:userId — Delete user (admin only)
router.delete('/admin/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  const userId = req.params.userId;

  try {
    // Delete auth user (cascades to profile via FK)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
});

module.exports = router;
