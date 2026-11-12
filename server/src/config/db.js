const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/createcode';

  try {
    // Attempt standard connection with 1.5s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`[MongoDB] Connected to database at: ${uri}`);
    return;
  } catch (err) {
    console.warn(`[MongoDB] Standard connection to ${uri} failed (${err.message}).`);
    console.log('[MongoDB] Starting automated in-memory MongoDB server...');
  }

  try {
    mongoMemoryServer = await MongoMemoryServer.create();
    const memUri = mongoMemoryServer.getUri();
    await mongoose.connect(memUri);
    console.log(`[MongoDB] Successfully connected to in-memory MongoDB at: ${memUri}`);
  } catch (memErr) {
    console.error('[MongoDB] Failed to start in-memory MongoDB:', memErr.message);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (e) {
    // ignore
  }
};

module.exports = { connectDB, disconnectDB };
