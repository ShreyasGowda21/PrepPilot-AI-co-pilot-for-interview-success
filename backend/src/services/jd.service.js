// Job description analysis: skill extraction, seniority, experience, red flags.
const { tokenise, wordCount } = require('./text.service');
const { SKILL_VOCAB } = require('./resume.service');

const SENIORITY_RULES = [
  { level: 'intern', keys: ['intern', 'internship', 'trainee'] },
  { level: 'junior', keys: ['junior', 'entry level', 'entry-level', 'graduate', 'fresher', '0-1 year', '0-2 year'] },
  { level: 'mid', keys: ['mid level', 'mid-level', '2-4 year', '3-5 year', '2+ year', '2+ years'] },
  { level: 'senior', keys: ['senior', 'sr.', 'sr ', '5+ year', '5+ years', '5-7 year', '6+ year', '7+ year'] },
  { level: 'lead', keys: ['lead', 'principal', 'staff', 'manager', 'head of', 'director', 'architect'] },
];

const NICE_TO_HAVE_HINTS = [
  'nice to have', 'nice-to-have', 'preferred', 'a plus', 'bonus', 'would be great',
  'good to have', 'advantageous',
];

const RED_FLAG_PATTERNS = [
  { pattern: /unpaid|uncompensated|no pay/i, message: 'Unpaid role mentioned' },
  { pattern: /\bguaranteed\s+(?:job|placement|interview|offer)\b/i, message: 'Guaranteed offer / placement claims' },
  { pattern: /pay\s+(?:a|deposit|fee|upfront)/i, message: 'Asks candidate to pay any fee' },
  { pattern: /work\s+(?:for\s+)?free/i, message: 'Mentions working for free' },
  { pattern: /\b(MLM|multi[\s-]?level\s+marketing)\b/i, message: 'Possible MLM language' },
  { pattern: /immediate\s+joiner|join\s+immediately|joining\s+in\s+\d+\s*day/i, message: 'Unrealistically urgent joining date' },
  { pattern: /commission\s+only|100%\s+commission/i, message: 'Commission-only compensation' },
  { pattern: /no\s+experience\s+required\s*[,.;-]?\s*\$?\s*\d{2,3}[kK]\s*[-/]\s*\$?\s*\d{2,3}[kK]/i, message: 'Unrealistic pay for no-experience role' },
  { pattern: /must\s+be\s+available\s+24\/7|on[\s-]call\s+24\/7/i, message: '24/7 availability requirement' },
  { pattern: /no\s+benefits|no\s+paid\s+leave|unpaid\s+leave/i, message: 'Missing benefits or paid leave' },
];

const EXPERIENCE_REGEX = /(\d{1,2})\s*\+?\s*(?:to|-)?\s*(\d{1,2})?\s*(?:years?|yrs?)\s*(?:of\s+)?experience/i;

const findSkills = (text) => {
  const tokens = new Set(tokenise(text));
  const hits = new Set();
  for (const skill of SKILL_VOCAB) {
    if (tokens.has(skill)) hits.add(skill);
  }
  // multi-word skill scan (e.g. "react native", "system design", "next.js")
  const lower = ' ' + text.toLowerCase().replace(/[^a-z0-9+#./\-\s]/g, ' ') + ' ';
  for (const skill of SKILL_VOCAB) {
    if (skill.includes(' ') || skill.includes('.') || skill.includes('+') || skill.includes('#')) {
      if (lower.includes(' ' + skill + ' ')) hits.add(skill);
    }
  }
  return [...hits].sort();
};

const splitRequiredAndNice = (description, allSkills) => {
  const lower = description.toLowerCase();
  // crude: sentences / lines containing a "must" or "required" → required bucket
  // everything else with a skill mention → nice-to-have if it has those hints.
  const sentences = description.split(/(?<=[.!?\n])\s+/);
  const required = new Set();
  const nice = new Set();

  for (const s of sentences) {
    const sLower = s.toLowerCase();
    const skillsInSentence = allSkills.filter((sk) => sLower.includes(sk));
    if (skillsInSentence.length === 0) continue;

    const isMust = /\b(must|required|requirement|need to|should|you will|responsibilit)/i.test(s);
    const isNiceHint = NICE_TO_HAVE_HINTS.some((h) => sLower.includes(h));

    if (isNiceHint && !isMust) {
      skillsInSentence.forEach((k) => nice.add(k));
    } else if (isMust) {
      skillsInSentence.forEach((k) => required.add(k));
    } else {
      // Default: any skill mentioned in the responsibilities block is "required"
      skillsInSentence.forEach((k) => required.add(k));
    }
  }

  // Anything left unassigned → put into nice-to-have so the user sees the gap.
  for (const s of allSkills) {
    if (!required.has(s) && !nice.has(s)) nice.add(s);
  }
  return { required: [...required].sort(), nice: [...nice].sort() };
};

const detectSeniority = (text) => {
  const lower = text.toLowerCase();
  for (const rule of SENIORITY_RULES) {
    if (rule.keys.some((k) => lower.includes(k))) return rule.level;
  }
  return 'unknown';
};

const detectExperienceYears = (text) => {
  const m = text.match(EXPERIENCE_REGEX);
  if (!m) return null;
  return Number(m[1]);
};

const findRedFlags = (text) => {
  const flags = [];
  for (const { pattern, message } of RED_FLAG_PATTERNS) {
    if (pattern.test(text)) flags.push(message);
  }
  return [...new Set(flags)];
};

const summarise = (text) => {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  return cleaned.length > 280 ? cleaned.slice(0, 277) + '...' : cleaned;
};

const analyseJobDescription = (description) => {
  const skills = findSkills(description);
  const { required, nice } = splitRequiredAndNice(description, skills);
  return {
    requiredSkills: required,
    niceToHaveSkills: nice,
    seniority: detectSeniority(description),
    experienceYears: detectExperienceYears(description),
    redFlags: findRedFlags(description),
    summary: summarise(description),
    wordCount: wordCount(description),
  };
};

// "How well does the candidate match?" — used by the resume-vs-JD endpoint.
const matchScore = (candidateSkills, requiredSkills, niceToHaveSkills) => {
  const cs = new Set(candidateSkills.map((s) => s.toLowerCase()));
  const have = (skills) => skills.filter((s) => cs.has(s.toLowerCase()));
  const missing = (skills) => skills.filter((s) => !cs.has(s.toLowerCase()));

  const matchedRequired = have(requiredSkills);
  const matchedNice = have(niceToHaveSkills);
  const missRequired = missing(requiredSkills);
  const missNice = missing(niceToHaveSkills);

  const reqRatio = requiredSkills.length
    ? matchedRequired.length / requiredSkills.length
    : 1;
  const niceRatio = niceToHaveSkills.length
    ? matchedNice.length / niceToHaveSkills.length
    : 0.5;

  const score = Math.round(reqRatio * 75 + niceRatio * 25);

  return {
    matchScore: score,
    matchedRequired,
    matchedNice,
    missingRequired: missRequired,
    missingNice: missNice,
  };
};

module.exports = {
  analyseJobDescription,
  matchScore,
  // exported for testing
  _internal: { findSkills, detectSeniority, detectExperienceYears, findRedFlags },
};
