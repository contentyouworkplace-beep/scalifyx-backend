let webpush;
try { webpush = require('web-push'); } catch { webpush = null; }

const { supabaseAdmin } = require('./supabase');

let _vapidConfigured = false;
function ensureVapid() {
  if (_vapidConfigured || !webpush) return;
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    try {
      webpush.setVapidDetails(
        `mailto:${process.env.VAPID_EMAIL || 'support@scalifyapp.com'}`,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
      _vapidConfigured = true;
    } catch (e) {
      console.error('VAPID setup error:', e.message);
    }
  }
}

async function sendWebPushToUser(userId, title, body, data = {}) {
  if (!webpush) {
    console.warn('⚠️  web-push module not available');
    return;
  }
  ensureVapid();
  try {
    console.log('🔔 Sending push notification to user:', userId.slice(0, 8) + '...');
    const { data: subs } = await supabaseAdmin
      .from('web_push_subscriptions')
      .select('subscription')
      .eq('user_id', userId);

    if (!subs || subs.length === 0) {
      console.warn('⚠️  No subscriptions found for user:', userId.slice(0, 8) + '...');
      return;
    }

    console.log(`📤 Found ${subs.length} subscription(s), sending notifications...`);
    const payload = JSON.stringify({ title, body, data });
    const results = await Promise.allSettled(
      subs.map((s, i) => {
        console.log(`  ↳ Sending to subscription ${i + 1}/${subs.length}...`);
        return webpush.sendNotification(s.subscription, payload);
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    console.log(`✅ ${successful}/${results.length} notifications sent successfully`);
  } catch (err) {
    console.error('❌ Web push error:', err);
  }
}

async function sendWebPushBroadcast(title, body, target = 'all', data = {}) {
  if (!webpush) return 0;
  ensureVapid();
  try {
    let query = supabaseAdmin.from('web_push_subscriptions').select('subscription, user_id');

    if (target === 'pro' || target === 'free') {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('plan', target === 'pro' ? 'pro' : 'free');
      const ids = (profiles || []).map((p) => p.id);
      if (ids.length === 0) return 0;
      query = query.in('user_id', ids);
    }

    const { data: subs } = await query;
    if (!subs || subs.length === 0) return 0;

    const payload = JSON.stringify({ title, body, data });
    const results = await Promise.allSettled(
      subs.map((s) => webpush.sendNotification(s.subscription, payload).catch(() => {}))
    );
    return results.filter((r) => r.status === 'fulfilled').length;
  } catch (err) {
    console.error('Web push broadcast error:', err);
    return 0;
  }
}

module.exports = { sendWebPushToUser, sendWebPushBroadcast };
