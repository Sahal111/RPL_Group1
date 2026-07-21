import { useAuth } from "../../contexts/AuthContext";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001";

export default function OperatorTopBar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-[64px] md:h-[72px] w-full bg-surface/80 backdrop-blur-lg border-b border-outline-variant/30 flex items-center justify-between px-4 md:px-6 transition-all duration-300">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-surface-container text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Buka menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Search bar — hidden on small mobile, visible on sm+ */}
        <div className="relative hidden sm:flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-text-secondary text-[18px]">
            search
          </span>
          <input
            className="pl-9 pr-10 py-2 bg-surface-container/50 border border-border-light/50 rounded-xl text-sm w-56 md:w-64 lg:w-80 transition-all duration-300 focus:w-64 md:focus:w-80 outline-none hover:bg-surface-container/80 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-surface text-text-primary placeholder:text-text-secondary"
            placeholder="Search across portal..."
            type="text"
          />
          <div className="absolute right-3">
            <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium text-text-secondary bg-surface rounded border border-border-light shadow-sm">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Academic year badge — lg only */}
        <div className="hidden lg:flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
          <span className="w-1.5 h-1.5 bg-primary rounded-full" />
          <span className="text-xs font-semibold text-primary">
            TA: 2023-24
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button className="p-2 text-text-secondary hover:bg-surface-container hover:text-text-primary rounded-lg transition-all duration-300 relative">
            <span className="material-symbols-outlined text-[20px]">
              notifications
            </span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full ring-2 ring-surface" />
          </button>
          <button className="hidden sm:flex p-2 text-text-secondary hover:bg-surface-container hover:text-text-primary rounded-lg transition-all duration-300">
            <span className="material-symbols-outlined text-[20px]">
              chat_bubble_outline
            </span>
          </button>
        </div>

        <div className="h-6 w-px bg-outline-variant/40 hidden sm:block" />

        {/* User info */}
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer hover:bg-surface-container/50 p-1.5 pr-2 md:pr-3 rounded-xl transition-colors duration-300 group border border-transparent hover:border-border-light/50">
          <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm border border-outline-variant/50 shadow-sm overflow-hidden shrink-0">
            {user?.foto ? (
              <img
                alt={user?.nama_lengkap || "Admin"}
                className="w-full h-full object-cover"
                src={`${BASE_URL}/storage/${user.foto}`}
              />
            ) : (
              <span>{user?.nama_lengkap?.charAt(0)?.toUpperCase() || "A"}</span>
            )}
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <p className="text-sm font-semibold text-text-primary leading-tight truncate max-w-[120px]">
              {user?.nama_lengkap || "Admin Operator"}
            </p>
            <p className="text-[11px] text-text-secondary font-medium">
              MI Nurul Huda 3
            </p>
          </div>
          <span className="material-symbols-outlined text-text-secondary text-sm hidden sm:block group-hover:text-text-primary transition-colors">
            expand_more
          </span>
        </div>
      </div>
    </header>
  );
}
