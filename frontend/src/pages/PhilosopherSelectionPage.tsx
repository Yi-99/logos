import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Philosopher } from '@/constants/types/Philosopher';
import GridViewIcon from '@mui/icons-material/GridView';
import HubIcon from '@mui/icons-material/Hub';
import Tooltip from '@mui/material/Tooltip';
import philosopherService from '../services/philosophers/PhilosopherService';
import PhilosopherClusterMap from '../components/PhilosopherClusterMap';
import ProfileDropdown from '../components/ProfileDropdown';
import ThemeToggle from '../components/ThemeToggle';

type ViewMode = 'list' | 'graph';

const PhilosopherSelectionPage: React.FC = () => {
	const [philosophers, setPhilosophers] = useState<Philosopher[]>([]);
	const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const navigate = useNavigate();

	useEffect(() => {
		const fetchPhilosophers = async () => {
			try {
				const response = await philosopherService.getAllPhilosophers();
				setPhilosophers(response.philosophers);

				const imageKeys = response.philosophers
					.filter((p: Philosopher) => p.image)
					.map((p: Philosopher) => p.image);
				const batchUrls = await philosopherService.getPhilosopherImageUrls(imageKeys);

				const urls: Record<string, string> = {};
				response.philosophers.forEach((p: Philosopher) => {
					const filename = p.image?.split('/').pop() || p.image;
					if (filename && batchUrls[filename]) {
						urls[p.id] = batchUrls[filename];
					}
				});
				setImageUrls(urls);
			} catch (error) {
				console.error('Failed to fetch philosophers:', error);
			}
		}
		fetchPhilosophers();
	}, [])

	useEffect(() => {
		console.log("philsophers:", philosophers);
	}, [philosophers]);

  const handlePhilosopherSelect = (philosopherId: string) => {
    navigate(`/chat/new/${philosopherId}`);
  };

  const isGraphView = viewMode === 'graph';
  const isListView = viewMode === 'list';

  const viewToggleIsland = (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-20 bg-ink-surface border border-ink-outline-variant/15 rounded-2xl px-3 py-4">
      <div className="flex flex-col items-center space-y-3">
        <span className="font-sans text-2xs uppercase tracking-widest text-ink-outline">View</span>
        <div className="w-8 h-[1px] bg-ink-outline-variant/30 rounded-full" />

        <Tooltip title="List view" arrow placement="left">
          <button
            onClick={() => setViewMode('list')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isListView
                ? 'bg-ink-primary text-ink-on-primary'
                : 'text-ink-on-surface-variant hover:text-ink-on-surface hover:bg-ink-surface-highest'
            }`}
          >
            <GridViewIcon sx={{ fontSize: 20 }} />
          </button>
        </Tooltip>

        <Tooltip title="Graph view" arrow placement="left">
          <button
            onClick={() => setViewMode('graph')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isGraphView
                ? 'bg-ink-primary text-ink-on-primary'
                : 'text-ink-on-surface-variant hover:text-ink-on-surface hover:bg-ink-surface-highest'
            }`}
          >
            <HubIcon sx={{ fontSize: 20 }} />
          </button>
        </Tooltip>
      </div>
    </div>
  );

  const selectionNavbar = (
    <header className="fixed top-0 w-full z-50 bg-ink-bg/80 backdrop-blur-xl border-b border-ink-outline-variant/15">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-8">
          <a href="/" className="text-2xl font-serif text-ink-on-surface italic hover:opacity-80 transition-opacity">who</a>
          <span className="font-sans text-2xs uppercase tracking-[0.2em] text-ink-outline">Philosophical Inquiry</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );

  if (isGraphView) {
    return (
      <div className="h-screen flex flex-col overflow-hidden ink-dot-grid">
        {selectionNavbar}

        <div className="flex-1 relative pt-[60px]">
          <PhilosopherClusterMap
            philosophers={philosophers}
            imageUrls={imageUrls}
            onPhilosopherSelect={handlePhilosopherSelect}
          />
        </div>

        {viewToggleIsland}
      </div>
    );
  }

  const staggerOffsets = ['mt-0', 'mt-8', 'mt-0', 'mt-12', 'mt-0', 'mt-4', 'mt-16', 'mt-0'];

  return (
    <div className="h-screen overflow-x-hidden ink-dot-grid">
      {selectionNavbar}

      <main className="pt-28 pb-20 px-8 md:px-16 max-w-6xl mx-auto">
        <section className="mb-12 border-b border-ink-outline-variant/10 pb-8">
          <h2 className="text-4xl font-serif italic text-ink-on-surface mb-2">Select Philosophers</h2>
          <p className="font-sans text-sm text-ink-on-surface-variant mb-8">Choose a philosopher to begin your dialogue</p>

          {(() => {
            const categories = Array.from(new Set(
              philosophers
                .map(p => p.metaphysicsCategory)
                .filter(Boolean)
            ));
            if (categories.length === 0) return null;
            return (
              <div className="flex gap-3 overflow-x-auto pb-2 ink-scroll">
                <button
                  onClick={() => setActiveFilter(null)}
                  className={`px-4 py-1.5 rounded-full border text-sm font-sans whitespace-nowrap transition-all ${
                    activeFilter === null
                      ? 'border-ink-primary/40 text-ink-on-surface bg-ink-surface'
                      : 'border-ink-outline-variant/20 text-ink-on-surface-variant hover:border-ink-primary/50 hover:text-ink-on-surface'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(activeFilter === cat ? null : cat!)}
                    className={`px-4 py-1.5 rounded-full border text-sm font-sans whitespace-nowrap transition-all ${
                      activeFilter === cat
                        ? 'border-ink-primary/40 text-ink-on-surface bg-ink-surface'
                        : 'border-ink-outline-variant/20 text-ink-on-surface-variant hover:border-ink-primary/50 hover:text-ink-on-surface'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            );
          })()}
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {philosophers?.length > 0 && philosophers
            .filter(p => activeFilter === null || p.metaphysicsCategory === activeFilter)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((philosopher, index) => (
            <div
              key={philosopher.id}
              onClick={() => handlePhilosopherSelect(philosopher.id)}
              className={`group cursor-pointer ${staggerOffsets[index % staggerOffsets.length]}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-ink-surface mb-4 grayscale hover:grayscale-0 transition-all duration-700">
                {imageUrls[philosopher.id] ? (
                  <img
                    src={imageUrls[philosopher.id]}
                    alt={philosopher.name}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink-on-surface-variant font-serif italic text-4xl">
                    {philosopher.name.charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
              </div>

              <h3 className="text-2xl font-serif italic text-ink-on-surface mb-1 group-hover:translate-x-2 transition-transform duration-500">
                {philosopher.name}
              </h3>
              <p className="font-sans text-2xs uppercase tracking-widest text-ink-on-surface-variant">
                {philosopher.dates} {philosopher.metaphysicsCategory ? `• ${philosopher.metaphysicsCategory}` : ''}
              </p>
            </div>
          ))}
        </section>
      </main>

      {viewToggleIsland}

      <footer className="py-12 px-8 md:px-16 border-t border-ink-outline-variant/10 max-w-6xl mx-auto">
        <div className="font-serif italic text-sm text-ink-on-surface-variant/50">
          Philosophical inquiry is a journey without destination.
        </div>
      </footer>
    </div>
  );
};

export default PhilosopherSelectionPage;
