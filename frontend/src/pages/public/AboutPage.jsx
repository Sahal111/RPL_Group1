import { useRef } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

// ─── Data ────────────────────────────────────────────────────────────────────

const staffList = [
  {
    name: "Siti Aminah, S.Pd.",
    role: "Waka Kurikulum",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnq6x03kibmSL2_gVa8yLEJG6wO9H1k8CvpLRhsjz9mRjWYP4WYhNMzXStzAeu4s5MqjcF5aQSOUz31kSD48bsSZ1RVMMNyYFlchw6eKZuk24xKOyBli9R7lwq5KR9M8yPRlePNy3JjkyHCrI4egTsEQGZ0Da99YQSAebHOwqwzpiOq4i9NCdkbptu8eRnJdKx-vhA0NG3EJ6dh1qNjt_fdS02xw5DiDqf06cdYWqUdRIWpj63jhs4",
    rotate: "-rotate-12",
  },
  {
    name: "Budi Santoso, S.Ag.",
    role: "Waka Kesiswaan",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEjyX8_S7t_awKu--rcn-Si9RKjvBQqgD25JKmeRAjBb3fDuw8BC4gCqiYVmVdCXM2CNMl-7cbhyityeuIrhs82khKRmlcDUypgAta-eeJG3hERi7UNRw647ez4TUqCmOEHgVqnXPG_zfvGHWVmZbYwlS6jhpl6Jq_sv4675G7VECKq4mBBnwJtJ-v1Pu-nH2Rny348_zxZ3WJd8fNe-Kr_40NfoQH5EW4V1UqlLyhPneDGqSrl_3x",
    rotate: "rotate-12",
  },
  {
    name: "Nurul Hidayah, S.E.",
    role: "Bendahara",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBS9zooOHK5rlDDtpGYRrHh2hATGFZ_eYoD_eMQtAJNQ4F6-lcu0sFLoimAl_nJOTwFZzZb8kvq1YG0iwFmNPxBg33I2teCFcstLDbsXOtdWvTzPbiF6oaFDM6qaa1p-ryAfoGlVbtpKjQjm6bNpDCLug7L2mEnZ2Ar3BbsFxWg_aNAeAHVPsUtpLFVLqL3mIpetJC1yD6o-IhYe2_LJuh4cFk8f4yDzmH0BwuXetmCTg3WSg5nvyaS",
    rotate: "-rotate-12",
  },
  {
    name: "M. Ridwan, S.Kom.",
    role: "Kepala TU",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIJz3ADP9Vd75vXVEVThOyrN3cK_SbYo7uJR0RSNFLdI3s6yBPUUAlCTdqtkwmXPV_cTf-dHzuD2yK50S12QUO9G2cSPlC9aQtLalqpV1GJ_udP_a7Ueq6zdngeO4imxCwH1wknllq5bD_EKZl9U8GzXxgZ7s0qS-lP8z5mNJI6WscW1WBhwuF5yTQBp0Hb8VCbm7mCpuL6_SNyuxsx6RBZ2S0UFB8Yx9N_NBtdHfCqHNIBycnxdHz",
    rotate: "rotate-12",
  },
];

const misiList = [
  {
    icon: "menu_book",
    title: "Akademik Unggul",
    desc: "Menyelenggarakan pembelajaran aktif, inovatif, kreatif, efektif, dan menyenangkan berbasis TIK.",
    patternId: "islamic-pattern-hover-1",
  },
  {
    icon: "mosque",
    title: "Karakter Islami",
    desc: "Membiasakan pengamalan ibadah dan akhlakul karimah dalam kehidupan sehari-hari di sekolah maupun rumah.",
    patternId: "islamic-pattern-hover-2",
  },
  {
    icon: "diversity_3",
    title: "Pengembangan Diri",
    desc: "Mengembangkan potensi, bakat, dan minat siswa melalui kegiatan ekstrakurikuler yang terarah dan berkelanjutan.",
    patternId: "islamic-pattern-hover-3",
  },
  {
    icon: "eco",
    title: "Peduli Lingkungan",
    desc: "Menciptakan lingkungan madrasah yang bersih, sehat, asri, dan nyaman sebagai pendukung proses belajar.",
    patternId: "islamic-pattern-hover-4",
  },
];

const fasilitasList = [
  {
    label: "Ibadah",
    icon: "mosque",
    title: "Masjid Sekolah",
    desc: "Pusat kegiatan ibadah dan pembentukan karakter religius siswa.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-jq-42YSKaMuUd2SuxCeHWOWJjHRys_VmrURDXITnNRc2Q88XuRwxX0rXjQXOPno9XvPT6WCYqy6eP4sU7WFR7ZSlFrE9CQTznwitw52Q7eZgl3bBTY0JuRmHiYkvPnABU3s3KXkuOj_vKej28lEvym_u-GVA5gwWBZllLgM3XpFaA5KdiHIv4j2MGJ1poR25cxwKUw9JmyNMdKRkNSmuAXqSpzH6hxmoAlPzWW0GWxMT1bTU2Cd_",
    offset: false,
  },
  {
    label: "Pembelajaran",
    icon: "school",
    title: "Ruang Kelas",
    desc: "Lingkungan belajar interaktif dengan fasilitas multimedia modern.",
    img: "https://lh3.googleusercontent.com/aida/AP1WRLuKOW3nwlHT71oVihJyFa4euXIx47L91oK_DC-WbFUzpFmk4PujU6CO_LyXVcSOu9fa_YpuSF4b0AKrBSALAyT8qFa3IbXuqmStCUB7ZBQNnI7aXDj6ApHdMlS1c-MVrotDfuCJEIogSfiOPRnmxNJFRu2ZAmG239-gXf4LbjCEhYNZxCT7MSLOKbkO6JHgGjqzj9dXC1W49cUCC2XKNgpxYqmvaCKVHhIQ2HIkUeK2bfrgrwK4_I8Us5I",
    offset: true,
  },
  {
    label: "Literasi",
    icon: "menu_book",
    title: "Perpustakaan",
    desc: "Koleksi literatur lengkap untuk menumbuhkan minat baca siswa.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJ9_5WM0FS3FZlKYGu5HGW-ZlpgDLA2CJumcxaCozVd6RE-cwfRSFRrlWBcIDlms49VqmQge-KXMkqFqZi5S_mGkVVjjr-hPdsue08SJBu1o37RjjjBFsORFrt1JHShO8AqbQsyoEBX5W6PtfoBrUF2CvgBVbhn6UY-bgkcKzGWJ_74ZMDf1rstjsMRjpSGDarCWOodtGumasDVykfq9nY2pbQpSERhiuw11Rx5aSLBrTsMaSePmU-",
    offset: false,
  },
  {
    label: "Olahraga",
    icon: "sports_soccer",
    title: "Area Bermain",
    desc: "Fasilitas olahraga dan rekreasi yang aman dan menyenangkan.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCOdTzaaKYKvxspAC8jGy07octd2-Kjkf7gz7hzEzVhYufka2ekVwzC8Ci_YKbCLs7GDxq7z9cbL_2gqJs7Ww7OoRFbBPTRUXn3fwuOl3xchqcUZ6H5OWRouC7IqOARzY8o0hLjfMDikW49Xpo-F-bnn_Plr27ejW5CNE8CV_oMDhr1zJt259iNSJr6tHahIpW-RUDjwS-N7bN9XWB-O3ve2lfJzE_owlCuOWLNM204ziXI0gua_80",
    offset: true,
  },
];

// ─── Reusable Section Header ─────────────────────────────────────────────────

function SectionHeader({ badge, badgeIcon, title, highlight, subtitle }) {
  return (
    <div className="text-center mb-20">
      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-secondary/10 border border-secondary/30 text-secondary font-bold tracking-[0.15em] uppercase text-[11px] mb-6 shadow-[0_0_20px_rgba(0,110,42,0.15)] animate-pulse">
        <span className="material-symbols-outlined text-sm">{badgeIcon}</span>
        <span>{badge}</span>
      </div>

      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#004d40]/20" />
        <div className="w-2 h-2 rotate-45 bg-secondary shadow-[0_0_10px_rgba(0,110,42,0.4)]" />
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#004d40]/20" />
      </div>

      <h2 className="text-[40px] md:text-[56px] font-bold text-[#004d40] leading-tight tracking-tight font-serif">
        {title} <span className="text-secondary">{highlight}</span>
      </h2>

      <div className="w-20 h-1.5 bg-gradient-to-r from-secondary to-[#004d40]/60 mx-auto mt-8 rounded-full opacity-80" />

      {subtitle && (
        <p className="text-base text-[#3f4945]/80 mt-8 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Islamic SVG Pattern (inline reusable) ───────────────────────────────────

function IslamicPatternRect({ id }) {
  return (
    <svg
      className="w-full h-full text-[#004d40]"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={id} height="20" patternUnits="userSpaceOnUse" width="20">
          <path
            d="M10 0 L12.2 7.8 L20 10 L12.2 12.2 L10 20 L7.8 12.2 L0 10 L7.8 7.8 Z"
            fill="currentColor"
          />
        </pattern>
      </defs>
      <rect fill={`url(#${id})`} height="100%" width="100%" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] antialiased overflow-x-hidden font-sans">
      {/* Global font + material icons */}
      <style>{`
        .font-serif { font-family: Georgia, 'Times New Roman', serif; }
      `}</style>

      <PublicNavbar />

      <main>
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
          {/* Background image + overlays */}
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center scale-105"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida/AP1WRLuKOW3nwlHT71oVihJyFa4euXIx47L91oK_DC-WbFUzpFmk4PujU6CO_LyXVcSOu9fa_YpuSF4b0AKrBSALAyT8qFa3IbXuqmStCUB7ZBQNnI7aXDj6ApHdMlS1c-MVrotDfuCJEIogSfiOPRnmxNJFRu2ZAmG239-gXf4LbjCEhYNZxCT7MSLOKbkO6JHgGjqzj9dXC1W49cUCC2XKNgpxYqmvaCKVHhIQ2HIkUeK2bfrgrwK4_I8Us5I")',
              }}
            />
            <div className="absolute inset-0 bg-[#004d40]/70 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#004d40]/40 via-transparent to-[#f8f9fa]" />
          </div>

          {/* Hero Card */}
          <div className="relative z-10 w-full max-w-4xl px-6">
            <div className="group backdrop-blur-md bg-white/5 border border-white/10 p-8 md:p-16 rounded-xl shadow-2xl transition-all duration-700 hover:bg-white/10 hover:scale-[1.02]">
              <div className="text-center">
                {/* Accredited badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#006e2a]/20 text-[#69ff87] font-bold mb-8 border border-[#006e2a]/30 animate-pulse shadow-[0_0_15px_rgba(60,227,106,0.2)] text-sm">
                  <span className="material-symbols-outlined text-sm">
                    school
                  </span>
                  <span>Terakreditasi A</span>
                </div>

                {/* Main heading */}
                <h1 className="text-5xl md:text-[72px] font-bold text-white mb-8 leading-[1.05] tracking-[-0.04em] drop-shadow-sm font-serif">
                  Membangun Generasi <br />
                  <span className="bg-gradient-to-r from-[#69ff87] via-[#006e2a] to-[#94d3c1] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(60,227,106,0.4)]">
                    Rabbani
                  </span>
                </h1>

                <p className="text-lg text-white mb-12 max-w-2xl mx-auto leading-relaxed opacity-95">
                  Berdedikasi mencetak siswa-siswi yang unggul dalam IPTEK dan
                  tangguh dalam IMTAQ, siap menghadapi tantangan global dengan
                  nilai-nilai Islami yang luhur.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <a
                    href="#sejarah"
                    className="group/btn px-10 py-4 rounded-full bg-gradient-to-r from-[#006e2a] to-[#004d40] text-white font-bold hover:scale-105 hover:shadow-[0_0_30px_rgba(0,110,42,0.4)] transition-all duration-300 shadow-lg flex items-center justify-center gap-3 border border-white/10"
                  >
                    Jelajahi Profil
                    <span className="material-symbols-outlined transition-transform duration-300 group-hover/btn:translate-y-1">
                      arrow_downward
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Sejarah ───────────────────────────────────────────────────────── */}
        <section
          id="sejarah"
          className="py-[120px] px-6 relative overflow-hidden bg-gradient-to-b from-[#f8f9fa] to-[#004d40]/5"
        >
          {/* Skewed background accent */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-[#004d40]/5 -z-0 skew-x-12 transform translate-x-1/2" />

          <div className="max-w-[1280px] mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-0">
            {/* ── Left: Content Card (overlapping) ── */}
            <div className="w-full lg:w-5/12 lg:pr-8 relative z-30 lg:translate-x-12">
              <div className="bg-white p-10 md:p-14 rounded-3xl shadow-xl border border-[#e1e3e4] relative overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(0,52,43,0.15)] transition-all duration-500 ease-out">
                {/* Decorative blur inside card */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#004d40]/5 rounded-full blur-3xl" />

                {/* Badge */}
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#004d40]/5 border border-[#004d40]/10 mb-8 relative z-10">
                  <span className="material-symbols-outlined text-[#004d40] text-[20px]">
                    history_edu
                  </span>
                  <span className="text-[#004d40] font-bold tracking-[0.1em] uppercase text-xs">
                    Warisan &amp; Sejarah
                  </span>
                </div>

                {/* Heading */}
                <div className="relative mb-8 z-10">
                  <h2 className="text-4xl md:text-[48px] font-bold text-[#004d40] leading-[1.15] tracking-tight font-serif">
                    Dedikasi <br />
                    Pendidikan <br />
                    <span className="text-[#5c3e00] relative inline-block italic font-serif">
                      Sejak 1990
                      <span className="absolute bottom-2 left-0 w-full h-2 bg-[#ffdeac]/30 -z-10 rounded-full" />
                    </span>
                  </h2>
                </div>

                {/* Body text */}
                <div className="space-y-6 relative z-10">
                  <p className="text-base text-[#3f4945] leading-relaxed font-medium">
                    Berawal dari semangat warga setempat untuk menyediakan
                    pendidikan dasar berbasis Islam yang berkualitas, MI Nurul
                    Huda 3 didirikan pada tahun 1990. Perjalanan panjang telah
                    membentuk kami menjadi institusi pendidikan yang matang dan
                    berprestasi.
                  </p>
                  <p className="text-sm text-[#3f4945]/80 leading-relaxed border-l-2 border-[#004d40]/20 pl-6 py-2">
                    Dari masa ke masa, kami terus beradaptasi dengan
                    perkembangan kurikulum nasional tanpa meninggalkan akar
                    nilai-nilai keislaman. Kini, kami berdiri sebagai salah satu
                    madrasah ibtidaiyah terkemuka yang dipercaya ratusan orang
                    tua setiap tahunnya.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right: Image ── */}
            <div className="w-full lg:w-8/12 relative z-20">
              <div className="relative group/premium">
                {/* Decorative frames */}
                <div className="absolute -inset-6 border-2 border-[#ffdeac]/30 rounded-[2rem] -z-10 transition-all duration-500 group-hover/premium:-inset-8 group-hover/premium:rotate-1" />
                <div className="absolute -inset-3 bg-[#004d40]/5 rounded-[1.5rem] -z-10 transition-all duration-500 group-hover/premium:scale-105" />

                {/* Main image */}
                <div className="relative overflow-hidden rounded-2xl border-4 border-[#004d40] shadow-2xl aspect-[4/3] md:aspect-[16/10] z-20 bg-[#edeeef] transition-all duration-500 group-hover/premium:shadow-[0_25px_50px_-12px_rgba(0,110,42,0.3)]">
                  <img
                    alt="Modern Islamic school campus"
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover/premium:scale-110"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAL3Wvb1E-bLXHwWxa7n8h2DmbaP65RlaoU3u5ZH4911QUPuZ3fnJz9lL9tJfNIhFmqPAfbVgJ-UK0IegHSSnyOfz2KD3mB25TAsXZGt088qoiY9wTZfjb-qWWQ8B5YfIs70NiF1hI3zWVUHcbWOgl-2f3md_EW6qtnQc3-n7ltJNhJGsCG_YruIef7vL9rMWM1lq6Nk8SusUC_ED1beAtP0UsMGEsMdgZfTSourard-NWn4LpFmZuD"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#004d40]/60 via-transparent to-transparent opacity-60" />
                </div>

                {/* Floating info cards */}
                <div className="absolute -right-6 top-1/4 z-30 flex flex-col gap-4 transition-transform duration-500 group-hover/premium:translate-x-2 hidden sm:flex">
                  <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-[#004d40]/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#006e2a]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#006e2a]">
                        verified
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#3f4945] font-bold">
                        Akreditasi
                      </p>
                      <p className="text-sm font-bold text-[#004d40]">
                        Unggul (A)
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-[#ffdeac]/30 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#ffdeac]/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#3f2900]">
                        calendar_today
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#3f4945] font-bold">
                        Berdiri
                      </p>
                      <p className="text-sm font-bold text-[#004d40]">
                        Sejak 1990
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Visi & Misi ──────────────────────────────────────────────────── */}
        <section className="py-[120px] px-6 bg-[#f3f4f5] relative overflow-hidden">
          {/* Background islamic pattern */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  height="40"
                  id="islamic-pattern-v2"
                  patternUnits="userSpaceOnUse"
                  width="40"
                >
                  <path
                    className="text-[#004d40]"
                    d="M20 0 L24.4 15.6 L40 20 L24.4 24.4 L20 40 L15.6 24.4 L0 20 L15.6 15.6 Z"
                    fill="#004d40"
                  />
                </pattern>
              </defs>
              <rect
                fill="url(#islamic-pattern-v2)"
                height="100%"
                width="100%"
              />
            </svg>
          </div>

          <div className="max-w-[1280px] mx-auto relative z-10">
            <SectionHeader
              badge="Visi & Misi"
              badgeIcon="star_rate"
              title="Arah Langkah"
              highlight="Institusi"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* ── Visi Card ── */}
              <div className="lg:col-span-5 flex">
                <div className="relative group overflow-hidden rounded-[2rem] p-10 md:p-14 bg-[#004d40] flex flex-col justify-center shadow-2xl transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-3 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(0,77,64,0.5)] w-full">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(60,227,106,0.2),transparent_60%)] opacity-80" />
                  {/* Islamic star watermark */}
                  <div className="absolute inset-0 opacity-10">
                    <svg
                      viewBox="0 0 100 100"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full"
                    >
                      <path
                        d="M50 0 L61 39 L100 50 L61 61 L50 100 L39 61 L0 50 L39 39 Z"
                        fill="white"
                      />
                    </svg>
                  </div>

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-10 shadow-xl transition-all duration-[600ms] group-hover:scale-125 group-hover:bg-[#006e2a]">
                      <span className="material-symbols-outlined text-white text-[40px]">
                        lightbulb
                      </span>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-px w-8 bg-[#69ff87]/50" />
                        <h3 className="text-2xl font-bold text-[#69ff87] font-serif tracking-tight">
                          Visi Kami
                        </h3>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-6 -top-4 text-8xl text-white/10 font-serif pointer-events-none">
                          "
                        </span>
                        <p className="text-lg leading-relaxed italic font-medium text-white/95">
                          Terwujudnya peserta didik yang religius, berakhlak
                          mulia, cerdas, terampil, dan peduli lingkungan
                          berlandaskan ajaran Islam Ahlussunnah wal Jama'ah.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Misi Cards Grid ── */}
              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                {misiList.map((m, idx) => (
                  <div
                    key={idx}
                    className="group relative overflow-hidden bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-[#e1e3e4]/50 shadow-sm hover:shadow-2xl hover:bg-[#004d40] hover:border-[#004d40] hover:-translate-y-2 transition-all duration-[500ms] ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                  >
                    {/* Hover pattern */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-all duration-700 pointer-events-none z-0 scale-125 group-hover:scale-100">
                      <IslamicPatternRect id={m.patternId} />
                    </div>

                    <div className="relative z-10">
                      <div className="w-14 h-14 rounded-xl bg-[#004d40]/5 flex items-center justify-center mb-6 group-hover:bg-white/20 transition-all duration-[500ms] group-hover:scale-110">
                        <span className="material-symbols-outlined text-3xl text-[#004d40] group-hover:text-white transition-colors duration-500">
                          {m.icon}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-[#004d40] mb-3 font-serif group-hover:text-white transition-colors duration-500">
                        {m.title}
                      </h4>
                      <p className="text-[#3f4945] leading-relaxed group-hover:text-white/90 transition-colors duration-500 text-sm">
                        {m.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Fasilitas Unggulan ────────────────────────────────────────────── */}
        <section className="py-[120px] px-6 relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(60,227,106,0.05),transparent_60%)]">
          <div className="absolute inset-0 bg-[#004d40]/5 -z-10" />

          <div className="max-w-[1280px] mx-auto">
            <SectionHeader
              badge="Lingkungan Belajar"
              badgeIcon="home_work"
              title="Fasilitas"
              highlight="Unggulan"
              subtitle="Menyediakan infrastruktur modern yang dirancang khusus untuk mendukung kenyamanan dan efektivitas proses belajar mengajar."
            />

            {/* CTA */}
            <div className="text-center -mt-10 mb-16">
              <Link
                to="/gallery"
                className="group/btn inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white border border-[#004d40]/10 text-[#004d40] font-bold hover:bg-[#004d40] hover:text-white transition-all duration-300 shadow-sm hover:shadow-xl"
              >
                Lihat Semua
                <span className="material-symbols-outlined transition-transform duration-300 group-hover/btn:translate-x-1">
                  arrow_forward
                </span>
              </Link>
            </div>

            {/* Cards grid — staggered on lg */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {fasilitasList.map((f, idx) => (
                <div
                  key={idx}
                  className={`group relative rounded-[2rem] overflow-hidden h-[400px] shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl${f.offset ? " lg:mt-8" : ""}`}
                >
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                    style={{ backgroundImage: `url("${f.img}")` }}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#004d40] via-[#004d40]/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 w-full p-8 transform transition-transform duration-500 group-hover:-translate-y-2">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-white">
                        {f.icon}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-2xl mb-2">
                      {f.title}
                    </h3>
                    <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Struktur Organisasi ───────────────────────────────────────────── */}
        <section className="py-[120px] px-6 bg-gradient-to-b from-white to-[#f3f4f5] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,77,64,0.03),transparent_50%)]" />

          <div className="max-w-[1280px] mx-auto relative z-10">
            <SectionHeader
              badge="Kepemimpinan"
              badgeIcon="group"
              title="Struktur"
              highlight="Organisasi"
              subtitle="Tenaga pendidik profesional yang berdedikasi tinggi."
            />

            <div className="flex flex-col items-center justify-center">
              {/* ── Kepala Sekolah ── */}
              <div className="w-full max-w-md mb-12">
                <div className="group relative overflow-hidden bg-white/70 backdrop-blur-md p-8 border border-[#004d40]/20 shadow-xl hover:shadow-[0_25px_50px_-12px_rgba(0,77,64,0.2)] transition-all duration-300 hover:-translate-y-2 text-center flex flex-col items-center rounded-3xl">
                  {/* Hover pattern */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none z-0">
                    <IslamicPatternRect id="islamic-star-pattern-head" />
                  </div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-6">
                      <div className="absolute -inset-2 rounded-full border-2 border-dashed border-[#004d40]/30 group-hover:border-[#004d40] group-hover:rotate-12 transition-all duration-500 z-0" />
                      <div className="absolute -inset-4 rounded-full bg-[#004d40]/5 group-hover:bg-[#004d40]/10 transition-colors duration-300 z-0" />
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md relative z-10 group-hover:shadow-[0_0_15px_rgba(0,77,64,0.3)] transition-shadow duration-300">
                        <img
                          alt="Ahmad Fauzi, S.Pd.I., M.Pd."
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2ud0gt796s9butDPeOnoj15JYoX8swmHEko3XED303R6l6R2B-SgWNncjHPABTpRY3yldCIV6FYnYiI2pzsO0QzrD-UGXirKq8sVaXSOeJZqB8OcmYqjZezvwjigXCSAVdHKvI1PK9fQDIS9SU7BS-fNPaaaffYU_AMGRdxCSPmggX8EyfXxRjz8E6N-EJ9PH22swgZljNXRvYbaXQGj3lkqlD4BnOw6LizOUYkc6Ub208Nkjia_a"
                        />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-[#004d40] mb-2 font-serif group-hover:text-[#004d40] transition-colors duration-300">
                      Ahmad Fauzi, S.Pd.I., M.Pd.
                    </h3>
                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#004d40]/10 text-[#004d40] font-bold text-sm tracking-wide">
                      Kepala Sekolah
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector lines — desktop only */}
              <div className="hidden lg:flex items-center justify-center w-full h-12 -mt-12 mb-4 relative z-0">
                <svg
                  className="w-[75%] h-full"
                  viewBox="0 0 800 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M400 0V24H100V48M400 24H700V48M400 24H300V48M400 24H500V48"
                    stroke="#004d40"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    opacity="0.3"
                  />
                </svg>
              </div>

              {/* ── Staff Cards ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-[1000px]">
                {staffList.map((s, idx) => (
                  <div
                    key={idx}
                    className="group relative overflow-hidden bg-white/60 backdrop-blur-sm p-6 border border-[#004d40]/15 shadow-md hover:shadow-xl hover:shadow-[#004d40]/10 transition-all duration-300 hover:-translate-y-2 text-center flex flex-col items-center rounded-3xl hover:bg-white/90"
                  >
                    {/* Hover pattern */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none z-0">
                      <IslamicPatternRect id={`islamic-star-staff-${idx}`} />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="relative mb-5">
                        <div
                          className={`absolute -inset-1.5 rounded-full border border-dashed border-[#004d40]/30 group-hover:border-[#004d40] group-hover:${s.rotate} transition-all duration-500 z-0`}
                        />
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm relative z-10 group-hover:shadow-[0_0_15px_rgba(0,77,64,0.2)] transition-shadow duration-300">
                          <img
                            alt={s.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            src={s.img}
                          />
                        </div>
                      </div>
                      <h4 className="font-bold text-lg text-[#004d40] mb-1">
                        {s.name}
                      </h4>
                      <p className="text-sm text-[#3f4945]/80 font-medium bg-[#004d40]/5 px-3 py-1 rounded-full">
                        {s.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
