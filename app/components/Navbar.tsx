import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";

const links = [
  { to: "/", label: "Home" },
  { to: "/upload", label: "Analyze" },
  { to: "/results", label: "Results" },
  { to: "/history", label: "History" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="no-print sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white text-sm font-bold shadow-sm">
            RA
          </span>
          <span className="font-semibold text-ink group-hover:text-accent transition-colors">
            Resume<span className="text-accent">AI</span>
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1" aria-label="Main">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} end className={({ isActive }) => (isActive ? "nav-link-active" : "nav-link")}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/upload" className="btn-primary text-sm py-2 px-4 sm:px-5">
            Start analysis
          </Link>
          <button
            type="button"
            className="sm:hidden rounded-lg p-2 text-ink-muted hover:bg-slate-100"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              {open ? (
                <path strokeLinecap="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="sm:hidden border-t border-border bg-white px-4 py-2" aria-label="Mobile">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) => `block ${isActive ? "nav-link-active" : "nav-link"}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
