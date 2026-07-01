// Resume analysis: section detection, scoring out of 100, weak sections,
// suggestions, and detected skills. Deterministic and explainable.
const { tokenise, wordCount, keywordMatch, clamp, uniqueTokens } = require('./text.service');

// Each section has keywords / phrases that signal its presence.
const SECTION_SIGNALS = {
  contact: {
    keys: ['email', 'phone', 'linkedin', 'github', 'address', 'mobile'],
    weight: 8,
  },
  summary: {
    keys: ['summary', 'objective', 'profile', 'about me', 'professional summary'],
    weight: 12,
  },
  experience: {
    keys: ['experience', 'work experience', 'employment', 'professional experience', 'internship'],
    weight: 22,
  },
  education: {
    keys: ['education', 'university', 'college', 'degree', 'bachelor', 'master', 'b.tech', 'm.tech', 'phd'],
    weight: 12,
  },
  skills: {
    keys: ['skills', 'technical skills', 'tech stack', 'tools', 'technologies'],
    weight: 16,
  },
  projects: {
    keys: ['projects', 'personal projects', 'academic projects', 'project'],
    weight: 14,
  },
  certifications: {
    keys: ['certification', 'certificate', 'certified', 'aws certified', 'azure certified'],
    weight: 6,
  },
  achievements: {
    keys: ['achievement', 'award', 'honor', 'honour', 'accomplishment', 'dean'],
    weight: 5,
  },
  extras: {
    keys: ['volunteer', 'leadership', 'publications', 'languages', 'interests', 'hobbies'],
    weight: 5,
  },
};

// Curated, common technical skills. Used for "skills detected" + interview hinting.
const SKILL_VOCAB = [
  // languages
  'javascript','typescript','python','java','kotlin','swift','go','golang','rust','c','c++','c#',
  'ruby','php','scala','r','matlab','sql','nosql','html','css','sass','dart',
  // frontend
  'react','react.js','next.js','vue','nuxt','svelte','angular','redux','tailwind','tailwindcss',
  'webpack','vite','storybook','jest','cypress','playwright','graphql','apollo','rxjs',
  // backend
  'node.js','nodejs','express','nestjs','django','flask','fastapi','spring','spring boot',
  'laravel','rails','gin','gin-gonic','phoenix',
  // data
  'mongodb','postgresql','mysql','redis','elasticsearch','cassandra','dynamodb','bigquery','snowflake',
  'kafka','rabbitmq','airflow','spark','hadoop','pandas','numpy','scikit-learn','pytorch','tensorflow',
  // cloud / devops
  'aws','azure','gcp','google cloud','docker','kubernetes','helm','terraform','ansible','jenkins',
  'github actions','gitlab ci','circleci','argo','prometheus','grafana','datadog',
  // mobile
  'react native','flutter','swiftui','jetpack compose','android','ios',
  // misc
  'rest','restful','grpc','soap','websocket','oauth','jwt','openid','saml','microservices',
  'distributed systems','system design','agile','scrum','jira','figma','photoshop',
];

const QUANTIFIERS = [
  'increased','decreased','reduced','improved','grew','achieved','delivered','built','launched',
  'optimized','optimised','scaled','automated','saved','generated','led','managed','mentored',
  'designed','architected','implemented','shipped','reduced by','increased by','%','x',
];

const scoreResume = (rawText) => {
  const text = String(rawText || '').trim();
  const lower = text.toLowerCase();
  const words = wordCount(text);

  // --- Section presence + per-section sub-scores -------------------------
  const sections = [];
  let totalWeight = 0;
  let earnedWeight = 0;

  for (const [name, def] of Object.entries(SECTION_SIGNALS)) {
    totalWeight += def.weight;
    const present = def.keys.some((k) => lower.includes(k));
    let subScore = 0;
    let feedback = '';

    if (!present) {
      subScore = 0;
      feedback = `Missing the "${name}" section — add one if relevant.`;
    } else {
      // sub-score = base 60, plus min(content, 40) capped
      const contentShare = name === 'skills' || name === 'experience'
        ? 35
        : name === 'projects'
          ? 30
          : 25;
      subScore = clamp(60 + contentShare);
      if (words < 150) subScore -= 10;
      feedback = `"${name}" section detected.`;
    }

    if (present) earnedWeight += def.weight;
    sections.push({ name, present, score: subScore, feedback });
  }

  // --- Overall score (weighted + bonuses) -------------------------------
  let overall = Math.round((earnedWeight / totalWeight) * 70); // 70 from sections

  // Bonus: quantified achievements
  const quantifierHits = QUANTIFIERS.filter((q) => lower.includes(q)).length;
  overall += clamp(quantifierHits * 2, 0, 10);

  // Bonus: contact info
  const hasEmail = /\S+@\S+\.\S+/.test(text);
  const hasPhone = /\+?\d[\d\s\-().]{7,}\d/.test(text);
  if (hasEmail) overall += 4;
  if (hasPhone) overall += 3;

  // Bonus: length sweet spot
  if (words >= 250 && words <= 900) overall += 8;
  else if (words >= 150 && words < 250) overall += 4;
  else if (words > 1500) overall -= 5;

  // Bonus: detected technical skills
  const skillsDetected = uniqueTokens(text).filter((t) =>
    SKILL_VOCAB.includes(t)
  );
  overall += clamp(skillsDetected.length * 1.2, 0, 10);

  overall = Math.round(clamp(overall));

  // --- Weak sections (sub-score < 60) -----------------------------------
  const weakSections = sections
    .filter((s) => s.present && s.score < 70)
    .map((s) => s.name);

  const missingCritical = sections
    .filter((s) => !s.present && ['summary', 'experience', 'skills', 'education'].includes(s.name))
    .map((s) => s.name);
  weakSections.push(...missingCritical);

  // --- Suggestions -------------------------------------------------------
  const suggestions = [];
  if (!hasEmail) suggestions.push('Add a professional email address at the top.');
  if (!hasPhone) suggestions.push('Include a phone number for recruiters to reach you.');
  if (words < 200) suggestions.push('Your resume looks too short — aim for 350–700 words.');
  if (words > 1200) suggestions.push('Trim your resume — keep it focused (1–2 pages).');
  if (quantifierHits < 3) suggestions.push('Add quantified achievements (e.g. "Reduced load time by 40%").');
  if (skillsDetected.length < 5) suggestions.push('List more relevant technical skills explicitly.');
  if (!sections.find((s) => s.name === 'projects')?.present) {
    suggestions.push('Add a Projects section — 2–4 hands-on projects stand out.');
  }
  if (!sections.find((s) => s.name === 'experience')?.present) {
    suggestions.push('Add Work Experience, internships, or freelance work.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Looks solid. Tailor bullet points to the target job description for best results.');
  }

  return {
    overallScore: overall,
    sections,
    weakSections: [...new Set(weakSections)],
    suggestions,
    detectedSkills: skillsDetected.sort(),
    wordCount: words,
  };
};

module.exports = { scoreResume, SKILL_VOCAB, SECTION_SIGNALS };
