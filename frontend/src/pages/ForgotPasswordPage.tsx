import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Email } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await resetPassword(email);
      setMessage('Check your inbox for a secure reset link.');
    } catch (err) {
      console.error('Password reset error:', err);
      setError('We could not send the reset email. Please verify the address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/wanderer.jpg)',
          zIndex: 1,
          transform: 'scale(1.25)',
          filter: 'grayscale(0.3)',
        }}
      />

      <div
        className="fixed inset-0"
        style={{ zIndex: 2, backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
      />

      <div className="relative min-h-screen flex items-center justify-center px-4" style={{ zIndex: 3 }}>
        <div className="max-w-5xl w-full mx-auto px-6 py-16 grid gap-12 lg:grid-cols-2 items-center rounded-3xl">
          <div className="text-white space-y-6 rounded-3xl">
            <p className="text-sm uppercase tracking-[0.4em] text-white">Logos Project</p>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              Forgotten password, familiar journey.
            </h1>
            <p className="text-lg text-white">
              Reclaim access to your conversations with the thinkers who guide you. We will send a secure link to help you reset your password and continue the dialogue.
            </p>
            <div className="flex items-center space-x-3 text-white">
              <span className="h-px flex-1 bg-white" />
              <span className="text-xs tracking-[0.45em] uppercase">Remembering</span>
              <span className="h-px flex-1 bg-white" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-900">Reset Password</h2>
              <p className="text-gray-600">
                Tell us where to send the reset link and we will meet you back inside Logos.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Email className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {message && (
                <div className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg">
                  {message}
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <p className="text-sm text-center text-gray-500">
                Remembered your password?{' '}
                <Link to="/login" className="text-gray-900 font-medium hover:underline">
                  Return to login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
