const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never returned by default
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String, default: '' },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// --- Instance methods ---------------------------------------------------
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject({ versionKey: false });
  delete obj.password;
  return obj;
};

// --- Hooks --------------------------------------------------------------
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Statics ------------------------------------------------------------
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) return null;
  const ok = await user.comparePassword(password);
  return ok ? user : null;
};

module.exports = mongoose.model('User', userSchema);

// crypto kept here for future email-verification / reset tokens
module.exports._unused = crypto;
