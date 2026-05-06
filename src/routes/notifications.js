const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');
const { authMiddleware } = require('../middleware/auth');

// POST /api/notifications/subscribe-web
// Save a browser push subscription for the current user
router.post('/subscribe-web', authMiddleware, async (req, res) => {
  const { subscription } = req.body;
  const userId = req.user.id;

  console.log('📥 Subscribe-web request:', {
    userId: userId.slice(0, 8) + '...',
    hasSubscription: !!subscription,
    hasEndpoint: !!subscription?.endpoint,
    endpointLength: subscription?.endpoint?.length || 0,
  });

  if (!subscription || !subscription.endpoint) {
    console.warn('⚠️  Invalid subscription received');
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  try {
    // Upsert — one subscription per endpoint per user
    const { error, data } = await supabaseAdmin
      .from('web_push_subscriptions')
      .upsert(
        { user_id: userId, subscription, endpoint: subscription.endpoint },
        { onConflict: 'endpoint' }
      );

    if (error) {
      console.error('❌ Supabase upsert error:', error);
      return res.status(500).json({ error: 'Failed to save subscription: ' + error.message });
    }

    console.log('✅ Subscription saved successfully for user:', userId.slice(0, 8) + '...');
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Subscribe web push error:', err);
    res.status(500).json({ error: 'Failed to save subscription: ' + err.message });
  }
});

// DELETE /api/notifications/unsubscribe-web
router.delete('/unsubscribe-web', authMiddleware, async (req, res) => {
  const { endpoint } = req.body;
  const userId = req.user.id;
  try {
    await supabaseAdmin
      .from('web_push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', endpoint);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// GET /api/notifications/vapid-public-key
router.get('/vapid-public-key', (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY || '';
  res.json({ key });
});

// POST /api/notifications/test-send (admin only)
// Test endpoint to send a test notification to the current admin user
router.post('/test-send', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { sendWebPushToUser } = require('../lib/webPush');

  console.log('🧪 Test notification requested by:', userId.slice(0, 8) + '...');

  try {
    const title = '🧪 Test Notification';
    const body = 'Your notification system is working!';
    const data = { link: '/admin', test: true };

    await sendWebPushToUser(userId, title, body, data);

    res.json({
      success: true,
      message: 'Test notification sent! Check your browser for the notification.',
    });
  } catch (err) {
    console.error('❌ Test notification error:', err);
    res.status(500).json({ error: 'Failed to send test notification: ' + err.message });
  }
});

module.exports = router;
