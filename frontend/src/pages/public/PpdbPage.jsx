import { useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

export default function PpdbPage() {
  const [openFaq, setOpenFaq] = useState(0); // Index of open FAQ item

  const faqs = [
    {
      question: "Berapa biaya pendaftarannya?",
      answer:
        "Biaya pendaftaran sebesar Rp 150.000,- (sudah termasuk formulir dan psikotes awal).",
    },
    {
      question: "Kapan pengumuman hasil seleksi?",
      answer:
        "Pengumuman akan diinformasikan 1 minggu setelah tes seleksi melalui WhatsApp dan papan pengumuman sekolah.",
    },
    {
      question: "Apakah ada jemputan sekolah?",
      answer:
        "Ya, kami menyediakan fasilitas antar-jemput untuk area sekitar sekolah dengan biaya tambahan.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? -1 : index);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display antialiased selection:bg-primary selection:text-white transition-colors duration-300">
      <PublicNavbar />

      {/* ── Hero Header ───────────────────────────────────────────────────── */}
      <header className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-madrasah-green-deep/90 z-10"></div>
          <img
            alt="Students in classroom learning"
            className="w-full h-full object-cover object-center"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRo8a8aGzPP97WmnBqWeu5itIWD5LTjstSkPK7JN54mykybK_zsPOJwpf0mh3QkvldaNmaBXKWWxWafQHgzd_6LBXG5BoEools_JwheVLxmIiSX1BzyPd2H49URpMMGXaqtOJz5a3YBjdNDr-_d6iWzewCBKoaH9bLE8LBUVyyEv8BlY3Wy08j_MIOw0hE9L6xiX3t6sr58DSM8PSZnzr5Xlv-EXn7gCXmEVuxHm1fZZAj_cRU32gu1h9BtsWynzCehgbVlqxkUVsq"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/20 backdrop-blur-sm border border-secondary/40 text-secondary text-xs sm:text-sm font-bold mb-6 shadow-sm">
            <span className="material-symbols-outlined text-sm">campaign</span>
            Penerimaan Peserta Didik Baru 2024/2025
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6 drop-shadow-md">
            Bergabunglah Menjadi Generasi <br className="hidden md:block" />
            <span className="text-secondary">Berprestasi &amp; Islami</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Daftarkan putra-putri Anda dengan mudah melalui formulir online resmi
            MI Nurul Huda 3. Mari wujudkan masa depan cemerlang bersama kami.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
            <Link
              to="/register-ortu"
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 group"
            >
              <span className="material-symbols-outlined">edit_document</span>
              <span>Isi Formulir PPDB</span>
            </Link>

            <a
              href="#brosur"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  "Brosur PPDB MI Nurul Huda 3 dapat diunduh via panitia WhatsApp."
                );
              }}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined">download</span>
              <span>Unduh Brosur</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── Gelombang Cards ───────────────────────────────────────────────── */}
      <section className="relative z-20 -mt-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Gelombang 1 */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl p-6 border-b-4 border-primary flex flex-col items-center text-center transform transition hover:-translate-y-1 transition-colors duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 shrink-0">
              <span className="material-symbols-outlined text-4xl">
                calendar_month
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Gelombang 1
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              1 Januari - 31 Maret 2024
              <br />
              <span className="text-primary font-bold block mt-1">
                Diskon Uang Gedung 20%
              </span>
            </p>
          </div>

          {/* Card Gelombang 2 */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl p-6 border-b-4 border-secondary flex flex-col items-center text-center transform transition hover:-translate-y-1 transition-colors duration-300">
            <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-4 shrink-0">
              <span className="material-symbols-outlined text-4xl">
                schedule
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Gelombang 2
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              1 April - 30 Juni 2024
              <br />
              <span className="text-secondary font-bold block mt-1">
                Kuota Terbatas
              </span>
            </p>
          </div>

          {/* Card Kontak Panitia */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl p-6 border-b-4 border-madrasah-green flex flex-col items-center text-center transform transition hover:-translate-y-1 transition-colors duration-300">
            <div className="w-16 h-16 rounded-full bg-madrasah-green/10 text-madrasah-green dark:text-green-400 flex items-center justify-center mb-4 shrink-0">
              <span className="material-symbols-outlined text-4xl">
                support_agent
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Kontak Panitia
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Butuh bantuan pendaftaran?
              <br />
              <a
                href="https://wa.me/6285811723878?text=Halo%20Panitia%20PPDB%20MI%20Nurul%20Huda%203,%20saya%20butuh%20bantuan"
                target="_blank"
                rel="noreferrer"
                className="text-madrasah-green dark:text-green-400 font-bold hover:underline block mt-1"
              >
                Chat WhatsApp Panitia
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ── Main Content: Alur, Syarat & FAQ Sidebar ─────────────────────── */}
      <section className="py-16 bg-surface-light dark:bg-background-dark transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Content (8 Cols) */}
            <div className="lg:col-span-8 space-y-12">
              {/* Alur Pendaftaran */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <span className="w-1.5 h-8 bg-secondary rounded-full"></span>
                  <h2 className="text-2xl font-black text-madrasah-green dark:text-white tracking-tight">
                    Alur Pendaftaran
                  </h2>
                </div>

                <div className="relative">
                  <div className="hidden md:block absolute top-8 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full -z-0"></div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Step 1 */}
                    <div className="relative z-10 flex flex-col items-center text-center group">
                      <div className="w-16 h-16 rounded-full bg-white dark:bg-surface-dark border-4 border-secondary flex items-center justify-center text-secondary font-bold text-2xl shadow-lg mb-4 group-hover:bg-secondary group-hover:text-white transition-colors">
                        1
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-white mb-2">
                        Isi Formulir
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Klik tombol daftar dan isi data diri calon siswa secara
                        online.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="relative z-10 flex flex-col items-center text-center group">
                      <div className="w-16 h-16 rounded-full bg-white dark:bg-surface-dark border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 font-bold text-2xl shadow-lg mb-4 group-hover:border-secondary group-hover:text-secondary transition-colors">
                        2
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-white mb-2">
                        Lengkapi Data
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Lengkapi biodata dan data orang tua/wali dengan benar.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="relative z-10 flex flex-col items-center text-center group">
                      <div className="w-16 h-16 rounded-full bg-white dark:bg-surface-dark border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 font-bold text-2xl shadow-lg mb-4 group-hover:border-secondary group-hover:text-secondary transition-colors">
                        3
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-white mb-2">
                        Upload Berkas
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Unggah foto KK, Akta Kelahiran, dan Pas Foto terbaru.
                      </p>
                    </div>

                    {/* Step 4 */}
                    <div className="relative z-10 flex flex-col items-center text-center group">
                      <div className="w-16 h-16 rounded-full bg-white dark:bg-surface-dark border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 font-bold text-2xl shadow-lg mb-4 group-hover:border-secondary group-hover:text-secondary transition-colors">
                        4
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-white mb-2">
                        Verifikasi
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Panitia akan memverifikasi data dan menghubungi Anda.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Syarat Pendaftaran */}
              <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    fact_check
                  </span>
                  <h2 className="text-2xl font-black text-madrasah-green dark:text-white tracking-tight">
                    Syarat Pendaftaran
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Syarat 1 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-light dark:hover:bg-slate-800/50 transition-colors">
                    <span className="material-symbols-outlined text-primary mt-0.5 shrink-0">
                      check_circle
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-white">
                        Usia Minimal
                      </h5>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Berusia minimal 6 tahun pada bulan Juli 2024.
                      </p>
                    </div>
                  </div>

                  {/* Syarat 2 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-light dark:hover:bg-slate-800/50 transition-colors">
                    <span className="material-symbols-outlined text-primary mt-0.5 shrink-0">
                      check_circle
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-white">
                        Kartu Keluarga (KK)
                      </h5>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Scan/Foto copy Kartu Keluarga terbaru.
                      </p>
                    </div>
                  </div>

                  {/* Syarat 3 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-light dark:hover:bg-slate-800/50 transition-colors">
                    <span className="material-symbols-outlined text-primary mt-0.5 shrink-0">
                      check_circle
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-white">
                        Akta Kelahiran
                      </h5>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Scan/Foto copy Akta Kelahiran calon siswa.
                      </p>
                    </div>
                  </div>

                  {/* Syarat 4 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-light dark:hover:bg-slate-800/50 transition-colors">
                    <span className="material-symbols-outlined text-primary mt-0.5 shrink-0">
                      check_circle
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-white">
                        Pas Foto
                      </h5>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Pas foto berwarna ukuran 3x4 (2 lembar) background merah.
                      </p>
                    </div>
                  </div>

                  {/* Syarat 5 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-light dark:hover:bg-slate-800/50 transition-colors md:col-span-2">
                    <span className="material-symbols-outlined text-primary mt-0.5 shrink-0">
                      check_circle
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-white">
                        Ijazah RA/TK (Opsional)
                      </h5>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Scan/Foto copy Ijazah RA/TK jika sudah ada.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right FAQ Sidebar (4 Cols) */}
            <div className="lg:col-span-4 space-y-8">
              <div className="sticky top-24">
                {/* FAQ Box */}
                <div className="bg-madrasah-green dark:bg-surface-dark rounded-2xl p-6 text-white shadow-xl mb-6 transition-colors duration-300">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">
                      quiz
                    </span>
                    Pertanyaan Umum
                  </h3>

                  <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className={`pb-4 ${
                          idx < faqs.length - 1 ? "border-b border-white/10" : ""
                        }`}
                      >
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="flex justify-between items-center w-full text-left font-semibold text-sm hover:text-secondary transition-colors cursor-pointer"
                        >
                          <span>{faq.question}</span>
                          <span
                            className={`material-symbols-outlined text-lg transition-transform duration-200 ${
                              openFaq === idx ? "rotate-180 text-secondary" : ""
                            }`}
                          >
                            expand_more
                          </span>
                        </button>
                        {openFaq === idx && (
                          <p className="mt-2 text-xs text-slate-200 leading-relaxed animate-fade-in">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Support Box */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-center transition-colors duration-300">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2">
                    Masih ada pertanyaan?
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    Silakan hubungi admin PPDB kami pada jam kerja (08.00 -
                    14.00).
                  </p>
                  <a
                    className="inline-flex items-center justify-center gap-2 w-full py-3 bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60 rounded-xl font-bold transition-colors"
                    href="https://wa.me/6285811723878?text=Halo%20Admin%20PPDB%20MI%20Nurul%20Huda%203,%20saya%20ingin%20bertanya"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="material-symbols-outlined">chat</span>
                    Chat via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
