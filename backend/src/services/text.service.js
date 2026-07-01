// Lightweight lexical / heuristic utilities shared across services.
// Keeps services from being one big wall of regex.
const STOPWORDS = new Set([
  'the','a','an','and','or','of','to','in','on','at','for','with','is','are','was',
  'were','be','been','being','as','by','that','this','these','those','it','its','from',
  'we','you','your','our','their','they','will','can','should','have','has','had',
  'i','me','my','if','but','not','no','yes','do','does','did','so','than','then',
  'about','into','over','under','any','all','some','more','most','such','also','etc',
  'using','use','used','via','within','across','per','good','great','strong','solid',
  'knowledge','experience','familiarity','hands','working','strong','plus','bonus',
]);

const tokenise = (text = '') =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#./\-\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const wordCount = (text = '') => tokenise(text).length;

const uniqueTokens = (text = '') => [...new Set(tokenise(text))];

const keywordMatch = (text, keywords) => {
  const haystack = ' ' + tokenise(text).join(' ') + ' ';
  return keywords.filter((k) => {
    const needle = k.toLowerCase().trim();
    if (!needle) return false;
    return haystack.includes(' ' + needle + ' ') || haystack.includes(needle);
  });
};

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));

const removeStopwords = (tokens) => tokens.filter((t) => !STOPWORDS.has(t));

const frequencyMap = (tokens) => {
  const map = new Map();
  for (const t of tokens) map.set(t, (map.get(t) || 0) + 1);
  return map;
};

module.exports = {
  tokenise,
  wordCount,
  uniqueTokens,
  keywordMatch,
  clamp,
  removeStopwords,
  frequencyMap,
  STOPWORDS,
};
