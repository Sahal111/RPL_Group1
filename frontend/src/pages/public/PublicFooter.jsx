import { Link } from "react-router-dom";
import logoMi from "../../assets/logo.png";

export default function PublicFooter() {
  return (
    <footer className="pt-16 md:pt-24 pb-12 w-full bg-islamic-pattern bg-gradient-to-b from-transparent to-brand-green/5">
      <div className="max-w-7xl mx-auto w-[94%] sm:w-[92%] bg-gradient-to-br from-brand-darkgreen via-brand-darkgreen to-[#002b23] backdrop-blur-2xl rounded-[2rem] md:rounded-[2.5rem] border border-white/10 mb-8 md:mb-12 shadow-2xl overflow-hidden pt-12 md:pt-16 px-6 sm:px-8 md:px-16">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 mb-12 md:mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 pr-0 lg:pr-8">
            <div className="flex items-center gap-4 mb-8 group cursor-pointer">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center p-2 border border-white/20 transition-transform group-hover:scale-105 shadow-lg">
                <img
                  alt="MI Nurul Huda 3 Logo"
                  className="w-full h-full object-contain rounded-lg"
                  src={logoMi}
                />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-white font-extrabold text-xl md:text-2xl leading-none tracking-tight">
                  MI Nurul Huda 3
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="h-px w-4 bg-brand-green/50" />
                  <p className="text-brand-green text-[10px] font-bold tracking-[0.25em] uppercase">
                    Islamic School
                  </p>
                </div>
              </div>
            </div>
            <p className="text-white/80 leading-relaxed mb-8 text-sm md:text-base">
              Membangun generasi cerdas berkarakter Islami. Sekolah dasar Islam
              terbaik untuk tumbuh kembang anak Anda dengan fasilitas modern dan
              pengajar berkompeten.
            </p>
            <div className="flex gap-4 mt-4 md:mt-8">
              {[
                ["fab fa-facebook-f", "https://facebook.com"],
                ["fab fa-instagram", "https://instagram.com"],
                ["fab fa-youtube", "https://youtube.com"],
              ].map(([icon, href]) => (
                <a
                  key={icon}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-brand-green flex items-center justify-center text-white transition-all duration-300 shadow-sm hover:scale-110 hover:shadow-[0_0_20px_rgba(0,200,83,0.4)]"
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className={icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Links 1 */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-bold text-white mb-6 md:mb-8 text-sm uppercase tracking-widest">
              Tentang Kami
            </h4>
            <ul className="space-y-4 md:space-y-5">
              {[
                ["/about", "Profil Sekolah"],
                ["/about#visi-misi", "Visi & Misi"],
                ["/about#struktur", "Struktur Organisasi"],
                ["/about#prestasi", "Prestasi"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link
                    className="text-emerald-50/80 hover:text-brand-green font-medium transition-all duration-300 flex items-center gap-3 hover:translate-x-2 text-sm"
                    to={to}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links 2 */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-bold text-white mb-6 md:mb-8 text-sm uppercase tracking-widest">
              Informasi
            </h4>
            <ul className="space-y-4 md:space-y-5">
              {[
                ["/ppdb", "PPDB 2024", false],
                ["/", "Berita Terkini", false],
                ["/", "Agenda Sekolah", true],
                ["/contact", "Karir & Kontak", false],
              ].map(([to, label, active]) => (
                <li key={label}>
                  <Link
                    className={`${
                      active
                        ? "text-brand-green font-semibold"
                        : "text-emerald-50/80 hover:text-brand-green font-medium"
                    } transition-all duration-300 flex items-center gap-3 hover:translate-x-2 text-sm`}
                    to={to}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        active ? "bg-brand-green" : "bg-white/30"
                      }`}
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-4 lg:pl-8 border-l-0 lg:border-l border-white/10">
            <h4 className="font-bold text-white mb-6 md:mb-8 text-sm uppercase tracking-widest">
              Kontak
            </h4>
            <ul className="space-y-5 md:space-y-6">
              <li className="flex items-start gap-4 group/contact cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 mt-1 group-hover/contact:bg-brand-green group-hover/contact:scale-110 transition-all duration-300">
                  <i className="fas fa-map-marker-alt" />
                </div>
                <span className="text-emerald-50/80 font-medium leading-relaxed group-hover/contact:text-white transition-colors text-sm">
                  Jl. Kencana Rt01 Rw 02, Tanah Sareal, Kota Bogor, Jawa Barat
                </span>
              </li>
              <li className="flex items-center gap-4 group/contact cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 group-hover/contact:bg-brand-green group-hover/contact:scale-110 transition-all duration-300">
                  <i className="fas fa-phone-alt" />
                </div>
                <a
                  href="tel:+6285811723878"
                  className="text-emerald-50/80 font-medium group-hover/contact:text-white transition-colors text-sm"
                >
                  +62 858-1172-3878
                </a>
              </li>
              <li className="flex items-center gap-4 group/contact cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 group-hover/contact:bg-brand-green group-hover/contact:scale-110 transition-all duration-300">
                  <i className="far fa-envelope" />
                </div>
                <a
                  href="mailto:minurulhuda3nh@gmail.com"
                  className="text-emerald-50/80 font-medium group-hover/contact:text-white transition-colors text-sm break-all"
                >
                  minurulhuda3nh@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full pt-6 md:pt-8 pb-6 md:pb-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 font-medium text-sm text-center md:text-left">
            © 2024 MI Nurul Huda 3. All rights reserved.
          </p>
          <div className="flex gap-6 md:gap-8 text-sm font-medium text-white/60">
            <a className="hover:text-white transition-colors" href="#">
              Kebijakan Privasi
            </a>
            <a className="hover:text-white transition-colors" href="#">
              Syarat &amp; Ketentuan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
