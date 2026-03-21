import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import ProfileDropdown from './ProfileDropdown';

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
    <div className="flex items-center justify-between px-6 md:px-12 py-5 bg-[#0e0e0e]/80 backdrop-blur-xl border-b border-[#484848]/15 z-10">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBackClick}
          className="py-2 px-3 text-[#acabaa] hover:text-[#e7e5e5] hover:bg-[#191a1a] rounded-xl transition-colors duration-500"
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </button>

        {showHistory && (
          <button
            onClick={onHistoryClick}
            className="py-2 px-3 text-[#acabaa] hover:text-[#e7e5e5] hover:bg-[#191a1a] rounded-xl transition-colors duration-500"
          >
            <HistoryIcon sx={{ fontSize: 20 }} />
          </button>
        )}

        <div className="h-4 w-[1px] bg-[#484848]/30"></div>

        <div className="flex items-center space-x-4">
          {philosopherImage && (
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#191a1a]">
              <img
                className="h-full w-full rounded-full object-cover grayscale opacity-80"
                src={philosopherImage}
                alt={philosopherName}
              />
            </div>
          )}
          <div>
            <h1 className="text-xl font-['Newsreader'] text-[#e7e5e5] italic tracking-tight">{philosopherName}</h1>
            <span className="font-['Inter'] text-[10px] uppercase tracking-[0.2em] text-[#767575]">{philosopherSubtitle || 'Session active'}</span>
          </div>
        </div>
      </div>

      {/* Profile Dropdown */}
      {showProfile && (
        <ProfileDropdown />
      )}
    </div>
  );
};

export default Navbar;
