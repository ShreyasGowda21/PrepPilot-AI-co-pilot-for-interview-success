import { classes, scoreTone } from '../../utils/format';

const tones = {
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-700',
  slate: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-100 text-brand-700',
};

export default function Badge({ tone = 'slate', className = '', children }) {
  return (
    <span className={classes('badge', tones[tone] || tones.slate, className)}>
      {children}
    </span>
  );
}

export function ScoreBadge({ score, label }) {
  return (
    <Badge tone={scoreTone(score)}>
      {label ? `${label}: ` : ''}
      {Math.round(Number(score) || 0)}/100
    </Badge>
  );
}
