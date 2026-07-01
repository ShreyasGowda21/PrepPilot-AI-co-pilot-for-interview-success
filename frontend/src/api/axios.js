// Centralised axios instance. The browser carries the auth cookie automatically;
// we just need `withCredentials: true` so cross-origin requests in production
// still send it. Surfaces server errors as normalised Error objects.
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 60000,
});

export const extractError = (err) => {
  if (err?.response) {
    const { data, status } = err.response;
    const message = data?.message || err.message || 'Request failed';
    const errors = data?.errors || [];
    const e = new Error(message);
    e.status = status;
    e.errors = errors;
    e.payload = data;
    return e;
  }
  return new Error(err?.message || 'Network error');
};

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(extractError(err))
);

export default api;
