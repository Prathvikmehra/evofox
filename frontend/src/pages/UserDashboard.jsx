import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAuth0 } from "@auth0/auth0-react";

const navCards = [
  {
    to: "/upload",
    icon: "⬆️",
    title: "Upload Chat",
    desc: "Import a WhatsApp export and build your clone.",
  },
  {
    to: "/chat",
    icon: "💬",
    title: "Talk to Clone",
    desc: "Have a conversation with your digital self.",
  },
  {
    to: "/about",
    icon: "✦",
    title: "About EchoMind",
    desc: "Learn how your memories become intelligence.",
  },
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { logout: auth0Logout } = useAuth0();

  function handleLogout() {
    logout();
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    navigate("/", { replace: true });
  }

  const displayName = user?.name || user?.email || "there";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen px-6 py-16 animate-page-entry">
      <div className="max-w-4xl mx-auto">

        {/* Welcome header */}
        <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-heading text-xl font-bold shadow-[0_4px_16px_rgba(37,211,102,0.25)]"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                color: "var(--primary-fg)",
              }}
            >
              {initial}
            </div>
            <div>
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary-text)] mb-1">
                Welcome back
              </p>
              <h1 className="echo-title text-2xl md:text-3xl text-[var(--foreground)]">
                {displayName}
              </h1>
              {user?.email && user?.name && (
                <p className="text-[var(--foreground-muted)] text-sm font-sans mt-0.5">
                  {user.email}
                </p>
              )}
            </div>
          </div>

          {/* Logout */}
          <button
            id="dashboard-logout-btn"
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl border border-[var(--card-border)] text-sm font-heading font-medium text-[var(--foreground-muted)] transition-all hover:border-red-400/50 hover:text-red-400 hover:shadow-[0_0_0_2px_rgba(239,68,68,0.12)]"
            style={{ background: "var(--card-bg)" }}
          >
            Log out
          </button>
        </div>

        {/* Subtle divider */}
        <div
          className="w-full h-px mb-12"
          style={{
            background: "linear-gradient(90deg, transparent, var(--card-border), transparent)",
          }}
        />

        {/* Nav cards */}
        <div className="grid sm:grid-cols-3 gap-6">
          {navCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              id={`dashboard-nav-${card.to.replace("/", "")}`}
              className="echo-card echo-card-interactive group p-8 bg-[var(--surface)] flex flex-col gap-4 min-h-[180px] justify-between transition-all"
            >
              <span className="text-3xl">{card.icon}</span>
              <div>
                <h2 className="font-heading text-base font-semibold text-[var(--foreground)] mb-1.5 group-hover:text-[var(--primary)] transition-colors">
                  {card.title}
                </h2>
                <p className="text-xs text-[var(--foreground-muted)] font-sans leading-relaxed">
                  {card.desc}
                </p>
              </div>
              <span className="text-[var(--primary)] text-xs font-heading font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Open →
              </span>
            </Link>
          ))}
        </div>

        {/* Status indicator */}
        <div className="mt-10 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_6px_var(--primary)]" />
          <p className="text-[var(--foreground-muted)] text-xs font-heading font-medium uppercase tracking-wider">
            Session active
          </p>
        </div>
      </div>
    </div>
  );
}
