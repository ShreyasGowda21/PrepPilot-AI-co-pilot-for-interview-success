const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    category: {
      type: String,
      enum: ['technical', 'behavioral', 'situational', 'system-design', 'coding', 'general'],
      default: 'general',
    },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    expectedKeywords: { type: [String], default: [] },
    candidateAnswer: { type: String, default: '' },
    score: { type: Number, min: 0, max: 100, default: null },
    feedback: { type: String, default: '' },
    answeredAt: { type: Date, default: null },
  },
  { _id: true }
);

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jd: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDescription', required: true },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
      index: true,
    },
    questions: { type: [questionSchema], default: [] },
    currentIndex: { type: Number, default: 0 },
    finalScore: { type: Number, min: 0, max: 100, default: null },
    report: {
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
      recommendations: { type: [String], default: [] },
      skillBreakdown: { type: Object, default: {} },
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

interviewSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Interview', interviewSchema);
