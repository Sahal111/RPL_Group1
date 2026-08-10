import { useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

const CATEGORIES = [
  "Semua",
  "Ibadah",
  "Pembelajaran",
  "Ekstrakurikuler",
  "Lomba",
  "Kegiatan Harian",
];

const GALLERY_ITEMS = [
  {
    id: 1,
    title: "Sholat Dhuha Berjamaah",
    category: "Ibadah",
    date: "12 Oktober 2023",
    description:
      "Rutinitas pagi siswa-siswi dalam mendekatkan diri kepada Allah SWT sebelum memulai kegiatan belajar mengajar.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB4QaNcxE8bJSa1Ct3hatwiIQgmCOgkCxPrImx6kKkwQI0DHn8NwuBCO38rq0xKRGOO1HLNnoTpbYtNVJ_1v96HbwoDJTbQ3PRYd53rtTKXMl1qWPOhZp4oAwSk8dumMEWu_Af8GK3zYJ1f868khF6DrgDIaRhy58KGtHp7j--XyqjyNEd-uXd0lTI5lRS36FMugX2ejfX3h_j-0u3x9Gl3ckNBXQzDAd5m2-iAEQUsfyOJq5FMyQnvS8o40vRr1CwnV8wwvamf2q5O",
    badgeColor: "text-primary",
  },
  {
    id: 2,
    title: "Pembacaan Ratib Bersama",
    category: "Kegiatan Harian",
    date: "10 Oktober 2023",
    description:
      "Kegiatan rutin pembacaan Ratib Al-Haddad untuk menanamkan kecintaan kepada dzikir dan doa bersama.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCacB7aOolbGbG2aprspS8pKExudcy9WmHGB-2ppsYQhNu-GomTqMB90Jbbz60vP1IcLymoT0z9mr2J5OGAg27Yg8KoLvDim2LLvu2Ogqhh4lZkU0jjNBAzZz7x50--NTYWHgTSrixbGF57TRSVcqADWNaLSWZFm39BxuGvgbNt3jHvl3kV7-5M9JzSReYe1PItvj4flc8LWbyrZO-t6swyyxSzb7mp-y7iZ1SDJUmNtFSoq9Pr8-sc_5519k7mC4WpZlMhis-pzJtA",
    badgeColor: "text-secondary",
  },
  {
    id: 3,
    title: "Praktik Ibadah Sholat",
    category: "Pembelajaran",
    date: "05 Oktober 2023",
    description:
      "Pembelajaran fiqih ibadah secara langsung dengan bimbingan guru untuk menyempurnakan gerakan dan bacaan sholat.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAZ28Ex1TbLdZyVmkpaqVM5eT-ZJrvon6g4c_-vT8AUWXXfKhMt0-K7KNuF4SMvakS7NwxLHyHM4U8vuA865DQAIgz4pP2kmkfQenthQKghjO63jUxVNIJwhbFmzyPkOBuLVwS1inQM_kW2vwq1q1J7u-Jylmp0soYbtFWJ_GmHswQLqV-mOY4KEZewjET4CSQE3jvQQoCwGUyFl_ea9k3yclCOC6ME41zYYezsK2xsuHdldxi1c9XNGJm81kYvK_gQSf9_6Kz4jxzy",
    badgeColor: "text-blue-500",
  },
  {
    id: 4,
    title: "Ujian Hafalan Juz Amma",
    category: "Ibadah",
    date: "01 Oktober 2023",
    description:
      "Mencetak generasi Qur'ani melalui program tahfidz unggulan dengan target hafalan minimal Juz 30 lulusan.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDRo8a8aGzPP97WmnBqWeu5itIWD5LTjstSkPK7JN54mykybK_zsPOJwpf0mh3QkvldaNmaBXKWWxWafQHgzd_6LBXG5BoEools_JwheVLxmIiSX1BzyPd2H49URpMMGXaqtOJz5a3YBjdNDr-_d6iWzewCBKoaH9bLE8LBUVyyEv8BlY3Wy08j_MIOw0hE9L6xiX3t6sr58DSM8PSZnzr5Xlv-EXn7gCXmEVuxHm1fZZAj_cRU32gu1h9BtsWynzCehgbVlqxkUVsq",
    badgeColor: "text-purple-500",
  },
  {
    id: 5,
    title: "Olahraga Futsal Ceria",
    category: "Ekstrakurikuler",
    date: "28 September 2023",
    description:
      "Mengembangkan bakat dan minat siswa di bidang olahraga serta melatih kerjasama tim yang solid.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA3wmCO_gYxV8YJJhSkvEYmL-S0zygLxEiNrbcVnYkttyg_VHHyeuFgy-ZSAZTz7Kyw62LgqAFcWZg1HSxaJgCHoJRVojFa7a-8I2X3IVfU4d4Nh0SC6_K30NfOxU43wEABoOq1ePbSUrzfsQ2sk4WbY4j72exB4JSbyRNO2tNvDm_4HImxaiZEn1kzniP08wL7CWWg3fPu3RLx6rtK1ieJJp_4vCsegAF8QSuZWK0Pc_H5S54gsoOZXmmbKRh1XiB7DWnlXftklbaq",
    badgeColor: "text-orange-500",
  },
  {
    id: 6,
    title: "Kunjungan Perpustakaan",
    category: "Pembelajaran",
    date: "25 September 2023",
    description:
      "Meningkatkan minat baca siswa melalui program kunjungan perpustakaan daerah dan sesi dongeng.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAChLMKf_CTbth2VUkyEJhBeVtEVlfA7bet8Jj71oHWVIYxl3f-cIwkTrmMMGYTlH8AiWRU-uP3CRueB4UDXuFAYKEvlQinugyC_q_Sjsy2cemiVhAqfEg-z9TgWzfe4zvtbw3BT4CBkFn5enQq1qMjZPPVqL-qfab7lrLHNdLymW76QkAYaC69v6Dg76zPh5HE-EO3WK7jXmSP2IeOUtNAske-kKS4ze-FnjIRShMYbGR_cUz_sE33ldIiYgtOVCzhigGWxQncTMYS",
    badgeColor: "text-blue-500",
  },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [lightboxImage, setLightboxImage] = useState(null);

  const filteredItems =
    activeCategory === "Semua"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display antialiased selection:bg-primary selection:text-white transition-colors duration-300">
      <PublicNavbar />

      {/* ── Hero Header ───────────────────────────────────────────────────── */}
      <header className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-madrasah-green/95 via-madrasah-green/80 to-background-light dark:to-background-dark z-10 transition-colors duration-300"></div>
          <img
            alt="Students doing group activity"
            className="w-full h-full object-cover object-center"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCacB7aOolbGbG2aprspS8pKExudcy9WmHGB-2ppsYQhNu-GomTqMB90Jbbz60vP1IcLymoT0z9mr2J5OGAg27Yg8KoLvDim2LLvu2Ogqhh4lZkU0jjNBAzZz7x50--NTYWHgTSrixbGF57TRSVcqADWNaLSWZFm39BxuGvgbNt3jHvl3kV7-5M9JzSReYe1PItvj4flc8LWbyrZO-t6swyyxSzb7mp-y7iZ1SDJUmNtFSoq9Pr8-sc_5519k7mC4WpZlMhis-pzJtA"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-lg">
            Galeri Kegiatan
            <span className="block text-primary mt-2">MI Nurul Huda 3</span>
          </h1>
          <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full mb-6"></div>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto font-light leading-relaxed">
            Dokumentasi perjalanan pendidikan, keceriaan, dan ibadah para siswa
            dalam membentuk generasi yang berakhlak mulia.
          </p>
        </div>
      </header>

      {/* ── Sticky Category Filter ────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-md ring-2 ring-primary ring-offset-2 dark:ring-offset-background-dark"
                    : "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-surface-dark hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Gallery Grid ──────────────────────────────────────────────────── */}
      <main className="py-12 bg-surface-light dark:bg-background-dark min-h-screen transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredItems.length === 0 ? (
            <div className="text-center py-24">
              <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4 block">
                photo_library
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                Belum ada foto untuk kategori ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border border-slate-100 dark:border-slate-800"
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      src={item.image}
                    />

                    {/* Hover Overlay */}
                    <button
                      onClick={() => setLightboxImage(item)}
                      className="absolute inset-0 bg-madrasah-green/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] cursor-pointer"
                      aria-label={`Lihat ${item.title}`}
                    >
                      <span className="material-symbols-outlined text-white text-5xl drop-shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        zoom_in
                      </span>
                    </button>

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm text-xs font-bold ${item.badgeColor} rounded-full uppercase tracking-wide`}
                      >
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs mb-3 font-medium">
                      <span className="material-symbols-outlined text-sm">
                        calendar_today
                      </span>
                      <span>{item.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Pagination ──────────────────────────────────────────────── */}
          {filteredItems.length > 0 && (
            <div className="mt-16 flex justify-center">
              <nav aria-label="Pagination" className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Previous page"
                >
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
                </button>

                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-colors ${
                      currentPage === page
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <span className="text-slate-400 dark:text-slate-500">...</span>

                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Next page"
                >
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </main>

      {/* ── CTA Section ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-madrasah-green relative overflow-hidden hero-pattern">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
            Tertarik dengan Kegiatan Kami?
          </h2>
          <p className="text-emerald-100 text-base sm:text-lg mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Bergabunglah bersama keluarga besar MI Nurul Huda 3 dan berikan
            pendidikan terbaik untuk buah hati Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register-ortu"
              className="px-8 py-4 bg-secondary hover:bg-yellow-600 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-yellow-900/20 transition-all transform hover:-translate-y-1 inline-flex items-center justify-center"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />

      {/* ── Lightbox Modal ────────────────────────────────────────────────── */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>

          <div
            className="max-w-5xl w-full bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.image}
              alt={lightboxImage.title}
              className="w-full max-h-[70vh] object-contain bg-black"
            />
            <div className="p-6">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2 font-medium">
                <span className="material-symbols-outlined text-sm">
                  calendar_today
                </span>
                <span>{lightboxImage.date}</span>
                <span className="mx-1">•</span>
                <span
                  className={`font-bold uppercase ${lightboxImage.badgeColor}`}
                >
                  {lightboxImage.category}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                {lightboxImage.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {lightboxImage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
