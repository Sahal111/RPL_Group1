import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicNavbar from "./public/PublicNavbar";
import PublicFooter from "./public/PublicFooter";
import heroImageFallback from "../assets/background.jpg";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const heroImgUrl =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDRo8a8aGzPP97WmnBqWeu5itIWD5LTjstSkPK7JN54mykybK_zsPOJwpf0mh3QkvldaNmaBXKWWxWafQHgzd_6LBXG5BoEools_JwheVLxmIiSX1BzyPd2H49URpMMGXaqtOJz5a3YBjdNDr-_d6iWzewCBKoaH9bLE8LBUVyyEv8BlY3Wy08j_MIOw0hE9L6xiX3t6sr58DSM8PSZnzr5Xlv-EXn7gCXmEVuxHm1fZZAj_cRU32gu1h9BtsWynzCehgbVlqxkUVsq";

  const galleryImages = [
    {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCacB7aOolbGbG2aprspS8pKExudcy9WmHGB-2ppsYQhNu-GomTqMB90Jbbz60vP1IcLymoT0z9mr2J5OGAg27Yg8KoLvDim2LLvu2Ogqhh4lZkU0jjNBAzZz7x50--NTYWHgTSrixbGF57TRSVcqADWNaLSWZFm39BxuGvgbNt3jHvl3kV7-5M9JzSReYe1PItvj4flc8LWbyrZO-t6swyyxSzb7mp-y7iZ1SDJUmNtFSoq9Pr8-sc_5519k7mC4WpZlMhis-pzJtA",
      title: "Kegiatan Membaca Bersama",
      span: "col-span-2 row-span-2",
    },
    {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZ28Ex1TbLdZyVmkpaqVM5eT-ZJrvon6g4c_-vT8AUWXXfKhMt0-K7KNuF4SMvakS7NwxLHyHM4U8vuA865DQAIgz4pP2kmkfQenthQKghjO63jUxVNIJwhbFmzyPkOBuLVwS1inQM_kW2vwq1q1J7u-Jylmp0soYbtFWJ_GmHswQLqV-mOY4KEZewjET4CSQE3jvQQoCwGUyFl_ea9k3yclCOC6ME41zYYezsK2xsuHdldxi1c9XNGJm81kYvK_gQSf9_6Kz4jxzy",
      title: "Proses Pembelajaran Interaktif",
      span: "col-span-1 row-span-1",
    },
    {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3wmCO_gYxV8YJJhSkvEYmL-S0zygLxEiNrbcVnYkttyg_VHHyeuFgy-ZSAZTz7Kyw62LgqAFcWZg1HSxaJgCHoJRVojFa7a-8I2X3IVfU4d4Nh0SC6_K30NfOxU43wEABoOq1ePbSUrzfsQ2sk4WbY4j72exB4JSbyRNO2tNvDm_4HImxaiZEn1kzniP08wL7CWWg3fPu3RLx6rtK1ieJJp_4vCsegAF8QSuZWK0Pc_H5S54gsoOZXmmbKRh1XiB7DWnlXftklbaq",
      title: "Kegiatan Olahraga & Ekstrakurikuler",
      span: "col-span-1 row-span-1",
    },
    {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4QaNcxE8bJSa1Ct3hatwiIQgmCOgkCxPrImx6kKkwQI0DHn8NwuBCO38rq0xKRGOO1HLNnoTpbYtNVJ_1v96HbwoDJTbQ3PRYd53rtTKXMl1qWPOhZp4oAwSk8dumMEWu_Af8GK3zYJ1f868khF6DrgDIaRhy58KGtHp7j--XyqjyNEd-uXd0lTI5lRS36FMugX2ejfX3h_j-0u3x9Gl3ckNBXQzDAd5m2-iAEQUsfyOJq5FMyQnvS8o40vRr1CwnV8wwvamf2q5O",
      title: "Praktek Ibadah",
      span: "col-span-2 md:col-span-2 row-span-1",
    },
  ];

  const handleMobileTabClick = (index, action) => {
    setActiveTab(index);
    if (action === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (action === "news") {
      navigate("/about");
    } else if (action === "menu") {
      const el = document.getElementById("keunggulan");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (action === "gallery") {
      navigate("/gallery");
    } else if (action === "contact") {
      navigate("/contact");
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display antialiased selection:bg-primary selection:text-white transition-colors duration-300">
      {/* Navbar */}
      <PublicNavbar />

      {/* Hero Section */}
      <header className="relative pt-24 pb-16 lg:pt-36 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-madrasah-green/90 via-madrasah-green/80 to-background-light dark:to-background-dark z-10 transition-colors duration-300"></div>
          <img
            alt="Siswa SD MI Nurul Huda 3"
            className="w-full h-full object-cover object-center"
            src={heroImgUrl}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = heroImageFallback;
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium mb-6 shadow-sm animate-fade-in">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            Penerimaan Peserta Didik Baru (PPDB) Telah Dibuka
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6 drop-shadow-md">
            Membentuk Generasi{" "}
            <span className="text-primary drop-shadow">Qur'ani</span>,{" "}
            <br className="hidden md:block" />
            Cerdas &amp; Berakhlak Mulia
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Mewujudkan pendidikan Islam yang unggul, modern, dan berkarakter
            untuk masa depan buah hati Anda di lingkungan yang asri dan
            kondusif.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
            <Link
              to="/register-ortu"
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
            >
              <span>Cek Info PPDB</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>

            <a
              href="#keunggulan"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">grid_view</span>
              <span>Lihat Keunggulan</span>
            </a>
          </div>
        </div>
      </header>

      {/* Statistics Section */}
      <section className="relative z-20 -mt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-surface-dark rounded-2xl shadow-xl p-6 border border-slate-100 dark:border-slate-800 transition-colors duration-300">
          {/* Stat 1 */}
          <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-light dark:hover:bg-black/20 transition-colors">
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <span className="material-symbols-outlined text-3xl">groups</span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white">
                1000+
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Alumni Berprestasi
              </p>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-light dark:hover:bg-black/20 transition-colors border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-3xl">
                verified_user
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white">
                50+
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Guru Tersertifikasi
              </p>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-light dark:hover:bg-black/20 transition-colors border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined text-3xl">
                trophy
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white">
                20+
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Ekstrakurikuler
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Excellence Section */}
      <section
        id="keunggulan"
        className="py-16 md:py-24 bg-surface-light dark:bg-background-dark relative overflow-hidden transition-colors duration-300"
      >
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-primary font-bold tracking-wider text-xs sm:text-sm uppercase mb-3">
              Keunggulan Kami
            </h2>
            <h3 className="text-3xl md:text-4xl font-black text-madrasah-green dark:text-white mb-6 tracking-tight">
              Kenapa Memilih MI Nurul Huda 3?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
              Kami memadukan kurikulum nasional dengan nilai-nilai keislaman yang
              kuat untuk mencetak generasi pemimpin masa depan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Card 1 */}
            <div className="group bg-white dark:bg-surface-dark rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-3xl">
                  auto_stories
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                Tahfidz Al-Qur'an
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                Program unggulan hafalan Juz 30 dan surat pilihan dengan metode
                talaqqi yang mutqin dan menyenangkan bagi anak.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-white dark:bg-surface-dark rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-3xl">
                  devices
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                Digital Classroom
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                Fasilitas pembelajaran modern dengan smart TV dan proyektor di
                setiap kelas untuk menunjang pembelajaran interaktif.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-white dark:bg-surface-dark rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-3xl">
                  diversity_1
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                Character Building
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                Pembiasaan sholat dhuha, dzuhur berjamaah, dan adab islami
                sehari-hari untuk membentuk akhlakul karimah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-16 bg-white dark:bg-background-dark transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h3 className="text-3xl font-black text-madrasah-green dark:text-white mb-2 tracking-tight">
                Galeri Kegiatan
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                Intip keseruan belajar dan bermain di MI Nurul Huda 3
              </p>
            </div>
            <Link
              to="/gallery"
              className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all text-sm"
            >
              Lihat Semua{" "}
              <span className="material-symbols-outlined text-lg">
                arrow_forward
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-96 md:h-80">
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                className={`${img.span} rounded-2xl overflow-hidden relative group bg-slate-100 dark:bg-slate-800`}
              >
                <img
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={img.url}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = heroImageFallback;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 sm:p-6">
                  <p className="text-white font-medium text-xs sm:text-sm">
                    {img.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-madrasah-green relative overflow-hidden hero-pattern">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-block p-3 rounded-full bg-white/10 backdrop-blur-sm mb-6">
            <span className="material-symbols-outlined text-4xl text-secondary">
              school
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
            Siap Bergabung Menjadi Bagian Keluarga Besar Kami?
          </h2>

          <p className="text-emerald-100 text-base sm:text-lg mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Kuota terbatas. Segera daftarkan putra-putri Anda untuk mendapatkan
            pendidikan terbaik berbasis Islam.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register-ortu"
              className="px-8 py-4 bg-secondary hover:bg-yellow-600 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-yellow-900/20 transition-all transform hover:-translate-y-1 inline-flex items-center justify-center gap-2"
            >
              Daftar Online Sekarang
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 bg-transparent border-2 border-emerald-400 hover:bg-emerald-800 text-white rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">call</span>
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 px-6 pointer-events-auto">
        <div className="bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[35px] shadow-2xl h-20 relative overflow-hidden">
          <div className="grid grid-cols-5 h-full relative">
            <div
              id="nav-indicator"
              className="absolute bg-madrasah-green dark:bg-primary w-14 h-14 rounded-full z-0 top-[-20px]"
              style={{
                left: `calc(${activeTab} * 20% + 10% - 28px)`,
              }}
            ></div>

            <button
              onClick={() => handleMobileTabClick(0, "home")}
              className={`mobile-tab ${
                activeTab === 0 ? "active" : ""
              } flex flex-col items-center justify-center w-full h-full z-10`}
            >
              <div className="icon-wrapper flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">
                  home
                </span>
              </div>
              <span className="tab-label text-[11px] mt-1">Beranda</span>
            </button>

            <button
              onClick={() => handleMobileTabClick(1, "news")}
              className={`mobile-tab ${
                activeTab === 1 ? "active" : ""
              } flex flex-col items-center justify-center w-full h-full z-10`}
            >
              <div className="icon-wrapper flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">
                  description
                </span>
              </div>
              <span className="tab-label text-[11px] mt-1">Berita</span>
            </button>

            <button
              onClick={() => handleMobileTabClick(2, "menu")}
              className={`mobile-tab ${
                activeTab === 2 ? "active" : ""
              } flex flex-col items-center justify-center w-full h-full z-10`}
            >
              <div className="icon-wrapper flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">
                  grid_view
                </span>
              </div>
              <span className="tab-label text-[11px] mt-1">Menu</span>
            </button>

            <button
              onClick={() => handleMobileTabClick(3, "gallery")}
              className={`mobile-tab ${
                activeTab === 3 ? "active" : ""
              } flex flex-col items-center justify-center w-full h-full z-10`}
            >
              <div className="icon-wrapper flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">
                  image
                </span>
              </div>
              <span className="tab-label text-[11px] mt-1">Galeri</span>
            </button>

            <button
              onClick={() => handleMobileTabClick(4, "contact")}
              className={`mobile-tab ${
                activeTab === 4 ? "active" : ""
              } flex flex-col items-center justify-center w-full h-full z-10`}
            >
              <div className="icon-wrapper flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">
                  help_center
                </span>
              </div>
              <span className="tab-label text-[11px] mt-1">Kontak</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button (WhatsApp FAB) */}
      <a
        id="wa-fab"
        href="https://wa.me/6285811723878?text=Halo%20MI%20Nurul%20Huda%203,%20saya%20ingin%20bertanya%20mengenai%20PPDB"
        target="_blank"
        rel="noreferrer"
        className="fixed z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group"
        aria-label="Hubungi WhatsApp"
        title="Hubungi kami via WhatsApp"
      >
        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      </a>
    </div>
  );
}
