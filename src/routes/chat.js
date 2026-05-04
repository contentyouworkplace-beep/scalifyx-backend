const express = require('express');
const router = express.Router();
const { processChat, processSalesChat } = require('../services/aiAgent');
const { generateWebsite } = require('../services/websiteGenerator');
const { deploySite } = require('../services/siteDeployer');
const { supabaseAdmin } = require('../lib/supabase');
const { authMiddleware } = require('../middleware/auth');
const { sendPushNotification } = require('../lib/pushNotifications');
const { searchKnowledgeBase, getStarterFAQs } = require('../data/knowledgeBase');
const adminRoutes = require('./admin');

async function isAiEnabled() {
  try { return await adminRoutes.getAiChatEnabled(); } catch { return true; }
}

// ─── Local FAQ chatbot for free users (NO Claude API) ───

function buildLocalReply(userMessage) {
  const msg = userMessage.toLowerCase().trim();

  // Greeting patterns
  if (/^(hi|hello|hey|hii+|namaste|hola|good\s*(morning|evening|afternoon)|what'?s?\s*up)/i.test(msg)) {
    return {
      reply: "Hey there! 👋 Welcome to Scalify!\n\nI'm here to help you get a **professional website + SEO** for your business — starting at just **₹1,499/month**.\n\nHere are some things you can ask me:",
      showCTA: false,
      suggestions: ['How much does it cost?', 'What do I get in the plan?', 'How does it work?', 'Will my website rank on Google?'],
    };
  }

  // Pricing intent
  if (/price|cost|kitna|charge|rate|plan|afford|budget|pay|rupee|₹|money|expensive|cheap/i.test(msg)) {
    const results = searchKnowledgeBase(userMessage, 3);
    const answer = results.length > 0
      ? results[0].a
      : "Scalify Pro is just **₹1,499/month** (63% OFF from ₹2,499). You get a professional website + full SEO — that's less than ₹25/day!";
    return {
      reply: answer,
      showCTA: true,
      suggestions: ['What\'s included in ₹1,499?', 'Is there a free trial?', 'Can I cancel anytime?', 'How does billing work?'],
    };
  }

  // How it works
  if (/how\s*(does|do)\s*it\s*work|how\s*to\s*(start|begin|use)|process|step/i.test(msg)) {
    return {
      reply: "It's super simple! 🚀\n\n1️⃣ **Subscribe** to Scalify Pro (₹1,499/month)\n2️⃣ **Chat with our AI** — answer a few questions about your business\n3️⃣ **Get your website** live in minutes!\n4️⃣ We handle **SEO, hosting, SSL** — everything!\n\nYou can update your website anytime just by chatting. No coding needed!",
      showCTA: true,
      suggestions: ['How much does it cost?', 'What kind of website will I get?', 'Can I see an example?', 'How long does it take?'],
    };
  }

  // Feature / what do I get
  if (/feature|what\s*(do\s*i|will\s*i|can\s*i)\s*get|include|website\s*have|what'?s?\s*included/i.test(msg)) {
    return {
      reply: "Here's everything you get with Scalify Pro (**₹1,499/month**):\n\n✅ Professional multi-page website\n✅ Mobile responsive design\n✅ Free hosting + SSL certificate\n✅ On-page & technical SEO\n✅ Google Search Console setup\n✅ WhatsApp chat button\n✅ Contact forms\n✅ Social media integration\n✅ Unlimited website updates\n✅ Priority support\n\nAll included — no hidden charges!",
      showCTA: true,
      suggestions: ['Will my website work on mobile?', 'Can I add photos?', 'Can I use my own domain?', 'How do I update my website?'],
    };
  }

  // SEO related
  if (/seo|google|rank|search\s*engine|organic|traffic|keyword|search\s*console/i.test(msg)) {
    const results = searchKnowledgeBase(userMessage, 3);
    const answer = results.length > 0
      ? results[0].a
      : "SEO (Search Engine Optimization) helps your website appear on Google when customers search for your business. We handle on-page SEO, technical SEO, Google Search Console setup, and keyword optimization — all included in your plan!";
    return {
      reply: answer,
      showCTA: true,
      suggestions: ['How long does SEO take?', 'Will I rank #1 on Google?', 'What is on-page SEO?', 'Do you submit to Google?'],
    };
  }

  // Domain related
  if (/domain|url|link|address|\.com|\.in|subdomain/i.test(msg)) {
    const results = searchKnowledgeBase(userMessage, 2);
    return {
      reply: results.length > 0 ? results[0].a : "You get a free subdomain (yourbusiness.scalifyapp.com). Want your own domain like yourbusiness.com? You can connect it — domain registration is separate (₹500-800/year from any registrar).",
      showCTA: false,
      suggestions: ['Is hosting included?', 'Is SSL included?', 'How do I connect my domain?', 'What\'s included in the plan?'],
    };
  }

  // Trust / scam / legit
  if (/scam|fake|legit|trust|real|safe|fraud|secure/i.test(msg)) {
    return {
      reply: "Great question! Scalify is 100% legitimate 🛡️\n\n• We use **Razorpay** (India's most trusted payment gateway)\n• GST invoices provided for every payment\n• Your payment info is never stored on our servers\n• Cancel anytime — no lock-in contracts\n• 7-day satisfaction guarantee\n\nThousands of businesses trust us. Your data and payments are completely secure!",
      showCTA: false,
      suggestions: ['Can I cancel anytime?', 'Do I get an invoice?', 'How does payment work?', 'What if I\'m not satisfied?'],
    };
  }

  // Comparison
  if (/wix|wordpress|squarespace|godaddy|vs|compare|better|alternative|differ/i.test(msg)) {
    const results = searchKnowledgeBase(userMessage, 3);
    const answer = results.length > 0
      ? results[0].a
      : "Unlike DIY builders like Wix (₹250-700/month, no SEO), Scalify gives you a **professionally built website + full SEO for ₹1,499/month**. No technical skills needed — just chat and your site is ready!";
    return {
      reply: answer,
      showCTA: true,
      suggestions: ['How much do I save?', 'Is it better than hiring a developer?', 'What makes Scalify different?'],
    };
  }

  // Business type questions
  if (/restaurant|salon|doctor|clinic|shop|gym|coaching|school|lawyer|ca\b|bakery|photographer|hotel|travel|event/i.test(msg)) {
    const results = searchKnowledgeBase(userMessage, 3);
    if (results.length > 0) {
      return {
        reply: results[0].a + "\n\nReady to get started? Subscribe and our AI will build your website in minutes! 🚀",
        showCTA: true,
        suggestions: ['How much does it cost?', 'How long does it take?', 'Can I see an example?', 'What do I need to provide?'],
      };
    }
  }

  // Subscribe / get started
  if (/subscribe|start|signup|sign\s*up|begin|ready|let'?s?\s*go|buy|purchase/i.test(msg)) {
    return {
      reply: "Awesome! Let's get you started! 🎉\n\nTap the **Plans** tab below to subscribe to Scalify Pro at just **₹1,499/month**. After payment, our AI will guide you step-by-step to create your website!\n\nIt takes less than 5 minutes to go live.",
      showCTA: true,
      suggestions: ['What payment methods do you accept?', 'Is there a free trial?', 'Can I cancel anytime?'],
    };
  }

  // Thank you / bye
  if (/thank|thanks|bye|okay|ok\b|cool|great|nice|perfect|awesome/i.test(msg)) {
    return {
      reply: "You're welcome! 😊 Feel free to ask me anything anytime.\n\nWhen you're ready to build your website, just subscribe and our AI takes care of everything!",
      showCTA: false,
      suggestions: ['How much does it cost?', 'How does it work?', 'View Plans'],
    };
  }

  // Fallback — search knowledge base
  const results = searchKnowledgeBase(userMessage, 3);
  if (results.length > 0 && results[0].score >= 3) {
    return {
      reply: results[0].a,
      showCTA: results[0].score > 5,
      suggestions: ['How much does it cost?', 'What\'s included?', 'How does it work?', 'Will I rank on Google?'],
    };
  }

  // Generic fallback
  return {
    reply: "Thanks for your question! 😊\n\nI can help you with:\n• **Pricing** — Plans starting at ₹1,499/month\n• **Features** — What's included in your website\n• **SEO** — How we help you rank on Google\n• **Getting started** — How the process works\n\nAsk me anything, or tap a suggestion below!",
    showCTA: false,
    suggestions: ['How much does it cost?', 'What do I get?', 'How does it work?', 'Will people find me on Google?'],
  };
}

// ════════════════════════════════════════════════════════════
// WEBSITE BUILDER — 1 project per paid user, persists forever
// ════════════════════════════════════════════════════════════

const WEBSITE_BUILDER_GREETING = `Hey! 👋 Welcome to your **Scalify AI Website Builder**!

I'm going to create a professional website for your business in just a few minutes. 🚀

Let's start — **what type of business do you have?**
(e.g. Restaurant, Salon, Doctor, Clothing Shop, Coaching, Gym, etc.)`;

// Get or create the single website-builder conversation for this user
async function getOrCreateWebsiteConversation(userId) {
  const { data: existing } = await supabaseAdmin
    .from('conversations')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'website_builder')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing) return { convId: existing.id, isNew: false };

  const { data: conv } = await supabaseAdmin
    .from('conversations')
    .insert({ user_id: userId, type: 'website_builder', status: 'active' })
    .select('id')
    .single();

  // Save greeting as first AI message
  await supabaseAdmin.from('messages').insert({
    conversation_id: conv.id,
    sender_type: 'ai',
    content: WEBSITE_BUILDER_GREETING,
  });

  return { convId: conv.id, isNew: true };
}

// GET /api/chat/website — Load website builder conversation + website info
router.get('/website', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const { convId, isNew } = await getOrCreateWebsiteConversation(userId);

    const { data: messages } = await supabaseAdmin
      .from('messages')
      .select('id, sender_type, content, created_at')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    const { data: website } = await supabaseAdmin
      .from('websites')
      .select('id, business_name, deployed_url, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    res.json({ conversationId: convId, messages: messages || [], website: website || null, isNew });
  } catch (err) {
    console.error('Website chat load error:', err);
    res.status(500).json({ error: 'Failed to load' });
  }
});

// POST /api/chat/website — Send message in website builder
router.post('/website', authMiddleware, async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;
  if (!message) return res.status(400).json({ error: 'message required' });

  try {
    // Check user is paid
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();

    if (!profile || profile.plan !== 'pro') {
      return res.status(403).json({ error: 'Upgrade to Scalify Pro to use the AI website builder.' });
    }

    const { convId } = await getOrCreateWebsiteConversation(userId);

    // Save user message
    await supabaseAdmin.from('messages').insert({
      conversation_id: convId,
      sender_id: userId,
      sender_type: 'user',
      content: message,
    });

    // Check AI enabled
    const aiEnabled = await isAiEnabled();
    if (!aiEnabled) {
      const msg = '🧑‍💼 Our team has received your message and will reply shortly.';
      await supabaseAdmin.from('messages').insert({ conversation_id: convId, sender_type: 'ai', content: msg });
      return res.json({ reply: msg, action: null, conversationId: convId });
    }

    // Fetch full history
    const { data: msgHistory } = await supabaseAdmin
      .from('messages')
      .select('sender_type, content')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(80);

    const history = (msgHistory || []).map((m) => ({
      role: m.sender_type === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    // Fetch existing website for edit context
    const { data: existingWebsite } = await supabaseAdmin
      .from('websites')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    let userMessage = message;
    if (existingWebsite && history.length <= 3) {
      userMessage = `[User already has a website: ${existingWebsite.business_name}, URL: ${existingWebsite.deployed_url}]\n\n${message}`;
    }

    const result = await processChat(history.slice(0, -1), userMessage);

    // Handle website generation / edit actions
    let actionResult = null;
    if (result.action?.action === 'GENERATE_WEBSITE' && !existingWebsite) {
      try {
        const { generateWebsite } = require('../services/websiteGenerator');
        const { deploySite } = require('../services/siteDeployer');
        const website = await generateWebsite(result.action.data);
        const deployResult = await deploySite(website.subdomain, website.files, website.siteId);

        const { data: savedSite } = await supabaseAdmin.from('websites').insert({
          user_id: userId,
          site_id: website.siteId,
          subdomain: website.subdomain,
          business_name: result.action.data.businessName,
          business_type: result.action.data.businessType,
          description: result.action.data.description,
          html_content: website.html,
          theme_color: result.action.data.colorTheme || '#10B981',
          services: result.action.data.services || [],
          contact: { phone: result.action.data.phone, whatsapp: result.action.data.whatsapp, address: result.action.data.address },
          template: 'nextjs',
          status: deployResult ? 'live' : 'generated',
          deployed_url: deployResult?.url || website.url,
          vercel_project_id: deployResult?.projectId || null,
          vercel_url: deployResult?.vercelUrl || null,
        }).select().single();

        await supabaseAdmin.from('profiles').update({
          business_name: result.action.data.businessName,
          business_type: result.action.data.businessType,
          website_url: deployResult?.url || website.url,
        }).eq('id', userId);

        actionResult = { type: 'WEBSITE_CREATED', url: deployResult?.url || website.url, website: savedSite };
      } catch (genErr) {
        console.error('Website generation error:', genErr.message);
        actionResult = { type: 'GENERATION_FAILED', error: genErr.message };
      }
    } else if (result.action?.action === 'EDIT_WEBSITE' && existingWebsite) {
      const changes = result.action.changes || {};
      const updates = {};
      if (changes.businessName) updates.business_name = changes.businessName;
      if (changes.themeColor) updates.theme_color = changes.themeColor;
      if (changes.services) updates.services = changes.services;
      if (changes.contact) updates.contact = changes.contact;
      if (changes.description) updates.description = changes.description;
      if (Object.keys(updates).length > 0) {
        await supabaseAdmin.from('websites').update(updates).eq('id', existingWebsite.id);
      }
      actionResult = { type: 'WEBSITE_EDITED', changes: Object.keys(updates) };
    }

    const aiReply = result.fullReply || result.reply;
    const replyWithUrl = aiReply + (actionResult?.url ? `\n\n🌐 Your website is live: **${actionResult.url}**` : '');

    await supabaseAdmin.from('messages').insert({
      conversation_id: convId,
      sender_type: 'ai',
      content: replyWithUrl,
    });

    await supabaseAdmin.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId);

    res.json({ reply: replyWithUrl, action: actionResult, conversationId: convId });
  } catch (err) {
    console.error('Website builder error:', err);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// POST /api/chat/sales — FAQ chatbot for free users (NO Claude API)
router.post('/sales', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message required' });
  }

  try {
    const result = buildLocalReply(message);
    res.json({
      reply: result.reply,
      showCTA: result.showCTA,
      suggestions: result.suggestions || [],
    });
  } catch (error) {
    console.error('Sales chat error:', error);
    res.json({
      reply: "I'd love to help! 😊\n\nScalify gives you a professional website + full SEO for just **₹1,499/month** — that's less than ₹25/day!\n\nAsk me about pricing, features, or how it works!",
      showCTA: true,
      suggestions: ['How much does it cost?', 'What\'s included?', 'How does it work?'],
    });
  }
});

// GET /api/chat/starter-faqs — Get FAQs for empty chat state
router.get('/starter-faqs', async (req, res) => {
  try {
    const faqs = getStarterFAQs();
    res.json({ faqs });
  } catch (error) {
    res.json({ faqs: [] });
  }
});

// POST /api/chat/message — HTTP fallback for chat (WebSocket preferred)
router.post('/message', authMiddleware, async (req, res) => {
  const { message, conversationId } = req.body;
  const userId = req.user.id;

  if (!message) {
    return res.status(400).json({ error: 'message required' });
  }

  try {
    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const { data: conv } = await supabaseAdmin
        .from('conversations')
        .insert({ user_id: userId, type: 'ai' })
        .select('id')
        .single();
      convId = conv.id;
    }

    // Save user message
    await supabaseAdmin.from('messages').insert({
      conversation_id: convId,
      sender_id: userId,
      sender_type: 'user',
      content: message,
    });

    // Check if AI is globally enabled
    const aiEnabled = await isAiEnabled();
    if (!aiEnabled) {
      // AI disabled — save user message and return a human-agent message
      const humanMsg = '🧑‍💼 Our team has received your message and will reply shortly. AI responses are temporarily paused.';
      await supabaseAdmin.from('messages').insert({
        conversation_id: convId,
        sender_type: 'ai',
        content: humanMsg,
      });
      // Convert conversation to support type so admin sees it
      await supabaseAdmin.from('conversations').update({ type: 'support' }).eq('id', convId);
      return res.json({ reply: humanMsg, action: null, conversationId: convId, ai_disabled: true });
    }

    // Fetch conversation history from DB
    const { data: msgHistory } = await supabaseAdmin
      .from('messages')
      .select('sender_type, content')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(50);

    const history = (msgHistory || []).map((m) => ({
      role: m.sender_type === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    // Process with AI
    const result = await processChat(history, message);

    // Save AI reply
    await supabaseAdmin.from('messages').insert({
      conversation_id: convId,
      sender_type: 'ai',
      content: result.fullReply || result.reply,
    });

    // Send push notification for the AI reply
    const replyPreview = (result.reply || '').slice(0, 100);
    sendPushNotification(userId, 'Scalify AI', replyPreview, { type: 'chat', conversationId: convId }).catch(() => {});

    res.json({
      reply: result.reply,
      action: result.action || null,
      conversationId: convId,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// POST /api/chat/notify-admin — Notify admin when user sends support message
router.post('/notify-admin', authMiddleware, async (req, res) => {
  const { conversationId, message } = req.body;
  const userId = req.user.id;

  try {
    // Get user profile
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('name, phone, email')
      .eq('id', userId)
      .single();

    const userName = userProfile?.name || userProfile?.phone || 'A user';
    const preview = (message || '').substring(0, 100);

    // Find all admin users
    const { data: admins } = await supabaseAdmin
      .from('profiles')
      .select('id, push_token')
      .eq('role', 'admin');

    // Send push notification to each admin
    if (admins && admins.length > 0) {
      for (const admin of admins) {
        if (admin.push_token) {
          sendPushNotification(
            admin.id,
            `💬 ${userName}`,
            preview || 'New support message',
            { type: 'support_message', conversationId, userId }
          ).catch(() => {});
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Notify admin error:', error);
    res.status(500).json({ error: 'Failed to notify admin' });
  }
});

// GET /api/chat/history/:conversationId
router.get('/history/:conversationId', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', req.params.conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ messages: data });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET /api/chat/conversations — Get user's conversations
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select('*, messages(content, sender_type, created_at)')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json({ conversations: data });
  } catch (error) {
    console.error('Conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// GET /api/chat/admin/conversations — All conversations (admin)
router.get('/admin/conversations', authMiddleware, async (req, res) => {
  try {
    // Check admin role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();
    if (profile?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select('*, profiles(name, phone, email, plan, business_name, avatar_url)')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Attach last message + unread count for each conversation
    const enriched = await Promise.all((data || []).map(async (conv) => {
      const { data: msgs } = await supabaseAdmin
        .from('messages')
        .select('content, sender_type, created_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const { count } = await supabaseAdmin
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('sender_type', 'user')
        .is('metadata->read_by_admin', null);

      return {
        ...conv,
        last_message: msgs?.[0] || null,
        unread_count: count || 0,
      };
    }));

    res.json({ conversations: enriched });
  } catch (error) {
    console.error('Admin conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// POST /api/chat/admin/reply — Admin sends a message to user conversation
router.post('/admin/reply', authMiddleware, async (req, res) => {
  const { conversationId, message } = req.body;
  const adminId = req.user.id;

  if (!conversationId || !message) {
    return res.status(400).json({ error: 'conversationId and message required' });
  }

  try {
    // Verify admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, name')
      .eq('id', adminId)
      .single();
    if (profile?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    // Get conversation to find user
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('user_id, type')
      .eq('id', conversationId)
      .single();
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    // If conversation was AI type, switch to support when admin replies
    if (conv.type === 'ai') {
      await supabaseAdmin
        .from('conversations')
        .update({ type: 'support' })
        .eq('id', conversationId);
    }

    // Save admin message
    const { data: msg, error } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: adminId,
        sender_type: 'admin',
        content: message,
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation timestamp
    await supabaseAdmin
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Send push notification to user
    sendPushNotification(
      conv.user_id,
      'Scalify Support',
      message.slice(0, 100),
      { type: 'chat', conversationId }
    ).catch(() => {});

    res.json({ message: msg });
  } catch (error) {
    console.error('Admin reply error:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

// PUT /api/chat/admin/resolve/:conversationId — Mark conversation as resolved
router.put('/admin/resolve/:conversationId', authMiddleware, async (req, res) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();
    if (profile?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const { error } = await supabaseAdmin
      .from('conversations')
      .update({ status: req.body.status || 'resolved' })
      .eq('id', req.params.conversationId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

// POST /api/chat/admin/mark-read/:conversationId — Mark messages as read by admin
router.post('/admin/mark-read/:conversationId', authMiddleware, async (req, res) => {
  try {
    await supabaseAdmin
      .from('messages')
      .update({ metadata: { read_by_admin: true } })
      .eq('conversation_id', req.params.conversationId)
      .eq('sender_type', 'user')
      .is('metadata->read_by_admin', null);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark read' });
  }
});

// ════════════════════════════════════════════════════════════
// ADMIN AI WEBSITE EDITING — Private, not visible to users
// ════════════════════════════════════════════════════════════

// POST /api/chat/admin/website-ai — Admin talks to AI to create/edit a user's website
router.post('/admin/website-ai', authMiddleware, async (req, res) => {
  const { message, userId, conversationId } = req.body;
  const adminId = req.user.id;

  if (!message || !userId) {
    return res.status(400).json({ error: 'message and userId required' });
  }

  try {
    // Verify admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();
    if (profile?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    // Get or create admin-website conversation (type: 'admin_website', hidden from user)
    let convId = conversationId;
    if (!convId) {
      // Check for existing admin_website conversation for this user
      const { data: existing } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'admin_website')
        .eq('status', 'active')
        .single();

      if (existing) {
        convId = existing.id;
      } else {
        const { data: conv } = await supabaseAdmin
          .from('conversations')
          .insert({ user_id: userId, type: 'admin_website', status: 'active' })
          .select('id')
          .single();
        convId = conv.id;
      }
    }

    // Save admin message
    await supabaseAdmin.from('messages').insert({
      conversation_id: convId,
      sender_id: adminId,
      sender_type: 'admin',
      content: message,
    });

    // Fetch conversation history
    const { data: msgHistory } = await supabaseAdmin
      .from('messages')
      .select('sender_type, content')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(50);

    const history = (msgHistory || []).map((m) => ({
      role: m.sender_type === 'admin' ? 'user' : 'assistant',
      content: m.content,
    }));

    // Fetch user's existing website data for context
    const { data: userSite } = await supabaseAdmin
      .from('websites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Add context about existing website if available
    let contextMessage = message;
    if (userSite && history.length <= 2) {
      contextMessage = `[ADMIN CONTEXT: This user already has a website. Business: ${userSite.business_name}, Type: ${userSite.business_type}, URL: ${userSite.deployed_url}, Status: ${userSite.status}]\n\n${message}`;
    }

    // Process with AI
    const result = await processChat(history.slice(0, -1), contextMessage);

    // Handle AI actions
    let actionResult = null;
    if (result.action) {
      if (result.action.action === 'GENERATE_WEBSITE') {
        // Generate and deploy website for this user
        try {
          const website = await generateWebsite(result.action.data);
          const deployResult = await deploySite(website.subdomain, website.files, website.siteId);

          // Save website to DB
          await supabaseAdmin.from('websites').insert({
            user_id: userId,
            site_id: website.siteId,
            subdomain: website.subdomain,
            business_name: result.action.data.businessName,
            business_type: result.action.data.businessType,
            description: result.action.data.description,
            html_content: website.html,
            theme_color: result.action.data.colorTheme || '#10B981',
            services: result.action.data.services || [],
            contact: { phone: result.action.data.phone, whatsapp: result.action.data.whatsapp, address: result.action.data.address },
            template: 'nextjs',
            status: deployResult ? 'live' : 'generated',
            deployed_url: deployResult?.url || website.url,
            vercel_project_id: deployResult?.projectId || null,
            vercel_url: deployResult?.vercelUrl || null,
          });

          // Update user profile
          await supabaseAdmin.from('profiles').update({
            business_name: result.action.data.businessName,
            business_type: result.action.data.businessType,
            website_url: deployResult?.url || website.url,
          }).eq('id', userId);

          actionResult = {
            type: 'WEBSITE_CREATED',
            url: deployResult?.url || website.url,
            vercelUrl: deployResult?.vercelUrl,
            siteId: website.siteId,
          };
        } catch (genErr) {
          console.error('[Admin AI] Website generation failed:', genErr.message);
          actionResult = { type: 'GENERATION_FAILED', error: genErr.message };
        }
      } else if (result.action.action === 'EDIT_WEBSITE' && userSite) {
        // Edit existing website
        try {
          const changes = result.action.changes || {};
          const updates = {};
          if (changes.businessName) updates.business_name = changes.businessName;
          if (changes.themeColor || changes.colorTheme) updates.theme_color = changes.themeColor || changes.colorTheme;
          if (changes.services) updates.services = changes.services;
          if (changes.contact) updates.contact = changes.contact;
          if (changes.description) updates.description = changes.description;
          if (changes.htmlContent) updates.html_content = changes.htmlContent;

          if (Object.keys(updates).length > 0) {
            await supabaseAdmin.from('websites').update(updates).eq('id', userSite.id);
          }

          // TODO: Regenerate and redeploy with updated data
          actionResult = { type: 'WEBSITE_EDITED', changes: Object.keys(updates) };
        } catch (editErr) {
          actionResult = { type: 'EDIT_FAILED', error: editErr.message };
        }
      }
    }

    // Save AI reply
    const aiReply = result.reply + (actionResult?.url ? `\n\n🌐 Website is live: ${actionResult.url}` : '');
    await supabaseAdmin.from('messages').insert({
      conversation_id: convId,
      sender_type: 'ai',
      content: aiReply,
    });

    res.json({
      reply: aiReply,
      action: actionResult,
      conversationId: convId,
    });
  } catch (error) {
    console.error('Admin website AI error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// GET /api/chat/admin/website-ai/:userId — Get admin's website AI conversation for a user
router.get('/admin/website-ai/:userId', authMiddleware, async (req, res) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();
    if (profile?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    // Find admin_website conversation for this user
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('user_id', req.params.userId)
      .eq('type', 'admin_website')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!conv) {
      return res.json({ messages: [], conversationId: null });
    }

    const { data: messages } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true });

    res.json({ messages: messages || [], conversationId: conv.id });
  } catch (error) {
    res.json({ messages: [], conversationId: null });
  }
});

module.exports = router;
