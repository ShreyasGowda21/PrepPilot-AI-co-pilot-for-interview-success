// Centralised error handler. Logs and serialises all errors to JSON.
const mongoose = require('mongoose');
const multer = require('multer');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // --- Mongoose CastError (bad ObjectId, etc.) ---
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
      errors: [],
    });
  }

  // --- Mongoose validation error ---
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // --- Duplicate key (Mongo 11000) ---
  if (err && err.code === 11000) {
    const fields = Object.keys(err.keyValue || {}).join(', ');
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${fields || 'field'}`,
      errors: [],
    });
  }

  // --- Multer errors ---
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File too large' : err.message;
    return res.status(400).json({ success: false, message: msg, errors: [] });
  }

  // --- Our operational errors ---
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // --- JWT errors ---
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token', errors: [] });
  }

  // --- Unknown error ---
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  return res.status(500).json({
    success: false,
    message:
      config.env === 'production' ? 'Internal server error' : err.message,
    errors: [],
  });
};

module.exports = errorHandler;
