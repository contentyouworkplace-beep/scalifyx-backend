const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');
const { authMiddleware } = require('../middleware/auth');

// POST /api/notifications/subscribe-web
// Save a browser push subscription for the current user
router.post('/subscribe-web', authMiddleware, async (req, res) => {
  const { subscription } = req.body;
  const userId = req.user.id;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  try {
    // Upsert — one subscription per endpoint per user
    await supabaseAdmin
      .from('web_push_subscriptions')
      .upsert(
        { user_id: userId, subscription, endpoint: subscription.endpoint },
        { onConflict: 'endpoint' }
      );

    res.json({ success: true });
  } catch (err) {
    console.error('Subscribe web push error:', err);
    res.status(500).json({ error: 'Failed to save subscription' });
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

module.exports = router;
