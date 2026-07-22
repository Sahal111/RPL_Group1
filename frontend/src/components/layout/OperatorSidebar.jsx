import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001";

// NavItem — fix: forward onClick ke NavLink
function NavItem({ to, end, icon, onClick, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 transition-colors text-sm rounded-lg ${
          isActive
            ? "text-primary font-semibold bg-primary/10"
            : "text-text-secondary hover:text-primary hover:bg-primary/5"
        }`
      }
    >
      <span className="material-symbols-outlined text-[20px] shrink-0">
        {icon}
      </span>
      <span>{children}</span>
    </NavLink>
  );
}

// SidebarContent — shared desktop & mobile
export function SidebarContent({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Berhasil logout.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex flex-col h-full w-[290px] bg-surface border-r border-outline-variant/50">
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
          MH
        </div>
        <div className="flex-1 min-w-0">
          <h1
            className="text-[17px] font-bold text-text-primary tracking-tight leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Al-Hikmah SMS
          </h1>
          <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest mt-0.5">
            Admin Portal
          </p>
        </div>
        {/* Close button mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg hover:bg-surface-container text-text-secondary md:hidden"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div className="px-4 mb-4 shrink-0">
        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
          <span>⚡</span> Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              to: "/operator/master/siswa",
              icon: "person_add",
              label: "Siswa",
            },
            {
              to: "/operator/master/guru",
              icon: "supervisor_account",
              label: "Guru",
            },
            {
              to: "/operator/master/siswa",
              icon: "upload_file",
              label: "Import",
            },
            { to: "/operator/pengumuman", icon: "campaign", label: "Info" },
          ].map((a) => (
            <NavLink
              key={a.label}
              to={a.to}
              onClick={onClose}
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-surface-container-low hover:bg-primary/10 hover:text-primary transition-all duration-200 border border-outline-variant/30 text-on-surface-variant gap-1"
            >
              <span className="material-symbols-outlined text-[20px]">
                {a.icon}
              </span>
              <span className="text-[10px] font-medium">{a.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* ── Navigation (scrollable) ── */}
      <nav className="flex-1 overflow-y-auto px-3 pb-2 space-y-4">
        {/* Dashboard */}
        <NavLink
          to="/operator/dashboard"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative ${
              isActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-text-secondary hover:text-primary hover:bg-primary/5"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-r-full" />
              )}
              <span className="material-symbols-outlined text-[20px] shrink-0">
                dashboard
              </span>
              <span className="text-sm">Dashboard</span>
            </>
          )}
        </NavLink>

        {/* Data Master */}
        <div>
          <p className="px-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5">
            Data Master
          </p>
          <div className="ml-2 border-l border-outline-variant/40 pl-3 space-y-0.5">
            <NavItem
              to="/operator/master/siswa"
              icon="school"
              onClick={onClose}
            >
              Siswa
            </NavItem>
            <NavItem to="/operator/master/guru" icon="group" onClick={onClose}>
              Guru
            </NavItem>
            <NavItem
              to="/operator/master/ortu"
              icon="family_restroom"
              onClick={onClose}
            >
              Orang Tua
            </NavItem>
            <NavItem
              to="/operator/master/kelas"
              icon="meeting_room"
              onClick={onClose}
            >
              Kelas
            </NavItem>
            <NavItem
              to="/operator/master/mapel"
              icon="menu_book"
              onClick={onClose}
            >
              Mata Pelajaran
            </NavItem>
            <NavItem
              to="/operator/master/tahun-ajaran"
              icon="calendar_today"
              onClick={onClose}
            >
              Tahun Ajaran & Semester
            </NavItem>
          </div>
        </div>

        {/* Akademik */}
        <div>
          <p className="px-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5">
            Akademik
          </p>
          <div className="ml-2 border-l border-outline-variant/40 pl-3 space-y-0.5">
            <NavItem
              to="/operator/master/jadwal"
              icon="event_note"
              onClick={onClose}
            >
              Jadwal Pelajaran
            </NavItem>
            <NavItem
              to="/operator/naik-kelas"
              icon="trending_up"
              onClick={onClose}
            >
              Naik Kelas
            </NavItem>
          </div>
        </div>

        {/* Pengguna */}
        <div>
          <p className="px-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5">
            Pengguna
          </p>
          <div className="ml-2 border-l border-outline-variant/40 pl-3 space-y-0.5">
            <NavItem
              to="/operator"
              end
              icon="manage_accounts"
              onClick={onClose}
            >
              Manajemen Akun
            </NavItem>
            <NavItem
              to="/operator/ortu-pending"
              icon="verified_user"
              onClick={onClose}
            >
              Approval Orang Tua
            </NavItem>
          </div>
        </div>

        {/* Administrasi */}
        <div>
          <p className="px-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5">
            Administrasi
          </p>
          <div className="ml-2 border-l border-outline-variant/40 pl-3 space-y-0.5">
            <NavItem
              to="/operator/keuangan"
              icon="account_balance_wallet"
              onClick={onClose}
            >
              Keuangan
            </NavItem>
            <NavItem
              to="/operator/pengumuman"
              icon="notification_important"
              onClick={onClose}
            >
              Pengumuman
            </NavItem>
            <NavItem
              to="/operator/galeri"
              icon="photo_library"
              onClick={onClose}
            >
              Galeri
            </NavItem>
          </div>
        </div>

        {/* Sistem */}
        <div>
          <p className="px-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5">
            Sistem
          </p>
          <div className="ml-2 border-l border-outline-variant/40 pl-3 space-y-0.5">
            <NavItem to="/operator/logs" icon="history_edu" onClick={onClose}>
              Audit Log
            </NavItem>
            <NavItem to="/operator/settings" icon="settings" onClick={onClose}>
              Pengaturan
            </NavItem>
          </div>
        </div>
      </nav>

      {/* ── User Profile ── */}
      <div className="px-4 pt-3 pb-4 border-t border-outline-variant/30 shrink-0">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm border border-outline-variant/30 overflow-hidden">
              {user?.foto ? (
                <img
                  alt={user?.nama_lengkap || "Admin"}
                  className="w-full h-full object-cover"
                  src={`${BASE_URL}/storage/${user.foto}`}
                />
              ) : (
                <span>
                  {user?.nama_lengkap?.charAt(0)?.toUpperCase() || "A"}
                </span>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-surface-container-low" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-text-primary truncate leading-tight">
              {user?.nama_lengkap || "Admin Operator"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-wide">
                Admin
              </span>
              <span className="text-[10px] text-text-secondary truncate">
                MI Nurul Huda 3
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="shrink-0 text-text-secondary hover:text-danger transition-colors p-1 rounded-lg hover:bg-danger/10"
          >
            <span className="material-symbols-outlined text-[18px]">
              logout
            </span>
          </button>
        </div>
        <div className="mt-2.5 px-1 flex items-center justify-between text-[10px] text-text-secondary">
          <span>© 2024 Al-Hikmah</span>
          <span className="font-semibold">v2.4.1</span>
        </div>
      </div>
    </div>
  );
}

// Default export — desktop fixed sidebar
export default function OperatorSidebar({ onClose }) {
  return (
    <aside className="fixed left-0 top-0 h-screen z-40 shadow-sm overflow-hidden">
      <SidebarContent onClose={onClose} />
    </aside>
  );
}
