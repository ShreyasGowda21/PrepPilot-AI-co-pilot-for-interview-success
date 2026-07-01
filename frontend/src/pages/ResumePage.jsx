import { useState } from 'react';
import toast from 'react-hot-toast';
import { resumeApi } from '../api/endpoints';
import useApi from '../hooks/useApi';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge, { ScoreBadge } from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import { EmptyState, ErrorState } from '../components/common/States';
import { FullPageLoader } from '../components/common/Loader';
import { formatDate, formatScore } from '../utils/format';

const ACCEPTED = 'application/pdf';

export default function ResumePage() {
  const { data, loading, error, refetch, setData } = useApi(() => resumeApi.list().then((r) => r.resumes));
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [latest, setLatest] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.type !== ACCEPTED) {
      toast.error('Only PDF files are accepted');
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const res = await resumeApi.upload(file, (ev) => {
        if (ev.total) setProgress(Math.round((ev.loaded * 100) / ev.total));
      });
      toast.success('Resume analysed');
      setLatest(res.resume);
      setData((cur) => (cur ? [res.resume, ...cur] : [res.resume]));
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    try {
      await resumeApi.remove(id);
      toast.success('Resume deleted');
      setData((cur) => (cur || []).filter((r) => r._id !== id));
      if (latest?._id === id) setLatest(null);
    } catch (err) {
      toast.error(err.message || 'Could not delete');
    }
  };

  if (loading) return <FullPageLoader label="Loading resumes…" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Resume Analyser</h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload a PDF resume to extract skills, score it out of 100, and identify weak sections.
          </p>
        </div>
        <UploadControl onUpload={handleUpload} uploading={uploading} progress={progress} />
      </div>

      {latest && <LatestResult resume={latest} />}

      <Card padding="p-0">
        <div className="p-6">
          <CardHeader
            title="Your resumes"
            subtitle={`${data?.length || 0} analysed`}
          />
        </div>
        {!data || data.length === 0 ? (
          <div className="p-6 pt-0">
            <EmptyState
              title="No resumes yet"
              description="Upload your first PDF to get a score and feedback."
            />
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {data.map((r) => (
              <li key={r._id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{r.originalName}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(r.createdAt)} • {r.wordCount} words
                  </p>
                </div>
                <ScoreBadge score={r.overallScore} />
                <div className="w-32">
                  <ProgressBar value={r.overallScore} />
                </div>
                <Button variant="secondary" size="sm" onClick={() => handleDelete(r._id)}>
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function UploadControl({ onUpload, uploading, progress }) {
  return (
    <label className="btn-primary cursor-pointer">
      <input
        type="file"
        accept="application/pdf,.pdf"
        onChange={onUpload}
        className="hidden"
        disabled={uploading}
      />
      {uploading ? (
        <>
          <span className="h-3.5 w-3.5 border-2 border-current border-r-transparent rounded-full animate-spin" />
          Uploading {progress}%
        </>
      ) : (
        <>Upload PDF resume</>
      )}
    </label>
  );
}

function LatestResult({ resume }) {
  return (
    <Card>
      <CardHeader
        title="Latest analysis"
        subtitle={resume.originalName}
        action={<ScoreBadge score={resume.overallScore} />}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Section breakdown</h3>
          <div className="space-y-3">
            {resume.sections?.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize text-slate-700">{s.name}</span>
                  <span className="text-slate-500">{formatScore(s.score)}</span>
                </div>
                <ProgressBar value={s.score} />
                <p className="text-xs text-slate-500 mt-1">{s.feedback}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Suggestions</h3>
          {resume.suggestions?.length ? (
            <ul className="space-y-2">
              {resume.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No suggestions — looking good.</p>
          )}

          {resume.weakSections?.length > 0 && (
            <div className="mt-5">
              <h4 className="text-sm font-semibold text-slate-800 mb-2">Weak sections</h4>
              <div className="flex flex-wrap gap-2">
                {resume.weakSections.map((w) => (
                  <Badge key={w} tone="rose" className="capitalize">
                    {w}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {resume.detectedSkills?.length > 0 && (
            <div className="mt-5">
              <h4 className="text-sm font-semibold text-slate-800 mb-2">Detected skills</h4>
              <div className="flex flex-wrap gap-2">
                {resume.detectedSkills.map((s) => (
                  <Badge key={s} tone="brand" className="capitalize">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
