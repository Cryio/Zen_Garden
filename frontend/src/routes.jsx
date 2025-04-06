import { Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';
import LandingPage from './components/LandingPage';
import DashboardRoutes from './routes/dashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard/*" element={<DashboardRoutes />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
} 