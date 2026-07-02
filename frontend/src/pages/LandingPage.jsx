import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Users,
  BookOpen,
  School,
  Award,
  Moon,
  GraduationCap,
  LayoutDashboard,
  Heart,
  Book,
  Tent,
  Music,
  Languages,
  Laptop,
  Palette,
  Image,
  Newspaper,
  ArrowRight,
  UserPlus,
  MapPin,
  Phone,
  Mail,
  LogIn,
  Menu,
  X,
} from "lucide-react";

const C = {
  primary: "#012d1d",
  primaryContainer: "#1b4332",
  secondary: "#2c694e",
  tertiary: "#735c00",
  tertiaryContainer: "#cba72f",
  tertiaryFixed: "#ffe088",
  surface: "#f8f9fa",
  surfaceVariant: "#e1e3e4",
  onSurface: "#191c1d",
  onSurfaceVariant: "#414844",
  outlineVariant: "#c1c8c2",
  primaryFixedDim: "#a5d0b9",
};

function StatCard({ icon: Icon, value, label, iconColor }) {
  return (
    <div className="luminous-card p-5 md:p-6 text-center">
      <Icon
        size={36}
        style={{ color: iconColor || C.primary }}
        className="mx-auto mb-3"
      />
      <h3
        className="text-2xl md:text-4xl font-bold mb-1"
        style={{ color: C.primary }}
      >
        {value}
      </h3>
      <p className="text-sm md:text-base" style={{ color: C.onSurfaceVariant }}>
        {label}
      </p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div
      className="p-5 md:p-6 rounded-2xl border transition-all duration-300"
      style={{ background: C.surface, borderColor: C.outlineVariant + "4d" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = C.tertiaryContainer + "80")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = C.outlineVariant + "4d")
      }
    >
      <div
        className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-4 md:mb-6"
        style={{ background: C.primaryContainer + "1a" }}
      >
        <Icon size={24} style={{ color: C.primary }} />
      </div>
      <h3
        className="text-lg md:text-xl font-bold mb-2 md:mb-3"
        style={{ color: C.primary }}
      >
        {title}
      </h3>
      <p
        className="text-sm md:text-base leading-relaxed"
        style={{ color: C.onSurfaceVariant }}
      >
        {desc}
      </p>
    </div>
  );
}

function ProgramCard({ icon: Icon, iconColor, bgColor, title, desc }) {
  return (
    <div className="luminous-card flex flex-col h-full">
      <div
        className="h-36 md:h-48 flex items-center justify-center rounded-t-[20px]"
        style={{ background: bgColor }}
      >
        <Icon size={52} style={{ color: iconColor }} />
      </div>
      <div className="p-5 md:p-6 flex-grow">
        <h3
          className="text-lg md:text-xl font-bold mb-2"
          style={{ color: C.primary }}
        >
          {title}
        </h3>
        <p
          className="text-sm md:text-base leading-relaxed"
          style={{ color: C.onSurfaceVariant }}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}

function NewsCard({ date, title, excerpt }) {
  return (
    <div
      className="rounded-2xl overflow-hidden border flex flex-col transition-shadow duration-300 hover:shadow-lg"
      style={{ background: "#fff", borderColor: C.outlineVariant + "4d" }}
    >
      <div
        className="h-40 md:h-48 flex items-center justify-center"
        style={{ background: C.primaryContainer + "1a" }}
      >
        <Newspaper size={44} style={{ color: C.primary + "66" }} />
      </div>
      <div className="p-5 md:p-6 flex-grow flex flex-col">
        <span
          className="text-xs font-bold mb-2 block"
          style={{ color: C.tertiaryContainer }}
        >
          {date}
        </span>
        <h3
          className="text-base md:text-xl font-bold mb-3 line-clamp-2"
          style={{ color: C.primary }}
        >
          {title}
        </h3>
        <p
          className="text-sm md:text-base mb-4 flex-grow line-clamp-3"
          style={{ color: C.onSurfaceVariant }}
        >
          {excerpt}
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-2 font-semibold text-sm mt-auto transition-opacity hover:opacity-80"
          style={{ color: C.primary }}
        >
          Baca Selengkapnya <ArrowRight size={15} />
        </a>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const revealRefs = useRef([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const dashMap = {
        operator: "/operator",
        guru: "/guru",
        kepsek: "/kepsek",
        ortu: "/ortu",
      };
      navigate(dashMap[user.role] || "/login", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("reveal-active");
        }),
      { threshold: 0.08 },
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addReveal = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Gallery", path: "/gallery" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: C.surface,
        color: C.onSurface,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .lp .luminous-card {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(1,45,29,0.05);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .lp .luminous-card::before {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 100%; height: 2px;
          background-color: #cba72f;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .lp .luminous-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(1,45,29,0.08); }
        .lp .luminous-card:hover::before { transform: scaleX(1); }

        .lp .islamic-pattern {
          background-image: url("data:image/svg+xml;utf8,<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'><path d='M20 0L40 20L20 40L0 20L20 0ZM20 10L30 20L20 30L10 20L20 10Z' fill='%231b4332' fill-opacity='0.05' fill-rule='evenodd'/></svg>");
          background-repeat: repeat;
        }

        .lp .reveal-section { opacity: 0; transform: translateY(30px); transition: all 0.8s ease-out; }
        .lp .reveal-section.reveal-active { opacity: 1; transform: translateY(0); }

        .lp .fade-in-up { animation: lpFadeUp 0.8s ease-out forwards; opacity: 0; transform: translateY(20px); }
        .lp .d100 { animation-delay: 100ms; }
        .lp .d200 { animation-delay: 200ms; }
        .lp .d300 { animation-delay: 300ms; }
        @keyframes lpFadeUp { to { opacity: 1; transform: translateY(0); } }

        .lp .nav-link {
          position: relative; font-weight: 600; font-size: 14px;
          transition: color 0.2s; text-decoration: none;
        }
        .lp .nav-link::after {
          content: ''; position: absolute; bottom: -4px; left: 0;
          width: 100%; height: 3px; background-color: #cba72f;
          border-radius: 9999px; transform: scaleX(0);
          transform-origin: right; transition: transform 0.3s ease;
        }
        .lp .nav-link:hover::after, .lp .nav-link.active::after {
          transform: scaleX(1); transform-origin: left;
        }

        /* Mobile menu slide */
        .lp .mobile-menu {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.35s ease;
        }
        .lp .mobile-menu.open { max-height: 300px; }
      `}</style>

      <div className="lp">
        {/* ── Navbar ─────────────────────────────────────────────────── */}
        <nav
          className="fixed top-0 w-full z-50 border-b shadow-sm backdrop-blur-md"
          style={{
            background: C.surface + "e6",
            borderColor: C.outlineVariant + "4d",
          }}
        >
          <div className="flex justify-between items-center max-w-[1200px] mx-auto px-4 md:px-12 h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
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
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex gap-8">
              {navLinks.map(({ label, path }, i) => (
                <Link
                  key={path}
                  to={path}
                  className={`nav-link ${i === 0 ? "active" : ""}`}
                  style={{
                    color: i === 0 ? C.tertiaryContainer : C.onSurfaceVariant,
                  }}
                >
                  {label}
                </Link>
              ))}
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
              {/* Hamburger (mobile only) */}
              <button
                className="md:hidden p-2 rounded-lg transition-colors"
                style={{ color: C.primary }}
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          <div
            className={`mobile-menu md:hidden border-t ${mobileMenuOpen ? "open" : ""}`}
            style={{
              background: C.surface,
              borderColor: C.outlineVariant + "33",
            }}
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map(({ label, path }, i) => (
                <Link
                  key={path}
                  to={path}
                  className="py-2.5 px-3 rounded-lg font-semibold text-sm transition-colors"
                  style={{
                    color: i === 0 ? C.tertiaryContainer : C.onSurfaceVariant,
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-16 md:pt-20">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCvcN3l9gGfx3kSgiJ0QVskn-ZTakegLFS0666Fka9qMpi0ukLabsXXIG9Srbc18EMC_8QD1jEGNn_07PdiOE-OpuhUykZsJu4d8axBTOfjyIyqLPRYICB7cBe8T5NoL9-gvLSuWx0_i1DvA0JqzSxPr-jsgHvPx9o11shwxOdgk-QEUKP3m06ydQsz__y_n0GZK1YzV7L-4z-ixOcQB93fcpCIrdQ4GRYgomTH4dLlb5WMOvOxjDscbqyyzHbJnXTMJ5e9G2jP-sjO')`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${C.primary}e6, ${C.primary}66)`,
            }}
          />
          <div className="relative z-10 text-center px-5 md:px-12 max-w-[1200px] mx-auto flex flex-col items-center py-16 md:py-0">
            <div
              className="w-20 h-20 md:w-28 md:h-28 mb-6 md:mb-8 rounded-xl flex items-center justify-center fade-in-up"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <BookOpen size={44} color="#fff" className="md:hidden" />
              <BookOpen size={60} color="#fff" className="hidden md:block" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-bold text-white mb-4 leading-tight fade-in-up d100">
              Selamat Datang di{" "}
              <span
                className="block md:inline"
                style={{ color: C.tertiaryFixed }}
              >
                MI Nurul Huda 3
              </span>
            </h1>
            <p
              className="text-base md:text-lg max-w-xl md:max-w-2xl mb-8 md:mb-10 leading-relaxed fade-in-up d200"
              style={{ color: "#e7e8e9" }}
            >
              Sekolah Islami, Unggul, dan Berprestasi. Membentuk generasi
              Rabbani yang cerdas intelektual dan berakhlakul karimah.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto fade-in-up d300">
              <Link
                to="/about"
                className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-white shadow-lg transition-opacity hover:opacity-90 text-center"
                style={{
                  background: C.primary,
                  border: `2px solid ${C.primaryContainer}`,
                }}
              >
                Tentang Kami
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-white transition-all hover:bg-white/10 flex items-center justify-center gap-2"
                style={{ border: `2px solid ${C.tertiaryContainer}` }}
              >
                <LogIn size={18} /> Login
              </Link>
            </div>
          </div>
        </section>

        {/* ── Statistik ──────────────────────────────────────────────── */}
        <section
          className="py-12 md:py-16 relative islamic-pattern z-20 -mt-6 md:-mt-10"
          style={{ background: C.surface }}
        >
          <div className="max-w-[1200px] mx-auto px-4 md:px-12">
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 reveal-section"
              ref={addReveal}
            >
              <StatCard
                icon={Users}
                value="500+"
                label="Siswa Aktif"
                iconColor={C.primary}
              />
              <StatCard
                icon={BookOpen}
                value="30+"
                label="Guru Profesional"
                iconColor={C.tertiaryContainer}
              />
              <StatCard
                icon={School}
                value="18"
                label="Ruang Kelas"
                iconColor={C.primary}
              />
              <StatCard
                icon={Award}
                value="50+"
                label="Penghargaan"
                iconColor={C.tertiaryContainer}
              />
            </div>
          </div>
        </section>

        {/* ── Mengapa Memilih Kami ───────────────────────────────────── */}
        <section className="py-12 md:py-20" style={{ background: "#ffffff" }}>
          <div className="max-w-[1200px] mx-auto px-4 md:px-12">
            <div
              className="text-center mb-8 md:mb-12 reveal-section"
              ref={addReveal}
            >
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4"
                style={{ color: C.primary }}
              >
                Mengapa Memilih Kami?
              </h2>
              <p
                className="text-sm md:text-lg max-w-2xl mx-auto"
                style={{ color: C.onSurfaceVariant }}
              >
                Keunggulan MI Nurul Huda 3 dalam mendidik putra-putri Anda.
              </p>
            </div>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 reveal-section"
              ref={addReveal}
            >
              <FeatureCard
                icon={Moon}
                title="Pendidikan Islami"
                desc="Kurikulum terpadu mengedepankan nilai-nilai Islam Ahlussunnah wal Jama'ah."
              />
              <FeatureCard
                icon={GraduationCap}
                title="Guru Profesional"
                desc="Tenaga pendidik berpengalaman, kompeten, dan berdedikasi tinggi."
              />
              <FeatureCard
                icon={LayoutDashboard}
                title="Fasilitas Lengkap"
                desc="Ruang belajar nyaman dilengkapi fasilitas modern menunjang KBM."
              />
              <FeatureCard
                icon={Heart}
                title="Lingkungan Nyaman"
                desc="Suasana sekolah asri, bersih, aman, dan kondusif untuk belajar."
              />
            </div>
          </div>
        </section>

        {/* ── Program Unggulan ───────────────────────────────────────── */}
        <section
          className="py-12 md:py-20 islamic-pattern"
          style={{ background: C.surface }}
        >
          <div className="max-w-[1200px] mx-auto px-4 md:px-12">
            <div
              className="text-center mb-8 md:mb-12 reveal-section"
              ref={addReveal}
            >
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4"
                style={{ color: C.primary }}
              >
                Program Unggulan
              </h2>
              <p
                className="text-sm md:text-lg max-w-2xl mx-auto"
                style={{ color: C.onSurfaceVariant }}
              >
                Berbagai program ekstrakurikuler untuk mengembangkan potensi
                siswa.
              </p>
            </div>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 reveal-section"
              ref={addReveal}
            >
              <ProgramCard
                icon={Book}
                iconColor={C.primary}
                bgColor={C.primaryContainer + "1a"}
                title="Tahfidz Qur'an"
                desc="Program hafalan Al-Qur'an terstruktur dengan target juz 30."
              />
              <ProgramCard
                icon={Tent}
                iconColor={C.tertiaryContainer}
                bgColor={C.tertiaryContainer + "1a"}
                title="Pramuka"
                desc="Membentuk karakter disiplin, mandiri, dan cinta tanah air."
              />
              <ProgramCard
                icon={Music}
                iconColor={C.primary}
                bgColor={C.primaryContainer + "1a"}
                title="Drumband"
                desc="Melatih kekompakan, kedisiplinan, dan bakat seni musik."
              />
              <ProgramCard
                icon={Languages}
                iconColor={C.tertiaryContainer}
                bgColor={C.tertiaryContainer + "1a"}
                title="English Club"
                desc="Pembiasaan percakapan bahasa Inggris yang menyenangkan."
              />
              <ProgramCard
                icon={Laptop}
                iconColor={C.primary}
                bgColor={C.primaryContainer + "1a"}
                title="Bina Komputer"
                desc="Pengenalan teknologi dasar dan literasi digital sejak dini."
              />
              <ProgramCard
                icon={Palette}
                iconColor={C.tertiaryContainer}
                bgColor={C.tertiaryContainer + "1a"}
                title="Seni & Olahraga"
                desc="Mewadahi bakat melukis, menari, futsal, dan beladiri pencak silat."
              />
            </div>
          </div>
        </section>

        {/* ── Galeri ─────────────────────────────────────────────────── */}
        <section className="py-12 md:py-20" style={{ background: "#ffffff" }}>
          <div className="max-w-[1200px] mx-auto px-4 md:px-12">
            <div
              className="flex justify-between items-end mb-6 md:mb-8 reveal-section"
              ref={addReveal}
            >
              <div>
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 md:mb-2"
                  style={{ color: C.primary }}
                >
                  Galeri Kegiatan
                </h2>
                <p
                  className="text-sm md:text-lg"
                  style={{ color: C.onSurfaceVariant }}
                >
                  Momen-momen berharga siswa-siswi MI Nurul Huda 3.
                </p>
              </div>
              <Link
                to="/gallery"
                className="hidden md:inline-flex items-center gap-2 font-semibold text-sm hover:opacity-80 transition-opacity flex-shrink-0 ml-4"
                style={{ color: C.tertiaryContainer }}
              >
                Lihat Semua <ArrowRight size={15} />
              </Link>
            </div>
            <div
              className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 reveal-section"
              ref={addReveal}
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl overflow-hidden group"
                  style={{ background: C.surfaceVariant }}
                >
                  <div
                    className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                    style={{
                      background:
                        i % 2 === 0
                          ? C.primaryContainer + "33"
                          : C.tertiaryContainer + "33",
                    }}
                  >
                    <Image
                      size={36}
                      style={{ color: C.onSurfaceVariant + "80" }}
                      className="md:hidden"
                    />
                    <Image
                      size={48}
                      style={{ color: C.onSurfaceVariant + "80" }}
                      className="hidden md:block"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div
              className="mt-6 text-center md:hidden reveal-section"
              ref={addReveal}
            >
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm"
                style={{
                  background: C.primaryContainer + "1a",
                  color: C.primary,
                }}
              >
                Lihat Semua Galeri <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Berita Terbaru ─────────────────────────────────────────── */}
        <section className="py-12 md:py-20" style={{ background: C.surface }}>
          <div className="max-w-[1200px] mx-auto px-4 md:px-12">
            <div
              className="text-center mb-8 md:mb-12 reveal-section"
              ref={addReveal}
            >
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4"
                style={{ color: C.primary }}
              >
                Berita Terbaru
              </h2>
              <p
                className="text-sm md:text-lg max-w-2xl mx-auto"
                style={{ color: C.onSurfaceVariant }}
              >
                Informasi dan kabar terkini seputar sekolah.
              </p>
            </div>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 reveal-section"
              ref={addReveal}
            >
              <NewsCard
                date="12 Oktober 2024"
                title="Peringatan Maulid Nabi Muhammad SAW 1446 H"
                excerpt="Alhamdulillah, pelaksanaan peringatan Maulid Nabi berjalan dengan khidmat dihadiri oleh seluruh siswa, wali murid dan dewan guru."
              />
              <NewsCard
                date="05 Oktober 2024"
                title="Prestasi Gemilang di Ajang PORSENI Tingkat Kecamatan"
                excerpt="Siswa-siswi MI Nurul Huda 3 berhasil meraih juara umum pada perhelatan PORSENI tahun ini membawa pulang 5 piala."
              />
              <NewsCard
                date="28 September 2024"
                title="Pembukaan PPDB Tahun Ajaran 2025/2026"
                excerpt="Telah dibuka pendaftaran peserta didik baru gelombang pertama. Dapatkan penawaran khusus bagi pendaftar bulan ini."
              />
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────── */}
        <section
          className="py-14 md:py-24 relative overflow-hidden"
          style={{ background: C.primary }}
        >
          <div className="absolute inset-0 islamic-pattern opacity-10" />
          <div
            className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-12 text-center reveal-section"
            ref={addReveal}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">
              Mari Bergabung Bersama Kami
            </h2>
            <p
              className="text-sm md:text-lg max-w-2xl mx-auto mb-6 md:mb-8 leading-relaxed"
              style={{ color: C.primaryFixedDim }}
            >
              Bentuk generasi Qur'ani yang berprestasi dan berakhlakul karimah.
              Daftarkan putra-putri Anda sekarang juga di MI Nurul Huda 3.
            </p>
            <button
              className="px-7 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg inline-flex items-center gap-2 shadow-lg transition-opacity hover:opacity-90"
              style={{ background: C.tertiaryContainer, color: C.primary }}
            >
              Daftar Sekarang <UserPlus size={18} />
            </button>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer style={{ background: "#e7e8e9" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-[1200px] mx-auto py-10 md:py-12 px-4 md:px-12">
            <div className="sm:col-span-2 md:col-span-2">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: C.primaryContainer }}
                >
                  <BookOpen size={15} color="#fff" />
                </div>
                <span
                  className="text-lg md:text-xl font-bold"
                  style={{ color: C.primary }}
                >
                  MI Nurul Huda 3
                </span>
              </div>
              <p
                className="text-sm md:text-base max-w-sm"
                style={{ color: C.onSurfaceVariant }}
              >
                Membentuk generasi Rabbani yang unggul dalam prestasi dan
                berakhlakul karimah.
              </p>
            </div>
            <div>
              <h4
                className="text-base md:text-xl font-bold mb-3 md:mb-4"
                style={{ color: C.primary }}
              >
                Links
              </h4>
              <ul className="space-y-1.5 md:space-y-2">
                {[
                  "Home",
                  "About",
                  "Gallery",
                  "Programs",
                  "News",
                  "Contact",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm md:text-base transition-opacity hover:opacity-80"
                      style={{ color: C.onSurfaceVariant }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4
                className="text-base md:text-xl font-bold mb-3 md:mb-4"
                style={{ color: C.primary }}
              >
                Contact Us
              </h4>
              <div className="space-y-2">
                {[
                  { icon: MapPin, text: "Jl. Pendidikan No. 123" },
                  { icon: Phone, text: "(021) 1234567" },
                  { icon: Mail, text: "info@minurulhuda3.sch.id" },
                ].map(({ icon: Icon, text }) => (
                  <p
                    key={text}
                    className="text-sm md:text-base flex items-start gap-2"
                    style={{ color: C.onSurfaceVariant }}
                  >
                    <Icon
                      size={16}
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: C.tertiaryContainer }}
                    />
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div
            className="border-t py-4 text-center"
            style={{ borderColor: C.outlineVariant + "4d" }}
          >
            <p className="text-xs" style={{ color: C.onSurfaceVariant }}>
              © 2024 MI Nurul Huda 3. All Rights Reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
