import { useAuth } from "../../contexts/AuthContext";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001";

export default function OperatorTopBar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="shrink-0 z-30 h-20 w-full bg-white/70 backdrop-blur-lg border-b border-white/10 shadow-sm flex items-center justify-between px-6 transition-all duration-300">
      {/* Left */}
      <div className="flex items-center gap-6">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-[#00342b] p-2 rounded-lg hover:bg-[#004d40]/10 transition-colors duration-300"
          aria-label="Buka menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Search Bar */}
        <div className="relative hidden md:block w-80 group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#00342b]/40 text-[20px] group-focus-within:text-[#006e2a] transition-colors">
            search
          </span>
          <input
            className="w-full bg-[#f2f4f3]/50 border-[#bfc9c4]/20 border rounded-full py-2.5 pl-11 pr-16 text-sm focus:ring-4 focus:ring-[#006e2a]/10 focus:border-[#006e2a]/50 focus:outline-none transition-all text-[#191c1c] placeholder:text-[#3f4945]/40 shadow-inner"
            placeholder="Cari data siswa, guru..."
            type="text"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 items-center pointer-events-none">
            <kbd className="border border-[#707975]/20 rounded-md px-1.5 py-0.5 text-[10px] font-sans font-bold text-[#bfc9c4] bg-white/80 shadow-sm">
              ⌘
            </kbd>
            <kbd className="border border-[#707975]/20 rounded-md px-1.5 py-0.5 text-[10px] font-sans font-bold text-[#bfc9c4] bg-white/80 shadow-sm">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Action Icons */}
        <div className="flex items-center gap-2">
          <button className="p-2.5 text-[#00342b]/70 hover:text-[#006e2a] hover:bg-[#00342b]/5 rounded-full transition-all relative group">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#006e2a] rounded-full border-2 border-white animate-pulse shadow-[0_0_8px_rgba(0,110,42,0.6)]" />
          </button>
          <button className="p-2.5 text-[#00342b]/70 hover:text-[#006e2a] hover:bg-[#00342b]/5 rounded-full transition-all">
            <span className="material-symbols-outlined text-[22px]">dark_mode</span>
          </button>
        </div>

        <div className="h-8 w-[1px] bg-[#bfc9c4]/30 mx-1" />

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-white/50 p-1.5 pr-4 rounded-full transition-all duration-300 border border-transparent hover:border-[#69ff87]/10 group/profile">
          <div className="w-10 h-10 rounded-full border-2 border-[#69ff87] shadow-md overflow-hidden group-hover/profile:scale-105 transition-transform">
            {user?.foto ? (
              <img
                alt={user?.nama_lengkap || "Admin"}
                className="w-full h-full object-cover"
                src={`${BASE_URL}/storage/${user.foto}`}
              />
            ) : (
              <div className="w-full h-full bg-[#004d40] text-white flex items-center justify-center font-bold text-sm">
                {user?.nama_lengkap?.charAt(0)?.toUpperCase() || "A"}
              </div>
            )}
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-bold text-[#00342b] leading-tight group-hover/profile:text-[#006e2a] transition-colors">
              {user?.nama_lengkap || "Admin Utama"}
            </span>
            <span className="text-[9px] font-black text-[#00342b]/40 uppercase tracking-[0.2em]">
              Superadmin
            </span>
          </div>
          <span className="material-symbols-outlined text-[#00342b]/30 text-[20px] group-hover/profile:translate-y-0.5 transition-transform">
            keyboard_arrow_down
          </span>
        </div>
      </div>
    </header>
  );
}
