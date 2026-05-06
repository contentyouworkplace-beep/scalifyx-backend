/**
 * Aisensy WhatsApp Integration
 * Sends WhatsApp messages via Aisensy API for user notifications
 */

const axios = require('axios');

const AISENSY_API_KEY = process.env.AISENSY_API_KEY;
const AISENSY_PHONE_NUMBER_ID = process.env.AISENSY_PHONE_NUMBER_ID;
const AISENSY_API_URL = 'https://app.aisensy.com/api/campaigns/whatsapp';

/**
 * Send WhatsApp message via Aisensy
 * @param {string} phoneNumber - Recipient phone number (with country code, e.g., +91XXXXXXXXXX)
 * @param {string} message - Message text
 * @param {object} variables - Template variables like {name, email, etc}
 */
async function sendWhatsAppMessage(phoneNumber, message, variables = {}) {
  if (!AISENSY_API_KEY || !AISENSY_PHONE_NUMBER_ID) {
    console.warn('⚠️  Aisensy credentials not configured. Skipping WhatsApp message.');
    return false;
  }

  try {
    // Replace variables in message
    let personalizedMessage = message;
    Object.entries(variables).forEach(([key, value]) => {
      personalizedMessage = personalizedMessage.replace(
        new RegExp(`{{${key}}}`, 'g'),
        value || ''
      );
    });

    console.log('📤 Sending WhatsApp via Aisensy:', {
      phoneNumber: phoneNumber.replace(/(?<=\d{2})\d(?=\d{4})/g, '*'), // Mask middle digits
      messageLength: personalizedMessage.length,
    });

    // Aisensy API expects phone without + sign
    const formattedPhone = phoneNumber.replace(/\D/g, '');

    const response = await axios.post(
      AISENSY_API_URL,
      {
        campaignName: 'Scalify_Welcome',
        destination: formattedPhone,
        userName: variables.name || 'User',
        templateParams: [
          variables.name || 'User',
          variables.email || '',
        ],
        message: personalizedMessage,
      },
      {
        headers: {
          Authorization: `Bearer ${AISENSY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data?.success || response.status === 200) {
      console.log('✅ WhatsApp message sent successfully:', response.data?.messageId || 'confirmed');
      return true;
    } else {
      console.warn('⚠️  WhatsApp send returned non-success:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    return false;
  }
}

/**
 * Send welcome message to newly signed up user
 * @param {object} user - User object with name, email, phone
 */
async function sendWelcomeMessage(user) {
  if (!user.phone) {
    console.log('ℹ️  User has no phone number, skipping WhatsApp welcome');
    return false;
  }

  const welcomeMessage = `🎉 Welcome to Scalify, ${user.name || 'there'}!

Your professional website is ready to build in just 60 seconds.

✨ *What You Get:*
✅ Professional AI-powered website builder
✅ SEO optimization & Google Search Console setup
✅ Mobile responsive design
✅ Free hosting & SSL certificate
✅ Unlimited pages
✅ WhatsApp chat button & contact forms
✅ Social media integration
✅ Monthly analytics & SEO reports
✅ Priority chat support

🚀 *Launch Your Website Today*
→ Try 7 days FREE (no card required)
→ Then just ₹1,499/month (was ₹2,499 - save 40%)
→ Pay monthly, cancel anytime

Get started now:
https://scalifyapp.com/dashboard/plans

Questions? Reply to this chat! 💬`;

  return sendWhatsAppMessage(user.phone, welcomeMessage, {
    name: user.name || 'there',
    email: user.email,
  });
}

module.exports = { sendWhatsAppMessage, sendWelcomeMessage };
