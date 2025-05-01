import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthToken, fetchUserData } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const returnTo = searchParams.get('returnTo') || '/dashboard';

    const handleAuth = async () => {
      try {
        if (error) {
          throw new Error(error);
        }

        if (!token) {
          throw new Error('No authentication token received');
        }

        // Set the auth token which will update localStorage and API headers
        setAuthToken(token);

        // Fetch and set the user data
        await fetchUserData();

        // Show success message
        toast.success('Successfully authenticated with Google');

        // Redirect to the returnTo URL or dashboard
        navigate(returnTo);
      } catch (err) {
        console.error('Authentication error:', err);
        // Clear token if authentication failed
        setAuthToken(null);
        toast.error(err.message || 'Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    handleAuth();
  }, [searchParams, navigate, setAuthToken, fetchUserData]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wax-flower-500 mx-auto mb-4"></div>
        <p className="text-wax-flower-200">Completing authentication...</p>
      </div>
    </div>
  );
} 