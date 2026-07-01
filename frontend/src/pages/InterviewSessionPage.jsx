import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { interviewApi } from '../api/endpoints';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Textarea from '../components/common/Textarea';
import Badge, { ScoreBadge } from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import { FullPageLoader } from '../components/common/Loader';
import { ErrorState } from '../components/common/States';

export default function InterviewSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [result, setResult] = useState(null);

  const fetchInterview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await interviewApi.get(id);
      setInterview(res.interview);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const current = useMemo(() => {
    if (!interview) return null;
    return interview.questions[interview.currentIndex] || null;
  }, [interview]);

  const progress = useMemo(() => {
    if (!interview) return 0;
    return Math.round((interview.currentIndex / interview.questions.length) * 100);
  }, [interview]);

  const submit = async () => {
    if (!answer.trim()) {
      toast.error('Please type an answer first');
      return;
    }
    setSubmitting(true);
    try {
      const res = await interviewApi.answer(id, {
        questionIndex: interview.currentIndex,
        answer,
      });
      setInterview(res.interview);
      setResult(res.result);
      setAnswer('');
    } catch (err) {
      toast.error(err.message || 'Could not submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const complete = async () => {
    setCompleting(true);
    try {
      await interviewApi.complete(id);
      navigate(`/interview/${id}/result`);
    } catch (err) {
      toast.error(err.message || 'Could not complete');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <FullPageLoader label="Loading interview…" />;
  if (error) return <ErrorState error={error} onRetry={fetchInterview} />;
  if (!interview) return null;

  if (interview.status === 'completed') {
    return (
      <div className="max-w-xl mx-auto">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Interview complete</h2>
          <p className="mt-1 text-sm text-slate-500">
            You scored <ScoreBadge score={interview.finalScore} />. View your full report.
          </p>
          <div className="mt-4">
            <Button onClick={() => navigate(`/interview/${interview._id}/result`)}>
              View report
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="max-w-xl mx-auto">
        <Card>
          <p className="text-sm text-slate-700">All questions answered. Ready to finish?</p>
          <div className="mt-4">
            <Button onClick={complete} loading={completing}>
              Generate final report
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>
            Question {interview.currentIndex + 1} of {interview.questions.length}
          </span>
          <span>{progress}% complete</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-2">
          <Badge tone="brand" className="capitalize">{current.category}</Badge>
          <Badge tone="slate" className="capitalize">{current.difficulty}</Badge>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900">{current.text}</h2>

        <div className="mt-5">
          <Textarea
            label="Your answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={8}
            placeholder="Take your time — describe your approach, give examples, and quantify impact where possible."
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={async () => {
              if (!confirm('Abandon this interview? Your progress will be lost.')) return;
              try {
                await interviewApi.abandon(id);
                navigate('/dashboard');
              } catch (err) {
                toast.error(err.message || 'Could not abandon');
              }
            }}
          >
            Abandon
          </Button>
          <Button onClick={submit} loading={submitting}>
            {interview.currentIndex === interview.questions.length - 1
              ? 'Submit & finish'
              : 'Submit & next'}
          </Button>
        </div>
      </Card>

      {result && (
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <ScoreBadge score={result.score} label="Answer score" />
            <span className="text-xs text-slate-500">Recorded just now</span>
          </div>
          <p className="text-sm text-slate-700">{result.feedback}</p>
          {(result.strengths?.length || 0) > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold uppercase text-emerald-700">Strengths</h4>
              <ul className="mt-1 text-sm text-slate-700 list-disc pl-5 space-y-0.5">
                {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {(result.weaknesses?.length || 0) > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold uppercase text-rose-700">To improve</h4>
              <ul className="mt-1 text-sm text-slate-700 list-disc pl-5 space-y-0.5">
                {result.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            {interview.currentIndex < interview.questions.length - 1 ? (
              <Button onClick={() => setResult(null)}>Next question</Button>
            ) : (
              <Button onClick={complete} loading={completing}>
                Generate final report
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
