const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const batchRoutes = require('./routes/batches');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const ipfsRoutes = require('./routes/ipfs');
const qrRoutes = require('./routes/qr');
const complianceRoutes = require('./routes/compliance');
const blockchainRoutes = require('./routes/blockchain');
const blockchainService = require('./services/blockchainService');
const ipfsService = require('./services/ipfsService');
const notificationService = require('./services/notificationService');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002"
    ],
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));
app.use(compression());

// CORS configuration - Must be before other middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests
app.options('*', cors());

// Rate limiting - Increased limits for dashboard usage
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased from 500 to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    resetTime: new Date(Date.now() + (parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000))
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Static files that don't require authentication
const publicPaths = ['/manifest.json', '/favicon.ico', '/static/', '/logo', '/sockjs-node/'];
const isPublicPath = (path) => publicPaths.some(publicPath => path.startsWith(publicPath));

// Skip authentication for public paths
app.use((req, res, next) => {
  if (isPublicPath(req.path)) {
    return next();
  }
  // Continue to other middleware for protected routes
  next();
});

// Serve static files from client build directory
app.use(express.static(path.join(__dirname, '../client/build')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Favicon endpoint to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Manifest.json endpoint - serve without authentication
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  
  const manifest = {
    "short_name": "BioTrace",
    "name": "BioTrace System",
    "icons": [
      {
        "src": "favicon.ico",
        "sizes": "64x64 32x32 24x24 16x16",
        "type": "image/x-icon"
      }
    ],
    "start_url": ".",
    "display": "standalone",
    "theme_color": "#3b82f6",
    "background_color": "#ffffff",
    "description": "Blockchain-based botanical traceability system",
    "categories": ["productivity", "business", "utilities"],
    "lang": "en",
    "dir": "ltr",
    "orientation": "portrait-primary",
    "scope": "/",
    "prefer_related_applications": false
  };
  
  res.json(manifest);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'BioTrace API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      batches: '/api/batches',
      events: '/api/events'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/blockchain', blockchainRoutes);

// Socket.IO for real-time notifications
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join-room', (room) => {
    socket.join(room);
    logger.info(`Client ${socket.id} joined room: ${room}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available to other modules
app.set('io', io);

// Error handling middleware
app.use(errorHandler);

// Serve React app for any non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      error: 'API route not found',
      path: req.originalUrl,
      method: req.method
    });
  }
  
  // Serve React app for all other routes
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Initialize services
async function initializeServices() {
  try {
    // Try to connect to MongoDB, but don't fail if it's not available
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ayurvedic-traceability';
      await mongoose.connect(mongoUri);
      logger.info('MongoDB connected successfully');
    } catch (mongoError) {
      logger.warn('MongoDB not available, using in-memory demo mode');
      // Set up demo users in memory
      global.demoUsers = [
        {
          _id: 'demo_farmer_001',
          userId: 'farmer001',
          username: 'john_farmer',
          email: 'john@farm.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8.8.8.8', // password123
          role: 'farmer',
          organization: 'Green Valley Farms',
          isActive: true
        },
        {
          _id: 'demo_processor_001',
          userId: 'processor001',
          username: 'mary_processor',
          email: 'mary@process.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8.8.8.8', // password123
          role: 'processor',
          organization: 'Herb Processing Co',
          isActive: true
        },
        {
          _id: 'demo_lab_001',
          userId: 'lab001',
          username: 'dr_smith',
          email: 'smith@lab.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8.8.8.8', // password123
          role: 'laboratory',
          organization: 'Quality Lab Services',
          isActive: true
        },
        {
          _id: 'demo_regulator_001',
          userId: 'regulator001',
          username: 'regulator_jane',
          email: 'jane@gov.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8.8.8.8', // password123
          role: 'regulator',
          organization: 'Ministry of AYUSH',
          isActive: true
        }
      ];
    }
    
    // Initialize other services
    await ipfsService.initialize();
    await blockchainService.initialize();
    await notificationService.initialize();
    
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    logger.warn('Running in demo mode without full database connectivity');
  }
}

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, async () => {
  logger.info(`Server running on ${HOST}:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize services
  await initializeServices();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = app;
