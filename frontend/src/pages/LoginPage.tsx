import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import InteractiveDotGrid from '../components/InteractiveDotGrid';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const formRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-ink-bg">
      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
        <ThemeToggle />
      </div>

      {/* ── Entry Section (always dark — image overlay) ── */}
      <section className="relative h-screen overflow-hidden flex flex-col">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/school-of-athens.jpg)',
            filter: 'grayscale(1) brightness(0.3)',
          }}
        />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 text-center">
          <h1 className="text-5xl sm:text-7xl md:text-8xl max-w-5xl font-serif italic font-light tracking-tighter text-white leading-none mb-6">
            Reflect, wander, and sign in to continue the journey
          </h1>
          <div className="flex items-center justify-center gap-6 mb-8">
            <span className="h-px w-16 bg-white/20" />
            <span className="font-sans text-2xs uppercase tracking-[0.3em] text-white/50">
              Continue your inquiry
            </span>
            <span className="h-px w-16 bg-white/20" />
          </div>
          <p className="font-serif italic text-base md:text-lg text-white/50 max-w-md mx-auto mb-12">
            "The soul takes nothing with her to the next world but her education and culture." — Plato
          </p>
        </div>

        <button
          onClick={handleScrollToForm}
          className="relative z-10 mb-10 mx-auto flex flex-col items-center gap-2 text-white/40 hover:text-white/60 transition-colors"
        >
          <span className="font-sans text-2xs uppercase tracking-[0.3em]">Sign In</span>
          <KeyboardArrowDownIcon sx={{ fontSize: 20 }} className="animate-bounce" />
        </button>
      </section>

      {/* ── Sign In Section ── */}
      <InteractiveDotGrid className="min-h-screen">
      <section ref={formRef} className="min-h-screen flex flex-col items-center justify-center px-6 md:px-10 py-20">
        {/* Card */}
        <div className="w-full max-w-md bg-ink-surface-low dark:bg-[#141414] border border-ink-outline-variant/40 dark:border-white/[0.06] rounded-2xl px-8 md:px-12 pt-12 pb-8">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="font-serif italic text-2xl text-ink-on-surface-variant dark:text-white/50 mb-4">Who</p>
            <div className="flex items-center gap-4 mb-10">
              <span className="h-px flex-1 bg-ink-outline dark:bg-white/10" />
              <span className="font-sans text-2xs uppercase tracking-[0.3em] text-ink-outline dark:text-white/30">
                Logos Project
              </span>
              <span className="h-px flex-1 bg-ink-outline dark:bg-white/10" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-ink-on-surface dark:text-white font-light mb-2">Welcome Back</h2>
            <p className="font-serif italic text-sm text-ink-on-surface-variant dark:text-white/40">
              Sign in to continue your philosophical journey.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block font-sans text-2xs uppercase tracking-[0.2em] text-ink-outline dark:text-white/35 mb-2.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-ink-outline-variant dark:text-white/20">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 4L12 13 2 4" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-ink-surface dark:bg-white/[0.03] border border-ink-outline-variant/50 dark:border-white/[0.08] rounded-lg text-ink-on-surface dark:text-white/80 placeholder:text-ink-outline-variant dark:placeholder:text-white/15 font-sans text-sm focus:outline-none focus:border-ink-primary/40 dark:focus:border-white/20 transition-colors"
                  placeholder="m.aurelius@archive.org"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-sans text-2xs uppercase tracking-[0.2em] text-ink-outline dark:text-white/35 mb-2.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-ink-outline-variant dark:text-white/20">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-ink-surface dark:bg-white/[0.03] border border-ink-outline-variant/50 dark:border-white/[0.08] rounded-lg text-ink-on-surface dark:text-white/80 placeholder:text-ink-outline-variant dark:placeholder:text-white/15 font-sans text-sm focus:outline-none focus:border-ink-primary/40 dark:focus:border-white/20 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-ink-outline-variant dark:text-white/20 hover:text-ink-on-surface-variant dark:hover:text-white/50 transition-colors"
                >
                  {showPassword ? (
                    <VisibilityOff sx={{ fontSize: 16 }} />
                  ) : (
                    <Visibility sx={{ fontSize: 16 }} />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-ink-primary dark:bg-white/[0.08] border border-ink-primary dark:border-white/[0.1] rounded-lg text-ink-on-primary dark:text-white/70 font-sans text-sm tracking-[0.1em] hover:opacity-90 dark:hover:bg-white/[0.12] dark:hover:text-white/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <span className="text-ink-on-primary/50 dark:text-white/30">→</span>}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-1">
              <span className="h-px flex-1 bg-ink-outline-variant/40 dark:bg-white/[0.06]" />
              <span className="font-sans text-2xs text-ink-outline-variant dark:text-white/15 uppercase tracking-widest">or</span>
              <span className="h-px flex-1 bg-ink-outline-variant/40 dark:bg-white/[0.06]" />
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 bg-transparent border border-ink-outline-variant/50 dark:border-white/[0.08] rounded-lg text-ink-on-surface-variant dark:text-white/50 font-sans text-sm tracking-[0.05em] hover:bg-ink-surface-high dark:hover:bg-white/[0.04] hover:text-ink-on-surface dark:hover:text-white/70 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Forgot + Register */}
          <div className="mt-8 space-y-3 text-center">
            <Link
              to="/forgot-password"
              className="block font-sans text-2xs uppercase tracking-[0.2em] text-ink-outline-variant dark:text-white/25 hover:text-ink-on-surface dark:hover:text-white/50 transition-colors"
            >
              Forgot Credentials?
            </Link>
            <p className="font-sans text-xs text-ink-on-surface-variant dark:text-white/30">
              New to the archive?{' '}
              <Link to="/register" className="text-ink-outline dark:text-white/70 font-medium hover:text-ink-on-surface hover:font-extrabold dark:hover:text-white transition-colors">
                Create New Account
              </Link>
            </p>
          </div>

          {/* Card Footer */}
          <div className="mt-10 pt-6 border-t border-ink-outline-variant/40 dark:border-white/[0.06] flex items-center justify-center">
            <span className="font-sans text-2xs uppercase tracking-[0.2em] text-ink-outline-variant dark:text-white/20">Est. MMXXV</span>
          </div>
        </div>
      </section>
      </InteractiveDotGrid>
    </div>
  );
};

export default LoginPage;
