// Resume controller — upload PDF, list, fetch, delete.
const fs = require('fs');
const Resume = require('../models/Resume.model');
const extractTextFromPdf = require('../utils/textExtractor');
const { scoreResume } = require('../services/resume.service');
const { matchScore } = require('../services/jd.service');
const JobDescription = require('../models/JobDescription.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const safeUnlink = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch (_) { /* ignore */ }
  }
};

const uploadAndAnalyse = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Please attach a PDF file');

  let rawText;
  try {
    rawText = await extractTextFromPdf(req.file.path);
  } catch (err) {
    safeUnlink(req.file.path);
    throw err;
  }

  const analysis = scoreResume(rawText);

  const resume = await Resume.create({
    user: req.user._id,
    originalName: req.file.originalname,
    storedFileName: req.file.filename,
    sizeBytes: req.file.size,
    mimeType: req.file.mimetype,
    rawText,
    wordCount: analysis.wordCount,
    overallScore: analysis.overallScore,
    sections: analysis.sections,
    weakSections: analysis.weakSections,
    suggestions: analysis.suggestions,
    detectedSkills: analysis.detectedSkills,
  });

  res.status(201).json(
    new ApiResponse(201, { resume: sanitiseResume(resume) }, 'Resume analysed')
  );
});

const listResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select('-rawText');
  res.json(new ApiResponse(200, { resumes }, 'Resumes fetched'));
});

const getResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).select('-rawText');
  if (!resume) throw ApiError.notFound('Resume not found');
  res.json(new ApiResponse(200, { resume }, 'Resume fetched'));
});

const matchResumeToJd = asyncHandler(async (req, res) => {
  const { jdId } = req.body;
  if (!jdId) throw ApiError.badRequest('jdId is required');

  const [resume, jd] = await Promise.all([
    Resume.findOne({ _id: req.params.id, user: req.user._id }),
    JobDescription.findOne({ _id: jdId, user: req.user._id }),
  ]);
  if (!resume) throw ApiError.notFound('Resume not found');
  if (!jd) throw ApiError.notFound('Job description not found');

  const result = matchScore(resume.detectedSkills, jd.requiredSkills, jd.niceToHaveSkills);

  res.json(new ApiResponse(200, { match: result }, 'Match computed'));
});

const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!resume) throw ApiError.notFound('Resume not found');
  safeUnlink(`${require('../config/env').uploads.dir}/${resume.storedFileName}`);
  res.json(new ApiResponse(200, { id: resume._id }, 'Resume deleted'));
});

const sanitiseResume = (r) => {
  const obj = r.toObject({ versionKey: false });
  delete obj.rawText;
  return obj;
};

module.exports = {
  uploadAndAnalyse,
  listResumes,
  getResume,
  matchResumeToJd,
  deleteResume,
};
