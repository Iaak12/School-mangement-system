import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import queryClient from './lib/queryClient';
import useAuthStore from './store/authStore';

// Layout
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

// App Pages
import Dashboard from './pages/dashboard/Dashboard';
import StudentsPage from './pages/students/StudentsPage';
import TeachersPage from './pages/teachers/TeachersPage';
import AttendancePage from './pages/attendance/AttendancePage';
import FeesPage from './pages/fees/FeesPage';
import ExamsPage from './pages/exams/ExamsPage';
import HomeworkPage from './pages/homework/HomeworkPage';
import TimetablePage from './pages/timetable/TimetablePage';
import NoticeBoardPage from './pages/notices/NoticeBoardPage';
import MessagesPage from './pages/messages/MessagesPage';
import LibraryPage from './pages/library/LibraryPage';
import TransportPage from './pages/transport/TransportPage';
import HRPage from './pages/hr/HRPage';
import SettingsPage from './pages/settings/SettingsPage';

// 404 & Unauthorized
const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background">
    <div className="text-center animate-fade-in">
      <p className="text-8xl font-black gradient-primary bg-clip-text text-transparent">404</p>
      <h1 className="text-2xl font-bold text-foreground mt-4">Page Not Found</h1>
      <p className="text-muted-foreground mt-2">The page you're looking for doesn't exist.</p>
      <a href="/dashboard" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl gradient-primary text-white font-medium shadow-lg hover:opacity-90">
        Go to Dashboard
      </a>
    </div>
  </div>
);

const Unauthorized = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background">
    <div className="text-center animate-fade-in">
      <p className="text-8xl font-black text-red-500">403</p>
      <h1 className="text-2xl font-bold text-foreground mt-4">Access Denied</h1>
      <p className="text-muted-foreground mt-2">You don't have permission to view this page.</p>
      <a href="/dashboard" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl gradient-primary text-white font-medium shadow-lg hover:opacity-90">
        Go to Dashboard
      </a>
    </div>
  </div>
);

const AuthRedirect = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
          <Route path="/forgot-password" element={<AuthRedirect><ForgotPassword /></AuthRedirect>} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected App Routes */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/students" element={<StudentsPage />} />
            <Route path="/teachers" element={<TeachersPage />} />

            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/fees" element={<FeesPage />} />
            <Route path="/exams" element={<ExamsPage />} />
            <Route path="/homework" element={<HomeworkPage />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/notices" element={<NoticeBoardPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/transport" element={
              <ProtectedRoute roles={['admin', 'principal', 'teacher', 'student', 'parent']}>
                <TransportPage />
              </ProtectedRoute>
            } />
            <Route path="/hr" element={
              <ProtectedRoute roles={['admin', 'principal', 'accountant']}>
                <HRPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default App;
