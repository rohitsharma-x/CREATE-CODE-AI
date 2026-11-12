require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const { seedInitialData } = require('./utils/seed');
const { initQueue } = require('./services/queue.service');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const server = http.createServer(app);

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`===============================================`);
      console.log(`🚀 CreateCode AI Backend running on port ${PORT}`);
      console.log(`   Local URL:  http://localhost:${PORT}`);
      console.log(`   IPv4 URL:   http://127.0.0.1:${PORT}`);
      console.log(`   Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`===============================================`);
    });

    // Initialize DB and background services
    try {
      await connectDB();
      await seedInitialData();
    } catch (dbErr) {
      console.warn('[DB Init Error]:', dbErr.message);
    }

    initQueue().catch((err) => console.warn('[Queue] Init warning:', err.message));

    // Graceful Shutdown
    const handleShutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        await disconnectDB();
        console.log('[Server] Database connections closed. Process terminating.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
