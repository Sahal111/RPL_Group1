import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

// ── Data ──────────────────────────────────────────────────────────────────────

const CONTACT_CARDS = [
  {
    icon: "chat",
    label: "WhatsApp",
    sub: "Panitia PPDB",
    cta: "Hubungi via WA",
    href: "https://wa.me/6285811723878?text=Halo%20MI%20Nurul%20Huda%203",
  },
  {
    icon: "call",
    label: "Telepon",
    sub: "Kantor Sekolah",
    cta: "Hubungi Sekolah",
    href: "tel:+6285811723878",
  },
  {
    icon: "mail",
    label: "Email",
    sub: "Informasi Umum",
    cta: "Kirim Email",
    href: "mailto:minurulhuda3nh@gmail.com",
  },
  {
    icon: "location_on",
    label: "Lokasi",
    sub: "MI Nurul Huda 3",
    cta: "Lihat di Maps",
    href: "https://maps.google.com/?q=MI+Nurul+Huda+3+Bogor",
  },
];

const SOCIALS = [
  {
    name: "Instagram",
    handle: "@minurulhuda3",
    icon: "fab fa-instagram",
    gradient:
      "linear-gradient(135deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
    hoverBg: "from-yellow-400/10 via-red-500/10 to-purple-500/10",
    href: "https://instagram.com",
  },
  {
    name: "Facebook",
    handle: "MI Nurul Huda 3",
    icon: "fab fa-facebook-f",
    gradient: "#1877F2",
    hoverBg: "from-blue-600/10 to-blue-500/10",
    href: "https://facebook.com",
  },
  {
    name: "YouTube",
    handle: "Official Channel",
    icon: "fab fa-youtube",
    gradient: "#FF0000",
    hoverBg: "from-red-600/10 to-red-500/10",
    href: "https://youtube.com",
  },
  {
    name: "TikTok",
    handle: "@minurulhuda3_official",
    icon: "fab fa-tiktok",
    gradient: "#000000",
    hoverBg: "from-gray-900/10 to-gray-800/10",
    href: "https://tiktok.com",
  },
];

const FAQS = [
  {
    q: "Kapan waktu terbaik berkunjung ke sekolah?",
    a: "Waktu terbaik untuk berkunjung adalah pada hari Senin - Kamis pukul 08.00 - 14.00 WIB. Disarankan untuk membuat janji temu terlebih dahulu agar layanan lebih maksimal.",
  },
  {
    q: "Apakah perlu janji temu untuk konsultasi PPDB?",
    a: "Tidak wajib, namun sangat disarankan menghubungi admin PPDB melalui WhatsApp sebelum datang, untuk memastikan kelengkapan dokumen yang perlu dibawa.",
  },
  {
    q: "Berapa lama estimasi respon email?",
    a: "Kami berusaha membalas seluruh email dalam kurun waktu 1x24 jam pada hari kerja. Untuk hal yang mendesak, silakan gunakan fasilitas WhatsApp atau Telepon.",
  },
];

// ── Reusable ──────────────────────────────────────────────────────────────────

function SectionBadge({ icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 bg-brand-green/10 px-4 py-1.5 rounded-full border border-brand-green/20 mb-6">
      <span className="material-symbols-outlined text-brand-green text-sm">
        {icon}
      </span>
      <span className="text-brand-green font-bold text-[11px] uppercase tracking-[0.2em]">
        {label}
      </span>
    </div>
  );
}

function IslamicDot({ className = "" }) {
  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 10px 10px, rgba(0,52,43,0.05) 2px, transparent 0)",
        backgroundSize: "30px 30px",
      }}
    />
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    subject: "ppdb",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(2);

  const revealRefs = useRef([]);
  const addReveal = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("cp-reveal-active");
        }),
      { threshold: 0.08 },
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
  };

  return (
    <div className="bg-[#f8faf9] text-[#191c1c] font-sans antialiased overflow-x-hidden relative">
      <style>{`
        /* ── Fonts inherit from app ── */
        .cp-reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.22,1,0.36,1); }
        .cp-reveal-active { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) { .cp-reveal { transition: none; } }

        /* ── Hero ── */
        .cp-hero-bg {
          background: linear-gradient(135deg, rgba(0,52,43,0.95) 0%, rgba(0,77,64,0.88) 100%);
        }
        /* ── Glass card ── */
        .cp-glass {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.2);
        }
        /* ── Input ── */
        .cp-input {
          width: 100%;
          padding: 14px 18px;
          border: 1.5px solid rgba(191,201,196,0.5);
          border-radius: 14px;
          font-size: 14px;
          font-family: inherit;
          background: #fff;
          color: #191c1c;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .cp-input:focus {
          border-color: #004d40;
          box-shadow: 0 0 0 3px rgba(0,77,64,0.12);
        }
        .cp-input::placeholder { color: rgba(63,73,69,0.5); }

        /* ── FAQ accordion ── */
        .cp-faq-body {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.4s ease-in-out, opacity 0.35s ease, padding 0.35s ease;
        }
        .cp-faq-open .cp-faq-body {
          max-height: 200px;
          opacity: 1;
        }
        .cp-faq-icon {
          transition: transform 0.35s ease;
        }
        .cp-faq-open .cp-faq-icon {
          transform: rotate(180deg);
        }

        /* ── Glow btn ── */
        .cp-btn-glow:hover {
          box-shadow: 0 15px 40px rgba(0,200,83,0.4);
        }

        /* ── Ping dot ── */
        @keyframes cp-ping {
          0%,100% { transform: scale(1); opacity: 0.75; }
          50% { transform: scale(1.8); opacity: 0; }
        }
        .cp-ping { animation: cp-ping 1.4s ease-in-out infinite; }

        /* ── Map status badge ── */
        .cp-status-badge {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        
        /* ── Floating blobs ── */
        .cp-blob {
          position: absolute;
          filter: blur(120px);
          opacity: 0.08;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      {/* ── Env blobs ── */}
      <div className="cp-blob bg-brand-green w-[600px] h-[600px] top-[-100px] right-[-200px]" />
      <div className="cp-blob bg-brand-gold w-[400px] h-[400px] top-[40%] left-[-150px]" />

      <PublicNavbar />

      <main>
        {/* ══════════════════════════════════════════════════════════════════════
            1. HERO
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-brand-darkgreen">
          {/* Background layers */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-darkgreen to-[#002b23]" />
            <IslamicDot className="inset-0 opacity-20" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-green/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-green/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#f8faf9] to-transparent" />
          </div>

          {/* Glass card */}
          <div className="relative z-10 max-w-4xl w-full cp-glass rounded-[3rem] p-8 sm:p-12 md:p-20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-[1.01] transition-all duration-500 ease-out mt-24 md:mt-28">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-[3rem] pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center text-center gap-7 md:gap-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-brand-darkgreen/40 backdrop-blur-md px-5 py-2 rounded-full border border-white/10 shadow-lg">
                <span className="material-symbols-outlined text-brand-green text-lg">
                  contact_support
                </span>
                <span className="text-white font-bold text-[11px] uppercase tracking-[0.22em]">
                  Hubungi Kami
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl text-white font-extrabold tracking-tight leading-[1.1]">
                Mari <span className="text-brand-green">Terhubung</span>
              </h1>

              {/* Description */}
              <p className="text-white/80 max-w-2xl leading-relaxed text-base md:text-lg">
                Kami siap membantu menjawab setiap pertanyaan dan memberikan
                informasi yang Anda butuhkan untuk masa depan pendidikan
                putra-putri Anda.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto">
                <a
                  href="#form-pesan"
                  className="w-full sm:w-auto bg-brand-green text-white px-8 py-4 rounded-full font-bold text-base hover:scale-105 transition-transform cp-btn-glow flex items-center justify-center gap-2 shadow-lg shadow-brand-green/30"
                >
                  Kirim Pesan
                  <span className="material-symbols-outlined text-xl">
                    send
                  </span>
                </a>
                <a
                  href="#lokasi"
                  className="w-full sm:w-auto bg-white/10 text-white border border-white/20 backdrop-blur-md px-8 py-4 rounded-full font-bold text-base hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  Peta Lokasi
                  <span className="material-symbols-outlined text-xl">map</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            2. MAP + JAM PELAYANAN
        ══════════════════════════════════════════════════════════════════════ */}
        <section
          id="lokasi"
          className="relative py-20 md:py-28 px-4 overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-green/5 blur-[120px] rounded-full" />
            <IslamicDot className="inset-0 opacity-30" />
          </div>

          <div className="max-w-[1280px] mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
              {/* ── Map Column ── */}
              <div className="lg:col-span-7 cp-reveal" ref={addReveal}>
                <div className="group relative overflow-hidden h-full min-h-[400px] sm:min-h-[520px] lg:min-h-[600px] rounded-[2.5rem] border border-white/20 shadow-2xl transition-all duration-700 hover:shadow-brand-darkgreen/20 hover:scale-[1.01]">
                  {/* Map embed */}
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4299.407971394033!2d106.7893666!3d-6.531793599999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c393e84a8c93%3A0xd2d2e8c1c14ccbf8!2sMI%20NURUL%20HUDA%203!5e1!3m2!1sid!2sid!4v1782985129400!5m2!1sid!2sid"
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    title="Lokasi MI Nurul Huda 3"
                    style={{ filter: "grayscale(0.1) saturate(1.1)" }}
                  />
                  {/* Gradient overlay bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-darkgreen via-brand-darkgreen/10 to-transparent opacity-80 pointer-events-none" />

                  {/* Status badge */}
                  <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
                    <div className="cp-status-badge flex items-center gap-2.5 px-4 py-2 rounded-full shadow-xl border border-white/40">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="cp-ping absolute inset-0 rounded-full bg-brand-green opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-green" />
                      </span>
                      <span className="text-xs font-extrabold text-brand-darkgreen tracking-[0.15em] uppercase">
                        Sekolah Sedang Buka
                      </span>
                    </div>
                  </div>

                  {/* Bottom overlay card */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 z-10 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-2xl p-5 sm:p-6 md:p-8 rounded-[2rem] border border-white/40 shadow-2xl pointer-events-auto">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-darkgreen/10 rounded-2xl flex items-center justify-center shrink-0 border border-brand-darkgreen/10">
                            <span
                              className="material-symbols-outlined text-brand-darkgreen text-2xl sm:text-3xl"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              mosque
                            </span>
                          </div>
                          <div>
                            <h4 className="text-xl sm:text-2xl font-extrabold text-brand-darkgreen tracking-tight leading-tight">
                              Kampus Utama
                            </h4>
                            <p className="text-[#3f4945] text-sm flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-brand-green text-base">
                                location_on
                              </span>
                              Jl. Kencana Rt 01/02, Tanah Sareal, Bogor
                            </p>
                          </div>
                        </div>
                        <a
                          href="https://maps.google.com/?q=MI+Nurul+Huda+3+Bogor"
                          target="_blank"
                          rel="noreferrer"
                          className="w-full sm:w-auto bg-brand-green text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#00e676] hover:text-brand-darkgreen transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-brand-green/40 hover:scale-105 active:scale-95"
                        >
                          Petunjuk Arah
                          <span className="material-symbols-outlined text-lg">
                            explore
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Info Column ── */}
              <div
                className="lg:col-span-5 flex flex-col gap-5 md:gap-6 cp-reveal"
                ref={addReveal}
                style={{ transitionDelay: "100ms" }}
              >
                {/* Jam Pelayanan */}
                <div className="bg-brand-darkgreen text-white rounded-[2.5rem] p-7 sm:p-10 shadow-xl relative overflow-hidden flex-1 flex flex-col justify-center border border-white/10 hover:-translate-y-2 transition-all duration-500">
                  <IslamicDot className="inset-0 opacity-10" />
                  <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-green/20 rounded-full blur-[100px]" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 sm:gap-5 mb-8">
                      <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-[0_0_20px_rgba(0,200,83,0.3)]">
                        <span className="material-symbols-outlined text-brand-green text-3xl">
                          schedule
                        </span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          Jam Pelayanan
                        </h3>
                        <p className="text-white/70 text-sm mt-0.5">
                          Waktu operasional kantor
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        {
                          icon: "today",
                          label: "Senin – Jumat",
                          time: "07:00 – 15:00",
                          active: true,
                        },
                        {
                          icon: "event",
                          label: "Sabtu",
                          time: "07:00 – 12:00",
                          active: false,
                        },
                        {
                          icon: "event_busy",
                          label: "Minggu & Libur",
                          time: "Tutup",
                          active: false,
                          closed: true,
                        },
                      ].map(({ icon, label, time, active, closed }) => (
                        <div
                          key={label}
                          className="flex justify-between items-center py-4 border-b border-white/10 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`material-symbols-outlined ${active ? "text-brand-green" : closed ? "text-white/30" : "text-white/50"} text-xl`}
                            >
                              {icon}
                            </span>
                            <span
                              className={`text-sm font-medium ${closed ? "text-white/60" : "text-white/90"}`}
                            >
                              {label}
                            </span>
                          </div>
                          {closed ? (
                            <span className="font-bold text-red-400 bg-red-400/20 px-4 py-1.5 rounded-full text-xs uppercase tracking-wider border border-red-400/20">
                              Tutup
                            </span>
                          ) : (
                            <span
                              className={`font-bold ${active ? "text-brand-green" : "text-white/90"} bg-white/10 px-4 py-1.5 rounded-full text-xs backdrop-blur-sm border border-white/5`}
                            >
                              {time}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Kunjungan Langsung */}
                <div className="bg-[#f0f5ec] border border-white/40 rounded-[2.5rem] p-7 sm:p-10 relative group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden shadow-md">
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-green/10 rounded-full blur-[80px]" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="pr-4">
                        <h4 className="text-2xl font-bold text-brand-darkgreen mb-2">
                          Kunjungan Langsung
                        </h4>
                        <p className="text-[#3f4945] text-sm leading-relaxed">
                          Kami sangat menyambut kedatangan Anda. Silakan
                          konfirmasi jadwal kunjungan untuk layanan yang lebih
                          personal.
                        </p>
                      </div>
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shrink-0 shadow-md border border-[#bfc9c4]/30 group-hover:scale-110 transition-transform duration-500">
                        <span className="material-symbols-outlined text-brand-darkgreen text-2xl">
                          meeting_room
                        </span>
                      </div>
                    </div>
                    <a
                      href="https://wa.me/6285811723878?text=Halo%20saya%20ingin%20konfirmasi%20kunjungan%20ke%20MI%20Nurul%20Huda%203"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-brand-darkgreen text-white px-6 py-4 rounded-full font-bold text-sm flex items-center justify-center gap-3 hover:bg-brand-green transition-all duration-500 shadow-[0_10px_20px_rgba(0,52,43,0.2)] hover:shadow-[0_15px_30px_rgba(0,110,42,0.3)] hover:-translate-y-0.5 cp-btn-glow"
                    >
                      <span
                        className="material-symbols-outlined text-xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        chat
                      </span>
                      Konfirmasi via WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            3. KONTAK UTAMA — 4 cards
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 md:py-28 px-4 max-w-[1280px] mx-auto relative">
          <IslamicDot className="inset-0 opacity-40 z-[-1]" />

          <div className="text-center mb-12 md:mb-16 cp-reveal" ref={addReveal}>
            <SectionBadge icon="hub" label="Hubungi Kami" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-brand-darkgreen font-bold mb-4">
              Akses Kontak Utama
            </h2>
            <p className="text-[#3f4945] max-w-2xl mx-auto text-sm md:text-base">
              Pilih kanal komunikasi yang sesuai dengan kebutuhan Anda untuk
              respons yang lebih cepat.
            </p>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 cp-reveal"
            ref={addReveal}
            style={{ transitionDelay: "80ms" }}
          >
            {CONTACT_CARDS.map(({ icon, label, sub, cta, href }) => (
              <div
                key={label}
                className="bg-white rounded-[2.5rem] p-7 sm:p-8 transition-all duration-500 group hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full relative overflow-hidden border border-gray-100 shadow-sm items-center text-center"
              >
                <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green mb-6 group-hover:bg-brand-green/20 transition-colors duration-500 shadow-[0_0_20px_rgba(0,200,83,0.1)]">
                  <span
                    className="material-symbols-outlined text-4xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-brand-darkgreen mb-1">
                  {label}
                </h3>
                <p className="text-sm font-medium text-[#3f4945] mb-7">{sub}</p>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="mt-auto inline-flex items-center justify-center gap-2 border border-brand-green/30 hover:bg-brand-green/5 px-5 py-3 rounded-xl text-brand-darkgreen font-bold text-sm transition-all duration-300 group/link w-full"
                >
                  {cta}
                  <span className="material-symbols-outlined text-brand-green text-lg transition-transform duration-300 group-hover/link:translate-x-1.5">
                    arrow_forward
                  </span>
                </a>
              </div>
            ))}
          </div>
        </section>
        
        {/* ══════════════════════════════════════════════════════════════════════
            5. SOSMED + FAQ (Bento)
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 md:py-28 px-4 max-w-[1280px] mx-auto border-t border-[#e1e3e2]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-start">
            {/* ── Social Media ── */}
            <div className="lg:col-span-5 space-y-8 cp-reveal" ref={addReveal}>
              <div className="flex flex-col items-center text-center space-y-4">
                <SectionBadge icon="share" label="Komunitas" />
                <h2 className="text-3xl sm:text-4xl md:text-5xl text-brand-darkgreen font-extrabold leading-tight">
                  Terhubung Secara{" "}
                  <span className="text-brand-green">Digital</span>
                </h2>
                <div className="flex items-center gap-4 py-2 w-full max-w-sm">
                  <div className="h-px w-12 bg-[#bfc9c4]/40" />
                  <div className="w-2 h-2 rounded-full bg-brand-green/40" />
                  <div className="h-px flex-1 bg-[#bfc9c4]/40" />
                </div>
                <p className="text-[#3f4945] text-sm md:text-base leading-relaxed max-w-md">
                  Ikuti perjalanan kami dan dapatkan informasi terbaru melalui
                  kanal media sosial resmi MI Nurul Huda 3.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {SOCIALS.map(({ name, handle, icon, gradient, href }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-white/80 backdrop-blur-md border border-[#e1e3e2] hover:border-transparent transition-all duration-500 hover:-translate-y-2 hover:shadow-xl flex flex-col gap-4 items-center text-center"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"
                      style={{ background: gradient }}
                    >
                      <i className={`${icon} text-xl`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-darkgreen text-sm">
                        {name}
                      </h4>
                      <p className="text-xs text-[#3f4945] mt-0.5">{handle}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* ── FAQ ── */}
            <div
              className="lg:col-span-7 cp-reveal"
              ref={addReveal}
              style={{ transitionDelay: "100ms" }}
            >
              <div className="bg-white rounded-[2.5rem] p-7 sm:p-10 md:p-12 border border-gray-100 shadow-sm relative overflow-hidden hover:shadow-[0_0_30px_rgba(0,200,83,0.12)] hover:border-brand-green/20 transition-all duration-500">
                <IslamicDot className="inset-0 opacity-5" />
                <div className="relative z-10 space-y-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="inline-flex items-center gap-2.5 bg-brand-green/10 px-5 py-2 rounded-full border border-brand-green/20 shadow-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="cp-ping absolute inset-0 rounded-full bg-brand-green opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green" />
                      </span>
                      <span className="font-bold text-brand-green text-[11px] uppercase tracking-[0.25em]">
                        Pusat Bantuan
                      </span>
                    </div>

                    <div className="relative inline-block">
                      <h3 className="text-3xl sm:text-4xl md:text-5xl text-brand-darkgreen font-bold tracking-tight">
                        Pertanyaan Umum
                      </h3>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-brand-green rounded-full opacity-60" />
                    </div>

                    <p className="text-[#3f4945]/80 text-sm md:text-base leading-relaxed max-w-lg mt-4">
                      Temukan jawaban untuk pertanyaan yang paling sering
                      diajukan mengenai proses pendidikan di MI Nurul Huda 3.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {FAQS.map(({ q, a }, i) => (
                      <div
                        key={i}
                        className={`group border rounded-[2rem] overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg bg-[#f8faf9] ${openFaq === i ? "cp-faq-open border-brand-green" : "border-[#e1e3e2] hover:border-brand-green/40"}`}
                      >
                        <button
                          className="w-full text-left px-6 sm:px-8 py-6 flex justify-between items-center gap-4 focus:outline-none hover:bg-brand-green/5 transition-colors duration-300"
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          aria-expanded={openFaq === i}
                        >
                          <span
                            className={`text-base sm:text-lg font-semibold pr-2 transition-colors ${openFaq === i ? "text-brand-green" : "text-brand-darkgreen"}`}
                          >
                            {q}
                          </span>
                          <div
                            className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${openFaq === i ? "bg-brand-green border-brand-green" : "border-brand-green/30 group-hover:scale-110"}`}
                          >
                            <span
                              className={`material-symbols-outlined text-lg cp-faq-icon ${openFaq === i ? "text-white" : "text-brand-green"}`}
                            >
                              expand_more
                            </span>
                          </div>
                        </button>
                        <div className="cp-faq-body">
                          <p className="px-6 sm:px-8 pb-7 text-sm md:text-base leading-relaxed text-[#3f4945]">
                            {a}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            6. CTA
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 md:py-24 px-4 relative overflow-hidden">
          <div
            className="max-w-5xl mx-auto relative z-10 cp-reveal"
            ref={addReveal}
          >
            <div className="relative bg-gradient-to-br from-[#004d40] via-brand-darkgreen to-[#002b23] rounded-[3rem] p-10 sm:p-14 md:p-20 text-center overflow-hidden shadow-2xl shadow-brand-green/20 border border-white/10 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(0,200,83,0.2)] transition-all duration-500">
              <IslamicDot className="inset-0 opacity-10" />

              <div className="relative inline-flex items-center justify-center w-16 h-16 bg-brand-green/10 rounded-2xl mb-8 border border-brand-green/20">
                <span className="material-symbols-outlined text-3xl text-white">
                  help_outline
                </span>
                <div className="absolute inset-0 bg-brand-green/20 blur-xl rounded-full animate-pulse opacity-50" />
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-white">
                Punya Pertanyaan <span className="text-brand-green">Lain?</span>
              </h2>
              <p className="text-white/80 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed text-sm md:text-lg">
                Tim kami siap membantu menjawab setiap keraguan dan memberikan
                informasi terlengkap untuk masa depan pendidikan putra-putri
                Anda.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <a
                  href="https://wa.me/6285811723878?text=Halo%20MI%20Nurul%20Huda%203"
                  target="_blank"
                  rel="noreferrer"
                  className="relative w-full sm:w-auto group/btn bg-[#25D366] text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] active:scale-95"
                >
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    chat
                  </span>
                  Hubungi via WhatsApp
                </a>
                <Link
                  to="/"
                  className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-base border border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Kembali ke Beranda
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/6285811723878?text=Halo%20MI%20Nurul%20Huda%203"
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        className="whatsapp-btn w-14 h-14 md:w-16 md:h-16 bg-brand-green text-white rounded-full flex items-center justify-center text-2xl md:text-3xl shadow-[0_8px_30px_rgb(0,200,83,0.4)] hover:bg-[#00e676] transition-transform hover:scale-110"
      >
        <i className="fab fa-whatsapp" />
      </a>

      <PublicFooter />
    </div>
  );
}
