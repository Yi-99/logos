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
    <div className="flex items-center justify-between p-4 border-b border-gray-100">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBackClick}
          className="py-2 px-3 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </button>
        
        {showHistory && (
          <button 
            onClick={onHistoryClick}
            className="py-2 px-3 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <HistoryIcon sx={{ fontSize: 20 }} />
          </button>
        )}
        
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
          <img
            className="h-full w-full rounded-full"
            src={philosopherImage}
            alt={philosopherName}
          />
        </div>
        
        <div>
          <h1 className="font-bold text-lg">{philosopherName}</h1>
          <p className="text-sm text-gray-600">{philosopherSubtitle}</p>
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
