const { processChat } = require('./aiAgent');
const { generateWebsite } = require('./websiteGenerator');
const { supabaseAdmin } = require('../lib/supabase');
const { sendPushNotification } = require('../lib/pushNotifications');
const adminRoutes = require('../routes/admin');

async function isAiEnabled() {
  try { return await adminRoutes.getAiChatEnabled(); } catch { return true; }
}

/**
 * Setup Socket.io real-time chat for AI website builder
 */
function setupChatSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[Chat] User connected: ${socket.id}`);

    const userId = socket.handshake.query.userId;
    let conversationId = socket.handshake.query.conversationId;

    // Handle incoming message
    socket.on('message', async (data) => {
      const { message } = data;

      try {
        // Create conversation if needed
        if (!conversationId) {
          const { data: conv } = await supabaseAdmin
            .from('conversations')
            .insert({ user_id: userId, type: 'ai' })
            .select('id')
            .single();
          conversationId = conv?.id;
        }

        // Save user message to DB
        if (conversationId) {
          await supabaseAdmin.from('messages').insert({
            conversation_id: conversationId,
            sender_id: userId,
            sender_type: 'user',
            content: message,
          });
        }

        // Load history from DB
        const { data: msgHistory } = await supabaseAdmin
          .from('messages')
          .select('sender_type, content')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })
          .limit(50);

        const history = (msgHistory || []).map((m) => ({
          role: m.sender_type === 'user' ? 'user' : 'assistant',
          content: m.content,
        }));

        // Check if AI is globally enabled
        const aiEnabled = await isAiEnabled();
        if (!aiEnabled) {
          const humanMsg = '🧑‍💼 Our team has received your message and will reply shortly. AI responses are temporarily paused.';
          if (conversationId) {
            await supabaseAdmin.from('messages').insert({ conversation_id: conversationId, sender_type: 'ai', content: humanMsg });
            await supabaseAdmin.from('conversations').update({ type: 'support' }).eq('id', conversationId);
          }
          socket.emit('message', { text: humanMsg, sender: 'bot', type: 'text', ai_disabled: true });
          return;
        }

        // Process through AI agent
        const result = await processChat(history, message);

        // Save AI reply to DB
        if (conversationId) {
          await supabaseAdmin.from('messages').insert({
            conversation_id: conversationId,
            sender_type: 'ai',
            content: result.fullReply || result.reply,
          });
        }

        // Send push notification if user is not actively connected
        if (userId) {
          const replyPreview = (result.reply || '').slice(0, 100);
          sendPushNotification(userId, 'Scalify AI', replyPreview, { type: 'chat', conversationId }).catch(() => {});
        }

        // If AI wants to generate a website
        if (result.action?.action === 'GENERATE_WEBSITE') {
          socket.emit('message', {
            text: '⏳ Creating your website... This will take about 30 seconds!',
            sender: 'bot',
            type: 'text',
          });

          try {
            const website = await generateWebsite(result.action.data);
            socket.emit('message', {
              text: `✅ Your website is ready!\n\n🔗 ${website.url}\n\nDo you approve this? Say "yes" to go live!`,
              sender: 'bot',
              type: 'preview',
              previewUrl: website.url,
              siteId: website.siteId,
            });
          } catch (err) {
            socket.emit('message', {
              text: '😅 Something went wrong while creating your website. Let me try again...',
              sender: 'bot',
              type: 'text',
            });
          }
        } else {
          // Regular AI response
          socket.emit('message', {
            text: result.reply,
            sender: 'bot',
            type: 'text',
          });
        }
      } catch (error) {
        console.error('[Chat] AI Error:', error);
        socket.emit('message', {
          text: "I'm having a small issue. Let me reconnect... Please try again!",
          sender: 'bot',
          type: 'text',
        });
      }
    });

    // Handle image upload in chat
    socket.on('image', async (data) => {
      const { imageUrl, step } = data;
      socket.emit('message', {
        text: '📸 Photo received! Looking great!',
        sender: 'bot',
        type: 'text',
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Chat] User disconnected: ${socket.id}`);
      // Keep conversation history for reconnection (clear after 24h in production)
    });
  });
}

module.exports = { setupChatSocket };
