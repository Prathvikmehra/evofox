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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ─── HEADER ─────────────────────────────────────── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--header-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--card-border)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--foreground)',
              letterSpacing: '-0.01em',
            }}>Echo</span>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--primary)',
              letterSpacing: '-0.01em',
            }}>Mind</span>
          </Link>

          {/* Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link to="/" style={{
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: isActive('/') ? 'var(--nav-active)' : 'var(--nav-inactive)',
              transition: 'color 0.2s',
            }}>Home</Link>
            <Link to="/upload" style={{
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: isActive('/upload') ? 'var(--nav-active)' : 'var(--nav-inactive)',
              transition: 'color 0.2s',
            }}>Create Clone</Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                background: 'transparent',
                border: '1px solid var(--card-border)',
                borderRadius: '8px',
                padding: '6px 8px',
                cursor: 'pointer',
                color: 'var(--foreground-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.2s, color 0.2s',
              }}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </nav>
        </div>
      </header>

      {/* ─── MAIN ───────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  );
}
