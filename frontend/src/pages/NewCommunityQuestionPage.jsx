import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { communityApi } from '../api/endpoints';
import Card, { CardHeader } from '../components/common/Card';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import Button from '../components/common/Button';

const ROUND_OPTIONS = [
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioural' },
  { value: 'hr', label: 'HR' },
  { value: 'coding', label: 'Coding' },
  { value: 'system-design', label: 'System Design' },
  { value: 'general', label: 'General' },
];

export default function NewCommunityQuestionPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    company: '',
    role: '',
    roundType: 'technical',
    questionsText: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.company.trim()) e.company = 'Company is required';
    if (!form.role.trim()) e.role = 'Role is required';
    const lines = form.questionsText
      .split(/\r?\n/)
      .map((q) => q.trim())
      .filter((q) => q.length > 0);
    if (lines.length === 0) e.questionsText = 'Add at least one question';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await communityApi.create({
        company: form.company.trim(),
        role: form.role.trim(),
        roundType: form.roundType,
        questionsText: form.questionsText,
      });
      toast.success('Thanks for contributing!');
      navigate('/community-questions');
    } catch (err) {
      toast.error(err.message || 'Could not submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader
          title="Contribute Interview Questions"
          subtitle="Share one interview round at a time — company, role, round type, and the questions you were asked."
        />
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company *"
              name="company"
              value={form.company}
              onChange={onChange}
              error={errors.company}
              placeholder="e.g. Google"
            />
            <Input
              label="Role *"
              name="role"
              value={form.role}
              onChange={onChange}
              error={errors.role}
              placeholder="e.g. Senior Backend Engineer"
            />
          </div>

          <div>
            <label htmlFor="roundType" className="label">Round type</label>
            <select
              id="roundType"
              name="roundType"
              value={form.roundType}
              onChange={onChange}
              className="input"
            >
              {ROUND_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <Textarea
            label="Questions *"
            name="questionsText"
            value={form.questionsText}
            onChange={onChange}
            error={errors.questionsText}
            rows={10}
            placeholder={'One question per line, e.g.\nHow would you design a URL shortener?\nExplain the CAP theorem in your own words.\nDescribe a time you handled a production incident.'}
          />

          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Submit
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
