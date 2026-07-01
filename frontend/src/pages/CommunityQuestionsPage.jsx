import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useApi from '../hooks/useApi';
import useAuth from '../hooks/useAuth';
import { communityApi } from '../api/endpoints';
import Card, { CardHeader } from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { EmptyState, ErrorState } from '../components/common/States';
import { FullPageLoader } from '../components/common/Loader';
import { formatDate } from '../utils/format';

const ROUND_LABEL = {
  technical: 'Technical',
  behavioral: 'Behavioural',
  hr: 'HR',
  coding: 'Coding',
  'system-design': 'System Design',
  general: 'General',
};

const ROUND_TONE = {
  technical: 'brand',
  coding: 'brand',
  'system-design': 'brand',
  behavioral: 'slate',
  hr: 'slate',
  general: 'slate',
};

export default function CommunityQuestionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState(''); // last-submitted query that triggered the fetch

  // Re-fetches whenever `search` changes — typing in the input alone does not
  // hit the network until the user submits the form.
  const { data, loading, error, refetch } = useApi(
    () => communityApi.list(search || undefined).then((r) => r.items),
    [search]
  );

  const onSearch = (e) => {
    e.preventDefault();
    setSearch(query.trim());
  };

  const onClear = () => {
    setQuery('');
    setSearch('');
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this community submission?')) return;
    try {
      await communityApi.remove(id);
      toast.success('Deleted');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not delete');
    }
  };

  if (loading) return <FullPageLoader label="Loading community questions…" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const items = data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Community Question Bank</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real interview questions shared by the community. Browse freely — sign in to contribute.
          </p>
        </div>
        {user ? (
          <Button onClick={() => navigate('/community-questions/new')}>+ Contribute</Button>
        ) : (
          <Link to="/login">
            <Button variant="secondary">Sign in to contribute</Button>
          </Link>
        )}
      </div>

      <Card padding="p-4">
        <form onSubmit={onSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by company, role, or question text…"
              aria-label="Search community questions"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Search</Button>
            {search && (
              <Button type="button" variant="secondary" onClick={onClear}>
                Clear
              </Button>
            )}
          </div>
        </form>
        {search && (
          <p className="mt-2 text-xs text-slate-500">
            Showing results for <span className="font-medium text-slate-700">"{search}"</span>
          </p>
        )}
      </Card>

      {items.length === 0 ? (
        <EmptyState
          title={search ? 'No matches' : 'No community questions yet'}
          description={
            search
              ? 'Try a different keyword, or clear the search to see everything.'
              : 'Be the first to share an interview round you attended.'
          }
          action={
            user ? (
              <Link to="/community-questions/new">
                <Button>+ Contribute a question</Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button>Create an account to contribute</Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <CommunityQuestionCard
              key={item._id}
              item={item}
              canDelete={user && item.submittedBy === user.name}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommunityQuestionCard({ item, canDelete, onDelete }) {
  const [open, setOpen] = useState(false);
  const count = item.questions?.length || 0;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900 truncate">
            {item.company} <span className="text-slate-400 font-normal">·</span> {item.role}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Submitted by <span className="font-medium text-slate-700">{item.submittedBy || 'Anonymous'}</span>
            {' · '}
            {formatDate(item.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={ROUND_TONE[item.roundType] || 'slate'} className="capitalize">
            {ROUND_LABEL[item.roundType] || item.roundType}
          </Badge>
          <Badge tone="slate">
            {count} question{count === 1 ? '' : 's'}
          </Badge>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          {open ? 'Hide questions' : `View ${count} question${count === 1 ? '' : 's'}`}
        </button>
        {canDelete && (
          <Button variant="secondary" size="sm" onClick={() => onDelete(item._id)}>
            Delete
          </Button>
        )}
      </div>

      {open && (
        <ul className="mt-3 space-y-2 border-t border-slate-200 pt-3">
          {item.questions.map((q, i) => (
            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />
              <span>{q}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
