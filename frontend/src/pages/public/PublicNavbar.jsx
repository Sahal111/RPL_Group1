import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logoMi from "../../assets/logo.png";

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      document.documentElement.classList.contains("dark")
    );
  });
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleDark = () => {
    setIsDark((prev) => !prev);
  };

  const getDashboardRoute = (role) => {
    switch (role) {
      case "super_admin":
        return "/superadmin";
      case "operator":
        return "/operator";
      case "guru":
        return "/guru";
      case "kepsek":
        return "/kepsek";
      case "ortu":
        return "/ortu";
      case "siswa":
        return "/siswa";
      case "bendahara":
        return "/bendahara";
      case "walikelas":
        return "/walikelas";
      case "adminppdb":
        return "/adminppdb";
      default:
        return "/";
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <nav
      id="main-nav"
      className="fixed top-0 w-full z-50 transition-all duration-500 pt-3 sm:pt-6 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div
          id="nav-content"
          className={`transition-all duration-500 rounded-2xl px-4 sm:px-6 flex justify-between items-center h-[72px] ${
            scrolled
              ? "glass-nav shadow-lg border border-white/10"
              : "bg-madrasah-green/60 dark:bg-surface-dark/80 backdrop-blur-md border border-white/10"
          }`}
        >
          {/* Logo & School Name */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="bg-white/20 p-2 rounded-xl group-hover:bg-primary transition-colors duration-300 flex items-center justify-center">
              <img
                src={logoMi}
                alt="Logo MI Nurul Huda 3"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span
                id="nav-title"
                className="font-black text-white text-base sm:text-lg tracking-tight leading-none"
              >
                MI Nurul Huda 3
              </span>
              <span
                id="nav-subtitle"
                className="text-[10px] font-medium text-white/70 uppercase tracking-widest mt-0.5"
              >
                Islamic School
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div
            id="nav-links"
            className="hidden md:flex items-center gap-6 lg:gap-8 text-white"
          >
            <Link
              to="/"
              className={`hover:text-primary transition-colors font-semibold text-sm ${
                pathname === "/" ? "text-primary font-bold" : ""
              }`}
            >
              Beranda
            </Link>
            <Link
              to="/about"
              className={`hover:text-primary transition-colors font-semibold text-sm ${
                pathname === "/about" ? "text-primary font-bold" : ""
              }`}
            >
              Profil
            </Link>
            <Link
              to="/program"
              className={`hover:text-primary transition-colors font-semibold text-sm ${
                pathname === "/program" ? "text-primary font-bold" : ""
              }`}
            >
              Program
            </Link>
            <Link
              to="/gallery"
              className={`hover:text-primary transition-colors font-semibold text-sm ${
                pathname === "/gallery" ? "text-primary font-bold" : ""
              }`}
            >
              Galeri
            </Link>
            <Link
              to="/contact"
              className={`hover:text-primary transition-colors font-semibold text-sm ${
                pathname === "/contact" ? "text-primary font-bold" : ""
              }`}
            >
              Kontak
            </Link>

            <div className="h-6 w-px bg-white/20 mx-1"></div>

            <div className="flex items-center gap-3">
              {/* Dark Mode Button */}
              <button
                onClick={toggleDark}
                className="p-2 text-white hover:text-primary transition-colors rounded-lg hover:bg-white/10"
                aria-label="Toggle Dark Mode"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                <span className="material-symbols-outlined text-[22px] leading-none">
                  {isDark ? "light_mode" : "dark_mode"}
                </span>
              </button>

              {/* User Account Area */}
              {user ? (
                <div className="relative group">
                  <button className="p-1 flex items-center gap-2 text-white hover:text-primary transition-colors">
                    {user.foto ? (
                      <img
                        src={user.foto}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm border border-primary/30">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 z-50 bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {user.role}
                      </p>
                    </div>

                    <Link
                      to={getDashboardRoute(user.role)}
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        dashboard
                      </span>
                      Dashboard
                    </Link>

                    <Link
                      to={
                        user.role === "ortu"
                          ? "/ortu/profil"
                          : user.role === "guru"
                          ? "/guru/profil"
                          : getDashboardRoute(user.role)
                      }
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        person
                      </span>
                      Profil Saya
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        logout
                      </span>
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="p-2 text-white hover:text-primary transition-colors flex items-center justify-center"
                  title="Login"
                >
                  <span className="material-symbols-outlined text-[24px]">
                    account_circle
                  </span>
                </Link>
              )}

              {/* PPDB Button */}
              <Link
                to="/ppdb"
                className="ml-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 shrink-0"
              >
                Daftar PPDB
              </Link>
            </div>
          </div>

          {/* Mobile Menu Icon & Dark Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleDark}
              className="p-2 text-white hover:text-primary transition-colors"
              aria-label="Toggle Dark Mode"
            >
              <span className="material-symbols-outlined text-2xl">
                {isDark ? "light_mode" : "dark_mode"}
              </span>
            </button>
            <button
              id="mobile-icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white focus:outline-none"
              aria-label="Open Mobile Menu"
            >
              <span className="material-symbols-outlined text-3xl">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-2xl flex flex-col gap-3 animate-fade-in">
            <Link
              to="/"
              className="px-4 py-2.5 rounded-xl font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl text-primary">
                home
              </span>
              Beranda
            </Link>
            <Link
              to="/about"
              className="px-4 py-2.5 rounded-xl font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl text-primary">
                school
              </span>
              Profil Sekolah
            </Link>
            <Link
              to="/program"
              className="px-4 py-2.5 rounded-xl font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl text-primary">
                auto_stories
              </span>
              Program
            </Link>
            <Link
              to="/gallery"
              className="px-4 py-2.5 rounded-xl font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl text-primary">
                image
              </span>
              Galeri
            </Link>
            <Link
              to="/contact"
              className="px-4 py-2.5 rounded-xl font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl text-primary">
                call
              </span>
              Kontak
            </Link>

            <div className="h-px bg-slate-200 dark:bg-slate-800 my-1"></div>

            {user ? (
              <>
                <Link
                  to={getDashboardRoute(user.role)}
                  className="px-4 py-2.5 rounded-xl font-bold bg-primary/10 text-primary flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl">
                    dashboard
                  </span>
                  Dashboard ({user.name})
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 rounded-xl font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl">
                    logout
                  </span>
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  to="/login"
                  className="flex-1 py-2.5 text-center font-bold text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/ppdb"
                  className="flex-1 py-2.5 text-center font-bold text-white bg-primary rounded-xl hover:bg-primary-dark shadow-md transition-colors"
                >
                  Daftar PPDB
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
