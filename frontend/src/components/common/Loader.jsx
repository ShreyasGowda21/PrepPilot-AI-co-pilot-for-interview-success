import { classes } from '../../utils/format';

export default function Loader({ label = 'Loading…', className = '' }) {
  return (
    <div className={classes('flex items-center gap-3 text-slate-500 text-sm', className)}>
      <span className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
      {label}
    </div>
  );
}

export function FullPageLoader({ label = 'Loading…' }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader label={label} className="text-base" />
    </div>
  );
}

export function Spinner({ className = '' }) {
  return (
    <span
      className={classes(
        'inline-block h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin',
        className
      )}
    />
  );
}
