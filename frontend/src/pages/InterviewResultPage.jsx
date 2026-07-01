import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { interviewApi } from '../api/endpoints';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge, { ScoreBadge } from '../components/common/Badge';
import { FullPageLoader } from '../components/common/Loader';
import { ErrorState } from '../components/common/States';
import { formatDate, scoreTone } from '../utils/format';

export default function InterviewResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await interviewApi.get(id);
        setInterview(res.interview);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <FullPageLoader label="Building your report…" />;
  if (error) return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  if (!interview) return null;

  const { report } = interview;
  const skillEntries = Object.entries(report?.skillBreakdown || {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Interview Report</h1>
          <p className="text-sm text-slate-500 mt-1">
            Completed {formatDate(interview.completedAt || interview.updatedAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to dashboard
          </Button>
          <Button onClick={() => navigate('/interview')}>
            New interview
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Final score</p>
            <p className={`text-4xl font-bold ${
              scoreTone(interview.finalScore) === 'green'
                ? 'text-emerald-600'
                : scoreTone(interview.finalScore) === 'amber'
                ? 'text-amber-600'
                : 'text-rose-600'
            }`}>
              {interview.finalScore ?? 0}
              <span className="text-base text-slate-400 font-medium">/100</span>
            </p>
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm text-slate-500">
              {interview.questions.filter((q) => q.score != null).length} of{' '}
              {interview.questions.length} questions answered
            </p>
          </div>
          <ScoreBadge score={interview.finalScore} />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Strengths" />
          {report?.strengths?.length ? (
            <ul className="space-y-2 text-sm text-slate-700">
              {report.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-500">No specific strengths captured.</p>}
        </Card>

        <Card>
          <CardHeader title="Areas to improve" />
          {report?.weaknesses?.length ? (
            <ul className="space-y-2 text-sm text-slate-700">
              {report.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-500">No major weaknesses flagged.</p>}
        </Card>
      </div>

      {skillEntries.length > 0 && (
        <Card>
          <CardHeader title="Skill breakdown" subtitle="Based on keywords detected in your answers" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skillEntries.map(([skill, val]) => (
              <div key={skill} className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize text-slate-700">{skill}</span>
                  <Badge tone={scoreTone(val)}>{val}/100</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {report?.recommendations?.length > 0 && (
        <Card>
          <CardHeader title="Recommendations" />
          <ul className="space-y-2 text-sm text-slate-700">
            {report.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card padding="p-0">
        <div className="p-6">
          <CardHeader title="Question-by-question" />
        </div>
        <ul className="divide-y divide-slate-200">
          {interview.questions.map((q, idx) => (
            <li key={idx} className="px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    Q{idx + 1}. {q.text}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge tone="brand" className="capitalize">{q.category}</Badge>
                    <Badge tone="slate" className="capitalize">{q.difficulty}</Badge>
                  </div>
                </div>
                {q.score != null && <ScoreBadge score={q.score} />}
              </div>
              {q.candidateAnswer && (
                <p className="mt-2 text-sm text-slate-600 whitespace-pre-line line-clamp-4">
                  {q.candidateAnswer}
                </p>
              )}
              {q.feedback && (
                <p className="mt-2 text-xs text-slate-500">{q.feedback}</p>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
