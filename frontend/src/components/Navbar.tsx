import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import Tooltip from '@mui/material/Tooltip';
import ProfileDropdown from './ProfileDropdown';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  // Title mode (selection/chat list pages)
  title?: string;
  titleHref?: string;
  subtitle?: string;

  // Philosopher mode (chat page)
  philosopherName?: string;
  philosopherSubtitle?: string;
  philosopherImage?: string;
  onBackClick?: () => void;
  showHistory?: boolean;
  onHistoryClick?: () => void;

  // Shared
  showProfile?: boolean;
  showChatsButton?: boolean;
  fixed?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  title,
  titleHref = '/',
  subtitle,
  philosopherName,
  philosopherSubtitle,
  philosopherImage,
  onBackClick,
  showHistory = false,
  onHistoryClick,
  showProfile = true,
  showChatsButton = true,
  fixed = false,
}) => {
  const navigate = useNavigate();

  const isTitleMode = !!title;

  return (
    <header className={`${fixed ? 'fixed top-0 w-full z-50' : ''} flex items-center justify-between px-4 md:px-8 py-3 md:py-4 bg-ink-bg/80 backdrop-blur-xl border-b border-ink-outline-variant/15 z-10`}>
      <div className="flex items-center gap-4 md:gap-8 min-w-0">
        {isTitleMode ? (
          /* Title mode */
          <>
            <a href={titleHref} className="text-2xl font-serif text-ink-on-surface italic hover:opacity-80 transition-opacity shrink-0">
              {title}
            </a>
            {subtitle && (
              <span className="font-sans text-2xs uppercase tracking-[0.2em] text-ink-outline hidden sm:inline">{subtitle}</span>
            )}
          </>
        ) : (
          /* Philosopher mode */
          <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
            {onBackClick && (
              <button
                onClick={onBackClick}
                className="hidden md:flex py-2 px-2 md:px-3 text-ink-on-surface-variant hover:text-ink-on-surface hover:bg-ink-surface rounded-xl transition-colors duration-500 shrink-0"
              >
                <ArrowBackIcon sx={{ fontSize: 20 }} />
              </button>
            )}

            {showHistory && (
              <button
                onClick={onHistoryClick}
                className="py-2 px-2 md:px-3 text-ink-on-surface-variant hover:text-ink-on-surface hover:bg-ink-surface rounded-xl transition-colors duration-500 shrink-0"
              >
                <HistoryIcon sx={{ fontSize: 20 }} />
              </button>
            )}

            <div className="h-4 w-[1px] bg-ink-outline-variant/30 shrink-0"></div>

            <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
              {philosopherImage && (
                <div className="hidden md:flex w-10 h-10 rounded-full overflow-hidden bg-ink-surface shrink-0">
                  <img
                    className="h-full w-full rounded-full object-cover"
                    src={philosopherImage}
                    alt={philosopherName}
                  />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-base md:text-xl font-serif text-ink-on-surface italic tracking-tight truncate">{philosopherName}</h1>
                <span className="font-sans text-2xs uppercase tracking-[0.2em] text-ink-outline hidden sm:block">{philosopherSubtitle || 'Session active'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showProfile && (
        <div className="flex items-center gap-3">
          {showChatsButton && (
            <Tooltip title="My chats" arrow placement="bottom">
              <button
                onClick={() => navigate('/chats')}
                className="w-9 h-9 rounded-full flex items-center justify-center text-ink-on-surface-variant hover:text-ink-on-surface hover:bg-ink-surface transition-all duration-300"
              >
                <ChatBubbleOutlineIcon sx={{ fontSize: 20 }} />
              </button>
            </Tooltip>
          )}
          <ThemeToggle />
          <ProfileDropdown />
        </div>
      )}
    </header>
  );
};

export default Navbar;
