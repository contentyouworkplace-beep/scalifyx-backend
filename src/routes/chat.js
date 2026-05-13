const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');

// GET /api/chat/conversations - List all conversations for authenticated user
router.get('/conversations', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error('Invalid token');

    // Fetch conversations for this user with last message preview
    const { data: conversations, error } = await supabaseAdmin
      .from('chat_conversations')
      .select(`
        id,
        business_name,
        created_at,
        updated_at,
        is_active
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // For each conversation, get last message and unread count
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const { data: lastMsg } = await supabaseAdmin
          .from('chat_messages')
          .select('id, message, created_at, is_read')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const { count: unreadCount } = await supabaseAdmin
          .from('chat_messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', user.id);

        return {
          ...conv,
          last_message: lastMsg?.message || 'No messages yet',
          last_message_time: lastMsg?.created_at,
          unread_count: unreadCount || 0,
        };
      })
    );

    res.json({ success: true, conversations: enrichedConversations });
  } catch (error) {
    console.error('Fetch conversations error:', error);
    res.status(400).json({ error: error.message || 'Failed to fetch conversations' });
  }
});

// GET /api/chat/messages/:conversationId - Get all messages in a conversation
router.get('/messages/:conversationId', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error('Invalid token');

    const { conversationId } = req.params;

    // Verify user has access to this conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('chat_conversations')
      .select('id, user_id')
      .eq('id', conversationId)
      .maybeSingle();

    if (convError || !conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.user_id !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Fetch all messages
    const { data: messages, error } = await supabaseAdmin
      .from('chat_messages')
      .select('id, sender_id, sender_type, message, created_at, is_read')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Mark all messages as read for this user
    await supabaseAdmin
      .from('chat_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id);

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(400).json({ error: error.message || 'Failed to fetch messages' });
  }
});

// POST /api/chat/send - Send a message in a conversation
router.post('/send', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { conversation_id, message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error('Invalid token');

    let convId = conversation_id;

    // If no conversation_id, create a new conversation
    if (!convId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('name, businessName')
        .eq('id', user.id)
        .maybeSingle();

      const { data: newConv, error: convError } = await supabaseAdmin
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          business_name: profile?.businessName || profile?.name || 'Unknown',
          is_active: true,
        })
        .select('id')
        .single();

      if (convError) throw convError;
      convId = newConv.id;
    }

    // Verify user has access to this conversation
    const { data: conversation } = await supabaseAdmin
      .from('chat_conversations')
      .select('id, user_id')
      .eq('id', convId)
      .maybeSingle();

    if (!conversation || conversation.user_id !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Insert message
    const { data: newMessage, error: msgError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        conversation_id: convId,
        sender_id: user.id,
        sender_type: 'customer',
        message: message.trim(),
      })
      .select()
      .single();

    if (msgError) throw msgError;

    // Update conversation updated_at timestamp
    await supabaseAdmin
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', convId);

    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(400).json({ error: error.message || 'Failed to send message' });
  }
});

// POST /api/chat/admin/reply - Admin sends a reply (admin only)
router.post('/admin/reply', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { conversation_id, message } = req.body;

  if (!conversation_id) {
    return res.status(400).json({ error: 'Conversation ID required' });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error('Invalid token');

    // Verify user is an admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Insert admin message
    const { data: newMessage, error: msgError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        conversation_id,
        sender_id: user.id,
        sender_type: 'admin',
        message: message.trim(),
      })
      .select()
      .single();

    if (msgError) throw msgError;

    // Update conversation updated_at timestamp
    await supabaseAdmin
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversation_id);

    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Admin reply error:', error);
    res.status(400).json({ error: error.message || 'Failed to send reply' });
  }
});

// GET /api/chat/admin/conversations - Get all conversations (admin only)
router.get('/admin/conversations', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error('Invalid token');

    // Verify user is an admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Fetch all conversations with last message and unread count
    const { data: conversations, error } = await supabaseAdmin
      .from('chat_conversations')
      .select(`
        id,
        business_name,
        user_id,
        created_at,
        updated_at,
        is_active
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Enrich conversations
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const { data: lastMsg } = await supabaseAdmin
          .from('chat_messages')
          .select('id, message, created_at, is_read, sender_type')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const { count: unreadCount } = await supabaseAdmin
          .from('chat_messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', conv.user_id);

        // Get user profile info
        const { data: userProfile } = await supabaseAdmin
          .from('profiles')
          .select('name, email, phone, plan')
          .eq('id', conv.user_id)
          .maybeSingle();

        return {
          id: conv.id,
          user_id: conv.user_id,
          business_name: conv.business_name,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          unread_count: unreadCount || 0,
          last_message: lastMsg?.message || 'No messages yet',
          last_message_time: lastMsg?.created_at,
          last_message_sender: lastMsg?.sender_type,
          is_active: conv.is_active,
          user: userProfile,
        };
      })
    );

    res.json({ success: true, conversations: enrichedConversations });
  } catch (error) {
    console.error('Fetch admin conversations error:', error);
    res.status(400).json({ error: error.message || 'Failed to fetch conversations' });
  }
});

// POST /api/chat/admin/mark-read/:conversationId - Mark messages as read (admin only)
router.post('/admin/mark-read/:conversationId', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error('Invalid token');

    // Verify user is an admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { conversationId } = req.params;

    // Mark all messages as read for this conversation
    await supabaseAdmin
      .from('chat_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId);

    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(400).json({ error: error.message || 'Failed to mark as read' });
  }
});

module.exports = router;
