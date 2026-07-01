// Cookie options for the auth token.
// In dev we run on http://localhost so `secure` must be false or the browser
// drops the cookie. In prod the site is served over HTTPS, so `secure: true`
// is the right default.
const config = require('./env');

const COOKIE_NAME = 'mockmate_token';

const parseExpiryToMs = (raw) => {
  const s = String(raw || '7d');
  const m = /^(\d+)\s*([smhdw])$/i.exec(s.trim());
  if (!m) return 7 * 24 * 60 * 60 * 1000;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000, w: 604_800_000 }[unit];
  return n * mult;
};

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: config.env === 'production',
  path: '/',
  maxAge: parseExpiryToMs(config.jwt.expiresIn),
});

module.exports = { COOKIE_NAME, cookieOptions };
