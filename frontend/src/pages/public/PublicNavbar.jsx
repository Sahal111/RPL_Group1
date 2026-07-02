import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, LogIn, Menu, X } from "lucide-react";

const C = {
  primary: "#012d1d",
  primaryContainer: "#1b4332",
  secondary: "#2c694e",
  tertiaryContainer: "#cba72f",
  surface: "#f8f9fa",
  onSurface: "#191c1d",
  onSurfaceVariant: "#414844",
  outlineVariant: "#c1c8c2",
};

const navItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Gallery", path: "/gallery" },
  { label: "Contact", path: "/contact" },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed top-0 w-full z-50 border-b shadow-sm backdrop-blur-md"
      style={{
        background: C.surface + "e6",
        borderColor: C.outlineVariant + "4d",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .pub-nav-link {
          position: relative; font-weight: 600; font-size: 14px;
          transition: color 0.2s; text-decoration: none;
        }
        .pub-nav-link::after {
          content: ''; position: absolute; bottom: -4px; left: 0;
          width: 100%; height: 3px; background-color: #cba72f;
          border-radius: 9999px; transform: scaleX(0);
          transform-origin: right; transition: transform 0.3s ease;
        }
        .pub-nav-link:hover::after, .pub-nav-link.active::after {
          transform: scaleX(1); transform-origin: left;
        }
        .pub-mobile-menu { max-height: 0; overflow: hidden; transition: max-height 0.35s ease; }
        .pub-mobile-menu.open { max-height: 320px; }
      `}</style>

      <div className="flex justify-between items-center max-w-[1200px] mx-auto px-4 md:px-12 h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: C.primaryContainer }}
          >
            <BookOpen size={18} color="#fff" />
          </div>
          <span
            className="text-base md:text-xl font-bold"
            style={{ color: C.primary }}
          >
            MI Nurul Huda 3
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-8">
          {navItems.map(({ label, path }) => {
            const isActive = pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`pub-nav-link ${isActive ? "active" : ""}`}
                style={{
                  color: isActive ? C.tertiaryContainer : C.onSurfaceVariant,
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-4 md:px-6 py-2 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
            style={{ background: C.primaryContainer }}
          >
            <LogIn size={15} />
            <span>Login</span>
          </Link>
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: C.primary }}
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`pub-mobile-menu md:hidden border-t ${open ? "open" : ""}`}
        style={{ background: C.surface, borderColor: C.outlineVariant + "33" }}
      >
        <div className="px-4 py-3 flex flex-col gap-1">
          {navItems.map(({ label, path }) => {
            const isActive = pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className="py-2.5 px-3 rounded-lg font-semibold text-sm transition-colors"
                style={{
                  color: isActive ? C.tertiaryContainer : C.onSurfaceVariant,
                }}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
