import { useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { dashboardApi } from '../api/endpoints';
import Card, { CardHeader } from '../components/common/Card';
import Badge, { ScoreBadge } from '../components/common/Badge';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import { FullPageLoader } from '../components/common/Loader';
import { ErrorState } from '../components/common/States';
import { formatDate } from '../utils/format';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useApi(() => dashboardApi.get());

  if (loading) return <FullPageLoader label="Loading dashboard…" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return null;

  const { totals, interviewTrend, resumeHistory, strongSkills, weakSkills, jdHistory } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Performance Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your interview progress, resume history, and skill trends.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/resume')}>
            Upload resume
          </Button>
          <Button onClick={() => navigate('/interview')}>Start interview</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Resumes analysed" value={totals.resumes} />
        <StatCard label="Interviews completed" value={totals.interviews} />
        <StatCard label="Avg resume score" value={`${totals.avgResumeScore}/100`} />
        <StatCard label="Avg interview score" value={`${totals.avgInterviewScore}/100`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Interview score trend" subtitle="Most recent interviews" />
          {interviewTrend.length === 0 ? (
            <p className="text-sm text-slate-500">
              No interviews yet. <button onClick={() => navigate('/interview')} className="text-brand-600 hover:text-brand-700 font-medium">Start one →</button>
            </p>
          ) : (
            <div className="space-y-3">
              {interviewTrend.map((p) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{formatDate(p.date)}</span>
                    <span className="text-slate-700 font-medium">{p.score}/100</span>
                  </div>
                  <ProgressBar value={p.score} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Resume score history" />
          {resumeHistory.length === 0 ? (
            <p className="text-sm text-slate-500">Upload your first resume to see history.</p>
          ) : (
            <div className="space-y-3">
              {resumeHistory.map((r) => (
                <div key={r.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 truncate pr-2">{r.name}</span>
                    <span className="text-slate-700 font-medium">{r.score}/100</span>
                  </div>
                  <ProgressBar value={r.score} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Strong skill areas" subtitle="Avg ≥ 70% in interviews" />
          {strongSkills.length === 0 ? (
            <p className="text-sm text-slate-500">Complete more interviews to see strong areas.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {strongSkills.map((s) => (
                <Badge key={s.skill} tone="green" className="capitalize">
                  {s.skill} · {s.average}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Weak skill areas" subtitle="Avg < 50% in interviews" />
          {weakSkills.length === 0 ? (
            <p className="text-sm text-slate-500">Great — no major weak areas detected.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {weakSkills.map((s) => (
                <Badge key={s.skill} tone="rose" className="capitalize">
                  {s.skill} · {s.average}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent interview history" />
        {jdHistory.length === 0 ? (
          <p className="text-sm text-slate-500">No interviews yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {jdHistory.map((row) => (
              <li key={row.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {row.jd?.title || 'Interview'}
                    {row.jd?.company ? ` @ ${row.jd.company}` : ''}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(row.date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <ScoreBadge score={row.score} />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/interview/${row.id}/result`)}
                  >
                    View
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <Card padding="p-5">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value ?? 0}</p>
    </Card>
  );
}
