import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import ProfileDropdown from './ProfileDropdown';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  philosopherName: string;
  philosopherSubtitle: string;
  philosopherImage: string;
  onBackClick: () => void;
  showHistory?: boolean;
  onHistoryClick?: () => void;
  showProfile?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  philosopherName,
  philosopherSubtitle,
  philosopherImage,
  onBackClick,
  showHistory = true,
  onHistoryClick,
  showProfile = false
}) => {
  return (
    <div className="flex items-center justify-between px-6 md:px-12 py-5 bg-ink-bg/80 backdrop-blur-xl border-b border-ink-outline-variant/15 z-10">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBackClick}
          className="py-2 px-3 text-ink-on-surface-variant hover:text-ink-on-surface hover:bg-ink-surface rounded-xl transition-colors duration-500"
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </button>

        {showHistory && (
          <button
            onClick={onHistoryClick}
            className="py-2 px-3 text-ink-on-surface-variant hover:text-ink-on-surface hover:bg-ink-surface rounded-xl transition-colors duration-500"
          >
            <HistoryIcon sx={{ fontSize: 20 }} />
          </button>
        )}

        <div className="h-4 w-[1px] bg-ink-outline-variant/30"></div>

        <div className="flex items-center space-x-4">
          {philosopherImage && (
            <div className="w-10 h-10 rounded-full overflow-hidden bg-ink-surface">
              <img
                className="h-full w-full rounded-full object-cover"
                src={philosopherImage}
                alt={philosopherName}
              />
            </div>
          )}
          <div>
            <h1 className="text-xl font-serif text-ink-on-surface italic tracking-tight">{philosopherName}</h1>
            <span className="font-sans text-2xs uppercase tracking-[0.2em] text-ink-outline">{philosopherSubtitle || 'Session active'}</span>
          </div>
        </div>
      </div>

      {/* Right side controls */}
      {showProfile && (
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <ProfileDropdown />
        </div>
      )}
    </div>
  );
};

export default Navbar;
