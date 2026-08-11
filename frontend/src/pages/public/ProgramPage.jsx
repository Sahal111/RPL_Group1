import { Link } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

// ─── Data ────────────────────────────────────────────────────────────────────

const programUtama = [
  {
    icon: "menu_book",
    title: "Keagamaan",
    desc: "Pembelajaran intensif Al-Qur'an, Hadits, Fiqih, dan Aqidah Akhlak sebagai panduan hidup berkelanjutan bagi siswa.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOBraFvD-as84W8G27BGFpVtTP7Lf_0WijAvmXPsiEjycFV4vF4KPwepVSBZFe6WXNYgoyQFp5VmQdAdppOXxdkYhRFeYqavQHt8wWl1vuibATS5P0GIYpgKpcC0MX1maMKA02suM4FTLUGLUvKszPtxIcIQKS0NeujRUbu-sZdBvu_BjzeHoY_gxqesiDp7-GDRkTcKBxyqv99WU4rtKgs9rxOyERuye3ey1IieFdtFRliZHHhxx4",
  },
  {
    icon: "science",
    title: "Akademik",
    desc: "Keunggulan dalam sains, matematika, dan literasi dengan pendekatan saintifik modern.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAC2W4ZomKB3jxcEJKpM1bvNVzIMbWW8MTMvpSL2PowFL3KplSpeXcSdP9BEGPfQofM7E5lYbz7GGn46PnJRFdDbVGAO0s7HHqe8LYHCyej4aXCKBemOUyBEp_N4jKGRKutkznZjGU-PTTmnL2lYAlD88K3s099pDbe6sHvOwSht5IRQhyaTGtXaJy9_ygLx-38-382biyST41xtd6xTXOnIS7xI9ySlPjNP5ogWxpqzY8gBeUNYepa",
  },
  {
    icon: "translate",
    title: "Bahasa",
    desc: "Pengembangan Bahasa Arab dan Inggris aktif untuk komunikasi global.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5qpwtke2Qv5THHoDXCY6unazuWVBDTNTqgxLU-y62SCY5Kw6Sh531wamybtXoF2pmVbxyxQmZs7HFj_r_iD6ciU-GckbmKNv-H9qEo5IWGjEQQK9SpzuURfZjQq7xhYb7cYRObzXOxHeNfxdTKfBqkcgfAS78FEsN_V24HKglCSsfgQwX9AcwnmQLjOIKhaf2kOegB-7pjWyZuvfxBk-UZ8hcX1M7uaJNvZV7grEfAFFO49EfUH9W",
  },
  {
    icon: "computer",
    title: "Digital",
    desc: "Literasi teknologi dasar era Society 5.0 untuk membekali siswa di masa depan.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3Ixe4A-M3juch-PZwUc3s501OfTm9X6NVG11bHeIyU9hvNXqNh9pF5DCl1XYIvM_jLqBk77wM71kcq6_Ive1FzTjdI7SJwEdhLlQqxON3THKclUEcobcWG2zSu-iUDzSSY3q3Mta9ZnfSmuRtUtAON5Vt2KtT9enQZ7UyTd7nitjLA_aXFR8daIUXu6izeweJl_XEpMXL-H1gp6_wQZbyFI36WGk369sJodtpRKW_HYxfms9Puwr0",
  },
  {
    icon: "psychology",
    title: "Karakter",
    desc: "Pembiasaan adab islami, kepemimpinan, dan kemandirian dalam aktivitas sehari-hari.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBkttKyug1VfXeJy17_3aqqlqO0yEcLVA83mPnzrLOAj30cG7mVjdj_dUso5zQmSQDt5t2MN-iAWJ2zzBJtdnsPNdAt_fPp8p3JLMCSNpZqdiHQmkgKfyqq0bbIqIyPpneUmIR_xfAmI9mcUq4TRVkIwehGkxRHjVPa4tde_yEZdDzvuFMaD_-GS_XWYeZCBXsHu8yyH2ZaxtlC4_e17s5D2ZvueNDGbF6xFHPSO3FEP28_06RG_rm",
  },
  {
    icon: "emoji_events",
    title: "Prestasi",
    desc: "Pembinaan minat dan bakat intensif untuk meraih prestasi tingkat nasional dan internasional.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfOKwNIG6Kf2BPf0zCm4RJTfoA3almFvU2nYGcdvrtuuqJRjUwtgA2gXdh04j8qTfAU1hQ1sLyRDahuvIKyeHkzWMwLrF5j1OTGNr6BuiBXnOo-UwAPU4yfbJTsnG4cuaj9bBa88a892ANi6nRIrGgJCmB2jCybmGaYK-zYzfGqgeKDDKgtwOI1o_JhmnYcEGdKx6mVarNdzirz3xHQ0u8XHD-ET1QP8UpeK8hH0BiGQK2FTOWf3yI",
  },
];

const programUnggulan = [
  {
    icon: "menu_book",
    title: "Tahfidz Al-Qur'an",
    desc: "Metode Talaqqi & Musyafahah dengan target mutqin Juz 30 bersama asatidz bersertifikat.",
    checks: ["Target Juz 30 Mutqin", "Pengajar Bersanad"],
    img: null,
  },
  {
    icon: "devices",
    title: "Digital Learning",
    desc: "Integrasi teknologi dalam KBM untuk mengasah keterampilan abad ke-21 dan literasi digital.",
    checks: ["Interactive Learning", "21st Century Skills"],
    img: "https://lh3.googleusercontent.com/aida/AP1WRLveP0Faz3jUsse9288x-CMSHY_Rz879bsAfr9YWh-O0LBCoGvdQKK9Um-Hahe7BJDhFCZ8VMlHl3RSca-BWmyy7c1m6pYbCa9ts5e82p03qOtKdrIhsj2j3JbkxM3dslxJzmcwoajoacEDWP1F6zE-V4E5XPDVGTw9bkbCTBCgneSWs7uSf4v5O8hbAMq0shereMJA18yBa072l2ia06opAs4ja3UdK64bArUMWaDhUGG702l28JqRtYAc",
  },
  {
    icon: "diversity_3",
    title: "Character Building",
    desc: "Pembentukan Akhlakul Karimah melalui pembiasaan nilai Islami dan disiplin harian.",
    checks: ["Islamic Values", "Daily Habits"],
    img: "https://lh3.googleusercontent.com/aida/AP1WRLuzK29kScZy1Z16rbofcmDgTfB0sOs6a5BNaubWVaVFYIcpAqWDnbiW0qVB91Vn7fEty_HRUAYcBlgwWv-VQxooOHQVhWpNhPxQQstfJznTCHJ8IpeznLZizEyKKBBxCO45NiHupgIN7RGATncBLPi-VbXJE7Tyu8lZj99Gg4UvdgxT-JzaHJklzBTzbe9vgmTVtw0tX-gqd9Vmh_T6OWg6YUxIriex5_2SNW5r6E1PbHnrMW6y0QOjOzk",
  },
];

const jadwalHarian = [
  {
    time: "07:00 - 07:30",
    icon: "wb_sunny",
    title: "Pembiasaan Pagi",
    desc: "Sholat Dhuha berjamaah dan pembacaan doa harian untuk memulai hari dengan berkah.",
    color: "secondary",
    stagger: false,
  },
  {
    time: "07:30 - 12:00",
    icon: "menu_book",
    title: "KBM & Tahfidz",
    desc: "Pembelajaran akademik terintegrasi dan setoran hafalan Al-Qur'an intensif.",
    color: "primary",
    stagger: true,
  },
  {
    time: "12:00 - 13:00",
    icon: "restaurant",
    title: "Ishoma",
    desc: "Istirahat, Sholat Dzuhur berjamaah, dan makan siang sehat bersama teman.",
    color: "secondary",
    stagger: false,
  },
  {
    time: "13:00 - 15:00",
    icon: "extension",
    title: "Pengembangan",
    desc: "Eksplorasi minat bakat melalui berbagai klub ekstrakurikuler pilihan.",
    color: "primary",
    stagger: true,
  },
];

const ekstrakurikuler = [
  {
    tag: "Robotics Club",
    title: "Robotics",
    desc: "Pengenalan coding dan perakitan robot dasar untuk mengasah logika berpikir kritis siswa.",
    img: "https://lh3.googleusercontent.com/aida/AP1WRLvC3J3_2e_Hw58qQzO93Y8U155R8rJIf7QJ1Vw-fN_Q7T6GjMst19-61mI0nU9JtU7PylgX-bNns-W070E6s6B-0H3Lszg4FtvP5E9bZ4uWn44f800R5Oq1l3F7_yM",
    tall: false,
  },
  {
    tag: "IT & Multimedia",
    title: "IT Club",
    desc: "Eksplorasi desain grafis dasar dan literasi digital yang positif untuk masa depan.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3Ixe4A-M3juch-PZwUc3s501OfTm9X6NVG11bHeIyU9hvNXqNh9pF5DCl1XYIvM_jLqBk77wM71kcq6_Ive1FzTjdI7SJwEdhLlQqxON3THKclUEcobcWG2zSu-iUDzSSY3q3Mta9ZnfSmuRtUtAON5Vt2KtT9enQZ7UyTd7nitjLA_aXFR8daIUXu6izeweJl_XEpMXL-H1gp6_wQZbyFI36WGk369sJodtpRKW_HYxfms9Puwr0",
    tall: true,
  },
  {
    tag: "Archery",
    title: "Panahan",
    desc: "Sunnah Nabi yang melatih fokus, kesabaran, dan kekuatan fisik dalam suasana yang menyenangkan.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCOdTzaaKYKvxspAC8jGy07octd2-Kjkf7gz7hzEzVhYufka2ekVwzC8Ci_YKbCLs7GDxq7z9cbL_2gqJs7Ww7OoRFbBPTRUXn3fwuOl3xchqcUZ6H5ORouC7IqOARzY8o0hLjfMDikW49Xpo-F-bnn_Plr27ejW5CNE8CV_oMDhr1zJt259iNSJr6tHahIpW-RUDjwS-N7bN9XWB-O3ve2lfJzE_owlCuOWLNM204ziXI0gua_80",
    tall: true,
  },
  {
    tag: "Seni Islami",
    title: "Seni Islami",
    desc: "Hadrah, kaligrafi, dan qiro'ah untuk menumbuhkan kecintaan pada seni budaya Islam.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-jq-42YSKaMuUd2SuxCeHWOWJjHRys_VmrURDXITnNRc2Q88XuRwxX0rXjQXOPno9XvPT6WCYqy6eP4sU7WFR7ZSlFrE9CQTznwitw52Q7eZgl3bBTY0JuRmHiYkvPnABU3s3KXkuOj_vKej28lEvym_u-GVA5gwWBZllLgM3XpFaA5KdiHIv4j2MGJ1poR25cxwKUw9JmyNMdKRkNSmuAXqSpzH6hxmoAlPzWW0GWxMT1bTU2Cd_",
    tall: false,
  },
];

// ─── Islamic Pattern SVG ─────────────────────────────────────────────────────

function IslamicBg({ opacity = "opacity-5" }) {
  return (
    <div className={`absolute inset-0 ${opacity} pointer-events-none`}>
      <svg
        className="w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <pattern
            id="islamic-prog"
            height="20"
            patternUnits="userSpaceOnUse"
            width="20"
          >
            <path
              d="M10 0 L12.2 7.8 L20 10 L12.2 12.2 L10 20 L7.8 12.2 L0 10 L7.8 7.8 Z"
              fill="#004d40"
            />
          </pattern>
        </defs>
        <rect fill="url(#islamic-prog)" height="100%" width="100%" />
      </svg>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProgramPage() {
  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] antialiased overflow-x-hidden font-sans">
      <style>{`
        .font-serif { font-family: Georgia, 'Times New Roman', serif; }
      `}</style>

      <PublicNavbar />

      <main>
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden bg-[#00342b]">
          {/* Background */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              alt="Modern Islamic School Environment"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida/AP1WRLuKOW3nwlHT71oVihJyFa4euXIx47L91oK_DC-WbFUzpFmk4PujU6CO_LyXVcSOu9fa_YpuSF4b0AKrBSALAyT8qFa3IbXuqmStCUB7ZBQNnI7aXDj6ApHdMlS1c-MVrotDfuCJEIogSfiOPRnmxNJFRu2ZAmG239-gXf4LbjCEhYNZxCT7MSLOKbkO6JHgGjqzj9dXC1W49cUCC2XKNgpxYqmvaCKVHhIQ2HIkUeK2bfrgrwK4_I8Us5I"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#004d40]/90 via-[#004d40]/70 to-[#004d40]/90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,52,43,0.4)_100%)]" />
            {/* Islamic pattern overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <svg
                className="w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <defs>
                  <pattern
                    id="hero-pattern"
                    height="20"
                    patternUnits="userSpaceOnUse"
                    width="20"
                  >
                    <path
                      d="M10 0 L12.2 7.8 L20 10 L12.2 12.2 L10 20 L7.8 12.2 L0 10 L7.8 7.8 Z"
                      fill="#ffffff"
                    />
                  </pattern>
                </defs>
                <rect fill="url(#hero-pattern)" height="100%" width="100%" />
              </svg>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#f8f9fa] to-transparent pointer-events-none" />
          </div>

          {/* Hero Card */}
          <div className="relative z-10 w-full max-w-4xl px-4 sm:px-6">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 sm:p-12 md:p-16 rounded-[3rem] shadow-2xl transition-all duration-700 hover:bg-white/10 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-[#006e2a]/20 border border-[#006e2a]/30 mb-8 sm:mb-10 shadow-inner animate-pulse">
                <span className="material-symbols-outlined text-[#69ff87] text-sm">
                  verified
                </span>
                <span className="text-white font-bold tracking-[0.3em] text-[10px] uppercase">
                  Excellence in Education
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[0.95] mb-8 sm:mb-10 tracking-tight drop-shadow-2xl font-serif">
                Program Pendidikan
                <br />
                <span className="text-[#69ff87]">Madrasah</span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-white/90 mx-auto mb-10 sm:mb-12 leading-relaxed font-light max-w-2xl">
                Membangun pondasi masa depan yang kokoh melalui integrasi
                nilai-nilai Islami, keunggulan akademik, dan pengembangan
                karakter.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                <a
                  href="#program-utama"
                  className="group w-full sm:w-auto px-10 sm:px-12 py-4 sm:py-5 rounded-full bg-[#006e2a] text-white font-bold text-lg sm:text-xl shadow-lg hover:scale-105 hover:shadow-[0_0_50px_rgba(0,110,42,0.7)] transition-all duration-500 flex items-center justify-center gap-3"
                >
                  <span>Lihat Kurikulum</span>
                  <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">
                    arrow_forward
                  </span>
                </a>
                <Link
                  to="/ppdb"
                  className="w-full sm:w-auto px-10 sm:px-12 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-xl text-white border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-500 text-center"
                >
                  Info Pendaftaran
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Program Utama ─────────────────────────────────────────────────── */}
        <section
          id="program-utama"
          className="py-20 sm:py-32 px-4 sm:px-6 bg-[#f8f9fa] relative overflow-hidden"
        >
          <IslamicBg opacity="opacity-[0.03]" />

          <div className="max-w-[1280px] mx-auto relative z-10">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 flex flex-col items-center gap-2">
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#004d40]/10 text-[#004d40] font-bold tracking-widest uppercase text-[10px] shadow-sm mb-6 border border-[#004d40]/20">
                <span className="material-symbols-outlined text-[14px] mr-2">
                  stars
                </span>
                PROGRAM UTAMA
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-[#004d40] mb-4 tracking-tight leading-tight font-serif">
                Pilar Pendidikan Utama
              </h2>
              <div className="w-12 h-1 bg-[#006e2a] mx-auto rounded-full mb-6" />
              <p className="text-lg sm:text-xl text-[#3f4945]/80 leading-relaxed font-light max-w-2xl mx-auto">
                Enam pilar utama yang menjadi pondasi kurikulum terpadu kami.
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {programUtama.map((p, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-sm hover:shadow-[0_20px_50px_rgba(0,77,64,0.2)] hover:-translate-y-3 hover:border-[#006e2a]/40 transition-all duration-500 flex flex-col gap-6 overflow-hidden"
                >
                  <img
                    alt={p.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-30 transition-all duration-700 scale-110 group-hover:scale-100"
                    src={p.img}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#004d40] via-[#004d40]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#004d40]/10 flex items-center justify-center text-[#004d40] group-hover:bg-[#006e2a] group-hover:text-white transition-colors duration-500">
                      <span className="material-symbols-outlined text-4xl">
                        {p.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-[#004d40] group-hover:text-white mb-3 transition-colors font-serif">
                        {p.title}
                      </h3>
                      <p className="text-[#3f4945] group-hover:text-white/90 leading-relaxed font-light transition-colors text-sm sm:text-base">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Program Unggulan ──────────────────────────────────────────────── */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 text-white overflow-hidden relative bg-[#004d40]">
          {/* Decorative blobs */}
          <div className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-[#006e2a]/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(circle_at_center,rgba(105,255,135,0.08)_0,transparent_70%)] pointer-events-none" />
          <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] bg-[#004d40]/30 rounded-full blur-[150px] pointer-events-none" />

          <div className="max-w-[1280px] mx-auto relative z-10">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 flex flex-col items-center gap-2">
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/5 text-[#69ff87] font-bold tracking-widest uppercase text-[10px] shadow-sm mb-6 border border-white/10 backdrop-blur-xl">
                <span className="material-symbols-outlined text-[14px] mr-2">
                  stars
                </span>
                PROGRAM UNGGULAN
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight font-serif">
                Keunggulan Pendidikan Kami
              </h2>
              <div className="w-12 h-1 bg-[#69ff87] mx-auto rounded-full mb-6" />
              <p className="text-lg sm:text-xl text-white/80 leading-relaxed font-light max-w-2xl mx-auto">
                Tiga pilar program unggulan yang membedakan MI Nurul Huda 3
                dalam mencetak generasi rabbani yang kompeten.
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {programUnggulan.map((p, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white/5 backdrop-blur-xl p-8 sm:p-10 rounded-[3rem] border border-white/10 hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)] hover:-translate-y-3 hover:border-[#006e2a]/40 transition-all duration-500 flex flex-col gap-8 overflow-hidden"
                >
                  {p.img && (
                    <img
                      alt={p.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-20 transition-all duration-700 scale-110 group-hover:scale-100"
                      src={p.img}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#006e2a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-[#006e2a]/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner border border-white/10">
                      <span className="material-symbols-outlined text-[#69ff87] text-4xl">
                        {p.icon}
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 font-serif">
                      {p.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed font-light mb-6 text-sm sm:text-base">
                      {p.desc}
                    </p>
                    <ul className="space-y-3 text-sm text-white/60">
                      {p.checks.map((c, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#69ff87] text-lg">
                            check_circle
                          </span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 sm:mt-20 text-center">
              <Link
                to="/ppdb"
                className="group relative inline-flex items-center gap-3 sm:gap-4 mx-auto bg-[#006e2a] text-white px-10 sm:px-14 py-5 sm:py-6 rounded-full font-bold text-lg sm:text-xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(0,110,42,0.7)]"
              >
                <span className="relative z-10">
                  Eksplorasi Kurikulum Unggulan
                </span>
                <span className="material-symbols-outlined relative z-10 group-hover:translate-x-2 transition-transform duration-300">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Kegiatan Harian ───────────────────────────────────────────────── */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 bg-[#f8f9fa] relative overflow-hidden">
          <IslamicBg opacity="opacity-[0.02]" />

          <div className="max-w-[1280px] mx-auto relative z-10">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#004d40]/10 text-[#004d40] font-bold tracking-[0.2em] uppercase text-[10px] shadow-sm mb-8">
                <span className="material-symbols-outlined text-[16px] text-[#006e2a]">
                  schedule
                </span>
                RUTINITAS HARIAN
              </div>
              <div className="relative mb-8">
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-[#004d40] tracking-tight leading-tight font-serif">
                  Kegiatan &amp; Pembiasaan Harian
                </h2>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-transparent via-[#006e2a] to-transparent rounded-full" />
              </div>
              <p className="text-lg sm:text-xl text-[#3f4945]/80 leading-relaxed font-light max-w-2xl mx-auto mt-4">
                Membangun disiplin dan karakter melalui rutinitas yang terukur
                dan penuh makna setiap harinya.
              </p>
            </div>

            {/* Timeline Cards */}
            <div className="relative">
              {/* Desktop timeline line */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#006e2a]/30 to-transparent -translate-y-1/2 z-0" />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
                {jadwalHarian.map((j, idx) => {
                  const isSecondary = j.color === "secondary";
                  return (
                    <div
                      key={idx}
                      className={`group relative bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-[2.5rem] border border-[#bfc9c4]/30 shadow-sm hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 ${j.stagger ? "lg:mt-12" : "lg:mt-0"}`}
                    >
                      {/* Time badge */}
                      <div
                        className={`absolute -top-4 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 rounded-full text-white text-[9px] sm:text-[10px] font-bold tracking-widest shadow-lg z-20 whitespace-nowrap ${isSecondary ? "bg-[#006e2a]" : "bg-[#004d40]"}`}
                      >
                        {j.time}
                      </div>

                      {/* Icon */}
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 transition-all duration-500 shadow-inner mx-auto ${isSecondary ? "bg-[#006e2a]/10 text-[#006e2a] group-hover:bg-[#006e2a] group-hover:text-white" : "bg-[#004d40]/10 text-[#004d40] group-hover:bg-[#004d40] group-hover:text-white"}`}
                      >
                        <span className="material-symbols-outlined text-2xl sm:text-3xl">
                          {j.icon}
                        </span>
                      </div>

                      {/* Text */}
                      <div className="text-center">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-[#004d40] mb-2 sm:mb-3 font-serif">
                          {j.title}
                        </h3>
                        <p className="text-[#3f4945] text-xs sm:text-sm leading-relaxed font-light">
                          {j.desc}
                        </p>
                      </div>

                      {/* Dot */}
                      <div className="mt-5 sm:mt-6 flex justify-center">
                        <div
                          className={`w-2 h-2 rounded-full transition-all duration-500 group-hover:scale-150 ${isSecondary ? "bg-[#006e2a]/20 group-hover:bg-[#006e2a]" : "bg-[#004d40]/20 group-hover:bg-[#004d40]"}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 bg-white relative overflow-hidden group">
          <IslamicBg opacity="opacity-[0.03]" />

          <div className="max-w-5xl mx-auto relative z-10 transition-transform duration-700 group-hover:scale-[1.01]">
            <div className="bg-white rounded-[3rem] shadow-2xl relative overflow-hidden p-8 sm:p-12 md:p-20 border border-[#bfc9c4]/20">
              {/* Subtle pattern */}
              <IslamicBg opacity="opacity-5" />

              <div className="relative z-10 text-center">
                <div className="flex flex-col items-center mb-8 sm:mb-10">
                  <div className="w-px h-10 sm:h-12 bg-gradient-to-b from-transparent via-[#004d40]/30 to-transparent mb-6" />
                  <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#004d40]/10 border border-[#004d40]/20 shadow-inner">
                    <span className="material-symbols-outlined text-[#004d40] text-sm">
                      verified
                    </span>
                    <span className="text-[#004d40] font-bold tracking-[0.3em] text-[10px] uppercase">
                      Excellence in Education
                    </span>
                  </div>
                </div>

                <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 sm:mb-8 tracking-tight leading-tight text-[#004d40] font-serif">
                  Siap Bergabung <br />
                  Bersama Kami?
                </h2>

                <p className="text-base sm:text-xl text-[#3f4945] mb-10 sm:mb-12 leading-relaxed max-w-2xl mx-auto font-light">
                  Pendaftaran Peserta Didik Baru (PPDB) Tahun Ajaran{" "}
                  <span className="text-[#004d40] font-bold">2026/2027</span>{" "}
                  telah dibuka. Kuota terbatas untuk memastikan kualitas
                  pembelajaran yang optimal.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                  <Link
                    to="/ppdb"
                    className="group/btn w-full sm:w-auto relative inline-flex items-center justify-center gap-3 bg-[#006e2a] text-white px-10 sm:px-12 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(0,110,42,0.4)]"
                  >
                    <span className="relative z-10">Daftar Sekarang</span>
                  </Link>
                  <Link
                    to="/contact"
                    className="w-full sm:w-auto px-10 sm:px-12 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-xl text-[#004d40] border border-[#004d40]/30 bg-transparent hover:bg-[#004d40]/5 transition-all duration-500 hover:border-[#004d40]/50 hover:scale-105 text-center"
                  >
                    Hubungi Admin
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Ekstrakurikuler ───────────────────────────────────────────────── */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 bg-[#f8f9fa] relative overflow-hidden">
          <IslamicBg opacity="opacity-[0.03]" />

          <div className="max-w-[1280px] mx-auto relative z-10">
            {/* Header row */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 sm:mb-20 gap-8 sm:gap-12 relative">
              {/* Left accent line */}
              <div className="absolute -left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-[#006e2a] via-[#004d40]/30 to-transparent rounded-full opacity-40 hidden lg:block" />

              <div className="max-w-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <span className="px-4 sm:px-5 py-2 rounded-full bg-[#004d40]/5 text-[#004d40] font-bold tracking-[0.2em] uppercase text-[10px] sm:text-xs shadow-sm border border-[#004d40]/10">
                    PENGEMBANGAN POTENSI
                  </span>
                  <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-[#004d40]/30 to-transparent" />
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-[#004d40] mb-6 sm:mb-8 tracking-tight leading-[1.1] font-serif">
                  Ekstrakurikuler <br />
                  <span className="text-[#006e2a] relative inline-block">
                    Modern
                    <svg
                      className="absolute -bottom-2 left-0 w-full h-2 text-[#006e2a]/20"
                      preserveAspectRatio="none"
                      viewBox="0 0 100 10"
                    >
                      <path
                        d="M0 5 Q 25 0, 50 5 T 100 5"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="4"
                      />
                    </svg>
                  </span>
                </h2>
                <p className="text-base sm:text-xl text-[#3f4945] leading-relaxed font-light max-w-xl">
                  Fasilitas dan program pilihan yang dirancang khusus untuk
                  mengeksplorasi{" "}
                  <span className="font-semibold text-[#004d40]">
                    potensi unik
                  </span>{" "}
                  setiap siswa melalui pendekatan modern dan nilai-nilai Islami.
                </p>
              </div>

              <div className="flex flex-col items-start lg:items-end gap-4">
                <a
                  href="#"
                  className="group/btn inline-flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 rounded-full border border-[#004d40]/20 text-[#004d40] font-bold text-base sm:text-lg transition-all duration-500 hover:bg-[#004d40]/5 hover:border-[#004d40]/40 hover:-translate-y-1"
                >
                  <span>Lihat Semua Jadwal</span>
                  <span className="material-symbols-outlined transition-transform duration-500 group-hover/btn:translate-x-2">
                    arrow_right_alt
                  </span>
                </a>
                <span className="text-[10px] sm:text-xs text-[#3f4945]/60 tracking-widest uppercase font-medium">
                  Update: Semester Ganjil
                </span>
              </div>
            </div>

            {/* Masonry grid — stacked on mobile, 2-col on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {ekstrakurikuler.map((e, idx) => (
                <div
                  key={idx}
                  className={`group relative rounded-[2.5rem] border border-[#bfc9c4]/20 shadow-sm hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)] hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col justify-end ${e.tall ? "min-h-[500px]" : "min-h-[400px]"}`}
                >
                  <img
                    alt={e.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    src={e.img}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Tag */}
                  <div className="absolute top-5 sm:top-6 left-5 sm:left-6 z-20">
                    <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-widest border border-white/30 shadow-sm">
                      {e.tag}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-6 sm:p-8 backdrop-blur-md bg-black/30 border-t border-white/10 mt-auto transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex justify-between items-end gap-4">
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 font-serif">
                          {e.title}
                        </h3>
                        <p className="text-white/80 text-xs sm:text-sm max-w-[280px] leading-relaxed">
                          {e.desc}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-[#006e2a] transition-colors shadow-lg border border-white/20 shrink-0"
                      >
                        <span className="material-symbols-outlined text-sm sm:text-base">
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
