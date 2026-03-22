import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, AccountCircle, ChatBubbleOutline } from '@mui/icons-material';
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
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
          {showBackButton && (
            <button
              onClick={handleBackClick}
              className="py-2 px-2 md:px-3 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
            >
              <ArrowBack sx={{ fontSize: 20 }} />
            </button>
          )}

          {(title || subtitle) && (
            <div className="min-w-0">
              <h1 className="font-bold text-base md:text-lg text-gray-800 truncate">{title}</h1>
              {subtitle && <p className="text-xs md:text-sm text-gray-600 truncate hidden sm:block">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* User Profile Section */}
        <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
          <button
            onClick={() => navigate('/chats')}
            className="flex items-center space-x-2 py-2 px-2 md:px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChatBubbleOutline sx={{ fontSize: 18 }} />
            <span className="hidden sm:inline">My Chats</span>
          </button>

          {user && (
            <div className="hidden md:flex items-center space-x-2">
              <AccountCircle sx={{ fontSize: 24, color: 'gray' }} />
              <span className="text-sm text-gray-700">{user.name}</span>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="py-2 px-2 md:px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
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
