import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../contexts/AuthContext';

const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
	const { user, signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleHomeClick = () => {
    navigate('/');
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setIsOpen(false);
  };

  const handleLogoutClick = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsOpen(false);
  };

  if (!user) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-ink-primary flex items-center justify-center text-ink-on-primary transition-all duration-200"
      >
        <span className="text-sm font-bold">
          {getInitials(user.name)}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-ink-bg rounded-lg shadow-xl border border-ink-outline-variant/20 py-2 z-50">
          <div className="px-4 py-3 border-b border-ink-outline-variant/15">
            <p className="text-sm font-medium text-ink-on-surface">{user.name}</p>
            <p className="text-xs text-ink-on-surface-variant">{user.email}</p>
          </div>

          <div className="py-1">
            <button
              onClick={handleHomeClick}
              className="w-full flex items-center px-4 py-2 text-sm text-ink-on-surface-variant hover:bg-ink-surface hover:text-ink-on-surface transition-colors"
            >
              <HomeIcon sx={{ fontSize: 16 }} className="mr-3" />
              Home
            </button>

            <button
              onClick={handleSettingsClick}
              className="w-full flex items-center px-4 py-2 text-sm text-ink-on-surface-variant hover:bg-ink-surface hover:text-ink-on-surface transition-colors"
            >
              <SettingsIcon sx={{ fontSize: 16 }} className="mr-3" />
              Settings
            </button>

            <div className="border-t border-ink-outline-variant/15 my-1"></div>

            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <LogoutIcon sx={{ fontSize: 16 }} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
