const mongoose = require('mongoose');

const communityQuestionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    roundType: {
      type: String,
      enum: ['technical', 'behavioral', 'hr', 'coding', 'system-design', 'general'],
      default: 'general',
    },
    // One submission can carry multiple questions from the same interview round.
    questions: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.some((q) => q && q.trim().length > 0),
        message: 'At least one question is required',
      },
    },
  },
  { timestamps: true }
);

// Default listing index — newest first, secondary on company+role for filter hits.
communityQuestionSchema.index({ createdAt: -1 });
communityQuestionSchema.index({ company: 1, role: 1, createdAt: -1 });

module.exports = mongoose.model('CommunityQuestion', communityQuestionSchema);
