import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Share2, Globe } from "lucide-react";
import logoMi from "../../assets/logo.png";

const C = {
  primary: "#0d3b23",
  accent: "#11d452",
  gold: "#d4af37",
  text: "#64748b",
  border: "rgba(0,0,0,0.07)",
};

export default function PublicFooter() {
  return (
    <footer
      className="border-t"
      style={{ background: "#f8fcf9", borderColor: "#e5e7eb" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12">
          {/* ── Brand ──────────────────────────────────────────────────── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <img
                src={logoMi}
                alt="Logo MI Nurul Huda 3"
                className="w-11 h-11 object-contain rounded-xl"
              />
              <div>
                <h3
                  className="text-base font-extrabold leading-tight"
                  style={{ color: C.primary }}
                >
                  MI Nurul Huda 3
                </h3>
                <p className="text-xs mt-0.5" style={{ color: C.text }}>
                  Madrasah Ibtidaiyah
                </p>
              </div>
            </div>

            <p
              className="text-sm leading-relaxed mb-6 max-w-xs"
              style={{ color: C.text }}
            >
              Membangun generasi cerdas berkarakter Islami. Sekolah dasar Islam
              terbaik untuk tumbuh kembang anak Anda.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full flex items-center justify-center border transition-all hover:border-[#2563eb] hover:text-[#2563eb]"
                style={{
                  borderColor: "#d1d5db",
                  color: C.text,
                  background: "#fff",
                }}
              >
                <Globe size={16} />
              </a>
              <a
                href="#"
                aria-label="Share"
                className="w-9 h-9 rounded-full flex items-center justify-center border transition-all hover:border-pink-500 hover:text-pink-500"
                style={{
                  borderColor: "#d1d5db",
                  color: C.text,
                  background: "#fff",
                }}
              >
                <Share2 size={16} />
              </a>
            </div>
          </div>

          {/* ── About links ─────────────────────────────────────────────── */}
          <div>
            <h4 className="font-bold text-sm mb-5" style={{ color: C.primary }}>
              Tentang Kami
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Profil Sekolah", path: "/about" },
                { label: "Visi & Misi", path: "/about" },
                { label: "Galeri", path: "/gallery" },
                { label: "Kontak", path: "/contact" },
              ].map(({ label, path }) => (
                <li key={label}>
                  <Link
                    to={path}
                    className="text-sm transition-colors hover:text-[#0d3b23]"
                    style={{ color: C.text }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Info links ──────────────────────────────────────────────── */}
          <div>
            <h4 className="font-bold text-sm mb-5" style={{ color: C.primary }}>
              Informasi
            </h4>
            <ul className="space-y-3">
              {[
                { label: "PPDB 2024", path: "/about" },
                { label: "Berita Terkini", path: "/" },
                { label: "Agenda Sekolah", path: "/" },
                { label: "Login Siswa", path: "/login" },
              ].map(({ label, path }) => (
                <li key={label}>
                  <Link
                    to={path}
                    className="text-sm transition-colors hover:text-[#0d3b23]"
                    style={{ color: C.text }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ─────────────────────────────────────────────────── */}
          <div>
            <h4 className="font-bold text-sm mb-5" style={{ color: C.primary }}>
              Kontak
            </h4>
            <ul className="space-y-4">
              {[
                {
                  Icon: MapPin,
                  text: "Jl. Kencana Rt01 Rw 02, Bogor, Jawa Barat",
                },
                { Icon: Phone, text: "+62 858 1172 3878" },
                { Icon: Mail, text: "minurulhuda3nh@gmail.com" },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon
                    size={15}
                    className="shrink-0 mt-0.5"
                    style={{ color: C.accent }}
                  />
                  <span
                    className="text-sm leading-relaxed"
                    style={{ color: C.text }}
                  >
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ───────────────────────────────────────────────── */}
        <div
          className="border-t pt-6 text-center"
          style={{ borderColor: "#e5e7eb" }}
        >
          <p className="text-xs" style={{ color: "#9ca3af" }}>
            © 2024 MI Nurul Huda 3. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
