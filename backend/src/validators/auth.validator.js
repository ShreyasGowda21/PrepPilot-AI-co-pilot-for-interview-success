// Lightweight request validators. Returns a normalised array of error messages.
// Keeps the dependency surface tiny by not pulling in joi/zod.
const isString = (v) => typeof v === 'string' && v.trim().length > 0;
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ''));

const validateRegister = (body) => {
  const errors = [];
  if (!isString(body?.name) || body.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (!isEmail(body?.email)) errors.push('Valid email is required');
  if (!isString(body?.password) || body.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  return errors;
};

const validateLogin = (body) => {
  const errors = [];
  if (!isEmail(body?.email)) errors.push('Valid email is required');
  if (!isString(body?.password)) errors.push('Password is required');
  return errors;
};

const validateJD = (body) => {
  const errors = [];
  if (!isString(body?.title)) errors.push('Job title is required');
  if (!isString(body?.description) || body.description.trim().length < 30) {
    errors.push('Job description must be at least 30 characters');
  }
  return errors;
};

const validateInterviewSetup = (body) => {
  const errors = [];
  if (!isString(body?.jdId)) errors.push('Job description id is required');
  const num = Number(body?.numQuestions);
  if (!Number.isInteger(num) || num < 3 || num > 20) {
    errors.push('numQuestions must be an integer between 3 and 20');
  }
  return errors;
};

// The interview id is in the URL path (`/api/interviews/:id/answer`); the body
// only carries the question index and the candidate's answer.
const validateAnswer = (body) => {
  const errors = [];
  if (!Number.isInteger(body?.questionIndex) || body.questionIndex < 0) {
    errors.push('questionIndex must be a non-negative integer');
  }
  if (!isString(body?.answer) || body.answer.trim().length < 1) {
    errors.push('answer cannot be empty');
  }
  return errors;
};

const VALID_ROUND_TYPES = ['technical', 'behavioral', 'hr', 'coding', 'system-design', 'general'];

// Community question bank submissions. Accepts either a `questions` array
// directly, or a free-text `questionsText` blob where each non-empty line is
// treated as one question — whichever the frontend sends.
const validateCommunityQuestion = (body) => {
  const errors = [];
  if (!isString(body?.company)) errors.push('Company is required');
  if (!isString(body?.role)) errors.push('Role is required');

  if (body?.roundType != null && !VALID_ROUND_TYPES.includes(body.roundType)) {
    errors.push('roundType is invalid');
  }

  let questions = [];
  if (Array.isArray(body?.questions)) {
    questions = body.questions;
  } else if (isString(body?.questionsText)) {
    questions = body.questionsText.split(/\r?\n/);
  }
  const cleaned = questions
    .map((q) => (typeof q === 'string' ? q.trim() : ''))
    .filter((q) => q.length > 0);

  if (cleaned.length === 0) errors.push('At least one question is required');
  if (cleaned.length > 50) errors.push('At most 50 questions per submission');

  return errors;
};

module.exports = {
  validateRegister,
  validateLogin,
  validateJD,
  validateInterviewSetup,
  validateAnswer,
  validateCommunityQuestion,
};
