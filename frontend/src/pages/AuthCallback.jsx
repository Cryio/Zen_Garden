import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    const handleAuth = async () => {
      try {
        if (error) {
          throw new Error(error);
        }

        if (!token) {
          throw new Error('No authentication token received');
        }

        // Store the token securely
        localStorage.setItem('token', token);

        // Set the token in the API instance
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Verify token and fetch user data
        const response = await api.get('/api/auth/me');
        
        if (!response.data) {
          throw new Error('Failed to fetch user data');
        }

        // Show success message
        toast.success('Successfully authenticated with Google');

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('Authentication error:', err);
        // Clear token if authentication failed
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        toast.error(err.message || 'Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    handleAuth();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wax-flower-500 mx-auto mb-4"></div>
        <p className="text-wax-flower-200">Completing authentication...</p>
      </div>
    </div>
  );
} 