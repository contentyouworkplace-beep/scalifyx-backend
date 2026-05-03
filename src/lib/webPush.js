let webpush;
try { webpush = require('web-push'); } catch { webpush = null; }

const { supabaseAdmin } = require('./supabase');

if (webpush && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || 'support@scalifyapp.com'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

async function sendWebPushToUser(userId, title, body, data = {}) {
  if (!webpush) return;
  try {
    const { data: subs } = await supabaseAdmin
      .from('web_push_subscriptions')
      .select('subscription')
      .eq('user_id', userId);

    if (!subs || subs.length === 0) return;

    const payload = JSON.stringify({ title, body, data });
    await Promise.allSettled(
      subs.map((s) => webpush.sendNotification(s.subscription, payload).catch(() => {}))
    );
  } catch (err) {
    console.error('Web push error:', err);
  }
}

async function sendWebPushBroadcast(title, body, target = 'all', data = {}) {
  if (!webpush) return 0;
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
