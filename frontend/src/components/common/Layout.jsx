import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Layout({ children }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] transition-all duration-300">
      {/* ─── HEADER ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--card-border)] shadow-[0_2px_12px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="echo-title text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Echo<span className="text-[var(--primary)]">Mind</span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-4 text-[13px] font-medium font-heading">
            <Link
              to="/"
              className={`px-4 py-2 rounded-[20px] transition-all duration-300 ${isActive('/')
                  ? "bg-[var(--card-bg)] text-[var(--primary)] border border-[var(--card-border)] shadow-[0_2px_8px_rgba(0,0,0,0.02)] pointer-events-none"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:translate-y-[-1px] active:translate-y-[0px]"
                }`}
            >
              Home
            </Link>
            <Link
              to="/upload"
              className={`px-4 py-2 rounded-[20px] transition-all duration-300 ${isActive('/upload')
                  ? "bg-[var(--card-bg)] text-[var(--primary)] border border-[var(--card-border)] shadow-[0_2px_8px_rgba(0,0,0,0.02)] pointer-events-none"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:translate-y-[-1px] active:translate-y-[0px]"
                }`}
            >
              Create Clone
            </Link>
            <Link
              to="/about"
              className={`px-4 py-2 rounded-[20px] transition-all duration-300 ${isActive('/about')
                  ? "bg-[var(--card-bg)] text-[var(--primary)] border border-[var(--card-border)] shadow-[0_2px_8px_rgba(0,0,0,0.02)] pointer-events-none"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:translate-y-[-1px] active:translate-y-[0px]"
                }`}
            >
              About
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-[20px] bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] flex items-center justify-center hover:translate-y-[-1.5px] active:translate-y-[0.5px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 cursor-pointer"
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
