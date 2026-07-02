import { useEffect, useRef, useState } from "react";
import { ImageOff, ChevronDown, Loader2 } from "lucide-react";
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

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "kegiatan", label: "Kegiatan" },
  { key: "prestasi", label: "Prestasi" },
  { key: "ekstrakurikuler", label: "Ekstrakurikuler" },
  { key: "fasilitas", label: "Fasilitas" },
  { key: "acara", label: "Acara" },
];

const KATEGORI_LABEL = {
  kegiatan: "Kegiatan",
  prestasi: "Prestasi",
  ekstrakurikuler: "Ekstrakurikuler",
  fasilitas: "Fasilitas",
  acara: "Acara",
};

function GalleryCard({ item, isMobile }) {
  const isPrestasi = item.kategori === "prestasi";
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
        src={item.foto_url}
        alt={item.judul}
        loading="lazy"
      />
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
            {KATEGORI_LABEL[item.kategori] || item.kategori}
          </span>
          <h3
            className={`font-bold text-white leading-tight ${isMobile ? "text-base" : "text-lg md:text-2xl"}`}
          >
            {item.judul}
          </h3>
          {item.deskripsi && (
            <p className="text-xs md:text-sm mt-1" style={{ color: "#d8e3fa" }}>
              {item.deskripsi}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [galeri, setGaleri] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(9);
  const revealRefs = useRef([]);

  const addReveal = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  // Fetch data dari API
  useEffect(() => {
    window.scrollTo(0, 0);
    const apiBase = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8001/api";
    fetch(`${apiBase}/galeri`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setGaleri(json.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Kosongkan refs lama saat filter atau data berubah,
  // agar observer berikutnya hanya melihat elemen baru
  useEffect(() => {
    revealRefs.current = [];
  }, [activeFilter, galeri]);

  // Observe elemen setelah render (refs sudah terisi lewat addReveal)
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
  }, [activeFilter, galeri]);

  const filtered =
    activeFilter === "all"
      ? galeri
      : galeri.filter((i) => i.kategori === activeFilter);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

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

        @media (hover: hover) {
          .card-overlay { opacity: 0; transition: opacity 0.3s ease; }
          .gallery-card:hover .card-overlay { opacity: 1; }
        }
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

          {/* Filter chips */}
          <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex gap-2 md:gap-3 md:flex-wrap md:justify-center w-max md:w-auto mx-auto">
              {FILTERS.map(({ key, label }) => {
                const isActive = activeFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveFilter(key);
                      setVisibleCount(9);
                    }}
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

        {/* ── Gallery Grid ─────────────────────────────────────────────── */}
        <section className="px-4 md:px-12 max-w-[1200px] mx-auto pb-16 md:pb-24">
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2
                size={36}
                className="animate-spin"
                style={{ color: C.primaryContainer }}
              />
              <p style={{ color: C.onSurfaceVariant }}>Memuat galeri...</p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <ImageOff size={52} style={{ color: C.outlineVariant }} />
              <p style={{ color: C.onSurfaceVariant }}>
                Tidak ada foto untuk kategori ini.
              </p>
            </div>
          )}

          {/* Grid responsif — key memaksa remount saat filter berubah
               supaya class reveal-active di-reset dan animasi jalan ulang */}
          {!isLoading && visible.length > 0 && (
            <div
              key={activeFilter}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 reveal-section"
              ref={addReveal}
            >
              {visible.map((item) => (
                <div key={item.id} className="h-60 md:h-72">
                  <GalleryCard item={item} />
                </div>
              ))}
            </div>
          )}

          {/* Load more */}
          {!isLoading && hasMore && (
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
                onClick={() => setVisibleCount((c) => c + 9)}
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
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
