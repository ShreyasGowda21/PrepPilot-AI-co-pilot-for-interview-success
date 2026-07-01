// Interview question generation + answer scoring.
// Both are deterministic, so behaviour is predictable. The interfaces are
// designed so a real LLM provider can be swapped in without changing
// controllers or models.
const { tokenise, wordCount, keywordMatch, clamp } = require('./text.service');

// ---------- Question generation ---------------------------------------
const TEMPLATE_BANK = {
  technical: {
    default: [
      'Walk me through your experience with {skill}. What projects have you built with it?',
      'How do you decide when to use {skill} over alternative tools you know?',
      'Describe a tricky bug you solved using {skill} and how you debugged it.',
    ],
  },
  behavioral: {
    default: [
      'Tell me about a time you had a disagreement with a teammate. How did you handle it?',
      'Describe a project that failed. What did you learn from it?',
      'Give an example of when you went above and beyond what was expected.',
    ],
  },
  situational: {
    default: [
      'You discover a production bug 30 minutes before launch. What do you do?',
      'Your team disagrees on the technical approach. How do you help reach a decision?',
      'A stakeholder keeps changing requirements mid-sprint. How do you respond?',
    ],
  },
  'system-design': {
    default: [
      'Design a URL shortener. What components would you build?',
      'How would you design a chat application that needs to scale to 1M concurrent users?',
      'Design a notification system. What trade-offs would you consider?',
    ],
  },
  coding: {
    default: [
      'How would you find the longest substring without repeating characters? Describe your approach.',
      'Reverse a linked list in place. Walk me through the logic.',
      'How would you detect a cycle in a linked list? What is the time/space complexity?',
    ],
  },
  general: {
    default: [
      'Why are you interested in this role?',
      'Where do you see yourself in 3 years?',
      'What questions do you have for us?',
    ],
  },
};

const DIFFICULTY_BY_SENIORITY = {
  intern: ['easy', 'easy', 'medium'],
  junior: ['easy', 'medium', 'medium'],
  mid: ['medium', 'medium', 'hard'],
  senior: ['medium', 'hard', 'hard'],
  lead: ['hard', 'hard', 'hard'],
  unknown: ['easy', 'medium', 'hard'],
};

const pick = (arr, i) => arr[i % arr.length];

const generateQuestions = ({ jd, count = 6 }) => {
  const skills = (jd.requiredSkills?.length ? jd.requiredSkills : []).slice(0, 4);
  const seniority = jd.seniority || 'unknown';
  const difficulties = DIFFICULTY_BY_SENIORITY[seniority] || DIFFICULTY_BY_SENIORITY.unknown;

  const plan = [
    { category: 'general', difficulty: difficulties[0] },
    ...(skills.length > 0
      ? [
          { category: 'technical', difficulty: difficulties[0], skill: skills[0] },
          { category: 'technical', difficulty: difficulties[1] || difficulties[0], skill: skills[1 % skills.length] },
          { category: 'coding', difficulty: difficulties[1] || difficulties[0] },
        ]
      : []),
    { category: 'behavioral', difficulty: difficulties[0] },
    ...(count >= 6 ? [{ category: 'situational', difficulty: difficulties[0] }] : []),
    ...(count >= 7 ? [{ category: 'system-design', difficulty: difficulties[2] || 'hard' }] : []),
  ].slice(0, count);

  return plan.map((step, idx) => {
    const bank = TEMPLATE_BANK[step.category]?.default || TEMPLATE_BANK.general.default;
    let text = pick(bank, idx);
    if (step.skill) text = text.replace(/\{skill\}/g, step.skill);

    const expectedKeywords = step.skill
      ? [step.skill, ...(jd.requiredSkills || []).slice(0, 3)]
      : categoryKeywords(step.category);

    return {
      text,
      category: step.category,
      difficulty: step.difficulty,
      expectedKeywords,
    };
  });
};

const categoryKeywords = (category) => {
  switch (category) {
    case 'technical': return ['experience', 'project', 'implement', 'design'];
    case 'behavioral': return ['situation', 'task', 'action', 'result', 'team'];
    case 'situational': return ['priority', 'communicate', 'stakeholder', 'trade-off'];
    case 'system-design': return ['scale', 'latency', 'throughput', 'consistency', 'storage'];
    case 'coding': return ['complexity', 'algorithm', 'edge case', 'approach', 'test'];
    case 'general': return ['motivation', 'career', 'interest', 'strength', 'goal'];
    default: return [];
  }
};

// ---------- Answer scoring --------------------------------------------
const scoreAnswer = ({ question, answer }) => {
  const text = String(answer || '').trim();
  if (!text) {
    return { score: 0, feedback: 'No answer provided.', strengths: [], weaknesses: ['Empty answer'] };
  }
  const words = wordCount(text);
  const lower = text.toLowerCase();
  const tokens = tokenise(text);
  const unique = new Set(tokens).size;

  // 1) keyword coverage
  const matched = keywordMatch(text, question.expectedKeywords || []);
  const expected = question.expectedKeywords || [];
  const keywordRatio = expected.length ? matched.length / expected.length : 0.5;

  // 2) length sweet-spot
  let lengthScore;
  if (words < 5) lengthScore = 0.2;
  else if (words < 20) lengthScore = 0.5;
  else if (words <= 250) lengthScore = 1;
  else if (words <= 400) lengthScore = 0.8;
  else lengthScore = 0.5;

  // 3) structure: presence of "I", numbers, examples
  const hasI = /\bi\s/i.test(text);
  const hasNumber = /\d/.test(text);
  const hasStar = /(situation|task|action|result|for example|for instance|such as)/i.test(text);

  const structure = (hasI ? 0.25 : 0) + (hasNumber ? 0.25 : 0) + (hasStar ? 0.25 : 0) + (unique > 20 ? 0.25 : 0);

  // 4) relevance penalty: too few matched keywords for technical questions
  const isTechy = ['technical', 'coding', 'system-design'].includes(question.category);
  const relevancePenalty = isTechy && expected.length > 0 && keywordRatio < 0.2 ? 0.3 : 0;

  // Weighted blend
  const raw =
    keywordRatio * 0.45 +
    lengthScore * 0.25 +
    structure * 0.30;

  const final = clamp(Math.round((raw - relevancePenalty) * 100), 0, 100);

  // Generate feedback
  const strengths = [];
  const weaknesses = [];
  if (words >= 30 && words <= 250) strengths.push('Well-sized response (30–250 words).');
  if (hasNumber) strengths.push('Uses quantified details or metrics.');
  if (hasStar) strengths.push('Follows a structured example (STAR-style).');
  if (unique > 25) strengths.push('Good vocabulary variety.');

  if (keywordRatio < 0.4 && expected.length) {
    weaknesses.push('Could mention more relevant terms (' + expected.slice(0, 4).join(', ') + ').');
  }
  if (words < 20) weaknesses.push('Answer is too short — add concrete details.');
  if (words > 400) weaknesses.push('Answer is too long — tighten the message.');
  if (!hasNumber && (question.category === 'behavioral' || question.category === 'situational')) {
    weaknesses.push('Try to quantify impact (e.g. %, $, time saved).');
  }
  if (isTechy && !hasI) weaknesses.push('Tie concepts back to your personal experience.');

  if (!strengths.length) strengths.push('Answer was recorded.');
  if (!weaknesses.length) weaknesses.push('Keep polishing — try adding a concrete example.');

  return {
    score: final,
    feedback: strengths.join(' ') + ' ' + weaknesses.join(' '),
    strengths,
    weaknesses,
  };
};

// ---------- Final report generation -----------------------------------
const generateReport = (interview, jd) => {
  const answered = interview.questions.filter((q) => q.score != null);
  if (answered.length === 0) {
    return {
      finalScore: 0,
      strengths: [],
      weaknesses: ['No questions were answered.'],
      recommendations: ['Try completing an interview to see your report.'],
      skillBreakdown: {},
    };
  }

  const finalScore = Math.round(
    answered.reduce((sum, q) => sum + (q.score || 0), 0) / answered.length
  );

  // Skill breakdown — based on expected keywords per question and how often
  // they appeared in the candidate's answer.
  const skillMap = new Map();
  for (const q of answered) {
    const tokens = new Set(tokenise(q.candidateAnswer || ''));
    for (const k of q.expectedKeywords || []) {
      const key = k.toLowerCase();
      const entry = skillMap.get(key) || { skill: key, hits: 0, total: 0 };
      entry.total += 1;
      if (tokens.has(key) || (q.candidateAnswer || '').toLowerCase().includes(key)) {
        entry.hits += 1;
      }
      skillMap.set(key, entry);
    }
  }

  const skillBreakdown = {};
  for (const { skill, hits, total } of skillMap.values()) {
    skillBreakdown[skill] = total ? Math.round((hits / total) * 100) : 0;
  }

  // Strong / weak skills
  const entries = [...skillMap.values()];
  const strongSkills = entries.filter((e) => e.hits / Math.max(1, e.total) >= 0.7).map((e) => e.skill);
  const weakSkills = entries.filter((e) => e.hits / Math.max(1, e.total) < 0.4).map((e) => e.skill);

  // Aggregate strengths / weaknesses from per-question feedback
  const strengthCounts = new Map();
  const weaknessCounts = new Map();
  for (const q of answered) {
    for (const s of q._strengths || []) strengthCounts.set(s, (strengthCounts.get(s) || 0) + 1);
    for (const w of q._weaknesses || []) weaknessCounts.set(w, (weaknessCounts.get(w) || 0) + 1);
  }
  const top = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);

  const recommendations = [];
  if (finalScore < 60) {
    recommendations.push('Practice foundational questions in your target stack daily.');
  } else if (finalScore < 80) {
    recommendations.push('Strengthen weak areas with focused mini-projects.');
  } else {
    recommendations.push('You are interview-ready — do a few mock runs to stay sharp.');
  }
  if (weakSkills.length) {
    recommendations.push(`Focus on: ${weakSkills.slice(0, 4).join(', ')}.`);
  }
  if (jd?.title) {
    recommendations.push(`Tailor answers to the responsibilities listed in the ${jd.title} JD.`);
  }

  return {
    finalScore,
    strengths: top(strengthCounts),
    weaknesses: top(weaknessCounts),
    recommendations,
    skillBreakdown,
    strongSkills,
    weakSkills,
  };
};

module.exports = { generateQuestions, scoreAnswer, generateReport };
