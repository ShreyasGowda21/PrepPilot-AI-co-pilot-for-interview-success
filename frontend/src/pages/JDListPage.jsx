import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useApi from '../hooks/useApi';
import { jdApi } from '../api/endpoints';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { EmptyState, ErrorState } from '../components/common/States';
import { FullPageLoader } from '../components/common/Loader';
import { formatDate } from '../utils/format';

export default function JDListPage() {
  const { data, loading, error, refetch } = useApi(() =>
    jdApi.list().then((r) => r.jds)
  );

  const handleDelete = async (id) => {
    if (!confirm('Delete this job description?')) return;
    try {
      await jdApi.remove(id);
      toast.success('Deleted');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not delete');
    }
  };

  if (loading) return <FullPageLoader label="Loading job descriptions…" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Job Descriptions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Analyse JDs to extract required skills and surface red flags.
          </p>
        </div>
        <Link to="/job-descriptions/new">
          <Button>+ New JD</Button>
        </Link>
      </div>

      {!data || data.length === 0 ? (
        <EmptyState
          title="No job descriptions yet"
          description="Paste your first JD to extract skills and match against a resume."
          action={
            <Link to="/job-descriptions/new">
              <Button>+ Create job description</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((jd) => (
            <Card key={jd._id} className="hover:shadow-md transition">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to={`/job-descriptions/${jd._id}`}
                    className="text-base font-semibold text-slate-900 hover:text-brand-700"
                  >
                    {jd.title}
                  </Link>
                  {jd.company && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {jd.company}
                      {jd.location ? ` • ${jd.location}` : ''}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">{formatDate(jd.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge tone="brand" className="capitalize">
                    {jd.seniority}
                  </Badge>
                  {jd.redFlags?.length > 0 && (
                    <Badge tone="rose">{jd.redFlags.length} red flag{jd.redFlags.length > 1 ? 's' : ''}</Badge>
                  )}
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600 line-clamp-3">{jd.summary || jd.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(jd.requiredSkills || []).slice(0, 6).map((s) => (
                  <Badge key={s} tone="slate" className="capitalize">{s}</Badge>
                ))}
                {jd.requiredSkills?.length > 6 && (
                  <Badge tone="slate">+{jd.requiredSkills.length - 6} more</Badge>
                )}
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleDelete(jd._id)}>
                  Delete
                </Button>
                <Link to={`/job-descriptions/${jd._id}`}>
                  <Button size="sm">Open</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
