import React, { useState, useEffect } from 'react';
import Tooltip from '@mui/material/Tooltip';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Swap favicon to match theme
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = isDark ? '/logo-dark.jpg' : '/logo-light.jpg';
    }
  }, [isDark]);

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} arrow placement="bottom">
      <button
        onClick={() => setIsDark(!isDark)}
        className="w-9 h-9 rounded-full flex items-center justify-center text-ink-on-surface-variant hover:text-ink-on-surface hover:bg-ink-surface transition-all duration-300"
      >
        {isDark ? (
          <LightModeOutlinedIcon sx={{ fontSize: 20 }} />
        ) : (
          <DarkModeOutlinedIcon sx={{ fontSize: 20 }} />
        )}
      </button>
    </Tooltip>
  );
};

export default ThemeToggle;
