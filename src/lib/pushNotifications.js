const { supabaseAdmin } = require('./supabase');

/**
 * Send Expo push notification to a user
 * Uses Expo's push notification service (no Firebase needed)
 */
async function sendPushNotification(userId, title, body, data = {}) {
  try {
    // Get user's push token
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('push_token')
      .eq('id', userId)
      .single();

    if (!profile?.push_token) {
      return; // No push token registered
    }

    const pushToken = profile.push_token;

    // Validate Expo push token format
    if (!pushToken.startsWith('ExponentPushToken[') && !pushToken.startsWith('ExpoPushToken[')) {
      console.error('Invalid Expo push token:', pushToken);
      return;
    }

    // Send via Expo Push API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify({
        to: pushToken,
        title,
        body: body.length > 200 ? body.slice(0, 200) + '...' : body,
        sound: 'default',
        badge: 1,
        data,
      }),
    });

    const result = await response.json();
    if (result.data?.[0]?.status === 'error') {
      console.error('Push notification error:', result.data[0].message);
    }
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
}

/**
 * Create an in-app notification record and optionally send push
 */
async function createNotification(userId, title, body, type = 'info', sendPush = true) {
  try {
    await supabaseAdmin.from('notifications').insert({
      title,
      body,
      type,
      target: 'specific',
      target_user_ids: [userId],
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    if (sendPush) {
      await sendPushNotification(userId, title, body, { type });
    }
  } catch (error) {
    console.error('Create notification error:', error);
  }
}

module.exports = { sendPushNotification, createNotification };
