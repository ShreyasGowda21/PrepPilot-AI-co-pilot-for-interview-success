// Community question bank — public read, login-required write.
// We intentionally keep this small: list, create, get-one, delete-own.
const CommunityQuestion = require('../models/CommunityQuestion.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const MAX_LIMIT = 100;

// Escape user input before splicing it into a Mongo $regex. Mongo itself
// treats the value as a pattern source, so raw user text can break or hijack
// the query.
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normaliseQuestions = (body) => {
  if (Array.isArray(body.questions)) return body.questions;
  if (typeof body.questionsText === 'string') {
    return body.questionsText.split(/\r?\n/);
  }
  return [];
};

const listCommunityQuestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const filter = {};
  if (q && String(q).trim()) {
    const re = new RegExp(escapeRegex(String(q).trim()), 'i');
    filter.$or = [{ company: re }, { role: re }, { questions: re }];
  }

  const items = await CommunityQuestion.find(filter)
    .sort({ createdAt: -1 })
    .limit(MAX_LIMIT)
    .populate('user', 'name');

  res.json(
    new ApiResponse(200, { items: items.map(clientView) }, 'Community questions fetched')
  );
});

const getCommunityQuestion = asyncHandler(async (req, res) => {
  const item = await CommunityQuestion.findById(req.params.id).populate('user', 'name');
  if (!item) throw ApiError.notFound('Community question not found');
  res.json(new ApiResponse(200, { item: clientView(item) }, 'Community question fetched'));
});

const createCommunityQuestion = asyncHandler(async (req, res) => {
  const { company, role, roundType } = req.body;
  const questions = normaliseQuestions(req.body)
    .map((q) => (typeof q === 'string' ? q.trim() : ''))
    .filter((q) => q.length > 0);

  const item = await CommunityQuestion.create({
    user: req.user._id,
    company,
    role,
    roundType: roundType || 'general',
    questions,
  });

  const populated = await item.populate('user', 'name');
  res
    .status(201)
    .json(new ApiResponse(201, { item: clientView(populated) }, 'Community question submitted'));
});

const deleteCommunityQuestion = asyncHandler(async (req, res) => {
  const item = await CommunityQuestion.findById(req.params.id);
  if (!item) throw ApiError.notFound('Community question not found');
  if (String(item.user) !== String(req.user._id)) {
    throw ApiError.forbidden('You can only delete your own submissions');
  }
  await item.deleteOne();
  res.json(new ApiResponse(200, { id: item._id }, 'Community question deleted'));
});

// Shape the document for the wire: hide internal mongoose fields, expose the
// submitter's name as `submittedBy`.
const clientView = (i) => {
  if (!i) return i;
  const obj = typeof i.toObject === 'function' ? i.toObject({ versionKey: false }) : { ...i };
  if (obj.user && typeof obj.user === 'object' && 'name' in obj.user) {
    obj.submittedBy = obj.user.name;
  }
  delete obj.user;
  return obj;
};

module.exports = {
  listCommunityQuestions,
  getCommunityQuestion,
  createCommunityQuestion,
  deleteCommunityQuestion,
};
