/**
 * SafeMaga Database Connection Utility.
 * Standalone connection wrapper used by migration scripts, CLI seed runners,
 * and background data ingestion tasks.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend or root if present
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/safemaga_db';

const connectDatabase = async (customUri = null) => {
  const uri = customUri || process.env.MONGODB_URI || DEFAULT_URI;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    console.log(`[Database Utility] Successfully connected to MongoDB: ${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`[Database Utility] MongoDB connection failure: ${err.message}`);
    throw err;
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('[Database Utility] MongoDB disconnected cleanly.');
  } catch (err) {
    console.error(`[Database Utility] Error disconnecting MongoDB: ${err.message}`);
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
  DEFAULT_URI,
};
