const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const chatRoutes = require('./routes/chat.routes');
const codeRoutes = require('./routes/code.routes');
const reviewRoutes = require('./routes/review.routes');
const issueRoutes = require('./routes/issue.routes');
const githubRoutes = require('./routes/github.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const notificationRoutes = require('./routes/notification.routes');
const settingsRoutes = require('./routes/settings.routes');

const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // allow Monaco Editor CDN and inline workers
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-hub-signature-256', 'x-github-event', 'x-github-delivery'],
  })
);

// Capture raw body for GitHub Webhook HMAC verification
app.use(
  express.json({
    limit: '15mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'CreateCode AI',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;

