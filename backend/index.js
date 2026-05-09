require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const designRoutes = require('./routes/designs');
const templateRoutes = require('./routes/templates');
const exportRoutes = require('./routes/export');
const aiRoutes = require('./routes/ai');
const subscriptionRoutes = require('./routes/subscriptions');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true } });

// ── Middleware ──────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: 'Too many requests' } }));
app.use('/api/ai', rateLimit({ windowMs: 60 * 1000, max: 10, message: { error: 'AI rate limit exceeded' } }));

// ── Routes ──────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'DesignX API', version: '1.0.0' }));
app.use('/api/auth', authRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/subscription', subscriptionRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Socket.IO (real-time collab) ─────────────────────
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-canvas', (canvasId) => {
    socket.join(`canvas:${canvasId}`);
    socket.to(`canvas:${canvasId}`).emit('user-joined', { id: socket.id });
  });

  socket.on('canvas-update', ({ canvasId, data }) => {
    socket.to(`canvas:${canvasId}`).emit('canvas-update', data);
  });

  socket.on('cursor-move', ({ canvasId, x, y }) => {
    socket.to(`canvas:${canvasId}`).emit('cursor-move', { id: socket.id, x, y });
  });

  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`\n🚀 DesignX API running on http://localhost:${PORT}\n`));
