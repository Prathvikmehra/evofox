import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAuth0 } from '@auth0/auth0-react';
import Footer from './Footer';

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
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout, isLoading: authLoading } = useAuth();
  const { logout: auth0Logout } = useAuth0();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function handleLogout() {
    setDropdownOpen(false);
    logout();
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    navigate('/', { replace: true });
  }

  const displayName = user?.name || user?.email || 'User';
  const displayEmail = user?.email || '';
  const initial = displayName.charAt(0).toUpperCase();

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

            {/* ── Page links (untouched) ── */}
            <Link to="/" className={`px-4 py-2 rounded-[20px] transition-all duration-300 ${isActive('/') ? "bg-[var(--card-bg)] text-[var(--primary)] border border-[var(--card-border)] shadow-[0_2px_8px_rgba(0,0,0,0.02)] pointer-events-none" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:translate-y-[-1px] active:translate-y-[0px]"}`}>
              Home
            </Link>
            <Link to="/upload" className={`px-4 py-2 rounded-[20px] transition-all duration-300 ${isActive('/upload') ? "bg-[var(--card-bg)] text-[var(--primary)] border border-[var(--card-border)] shadow-[0_2px_8px_rgba(0,0,0,0.02)] pointer-events-none" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:translate-y-[-1px] active:translate-y-[0px]"}`}>
              Create Clone
            </Link>
            <Link to="/about" className={`px-4 py-2 rounded-[20px] transition-all duration-300 ${isActive('/about') ? "bg-[var(--card-bg)] text-[var(--primary)] border border-[var(--card-border)] shadow-[0_2px_8px_rgba(0,0,0,0.02)] pointer-events-none" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:translate-y-[-1px] active:translate-y-[0px]"}`}>
              About
            </Link>
            <Link to="/feedback" className={`px-4 py-2 rounded-[20px] transition-all duration-300 ${isActive('/feedback') ? "bg-[var(--card-bg)] text-[var(--primary)] border border-[var(--card-border)] shadow-[0_2px_8px_rgba(0,0,0,0.02)] pointer-events-none" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:translate-y-[-1px] active:translate-y-[0px]"}`}>
              Feedback
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-[20px] bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] flex items-center justify-center hover:translate-y-[-1.5px] active:translate-y-[0.5px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 cursor-pointer"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* ── Auth section ── */}
            {authLoading ? (
              /* Skeleton pill while auth state resolves — prevents Login/Sign Up flash */
              <div className="w-24 h-8 rounded-[20px] animate-pulse" style={{ background: 'var(--card-bg)' }} />
            ) : isAuthenticated ? (
              /* Profile pill + dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  id="nav-profile-btn"
                  onClick={() => setDropdownOpen((o) => !o)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-[20px] border transition-all duration-200 focus:outline-none cursor-pointer"
                  style={{
                    background: dropdownOpen ? 'var(--card-bg)' : 'transparent',
                    borderColor: dropdownOpen ? 'var(--primary)' : 'var(--card-border)',
                    boxShadow: dropdownOpen ? '0 0 0 2px rgba(37,211,102,0.18)' : 'none',
                  }}
                >
                  {/* Avatar */}
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center font-heading font-bold text-xs shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                      color: 'var(--primary-fg)',
                    }}
                  >
                    {initial}
                  </span>
                  {/* Name */}
                  <span className="font-heading font-medium text-[13px] text-[var(--foreground)] max-w-[90px] truncate hidden sm:block">
                    {displayName.split(' ')[0]}
                  </span>
                  {/* Chevron */}
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
                    className={`text-[var(--foreground-muted)] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Dropdown panel */}
                {dropdownOpen && (
                  <div
                    id="nav-profile-dropdown"
                    className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[var(--card-border)] overflow-hidden z-50"
                    style={{
                      background: 'var(--surface)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  >
                    {/* Profile info */}
                    <div className="px-4 py-4 border-b border-[var(--card-border)]">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-bold text-sm shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                            color: 'var(--primary-fg)',
                            boxShadow: '0 4px 12px rgba(37,211,102,0.22)',
                          }}
                        >
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p id="profile-name" className="font-heading font-semibold text-sm text-[var(--foreground)] truncate">
                            {displayName}
                          </p>
                          {displayEmail && (
                            <p id="profile-email" className="font-sans text-xs text-[var(--foreground-muted)] truncate mt-0.5">
                              {displayEmail}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Detail rows */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--card-bg)' }}>
                          <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[var(--foreground-muted)] w-10 shrink-0">Name</span>
                          <span className="text-xs font-sans text-[var(--foreground)] truncate">{displayName}</span>
                        </div>
                        {displayEmail && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--card-bg)' }}>
                            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[var(--foreground-muted)] w-10 shrink-0">Email</span>
                            <span className="text-xs font-sans text-[var(--foreground)] truncate">{displayEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-2">
                      <Link
                        id="profile-dashboard-link"
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[13px] font-sans font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] transition-all"
                      >
                        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" className="shrink-0">
                          <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
                          <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
                          <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
                          <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
                        </svg>
                        My Dashboard
                      </Link>

                      <button
                        id="profile-logout-btn"
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[13px] font-sans font-medium transition-all mt-0.5"
                        style={{ color: 'rgba(239,68,68,0.85)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'rgb(239,68,68)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(239,68,68,0.85)'; }}
                      >
                        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" className="shrink-0">
                          <path d="M5.5 7.5H13M10.5 5l2.5 2.5-2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 2.5H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        </svg>
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Login + Sign Up buttons — hidden once authenticated */
              <>
                <Link
                  id="nav-login-link"
                  to="/login"
                  className={`px-4 py-2 rounded-[20px] transition-all duration-300 ${
                    isActive('/login')
                      ? 'bg-[var(--card-bg)] text-[var(--primary)] border border-[var(--card-border)] pointer-events-none'
                      : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:translate-y-[-1px]'
                  }`}
                >
                  Login
                </Link>
                <Link
                  id="nav-signup-link"
                  to="/signup"
                  className="px-4 py-2 rounded-[20px] font-semibold transition-all duration-300 hover:translate-y-[-1px]"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                    color: 'var(--primary-fg)',
                    boxShadow: '0 2px 10px rgba(37,211,102,0.25)',
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ─── MAIN ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
