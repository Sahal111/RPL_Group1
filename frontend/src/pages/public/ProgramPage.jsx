import { Link } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

export default function ProgramPage() {
  const programs = [
    {
      title: "Kegiatan Sholat Dhuha",
      icon: "sunny",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      iconColor: "text-orange-500 dark:text-orange-400",
      items: [
        "Pembiasaan ibadah pagi sebelum memulai pelajaran",
        "Pembentukan disiplin spiritual siswa",
        "Pendampingan intensif oleh guru kelas",
      ],
    },
    {
      title: "Pembacaan Ratib & Doa",
      icon: "menu_book",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      items: [
        "Rutin membaca Ratib Al-Haddad",
        "Dzikir pagi (Al-Ma'tsurat) bersama",
        "Pengenalan adab berdoa yang baik",
      ],
    },
    {
      title: "Praktik Ibadah",
      icon: "self_care",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      items: [
        "Praktik wudhu yang benar & tertib",
        "Praktik gerakan dan bacaan sholat",
        "Pelatihan Adzan & Iqomah untuk putra",
      ],
    },
    {
      title: "Hafalan Juz Amma & Asmaul Husna",
      icon: "auto_stories",
      bgColor: "bg-teal-50 dark:bg-teal-900/20",
      iconColor: "text-teal-600 dark:text-teal-400",
      items: [
        "Metode Talaqqi (face-to-face)",
        "Murojaah rutin setiap pagi",
        "Target setoran hafalan terukur",
      ],
    },
    {
      title: "Kegiatan Olahraga",
      icon: "fitness_center",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
      items: [
        "Senam pagi bersama untuk kebugaran",
        "Permainan edukatif & kerjasama tim",
        "Pengembangan kemampuan motorik",
      ],
    },
    {
      title: "Ekstrakurikuler",
      icon: "groups",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      items: [
        "Pramuka (Wajib)",
        "Seni Hadroh & Drumband",
        "Seni Kaligrafi Islam",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display antialiased selection:bg-primary selection:text-white transition-colors duration-300">
      <PublicNavbar />

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-madrasah-green">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-madrasah-green/90 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-madrasah-green via-transparent to-transparent z-10"></div>
          <img
            alt="Students reading Quran in a group"
            className="w-full h-full object-cover object-center mix-blend-overlay opacity-40"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4QaNcxE8bJSa1Ct3hatwiIQgmCOgkCxPrImx6kKkwQI0DHn8NwuBCO38rq0xKRGOO1HLNnoTpbYtNVJ_1v96HbwoDJTbQ3PRYd53rtTKXMl1qWPOhZp4oAwSk8dumMEWu_Af8GK3zYJ1f868khF6DrgDIaRhy58KGtHp7j--XyqjyNEd-uXd0lTI5lRS36FMugX2ejfX3h_j-0u3x9Gl3ckNBXQzDAd5m2-iAEQUsfyOJq5FMyQnvS8o40vRr1CwnV8wwvamf2q5O"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4 drop-shadow-lg">
            Program Unggulan <br />
            <span className="relative inline-block pb-2">
              Madrasah
              <span className="absolute bottom-0 left-0 w-full h-1.5 bg-secondary rounded-full"></span>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mt-6 font-light leading-relaxed">
            Membangun fondasi karakter Islami yang kokoh melalui pembiasaan ibadah
            harian dan kurikulum yang terintegrasi.
          </p>
        </div>
      </header>

      {/* ── Daily Habituation Cards ───────────────────────────────────────── */}
      <section className="py-16 bg-surface-light dark:bg-background-dark -mt-10 rounded-t-[2.5rem] relative z-30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary font-bold tracking-wider text-xs sm:text-sm uppercase mb-2 block">
              Kurikulum Berbasis Karakter
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-madrasah-green dark:text-white tracking-tight">
              Kegiatan &amp; Pembiasaan Harian
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {programs.map((prog, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div
                  className={`w-14 h-14 rounded-xl ${prog.bgColor} ${prog.iconColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <span className="material-symbols-outlined text-3xl">
                    {prog.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 group-hover:text-primary transition-colors">
                  {prog.title}
                </h3>
                <ul className="space-y-3">
                  {prog.items.map((item, itemIdx) => (
                    <li
                      key={itemIdx}
                      className="flex items-start gap-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed"
                    >
                      <span className="material-symbols-outlined text-secondary text-lg mt-0.5 shrink-0">
                        check_circle
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-madrasah-green dark:text-white mb-6 tracking-tight">
            Tertarik dengan Program Kami?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Bergabunglah bersama keluarga besar MI Nurul Huda 3 dan berikan
            pendidikan terbaik yang seimbang antara ilmu agama dan umum untuk
            buah hati Anda.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register-ortu"
              className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">how_to_reg</span>
              Daftar Sekarang
            </Link>

            <a
              href="#brosur"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  "Brosur Program MI Nurul Huda 3 dapat diunduh melalui kontak panitia PPDB."
                );
              }}
              className="px-8 py-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-secondary">
                download
              </span>
              Unduh Brosur
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
