import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jdApi, resumeApi } from '../api/endpoints';
import Card, { CardHeader } from '../components/common/Card';
import Badge, { ScoreBadge } from '../components/common/Badge';
import Button from '../components/common/Button';
import { FullPageLoader } from '../components/common/Loader';
import { ErrorState } from '../components/common/States';
import useApi from '../hooks/useApi';
import { formatDate } from '../utils/format';

export default function JDDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useApi(() => jdApi.get(id).then((r) => r.jd));
  const resumes = useApi(() => resumeApi.list().then((r) => r.resumes));
  const [matching, setMatching] = useState(false);
  const [match, setMatch] = useState(null);

  const onMatch = async (resumeId) => {
    setMatching(true);
    setMatch(null);
    try {
      const res = await jdApi.matchToResume(id, resumeId);
      setMatch(res.match);
    } catch (err) {
      toast.error(err.message || 'Match failed');
    } finally {
      setMatching(false);
    }
  };

  if (loading) return <FullPageLoader label="Loading JD…" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{data.title}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {data.company || 'Unknown company'}
            {data.location ? ` • ${data.location}` : ''} • {formatDate(data.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/job-descriptions')}>
            Back
          </Button>
          <Button onClick={() => navigate(`/interview?jdId=${data._id}`)}>
            Start mock interview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Summary" />
            <p className="text-sm text-slate-700 whitespace-pre-line">{data.summary || data.description}</p>
          </Card>

          <Card>
            <CardHeader title="Required skills" subtitle="Mentioned in responsibilities / requirements" />
            <div className="flex flex-wrap gap-2">
              {data.requiredSkills?.length ? (
                data.requiredSkills.map((s) => (
                  <Badge key={s} tone="brand" className="capitalize">{s}</Badge>
                ))
              ) : (
                <span className="text-sm text-slate-500">No specific skills detected.</span>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Nice to have" />
            <div className="flex flex-wrap gap-2">
              {data.niceToHaveSkills?.length ? (
                data.niceToHaveSkills.map((s) => (
                  <Badge key={s} tone="slate" className="capitalize">{s}</Badge>
                ))
              ) : (
                <span className="text-sm text-slate-500">—</span>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Profile" />
            <dl className="text-sm space-y-2">
              <div className="flex justify-between"><dt className="text-slate-500">Seniority</dt><dd className="capitalize">{data.seniority}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Experience</dt><dd>{data.experienceYears ? `${data.experienceYears}+ yrs` : '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Word count</dt><dd>{data.wordCount}</dd></div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Red flags" />
            {data.redFlags?.length ? (
              <ul className="space-y-2">
                {data.redFlags.map((f, i) => (
                  <li key={i} className="text-sm text-rose-700 flex items-start gap-2">
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-emerald-700">No red flags detected. 🎉</p>
            )}
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Match against your resumes"
          subtitle="See how well each of your stored resumes fits this JD."
        />
        {resumes.loading ? (
          <p className="text-sm text-slate-500">Loading resumes…</p>
        ) : !resumes.data || resumes.data.length === 0 ? (
          <p className="text-sm text-slate-500">
            Upload a resume on the <a className="text-brand-600 hover:text-brand-700 font-medium" href="/resume">Resume page</a> first.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resumes.data.map((r) => (
              <div key={r._id} className="border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{r.originalName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Resume score: <ScoreBadge score={r.overallScore} />
                  </p>
                </div>
                <Button size="sm" onClick={() => onMatch(r._id)} loading={matching}>
                  Match
                </Button>
              </div>
            ))}
          </div>
        )}

        {match && (
          <div className="mt-5 border-t border-slate-200 pt-5">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-slate-900">Match result</h3>
              <ScoreBadge score={match.matchScore} />
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-slate-800">Matched required skills</h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {match.matchedRequired?.length ? (
                    match.matchedRequired.map((s) => (
                      <Badge key={s} tone="green" className="capitalize">{s}</Badge>
                    ))
                  ) : <span className="text-slate-500">None</span>}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-slate-800">Missing required skills</h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {match.missingRequired?.length ? (
                    match.missingRequired.map((s) => (
                      <Badge key={s} tone="rose" className="capitalize">{s}</Badge>
                    ))
                  ) : <span className="text-slate-500">Nothing missing</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
