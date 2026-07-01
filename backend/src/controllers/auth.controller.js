// Auth controller – register, login, logout, current user.
// The JWT is still the on-the-wire token format, but it's now delivered to the
// browser via an httpOnly cookie. The JSON response still includes the token
// so legacy / curl flows keep working.
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const config = require('../config/env');
const { COOKIE_NAME, cookieOptions } = require('../config/cookie');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const signToken = (userId) =>
  jwt.sign({ id: userId }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

const tokenResponse = (user, statusCode, res, message) => {
  const token = signToken(user._id);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  return res.status(statusCode).json(
    new ApiResponse(statusCode, { token, user: user.toSafeJSON() }, message)
  );
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) throw ApiError.conflict('Email is already registered');

  const user = await User.create({ name, email, password });
  tokenResponse(user, 201, res, 'Registration successful');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findByCredentials(email, password);
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  tokenResponse(user, 200, res, 'Login successful');
});

const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json(new ApiResponse(200, null, 'Logged out'));
});

const me = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, { user: req.user.toSafeJSON() }, 'Current user'));
});

module.exports = { register, login, logout, me };
