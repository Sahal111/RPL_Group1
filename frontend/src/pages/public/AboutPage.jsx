import { useRef } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

export default function AboutPage() {
  const scrollContainerRef = useRef(null);

  const scrollFacilities = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const staffList = [
    {
      name: "Siti Aminah, S.Ag",
      role: "Waka Kurikulum",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4QaNcxE8bJSa1Ct3hatwiIQgmCOgkCxPrImx6kKkwQI0DHn8NwuBCO38rq0xKRGOO1HLNnoTpbYtNVJ_1v96HbwoDJTbQ3PRYd53rtTKXMl1qWPOhZp4oAwSk8dumMEWu_Af8GK3zYJ1f868khF6DrgDIaRhy58KGtHp7j--XyqjyNEd-uXd0lTI5lRS36FMugX2ejfX3h_j-0u3x9Gl3ckNBXQzDAd5m2-iAEQUsfyOJq5FMyQnvS8o40vRr1CwnV8wwvamf2q5O",
    },
    {
      name: "Rahmat Hidayat, S.Pd",
      role: "Waka Kesiswaan",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3wmCO_gYxV8YJJhSkvEYmL-S0zygLxEiNrbcVnYkttyg_VHHyeuFgy-ZSAZTz7Kyw62LgqAFcWZg1HSxaJgCHoJRVojFa7a-8I2X3IVfU4d4Nh0SC6_K30NfOxU43wEABoOq1ePbSUrzfsQ2sk4WbY4j72exB4JSbyRNO2tNvDm_4HImxaiZEn1kzniP08wL7CWWg3fPu3RLx6rtK1ieJJp_4vCsegAF8QSuZWK0Pc_H5S54gsoOZXmmbKRh1XiB7DWnlXftklbaq",
    },
    {
      name: "Fatimah Zahra, S.E",
      role: "Bendahara",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRo8a8aGzPP97WmnBqWeu5itIWD5LTjstSkPK7JN54mykybK_zsPOJwpf0mh3QkvldaNmaBXKWWxWafQHgzd_6LBXG5BoEools_JwheVLxmIiSX1BzyPd2H49URpMMGXaqtOJz5a3YBjdNDr-_d6iWzewCBKoaH9bLE8LBUVyyEv8BlY3Wy08j_MIOw0hE9L6xiX3t6sr58DSM8PSZnzr5Xlv-EXn7gCXmEVuxHm1fZZAj_cRU32gu1h9BtsWynzCehgbVlqxkUVsq",
    },
    {
      name: "Budi Santoso, S.Kom",
      role: "Tata Usaha",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCacB7aOolbGbG2aprspS8pKExudcy9WmHGB-2ppsYQhNu-GomTqMB90Jbbz60vP1IcLymoT0z9mr2J5OGAg27Yg8KoLvDim2LLvu2Ogqhh4lZkU0jjNBAzZz7x50--NTYWHgTSrixbGF57TRSVcqADWNaLSWZFm39BxuGvgbNt3jHvl3kV7-5M9JzSReYe1PItvj4flc8LWbyrZO-t6swyyxSzb7mp-y7iZ1SDJUmNtFSoq9Pr8-sc_5519k7mC4WpZlMhis-pzJtA",
    },
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display antialiased selection:bg-primary selection:text-white transition-colors duration-300">
      <PublicNavbar />

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-slate-50 dark:bg-background-dark transition-colors duration-300">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#0f766e 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Breadcrumb Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-8 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 shadow-sm text-sm font-medium text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-primary transition-colors">
              Beranda
            </Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-primary font-bold">Profil Madrasah</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
            Mengenal Lebih Dekat <br className="hidden md:block" />
            <span className="text-madrasah-green dark:text-primary relative inline-block">
              Nurul Huda 3
              <svg
                className="absolute w-full h-3 -bottom-1 left-0 text-secondary opacity-60"
                viewBox="0 0 200 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.00025 6.99997C25.7501 9.77491 55.986 3.2309 83 2.99999C114.735 2.72866 142.484 7.00003 197 7"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
            Sebuah ikhtiar merawat tradisi keilmuan Islam sambil menyongsong
            kemajuan zaman dengan integritas dan inovasi.
          </p>
        </div>
      </section>

      {/* ── Sejarah Section ───────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white dark:bg-background-dark relative overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image Box */}
            <div className="relative group order-2 lg:order-1">
              <div className="absolute inset-0 bg-secondary rounded-3xl rotate-3 opacity-20 group-hover:rotate-6 transition-transform duration-500"></div>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                <img
                  alt="Sejarah Pendirian MI Nurul Huda 3"
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCacB7aOolbGbG2aprspS8pKExudcy9WmHGB-2ppsYQhNu-GomTqMB90Jbbz60vP1IcLymoT0z9mr2J5OGAg27Yg8KoLvDim2LLvu2Ogqhh4lZkU0jjNBAzZz7x50--NTYWHgTSrixbGF57TRSVcqADWNaLSWZFm39BxuGvgbNt3jHvl3kV7-5M9JzSReYe1PItvj4flc8LWbyrZO-t6swyyxSzb7mp-y7iZ1SDJUmNtFSoq9Pr8-sc_5519k7mC4WpZlMhis-pzJtA"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <p className="text-sm uppercase tracking-widest opacity-80 mb-1">
                    Established
                  </p>
                  <p className="text-4xl font-black">1985</p>
                </div>
              </div>
            </div>

            {/* Text Box */}
            <div className="space-y-8 order-1 lg:order-2">
              <div className="inline-block">
                <h2 className="text-secondary font-bold tracking-widest text-sm uppercase mb-2">
                  Sejarah Singkat
                </h2>
                <h3 className="text-3xl md:text-5xl font-black text-madrasah-green dark:text-white leading-tight tracking-tight">
                  Perjalanan Keilmuan &amp;{" "}
                  <span className="text-primary italic">Pengabdian.</span>
                </h3>
              </div>

              <div className="space-y-4 text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed text-justify">
                <p>
                  MI Nurul Huda 3 didirikan pada tahun 1985 oleh para tokoh agama
                  setempat yang memiliki visi besar untuk menghadirkan pendidikan
                  dasar Islam berkualitas. Berawal dari bangunan sederhana,
                  madrasah ini bertransformasi menjadi pusat peradaban kecil di
                  lingkungan kami.
                </p>
                <p>
                  Selama puluhan tahun, kami konsisten menjaga nilai-nilai luhur
                  kepesantrenan (<em>At-Turats</em>) yang dipadukan harmonis
                  dengan kurikulum modern. Perjalanan ini telah melahirkan ribuan
                  alumni yang kini berkiprah membawa misi{" "}
                  <em>Rahmatan lil 'Alamin</em>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Visi & Misi Section ───────────────────────────────────────────── */}
      <section className="py-24 bg-surface-light dark:bg-surface-dark relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-madrasah-green dark:text-white mb-4 tracking-tight">
              Komitmen Kami
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Visi Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-madrasah-green to-[#0f4c3a] rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden flex flex-col justify-center shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-9xl">
                  verified
                </span>
              </div>
              <span className="inline-block py-1 px-3.5 rounded-lg bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-widest w-fit mb-6">
                Visi
              </span>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-black leading-snug mb-6 italic">
                "Terwujudnya generasi Qur'ani, Berakhlak Mulia, Cerdas, dan
                Unggul."
              </h3>
              <p className="text-white/80 font-medium text-sm sm:text-base">
                Menjadi mercusuar pendidikan yang menyeimbangkan IMTAQ dan IPTEK.
              </p>
            </div>

            {/* Misi Card */}
            <div className="lg:col-span-3 bg-white dark:bg-background-dark rounded-[2.5rem] p-8 md:p-10 shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col justify-center transition-colors duration-300">
              <span className="text-primary font-bold uppercase tracking-widest text-xs mb-8 block">
                Misi Utama
              </span>
              <div className="grid gap-6">
                <div className="flex group">
                  <div className="shrink-0 mr-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      1
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-white text-lg mb-1">
                      Pendidikan Qur'ani
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      Pendidikan berbasis nilai-nilai Al-Qur'an dan As-Sunnah
                      yang terintegrasi.
                    </p>
                  </div>
                </div>

                <div className="flex group">
                  <div className="shrink-0 mr-6">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xl group-hover:bg-secondary group-hover:text-white transition-colors duration-300">
                      2
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-white text-lg mb-1">
                      Potensi Optimal
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      Mengembangkan potensi akademik dan non-akademik siswa secara
                      seimbang.
                    </p>
                  </div>
                </div>

                <div className="flex group">
                  <div className="shrink-0 mr-6">
                    <div className="w-12 h-12 rounded-2xl bg-madrasah-green/10 text-madrasah-green dark:bg-primary/20 dark:text-primary flex items-center justify-center font-bold text-xl group-hover:bg-madrasah-green group-hover:text-white transition-colors duration-300">
                      3
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-white text-lg mb-1">
                      Karakter Islami
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      Membentuk adab melalui pembiasaan ibadah harian yang
                      terpantau.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Struktur Organisasi Section ──────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-background-dark transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-secondary font-bold tracking-wider text-sm uppercase">
              Tim Manajemen
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-madrasah-green dark:text-white mt-2 tracking-tight">
              Struktur Organisasi
            </h2>
          </div>

          {/* Headmaster Card */}
          <div className="flex justify-center mb-16">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative flex flex-col items-center bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 max-w-sm text-center">
                <div className="w-32 h-32 rounded-full p-1 border-2 border-dashed border-primary mb-6 overflow-hidden shrink-0">
                  <img
                    alt="Kepala Madrasah"
                    className="w-full h-full object-cover rounded-full"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZ28Ex1TbLdZyVmkpaqVM5eT-ZJrvon6g4c_-vT8AUWXXfKhMt0-K7KNuF4SMvakS7NwxLHyHM4U8vuA865DQAIgz4pP2kmkfQenthQKghjO63jUxVNIJwhbFmzyPkOBuLVwS1inQM_kW2vwq1q1J7u-Jylmp0soYbtFWJ_GmHswQLqV-mOY4KEZewjET4CSQE3jvQQoCwGUyFl_ea9k3yclCOC6ME41zYYezsK2xsuHdldxi1c9XNGJm81kYvK_gQSf9_6Kz4jxzy"
                  />
                </div>
                <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                  H. Ahmad Syarifuddin, M.Pd
                </h4>
                <p className="text-primary font-semibold text-sm mb-4">
                  Kepala Madrasah
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                  "Memimpin dengan hati, mendidik dengan keteladanan."
                </p>
              </div>
            </div>
          </div>

          {/* Staff Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {staffList.map((staff, idx) => (
              <div
                key={idx}
                className="group bg-surface-light dark:bg-surface-dark rounded-2xl p-6 text-center hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
              >
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-4 grayscale group-hover:grayscale-0 transition-all duration-500">
                  <img
                    alt={staff.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform"
                    src={staff.img}
                  />
                </div>
                <h5 className="font-bold text-slate-800 dark:text-white text-sm md:text-base mb-1">
                  {staff.name}
                </h5>
                <p className="text-xs text-secondary font-medium uppercase tracking-wide">
                  {staff.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fasilitas Section ────────────────────────────────────────────── */}
      <section className="py-24 bg-surface-light dark:bg-surface-dark overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-madrasah-green dark:text-white tracking-tight">
                Fasilitas Unggulan
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-base sm:text-lg">
                Infrastruktur modern untuk menunjang kenyamanan belajar.
              </p>
            </div>

            <div className="hidden md:flex gap-2">
              <button
                onClick={() => scrollFacilities("left")}
                className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-colors cursor-pointer"
                aria-label="Previous facility"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <button
                onClick={() => scrollFacilities("right")}
                className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-colors cursor-pointer"
                aria-label="Next facility"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-8 pb-12 hide-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {/* Facility 1 */}
            <div className="min-w-[300px] md:min-w-[400px] snap-center bg-white dark:bg-background-dark rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group border border-slate-100 dark:border-slate-800">
              <div className="h-56 overflow-hidden relative">
                <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-black/80 backdrop-blur text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Literasi
                </div>
                <img
                  alt="Perpustakaan Digital"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCacB7aOolbGbG2aprspS8pKExudcy9WmHGB-2ppsYQhNu-GomTqMB90Jbbz60vP1IcLymoT0z9mr2J5OGAg27Yg8KoLvDim2LLvu2Ogqhh4lZkU0jjNBAzZz7x50--NTYWHgTSrixbGF57TRSVcqADWNaLSWZFm39BxuGvgbNt3jHvl3kV7-5M9JzSReYe1PItvj4flc8LWbyrZO-t6swyyxSzb7mp-y7iZ1SDJUmNtFSoq9Pr8-sc_5519k7mC4WpZlMhis-pzJtA"
                />
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-primary transition-colors">
                  Perpustakaan Digital
                </h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6 text-sm">
                  Akses ribuan buku digital dan fisik dalam ruangan yang nyaman,
                  ber-AC, dan ramah anak.
                </p>
                <Link
                  to="/gallery"
                  className="inline-flex items-center text-sm font-bold text-secondary hover:text-yellow-600 transition-colors"
                >
                  Lihat Detail{" "}
                  <span className="material-symbols-outlined text-base ml-1">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>

            {/* Facility 2 */}
            <div className="min-w-[300px] md:min-w-[400px] snap-center bg-white dark:bg-background-dark rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group border border-slate-100 dark:border-slate-800">
              <div className="h-56 overflow-hidden relative">
                <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-black/80 backdrop-blur text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Teknologi
                </div>
                <img
                  alt="Laboratorium Komputer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZ28Ex1TbLdZyVmkpaqVM5eT-ZJrvon6g4c_-vT8AUWXXfKhMt0-K7KNuF4SMvakS7NwxLHyHM4U8vuA865DQAIgz4pP2kmkfQenthQKghjO63jUxVNIJwhbFmzyPkOBuLVwS1inQM_kW2vwq1q1J7u-Jylmp0soYbtFWJ_GmHswQLqV-mOY4KEZewjET4CSQE3jvQQoCwGUyFl_ea9k3yclCOC6ME41zYYezsK2xsuHdldxi1c9XNGJm81kYvK_gQSf9_6Kz4jxzy"
                />
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-primary transition-colors">
                  Laboratorium Komputer
                </h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6 text-sm">
                  Pusat pelatihan IT dengan perangkat terbaru untuk menunjang
                  kecakapan digital (Coding &amp; Office).
                </p>
                <Link
                  to="/gallery"
                  className="inline-flex items-center text-sm font-bold text-secondary hover:text-yellow-600 transition-colors"
                >
                  Lihat Detail{" "}
                  <span className="material-symbols-outlined text-base ml-1">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>

            {/* Facility 3 */}
            <div className="min-w-[300px] md:min-w-[400px] snap-center bg-white dark:bg-background-dark rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group border border-slate-100 dark:border-slate-800">
              <div className="h-56 overflow-hidden relative">
                <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-black/80 backdrop-blur text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Ibadah
                </div>
                <img
                  alt="Masjid Sekolah"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4QaNcxE8bJSa1Ct3hatwiIQgmCOgkCxPrImx6kKkwQI0DHn8NwuBCO38rq0xKRGOO1HLNnoTpbYtNVJ_1v96HbwoDJTbQ3PRYd53rtTKXMl1qWPOhZp4oAwSk8dumMEWu_Af8GK3zYJ1f868khF6DrgDIaRhy58KGtHp7j--XyqjyNEd-uXd0lTI5lRS36FMugX2ejfX3h_j-0u3x9Gl3ckNBXQzDAd5m2-iAEQUsfyOJq5FMyQnvS8o40vRr1CwnV8wwvamf2q5O"
                />
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-primary transition-colors">
                  Masjid Sekolah
                </h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6 text-sm">
                  Pusat kegiatan keagamaan, shalat berjamaah Dhuha &amp; Dhuhur,
                  serta tahfidz Al-Qur'an harian.
                </p>
                <Link
                  to="/gallery"
                  className="inline-flex items-center text-sm font-bold text-secondary hover:text-yellow-600 transition-colors"
                >
                  Lihat Detail{" "}
                  <span className="material-symbols-outlined text-base ml-1">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
