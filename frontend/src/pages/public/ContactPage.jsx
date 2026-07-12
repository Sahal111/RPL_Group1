import { useEffect, useRef, useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

const C = {
  primary: "#012d1d",
  primaryContainer: "#1b4332",
  tertiaryContainer: "#cba72f",
  surface: "#f8f9fa",
  onSurface: "#191c1d",
  onSurfaceVariant: "#414844",
  outlineVariant: "#c1c8c2",
};

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Alamat Sekolah",
    value: "Jl. Kencana Rt 01/02, Kel. Kencana, Kec. Tanah Sareal, Kota Bogor ",
  },
  {
    icon: Phone,
    label: "Telepon",
    value: "+62 858 1172 3878",
  },
  {
    icon: Mail,
    label: "Email",
    value: "minurulhuda3nh@gmail.com",
  },
  {
    icon: Clock,
    label: "Jam Operasional",
    value: "Senin - Sabtu: 07.00 - 13.00 WIB",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const revealRefs = useRef([]);

  const addReveal = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("reveal-active");
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
    // In real app: POST to API
    setSubmitted(true);
  };

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: C.surface,
        color: C.onSurface,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .reveal-section { opacity: 0; transform: translateY(30px); transition: all 0.8s ease-out; }
        .reveal-section.reveal-active { opacity: 1; transform: translateY(0); }
        .contact-input {
          width: 100%; padding: 12px 16px;
          border: 1.5px solid ${C.outlineVariant}80;
          border-radius: 12px; font-size: 14px;
          background: #fff; color: ${C.onSurface};
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .contact-input:focus {
          border-color: ${C.primaryContainer};
          box-shadow: 0 0 0 3px ${C.primaryContainer}15;
        }
        .contact-input::placeholder { color: ${C.onSurfaceVariant}80; }
        @media (prefers-reduced-motion: reduce) {
          .reveal-section { transition: none; }
        }
      `}</style>

      <PublicNavbar />

      <main className="min-h-screen pt-16 md:pt-20 pb-16 md:pb-24">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="pt-12 md:pt-20 pb-8 md:pb-12 px-4 md:px-12 max-w-[1200px] mx-auto text-center">
          <span
            className="inline-block py-1 px-4 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
            style={{
              background: C.primaryContainer + "15",
              color: C.primaryContainer,
            }}
          >
            Kontak
          </span>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3"
            style={{ color: C.primary }}
          >
            Hubungi Kami
          </h1>
          <p
            className="text-sm md:text-lg max-w-2xl mx-auto"
            style={{ color: C.onSurfaceVariant }}
          >
            Kami siap membantu Anda. Silakan hubungi kami melalui formulir di
            bawah ini atau kunjungi sekolah kami secara langsung.
          </p>
        </section>

        {/* ── Bento: Info + Map + Form ─────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-4 md:px-12">
          <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start reveal-section"
            ref={addReveal}
          >
            {/* Left column */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Contact info card */}
              <div
                className="p-6 md:p-8 rounded-[20px] md:rounded-[24px] relative overflow-hidden"
                style={{
                  background: "#fff",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.04)",
                  border: `1px solid ${C.outlineVariant}40`,
                }}
              >
                <div
                  className="absolute top-0 right-0 w-28 h-28 rounded-bl-full pointer-events-none"
                  style={{ background: C.primaryContainer + "08" }}
                />
                <h2
                  className="text-xl font-bold mb-5"
                  style={{ color: C.primary }}
                >
                  Informasi Kontak
                </h2>
                <div className="space-y-4">
                  {CONTACT_INFO.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 group">
                      <div
                        className="p-2 rounded-lg flex-shrink-0 transition-colors"
                        style={{ background: "#dee8ff" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            C.primaryContainer + "18")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#dee8ff")
                        }
                      >
                        <Icon size={18} style={{ color: C.primaryContainer }} />
                      </div>
                      <div>
                        <p
                          className="text-xs font-bold mb-0.5"
                          style={{ color: C.onSurface }}
                        >
                          {label}
                        </p>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: C.onSurfaceVariant }}
                        >
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map embed */}
              <div
                className="rounded-[20px] md:rounded-[24px] overflow-hidden h-44 md:h-56"
                style={{
                  boxShadow: "0 20px 40px rgba(0,0,0,0.04)",
                }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4299.407971394033!2d106.7893666!3d-6.531793599999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c393e84a8c93%3A0xd2d2e8c1c14ccbf8!2sMI%20NURUL%20HUDA%203!5e1!3m2!1sid!2sid!4v1782985129400!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Lokasi MI Nurul Huda 3"
                />
              </div>
            </div>

            {/* Right column: form */}
            <div className="lg:col-span-7">
              <div
                className="p-6 md:p-10 rounded-[20px] md:rounded-[24px]"
                style={{
                  background: "#fff",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.04)",
                  border: `1px solid ${C.outlineVariant}40`,
                }}
              >
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ color: C.primary }}
                >
                  Kirim Pesan
                </h2>
                <p
                  className="text-sm mb-6"
                  style={{ color: C.onSurfaceVariant }}
                >
                  Silakan isi formulir untuk pertanyaan umum, pendaftaran, atau
                  informasi lainnya.
                </p>

                {submitted ? (
                  <div
                    className="flex flex-col items-center justify-center py-12 gap-4 text-center"
                    style={{
                      background: C.primaryContainer + "08",
                      borderRadius: "16px",
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: C.primaryContainer + "15" }}
                    >
                      <Send size={28} style={{ color: C.primaryContainer }} />
                    </div>
                    <h3
                      className="text-lg font-bold"
                      style={{ color: C.primary }}
                    >
                      Pesan Terkirim!
                    </h3>
                    <p
                      className="text-sm max-w-xs"
                      style={{ color: C.onSurfaceVariant }}
                    >
                      Terima kasih telah menghubungi kami. Kami akan merespons
                      pesan Anda segera.
                    </p>
                    <button
                      className="mt-2 text-sm font-semibold transition-opacity hover:opacity-70"
                      style={{ color: C.primaryContainer }}
                      onClick={() => {
                        setSubmitted(false);
                        setForm({ name: "", email: "", message: "" });
                      }}
                    >
                      Kirim pesan lain
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="name"
                        className="text-xs font-bold"
                        style={{ color: C.onSurface }}
                      >
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="contact-input"
                        placeholder="Masukkan nama Anda"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="email"
                        className="text-xs font-bold"
                        style={{ color: C.onSurface }}
                      >
                        Alamat Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="contact-input"
                        placeholder="nama@email.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="message"
                        className="text-xs font-bold"
                        style={{ color: C.onSurface }}
                      >
                        Pesan
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        className="contact-input resize-none"
                        rows={6}
                        placeholder="Tuliskan pesan atau pertanyaan Anda di sini..."
                        value={form.message}
                        onChange={handleChange}
                        required
                        style={{ minHeight: "140px" }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90 active:scale-95 shadow-md"
                      style={{ background: C.primaryContainer }}
                    >
                      Kirim Pesan
                      <Send size={15} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
