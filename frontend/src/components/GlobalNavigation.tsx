import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

const artNotes: Record<string, string> = {
  '/login': 'Wanderer above the Sea of Fog · Caspar David Friedrich · 1818',
  '/forgot-password': 'Wanderer above the Sea of Fog · Caspar David Friedrich · 1818',
  '/': 'The School of Athens · Raphael · 1511',
  '/philosophers': 'Gatherings of minds beyond time',
  '/chat': 'Dialogue is a journey inward',
};

const GlobalNavigation: React.FC = () => {
  const location = useLocation();

  const subtitle = Object.entries(artNotes).find(([path]) => 
    location.pathname.startsWith(path)
  )?.[1] || 'Logos · Conversations with history\'s greatest thinkers';

  return (
    <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
      <div className={`flex flex-row items-center px-6 py-4 text-white text-sm uppercase tracking-[0.3em] bg-transparent backdrop-blur-xs pointer-events-auto 
				${location.pathname === '/' ? 'justify-end' : 'justify-between'}`}
			>
				{
					location.pathname !== '/' && (
						<Link
							to="/"
							className="px-6 py-3 border flex flex-row justify-between items-center border-white/60 rounded-sm text-sm tracking-widest hover:bg-white/10 transition backdrop-blur-sm"
						>
							<ArrowBack fontSize="small" />
							<span className="tracking-normal uppercase text-xs">Back to Home</span>
						</Link>
					)
				}
        <p className="text-[0.65rem] tracking-[0.4em] text-white/80 font-bold text-right">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default GlobalNavigation;
