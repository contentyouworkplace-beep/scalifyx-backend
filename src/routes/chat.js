const express = require('express');
const router = express.Router();
const { processChat, processSalesChat } = require('../services/aiAgent');
const { generateWebsite } = require('../services/websiteGenerator');
const { deploySite } = require('../services/siteDeployer');
const { supabaseAdmin } = require('../lib/supabase');
const { authMiddleware } = require('../middleware/auth');
const { sendPushNotification } = require('../lib/pushNotifications');

// POST /api/chat/sales — Sales assistant for free users (no auth required)
router.post('/sales', async (req, res) => {
  const { message, userId, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message required' });
  }

  try {
    // Build conversation history from request or empty
    const conversationHistory = Array.isArray(history) ? history.slice(-10) : [];

    const result = await processSalesChat(conversationHistory, message);

    res.json({
      reply: result.reply,
      showCTA: result.showCTA,
    });
  } catch (error) {
    console.error('Sales chat error:', error);
    res.status(500).json({
      reply: "I'd love to help! 😊\n\nScalifyX gives you a professional website + full SEO for just **₹749/month** — that's less than ₹25/day!\n\nTap 'View Plans' to get started, or ask me any specific question!",
      showCTA: true,
    });
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
    sendPushNotification(userId, 'ScalifyX AI', replyPreview, { type: 'chat', conversationId: convId }).catch(() => {});

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
      'ScalifyX Support',
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
