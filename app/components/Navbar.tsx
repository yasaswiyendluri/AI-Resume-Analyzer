import { Link, useLocation } from "react-router";

const links = [
  { to: "/", label: "Home" },
  { to: "/upload", label: "Analyze" },
  { to: "/results", label: "Results" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white text-sm font-bold shadow-sm">
            RA
          </span>
          <span className="font-semibold text-ink group-hover:text-accent transition-colors">
            Resume<span className="text-accent">AI</span>
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={
                pathname === to ? "nav-link-active" : "nav-link"
              }
            >
              {label}
            </Link>
          ))}
        </nav>

        <Link to="/upload" className="btn-primary text-sm py-2 px-4 sm:px-5">
          Start analysis
        </Link>
      </div>
    </header>
  );
}
