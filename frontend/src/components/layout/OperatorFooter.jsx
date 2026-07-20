export default function OperatorFooter() {
  return (
    <footer className="mt-auto border-t border-gray-300/30 py-6 px-4 md:px-8 bg-white">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <span>© 2024 SIAKAD MI Nurul Huda 3 • v2.1.0</span>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-400"></div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-700 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-700"></span>
            </span>
            <span>System Status: Online</span>
          </div>
        </div>
        <div className="flex gap-6 font-medium">
          <a className="hover:text-green-700 transition-colors" href="#">
            Pusat Bantuan
          </a>
          <a className="hover:text-green-700 transition-colors" href="#">
            Dokumentasi
          </a>
          <a className="hover:text-green-700 transition-colors" href="#">
            Kebijakan Privasi
          </a>
        </div>
      </div>
    </footer>
  );
}
