import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jdApi, interviewApi } from '../api/endpoints';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import useApi from '../hooks/useApi';
import { EmptyState, ErrorState } from '../components/common/States';
import { FullPageLoader } from '../components/common/Loader';

const DEFAULT_QUESTIONS = 6;

export default function InterviewStartPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const presetJdId = params.get('jdId') || '';
  const { data, loading, error, refetch } = useApi(() => jdApi.list().then((r) => r.jds));
  const [jdId, setJdId] = useState(presetJdId);
  const [numQuestions, setNumQuestions] = useState(DEFAULT_QUESTIONS);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (presetJdId) setJdId(presetJdId);
  }, [presetJdId]);

  const start = async () => {
    if (!jdId) {
      toast.error('Please select a job description');
      return;
    }
    setSubmitting(true);
    try {
      const res = await interviewApi.start({ jdId, numQuestions });
      toast.success('Interview ready');
      navigate(`/interview/${res.interview._id}`);
    } catch (err) {
      toast.error(err.message || 'Could not start interview');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <FullPageLoader label="Loading job descriptions…" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader
          title="Start a mock interview"
          subtitle="Pick a job description and we'll generate questions tailored to it."
        />

        {!data || data.length === 0 ? (
          <EmptyState
            title="No job descriptions"
            description="Create a job description first to generate tailored questions."
            action={
              <Button onClick={() => navigate('/job-descriptions/new')}>
                + Create JD
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label">Job description</label>
              <select
                value={jdId}
                onChange={(e) => setJdId(e.target.value)}
                className="input"
              >
                <option value="">— Select a JD —</option>
                {data.map((jd) => (
                  <option key={jd._id} value={jd._id}>
                    {jd.title}
                    {jd.company ? ` @ ${jd.company}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Number of questions</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-slate-700 w-10 text-right">
                  {numQuestions}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Between 3 and 12 questions.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={start} loading={submitting}>
                Start interview
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
