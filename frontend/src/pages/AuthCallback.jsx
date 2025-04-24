import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toastShown = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const wasExistingAccount = searchParams.get('wasExistingAccount') === 'true';

    if (error) {
      toast.error('Authentication failed. Please try again.');
      navigate('/login');
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      if (wasExistingAccount && !toastShown.current) {
        toast.success('Your Google account has been linked to your existing account');
        toastShown.current = true;
      }
      navigate('/dashboard');
    } else {
      toast.error('No token received');
      navigate('/login');
    }
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