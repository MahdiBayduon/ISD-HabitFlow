import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { Navigate, Link } from 'react-router';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/react-app/hooks/useApi';

export default function AuthCallback() {
  const { user, fetchUser } = useAuth();
  const [error, setError] = useState('');
  const exchange = useRef<Promise<void> | null>(null);
  useEffect(() => {
    // Reuse the exchange in StrictMode; OAuth codes must not be exchanged twice.
    if (!exchange.current) {
      exchange.current = (async () => {
        const code = new URLSearchParams(window.location.search).get('code');
        if (!code) throw new Error('The sign-in link is missing its authorization code.');
        await apiRequest('/api/sessions', {
          method: 'POST', body: JSON.stringify({ code }), signal: AbortSignal.timeout(20000),
        });
        await fetchUser();
      })();
    }
    let active = true;
    exchange.current.catch((failure: unknown) => {
      if (active) setError(failure instanceof Error ? failure.message : 'Sign in failed. Please try again.');
    });
    return () => { active = false; };
  }, [fetchUser]);
  if (user) return <Navigate to="/dashboard" replace />;
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 p-6">
    <div className="text-center max-w-md">
      {error ? <><h1 className="text-2xl font-semibold text-gray-900 mb-4">Sign in could not finish</h1><p role="alert" className="text-red-700 mb-6">{error}</p><Link to="/" className="text-indigo-700 underline">Return home and try again</Link></>
        : <><Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-indigo-600" /><h1 className="text-2xl font-semibold text-gray-900 mb-2">Completing your sign in...</h1><p role="status" className="text-gray-600">Please wait while we set up your session.</p></>}
    </div>
  </div>;
}
