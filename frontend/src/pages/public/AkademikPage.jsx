import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

// ─── Islamic Pattern Background ──────────────────────────────────────────────
function IslamicPatternBg({ className = "" }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 15-15 15L15 15zM0 30l15 15-15 15L-15 15zM60 30l15 15-15 15L45 15zM30 60l15 15-15 15L15 75z' fill='%23004d40' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// ─── Particle Kurikulum Card ──────────────────────────────────────────────────
function KurikulumCard() {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const intervalRef = useRef(null);

  const icons = [
    "calculate",
    "science",
    "menu_book",
    "functions",
    "biotech",
    "school",
  ];
  const colors = ["#eaa400", "#ffffff"];

  function createParticle() {
    if (!containerRef.current) return;
    const particle = document.createElement("div");
    particle.style.position = "absolute";
    particle.style.fontFamily = "Material Symbols Outlined";
    particle.style.animation = `float ${Math.random() * 3 + 4}s ${Math.random() * 2}s infinite ease-in-out`;
    particle.style.opacity = "0";
    particle.style.fontSize = `${Math.random() * 20 + 10}px`;
    particle.style.color = colors[Math.floor(Math.random() * colors.length)];
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.bottom = "0";
    particle.textContent = icons[Math.floor(Math.random() * icons.length)];
    containerRef.current.appendChild(particle);
    const duration =
      parseFloat(particle.style.animationDelay) +
      parseFloat(particle.style.animation.split("s")[0]) +
      7;
    setTimeout(() => particle.remove(), duration * 1000);
  }

  function handleEnter() {
    if (!containerRef.current) return;
    containerRef.current.style.opacity = "1";
    for (let i = 0; i < 5; i++) setTimeout(createParticle, i * 200);
    intervalRef.current = setInterval(createParticle, 800);
  }

  function handleLeave() {
    if (containerRef.current) containerRef.current.style.opacity = "0";
    clearInterval(intervalRef.current);
  }

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.addEventListener("mouseenter", handleEnter);
    card.addEventListener("mouseleave", handleLeave);
    return () => {
      card.removeEventListener("mouseenter", handleEnter);
      card.removeEventListener("mouseleave", handleLeave);
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="md:col-span-6 lg:col-span-5 rounded-3xl p-10 relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/10"
      style={{
        background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 15-15 15L15 15zM0 30l15 15-15 15L-15 15zM60 30l15 15-15 15L45 15zM30 60l15 15-15 15L15 75z' fill='%23004d40' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E") top left, linear-gradient(135deg, #00342b, #004d40)`,
      }}
    >
      {/* Particle container */}
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ opacity: 0, transition: "opacity 0.5s ease" }}
      />

      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#006e2a]/10 rounded-full blur-3xl group-hover:bg-[#006e2a]/20 transition-colors" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white shadow-lg mb-8">
            <span className="w-2 h-2 rounded-full bg-[#3ce36a] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Standar Nasional
            </span>
          </div>
          <h3 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight drop-shadow-md font-serif">
            Kurikulum <br />
            <span className="text-[#69ff87]">Nasional</span>
          </h3>
          <p className="text-[#94d3c1]/90 text-lg leading-relaxed font-medium max-w-sm">
            Mengadopsi standar kompetensi nasional yang diperkaya dengan metode
            pembelajaran aktif dan berbasis proyek.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-[#3ce36a]/60 to-transparent" />
            <span className="material-symbols-outlined text-[#69ff87] opacity-60">
              star
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-[#3ce36a]/60 to-transparent" />
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-auto">
          {[
            { icon: "group_work", label: "Berbasis Proyek" },
            { icon: "mosque", label: "Berkarakter Islami" },
            { icon: "computer", label: "Literasi Digital" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-xl transition-all duration-300 hover:translate-x-2 hover:bg-white/10 hover:shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[#69ff87]">
                {item.icon}
              </span>
              <span className="font-bold text-sm tracking-wide">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AkademikPage() {
  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] antialiased font-sans overflow-x-hidden selection:bg-[#006e2a] selection:text-white">
      <style>{`
        .font-serif { font-family: Georgia, 'Times New Roman', serif; }

        @keyframes float {
          0%   { transform: translateY(100%) scale(0.5); opacity: 0; }
          20%  { opacity: 0.4; }
          80%  { opacity: 0.4; }
          100% { transform: translateY(-200%) scale(1.2); opacity: 0; }
        }

        .journey-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .journey-card:hover {
          transform: scale(1.03);
          box-shadow: 0 20px 40px -10px rgba(0, 52, 43, 0.15);
          border-color: rgba(0, 52, 43, 0.3);
        }
       .journey-circle {
  transition: box-shadow 0.4s ease;
}
.group:hover .journey-circle {
  box-shadow: 0 0 25px 5px rgba(0, 110, 42, 0.4);
}
      `}</style>

      <PublicNavbar />

      <main>
        {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
        <section
          className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at center, rgba(0,77,64,0.05) 0%, transparent 70%)",
          }}
        >
          <div className="absolute inset-0 bg-[#004d40]/60 z-10" />

          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url("https://lh3.googleusercontent.com/aida/AP1WRLuKOW3nwlHT71oVihJyFa4euXIx47L91oK_DC-WbFUzpFmk4PujU6CO_LyXVcSOu9fa_YpuSF4b0AKrBSALAyT8qFa3IbXuqmStCUB7ZBQNnI7aXDj6ApHdMlS1c-MVrotDfuCJEIogSfiOPRnmxNJFRu2ZAmG239-gXf4LbjCEhYNZxCT7MSLOKbkO6JHgGjqzj9dXC1W49cUCC2XKNgpxYqmvaCKVHhIQ2HIkUeK2bfrgrwK4_I8Us5I")`,
            }}
          />

          {/* Content card */}
          <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto w-full">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 sm:p-10 md:p-12 shadow-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all hover:bg-white/20">
                <span className="material-symbols-outlined text-sm">
                  auto_awesome
                </span>
                <span className="text-xs font-bold tracking-widest uppercase">
                  Program Pendidikan Dasar
                </span>
              </div>

              <h1 className="font-extrabold text-4xl sm:text-5xl md:text-[64px] text-white leading-[1.1] tracking-tight font-serif">
                Akademik &amp; Kurikulum <br className="hidden md:block" />
                <span className="text-[#69ff87]">Terintegrasi</span>
              </h1>

              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                Membangun landasan intelektual yang kokoh berlandaskan
                nilai-nilai Al-Qur'an dan sains modern untuk mencetak generasi
                Rabbani yang unggul.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center pt-2">
                <a
                  href="#curriculum"
                  className="w-full sm:w-auto px-10 py-4 rounded-full bg-[#006e2a] text-white font-bold hover:-translate-y-1 hover:shadow-xl hover:shadow-[#006e2a]/40 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Jelajahi Kurikulum
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </a>
                <a
                  href="#programs"
                  className="w-full sm:w-auto px-10 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold hover:bg-white/20 transition-all duration-300 text-center"
                >
                  Program Unggulan
                </a>
              </div>

              <div className="pt-10 animate-bounce opacity-60">
                <span className="material-symbols-outlined text-white text-3xl">
                  keyboard_double_arrow_down
                </span>
              </div>
            </div>
          </div>

          {/* Decorative curve */}
          <div className="absolute bottom-0 left-0 w-full z-20">
            <svg
              className="w-full h-auto fill-[#f8f9fa]"
              preserveAspectRatio="none"
              viewBox="0 0 1440 120"
            >
              <path d="M0,120 C320,120 420,0 720,0 C1020,0 1120,120 1440,120 L1440,1440 L0,1440 Z" />
            </svg>
          </div>
        </section>

        {/* ── 2. Islamic-Scientist Framework ───────────────────────────────── */}
        <section
          className="py-20 relative"
          style={{
            background:
              "radial-gradient(circle at center, rgba(0,77,64,0.05) 0%, transparent 70%)",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 15-15 15L15 15zM0 30l15 15-15 15L-15 15zM60 30l15 15-15 15L45 15zM30 60l15 15-15 15L15 75z' fill='%23004d40' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative">
            {/* Decorative blobs */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#006e2a]/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#004d40]/5 rounded-full blur-3xl" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left: Header */}
              <div className="lg:col-span-5 space-y-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#006e2a]/10 text-[#006e2a] text-xs font-bold tracking-widest uppercase rounded-full border border-[#006e2a]/20 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-sm">
                    verified
                  </span>
                  Metodologi Unggulan
                </div>
                <h2 className="font-extrabold text-4xl md:text-6xl text-[#004d40] leading-[1.1] tracking-tight font-serif">
                  Islamic-Scientist <br />
                  <span className="text-[#006e2a]">Framework</span>
                </h2>
                <p className="text-[#3f4945]/90 text-lg leading-relaxed">
                  Pendekatan holistik yang mengintegrasikan adab islami,
                  pemahaman sains mutakhir, dan kemampuan berpikir kritis untuk
                  mencetak pemimpin masa depan.
                </p>
                <div className="pt-4">
                  <div className="h-1 w-24 bg-[#006e2a] rounded-full opacity-40" />
                </div>
              </div>

              {/* Right: Cards grid */}
              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {/* Card 1 */}
                <div className="bg-white/40 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2">
                  <div className="w-14 h-14 bg-[#004d40] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">
                      auto_awesome
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#004d40] mb-3 font-serif">
                    Pondasi Adab &amp; Akhlak
                  </h3>
                  <p className="text-sm text-[#3f4945] leading-relaxed">
                    Menanamkan karakter mulia sebagai akar utama sebelum
                    penguasaan ilmu pengetahuan.
                  </p>
                </div>

                {/* Card 2 (staggered) */}
                <div className="bg-white/40 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 md:mt-12">
                  <div className="w-14 h-14 bg-[#006e2a] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">
                      science
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#004d40] mb-3 font-serif">
                    Sains Terintegrasi
                  </h3>
                  <p className="text-sm text-[#3f4945] leading-relaxed">
                    Eksplorasi fenomena alam melalui kacamata tauhid dan
                    metodologi ilmiah modern.
                  </p>
                </div>

                {/* Card 3: full-width dark */}
                <div className="md:col-span-2 bg-[#004d40] text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4">
                    <span className="material-symbols-outlined text-[120px]">
                      psychology
                    </span>
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-3xl">
                        lightbulb
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 font-serif">
                        Critical Thinking
                      </h3>
                      <p className="text-[#94d3c1] text-sm leading-relaxed max-w-xl">
                        Melatih daya nalar kritis untuk memecahkan masalah
                        kompleks dengan solusi yang etis dan inovatif.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Curriculum Explorer (Bento Grid) ─────────────────────────── */}
        <section
          id="curriculum"
          className="py-20 bg-white relative"
          style={{
            background:
              "radial-gradient(circle at 0% 0%, rgba(0,110,42,0.03) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(0,52,43,0.03) 0%, transparent 50%)",
          }}
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            {/* Header */}
            <div className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#006e2a]/10 text-[#006e2a] text-xs font-bold tracking-widest uppercase rounded-full border border-[#006e2a]/20">
                <span className="material-symbols-outlined text-sm">
                  auto_stories
                </span>
                Program Unggulan
              </div>
              <h2 className="font-extrabold text-4xl md:text-5xl text-[#004d40] tracking-tight font-serif">
                Eksplorasi Kurikulum
              </h2>
              <p className="text-[#3f4945] max-w-2xl mx-auto text-lg">
                Perpaduan harmonis antara standar pendidikan nasional dan
                nilai-nilai luhur kepesantrenan untuk mencetak generasi masa
                depan.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <div className="h-px flex-1 bg-gradient-to-r from-[#3ce36a]/60 to-transparent" />
                <span className="material-symbols-outlined text-[#69ff87] opacity-60">
                  star
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-[#3ce36a]/60 to-transparent" />
              </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left: Kurikulum Nasional card with particles */}
              <KurikulumCard />

              {/* Right: sub-cards */}
              <div className="md:col-span-6 lg:col-span-7 grid grid-cols-1 gap-6">
                {/* Dirasah Islamiyah */}
                <div
                  className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:border-[#006e2a]/40 hover:-translate-y-1 transition-all duration-500 group"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 15-15 15L15 15zM0 30l15 15-15 15L-15 15zM60 30l15 15-15 15L45 15zM30 60l15 15-15 15L15 75z' fill='%23004d40' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                  }}
                >
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-[#004d40]/5 rounded-2xl flex items-center justify-center text-[#004d40] group-hover:bg-[#004d40] group-hover:text-white group-hover:rotate-6 transition-all duration-500 shrink-0 shadow-inner">
                      <span className="material-symbols-outlined text-4xl">
                        mosque
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#004d40] mb-3 font-serif">
                        Dirasah Islamiyah
                      </h3>
                      <p className="text-[#3f4945]/90 text-base leading-relaxed mb-4">
                        Pembentukan aqidah yang lurus dan pemahaman ibadah yang
                        shahihah.
                      </p>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-[#3ce36a]/60 to-transparent" />
                        <span className="material-symbols-outlined text-[#69ff87] opacity-60">
                          star
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-[#3ce36a]/60 to-transparent" />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {["Aqidah Akhlak", "Fiqh & SKI"].map((tag) => (
                          <div
                            key={tag}
                            className="flex items-center gap-2 px-4 py-1.5 bg-[#006e2a]/5 rounded-full border border-[#006e2a]/10 group-hover:border-[#006e2a]/30 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[#006e2a] text-sm">
                              verified
                            </span>
                            <span className="text-xs font-bold text-[#004d40]">
                              {tag}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Program Al-Qur'an */}
                <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:border-[#006e2a]/40 hover:-translate-y-1 transition-all duration-500 group">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-[#006e2a]/10 rounded-2xl flex items-center justify-center text-[#006e2a] group-hover:bg-[#006e2a] group-hover:text-white group-hover:-rotate-6 transition-all duration-500 shrink-0 shadow-inner">
                      <span className="material-symbols-outlined text-4xl">
                        menu_book
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#004d40] mb-3 font-serif">
                        Program Al-Qur'an
                      </h3>
                      <p className="text-[#3f4945]/90 text-base leading-relaxed mb-4">
                        Tahsin, Tahfidz, dan Tarjamah dengan target minimal 3
                        Juz.
                      </p>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-[#3ce36a]/60 to-transparent" />
                        <span className="material-symbols-outlined text-[#69ff87] opacity-60">
                          star
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-[#3ce36a]/60 to-transparent" />
                      </div>
                      <a
                        href="#"
                        className="inline-flex items-center gap-2 text-[#006e2a] text-sm font-bold hover:gap-3 transition-all group/link"
                      >
                        <span>Lihat Detail</span>
                        <span className="material-symbols-outlined text-lg transition-transform group-hover/link:translate-x-1">
                          arrow_right_alt
                        </span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Ekstrakurikuler */}
                <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:border-[#3f2900]/40 hover:-translate-y-1 transition-all duration-500 group">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-[#3f2900]/10 rounded-2xl flex items-center justify-center text-[#3f2900] group-hover:bg-[#3f2900] group-hover:text-white transition-all duration-500 shrink-0 shadow-inner">
                      <span className="material-symbols-outlined text-4xl">
                        emoji_events
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#004d40] mb-4 font-serif">
                        Ekstrakurikuler
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {["Pramuka", "Memanah", "Koding"].map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-bold uppercase tracking-widest text-[#3f2900] bg-[#3f2900]/5 px-4 py-2 rounded-full border border-[#3f2900]/10 hover:bg-[#3f2900]/10 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Academic Journey (Stepper) ────────────────────────────────── */}
        <section
          className="py-20 relative overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at center, rgba(0,77,64,0.05) 0%, transparent 70%)",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 15-15 15L15 15zM0 30l15 15-15 15L-15 15zM60 30l15 15-15 15L15 75z' fill='%23004d40' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
            {/* Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#006e2a]/10 text-[#006e2a] text-xs font-bold tracking-widest uppercase rounded-full border border-[#006e2a]/20 mb-6">
                <span className="material-symbols-outlined text-sm">map</span>
                Roadmap Pendidikan
              </div>
              <h2 className="font-extrabold text-4xl md:text-6xl text-[#004d40] tracking-tight mb-6 font-serif">
                Peta Perjalanan <span className="text-[#006e2a]">Akademik</span>
              </h2>
              <p className="text-[#3f4945] text-lg max-w-2xl mx-auto leading-relaxed">
                Fokus perkembangan holistik sesuai tahap usia untuk mencetak
                generasi yang matang secara intelektual, emosional, dan
                spiritual.
              </p>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical line — desktop only */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#004d40]/5 via-[#006e2a]/40 to-[#004d40]/5 hidden md:block rounded-full shadow-inner" />

              <div className="space-y-16 sm:space-y-24 relative">
                {/* Step 1: Foundational */}
                <div className="relative flex flex-col md:flex-row items-center justify-between group">
                  {/* Left — desktop */}
                  <div className="md:w-5/12 text-right pr-16 hidden md:block">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#004d40]/5 text-[#004d40] mb-4 group-hover:scale-110 transition-transform duration-500">
                      <span className="material-symbols-outlined text-4xl">
                        child_care
                      </span>
                    </div>
                    <h4 className="text-3xl font-extrabold text-[#004d40] font-serif">
                      Foundational Stage
                    </h4>
                    <p className="text-[#3f4945] text-lg mt-3 leading-relaxed">
                      Membangun kecintaan belajar melalui adaptasi dan
                      kemandirian dasar.
                    </p>
                  </div>

                  {/* Circle */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-[#004d40] text-white flex items-center justify-center font-bold text-2xl z-20 shadow-2xl border-8 border-[#f8f9fa] journey-circle hidden md:flex">
                    <div className="absolute inset-0 rounded-full animate-pulse bg-[#004d40]/20" />
                    <span className="relative z-10">1-2</span>
                  </div>

                  {/* Card */}
                  <div className="md:w-5/12 pl-0 md:pl-16 w-full">
                    <div className="bg-white/40 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-white/60 journey-card">
                      {/* Mobile header */}
                      <div className="md:hidden mb-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#004d40]/10 flex items-center justify-center text-[#004d40]">
                          <span className="material-symbols-outlined">
                            child_care
                          </span>
                        </div>
                        <h4 className="text-2xl font-bold text-[#004d40] font-serif">
                          Foundational Stage
                        </h4>
                      </div>
                      <ul className="space-y-5">
                        {[
                          {
                            title: "Adab & Karakter",
                            desc: "Penanaman nilai kesantunan dan kemandirian dini.",
                          },
                          {
                            title: "Literasi Menyenangkan",
                            desc: "Metode Calistung yang interaktif dan tanpa tekanan.",
                          },
                          {
                            title: "Tahsin Al-Qur'an",
                            desc: "Pengenalan huruf hijaiyah dengan Metode Ummi.",
                          },
                        ].map((item) => (
                          <li
                            key={item.title}
                            className="flex items-start gap-4"
                          >
                            <span className="material-symbols-outlined text-[#006e2a] mt-1">
                              check_circle
                            </span>
                            <div>
                              <span className="font-bold text-[#004d40] block">
                                {item.title}
                              </span>
                              <span className="text-sm text-[#3f4945]">
                                {item.desc}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 2: Development */}
                <div className="relative flex flex-col md:flex-row-reverse items-center justify-between group">
                  <div className="md:w-5/12 text-left pl-16 hidden md:block">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#3f2900]/5 text-[#3f2900] mb-4 group-hover:scale-110 transition-transform duration-500">
                      <span className="material-symbols-outlined text-4xl">
                        science
                      </span>
                    </div>
                    <h4 className="text-3xl font-extrabold text-[#006e2a] font-serif">
                      Development Stage
                    </h4>
                    <p className="text-[#3f4945] text-lg mt-3 leading-relaxed">
                      Eksplorasi potensi diri dan penguatan logika berpikir
                      kritis.
                    </p>
                  </div>

                  <div className="absolute left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-[#3f2900] text-white flex items-center justify-center font-bold text-2xl z-20 shadow-2xl border-8 border-[#f8f9fa] journey-circle hidden md:flex">
                    <div className="absolute inset-0 rounded-full animate-pulse bg-[#3f2900]/20" />
                    <span className="relative z-10">3-4</span>
                  </div>

                  <div className="md:w-5/12 pr-0 md:pr-16 w-full">
                    <div className="bg-white/40 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-white/60 journey-card">
                      <div className="md:hidden mb-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#3f2900]/10 flex items-center justify-center text-[#3f2900]">
                          <span className="material-symbols-outlined">
                            science
                          </span>
                        </div>
                        <h4 className="text-2xl font-bold text-[#006e2a] font-serif">
                          Development Stage
                        </h4>
                      </div>
                      <ul className="space-y-5">
                        {[
                          {
                            title: "Ibadah Mandiri",
                            desc: "Pembiasaan shalat dan dzikir tanpa paksaan.",
                          },
                          {
                            title: "Inquiry-Based Learning",
                            desc: "Proyek sains sederhana untuk memantik rasa ingin tahu.",
                          },
                          {
                            title: "Tahfidz Juz 30",
                            desc: "Target hafalan dengan tajwid yang benar.",
                          },
                        ].map((item) => (
                          <li
                            key={item.title}
                            className="flex items-start gap-4"
                          >
                            <span className="material-symbols-outlined text-[#006e2a] mt-1">
                              check_circle
                            </span>
                            <div>
                              <span className="font-bold text-[#004d40] block">
                                {item.title}
                              </span>
                              <span className="text-sm text-[#3f4945]">
                                {item.desc}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 3: Leadership */}
                <div className="relative flex flex-col md:flex-row items-center justify-between group">
                  <div className="md:w-5/12 text-right pr-16 hidden md:block">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#004d40]/5 text-[#004d40] mb-4 group-hover:scale-110 transition-transform duration-500">
                      <span className="material-symbols-outlined text-4xl">
                        military_tech
                      </span>
                    </div>
                    <h4 className="text-3xl font-extrabold text-[#004d40] font-serif">
                      Leadership Stage
                    </h4>
                    <p className="text-[#3f4945] text-lg mt-3 leading-relaxed">
                      Persiapan menjadi pemimpin masa depan yang berintegritas.
                    </p>
                  </div>

                  <div className="absolute left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-[#004d40] text-white flex items-center justify-center font-bold text-2xl z-20 shadow-2xl border-8 border-[#f8f9fa] journey-circle hidden md:flex">
                    <div className="absolute inset-0 rounded-full animate-pulse bg-[#004d40]/20" />
                    <span className="relative z-10">5-6</span>
                  </div>

                  <div className="md:w-5/12 pl-0 md:pl-16 w-full">
                    <div className="bg-white/40 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-white/60 journey-card">
                      <div className="md:hidden mb-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#004d40]/10 flex items-center justify-center text-[#004d40]">
                          <span className="material-symbols-outlined">
                            military_tech
                          </span>
                        </div>
                        <h4 className="text-2xl font-bold text-[#004d40] font-serif">
                          Leadership Stage
                        </h4>
                      </div>
                      <ul className="space-y-5">
                        {[
                          {
                            title: "Mentoring OSIS",
                            desc: "Pelatihan kepemimpinan dan manajemen organisasi.",
                          },
                          {
                            title: "Academic Excellence",
                            desc: "Pemantapan materi untuk persiapan jenjang selanjutnya.",
                          },
                          {
                            title: "Munaqosyah Tahfidz",
                            desc: "Ujian hafalan publik sebagai bentuk apresiasi.",
                          },
                        ].map((item) => (
                          <li
                            key={item.title}
                            className="flex items-start gap-4"
                          >
                            <span className="material-symbols-outlined text-[#006e2a] mt-1">
                              check_circle
                            </span>
                            <div>
                              <span className="font-bold text-[#004d40] block">
                                {item.title}
                              </span>
                              <span className="text-sm text-[#3f4945]">
                                {item.desc}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Lingkungan Belajar ─────────────────────────────────────────── */}
        <section
          className="py-20 bg-white overflow-hidden relative"
          style={{
            background:
              "radial-gradient(circle at center, rgba(0,77,64,0.05) 0%, transparent 70%)",
          }}
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#004d40]/5 rounded-full blur-3xl opacity-60" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#006e2a]/5 rounded-full blur-3xl opacity-60" />

            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 relative z-10">
              {/* Image */}
              <div className="lg:w-1/2 relative group w-full">
                <div className="absolute -inset-6 bg-[#004d40]/5 rounded-[2.5rem] transform -rotate-3 transition-transform group-hover:rotate-0 duration-700" />
                <div className="absolute -inset-6 border-2 border-[#006e2a]/20 rounded-[2.5rem] transform rotate-2 transition-transform group-hover:rotate-0 duration-700" />
                <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl aspect-square">
                  <img
                    alt="Modern Islamic classroom environment"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    src="https://lh3.googleusercontent.com/aida/AP1WRLt7bweRMeOgQKYSZR9244U-wPStyAN3bqZNYwUiyEkZUlP2QAbz0t0WeBHK8eMQ6TlnRhcJtRp22YMx6AEj2VLhn85ZZ1ixHitJEmoL8avgCT5FpECXT9agvdV88A43_nSFPQEFyb53si_H6vVdaEO3QsmjCNSDZmFyUPOHwOE-VcoCxFmS8Z4oauFJtMXz49EotWFy3L_jBb-DtNWl6G2lGjAyZ4IsXhtnFSZABQL8GQn3wl5alJG56UE"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#004d40]/40 to-transparent opacity-60" />
                </div>
                {/* Floating card */}
                <div className="absolute -bottom-8 -right-4 sm:-right-10 bg-white/90 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-2xl border border-white/50 z-20 max-w-xs transition-all duration-500 hover:-translate-y-2">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-[#006e2a] text-white rounded-xl flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined">
                        lightbulb
                      </span>
                    </div>
                    <div className="font-extrabold text-[#004d40] text-xl font-serif">
                      Active Learning
                    </div>
                  </div>
                  <p className="text-xs text-[#3f4945] leading-relaxed">
                    Pendekatan berpusat pada siswa untuk memicu kreativitas dan
                    kemandirian.
                  </p>
                </div>
              </div>

              {/* Text */}
              <div className="lg:w-1/2 space-y-8 sm:space-y-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#004d40]/5 text-[#004d40] text-xs font-bold tracking-widest uppercase rounded-full border border-[#004d40]/10">
                    <span className="material-symbols-outlined text-sm">
                      auto_awesome
                    </span>
                    Ekosistem Belajar
                  </div>
                  <h2 className="font-extrabold text-4xl md:text-5xl text-[#004d40] leading-tight font-serif">
                    Lingkungan Belajar yang{" "}
                    <span className="text-[#006e2a]">Menginspirasi</span>
                  </h2>
                  <p className="text-[#3f4945] text-lg leading-relaxed">
                    Kami tidak hanya mentransfer pengetahuan, tetapi memantik
                    rasa ingin tahu. Ruang kelas kami dirancang untuk kolaborasi
                    dan eksplorasi.
                  </p>
                </div>

                <div className="grid gap-5 sm:gap-6">
                  {[
                    {
                      icon: "groups",
                      color: "primary",
                      title: "Diskusi Kelompok",
                      desc: "Membangun keterampilan komunikasi dan empati melalui kerja sama tim dalam memecahkan masalah nyata.",
                    },
                    {
                      icon: "laptop_mac",
                      color: "secondary",
                      title: "Integrasi Teknologi",
                      desc: "Penggunaan perangkat digital secara bijak untuk memperluas akses informasi dan media pembelajaran interaktif.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="group/card bg-white/60 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-white/80 shadow-sm hover:shadow-xl hover:border-[#006e2a]/30 transition-all duration-300 flex gap-5 sm:gap-6 items-start"
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-500 ${item.color === "primary" ? "bg-[#004d40]/5 group-hover/card:bg-[#004d40] group-hover/card:text-white" : "bg-[#006e2a]/5 group-hover/card:bg-[#006e2a] group-hover/card:text-white"}`}
                      >
                        <span className="material-symbols-outlined text-3xl">
                          {item.icon}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#004d40] text-xl mb-2 font-serif">
                          {item.title}
                        </h4>
                        <p className="text-sm text-[#3f4945] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. Tenaga Pendidik ────────────────────────────────────────────── */}
        <section
          className="py-20 relative overflow-hidden"
          style={{
            background:
              "radial-gradient(circle, rgba(0,77,64,0.05) 0%, transparent 70%)",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 15-15 15L15 15zM0 30l15 15-15 15L-15 15zM60 30l15 15-15 15L45 15zM30 60l15 15-15 15L15 75z' fill='%23004d40' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#004d40]/5 text-[#004d40] text-xs font-bold tracking-widest uppercase rounded-full border border-[#004d40]/10 mb-6">
                <span className="material-symbols-outlined text-sm">
                  groups
                </span>
                Tim Akademik
              </div>
              <h2 className="font-extrabold text-4xl md:text-5xl text-[#004d40] tracking-tight mb-4 font-serif">
                Tenaga Pendidik Profesional
              </h2>
              <p className="text-[#3f4945] text-lg max-w-2xl mx-auto leading-relaxed">
                Dibimbing oleh asatidz dan guru yang kompeten, berdedikasi, dan
                penuh kasih sayang dalam membimbing generasi Rabbani.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  name: "Ust. Ahmad, S.Pd.I",
                  role: "Guru Al-Qur'an",
                  icon: "menu_book",
                  stagger: false,
                },
                {
                  name: "Fatimah, M.Pd",
                  role: "Guru Sains",
                  icon: "science",
                  stagger: true,
                },
                {
                  name: "Ust. Hasan, S.Pd",
                  role: "Wali Kelas 6",
                  icon: "school",
                  stagger: false,
                },
                {
                  name: "Aisyah, S.Psi",
                  role: "Konselor Pendidikan",
                  icon: "psychology",
                  stagger: true,
                },
              ].map((teacher) => (
                <div
                  key={teacher.name}
                  className={`group relative bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-white/80 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-center overflow-hidden ${teacher.stagger ? "md:mt-8" : ""}`}
                >
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#006e2a] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative mb-6 inline-block">
                    <div className="w-24 sm:w-28 h-24 sm:h-28 mx-auto bg-[#004d40]/5 rounded-full flex items-center justify-center border-2 border-dashed border-[#004d40]/20 group-hover:border-[#006e2a]/40 transition-colors">
                      <span className="material-symbols-outlined text-5xl text-[#004d40]/40 group-hover:text-[#006e2a] transition-colors">
                        person
                      </span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#ffdeac] rounded-full flex items-center justify-center shadow-md border-4 border-white">
                      <span className="material-symbols-outlined text-[#3f2900] text-xl">
                        {teacher.icon}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-bold text-[#004d40] text-base sm:text-lg mb-1 font-serif">
                    {teacher.name}
                  </h4>
                  <p className="text-xs font-bold text-[#006e2a] uppercase tracking-wider">
                    {teacher.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. PPDB CTA ───────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-24 relative overflow-hidden bg-white">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 15-15 15L15 15zM0 30l15 15-15 15L-15 15zM60 30l15 15-15 15L45 15zM30 60l15 15-15 15L15 75z' fill='%23004d40' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
            <div
              className="rounded-[2.5rem] p-8 sm:p-12 md:p-20 shadow-2xl border border-white/10 relative overflow-hidden group hover:scale-[1.01] transition-all duration-500"
              style={{
                background: "linear-gradient(135deg, #00342b, #004d40)",
              }}
            >
              <div
                className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 15-15 15L15 15zM0 30l15 15-15 15L-15 15zM60 30l15 15-15 15L45 15zM30 60l15 15-15 15L15 75z' fill='%23004d40' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(105,255,135,0.15),transparent_70%)] animate-pulse pointer-events-none" />
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#006e2a]/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#3f2900]/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />

              <div className="relative z-10 text-center space-y-6 sm:space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[#69ff87] text-xs font-bold tracking-[0.2em] uppercase">
                  <span className="material-symbols-outlined text-sm">
                    auto_awesome
                  </span>
                  Penerimaan Siswa Baru
                </div>

                <h2 className="font-extrabold text-4xl md:text-6xl text-white leading-tight tracking-tight font-serif">
                  Siap Menjadi <br className="hidden md:block" />
                  <span className="text-[#69ff87]">Generasi Rabbani?</span>
                </h2>

                <p className="text-lg md:text-xl text-[#94d3c1]/90 max-w-2xl mx-auto leading-relaxed font-medium">
                  Bergabunglah bersama keluarga besar MI Nurul Huda 3. Kuota
                  pendaftaran terbatas untuk tahun ajaran baru. Mari bangun masa
                  depan cerah berlandaskan iman dan ilmu.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 pt-4 sm:pt-6">
                  <Link
                    to="/ppdb"
                    className="group/btn w-full sm:w-auto relative px-10 py-4 bg-[#006e2a] text-white rounded-xl font-bold text-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,110,42,0.6)] hover:bg-[#00c853] flex items-center justify-center gap-3"
                  >
                    <span>Daftar PPDB Sekarang</span>
                    <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1">
                      arrow_forward
                    </span>
                  </Link>
                  <a
                    href="#"
                    className="w-full sm:w-auto px-10 py-4 bg-white/5 backdrop-blur-md border-2 border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-3 hover:-translate-y-2 hover:border-white/40 hover:shadow-xl"
                  >
                    <span className="material-symbols-outlined">download</span>
                    Unduh Brosur
                  </a>
                </div>

                <div className="pt-8 sm:pt-12 flex items-center justify-center gap-6 sm:gap-8 opacity-60">
                  <div className="flex flex-col items-center hover:-translate-y-1 transition-transform duration-300 cursor-default">
                    <span className="text-white font-bold text-2xl">2026</span>
                    <span className="text-[#94d3c1] text-[10px] uppercase tracking-widest">
                      Tahun Ajaran
                    </span>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <div className="flex flex-col items-center hover:-translate-y-1 transition-transform duration-300 cursor-default">
                    <span className="text-white font-bold text-2xl">
                      Terbatas
                    </span>
                    <span className="text-[#94d3c1] text-[10px] uppercase tracking-widest">
                      Kuota Kursi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
