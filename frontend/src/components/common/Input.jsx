import { useId } from 'react';
import { classes } from '../../utils/format';

export default function Input({ label, hint, error, className = '', id, ...rest }) {
  const reactId = useId();
  const inputId = id || `inp-${reactId}`;
  return (
    <div className={classes('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <input id={inputId} className={classes('input', error && 'border-rose-400 focus:ring-rose-500')} {...rest} />
      {error ? (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
