import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/upload", label: "Create Clone" },
  { to: "/about", label: "About" },
];

export default function NavBar() {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-30 bg-[var(--header-bg)] border-b border-[var(--input-border)] shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_-1px_0_rgba(255,255,255,0.7)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_-1px_0_rgba(255,255,255,0.05)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="font-heading text-2xl tracking-wide text-[var(--foreground)] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
          Echo<span className="text-[var(--primary)] font-bold">Mind</span>
        </Link>
        <nav className="flex items-center gap-6 font-text text-sm">
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
        </nav>
      </div>
    </header>
  );
}
