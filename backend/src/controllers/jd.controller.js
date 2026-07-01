// Job description controller — create, list, fetch, delete, match to resume.
const JobDescription = require('../models/JobDescription.model');
const Resume = require('../models/Resume.model');
const { analyseJobDescription, matchScore } = require('../services/jd.service');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const createJD = asyncHandler(async (req, res) => {
  const { title, company, location, description } = req.body;
  const analysis = analyseJobDescription(description);

  const jd = await JobDescription.create({
    user: req.user._id,
    title,
    company,
    location,
    description,
    ...analysis,
  });

  res.status(201).json(new ApiResponse(201, { jd }, 'Job description created'));
});

const listJDs = asyncHandler(async (req, res) => {
  const jds = await JobDescription.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, { jds }, 'Job descriptions fetched'));
});

const getJD = asyncHandler(async (req, res) => {
  const jd = await JobDescription.findOne({ _id: req.params.id, user: req.user._id });
  if (!jd) throw ApiError.notFound('Job description not found');
  res.json(new ApiResponse(200, { jd }, 'Job description fetched'));
});

const matchJDToResume = asyncHandler(async (req, res) => {
  const { resumeId } = req.body;
  if (!resumeId) throw ApiError.badRequest('resumeId is required');

  const [jd, resume] = await Promise.all([
    JobDescription.findOne({ _id: req.params.id, user: req.user._id }),
    Resume.findOne({ _id: resumeId, user: req.user._id }),
  ]);
  if (!jd) throw ApiError.notFound('Job description not found');
  if (!resume) throw ApiError.notFound('Resume not found');

  const result = matchScore(resume.detectedSkills, jd.requiredSkills, jd.niceToHaveSkills);
  res.json(new ApiResponse(200, { match: result }, 'Match computed'));
});

const deleteJD = asyncHandler(async (req, res) => {
  const jd = await JobDescription.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!jd) throw ApiError.notFound('Job description not found');
  res.json(new ApiResponse(200, { id: jd._id }, 'Job description deleted'));
});

module.exports = { createJD, listJDs, getJD, matchJDToResume, deleteJD };
