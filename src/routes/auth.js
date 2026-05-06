const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');
const { sendWebPushToUser } = require('../lib/webPush');

async function sendNewSignupNotifications(name, email, phone) {
  try {
    console.log('📢 New signup detected:', { name, email, phone: phone ? '***' : 'N/A' });
    const { data: admins } = await supabaseAdmin
      .from('profiles')
      .select('id, email, name')
      .eq('role', 'admin');

    if (!admins || admins.length === 0) {
      console.warn('⚠️  No admin users found to notify');
      return;
    }

    console.log(`👨‍💼 Found ${admins.length} admin(s) to notify`);
    const title = '🔔 New Lead';
    const body = `${name} (${email}) just signed up`;
    const data = { link: '/admin' };

    const results = await Promise.allSettled(
      admins.map((admin) => {
        console.log(`  ↳ Notifying: ${admin.name || admin.email}`);
        return sendWebPushToUser(admin.id, title, body, data);
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    console.log(`✅ Notified ${successful}/${results.length} admin(s)`);
  } catch (error) {
    console.error('❌ Failed to send signup notifications to admins:', error);
  }
}

// POST /api/auth/signup — Create user account
router.post('/signup', async (req, res) => {
  const { email, password, name, phone } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || '' },
    });

    if (error) throw error;

    // Update profile with name and phone
    const updates = { email };
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (name || phone) {
      await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', data.user.id);
    }

    // Send notifications to admins about new signup (non-blocking)
    sendNewSignupNotifications(name || 'New User', email, phone).catch(() => {});

    res.json({ success: true, userId: data.user.id });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message || 'Signup failed' });
  }
});

// POST /api/auth/login — Sign in and return profile
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // Verify credentials via Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    res.json({
      success: true,
      token: data.session.access_token,
      user: profile,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Invalid email or password' });
  }
});

// GET /api/auth/me — Get current user profile
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) throw new Error('Invalid token');

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    res.json({ success: true, user: profile });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
