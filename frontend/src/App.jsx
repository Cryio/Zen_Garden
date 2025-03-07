import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';
import DashboardLayout from './components/DashboardLayout';

// Import dashboard pages
import Overview from './pages/dashboard/overview';
import Garden from './pages/dashboard/garden';
import Habits from './pages/dashboard/habits';
import Calendar from './pages/dashboard/calendar';
import Analytics from './pages/dashboard/analytics';
import Settings from './pages/dashboard/settings';
import Help from './pages/dashboard/help';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="garden" element={<Garden />} />
          <Route path="habits" element={<Habits />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
