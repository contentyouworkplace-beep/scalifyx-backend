if (!process.env.VERCEL) require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buf) => {
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
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/website', require('./routes/website'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/contact', require('./routes/contact'));

// 404 fallback
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = app;

// Local dev server only
if (!process.env.VERCEL) {
  const http = require('http');
  const { Server } = require('socket.io');
  const { setupChatSocket } = require('./services/chatSocket');
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });
  setupChatSocket(io);
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => console.log(`Scalify API running on port ${PORT}`));
}
