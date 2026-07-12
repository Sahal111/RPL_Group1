import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, LogIn, Menu, X } from "lucide-react";
import logoMi from "../../assets/logo.png";

const navItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Gallery", path: "/gallery" },
  { label: "Contact", path: "/contact" },
];

export default function ModernNavbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <nav className="fixed top-4 left-4 right-4 z-50">
      <div className="max-w-[1100px] mx-auto rounded-2xl border border-white/40 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
        <div className="flex justify-between items-center px-5 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logoMi} alt="Logo MI Nurul Huda 3" className="w-9 h-9 rounded-lg" />
            <span className="font-bold text-lg tracking-tight text-[#012d1d]">
              MI Nurul Huda 3
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex gap-1">
            {navItems.map(({ label, path }) => {
              const isActive = pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "text-[#cba72f] bg-[#cba72f]/10"
                      : "text-[#414844] hover:text-[#012d1d] hover:bg-black/5"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Login Button & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-sm text-white bg-[#012d1d] transition-all hover:bg-[#1b4332] hover:scale-105 active:scale-95"
            >
              <LogIn size={14} />
              <span className="hidden sm:inline">Login</span>
            </Link>

            <button
              className="md:hidden p-2 rounded-lg text-[#012d1d] hover:bg-black/5"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden border-t border-black/5 p-4 bg-white/50 backdrop-blur-md">
            <div className="flex flex-col gap-1">
              {navItems.map(({ label, path }) => (
                <Link
                  key={path}
                  to={path}
                  className="px-4 py-3 rounded-lg font-medium text-sm text-[#414844] hover:bg-[#012d1d]/5 hover:text-[#012d1d]"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
