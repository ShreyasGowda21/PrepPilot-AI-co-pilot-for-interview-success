export const formatDate = (input) => {
  if (!input) return '—';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (input) => {
  if (!input) return '—';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatScore = (n) => {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return `${Math.round(Number(n))}/100`;
};

export const scoreTone = (n) => {
  const v = Number(n);
  if (Number.isNaN(v)) return 'slate';
  if (v >= 80) return 'green';
  if (v >= 60) return 'amber';
  return 'rose';
};

export const classes = (...args) => args.filter(Boolean).join(' ');

export const initials = (name = '') =>
  name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
