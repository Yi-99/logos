import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, AccountCircle } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backPath?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = "Logos", 
  subtitle,
  showBackButton = true,
  backPath = '/'
}) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleBackClick = () => {
    navigate(backPath);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <button 
              onClick={handleBackClick}
              className="py-2 px-3 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowBack sx={{ fontSize: 20 }} />
            </button>
          )}
          
          {(title || subtitle) && (
            <div>
              <h1 className="font-bold text-lg text-gray-800">{title}</h1>
              {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            </div>
          )}
        </div>
        
        {/* User Profile Section */}
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2">
              <AccountCircle sx={{ fontSize: 24, color: 'gray' }} />
              <span className="text-sm text-gray-700">{user.name}</span>
            </div>
          )}
          
          <button 
            onClick={handleSignOut}
            className="py-2 px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div>
        {children}
      </div>
    </div>
  );
};

export default Layout;
