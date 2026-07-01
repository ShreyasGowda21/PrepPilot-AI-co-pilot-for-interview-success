// Mock Interview controller — start, answer one question, complete, fetch.
const Interview = require('../models/Interview.model');
const JobDescription = require('../models/JobDescription.model');
const { generateQuestions, scoreAnswer, generateReport } = require('../services/interview.service');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const DEFAULT_QUESTIONS = 6;
const MAX_QUESTIONS = 20;

const startInterview = asyncHandler(async (req, res) => {
  const { jdId, numQuestions = DEFAULT_QUESTIONS } = req.body;
  const total = Math.min(Math.max(Number(numQuestions) || DEFAULT_QUESTIONS, 3), MAX_QUESTIONS);

  const jd = await JobDescription.findOne({ _id: jdId, user: req.user._id });
  if (!jd) throw ApiError.notFound('Job description not found');

  const questions = generateQuestions({ jd, count: total });

  const interview = await Interview.create({
    user: req.user._id,
    jd: jd._id,
    questions,
    currentIndex: 0,
    status: 'in_progress',
  });

  res.status(201).json(
    new ApiResponse(201, { interview: clientView(interview) }, 'Interview started')
  );
});

const getInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) throw ApiError.notFound('Interview not found');
  res.json(new ApiResponse(200, { interview: clientView(interview) }, 'Interview fetched'));
});

const listInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('jd', 'title company');
  res.json(new ApiResponse(200, { interviews: interviews.map(clientView) }, 'Interviews fetched'));
});

const submitAnswer = asyncHandler(async (req, res) => {
  const { questionIndex, answer } = req.body;
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) throw ApiError.notFound('Interview not found');
  if (interview.status !== 'in_progress') {
    throw ApiError.badRequest('Interview is no longer in progress');
  }
  if (questionIndex < 0 || questionIndex >= interview.questions.length) {
    throw ApiError.badRequest('Invalid question index');
  }

  const question = interview.questions[questionIndex];
  const { score, feedback, strengths, weaknesses } = scoreAnswer({ question, answer });

  question.candidateAnswer = answer;
  question.score = score;
  question.feedback = feedback;
  question._strengths = strengths; // ephemeral, used by report
  question._weaknesses = weaknesses;
  question.answeredAt = new Date();
  interview.currentIndex = Math.min(questionIndex + 1, interview.questions.length);

  await interview.save();

  res.json(
    new ApiResponse(200, {
      interview: clientView(interview),
      result: { score, feedback, strengths, weaknesses },
    }, 'Answer recorded')
  );
});

const completeInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id })
    .populate('jd');
  if (!interview) throw ApiError.notFound('Interview not found');

  const report = generateReport(interview, interview.jd);
  interview.finalScore = report.finalScore;
  interview.report = {
    strengths: report.strengths,
    weaknesses: report.weaknesses,
    recommendations: report.recommendations,
    skillBreakdown: report.skillBreakdown,
  };
  interview.status = 'completed';
  interview.completedAt = new Date();
  await interview.save();

  res.json(
    new ApiResponse(200, {
      interview: clientView(interview),
      report: {
        ...report,
        // drop internal _strengths arrays on each question
      },
    }, 'Interview completed')
  );
});

const abandonInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id, status: 'in_progress' },
    { status: 'abandoned' },
    { new: true }
  );
  if (!interview) throw ApiError.notFound('Interview not found or already finished');
  res.json(new ApiResponse(200, { interview: clientView(interview) }, 'Interview abandoned'));
});

// Strip Mongoose internals + ephemeral fields before sending to the client.
const clientView = (i) => {
  if (!i) return i;
  const obj = typeof i.toObject === 'function' ? i.toObject({ versionKey: false }) : { ...i };
  if (Array.isArray(obj.questions)) {
    obj.questions = obj.questions.map((q) => {
      const copy = { ...q };
      delete copy._strengths;
      delete copy._weaknesses;
      return copy;
    });
  }
  return obj;
};

module.exports = {
  startInterview,
  getInterview,
  listInterviews,
  submitAnswer,
  completeInterview,
  abandonInterview,
};
