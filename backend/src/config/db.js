// Mongoose connection bootstrap.
const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

let connectionPromise = null;

const connectDB = async () => {
  if (connectionPromise) return connectionPromise;

  mongoose.set('strictQuery', true);

  connectionPromise = mongoose
    .connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    })
    .then((conn) => {
      logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    })
    .catch((err) => {
      connectionPromise = null; // allow retries on next call
      logger.error('MongoDB connection error', { message: err.message });
      throw err;
    });

  return connectionPromise;
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    connectionPromise = null;
    logger.info('MongoDB disconnected');
  }
};

module.exports = { connectDB, disconnectDB };
