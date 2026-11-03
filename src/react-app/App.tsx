import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router';
import { AuthProvider } from '@getmocha/users-service/react';
import { ThemeProvider } from '@/react-app/hooks/useTheme';
import Layout from '@/react-app/components/Layout';
import ProtectedRoute from '@/react-app/components/ProtectedRoute';

const Home = lazy(() => import('@/react-app/pages/Home'));
const AuthCallback = lazy(() => import('@/react-app/pages/AuthCallback'));
const Dashboard = lazy(() => import('@/react-app/pages/Dashboard'));
const Habits = lazy(() => import('@/react-app/pages/Habits'));
const Analytics = lazy(() => import('@/react-app/pages/Analytics'));
const Journal = lazy(() => import('@/react-app/pages/Journal'));
const Community = lazy(() => import('@/react-app/pages/Community'));
const AICoach = lazy(() => import('@/react-app/pages/AICoach'));
const Settings = lazy(() => import('@/react-app/pages/Settings'));

export default function App() {
  return <ThemeProvider><AuthProvider><BrowserRouter>
    <Suspense fallback={<p role="status" className="p-8 text-gray-600 dark:text-gray-300">Loading HabitFlow…</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route element={<ProtectedRoute><Layout><Outlet /></Layout></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/community" element={<Community />} />
          <Route path="/ai-coach" element={<AICoach />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter></AuthProvider></ThemeProvider>;
}
