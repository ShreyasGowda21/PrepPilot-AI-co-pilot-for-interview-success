const mongoose = require('mongoose');

const jdSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    description: { type: String, required: true },

    requiredSkills: { type: [String], default: [] },
    niceToHaveSkills: { type: [String], default: [] },
    experienceYears: { type: Number, default: null },
    seniority: { type: String, enum: ['intern', 'junior', 'mid', 'senior', 'lead', 'unknown'], default: 'unknown' },
    redFlags: { type: [String], default: [] },
    summary: { type: String, default: '' },
  },
  { timestamps: true }
);

jdSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('JobDescription', jdSchema);
