import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ImageOff, ChevronDown } from "lucide-react";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

const C = {
  primary: "#012d1d",
  primaryContainer: "#1b4332",
  secondary: "#2c694e",
  tertiaryContainer: "#cba72f",
  tertiaryFixed: "#ffe088",
  surface: "#f8f9fa",
  surfaceVariant: "#e1e3e4",
  onSurface: "#191c1d",
  onSurfaceVariant: "#414844",
  outlineVariant: "#c1c8c2",
  primaryFixedDim: "#a5d0b9",
};

const GALLERY_ITEMS = [
  {
    id: 1,
    category: "acara",
    label: "Acara",
    title: "Upacara Hari Kemerdekaan",
    desc: "Membangun semangat nasionalisme sejak dini.",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7FuZPG-wiPXXYfxyM_ssSXUtpWUHLLqf_1eLYrjNkW_6r45UPDxGtdHq72T_l2OI2P5lsCE4vKQocwSQcYInUd5h29vn-8fCzH44Sm_DMgW4YiXKuL6lEQkDbFrOln4Q_PjPfS2f0AP2wGPH3gbgHTNDi0h99g83yNUz02P0XpvwfQKtR55Hmr5iKhA3zDQ2HF4iPO2u4l1Ivj62jg357L_f4vz2xTVQgiCCMqd2T9VB00EBl8TZC7Ake-V2qv8AZglVN8plGKTs",
    size: "large", // col-span 8, row-span 2
  },
  {
    id: 2,
    category: "kegiatan",
    label: "Kegiatan",
    title: "Kelas Kaligrafi",
    desc: null,
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKu4MpLBXgR8PeWbVgzqLLzrngzrGaH_GZEC1g9ImbxL91l0661UHP3gZScz4g0B-4R4VKzbPnlkgMtHRhDap_i5gzDKZ8UojN6BS9hj_yJGoV9_pIzc7OAu3CsM9xzVF1oUB7yd8VDurOxghZe8U9K65F5xGrWwMe9Bbc4TijjPOlozaqyfO-cvqOMazQwipwcsbBcWoAJJi8SF4eSstTqiGo2K-VCCPPid1Tf7zI5SL1mmzbIvmxB5Hjz8k6x8Qqte_jKiHUK_k",
    size: "small",
  },
  {
    id: 3,
    category: "fasilitas",
    label: "Fasilitas",
    title: "Perpustakaan Digital",
    desc: null,
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBTXPrYEn3f57f93zUoD1IO2gGfagl6RLGDmiMtDHahbGBfyfQhPZy59wl6BL3dMIieHTFY2xPDUWJbQGiv0y-ja2EMBR6g87B_MMcXJMaDVlfxhHBWKkFxwkp0TynXLwiNUfkwLb5V4OB9aoP8U6itT8YrYcyJnjBkPZBUj7VY5Y3wpmlvY9lsJsJdQR9P7IYmeF_pgI14xnVARrTL0oRRATQQ9Mtqum1KN2P4CTJP-VIHRIvnCpr3fC_Dwsp7hg-Tws1Dx3xjAk",
    size: "small",
  },
  {
    id: 4,
    category: "prestasi",
    label: "Prestasi",
    title: "Juara Umum Olimpiade Sains",
    desc: "Tingkat Kabupaten tahun 2024.",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3lAZtajrD2ZVO3GZNdX68wpUyY5gUTOeB6FSbEOQdfvMB_xUKp9nye3509ob7EddgiL9NL7pGiGCTq9GUdf0uHpmqN_BxCjJWkgZeaO5-4YWTw4eS-WONLyQBStHRJtbZ5bbbhEkbtidOFbYbRGXfokbD35C9BqAWWWoXdrpdUG8BQC7X-uOBQhAy1Fvo9AJHFZR7jsAdbLsDeDycpAtA_BDIHPfAzj7LMWhOckahaQgokdB15Hv-NXnSfDEdtKWcjf0BqNbn3QE",
    size: "small",
  },
  {
    id: 5,
    category: "ekstrakurikuler",
    label: "Ekstrakurikuler",
    title: "Latihan Pencak Silat",
    desc: null,
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuSw3aOuPjZCHI08Xyj2nSVC1BRlzF1pQuMPMUtbozG5gIrE7LCN_x5OwcXO1t3WEnq06XTPGxRF3GETBpxLIUQhHCIGgy_dRp3wEfQ66YGc5GWNSHxtQNH4Bw-khKVDhCWks-WGNvKxE4ZALruNTwFgMuVoriWbXTHaEUcp5RuqAnBRLLZXnfuHNL24gmAZ8ut0OhUX_M-x0y7p80xxiH1VwvhIj0zpVYBCieUU7uNWkl8ZkyjAaPaM",
    size: "wide", // col-span 8
  },
];

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "kegiatan", label: "Kegiatan" },
  { key: "prestasi", label: "Prestasi" },
  { key: "ekstrakurikuler", label: "Ekstrakurikuler" },
  { key: "fasilitas", label: "Fasilitas" },
  { key: "acara", label: "Acara" },
];

function GalleryCard({ item, isMobile }) {
  const isPrestasi = item.category === "prestasi";
  const labelBg = isPrestasi ? "rgba(203,167,47,0.9)" : "rgba(1,45,29,0.15)";
  const labelColor = isPrestasi ? C.primary : "#a5d0b9";
  const labelBorder = isPrestasi
    ? "rgba(203,167,47,0.4)"
    : "rgba(161,208,185,0.3)";

  return (
    <div
      className="gallery-card group cursor-pointer rounded-[20px] md:rounded-[24px] overflow-hidden relative"
      style={{ background: "#dee8ff" }}
    >
      <img
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        src={item.src}
        alt={item.title}
        loading="lazy"
      />
      {/* Overlay — always visible on touch, hover only on pointer devices */}
      <div
        className="card-overlay absolute inset-0 flex flex-col justify-end"
        style={{
          background:
            "linear-gradient(to top, rgba(38,49,66,0.85) 0%, rgba(38,49,66,0.15) 50%, transparent 100%)",
        }}
      >
        <div className={isMobile ? "p-4" : "p-6 md:p-8"}>
          <span
            className="inline-block px-3 py-0.5 rounded-full text-xs font-bold mb-1.5 w-max backdrop-blur-sm border"
            style={{
              background: labelBg,
              color: labelColor,
              borderColor: labelBorder,
            }}
          >
            {item.label}
          </span>
          <h3
            className={`font-bold text-white leading-tight ${isMobile ? "text-base" : "text-lg md:text-2xl"}`}
          >
            {item.title}
          </h3>
          {item.desc && (
            <p className="text-xs md:text-sm mt-1" style={{ color: "#d8e3fa" }}>
              {item.desc}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState("all");
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

  const filtered =
    activeFilter === "all"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((i) => i.category === activeFilter);

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

        /* hover devices: overlay on hover */
        @media (hover: hover) {
          .card-overlay { opacity: 0; transition: opacity 0.3s ease; }
          .gallery-card:hover .card-overlay { opacity: 1; }
        }
        /* touch devices: overlay always visible */
        @media (hover: none) {
          .card-overlay { opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .gallery-card img { transition: none; }
          .card-overlay { transition: none; }
          .reveal-section { transition: none; }
        }
      `}</style>

      <PublicNavbar />

      <main className="min-h-screen pt-16 md:pt-20">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="pt-12 md:pt-20 pb-8 md:pb-12 px-4 md:px-12 max-w-[1200px] mx-auto text-center relative overflow-hidden">
          <div
            className="absolute top-[-20%] left-0 w-64 md:w-96 h-64 md:h-96 rounded-full -z-10 pointer-events-none"
            style={{
              background: "#8df7c1",
              opacity: 0.12,
              filter: "blur(80px)",
            }}
          />
          <div
            className="absolute bottom-[-20%] right-0 w-64 md:w-96 h-64 md:h-96 rounded-full -z-10 pointer-events-none"
            style={{
              background: "#ffe088",
              opacity: 0.12,
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
            Galeri
          </span>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3"
            style={{ color: C.onSurface }}
          >
            Galeri Kegiatan
          </h1>
          <p
            className="text-sm md:text-lg max-w-2xl mx-auto mb-10"
            style={{ color: C.onSurfaceVariant }}
          >
            Jelajahi momen-momen berharga dan aktivitas inspiratif di MI Nurul
            Huda 3. Tangkapan visual dari perjalanan pendidikan yang penuh
            makna.
          </p>

          {/* Filter chips — scrollable on mobile */}
          <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex gap-2 md:gap-3 md:flex-wrap md:justify-center w-max md:w-auto mx-auto">
              {FILTERS.map(({ key, label }) => {
                const isActive = activeFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveFilter(key)}
                    className="flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: isActive ? C.primaryContainer : "#e7eeff",
                      color: isActive ? "#fff" : C.onSurfaceVariant,
                      boxShadow: isActive
                        ? "0 2px 8px rgba(1,45,29,0.3)"
                        : "none",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Gallery ──────────────────────────────────────────────────── */}
        <section className="px-4 md:px-12 max-w-[1200px] mx-auto pb-16 md:pb-24">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <ImageOff size={52} style={{ color: C.outlineVariant }} />
              <p style={{ color: C.onSurfaceVariant }}>
                Tidak ada foto untuk kategori ini.
              </p>
            </div>
          ) : (
            <>
              {/* ── Desktop bento grid (md+) ─────────────────────────── */}
              <div
                className="hidden md:grid reveal-section"
                ref={addReveal}
                style={{
                  gridTemplateColumns: "repeat(12, 1fr)",
                  gridTemplateRows: "250px 250px 250px",
                  gap: "24px",
                }}
              >
                {/* Item 1 — large hero */}
                {(activeFilter === "all" || activeFilter === "acara") && (
                  <div
                    style={{ gridColumn: "1 / span 8", gridRow: "1 / span 2" }}
                  >
                    <GalleryCard item={GALLERY_ITEMS[0]} />
                  </div>
                )}

                {/* Items 2 & 3 — right column small */}
                {(activeFilter === "all" || activeFilter === "kegiatan") && (
                  <div style={{ gridColumn: "9 / span 4", gridRow: "1" }}>
                    <GalleryCard item={GALLERY_ITEMS[1]} />
                  </div>
                )}
                {(activeFilter === "all" || activeFilter === "fasilitas") && (
                  <div style={{ gridColumn: "9 / span 4", gridRow: "2" }}>
                    <GalleryCard item={GALLERY_ITEMS[2]} />
                  </div>
                )}

                {/* Item 4 — prestasi */}
                {(activeFilter === "all" || activeFilter === "prestasi") && (
                  <div style={{ gridColumn: "1 / span 4", gridRow: "3" }}>
                    <GalleryCard item={GALLERY_ITEMS[3]} />
                  </div>
                )}

                {/* Item 5 — wide */}
                {(activeFilter === "all" ||
                  activeFilter === "ekstrakurikuler") && (
                  <div style={{ gridColumn: "5 / span 8", gridRow: "3" }}>
                    <GalleryCard item={GALLERY_ITEMS[4]} />
                  </div>
                )}

                {/* Fallback: when filter yields nothing in bento, show message */}
                {activeFilter !== "all" && filtered.length === 0 && (
                  <div
                    style={{ gridColumn: "1 / -1", gridRow: "1" }}
                    className="flex items-center justify-center"
                  >
                    <p style={{ color: C.onSurfaceVariant }}>
                      Tidak ada foto untuk kategori ini.
                    </p>
                  </div>
                )}
              </div>

              {/* ── Mobile / tablet grid ─────────────────────────────── */}
              <div
                className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 reveal-section"
                ref={addReveal}
              >
                {filtered.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`h-52 ${item.size === "wide" && idx === filtered.length - 1 ? "sm:col-span-2 sm:h-56" : ""}`}
                  >
                    <GalleryCard item={item} isMobile />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Load more */}
          <div
            className="mt-10 md:mt-14 flex justify-center reveal-section"
            ref={addReveal}
          >
            <button
              className="flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
              style={{
                border: `2px solid ${C.outlineVariant}`,
                color: C.primary,
                background: "transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = C.primaryContainer)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = C.outlineVariant)
              }
            >
              Muat Lebih Banyak
              <ChevronDown size={16} />
            </button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
