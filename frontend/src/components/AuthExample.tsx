import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthExample: React.FC = () => {
  const { user, isAuthenticated, loginTime, sessionDuration, login, logout } = useAuth();

  const handleLogin = () => {
    login({
      id: '123',
      email: 'user@example.com',
      name: 'John Doe',
      createdAt: new Date().toISOString()
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Not logged in';
    return date.toLocaleString();
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Auth Context Example</h3>
      
      {isAuthenticated ? (
        <div className="space-y-2">
          <p><strong>Welcome, {user?.name}!</strong></p>
          <p>Email: {user?.email}</p>
          <p>User ID: {user?.id}</p>
          <p>Login Time: {formatTime(loginTime)}</p>
          <p>Session Duration: {formatDuration(sessionDuration)}</p>
          <p>Last Login: {user?.lastLoginAt ? formatTime(new Date(user.lastLoginAt)) : 'N/A'}</p>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p>Not logged in</p>
          <button 
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login as Demo User
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthExample;
