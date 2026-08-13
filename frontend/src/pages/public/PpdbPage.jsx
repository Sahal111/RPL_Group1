import { Link } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

const HERO_BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB0f80GBsbz8ErNbo6SvUMppFYB9MFD9Ib-R3qG8BB8ZSRLpC_BWaJzQO5VyVeV4eaYIN5iJJVUtYhA9MDEr33KSPWo1f6PWXxhuJ1A8DxCgexrrD7KwDAuQBQ0jm5D0GQDqRlAWa3GYVmfctWyzrSp7IEmMMCqgclC5-Ev2VoOv3MkWDY9-9yVzAx9fwaXk-Wz_pIQGxYY1uDJ5QMXlsABohiFbO8o0NE0soxYn5R281xGR10YkiD1RQ";

const QUICK_STATS = [
  {
    icon: "group",
    value: "120",
    label: "Kuota Tersedia Siswa",
  },
  {
    icon: "payments",
    value: "Rp 150.000",
    label: "Biaya Pendaftaran",
  },
  {
    icon: "event_available",
    value: "30 Juni 2025",
    label: "Batas Pendaftaran",
  },
];

const ALUR = [
  {
    step: 1,
    icon: "assignment",
    title: "Ambil Formulir",
    desc: "Mengambil formulir pendaftaran di tata usaha sekolah atau mendaftar secara online melalui website.",
  },
  {
    step: 2,
    icon: "folder_open",
    title: "Lengkapi Berkas",
    desc: "Melengkapi dokumen persyaratan yang dibutuhkan sesuai dengan ketentuan panitia PPDB.",
  },
  {
    step: 3,
    icon: "handshake",
    title: "Serahkan Berkas",
    desc: "Menyerahkan kembali formulir beserta berkas persyaratan lengkap kepada panitia di sekolah.",
  },
  {
    step: 4,
    icon: "campaign",
    title: "Pengumuman",
    desc: "Menunggu hasil seleksi dan pengumuman penerimaan siswa baru sesuai jadwal yang ditentukan.",
  },
];

const PERSYARATAN = [
  {
    title: "Fotokopi Akta Kelahiran",
    desc: "Diserahkan sebanyak 2 lembar.",
  },
  {
    title: "Fotokopi Kartu Keluarga (KK)",
    desc: "Diserahkan sebanyak 2 lembar.",
  },
  {
    title: "Pas Foto Terbaru",
    desc: "Ukuran 3x4 berwarna sebanyak 4 lembar.",
  },
  {
    title: "Fotokopi Ijazah TK/RA",
    desc: "Jika sudah ada, dilegalisir 2 lembar.",
  },
];

const JADWAL = [
  {
    date: "1 April 2025",
    title: "Pembukaan Pendaftaran",
    desc: "Pendaftaran dibuka secara online maupun offline.",
    align: "left",
  },
  {
    date: "30 Juni 2025",
    title: "Batas Pengumpulan Berkas",
    desc: "Batas akhir penyerahan dokumen persyaratan ke sekolah.",
    align: "right",
  },
  {
    date: "1 - 7 Juli 2025",
    title: "Seleksi & Observasi",
    desc: "Pelaksanaan tes kematangan anak dan wawancara orang tua.",
    align: "left",
  },
  {
    date: "10 Juli 2025",
    title: "Pengumuman Hasil",
    desc: "Pengumuman siswa yang diterima melalui website dan papan pengumuman.",
    align: "right",
  },
  {
    date: "14 - 20 Juli 2025",
    title: "Daftar Ulang",
    desc: "Proses penyelesaian administrasi bagi siswa yang dinyatakan diterima.",
    align: "left",
  },
];

const FAQS = [
  {
    question: "Kapan pendaftaran dibuka?",
    answer:
      "Pendaftaran PPDB tahun ajaran 2026/2027 dibuka pada tanggal 1 April 2025 secara serentak baik online maupun offline.",
  },
  {
    question: "Apakah pendaftaran dilakukan secara online?",
    answer:
      "Ya, pendaftaran dapat dilakukan secara online melalui website resmi atau datang langsung ke sekretariat pendaftaran di sekolah.",
  },
  {
    question: "Apa saja dokumen yang harus disiapkan?",
    answer:
      "Dokumen wajib meliputi Fotokopi Akta Kelahiran, Kartu Keluarga, Pas Foto terbaru 3x4, dan Fotokopi Ijazah TK/RA (jika sudah ada).",
  },
  {
    question: "Berapa biaya pendaftaran?",
    answer:
      "Biaya pendaftaran untuk tahun ajaran ini adalah sebesar Rp 150.000, sudah termasuk biaya formulir dan administrasi awal.",
  },
  {
    question: "Bagaimana proses seleksinya?",
    answer:
      "Proses seleksi meliputi tes kematangan anak dan wawancara orang tua untuk menyelaraskan visi pendidikan.",
  },
  {
    question: "Bagaimana cara mengetahui hasil seleksi?",
    answer:
      "Hasil seleksi akan diumumkan melalui website resmi sekolah dan papan pengumuman di lingkungan sekolah sesuai jadwal yang ditentukan.",
  },
];

/* ── Reusable sub-components ───────────────────────────────────────────── */

function SectionBadge({ label }) {
  return (
    <div className="inline-flex items-center gap-3 bg-brand-green/10 border border-brand-green/20 text-brand-green px-6 py-2 rounded-full mb-8 font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,200,83,0.15)]">
      <span className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse" />
      {label}
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-brand-green rounded-full" />
      <div className="w-3 h-3 rotate-45 bg-brand-green shadow-[0_0_10px_#00c853]" />
      <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-brand-green rounded-full" />
    </div>
  );
}

function SectionHeading({ badge, title, highlight, subtitle }) {
  return (
    <div className="text-center mb-16 md:mb-24">
      <SectionBadge label={badge} />
      <h2 className="text-brand-darkgreen font-extrabold text-4xl md:text-6xl mb-6 leading-tight font-serif">
        {title} <span className="text-brand-green">{highlight}</span>
      </h2>
      <SectionDivider />
      {subtitle && (
        <p className="text-gray-500 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────────── */

export default function PpdbPage() {
  return (
    <div className="bg-brand-lightbg font-sans relative text-on-surface min-h-screen overflow-x-hidden">
      <style>{`
        .font-serif { font-family: Georgia, 'Times New Roman', serif; }
        @keyframes float-blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
      `}</style>

      <PublicNavbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col justify-center pt-24 pb-32">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${HERO_BG}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-darkgreen/75 to-brand-darkgreen/95" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-lightbg to-transparent" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="bg-brand-darkgreen/20 backdrop-blur-md border border-white/20 p-8 sm:p-10 md:p-12 rounded-3xl md:rounded-[3rem] transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-brand-green px-5 py-2 rounded-full mb-8 text-xs font-bold uppercase tracking-widest shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse" />
              Pendaftaran Tahun Ajaran 2025/2026 Telah Dibuka
            </div>
            <h1 className="font-extrabold text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight font-serif">
              Daftarkan Putra-Putri Anda di <br className="hidden sm:block" />
              MI Nurul Huda 3
            </h1>
            <p className="text-white/90 mb-10 max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
              Bergabunglah bersama kami membentuk generasi Rabbani. Kami
              memadukan kurikulum nasional berkualitas dengan pendidikan
              karakter Islami yang kuat untuk masa depan ananda tercinta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#alur"
                className="bg-brand-green text-white px-8 py-4 rounded-full font-bold text-lg hover:-translate-y-1 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-brand-green/30 hover:shadow-xl hover:bg-[#00e676]"
              >
                Daftar Sekarang
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </a>
              <a
                href="#persyaratan"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition-all inline-flex items-center justify-center gap-2 hover:bg-white/20"
              >
                <span className="material-symbols-outlined text-base">
                  description
                </span>
                Lihat Persyaratan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK STATS ───────────────────────────────────────────────────── */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 mb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {QUICK_STATS.map((s) => (
            <div
              key={s.label}
              className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-white flex items-center gap-6"
            >
              <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-darkgreen shrink-0">
                <span className="material-symbols-outlined text-3xl">
                  {s.icon}
                </span>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-brand-darkgreen mb-1 font-serif">
                  {s.value}
                </div>
                <div className="text-brand-green font-bold text-xs uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ALUR PENDAFTARAN ──────────────────────────────────────────────── */}
      <section
        id="alur"
        className="relative bg-brand-lightbg overflow-hidden py-20 md:py-28 px-4 sm:px-6 lg:px-8"
      >
        {/* decorative bg */}
        <div className="absolute inset-0 bg-islamic-pattern opacity-[0.03] pointer-events-none" />
        <div
          className="absolute -top-20 -right-20 w-[40rem] h-[40rem] bg-brand-green/10 blur-[100px] rounded-full -z-10"
          style={{ animation: "15s ease-in-out infinite float-blob" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-[40rem] h-[40rem] bg-brand-darkgreen/10 blur-[100px] rounded-full -z-10"
          style={{ animation: "18s ease-in-out infinite reverse float-blob" }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeading
            badge="Tahapan"
            title="Alur"
            highlight="Pendaftaran"
            subtitle="Ikuti langkah-langkah mudah berikut untuk mendaftarkan putra-putri Anda menjadi bagian dari keluarga besar MI Nurul Huda 3."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* dashed connector line — desktop only */}
            <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-brand-green/30 -z-10" />

            {ALUR.map((item) => (
              <div
                key={item.step}
                className="group bg-white/90 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,77,64,0.1)] hover:-translate-y-4 hover:shadow-2xl hover:shadow-brand-green/20 hover:bg-white transition-all duration-500 ease-out relative overflow-hidden border border-transparent hover:border-brand-green/30"
              >
                <div className="absolute -top-4 -right-2 text-9xl font-extrabold text-brand-green/10 select-none transition-all duration-500 group-hover:scale-110 group-hover:text-brand-green/20 font-serif">
                  {item.step}
                </div>
                <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green mb-6 relative z-10">
                  <span className="material-symbols-outlined text-4xl transition-transform duration-500 group-hover:scale-110">
                    {item.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-brand-darkgreen mb-3 relative z-10 font-serif">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed relative z-10">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERSYARATAN ───────────────────────────────────────────────────── */}
      <section
        id="persyaratan"
        className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8"
      >
        <div className="absolute inset-0 bg-islamic-pattern opacity-[0.03] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-green/5 blur-[120px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeading
            badge="Dokumen"
            title="Persyaratan"
            highlight="Lengkap"
            subtitle="Siapkan berkas-berkas berikut untuk memperlancar proses pendaftaran dan verifikasi data calon siswa baru."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* left: requirement cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {PERSYARATAN.map((item, idx) => (
                <div
                  key={item.title}
                  className={`group bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden hover:border-brand-green/50 hover:shadow-brand-green/20 hover:bg-brand-green/5 ${
                    idx % 2 !== 0 ? "sm:mt-8" : ""
                  }`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-green scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500" />
                  <div className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-md shadow-brand-green/20">
                    <i className="fa-solid fa-check" />
                  </div>
                  <h4 className="text-xl font-bold text-brand-darkgreen mb-3 font-serif">
                    {item.title}
                  </h4>
                  <p className="text-gray-500 text-base leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* right: download card */}
            <div className="lg:col-span-5">
              <div className="h-full bg-gradient-to-br from-brand-darkgreen to-[#002b23] rounded-[2rem] p-10 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center group hover:-translate-y-1 hover:scale-[1.02] transition-all duration-500 hover:shadow-brand-green/30">
                {/* shimmer */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                {/* pattern */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-green/20 blur-3xl rounded-full" />
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 blur-3xl rounded-full" />

                <div className="relative z-10 mb-8">
                  <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <i className="fa-solid fa-file-pdf text-5xl text-brand-green animate-pulse" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-4 relative z-10 font-serif">
                  Download Formulir
                </h3>
                <p className="mb-10 text-white/80 relative z-10 text-base md:text-lg leading-relaxed max-w-sm mx-auto">
                  Unduh formulir pendaftaran offline untuk diisi dan diserahkan
                  ke panitia PPDB.
                </p>
                <a
                  href="#"
                  className="group/btn relative inline-flex items-center gap-3 bg-brand-green text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-[#00e65c] transition-all duration-300 shadow-[0_10px_30px_rgba(0,200,83,0.3)] z-10 hover:shadow-[0_10px_40px_rgba(0,200,83,0.5)] hover:-translate-y-2"
                >
                  <i className="fa-solid fa-download group-hover/btn:-translate-y-1 transition-transform" />
                  Unduh PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── JADWAL KEGIATAN ───────────────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-brand-green/5 overflow-hidden rounded-none">
        <div className="absolute inset-0 bg-islamic-pattern opacity-[0.03] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeading
            badge="Timeline"
            title="Jadwal"
            highlight="Kegiatan"
          />

          <div className="relative max-w-5xl mx-auto">
            {/* vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-green via-brand-darkgreen to-brand-green -translate-x-1/2 hidden md:block opacity-30" />

            <div className="space-y-12 md:space-y-0">
              {JADWAL.map((item, idx) => {
                const isLeft = item.align === "left";
                return (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row items-center justify-between mb-10 md:mb-12 group"
                  >
                    {/* LEFT SLOT */}
                    <div
                      className={`md:w-[45%] ${
                        isLeft ? "order-2 md:order-1" : "order-3 md:order-1"
                      }`}
                    >
                      {isLeft && (
                        <div className="bg-white p-6 sm:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-lg border border-gray-100 transition-all duration-500 md:text-right hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(0,200,83,0.15)] hover:border-brand-green/30">
                          <div className="inline-block bg-brand-green text-white px-4 py-1 rounded-full text-xs font-bold mb-4 shadow-md">
                            {item.date}
                          </div>
                          <h4 className="text-xl md:text-2xl font-bold text-brand-darkgreen mb-3 font-serif">
                            {item.title}
                          </h4>
                          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* CENTER DOT */}
                    <div className="relative z-10 flex items-center justify-center w-12 h-12 order-1 md:order-2 mb-6 md:mb-0 shrink-0">
                      <div className="absolute inset-0 bg-brand-green rounded-full animate-pulse opacity-20" />
                      <div className="w-4 h-4 bg-brand-green rounded-full shadow-[0_0_15px_#00c853] border-2 border-white group-hover:scale-125 transition-transform duration-500" />
                    </div>

                    {/* RIGHT SLOT */}
                    <div
                      className={`md:w-[45%] ${
                        isLeft ? "order-3 md:order-3" : "order-2 md:order-3"
                      }`}
                    >
                      {!isLeft && (
                        <div className="bg-white p-6 sm:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-lg border border-gray-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(0,200,83,0.15)] hover:border-brand-green/30">
                          <div className="inline-block bg-brand-green text-white px-4 py-1 rounded-full text-xs font-bold mb-4 shadow-md">
                            {item.date}
                          </div>
                          <h4 className="text-xl md:text-2xl font-bold text-brand-darkgreen mb-3 font-serif">
                            {item.title}
                          </h4>
                          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-islamic-pattern opacity-[0.03] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-green/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-darkgreen/10 blur-[120px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeading badge="FAQ" title="Pertanyaan" highlight="Umum" />

          <div className="max-w-3xl mx-auto space-y-4">
            {FAQS.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-brand-green/30 transition-all duration-300 overflow-hidden"
              >
                <summary className="flex items-center justify-between p-5 sm:p-6 cursor-pointer list-none">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-brand-green rounded-full opacity-0 group-open:opacity-100 transition-opacity shrink-0" />
                    <h3 className="font-bold text-base sm:text-lg text-brand-darkgreen group-open:text-brand-green transition-colors font-serif">
                      {faq.question}
                    </h3>
                  </div>
                  <span className="material-symbols-outlined text-brand-green transform transition-transform duration-300 group-open:rotate-180 shrink-0 ml-3">
                    expand_more
                  </span>
                </summary>
                <div className="px-6 pb-6 pl-12 text-gray-500 text-base leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-20 md:pb-28 max-w-7xl mx-auto">
        <div className="rounded-[2rem] md:rounded-[3rem] overflow-hidden relative shadow-2xl bg-gradient-to-br from-brand-darkgreen via-primary-container to-[#002b23] py-16 md:py-24 px-8 md:px-20 text-center flex flex-col items-center justify-center">
          {/* pattern */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-green/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-green/20 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-8 font-serif leading-tight">
              Siap Mendaftarkan
              <br />
              <span className="text-brand-green drop-shadow-[0_0_15px_rgba(0,200,83,0.4)]">
                Putra-Putri Anda?
              </span>
            </h2>
            <p className="text-white/80 mb-12 max-w-2xl mx-auto text-base md:text-xl leading-relaxed">
              Jangan lewatkan kesempatan untuk memberikan pendidikan terbaik
              bagi buah hati Anda di lingkungan islami yang kondusif dan modern.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a
                href="https://wa.me/6285811723878?text=Halo%20Panitia%20PPDB%20MI%20Nurul%20Huda%203"
                target="_blank"
                rel="noreferrer"
                className="group/btn inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg hover:bg-brand-green hover:border-brand-green transition-all duration-500 shadow-xl"
              >
                <i className="fa-brands fa-whatsapp text-2xl text-brand-green group-hover/btn:text-white transition-colors" />
                Hubungi Panitia PPDB
              </a>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white px-8 py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 border border-transparent hover:border-white/20"
              >
                <i className="fa-solid fa-house text-sm" />
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />

      {/* WhatsApp FAB */}
      <a
        className="whatsapp-btn w-14 h-14 md:w-16 md:h-16 bg-brand-green text-white rounded-full flex items-center justify-center text-2xl md:text-3xl shadow-[0_8px_30px_rgb(0,200,83,0.4)] hover:bg-[#00e676] transition-transform hover:scale-110"
        href="https://wa.me/6285811723878?text=Halo%20MI%20Nurul%20Huda%203,%20saya%20ingin%20bertanya%20mengenai%20PPDB"
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
      >
        <i className="fab fa-whatsapp" />
      </a>
    </div>
  );
}
