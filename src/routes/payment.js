const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  try {
    const Razorpay = require('razorpay');
    return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  } catch (e) { return null; }
}

const PLAN_PRICE = 1499; // ₹1,499/month
const PLAN_PRICE_PAISE = PLAN_PRICE * 100;

// ─────────────────────────────────────────────
// POST /api/payment/create-payment-link
// Creates a Razorpay Payment Link (no auto-debit)
// ─────────────────────────────────────────────
router.post('/create-payment-link', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(500).json({ error: 'Payment service not configured. Contact support.' });
    }

    // Get active offer price
    let amount = PLAN_PRICE_PAISE;
    const { data: offer } = await supabaseAdmin
      .from('offers')
      .select('price')
      .eq('plan_type', 'pro')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (offer?.price) amount = offer.price * 100;

    const frontendUrl = (process.env.FRONTEND_URL || 'https://scalifyapp.com').replace(/\/$/, '');

    const paymentLink = await razorpay.paymentLink.create({
      amount,
      currency: 'INR',
      description: 'Scalify Pro - Monthly',
      notes: { userId, plan: 'pro' },
      callback_url: `${frontendUrl}/dashboard/plans?payment=success`,
      callback_method: 'get',
    });

    await supabaseAdmin.from('payments').insert({
      user_id: userId,
      amount: amount / 100,
      status: 'pending',
      plan: 'pro',
      transaction_id: paymentLink.id,
    });

    res.json({ success: true, paymentLink: paymentLink.short_url, paymentLinkId: paymentLink.id });
  } catch (error) {
    const detail = error?.error?.description || error?.message || String(error);
    console.error('Create payment link error:', detail, error);
    res.status(500).json({ error: detail });
  }
});

// ─────────────────────────────────────────────
// GET /api/payment/status — User's subscription status
// Returns active/expired, expiry date, payment history
// ─────────────────────────────────────────────
router.get('/status', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    // Get the latest active subscription
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('end_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    const now = new Date();
    let status = 'free'; // free | active | expired | trial
    let expiryDate = null;
    let daysLeft = 0;

    if (sub) {
      const endDate = new Date(sub.end_date);
      expiryDate = sub.end_date;
      daysLeft = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));

      if (sub.plan === 'trial') {
        status = endDate > now ? 'trial' : 'expired';
      } else {
        status = endDate > now ? 'active' : 'expired';
      }
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan, phone, name, email')
      .eq('id', userId)
      .maybeSingle();

    // Get recent payments
    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select('id, amount, status, plan, created_at, razorpay_payment_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      success: true,
      subscription: {
        status,
        plan: sub?.plan || 'free',
        expiryDate,
        daysLeft,
        startDate: sub?.start_date || null,
      },
      profile: {
        phone: profile?.phone || '',
        name: profile?.name || '',
        email: profile?.email || '',
        plan: profile?.plan || 'free',
      },
      payments: payments || [],
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

// ─────────────────────────────────────────────
// POST /api/payment/webhook — Razorpay webhook
// Handles payment.captured → activate 30 days
// ─────────────────────────────────────────────
router.post('/webhook', async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // Verify signature if secret is configured
  if (webhookSecret) {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    const rawBody = req.rawBody || JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature.length !== expectedSignature.length ||
        !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.error('Webhook signature verification failed');
      return res.status(400).json({ error: 'Invalid signature' });
    }
  }

  const event = req.body;
  console.log('📩 Razorpay webhook:', event?.event);

  try {
    switch (event?.event) {
      case 'payment.captured': {
        const paymentData = event.payload?.payment?.entity;
        if (!paymentData) break;

        const razorpayPaymentId = paymentData.id;
        const userId = paymentData.notes?.userId;
        const amountPaise = paymentData.amount;

        console.log(`✅ Payment captured: ${razorpayPaymentId}, user: ${userId}, amount: ₹${amountPaise / 100}`);

        if (!userId) {
          console.error('No userId in payment notes');
          break;
        }

        // 1. Update payment record to completed
        await supabaseAdmin
          .from('payments')
          .update({
            status: 'completed',
            razorpay_payment_id: razorpayPaymentId,
          })
          .eq('user_id', userId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1);

        // 2. Create/extend subscription for 30 days
        const now = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        // Check if user has an active subscription to extend
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .gt('end_date', now.toISOString())
          .order('end_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingSub) {
          // Extend existing subscription by 30 days from current end date
          const currentEnd = new Date(existingSub.end_date);
          currentEnd.setDate(currentEnd.getDate() + 30);

          await supabaseAdmin
            .from('subscriptions')
            .update({
              end_date: currentEnd.toISOString(),
              amount: amountPaise / 100,
              updated_at: now.toISOString(),
            })
            .eq('id', existingSub.id);

          console.log(`📅 Extended subscription to ${currentEnd.toISOString()}`);
        } else {
          // Create new 30-day subscription
          await supabaseAdmin
            .from('subscriptions')
            .insert({
              user_id: userId,
              plan: 'pro',
              amount: amountPaise / 100,
              status: 'active',
              start_date: now.toISOString(),
              end_date: endDate.toISOString(),
              auto_renew: false,
            });

          console.log(`🆕 Created subscription until ${endDate.toISOString()}`);
        }

        // 3. Update profile plan to pro
        await supabaseAdmin
          .from('profiles')
          .update({ plan: 'pro' })
          .eq('id', userId);

        console.log(`👤 User ${userId} activated as Pro`);
        break;
      }

      case 'payment.failed': {
        const paymentData = event.payload?.payment?.entity;
        const userId = paymentData?.notes?.userId;
        if (paymentData?.id) {
          await supabaseAdmin
            .from('payments')
            .update({ status: 'failed', razorpay_payment_id: paymentData.id })
            .eq('user_id', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1);
        }
        console.log(`❌ Payment failed for user: ${userId}`);
        break;
      }

      case 'payment_link.paid': {
        // Payment link specific event — same logic as payment.captured
        const paymentLinkData = event.payload?.payment_link?.entity;
        const paymentData = event.payload?.payment?.entity;
        const userId = paymentLinkData?.notes?.userId || paymentData?.notes?.userId;
        const razorpayPaymentId = paymentData?.id;

        if (!userId) {
          console.error('No userId in payment_link.paid notes');
          break;
        }

        console.log(`🔗 Payment Link paid: user ${userId}`);

        // Update payment
        await supabaseAdmin
          .from('payments')
          .update({
            status: 'completed',
            razorpay_payment_id: razorpayPaymentId,
          })
          .eq('user_id', userId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1);

        // Create 30-day subscription
        const now = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .gt('end_date', now.toISOString())
          .limit(1)
          .maybeSingle();

        if (existingSub) {
          const currentEnd = new Date(existingSub.end_date);
          currentEnd.setDate(currentEnd.getDate() + 30);
          await supabaseAdmin
            .from('subscriptions')
            .update({ end_date: currentEnd.toISOString(), amount: (paymentData?.amount || 149900) / 100, updated_at: now.toISOString() })
            .eq('id', existingSub.id);
        } else {
          await supabaseAdmin
            .from('subscriptions')
            .insert({
              user_id: userId,
              plan: 'pro',
              amount: (paymentData?.amount || 149900) / 100,
              status: 'active',
              start_date: now.toISOString(),
              end_date: endDate.toISOString(),
              auto_renew: false,
            });
        }

        await supabaseAdmin
          .from('profiles')
          .update({ plan: 'pro' })
          .eq('id', userId);

        break;
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
  }

  res.json({ status: 'ok' });
});

// GET /api/payment/invoices/:userId — Get user's invoices
router.get('/invoices/:userId', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ invoices: data || [] });
  } catch (error) {
    console.error('Invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// === ADMIN ROUTES ===

// GET /api/payment/admin/all — All payments (admin)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*, profiles(name, phone)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ payments: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// GET /api/payment/admin/subscriptions — All subscriptions (admin)
router.get('/admin/subscriptions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*, profiles(name, phone)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ subscriptions: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// === PUBLIC ROUTES ===

// GET /api/payment/offers — Get active offers + user-specific offers
router.get('/offers', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    let { data, error } = await supabaseAdmin
      .from('offers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // Auto-seed default offer if none exist
    if (!data || data.length === 0) {
      const defaultOffer = {
        name: 'Scalify Pro',
        description: 'Everything you need to grow your business online',
        plan_type: 'pro',
        price: 1499,
        original_price: 2499,
        trial_days: 0,
        features: [
          'Website + Search Engine Optimization',
          'Unlimited Pages Professional Website',
          'Add Your Custom Domain',
          'Free Hosting',
          'Website Maintenance',
          'On-Page & Technical SEO',
          'Google Search Console Setup',
          'Mobile Responsive Design',
          'SSL Certificate',
          'Priority Chat Support',
          'WhatsApp Chat Button',
          'Contact Form',
          'Social Media Integration',
          'Monthly Analytics & SEO Report',
        ],
        is_active: true,
        sort_order: 0,
      };

      const { data: seeded, error: seedErr } = await supabaseAdmin
        .from('offers')
        .insert(defaultOffer)
        .select();

      if (!seedErr && seeded) {
        data = seeded;
      }
    }

    // Fetch user-specific custom offers (not expired)
    const now = new Date().toISOString();
    const { data: userOffers } = await supabaseAdmin
      .from('user_offers')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false });

    // Merge: user offers shown first with a flag
    const merged = [
      ...(userOffers || []).map((o) => ({ ...o, is_user_offer: true })),
      ...(data || []),
    ];

    res.json({ offers: merged });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// POST /api/payment/start-trial — Start a free trial
router.post('/start-trial', authMiddleware, async (req, res) => {
  const { offerId } = req.body;
  const userId = req.user.id;

  try {
    // Check if user already had a trial
    const { data: existing } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('plan', 'trial')
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'You have already used your free trial' });
    }

    // Get offer details
    let trialDays = 7;
    if (offerId) {
      const { data: offer } = await supabaseAdmin
        .from('offers')
        .select('trial_days')
        .eq('id', offerId)
        .maybeSingle();
      if (offer?.trial_days) trialDays = offer.trial_days;
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + trialDays);

    // Create trial subscription
    const { data: subscription, error: subErr } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan: 'trial',
        amount: 0,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: false,
      })
      .select()
      .maybeSingle();

    if (subErr) throw subErr;

    // Update user plan to trial
    await supabaseAdmin
      .from('profiles')
      .update({ plan: 'trial' })
      .eq('id', userId);

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan: 'trial',
        trialDays,
        endDate: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error('Start trial error:', error);
    res.status(500).json({ error: 'Failed to start trial' });
  }
});

// POST /api/payment/cancel — Cancel subscription
router.post('/cancel', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    // Find active subscription
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('end_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Mark subscription as cancelled (keeps access until end_date)
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', sub.id);

    // Update profile plan to free
    await supabaseAdmin
      .from('profiles')
      .update({ plan: 'free' })
      .eq('id', userId);

    res.json({
      success: true,
      message: 'Subscription cancelled. You can still access Pro features until ' + new Date(sub.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

module.exports = router;
