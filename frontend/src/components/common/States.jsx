import { classes } from '../../utils/format';

export function EmptyState({ title = 'Nothing here yet', description, action, className = '' }) {
  return (
    <div className={classes('card p-8 text-center', className)}>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="card p-6 border-rose-200 bg-rose-50/50">
      <h3 className="text-sm font-semibold text-rose-800">Something went wrong</h3>
      <p className="mt-1 text-sm text-rose-700">{error?.message || 'Unknown error'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm font-medium text-rose-700 hover:text-rose-900 underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
