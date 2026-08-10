import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogIn, Menu, X } from "lucide-react";
import logoMi from "../../assets/logo.png";

const navItems = [
  { label: "Beranda", path: "/" },
  { label: "Profil", path: "/about" },
  { label: "Galeri", path: "/gallery" },
  { label: "Kontak", path: "/contact" },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setOpen(false), [pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Pill container */}
        <div
          className="rounded-2xl px-5 sm:px-6 transition-all duration-500 overflow-hidden"
          style={{
            background: scrolled
              ? "rgba(255,255,255,0.97)"
              : "rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: scrolled
              ? "1px solid rgba(0,0,0,0.08)"
              : "1px solid rgba(255,255,255,0.25)",
            boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.08)" : "none",
          }}
        >
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
                style={{
                  background: scrolled ? "#0d3b23" : "rgba(255,255,255,0.15)",
                }}
              >
                <img
                  src={logoMi}
                  alt="Logo MI Nurul Huda 3"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div className="hidden xs:flex flex-col leading-none">
                <span
                  className="font-extrabold text-base tracking-tight"
                  style={{ color: scrolled ? "#0d3b23" : "#ffffff" }}
                >
                  MI Nurul Huda 3
                </span>
                <span
                  className="text-[9px] font-semibold uppercase tracking-widest"
                  style={{
                    color: scrolled ? "#6b7280" : "rgba(255,255,255,0.65)",
                  }}
                >
                  Islamic School
                </span>
              </div>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(({ label, path }) => {
                const isActive = pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                    style={{
                      color: isActive
                        ? scrolled
                          ? "#0d3b23"
                          : "#11d452"
                        : scrolled
                          ? "#374151"
                          : "rgba(255,255,255,0.9)",
                      background: isActive
                        ? scrolled
                          ? "rgba(13,59,35,0.08)"
                          : "rgba(17,212,82,0.15)"
                        : "transparent",
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Login */}
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  color: scrolled ? "#0d3b23" : "rgba(255,255,255,0.9)",
                  border: scrolled
                    ? "1.5px solid rgba(13,59,35,0.25)"
                    : "1.5px solid rgba(255,255,255,0.35)",
                }}
              >
                <LogIn size={14} />
                Masuk
              </Link>

              {/* PPDB CTA */}
              <Link
                to="/about"
                className="hidden sm:inline-flex items-center px-5 py-2 rounded-full text-sm font-bold text-white transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95"
                style={{
                  background: "#11d452",
                  boxShadow: scrolled
                    ? "0 2px 12px rgba(17,212,82,0.3)"
                    : "none",
                }}
              >
                Daftar PPDB
              </Link>

              {/* Mobile toggle */}
              <button
                className="md:hidden p-2 rounded-xl transition-colors"
                style={{
                  color: scrolled ? "#0d3b23" : "#ffffff",
                  background: scrolled
                    ? "rgba(0,0,0,0.05)"
                    : "rgba(255,255,255,0.12)",
                }}
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div
            style={{
              maxHeight: open ? "320px" : "0",
              overflow: "hidden",
              transition: "max-height 0.35s ease",
            }}
          >
            <div
              className="border-t py-3 px-1 flex flex-col gap-1"
              style={{
                borderColor: scrolled
                  ? "rgba(0,0,0,0.07)"
                  : "rgba(255,255,255,0.15)",
              }}
            >
              {navItems.map(({ label, path }) => {
                const isActive = pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className="px-4 py-3 rounded-xl font-semibold text-sm transition-colors"
                    style={{
                      color: isActive
                        ? "#0d3b23"
                        : scrolled
                          ? "#374151"
                          : "rgba(255,255,255,0.85)",
                      background: isActive
                        ? "rgba(13,59,35,0.08)"
                        : "transparent",
                    }}
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </Link>
                );
              })}
              {/* Mobile login + PPDB */}
              <div className="flex gap-2 px-1 pt-2 pb-1">
                <Link
                  to="/login"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-sm border transition-colors"
                  style={{
                    color: scrolled ? "#0d3b23" : "rgba(255,255,255,0.9)",
                    borderColor: scrolled
                      ? "rgba(13,59,35,0.2)"
                      : "rgba(255,255,255,0.3)",
                  }}
                  onClick={() => setOpen(false)}
                >
                  <LogIn size={14} /> Masuk
                </Link>
                <Link
                  to="/about"
                  className="flex-1 flex items-center justify-center py-2.5 rounded-xl font-bold text-sm text-white"
                  style={{ background: "#11d452" }}
                  onClick={() => setOpen(false)}
                >
                  Daftar PPDB
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
