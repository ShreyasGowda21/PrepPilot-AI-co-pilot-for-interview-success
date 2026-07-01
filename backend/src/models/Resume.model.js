const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Summary", "Skills"
    present: { type: Boolean, default: false },
    score: { type: Number, min: 0, max: 100, default: 0 }, // sub-score for the section
    feedback: { type: String, default: '' },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalName: { type: String, required: true },
    storedFileName: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    mimeType: { type: String, default: 'application/pdf' },

    rawText: { type: String, required: true, select: false },
    wordCount: { type: Number, default: 0 },

    overallScore: { type: Number, min: 0, max: 100, default: 0, index: true },
    sections: { type: [sectionSchema], default: [] },
    weakSections: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    detectedSkills: { type: [String], default: [] },
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
