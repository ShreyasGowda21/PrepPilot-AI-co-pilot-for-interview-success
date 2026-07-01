import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import { FullPageLoader } from '../components/common/Loader';
import useAuth from '../hooks/useAuth';

import Landing from '../pages/Landing.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import ResumePage from '../pages/ResumePage.jsx';
import JDListPage from '../pages/JDListPage.jsx';
import JDDetailPage from '../pages/JDDetailPage.jsx';
import NewJDPage from '../pages/NewJDPage.jsx';
import InterviewStartPage from '../pages/InterviewStartPage.jsx';
import InterviewSessionPage from '../pages/InterviewSessionPage.jsx';
import InterviewResultPage from '../pages/InterviewResultPage.jsx';
import CommunityQuestionsPage from '../pages/CommunityQuestionsPage.jsx';
import NewCommunityQuestionPage from '../pages/NewCommunityQuestionPage.jsx';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Landing />;
};

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public read access — sits outside the protected block on purpose. */}
      <Route path="/community-questions" element={<CommunityQuestionsPage />} />

      <Route
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/resume" element={<ResumePage />} />

        <Route path="/job-descriptions" element={<JDListPage />} />
        <Route path="/job-descriptions/new" element={<NewJDPage />} />
        <Route path="/job-descriptions/:id" element={<JDDetailPage />} />

        <Route path="/interview" element={<InterviewStartPage />} />
        <Route path="/interview/:id" element={<InterviewSessionPage />} />
        <Route path="/interview/:id/result" element={<InterviewResultPage />} />

        <Route path="/community-questions/new" element={<NewCommunityQuestionPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
