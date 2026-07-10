import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAuth0 } from "@auth0/auth0-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/upload", label: "Create Clone" },
  { to: "/about", label: "About" },
  { to: "/feedback", label: "Feedback" },
];

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { logout: auth0Logout } = useAuth0();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    setDropdownOpen(false);
    logout();
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    navigate("/", { replace: true });
  }

  const displayName = user?.name || user?.email || "User";
  const displayEmail = user?.email || "";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-[var(--header-bg)] border-b border-[var(--input-border)] shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_-1px_0_rgba(255,255,255,0.7)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_-1px_0_rgba(255,255,255,0.05)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link
          to="/"
          className="font-heading text-2xl tracking-wide text-[var(--foreground)] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
        >
          Echo<span className="text-[var(--primary)] font-bold">Mind</span>
        </Link>

        <nav className="flex items-center gap-6 font-text text-sm">
          {/* ── Existing nav links (untouched) ──────────────────────────── */}
          {links.map((l) => {
            const isActive = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-[var(--input-bg)] text-[var(--primary)] skeu-inset border border-[var(--border-primary-trans)] pointer-events-none"
                    : "text-[var(--foreground-muted)] skeu-btn-primary hover:text-[var(--foreground)]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}

          {/* ── Auth section ─────────────────────────────────────────────── */}
          {isAuthenticated ? (
            /* ── Profile avatar + dropdown ── */
            <div className="relative" ref={dropdownRef}>
              <button
                id="nav-profile-btn"
                onClick={() => setDropdownOpen((o) => !o)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-2xl border transition-all focus:outline-none"
                style={{
                  background: dropdownOpen ? "var(--input-bg)" : "var(--card-bg)",
                  borderColor: dropdownOpen ? "var(--primary)" : "var(--card-border)",
                  boxShadow: dropdownOpen
                    ? "0 0 0 2px rgba(37,211,102,0.18)"
                    : "none",
                }}
              >
                {/* Avatar circle */}
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center font-heading font-bold text-xs shrink-0"
                  style={{
                    background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                    color: "var(--primary-fg)",
                  }}
                >
                  {initial}
                </span>

                {/* First name */}
                <span className="font-heading font-medium text-sm text-[var(--foreground)] max-w-[100px] truncate hidden sm:block">
                  {displayName.split(" ")[0]}
                </span>

                {/* Chevron */}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`text-[var(--foreground-muted)] transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* ── Dropdown panel ── */}
              {dropdownOpen && (
                <div
                  id="nav-profile-dropdown"
                  className="absolute right-0 mt-2 w-64 rounded-2xl border border-[var(--card-border)] shadow-[0_8px_32px_rgba(0,0,0,0.20)] overflow-hidden"
                  style={{ background: "var(--card-bg)" }}
                >
                  {/* Profile header */}
                  <div className="px-5 py-4 border-b border-[var(--card-border)]">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Large avatar */}
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center font-heading font-bold text-base shrink-0 shadow-[0_4px_12px_rgba(37,211,102,0.22)]"
                        style={{
                          background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                          color: "var(--primary-fg)",
                        }}
                      >
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p
                          id="profile-name"
                          className="font-heading font-semibold text-sm text-[var(--foreground)] truncate"
                        >
                          {displayName}
                        </p>
                        {displayEmail && (
                          <p
                            id="profile-email"
                            className="font-sans text-xs text-[var(--foreground-muted)] truncate mt-0.5"
                          >
                            {displayEmail}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Detail pills */}
                    <div className="space-y-1.5">
                      <div
                        className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: "var(--input-bg)" }}
                      >
                        <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[var(--foreground-muted)] w-10 shrink-0">
                          Name
                        </span>
                        <span className="text-xs font-sans text-[var(--foreground)] truncate">
                          {displayName}
                        </span>
                      </div>
                      {displayEmail && (
                        <div
                          className="flex items-center gap-2 px-3 py-2 rounded-xl"
                          style={{ background: "var(--input-bg)" }}
                        >
                          <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[var(--foreground-muted)] w-10 shrink-0">
                            Email
                          </span>
                          <span className="text-xs font-sans text-[var(--foreground)] truncate">
                            {displayEmail}
                          </span>
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
                      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-sans font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-all"
                    >
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
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
                      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-sans font-medium transition-all mt-0.5"
                      style={{ color: "rgba(239,68,68,0.85)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                        e.currentTarget.style.color = "rgb(239,68,68)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "rgba(239,68,68,0.85)";
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
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
            /* ── Login + Sign Up (hidden once authenticated) ── */
            <>
              <Link
                id="nav-login-link"
                to="/login"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  location.pathname === "/login"
                    ? "bg-[var(--input-bg)] text-[var(--primary)] skeu-inset border border-[var(--border-primary-trans)] pointer-events-none"
                    : "text-[var(--foreground-muted)] skeu-btn-primary hover:text-[var(--foreground)]"
                }`}
              >
                Login
              </Link>
              <Link
                id="nav-signup-link"
                to="/signup"
                className="px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                  color: "var(--primary-fg)",
                  boxShadow: "0 2px 8px rgba(37,211,102,0.2)",
                }}
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
