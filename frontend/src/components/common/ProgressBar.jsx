import { classes } from '../../utils/format';

const bars = (score) => {
  const v = Math.max(0, Math.min(100, Number(score) || 0));
  return v;
};

export default function ProgressBar({ value, tone, className = '', showLabel = false }) {
  const pct = bars(value);
  const colour =
    tone === 'green' || (!tone && pct >= 80)
      ? 'bg-emerald-500'
      : tone === 'amber' || (!tone && pct >= 60)
      ? 'bg-amber-500'
      : 'bg-rose-500';

  return (
    <div className={classes('w-full', className)}>
      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className={classes('h-full transition-all', colour)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-slate-500">{Math.round(pct)}/100</div>
      )}
    </div>
  );
}
