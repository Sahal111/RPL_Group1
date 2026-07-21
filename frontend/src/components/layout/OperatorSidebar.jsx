import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001";

// Reusable NavItem
function NavItem({ to, end, icon, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 transition-colors text-sm rounded-lg ${
          isActive
            ? "text-primary font-semibold bg-primary/8"
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

// SidebarContent — shared antara desktop & mobile
function SidebarContent({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Berhasil logout.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex flex-col h-full bg-surface border-r border-outline-variant/50 w-[290px] p-4 pb-6">
      {/* Logo */}
      <div className="flex items-center gap-4 px-2 py-4 mb-4">
        {/* Close button hanya tampil di mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 p-1.5 rounded-lg hover:bg-surface-container text-text-secondary"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        )}
        <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
          MH
        </div>
        <div>
          <h1
            className="text-[18px] leading-[1.3] font-bold text-text-primary tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Al-Hikmah SMS
          </h1>
          <p className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mt-0.5">
            Admin Portal
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 px-2">
        <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
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
              className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container-low hover:bg-primary/10 hover:text-primary transition-all duration-200 border border-outline-variant/30 text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[20px] mb-1">
                {a.icon}
              </span>
              <span className="text-[10px] font-medium">{a.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pr-1 space-y-5">
        {/* Dashboard */}
        <div>
          <NavLink
            to="/operator/dashboard"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 font-medium rounded-lg transition-all duration-200 relative ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:text-primary hover:bg-primary/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full" />
                )}
                <span className="material-symbols-outlined text-[20px] shrink-0">
                  dashboard
                </span>
                <span className="text-sm">Dashboard</span>
              </>
            )}
          </NavLink>
        </div>

        {/* Data Master */}
        <div>
          <p className="px-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Data Master
          </p>
          <div className="ml-2 border-l border-outline-variant/30 pl-3 space-y-0.5">
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
              Tahun Ajaran
            </NavItem>
            <NavItem
              to="/operator/master/semester"
              icon="date_range"
              onClick={onClose}
            >
              Semester
            </NavItem>
          </div>
        </div>

        {/* Akademik */}
        <div>
          <p className="px-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Akademik
          </p>
          <div className="ml-2 border-l border-outline-variant/30 pl-3 space-y-0.5">
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
          <p className="px-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Pengguna
          </p>
          <div className="ml-2 border-l border-outline-variant/30 pl-3 space-y-0.5">
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
          <p className="px-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Administrasi
          </p>
          <div className="ml-2 border-l border-outline-variant/30 pl-3 space-y-0.5">
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
          <p className="px-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Sistem
          </p>
          <div className="ml-2 border-l border-outline-variant/30 pl-3 space-y-0.5">
            <NavItem to="/operator/logs" icon="history_edu" onClick={onClose}>
              Audit Log
            </NavItem>
            <NavItem to="/operator/settings" icon="settings" onClick={onClose}>
              Pengaturan
            </NavItem>
          </div>
        </div>
      </nav>

      {/* User Profile Bottom */}
      <div className="mt-4 pt-4 border-t border-outline-variant/30">
        <div className="bg-surface-container-low rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-surface-container-high transition-colors duration-200">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm border border-outline-variant/30 overflow-hidden">
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
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface-container-low" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">
              {user?.nama_lengkap || "Admin Operator"}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">
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
            className="text-text-secondary hover:text-danger transition-colors p-1"
          >
            <span className="material-symbols-outlined text-[20px]">
              logout
            </span>
          </button>
        </div>
        <div className="mt-3 px-3 flex items-center justify-between text-[10px] text-text-secondary">
          <span>© 2024 Al-Hikmah</span>
          <span className="font-medium">v2.4.1</span>
        </div>
      </div>
    </div>
  );
}

// Desktop sidebar (fixed)
export default function OperatorSidebar({ onClose }) {
  return (
    <aside className="fixed left-0 top-0 h-screen z-40 shadow-sm overflow-y-auto">
      <SidebarContent onClose={onClose} />
    </aside>
  );
}
