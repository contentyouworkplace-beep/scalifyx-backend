const express = require('express');
const router = express.Router();
const { supabaseAdmin: supabase } = require('../lib/supabase');

// POST /api/contact — save contact form submission + notify via WhatsApp
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required' });
  }

  try {
    await supabase.from('contact_submissions').insert({
      name,
      email,
      subject: subject || 'Other',
      message,
      created_at: new Date().toISOString(),
    });

    // Optionally forward to WhatsApp (fire-and-forget)
    const waToken = process.env.WHATSAPP_TOKEN;
    const waPhone = process.env.WHATSAPP_PHONE_ID;
    const adminPhone = process.env.ADMIN_WHATSAPP || '916353583148';

    if (waToken && waPhone) {
      const waMsg = `📩 *New Contact Form Submission*\n\n👤 *Name:* ${name}\n📧 *Email:* ${email}\n📌 *Subject:* ${subject || 'Other'}\n\n💬 *Message:*\n${message}`;
      fetch(`https://graph.facebook.com/v19.0/${waPhone}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${waToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: adminPhone,
          type: 'text',
          text: { body: waMsg },
        }),
      }).catch(() => {});
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ error: 'Failed to submit. Please email us directly.' });
  }
});

module.exports = router;
