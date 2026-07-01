/* eslint-disable no-console */
// Tiny structured-ish logger so logs are timestamped and consistent.
const ts = () => new Date().toISOString();

const format = (level, args) => {
  const [first, ...rest] = args;
  if (typeof first === 'string') {
    return [`[${ts()}] ${level} ${first}`, ...rest];
  }
  return [`[${ts()}] ${level}`, first, ...rest];
};

const logger = {
  info: (...args) => console.log(...format('INFO ', args)),
  warn: (...args) => console.warn(...format('WARN ', args)),
  error: (...args) => console.error(...format('ERROR', args)),
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(...format('DEBUG', args));
    }
  },
};

module.exports = logger;
