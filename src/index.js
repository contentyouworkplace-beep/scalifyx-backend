require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const websiteRoutes = require('./routes/website');
const paymentRoutes = require('./routes/payment');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const contactRoutes = require('./routes/contact');
const { setupChatSocket } = require('./services/chatSocket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// Middleware
app.use(cors());
app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buf) => {
    // Preserve raw body for webhook signature verification
    if (req.url && req.url.includes('/webhook')) {
      req.rawBody = buf.toString();
    }
  },
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Scalify API', version: '1.0.0' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/website', websiteRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', contactRoutes);

// WebSocket for real-time chat (skip on Vercel serverless)
if (!process.env.VERCEL) {
  setupChatSocket(io);

  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || '0.0.0.0';
  server.listen(PORT, HOST, () => {
    console.log(`🚀 Scalify API running on ${HOST}:${PORT}`);
  });
}

module.exports = app;
