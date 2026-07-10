import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
      <line x1="2" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function Layout({ children }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] transition-colors duration-300">
      {/* ─── HEADER ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[var(--header-bg)] border-b border-[var(--input-border)] shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_-1px_0_rgba(255,255,255,0.7)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_-1px_0_rgba(255,255,255,0.05)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-heading text-2xl tracking-wide text-[var(--foreground)] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            Echo<span className="text-[var(--primary)] font-bold">Mind</span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-4 font-text text-sm">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/')
                  ? "bg-[var(--input-bg)] text-[var(--primary)] skeu-inset pointer-events-none"
                  : "text-[var(--foreground-muted)] skeu-btn-primary hover:text-[var(--foreground)]"
              }`}
            >
              Home
            </Link>
            <Link
              to="/upload"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/upload')
                  ? "bg-[var(--input-bg)] text-[var(--primary)] skeu-inset pointer-events-none"
                  : "text-[var(--foreground-muted)] skeu-btn-primary hover:text-[var(--foreground)]"
              }`}
            >
              Create Clone
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg skeu-btn-primary text-[var(--foreground-muted)] hover:text-[var(--foreground)] flex items-center justify-center border border-[var(--card-border)]"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </nav>
        </div>
      </header>

      {/* ─── MAIN ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
