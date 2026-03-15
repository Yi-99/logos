import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { handleOAuthCallback } from '@/lib/cognito';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      setError('No authorization code found.');
      return;
    }

    handleOAuthCallback(code)
      .then((user) => {
        login({
          id: user.id,
          email: user.email,
          name: user.name,
          lastLoginAt: new Date().toISOString(),
        });
        navigate('/chats');
      })
      .catch((err) => {
        console.error('OAuth callback error:', err);
        setError('Authentication failed. Please try again.');
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Signing you in...</p>
    </div>
  );
};

export default AuthCallbackPage;
