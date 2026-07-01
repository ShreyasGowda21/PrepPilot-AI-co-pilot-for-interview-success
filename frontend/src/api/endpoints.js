// Thin wrappers around the REST API so components don't repeat paths.
import api from './axios';

// Backend wraps every response in ApiResponse: { success, statusCode, message, data }.
// `res.data` is that wrapper, so we unwrap one more level to expose `data` to callers.
const unwrap = (res) => res.data?.data ?? res.data;

export const authApi = {
  register: (payload) => api.post('/auth/register', payload).then(unwrap),
  login: (payload) => api.post('/auth/login', payload).then(unwrap),
  logout: () => api.post('/auth/logout').then(unwrap),
  me: () => api.get('/auth/me').then(unwrap),
};

export const resumeApi = {
  upload: (file, onUploadProgress) => {
    const fd = new FormData();
    fd.append('resume', file);
    return api
      .post('/resumes/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      })
      .then(unwrap);
  },
  list: () => api.get('/resumes').then(unwrap),
  get: (id) => api.get(`/resumes/${id}`).then(unwrap),
  matchToJd: (id, jdId) => api.post(`/resumes/${id}/match`, { jdId }).then(unwrap),
  remove: (id) => api.delete(`/resumes/${id}`).then(unwrap),
};

export const jdApi = {
  create: (payload) => api.post('/job-descriptions', payload).then(unwrap),
  list: () => api.get('/job-descriptions').then(unwrap),
  get: (id) => api.get(`/job-descriptions/${id}`).then(unwrap),
  matchToResume: (id, resumeId) =>
    api.post(`/job-descriptions/${id}/match`, { resumeId }).then(unwrap),
  remove: (id) => api.delete(`/job-descriptions/${id}`).then(unwrap),
};

export const interviewApi = {
  start: (payload) => api.post('/interviews/start', payload).then(unwrap),
  list: () => api.get('/interviews').then(unwrap),
  get: (id) => api.get(`/interviews/${id}`).then(unwrap),
  answer: (id, payload) => api.post(`/interviews/${id}/answer`, payload).then(unwrap),
  complete: (id) => api.post(`/interviews/${id}/complete`).then(unwrap),
  abandon: (id) => api.post(`/interviews/${id}/abandon`).then(unwrap),
};

export const dashboardApi = {
  get: () => api.get('/dashboard').then(unwrap),
};

export const communityApi = {
  // q is optional — server does the case-insensitive regex on company/role/text.
  // Response shape: { items: [...] } (kept consistent with the other list endpoints).
  // Routes through `unwrap` like the other endpoints so we read from
  // `res.data.data` (the ApiResponse envelope), not `res.data` itself.
  list: (q) =>
    api
      .get('/community-questions', { params: q ? { q } : undefined })
      .then(unwrap)
      .then((r) => ({ items: r?.items ?? [] })),
  get: (id) => api.get(`/community-questions/${id}`).then(unwrap).then((r) => ({ item: r?.item })),
  // questionsText is a single textarea payload; the server splits on newlines
  // so the client doesn't have to manage a dynamic list of inputs.
  create: (payload) =>
    api.post('/community-questions', payload).then(unwrap).then((r) => ({ item: r?.item })),
  remove: (id) => api.delete(`/community-questions/${id}`).then(unwrap),
};
