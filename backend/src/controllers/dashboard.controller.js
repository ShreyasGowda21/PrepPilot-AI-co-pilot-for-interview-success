// Performance dashboard: aggregates over a user's resumes + interviews.
const Resume = require('../models/Resume.model');
const Interview = require('../models/Interview.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const buildSummary = async (userId) => {
  const [resumes, interviews] = await Promise.all([
    Resume.find({ user: userId }).sort({ createdAt: 1 }),
    Interview.find({ user: userId, status: 'completed' }).sort({ createdAt: 1 }),
  ]);

  // ----- Interview score trend (last N) -----
  const interviewTrend = interviews.slice(-10).map((i) => ({
    id: i._id,
    date: i.createdAt,
    score: i.finalScore ?? 0,
  }));

  // ----- Resume score history -----
  const resumeHistory = resumes.slice(-10).map((r) => ({
    id: r._id,
    date: r.createdAt,
    score: r.overallScore,
    name: r.originalName,
  }));

  // ----- Skill aggregation from interviews -----
  const skillAgg = new Map();
  for (const itv of interviews) {
    const breakdown = itv.report?.skillBreakdown || {};
    for (const [skill, val] of Object.entries(breakdown)) {
      const cur = skillAgg.get(skill) || { skill, total: 0, count: 0 };
      cur.total += val;
      cur.count += 1;
      skillAgg.set(skill, cur);
    }
  }
  const skillAverages = [...skillAgg.values()].map((s) => ({
    skill: s.skill,
    average: Math.round(s.total / Math.max(1, s.count)),
  }));
  skillAverages.sort((a, b) => b.average - a.average);

  const strongSkills = skillAverages.filter((s) => s.average >= 70).slice(0, 8);
  const weakSkills = skillAverages.filter((s) => s.average < 50).slice(0, 8);

  // ----- JD match history (resume-vs-JD) -----
  // Cheap proxy: we don't store every match, so we expose the latest JD analyses.
  const jdHistory = (await Interview.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('jd', 'title company requiredSkills niceToHaveSkills'))
    .map((i) => ({
      id: i._id,
      jd: i.jd
        ? { id: i.jd._id, title: i.jd.title, company: i.jd.company }
        : null,
      date: i.createdAt,
      score: i.finalScore ?? 0,
    }));

  const avg = (arr) =>
    arr.length ? Math.round(arr.reduce((s, n) => s + n, 0) / arr.length) : 0;

  return {
    totals: {
      resumes: resumes.length,
      interviews: interviews.length,
      avgResumeScore: avg(resumes.map((r) => r.overallScore)),
      avgInterviewScore: avg(interviews.map((i) => i.finalScore ?? 0)),
    },
    interviewTrend,
    resumeHistory,
    strongSkills,
    weakSkills,
    skillAverages,
    jdHistory,
  };
};

const getDashboard = asyncHandler(async (req, res) => {
  const data = await buildSummary(req.user._id);
  res.json(new ApiResponse(200, data, 'Dashboard fetched'));
});

module.exports = { getDashboard };
