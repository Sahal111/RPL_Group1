import { Link } from "react-router-dom";
import PublicNavbar from "./public/PublicNavbar";
import PublicFooter from "./public/PublicFooter";
import heroImageFallback from "../assets/background.jpg";

const HERO_BG =
  "https://lh3.googleusercontent.com/aida/AP1WRLtGDhU7HLNjOtCRIMvRHEY7cEhJoJJQmKGxOZj7N7lAiNW48jqyB8MIjF3LKpEhMZf-Yn2XOt4AYbbPSYSrzj8xZ6MckiqtwbQjiJt4WWZx9KEtreEMwG_mje5Jsh1Ec6XRAU47NjwEPeBgN4rRnJeLjC_N7y9NRVZLNoicyDvh8pdI4qj2MY9NhS0-FUvC3HRxwpAbM2GL0HbR9G-qHSrZQr0A_2KmCI0FGqyPU3cEl4-7Cjuh5FzhFpg";

const TESTIMONIALS = [
  {
    name: "Bunda Sarah",
    role: "Wali Murid Kelas 4",
    text: "Alhamdulillah, sejak bersekolah di MI Nurul Huda 3, hafalan Al-Qur'an anak saya berkembang pesat dan akhlaknya semakin baik. Fasilitas sekolahnya juga sangat mendukung.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBZtxg4FVZfM1bxoXXGFlYYakJ15SSID_EsOK_AtaxP50upJZAmDyCsRuhycW4eK_6dVUJ9y5cLooONAYiXbP9d9JGQ6i91BvukMg5yx50AfxzcrNouamjLxWZsIwm10WnpsmhIEsbu4E-azxz-i5weYp3sG5H_RJpT1_k5CrDeZV16uSf6TNeWmPKnT37jGcspUMM0MBmm8JQs-J2z21g1GJCkYkfVys3gLgFI3LQfnyMhP4pcQJ2",
  },
  {
    name: "Ayah Budi",
    role: "Wali Murid Kelas 2",
    text: "Program digital classroom-nya luar biasa. Anak-anak belajar dengan cara yang menyenangkan dan interaktif. Guru-gurunya juga sangat ramah dan sabar.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBHUXgmLgXHnrUh8Z9-K-z5cziwNqF0SK9ojcUCbSat5PIzz4McC3OBGc-gLzx5oAcujsVtGtAa0w2IgoWY87oOBfyhkuuiUHX3eSStBN0_vd7qZrp5_kBnhjmd1D0DcwUFGkNvYfYI2iICj5psOqjp53z0Gjp9bnE54AC2TI7dbvImg9gx448NASJ38_OKbgr99LU2_kN1LOTotDMrjBv61uAYlVhRzue8ImFsErUTSskxwzpDc6-",
  },
  {
    name: "Bunda Ani",
    role: "Wali Murid Kelas 5",
    text: "Ekstrakurikuler yang beragam membuat anak saya bisa menyalurkan bakatnya dengan baik. Lingkungan sekolahnya bersih dan aman.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrMH_orX674cr5PEQPzbAkF1kCmzn339qBBJ76nY8iFM-E-8rW5VE7JGDdjkXuFejYx0JivSaW1BkM0gudI0MedR_l2L4Uas7k7okjShCEbHfavc0ymgleoRkEtCWqSHnSUXBBUSk2xdFOJpkLuemBZ2foMKjG9wUA9w97DU53NrDJWH6ALRtowEVjwAAFE7TBkKXmxD2bkXvmILiuosFOGPs-BGdC90Y8ZeQ08s51vPhSxIc76WRs",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-brand-lightbg font-sans relative text-on-surface min-h-screen overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
      <PublicNavbar />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 sm:pt-32 pb-20 sm:pb-32 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Background"
            className="w-full h-full object-cover"
            src={HERO_BG}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = heroImageFallback;
            }}
          />
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute bottom-0 left-0 right-0 h-64 hero-fade" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center mt-4 sm:mt-12 w-full px-2">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs md:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-full mb-10 flex items-center gap-2 sm:gap-3 shadow-lg max-w-full text-center">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-brand-green animate-pulse shrink-0" />
            <span>Penerimaan Peserta Didik Baru (PPDB) Telah Dibuka</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.15] tracking-tight drop-shadow-sm font-serif">
            Membentuk Generasi{" "}
            <span className="text-brand-green relative inline-block">
              Qur&apos;ani
              <svg
                className="absolute w-full h-3 -bottom-1 left-0 text-brand-green opacity-60"
                preserveAspectRatio="none"
                viewBox="0 0 100 10"
              >
                <path
                  d="M0 5 Q 50 10 100 5"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="4"
                />
              </svg>
            </span>
            ,<br />
            Cerdas &amp; Berakhlak Mulia
          </h1>
          <p className="text-lg md:text-xl text-white/95 font-medium mb-12 max-w-3xl leading-relaxed drop-shadow-sm">
            Mewujudkan pendidikan Islam yang unggul, modern, dan berkarakter
            untuk masa depan buah hati Anda di lingkungan yang asri dan
            kondusif.
          </p>
          <div className="flex flex-col sm:flex-row gap-5">
            <Link
              to="/ppdb"
              className="bg-brand-green text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-brand-green/30 hover:bg-[#00e676] hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
            >
              Cek Info PPDB <i className="fas fa-arrow-right" />
            </Link>
            <a
              href="#keunggulan"
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-white/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
            >
              <i className="fas fa-th-large" /> Lihat Keunggulan
            </a>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="relative z-20 -mt-12 sm:-mt-24 px-4 md:px-12 lg:px-24 mb-16 md:mb-28">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: "fa-graduation-cap",
                value: "1000+",
                label: "Alumni Berprestasi",
              },
              {
                icon: "fa-shield-alt",
                value: "50+",
                label: "Guru Tersertifikasi",
              },
              {
                icon: "fa-trophy",
                value: "20+",
                label: "Ekstrakurikuler",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="group relative flex items-center gap-6 p-6 bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className="w-14 h-14 shrink-0 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green border border-brand-green/20 group-hover:bg-brand-green group-hover:text-white transition-all duration-500">
                  <i className={`fas ${s.icon} text-2xl`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-extrabold text-brand-darkgreen tracking-tight">
                    {s.value}
                  </span>
                  <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest">
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="keunggulan"
        className="py-20 md:py-28 px-4 md:px-12 lg:px-24 bg-islamic-pattern relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center mb-20 md:mb-32 group/hover-zone transition-all duration-700 ease-in-out hover:bg-brand-green/5 p-4 md:p-10 rounded-[2rem] lg:rounded-[3rem] border border-transparent hover:border-brand-green/10 hover:shadow-2xl">
            <div className="lg:col-span-7 transition-transform duration-500 group-hover/hover-zone:scale-[1.02]">
              <div className="relative">
                <div className="absolute -left-10 -top-10 opacity-[0.05] pointer-events-none hidden lg:block">
                  <svg
                    className="text-brand-darkgreen"
                    fill="none"
                    height="120"
                    viewBox="0 0 100 100"
                    width="120"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M50 0L61.2257 38.7743L100 50L61.2257 61.2257L50 100L38.7743 61.2257L0 50L38.7743 38.7743L50 0Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-3 bg-brand-green/10 border border-brand-green/20 px-5 py-2 rounded-full mb-8">
                  <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                  <span className="text-brand-darkgreen font-bold text-xs tracking-[0.2em] uppercase">
                    Keunggulan Kami
                  </span>
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-brand-darkgreen mb-10 tracking-tight leading-[1.1] font-serif">
                  Membangun{" "}
                  <span className="text-brand-green relative inline-block">
                    Karakter
                    <span className="absolute bottom-2 left-0 w-full h-1.5 bg-brand-green/20 -z-10 rounded-full" />
                  </span>
                  ,<br />
                  Mencetak{" "}
                  <span className="text-brand-green relative inline-block">
                    Prestasi
                    <span className="absolute bottom-2 left-0 w-full h-1.5 bg-brand-green/20 -z-10 rounded-full" />
                  </span>
                  .
                </h2>
                <p className="text-gray-500 text-lg md:text-xl leading-[1.8] max-w-2xl tracking-wide">
                  Kami menghadirkan ekosistem pendidikan yang harmonis antara{" "}
                  <span className="text-brand-darkgreen font-semibold">
                    kecerdasan intelektual
                  </span>
                  , kemajuan teknologi, dan kedalaman spiritual untuk masa depan
                  putra-putri Anda.
                </p>
                <div className="mt-12 flex items-center gap-4">
                  <div className="h-px w-20 bg-gradient-to-r from-brand-green to-transparent" />
                  <div className="w-2 h-2 rounded-full bg-brand-green/30" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-brand-green/10 rounded-[3rem] blur-2xl" />
                <div className="relative bg-white p-10 rounded-3xl shadow-xl border border-brand-green/20 overflow-hidden group/accreditation transition-all duration-500 group-hover/hover-zone:shadow-2xl group-hover/hover-zone:-translate-y-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-full -mr-16 -mt-16" />
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-20 h-20 bg-brand-darkgreen rounded-full flex items-center justify-center text-brand-gold text-3xl shadow-lg mb-6 border-4 border-brand-green/20">
                      <i className="fas fa-graduation-cap" />
                    </div>
                    <div className="mb-6">
                      <span className="text-brand-green text-xs font-bold tracking-[0.3em] uppercase block mb-2">
                        Sertifikasi Resmi
                      </span>
                      <h4 className="font-extrabold text-brand-darkgreen text-3xl tracking-tight font-serif">
                        Akreditasi A
                      </h4>
                      <p className="text-gray-500 text-sm mt-2 font-medium">
                        Standar Keunggulan Pendidikan Nasional
                      </p>
                    </div>
                    <div className="w-full space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-bold text-brand-darkgreen uppercase tracking-widest">
                        <span>Kualitas Akademik</span>
                        <span>95%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-green w-[95%] rounded-full shadow-[0_0_10px_rgba(0,200,83,0.5)]" />
                      </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-100 w-full flex items-center justify-center gap-2 text-brand-darkgreen/60">
                      <i className="fas fa-shield-alt text-xs" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Terverifikasi BAN-S/M
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-10 items-stretch mt-24 md:mt-32">
            <div className="group relative bg-white p-8 md:p-10 rounded-[2.5rem] shadow-soft hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-2 flex flex-col">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-green/5 rounded-full blur-3xl group-hover:bg-brand-green/10 transition-colors" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform duration-500">
                  <i className="fas fa-book-open" />
                </div>
                <h3 className="text-2xl font-bold text-brand-darkgreen mb-4 font-serif">
                  Tahfidz Al-Qur&apos;an
                </h3>
                <p className="text-gray-500 leading-relaxed mb-8 flex-grow">
                  Metode talaqqi yang interaktif untuk mencetak generasi
                  penghafal Al-Qur&apos;an yang mutqin dan berjiwa qur&apos;ani.
                </p>
                <Link
                  to="/program"
                  className="inline-flex items-center gap-2 text-brand-green font-bold text-sm uppercase tracking-widest group/btn"
                >
                  Selengkapnya
                  <span className="transition-transform group-hover/btn:translate-x-1">
                    <i className="fas fa-arrow-right text-xs" />
                  </span>
                </Link>
              </div>
            </div>

            <div className="group relative bg-brand-darkgreen p-8 md:p-10 rounded-[3rem] shadow-2xl hover:shadow-brand-green/20 transition-all duration-500 md:-mt-8 md:mb-8 overflow-hidden flex flex-col">
              <div className="absolute inset-0 bg-islamic-pattern opacity-[0.05]" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-green/20 rounded-full blur-[80px]" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-20 h-20 bg-brand-green text-white rounded-[2rem] flex items-center justify-center text-3xl mb-8 shadow-lg shadow-brand-green/30 group-hover:rotate-6 transition-transform duration-500">
                  <i className="fas fa-laptop" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 font-serif">
                  Digital Classroom
                </h3>
                <p className="text-white/80 leading-relaxed mb-8 flex-grow">
                  Integrasi teknologi modern dalam setiap ruang kelas untuk
                  pengalaman belajar yang lebih visual dan eksploratif.
                </p>
                <Link
                  to="/program"
                  className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-brand-green hover:border-brand-green transition-all w-fit"
                >
                  Selengkapnya <i className="fas fa-arrow-right text-[10px]" />
                </Link>
              </div>
            </div>

            <div className="group relative bg-white p-8 md:p-10 rounded-[2.5rem] shadow-soft hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-2 flex flex-col">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-green/5 rounded-full blur-3xl group-hover:bg-brand-green/10 transition-colors" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform duration-500">
                  <i className="fas fa-users" />
                </div>
                <h3 className="text-2xl font-bold text-brand-darkgreen mb-4 font-serif">
                  Character Building
                </h3>
                <p className="text-gray-500 leading-relaxed mb-8 flex-grow">
                  Pembentukan akhlakul karimah melalui pembiasaan ibadah harian
                  dan penanaman nilai-nilai adab islami.
                </p>
                <Link
                  to="/program"
                  className="inline-flex items-center gap-2 text-brand-green font-bold text-sm uppercase tracking-widest group/btn"
                >
                  Selengkapnya
                  <span className="transition-transform group-hover/btn:translate-x-1">
                    <i className="fas fa-arrow-right text-xs" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 md:py-28 px-4 md:px-12 lg:px-24 bg-brand-lightbg">
        <div className="max-w-7xl mx-auto relative">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-green/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-brand-darkgreen/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="text-center mb-20 relative z-10">
            <div className="inline-flex items-center gap-3 bg-brand-green/10 border border-brand-green/20 px-5 py-2 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              <span className="text-brand-darkgreen font-bold text-xs tracking-[0.25em] uppercase">
                Program &amp; Ekstrakurikuler
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-darkgreen tracking-tight leading-tight font-serif">
              Program <span className="text-brand-green">Unggulan</span>
            </h2>
            <div className="mt-6 flex justify-center items-center gap-4">
              <div className="h-px w-12 bg-brand-green/30" />
              <div className="w-2 h-2 rounded-full bg-brand-green/40" />
              <div className="h-px w-12 bg-brand-green/30" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {[
              {
                icon: "fa-graduation-cap",
                title: "Kurikulum Nasional",
                desc: "Implementasi Kurikulum Merdeka yang disesuaikan dengan kebutuhan abad 21 untuk mencetak lulusan kompetitif.",
                hover: "group-hover:bg-brand-darkgreen",
              },
              {
                icon: "fa-robot",
                title: "Robotics",
                desc: "Mengembangkan logika dan kreativitas anak melalui pemrograman dan perakitan robot berbasis teknologi terkini.",
                hover: "group-hover:bg-brand-green",
              },
              {
                icon: "fa-bullseye",
                title: "Panahan",
                desc: "Olahraga sunnah yang melatih fokus, kedisiplinan, dan ketangkasan fisik sesuai tuntunan Islami.",
                hover: "group-hover:bg-brand-darkgreen",
              },
              {
                icon: "fa-palette",
                title: "Islamic Arts",
                desc: "Pembinaan bakat seni kaligrafi, marawis, dan nasyid untuk menyalurkan kreativitas dalam bingkai dakwah.",
                hover: "group-hover:bg-brand-green",
              },
            ].map((p) => (
              <div
                key={p.title}
                className="group relative bg-surface-container-low p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-softer hover:shadow-xl hover:border-brand-green/30 hover:-translate-y-2 transition-all duration-500 flex flex-col"
              >
                <div
                  className={`w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-3xl mb-8 shadow-sm group-hover:shadow-md ${p.hover} group-hover:text-white transition-all duration-500`}
                >
                  <i className={`fas ${p.icon}`} />
                </div>
                <h3 className="text-2xl font-bold text-brand-darkgreen mb-4 tracking-tight font-serif">
                  {p.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow font-medium">
                  {p.desc}
                </p>
                <div className="h-1.5 w-12 bg-brand-green/20 rounded-full group-hover:w-full transition-all duration-700" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 md:py-28 px-4 overflow-hidden bg-gradient-to-br from-primary-container via-[#00342b] to-[#002b23]">
        <div className="absolute inset-0 bg-islamic-pattern opacity-[0.03]" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-green/20 blur-[150px] rounded-full -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-gold/10 blur-[150px] rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center bg-white/5 backdrop-blur-sm p-8 md:p-12 lg:p-20 rounded-[3rem] border border-white/10 shadow-2xl">
            <div className="mb-12 relative">
              <div className="absolute inset-0 bg-brand-gold/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] flex items-center justify-center text-brand-gold text-4xl shadow-2xl rotate-6 hover:rotate-0 transition-transform duration-500">
                <i className="fas fa-graduation-cap" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight leading-[1.15] max-w-4xl drop-shadow-sm font-serif">
              Siap Bergabung Menjadi Bagian{" "}
              <span className="text-brand-green">Keluarga Besar</span> Kami?
            </h2>
            <p className="text-white/90 mb-12 text-base md:text-xl max-w-2xl leading-relaxed font-medium">
              Kuota terbatas untuk tahun ajaran baru. Segera daftarkan
              putra-putri Anda untuk mendapatkan pendidikan terbaik berbasis
              nilai-nilai Islami dan fasilitas modern.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
              <Link
                to="/ppdb"
                className="group relative w-full sm:w-auto px-10 py-5 bg-brand-green text-white font-bold text-lg rounded-full shadow-lg shadow-brand-green/30 hover:bg-[#00e676] hover:shadow-[0_15px_40px_rgba(0,200,83,0.5)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-4"
              >
                Daftar Online Sekarang
                <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-10 py-5 bg-white/5 backdrop-blur-md border border-white/30 text-white font-bold text-lg rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-300 flex items-center justify-center gap-4"
              >
                <i className="fas fa-phone-alt text-brand-green" />
                Hubungi Kami
              </Link>
            </div>
            <div className="mt-20 flex items-center gap-6 text-white/70 text-xs font-bold uppercase tracking-[0.3em]">
              <span className="h-px w-12 bg-white/20" />
              <div className="px-6 py-2 border border-white/20 rounded-full backdrop-blur-sm bg-white/5">
                Terakreditasi A
              </div>
              <span className="h-px w-12 bg-white/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 px-4 md:px-12 lg:px-24 bg-islamic-pattern relative overflow-hidden">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 md:mb-24">
            <div className="inline-flex items-center gap-3 bg-brand-green/10 border border-brand-green/20 px-5 py-2 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              <span className="text-brand-darkgreen font-bold text-xs tracking-[0.25em] uppercase">
                Testimoni
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold text-brand-darkgreen tracking-tight leading-tight font-serif">
              Apa Kata <span className="text-brand-green">Orang Tua?</span>
            </h2>
            <p className="mt-6 text-gray-500 max-w-2xl mx-auto text-lg">
              Pengalaman nyata dari para orang tua yang telah mempercayakan
              pendidikan putra-putrinya di MI Nurul Huda 3.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="group bg-white p-8 md:p-10 rounded-[2.5rem] shadow-soft hover:shadow-2xl border border-gray-100 transition-all duration-500 flex flex-col relative"
              >
                <div className="absolute top-8 right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                  <i className="fas fa-quote-right text-6xl text-brand-darkgreen" />
                </div>
                <div className="flex gap-1 text-brand-gold mb-8">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star" />
                  ))}
                </div>
                <p className="text-brand-darkgreen/80 mb-10 leading-relaxed text-lg font-medium italic flex-grow">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-4 pt-8 border-t border-gray-50">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border-2 border-white">
                    <img
                      alt={t.name}
                      className="w-full h-full object-cover"
                      src={t.img}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = heroImageFallback;
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-darkgreen text-lg font-serif">
                      {t.name}
                    </h4>
                    <p className="text-xs text-brand-green font-bold uppercase tracking-widest">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />

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