import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import heroImage from "../assets/background.jpg";
import logoMi from "../assets/logo.png";
import api from "../lib/axios";
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
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Phone,
  Mail,
  LogIn,
  ChevronRight,
  Sparkles,
  Image,
} from "lucide-react";
import PublicNavbar from "./public/PublicNavbar";
import PublicFooter from "./public/PublicFooter";

// ── Design tokens (match MI Nurul Huda 3 brand) ─────────────────────────────
const C = {
  primary: "#0d3b23",
  primaryMid: "#1B4332",
  accent: "#11d452",
  accentDark: "#0da640",
  gold: "#d4af37",
  surface: "#f8fcf9",
  white: "#ffffff",
  textDark: "#0d1f14",
  textMuted: "#4b5563",
  textLight: "#6b7280",
  borderLight: "rgba(0,0,0,0.07)",
};

// ── Scroll-reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  const refs = useRef([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("lp-reveal-active");
        }),
      { threshold: 0.07 }
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const add = (el) => {
    if (el && !refs.current.includes(el)) refs.current.push(el);
  };
  return add;
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, value, label, iconBg, iconColor }) {
  return (
    <div className="lp-stat-card flex items-center gap-4 p-4 sm:p-5 rounded-2xl hover:bg-[#f0f5ec] transition-colors duration-200">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        <Icon size={28} style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-extrabold" style={{ color: C.primaryMid }}>
          {value}
        </p>
        <p className="text-sm font-medium mt-0.5" style={{ color: C.textLight }}>
          {label}
        </p>
      </div>
    </div>
  );
}

// ── Excellence card ──────────────────────────────────────────────────────────
function ExcellenceCard({ icon: Icon, title, desc, iconBg, iconColor }) {
  return (
    <div className="lp-card group bg-white rounded-2xl p-7 border border-[#e5e7eb] shadow-sm hover:shadow-lg hover:shadow-[#0d3b23]/6 hover:-translate-y-1 transition-all duration-300">
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
        style={{ background: iconBg }}
      >
        <Icon size={26} style={{ color: iconColor }} />
      </div>
      <h4 className="text-lg font-bold mb-2.5" style={{ color: C.textDark }}>
        {title}
      </h4>
      <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>
        {desc}
      </p>
    </div>
  );
}

// ── Program card ─────────────────────────────────────────────────────────────
function ProgramCard({ icon: Icon, iconColor, bgColor, title, desc }) {
  return (
    <div className="lp-card bg-white rounded-2xl overflow-hidden border border-[#e5e7eb] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div
        className="h-36 sm:h-44 flex items-center justify-center"
        style={{ background: bgColor }}
      >
        <Icon size={52} style={{ color: iconColor }} />
      </div>
      <div className="p-5 sm:p-6 flex-grow">
        <h4 className="text-base sm:text-lg font-bold mb-2" style={{ color: C.textDark }}>
          {title}
        </h4>
        <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

// ── Gallery item ─────────────────────────────────────────────────────────────
function GalleryItem({ src, alt, label, className = "" }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden group ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      {label && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5 sm:p-6">
          <p className="text-white text-sm sm:text-base font-medium">{label}</p>
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const addReveal = useReveal();
  const [galeriPreview, setGaleriPreview] = useState([]);

  useEffect(() => {
    api
      .get("/galeri")
      .then((res) => {
        if (res.data.success) setGaleriPreview(res.data.data.slice(0, 6));
      })
      .catch(() => {});
  }, []);

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

  return (
    <div
      className="lp-root"
      style={{
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        background: C.surface,
        color: C.textDark,
      }}
    >
      {/* ── Scoped styles ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

        /* Scroll reveal */
        .lp-root .lp-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }
        .lp-root .lp-reveal-active {
          opacity: 1;
          transform: translateY(0);
        }
        .lp-root .lp-reveal.delay-1 { transition-delay: 0.1s; }
        .lp-root .lp-reveal.delay-2 { transition-delay: 0.2s; }
        .lp-root .lp-reveal.delay-3 { transition-delay: 0.3s; }

        /* Hero fade-in */
        .lp-root .lp-fade-up {
          animation: lpFadeUp 0.8s ease-out forwards;
          opacity: 0;
        }
        .lp-root .lp-fade-up.d1 { animation-delay: 0.1s; }
        .lp-root .lp-fade-up.d2 { animation-delay: 0.25s; }
        .lp-root .lp-fade-up.d3 { animation-delay: 0.4s; }
        @keyframes lpFadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Islamic geometric pattern for section bg */
        .lp-root .lp-pattern {
          background-image: url("data:image/svg+xml;utf8,<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'><path d='M20 0L40 20L20 40L0 20L20 0ZM20 10L30 20L20 30L10 20L20 10Z' fill='%231B4332' fill-opacity='0.04' fill-rule='evenodd'/></svg>");
          background-repeat: repeat;
        }

        /* Card hover accent bottom bar */
        .lp-root .lp-card {
          position: relative;
          overflow: hidden;
        }
        .lp-root .lp-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 100%; height: 2px;
          background: #d4af37;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .lp-root .lp-card:hover::after { transform: scaleX(1); }

        /* Stat dividers on md+ */
        @media (min-width: 768px) {
          .lp-root .lp-stat-divider {
            border-left: 1px solid rgba(0,0,0,0.08);
          }
        }
      `}</style>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <PublicNavbar />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="MI Nurul Huda 3"
            className="w-full h-full object-cover object-center"
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, rgba(13,59,35,0.88) 0%, rgba(13,59,35,0.75) 60%, rgba(13,59,35,0.55) 100%)`,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 text-center py-20 sm:py-24">
          {/* Badge */}
          <div className="lp-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/25 text-white text-xs sm:text-sm font-medium mb-7">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: C.accent, animation: "lpPulse 2s infinite" }}
            />
            Penerimaan Peserta Didik Baru (PPDB) Telah Dibuka
          </div>

          {/* Logo */}
          <div className="lp-fade-up d1 mb-7">
            <img
              src={logoMi}
              alt="Logo MI Nurul Huda 3"
              className="w-20 sm:w-28 lg:w-32 h-auto mx-auto drop-shadow-2xl"
            />
          </div>

          {/* Headline */}
          <h1 className="lp-fade-up d1 text-3xl sm:text-5xl lg:text-[64px] font-extrabold text-white tracking-tight leading-tight mb-5 drop-shadow-sm">
            Membentuk Generasi{" "}
            <span style={{ color: C.accent }}>Qur'ani</span>,<br className="hidden sm:block" />{" "}
            Cerdas &amp; Berakhlak Mulia
          </h1>

          {/* Sub */}
          <p className="lp-fade-up d2 text-base sm:text-lg lg:text-xl text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Mewujudkan pendidikan Islam yang unggul, modern, dan berkarakter
            untuk masa depan buah hati Anda di lingkungan yang asri dan
            kondusif.
          </p>

          {/* CTAs */}
          <div className="lp-fade-up d3 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link
              to="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl group"
              style={{
                background: C.accent,
                boxShadow: `0 10px 30px ${C.accent}40`,
              }}
            >
              Cek Info PPDB
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              to="/gallery"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base text-white border border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300"
            >
              <Image size={18} />
              Lihat Fasilitas
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-2">
          <div
            className="w-5 h-8 rounded-full border-2 border-white/40 flex items-start justify-center p-1"
          >
            <div
              className="w-1 h-2 rounded-full bg-white/60"
              style={{ animation: "lpScrollDot 2s ease infinite" }}
            />
          </div>
        </div>

        <style>{`
          @keyframes lpPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
          @keyframes lpScrollDot {
            0%{transform:translateY(0);opacity:1}
            100%{transform:translateY(10px);opacity:0}
          }
        `}</style>
      </header>

      {/* ── Statistics ──────────────────────────────────────────────────────── */}
      <section className="relative z-20 -mt-6 sm:-mt-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div
          ref={addReveal}
          className="lp-reveal bg-white rounded-2xl shadow-xl border border-[#e5e7eb] overflow-hidden"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y-0">
            {[
              {
                icon: Users,
                value: "500+",
                label: "Siswa Aktif",
                iconBg: "#eff6ff",
                iconColor: "#2563eb",
              },
              {
                icon: BookOpen,
                value: "30+",
                label: "Guru Profesional",
                iconBg: `${C.accent}18`,
                iconColor: C.primaryMid,
              },
              {
                icon: School,
                value: "18",
                label: "Ruang Kelas",
                iconBg: "#fef9ec",
                iconColor: "#b45309",
              },
              {
                icon: Award,
                value: "50+",
                label: "Penghargaan",
                iconBg: `${C.accent}14`,
                iconColor: C.accent,
              },
            ].map((s, i) => (
              <div
                key={i}
                className={`p-4 sm:p-6 ${
                  i > 0
                    ? "border-t md:border-t-0 border-[#e5e7eb] lp-stat-divider"
                    : ""
                }`}
              >
                <StatCard {...s} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ───────────────────────────────────────────────────── */}
      <section
        className="py-16 sm:py-24 relative overflow-hidden lp-pattern"
        style={{ background: C.surface }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: `${C.accent}20` }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: `${C.gold}30` }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section header */}
          <div
            ref={addReveal}
            className="lp-reveal text-center max-w-3xl mx-auto mb-12 sm:mb-16"
          >
            <span
              className="inline-block text-xs sm:text-sm font-bold tracking-widest uppercase mb-3"
              style={{ color: C.accent }}
            >
              Keunggulan Kami
            </span>
            <h2
              className="text-2xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight"
              style={{ color: C.primaryMid }}
            >
              Kenapa Memilih MI Nurul Huda 3?
            </h2>
            <p className="text-sm sm:text-base lg:text-lg leading-relaxed" style={{ color: C.textMuted }}>
              Kami memadukan kurikulum nasional dengan nilai-nilai keislaman yang
              kuat untuk mencetak generasi pemimpin masa depan.
            </p>
          </div>

          {/* Cards */}
          <div
            ref={addReveal}
            className="lp-reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            <ExcellenceCard
              icon={Moon}
              title="Pendidikan Islami"
              desc="Kurikulum terpadu mengedepankan nilai-nilai Islam Ahlussunnah wal Jama'ah."
              iconBg="#ecfdf5"
              iconColor={C.primaryMid}
            />
            <ExcellenceCard
              icon={GraduationCap}
              title="Guru Profesional"
              desc="Tenaga pendidik berpengalaman, tersertifikasi, dan berdedikasi tinggi."
              iconBg="#eff6ff"
              iconColor="#2563eb"
            />
            <ExcellenceCard
              icon={LayoutDashboard}
              title="Fasilitas Modern"
              desc="Ruang belajar nyaman dilengkapi smart TV dan proyektor tiap kelas."
              iconBg="#fef9ec"
              iconColor="#b45309"
            />
            <ExcellenceCard
              icon={Heart}
              title="Lingkungan Nyaman"
              desc="Suasana sekolah asri, bersih, aman, dan kondusif untuk belajar."
              iconBg="#fdf2f8"
              iconColor="#9d174d"
            />
          </div>
        </div>
      </section>

      {/* ── Program Unggulan ────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={addReveal}
            className="lp-reveal text-center max-w-2xl mx-auto mb-12 sm:mb-16"
          >
            <span
              className="inline-block text-xs sm:text-sm font-bold tracking-widest uppercase mb-3"
              style={{ color: C.accent }}
            >
              Program Kami
            </span>
            <h2
              className="text-2xl sm:text-4xl font-extrabold mb-4"
              style={{ color: C.primaryMid }}
            >
              Program Unggulan
            </h2>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: C.textMuted }}>
              Berbagai program ekstrakurikuler untuk mengembangkan potensi
              siswa secara holistik.
            </p>
          </div>

          <div
            ref={addReveal}
            className="lp-reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            <ProgramCard
              icon={Book}
              iconColor={C.primaryMid}
              bgColor={`${C.primaryMid}14`}
              title="Tahfidz Qur'an"
              desc="Program hafalan Al-Qur'an terstruktur dengan target Juz 30 melalui metode talaqqi."
            />
            <ProgramCard
              icon={Tent}
              iconColor="#b45309"
              bgColor="#fef9ec"
              title="Pramuka"
              desc="Membentuk karakter disiplin, mandiri, dan cinta tanah air."
            />
            <ProgramCard
              icon={Music}
              iconColor={C.primaryMid}
              bgColor={`${C.primaryMid}10`}
              title="Drumband"
              desc="Melatih kekompakan, kedisiplinan, dan bakat seni musik sejak dini."
            />
            <ProgramCard
              icon={Languages}
              iconColor="#b45309"
              bgColor="#fef9ec"
              title="English Club"
              desc="Pembiasaan percakapan bahasa Inggris yang menyenangkan dan interaktif."
            />
            <ProgramCard
              icon={Laptop}
              iconColor={C.primaryMid}
              bgColor={`${C.primaryMid}10`}
              title="Bina Komputer"
              desc="Pengenalan teknologi dasar dan literasi digital sejak usia dini."
            />
            <ProgramCard
              icon={Palette}
              iconColor="#b45309"
              bgColor="#fef9ec"
              title="Seni & Olahraga"
              desc="Mewadahi bakat melukis, menari, futsal, dan beladiri pencak silat."
            />
          </div>
        </div>
      </section>

      {/* ── Gallery Preview ──────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 lp-pattern" style={{ background: C.surface }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header row */}
          <div
            ref={addReveal}
            className="lp-reveal flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-12"
          >
            <div>
              <span
                className="inline-block text-xs sm:text-sm font-bold tracking-widest uppercase mb-2"
                style={{ color: C.accent }}
              >
                Galeri
              </span>
              <h2
                className="text-2xl sm:text-4xl font-extrabold"
                style={{ color: C.primaryMid }}
              >
                Galeri Kegiatan
              </h2>
              <p className="text-sm sm:text-base mt-2" style={{ color: C.textMuted }}>
                Intip keseruan belajar dan bermain di MI Nurul Huda 3
              </p>
            </div>
            <Link
              to="/gallery"
              className="hidden sm:inline-flex items-center gap-1.5 font-semibold text-sm hover:opacity-80 transition-opacity shrink-0"
              style={{ color: C.gold }}
            >
              Lihat Semua <ArrowRight size={15} />
            </Link>
          </div>

          {/* Grid */}
          <div
            ref={addReveal}
            className="lp-reveal grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
            style={{ height: "auto" }}
          >
            {galeriPreview.length === 0 ? (
              <>
                {/* Skeleton state */}
                <div className="col-span-2 row-span-2 rounded-2xl bg-[#e5e7eb] animate-pulse" style={{ minHeight: "260px" }} />
                <div className="rounded-2xl bg-[#e5e7eb] animate-pulse" style={{ minHeight: "125px" }} />
                <div className="rounded-2xl bg-[#e5e7eb] animate-pulse" style={{ minHeight: "125px" }} />
                <div className="col-span-2 rounded-2xl bg-[#e5e7eb] animate-pulse" style={{ minHeight: "125px" }} />
              </>
            ) : galeriPreview.length >= 4 ? (
              <>
                <Link
                  to="/gallery"
                  className="col-span-2 row-span-2 rounded-2xl overflow-hidden relative group block"
                  style={{ minHeight: "260px" }}
                >
                  <img
                    src={galeriPreview[0].foto_url}
                    alt={galeriPreview[0].judul}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5 sm:p-6">
                    <p className="text-white font-medium text-sm sm:text-base">{galeriPreview[0].judul}</p>
                  </div>
                </Link>
                <Link
                  to="/gallery"
                  className="rounded-2xl overflow-hidden relative group block"
                  style={{ minHeight: "125px" }}
                >
                  <img
                    src={galeriPreview[1].foto_url}
                    alt={galeriPreview[1].judul}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors" />
                </Link>
                <Link
                  to="/gallery"
                  className="rounded-2xl overflow-hidden relative group block"
                  style={{ minHeight: "125px" }}
                >
                  <img
                    src={galeriPreview[2].foto_url}
                    alt={galeriPreview[2].judul}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors" />
                </Link>
                <Link
                  to="/gallery"
                  className="col-span-2 rounded-2xl overflow-hidden relative group block"
                  style={{ minHeight: "125px" }}
                >
                  <img
                    src={galeriPreview[3].foto_url}
                    alt={galeriPreview[3].judul}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 sm:p-5">
                    <p className="text-white font-medium text-sm">{galeriPreview[3].judul}</p>
                  </div>
                </Link>
              </>
            ) : (
              // Fallback: simple 2-col grid when fewer images
              galeriPreview.map((item) => (
                <Link
                  key={item.id}
                  to="/gallery"
                  className="rounded-2xl overflow-hidden group block aspect-square"
                >
                  <img
                    src={item.foto_url}
                    alt={item.judul}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>
              ))
            )}
          </div>

          {/* Mobile "see all" */}
          <div className="mt-6 text-center sm:hidden" ref={addReveal}>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm"
              style={{ background: `${C.primaryMid}14`, color: C.primaryMid }}
            >
              Lihat Semua Galeri <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────────────────────── */}
      <section
        className="py-20 sm:py-28 relative overflow-hidden"
        style={{ background: C.primary }}
      >
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: C.accent }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Icon badge */}
          <div
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-6 sm:mb-8"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <Sparkles size={32} style={{ color: C.gold }} />
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 sm:mb-6 leading-tight">
            Siap Bergabung Menjadi Bagian Keluarga Besar Kami?
          </h2>
          <p
            className="text-sm sm:text-base lg:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: "rgba(209,250,229,0.85)" }}
          >
            Kuota terbatas. Segera daftarkan putra-putri Anda untuk mendapatkan
            pendidikan terbaik berbasis Islam.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              to="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base text-white transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
              style={{
                background: C.gold,
                boxShadow: `0 8px 24px rgba(0,0,0,0.3)`,
              }}
            >
              Daftar Online Sekarang
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base text-white border-2 border-emerald-400/60 bg-transparent hover:bg-white/10 transition-all duration-300"
            >
              <Phone size={18} />
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <PublicFooter />
    </div>
  );
}