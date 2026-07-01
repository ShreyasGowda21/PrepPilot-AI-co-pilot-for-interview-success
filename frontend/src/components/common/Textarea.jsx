import { useId } from 'react';
import { classes } from '../../utils/format';

export default function Textarea({ label, hint, error, className = '', id, rows = 4, ...rest }) {
  const reactId = useId();
  const inputId = id || `ta-${reactId}`;
  return (
    <div className={classes('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={classes('input resize-y', error && 'border-rose-400 focus:ring-rose-500')}
        {...rest}
      />
      {error ? (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
