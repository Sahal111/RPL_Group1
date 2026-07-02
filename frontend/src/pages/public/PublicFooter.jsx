import { Link } from "react-router-dom";
import { BookOpen, MapPin, Phone, Mail } from "lucide-react";

const C = {
  primary: "#012d1d",
  primaryContainer: "#1b4332",
  tertiaryContainer: "#cba72f",
  onSurface: "#191c1d",
  onSurfaceVariant: "#414844",
  outlineVariant: "#c1c8c2",
};

export default function PublicFooter() {
  return (
    <footer
      style={{
        background: "#e7e8e9",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-[1200px] mx-auto py-10 md:py-12 px-4 md:px-12">
        {/* Brand */}
        <div className="sm:col-span-2 md:col-span-2">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: C.primaryContainer }}
            >
              <BookOpen size={15} color="#fff" />
            </div>
            <span
              className="text-lg md:text-xl font-bold"
              style={{ color: C.primary }}
            >
              MI Nurul Huda 3
            </span>
          </div>
          <p
            className="text-sm md:text-base max-w-sm"
            style={{ color: C.onSurfaceVariant }}
          >
            Membentuk generasi Rabbani yang unggul dalam prestasi dan
            berakhlakul karimah.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4
            className="text-base md:text-xl font-bold mb-3 md:mb-4"
            style={{ color: C.primary }}
          >
            Links
          </h4>
          <ul className="space-y-1.5 md:space-y-2">
            {[
              { label: "Home", path: "/" },
              { label: "About", path: "/about" },
              { label: "Gallery", path: "/gallery" },
              { label: "Contact", path: "/contact" },
            ].map(({ label, path }) => (
              <li key={path}>
                <Link
                  to={path}
                  className="text-sm md:text-base transition-opacity hover:opacity-80"
                  style={{ color: C.onSurfaceVariant }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4
            className="text-base md:text-xl font-bold mb-3 md:mb-4"
            style={{ color: C.primary }}
          >
            Hubungi Kami
          </h4>
          <div className="space-y-2">
            {[
              { icon: MapPin, text: "Jl. Pendidikan No. 123" },
              { icon: Phone, text: "(021) 555-0123" },
              { icon: Mail, text: "info@minurulhuda3.sch.id" },
            ].map(({ icon: Icon, text }) => (
              <p
                key={text}
                className="text-sm md:text-base flex items-start gap-2"
                style={{ color: C.onSurfaceVariant }}
              >
                <Icon
                  size={16}
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: C.tertiaryContainer }}
                />
                {text}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div
        className="border-t py-4 text-center"
        style={{ borderColor: C.outlineVariant + "4d" }}
      >
        <p className="text-xs" style={{ color: C.onSurfaceVariant }}>
          © 2024 MI Nurul Huda 3. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
