import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCheck = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;

    // If there's no token and we're not on login/signup, redirect to login
    if (!token && !['/login', '/signup'].includes(currentPath)) {
      navigate('/login');
    }
  }, [navigate]);

  return children;
};

export default AuthCheck; 