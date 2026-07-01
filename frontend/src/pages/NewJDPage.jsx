import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jdApi } from '../api/endpoints';
import Card, { CardHeader } from '../components/common/Card';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import Button from '../components/common/Button';

export default function NewJDPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', company: '', location: '', description: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.description.trim().length < 30) {
      e.description = 'Description must be at least 30 characters';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await jdApi.create(form);
      toast.success('Job description analysed');
      navigate(`/job-descriptions/${res.jd._id}`);
    } catch (err) {
      toast.error(err.message || 'Could not save');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader
          title="New Job Description"
          subtitle="Paste a JD to extract required skills, seniority, and red flags."
        />
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Job title *"
              name="title"
              value={form.title}
              onChange={onChange}
              error={errors.title}
              placeholder="Senior Backend Engineer"
            />
            <Input
              label="Company"
              name="company"
              value={form.company}
              onChange={onChange}
              placeholder="Acme Inc."
            />
          </div>
          <Input
            label="Location"
            name="location"
            value={form.location}
            onChange={onChange}
            placeholder="Remote / Bengaluru / NYC"
          />
          <Textarea
            label="Description *"
            name="description"
            value={form.description}
            onChange={onChange}
            error={errors.description}
            rows={12}
            placeholder="Paste the full job description here…"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Analyse
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
