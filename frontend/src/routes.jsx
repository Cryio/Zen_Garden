import { Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import LandingPage from './components/LandingPage';
import DashboardRoutes from './routes/dashboard';
import Settings from './pages/dashboard/settings';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import AuthCallback from './pages/AuthCallback';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <Signup />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      } />
      <Route path="/reset-password/:token" element={
        <PublicRoute>
          <ResetPassword />
        </PublicRoute>
      } />
      
      {/* Auth Callback Route */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard/*" element={<DashboardRoutes />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
} 