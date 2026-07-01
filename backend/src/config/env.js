// Centralised environment configuration.
// Throws fast on boot if anything required is missing.
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const required = (name) => {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const optional = (name, fallback) =>
  process.env[name] && process.env[name].trim() !== ''
    ? process.env[name]
    : fallback;

const config = Object.freeze({
  env: optional('NODE_ENV', 'development'),
  port: Number(optional('PORT', 5000)),

  // Mongo
  mongoUri: optional(
    'MONGODB_URI',
    'mongodb://127.0.0.1:27017/mockmate'
  ),

  // Auth
  jwt: {
    secret: optional('JWT_SECRET', 'dev-only-insecure-secret-change-me'),
    expiresIn: optional('JWT_EXPIRES_IN', '7d'),
    cookieExpiresInDays: Number(optional('JWT_COOKIE_EXPIRES_IN', 7)),
  },

  // Uploads
  uploads: {
    maxFileSizeMB: Number(optional('MAX_FILE_SIZE_MB', 5)),
    dir: path.join(__dirname, '..', '..', 'uploads'),
  },

  // CORS
  clientOrigin: optional('CLIENT_ORIGIN', 'http://localhost:5173'),
});

module.exports = config;
module.exports.required = required;
