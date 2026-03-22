import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ThemeToggle from '../components/ThemeToggle';
import axios from 'axios';
import InteractiveDotGrid from '../components/InteractiveDotGrid';

// function toRoman(num: number): string {
//   const pairs: [number, string][] = [
//     [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
//     [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
//     [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
//   ];
//   let result = '';
//   for (const [value, numeral] of pairs) {
//     while (num >= value) {
//       result += numeral;
//       num -= value;
//     }
//   }
//   return result;
// }

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const aboutRef = useRef<HTMLDivElement | null>(null);
  const [philosopherCount, setPhilosopherCount] = useState<number | null>(null);
  const [dialogueCount, setDialogueCount] = useState<number | null>(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/stats`)
      .then(res => {
        setPhilosopherCount(res.data.philosopher_count);
        setDialogueCount(res.data.dialogue_count);
      })
      .catch(() => {});
  }, []);

  const handleEnter = () => {
    if (isAuthenticated) {
      navigate('/chats');
    } else {
      navigate('/login');
    }
  };

  const voidRef = useRef<HTMLDivElement | null>(null);
  const [voidZoom, setVoidZoom] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      if (!voidRef.current) return;
      const rect = voidRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      // Progress goes from 0 (section just entering viewport) to 1 (section centered)
      const progress = Math.max(0, Math.min(1, 1 - rect.top / vh));
      setVoidZoom(1 + progress * 1.5);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollDown = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const capabilities = [
    {
      number: '01',
      title: 'Text Dialogue',
      description: 'Engage in deep written discourse with history\'s greatest thinkers. Each response is shaped by their authentic philosophical framework.',
      icon: <ChatBubbleOutlineIcon sx={{ fontSize: 20 }} />,
    },
    {
      number: '02',
      title: 'Voice Inquiry',
      description: 'Speak naturally and receive transcribed responses. A seamless bridge between the spoken word and philosophical text.',
      icon: <MicIcon sx={{ fontSize: 20 }} />,
    },
    {
      number: '03',
      title: 'Living Conversation',
      description: 'Experience real-time voice exchange with AI philosophers who respond in their unique cadence and perspective.',
      icon: <VolumeUpIcon sx={{ fontSize: 20 }} />,
    },
  ];

  return (
    <InteractiveDotGrid className="min-h-screen">

      {/* Floating theme toggle */}
      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
        <ThemeToggle />
      </div>

      {/* ── Hero ── */}
      <section className="min-h-screen flex flex-col items-center justify-center relative px-10 md:px-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-serif italic font-light tracking-tighter text-ink-on-surface leading-none mb-6">
            who
          </h1>

          <div className="flex items-center justify-center gap-6 mb-8">
            <span className="h-px w-16 bg-ink-outline-variant/40" />
            <span className="font-sans text-2xs uppercase tracking-[0.3em] text-ink-outline">
              Logos Project
            </span>
            <span className="h-px w-16 bg-ink-outline-variant/40" />
          </div>

          <p className="font-serif italic text-lg md:text-xl text-ink-on-surface-variant leading-relaxed max-w-xl mx-auto mb-12">
            A digital sanctum for philosophical dialogue with the greatest minds across time.
          </p>

          <button
            onClick={handleEnter}
            className="px-10 py-4 bg-ink-primary text-ink-on-primary font-serif italic text-lg tracking-wide hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            Enter the Archive
          </button>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={handleScrollDown}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ink-outline hover:text-ink-on-surface-variant transition-colors"
        >
          <span className="font-sans text-2xs uppercase tracking-[0.3em]">Scroll</span>
          <KeyboardArrowDownIcon sx={{ fontSize: 20 }} className="animate-bounce" />
        </button>
      </section>

      {/* ── Facts ── */}
      <section ref={aboutRef} className="px-10 md:px-20 lg:px-32 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-16 text-center">
          <div>
            <span className="block text-4xl md:text-5xl font-serif italic text-ink-on-surface tracking-tight mb-3">
              {philosopherCount !== null ? philosopherCount : '—'}
            </span>
            <span className="font-sans text-2xs uppercase tracking-[0.3em] text-ink-outline">
              Philosophers
            </span>
          </div>
          <div>
            <span className="block text-4xl md:text-5xl font-serif italic text-ink-on-surface tracking-tight mb-3">
              {dialogueCount !== null ? dialogueCount : '—'}
            </span>
            <span className="font-sans text-2xs uppercase tracking-[0.3em] text-ink-outline">
              Scholarly Dialogues
            </span>
          </div>
          <div>
            <span className="block text-4xl md:text-5xl font-serif italic text-ink-on-surface tracking-tight mb-3">
              MMXXV
            </span>
            <span className="font-sans text-2xs uppercase tracking-[0.3em] text-ink-outline">
              Founded
            </span>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-7xl mx-auto px-10 md:px-20 lg:px-32">
        <div className="h-px bg-ink-outline-variant/15" />
      </div>

      {/* ── About ── */}
      <section className="px-10 md:px-20 lg:px-32 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-8 md:gap-16 items-start">
          <div className="md:col-span-3">
            <span className="font-sans text-2xs uppercase tracking-[0.2em] text-ink-outline block mb-6">
              About the Archive
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-light tracking-tighter text-ink-on-surface leading-tight">
              Ancient wisdom,<br />
              <span className="italic text-ink-primary">modern dialogue</span>
            </h2>
          </div>

          <div className="md:col-span-4 md:pt-12">
            <p className="font-serif text-lg md:text-xl text-ink-on-surface-variant italic leading-relaxed mb-8">
              "The unexamined life is not worth living."
            </p>
            <p className="font-sans text-sm md:text-base text-ink-on-surface-variant leading-relaxed mb-6">
              <strong><i>Who</i></strong> is a digital archive of philosophical inquiry. Choose a philosopher from across centuries and
              traditions, then engage in authentic dialogue shaped by their writings, teachings, and worldview.
            </p>
            <p className="font-sans text-sm md:text-base text-ink-on-surface-variant leading-relaxed">
              From Socrates to Nietzsche, Confucius to Descartes — each conversation draws upon primary texts
              and historical context to create a faithful representation of their philosophical perspective.
            </p>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-7xl mx-auto px-10 md:px-20 lg:px-32">
        <div className="h-px bg-ink-outline-variant/15" />
      </div>

      {/* ── Capabilities ── */}
      <section className="px-10 md:px-20 lg:px-32 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="mb-16 md:mb-24">
          <span className="font-sans text-2xs uppercase tracking-[0.2em] text-ink-outline block mb-6">
            Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light tracking-tighter text-ink-on-surface leading-tight max-w-2xl">
            Three modes of <span className="italic">inquiry</span>
          </h2>
        </div>

        <div className="space-y-0">
          {capabilities.map((cap, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 py-10 md:py-14 border-t border-ink-outline-variant/15 group"
            >
              <div className="md:col-span-1 flex items-start">
                <span className="font-sans text-2xs tracking-[0.2em] text-ink-outline">{cap.number}</span>
              </div>

              <div className="md:col-span-4 flex items-start gap-4">
                <span className="text-ink-on-surface-variant mt-0.5">{cap.icon}</span>
                <h3 className="text-2xl md:text-3xl font-serif italic text-ink-on-surface group-hover:text-ink-primary transition-colors duration-500">
                  {cap.title}
                </h3>
              </div>

              <div className="md:col-span-7">
                <p className="font-sans text-sm md:text-base text-ink-on-surface-variant leading-relaxed md:max-w-lg">
                  {cap.description}
                </p>
              </div>
            </div>
          ))}
          <div className="border-t border-ink-outline-variant/15" />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-10 md:px-20 lg:px-32 py-24 md:py-40 max-w-7xl mx-auto text-center">
        <AutoStoriesIcon sx={{ fontSize: 48 }} className="text-ink-on-surface-variant mb-8 opacity-30" />
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light tracking-tighter text-ink-on-surface leading-tight mb-4">
          Begin your <span className="italic text-ink-primary">inquiry</span>
        </h2>
        <p className="font-serif italic text-lg text-ink-on-surface-variant mb-12 max-w-md mx-auto">
          The philosophers are waiting. Choose your interlocutor and enter the dialogue.
        </p>
        <button
          onClick={handleEnter}
          className="px-10 py-4 bg-ink-primary text-ink-on-primary font-serif italic text-lg tracking-wide hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          {isAuthenticated ? 'Continue to Archive' : 'Enter the Archive'}
        </button>
      </section>

      {/* ── The Void ── */}
      <section ref={voidRef} className="relative h-screen overflow-hidden flex flex-col">
        {/* Library background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/wanderer.jpg)',
            filter: 'grayscale(1) brightness(0.35)',
            transform: `scale(${voidZoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.1s ease-out',
          }}
        />

        {/* Radial vignette — dark edges, lighter center to draw the eye inward */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.7) 100%)',
          }}
        />

        {/* Painting attribution */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
          <p className="font-serif italic text-2xs md:text-xs text-white/30">
            Wanderer above the Sea of Fog — Caspar David Friedrich, 1818
          </p>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 text-center">
          <span className="font-sans text-2xs uppercase tracking-[0.5em] text-white/40 block mb-8">
            Into the archive
          </span>
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-serif italic font-light tracking-tighter text-white leading-none mb-6">
            Step into the void
          </h2>
          <div className="flex items-center justify-center gap-6 mb-10">
            <span className="h-px w-12 bg-white/20" />
            <span className="font-sans text-2xs uppercase tracking-[0.3em] text-white/50">
              Where inquiry has no end
            </span>
            <span className="h-px w-12 bg-white/20" />
          </div>
          <button
            onClick={handleEnter}
            className="px-10 py-4 border border-white/30 text-white font-serif italic text-lg tracking-wide hover:bg-white/10 transition-all active:scale-[0.98] backdrop-blur-sm"
          >
            {isAuthenticated ? 'Continue' : 'Enter'}
          </button>
        </div>

        {/* Footer */}
        <div className="relative z-10 py-6 px-10 text-center">
          <p className="font-sans text-2xs tracking-[0.5em] uppercase text-white/30">
            who: Logos Project
          </p>
        </div>
      </section>
    </InteractiveDotGrid>
  );
};

export default HomePage;
