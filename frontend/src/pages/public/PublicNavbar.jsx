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
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  const getDashboardRoute = (role) => {
    const map = {
      super_admin: "/superadmin",
      operator: "/operator",
      guru: "/guru",
      kepsek: "/kepsek",
      ortu: "/ortu",
      siswa: "/siswa",
      bendahara: "/bendahara",
      walikelas: "/walikelas",
      adminppdb: "/adminppdb",
    };
    return map[role] || "/";
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const navLink = (to, label) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        className={
          active
            ? "text-brand-green relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-brand-green"
            : "text-white/90 hover:text-white transition-colors"
        }
      >
        {label}
      </Link>
    );
  };

  return (
    <nav
      className={`fixed top-4 sm:top-6 w-[94%] sm:w-[92%] max-w-7xl z-50 transition-all duration-300 rounded-full shadow-lg mx-auto right-0 left-0 ${
        scrolled ? "glass-nav-scrolled" : "glass-nav"
      }`}
    >
      <style>{`
        .font-serif { font-family: Georgia, 'Times New Roman', serif; }
      `}</style>
      <div className="mx-auto flex items-center justify-between px-4 sm:px-6 md:px-8 py-2.5 sm:py-3">
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-3 group shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center p-1 border border-white/30 transition-transform group-hover:scale-105 shadow-sm">
            <img
              alt="Logo"
              className="w-full h-full object-contain rounded-full"
              src={logoMi}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-white font-extrabold text-base sm:text-xl leading-none tracking-tight font-serif">
              MI Nurul Huda 3
            </h1>
            <p className="text-brand-green text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase mt-0.5 sm:mt-1">
              Islamic School
            </p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6 lg:gap-8 xl:gap-10 text-sm font-semibold">
          {navLink("/", "Beranda")}
          {navLink("/about", "Profil")}
          {navLink("/akademik", "Akademik")}
          {navLink("/program", "Program")}
          {navLink("/gallery", "Galeri")}
          <Link
            to="/contact"
            className="bg-brand-green text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-md shadow-brand-green/20 hover:bg-[#00e676] hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Kontak
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden md:flex items-center gap-4 text-white/90">
            <button
              type="button"
              onClick={() => setIsDark((p) => !p)}
              className="hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              <i className={`fas ${isDark ? "fa-sun" : "fa-moon"}`} />
            </button>
            {user ? (
              <div className="relative group">
                <button
                  type="button"
                  className="hover:text-white transition-colors"
                >
                  <i className="far fa-user-circle text-xl" />
                </button>
                <div className="absolute right-0 mt-2 w-52 z-50 bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-bold truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">
                      {user.role}
                    </p>
                  </div>
                  <Link
                    to={getDashboardRoute(user.role)}
                    className="block px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 text-sm border-t border-slate-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="hover:text-white transition-colors"
                title="Login"
              >
                <i className="far fa-user-circle text-xl" />
              </Link>
            )}
          </div>

          <Link
            to="/ppdb"
            className="hidden sm:inline-flex bg-brand-green text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs font-bold shadow-md shadow-brand-green/20 hover:bg-[#00e676] hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Daftar PPDB
          </Link>

          <button
            type="button"
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            <i
              className={`fas ${mobileMenuOpen ? "fa-times" : "fa-bars"} text-lg`}
            />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 mx-2 p-4 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-2xl flex flex-col gap-2">
          {[
            ["/", "Beranda"],
            ["/about", "Profil"],
            ["/program", "Program"],
            ["/akademik", "Akademik"],
            ["/gallery", "Galeri"],
            ["/contact", "Kontak"],
          ].map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className="px-4 py-2.5 rounded-xl font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {label}
            </Link>
          ))}
          <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
          <div className="flex gap-2">
            <Link
              to="/login"
              className="flex-1 py-2.5 text-center font-bold text-slate-800 dark:text-white border border-slate-300 rounded-xl"
            >
              Masuk
            </Link>
            <Link
              to="/ppdb"
              className="flex-1 py-2.5 text-center font-bold text-white bg-brand-green rounded-xl"
            >
              Daftar PPDB
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
