import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="bg-surface-light dark:bg-black pt-16 pb-8 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-3xl text-primary">
                school
              </span>
              <span className="font-bold text-slate-800 dark:text-white text-xl tracking-tight">
                MI Nurul Huda 3
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed text-sm">
              Membangun generasi cerdas berkarakter Islami. Sekolah dasar Islam
              terbaik untuk tumbuh kembang anak Anda.
            </p>
            <div className="flex gap-4">
              <a
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary hover:border-primary transition-all"
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    clipRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </a>
              <a
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-pink-500 hover:border-pink-500 transition-all"
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    clipRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.373c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-6 text-sm uppercase tracking-wider">
              Tentang Kami
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link
                  className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                  to="/about"
                >
                  Profil Sekolah
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                  to="/about#visi-misi"
                >
                  Visi &amp; Misi
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                  to="/about#struktur"
                >
                  Struktur Organisasi
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                  to="/about#prestasi"
                >
                  Prestasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-6 text-sm uppercase tracking-wider">
              Informasi
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link
                  className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                  to="/register-ortu"
                >
                  PPDB 2024
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                  to="/"
                >
                  Berita Terkini
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                  to="/"
                >
                  Agenda Sekolah
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                  to="/contact"
                >
                  Karir &amp; Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-6 text-sm uppercase tracking-wider">
              Kontak
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">
                  location_on
                </span>
                <span className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Jl. Kencana Rt01 Rw 02, Tanah Sareal, Kota Bogor, Jawa Barat
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl shrink-0">
                  call
                </span>
                <a
                  href="tel:+6285811723878"
                  className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm"
                >
                  +62 858-1172-3878
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl shrink-0">
                  mail
                </span>
                <a
                  href="mailto:minurulhuda3nh@gmail.com"
                  className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm"
                >
                  minurulhuda3nh@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 text-center text-sm text-slate-500 dark:text-slate-500">
          <p>© 2024 MI Nurul Huda 3. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
