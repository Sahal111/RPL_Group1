import { useEffect, useRef } from "react";
import { ArrowRight, CheckCircle2, Lightbulb, Flag } from "lucide-react";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

const C = {
  primary: "#012d1d",
  primaryContainer: "#1b4332",
  secondary: "#2c694e",
  tertiaryContainer: "#cba72f",
  tertiaryFixed: "#ffe088",
  surface: "#f8f9fa",
  onSurface: "#191c1d",
  onSurfaceVariant: "#414844",
  outlineVariant: "#c1c8c2",
  primaryFixedDim: "#a5d0b9",
};

const MISI = [
  "Menyelenggarakan proses pembelajaran yang inovatif, interaktif, dan berbasis nilai-nilai keislaman.",
  "Membangun lingkungan sekolah yang kondusif, aman, dan memotivasi semangat belajar siswa.",
  "Mengembangkan potensi kecerdasan majemuk (multiple intelligences) setiap peserta didik.",
  "Menjalin kemitraan yang erat antara sekolah, orang tua, dan masyarakat.",
];

export default function AboutPage() {
  const revealRefs = useRef([]);

  const addReveal = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
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
        .reveal-section { opacity: 0; transform: translateY(30px); transition: all 0.8s ease-out; }
        .reveal-section.reveal-active { opacity: 1; transform: translateY(0); }
        .about-islamic-pattern {
          background-image: url("data:image/svg+xml;utf8,<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'><path d='M20 0L40 20L20 40L0 20L20 0ZM20 10L30 20L20 30L10 20L20 10Z' fill='%231b4332' fill-opacity='0.05' fill-rule='evenodd'/></svg>");
          background-repeat: repeat;
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal-section { transition: none; }
        }
      `}</style>

      <PublicNavbar />

      <main className="min-h-screen pt-16 md:pt-20">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="pt-12 md:pt-20 pb-10 md:pb-16 px-4 md:px-12 max-w-[1200px] mx-auto text-center relative overflow-hidden">
          <div
            className="absolute top-[-20%] left-[-10%] w-72 md:w-96 h-72 md:h-96 rounded-full -z-10 pointer-events-none"
            style={{
              background: C.primaryContainer,
              opacity: 0.06,
              filter: "blur(80px)",
            }}
          />
          <div
            className="absolute bottom-0 right-[-10%] w-72 md:w-96 h-72 md:h-96 rounded-full -z-10 pointer-events-none"
            style={{
              background: C.tertiaryFixed,
              opacity: 0.15,
              filter: "blur(80px)",
            }}
          />

          <span
            className="inline-block py-1 px-4 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
            style={{
              background: C.primaryContainer + "15",
              color: C.primaryContainer,
            }}
          >
            Tentang Kami
          </span>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3"
            style={{ color: C.primary }}
          >
            Profil Sekolah
          </h1>
          <p
            className="text-sm md:text-lg max-w-2xl mx-auto"
            style={{ color: C.onSurfaceVariant }}
          >
            Mengenal lebih dekat perjalanan, nilai, dan visi MI Nurul Huda 3
            dalam mendidik generasi penerus yang berakhlak mulia dan
            berprestasi.
          </p>
        </section>

        {/* ── Sejarah ──────────────────────────────────────────────────── */}
        <section className="py-12 md:py-20 px-4 md:px-12 max-w-[1200px] mx-auto">
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center reveal-section"
            ref={addReveal}
          >
            {/* Image */}
            <div
              className="rounded-[20px] md:rounded-[24px] overflow-hidden relative"
              style={{
                height: "320px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
              }}
            >
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUaTjBAGGYhpLIvAbQe7XfofgYQZAr65IdMZMnynZdBKy-gow6DI3DNXDRsA4QU9etz9mkL0BtYBpgWhxSLtLArRldU8Kmk9M8BnGrZO7bBxg4BeSZaKpMvqVY7vg9yv19CoueuJX-jQrl0Pzyc3xtFFpmeltL-BRzShK0eiyXMG8aOMfANHE56Tysd5ZObH53dHNb-CFhoGbhZvxqfgNabFl1PZQT5ChPCi3Cx2l1ItqeBZpGl7atAJ9-CZE5LpHO_BivEGIAaDI"
                alt="Gedung MI Nurul Huda 3"
              />
            </div>

            {/* Text */}
            <div className="space-y-5">
              <h2
                className="text-2xl md:text-3xl font-bold"
                style={{ color: C.primary }}
              >
                Menyemai Kebaikan Sejak Dini
              </h2>
              <p
                className="text-sm md:text-base leading-relaxed"
                style={{ color: C.onSurfaceVariant }}
              >
                Berdiri sejak tahun 1985, MI Nurul Huda 3 telah mendedikasikan
                diri untuk menyediakan pendidikan dasar Islam yang berkualitas.
                Perjalanan kami dimulai dengan sebuah visi sederhana:
                menciptakan lingkungan belajar yang menggabungkan keunggulan
                akademis dengan penanaman nilai-nilai moral yang kuat.
              </p>
              <p
                className="text-sm md:text-base leading-relaxed"
                style={{ color: C.onSurfaceVariant }}
              >
                Seiring berjalannya waktu, sekolah kami terus berkembang,
                beradaptasi dengan kemajuan teknologi dan metodologi pendidikan
                modern, tanpa pernah meninggalkan akar tradisi Islam yang
                menjadi identitas utama kami.
              </p>
              <button
                className="flex items-center gap-2 font-semibold text-sm transition-opacity hover:opacity-70"
                style={{ color: C.primaryContainer }}
              >
                Baca Selengkapnya <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* ── Visi & Misi ──────────────────────────────────────────────── */}
        <section
          className="py-12 md:py-20 about-islamic-pattern"
          style={{ background: "#f0f3ff" }}
        >
          <div className="max-w-[1200px] mx-auto px-4 md:px-12">
            <div
              className="text-center mb-10 md:mb-14 reveal-section"
              ref={addReveal}
            >
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3"
                style={{ color: C.primary }}
              >
                Visi &amp; Misi
              </h2>
              <p
                className="text-sm md:text-lg max-w-2xl mx-auto"
                style={{ color: C.onSurfaceVariant }}
              >
                Arah langkah dan tujuan mulia yang menjadi kompas perjalanan
                pendidikan kami.
              </p>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 reveal-section"
              ref={addReveal}
            >
              {/* Visi card */}
              <div
                className="p-8 md:p-10 rounded-[24px] md:rounded-[32px] relative overflow-hidden group transition-transform duration-300 hover:-translate-y-1"
                style={{
                  background: "#fff",
                  boxShadow: "0 20px 40px rgba(1,45,29,0.04)",
                  border: `1px solid ${C.outlineVariant}50`,
                }}
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Lightbulb size={120} style={{ color: C.primaryContainer }} />
                </div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: C.primaryContainer + "20" }}
                >
                  <Lightbulb size={26} style={{ color: C.primaryContainer }} />
                </div>
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: C.primary }}
                >
                  Visi
                </h3>
                <p
                  className="text-sm md:text-base italic leading-relaxed"
                  style={{ color: C.onSurfaceVariant }}
                >
                  "Menjadi lembaga pendidikan dasar Islam unggulan yang mencetak
                  generasi rabbani, berprestasi, berwawasan global, dan
                  berakhlakul karimah."
                </p>
              </div>

              {/* Misi card */}
              <div
                className="p-8 md:p-10 rounded-[24px] md:rounded-[32px] relative overflow-hidden group transition-transform duration-300 hover:-translate-y-1"
                style={{
                  background: "#fff",
                  boxShadow: "0 20px 40px rgba(203,167,47,0.06)",
                  border: `1px solid ${C.outlineVariant}50`,
                }}
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Flag size={120} style={{ color: C.tertiaryContainer }} />
                </div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: C.tertiaryContainer + "20" }}
                >
                  <Flag size={26} style={{ color: C.tertiaryContainer }} />
                </div>
                <h3
                  className="text-xl font-bold mb-5"
                  style={{ color: C.primary }}
                >
                  Misi
                </h3>
                <ul className="space-y-3">
                  {MISI.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2
                        size={18}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: C.tertiaryContainer }}
                      />
                      <span
                        className="text-sm md:text-base leading-relaxed"
                        style={{ color: C.onSurfaceVariant }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
