import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/upload", label: "Create Clone" },
];

export default function NavBar() {
  const location = useLocation();
  return (
    <header className="border-b border-ink-700/60 sticky top-0 z-30 backdrop-blur bg-ink-950/80">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="font-heading text-2xl tracking-wide text-parchment">
          Echo<span className="text-echo">Mind</span>
        </Link>
        <nav className="flex items-center gap-6 font-text text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`transition-colors hover:text-echo ${
                location.pathname === l.to ? "text-echo" : "text-parchment/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
