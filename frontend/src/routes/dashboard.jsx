import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Overview from '../pages/dashboard/overview';
import Garden from '../pages/dashboard/garden';
import Habits from '../pages/dashboard/habits';
import Analytics from '../pages/dashboard/analytics';
import Settings from '../pages/dashboard/settings';
import Help from '../pages/dashboard/help';
import Pomodoro from '../pages/dashboard/pomodoro';
import ProtectedRoute from '../components/ProtectedRoute';

export default function DashboardRoutes() {
  return (
    <ProtectedRoute>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="garden" element={<Garden />} />
          <Route path="habits" element={<Habits />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="pomodoro" element={<Pomodoro />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
} 