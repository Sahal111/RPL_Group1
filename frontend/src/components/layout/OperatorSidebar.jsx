import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001";

export default function OperatorSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Berhasil logout.");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen flex-col bg-surface border-r border-outline-variant/50 shadow-sm z-40 p-space-md pb-6 w-[290px]">
      {/* Logo */}
      <div className="flex items-center gap-4 px-2 py-4 mb-6 opacity-0 animate-slide-in-right">
        <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold text-lg shadow-sm">
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
      <div className="mb-8 px-2 animate-slide-in-right animate-delay-100">
        <p className="text-[12px] font-medium text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-2">
          <NavLink
            to="/operator/master/siswa"
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container-low hover:bg-primary/10 hover:text-primary transition-all duration-200 border border-outline-variant/30 text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[18px] mb-1">
              person_add
            </span>
            <span className="text-[10px] font-medium">Siswa</span>
          </NavLink>
          <NavLink
            to="/operator/master/guru"
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container-low hover:bg-primary/10 hover:text-primary transition-all duration-200 border border-outline-variant/30 text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[18px] mb-1">
              supervisor_account
            </span>
            <span className="text-[10px] font-medium">Guru</span>
          </NavLink>
          <NavLink
            to="/operator/master/siswa"
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container-low hover:bg-primary/10 hover:text-primary transition-all duration-200 border border-outline-variant/30 text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[18px] mb-1">
              upload_file
            </span>
            <span className="text-[10px] font-medium">Import</span>
          </NavLink>
          <NavLink
            to="/operator/pengumuman"
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container-low hover:bg-primary/10 hover:text-primary transition-all duration-200 border border-outline-variant/30 text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[18px] mb-1">
              campaign
            </span>
            <span className="text-[10px] font-medium">Info</span>
          </NavLink>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto pr-2">
        <div className="space-y-8">
          {/* Dashboard */}
          <div className="space-y-1">
            <NavLink
              to="/operator/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 font-medium rounded-lg transition-all duration-200 relative group ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:text-primary hover:bg-primary/5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full"></div>
                  )}
                  <span className="material-symbols-outlined text-[20px]">
                    dashboard
                  </span>
                  <span className="text-sm">Dashboard</span>
                </>
              )}
            </NavLink>
          </div>

          {/* Data Master */}
          <div className="space-y-2">
            <p className="px-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">
              Data Master
            </p>
            <div className="space-y-1 ml-3 border-l border-outline-variant/30 pl-3">
              <NavLink
                to="/operator/master/siswa"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 transition-colors text-sm ${isActive ? "text-primary font-medium" : "text-text-secondary hover:text-primary"}`
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  school
                </span>{" "}
                Siswa
              </NavLink>
              <NavLink
                to="/operator/master/guru"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 transition-colors text-sm ${isActive ? "text-primary font-medium" : "text-text-secondary hover:text-primary"}`
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  group
                </span>{" "}
                Guru
              </NavLink>
              <NavLink
                to="/operator/master/ortu"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 transition-colors text-sm ${isActive ? "text-primary font-medium" : "text-text-secondary hover:text-primary"}`
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  family_restroom
                </span>{" "}
                Orang Tua
              </NavLink>
              <NavLink
                to="/operator/master/kelas"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 transition-colors text-sm ${isActive ? "text-primary font-medium" : "text-text-secondary hover:text-primary"}`
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  meeting_room
                </span>{" "}
                Kelas
              </NavLink>
              <NavLink
                to="/operator/master/mapel"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 transition-colors text-sm ${isActive ? "text-primary font-medium" : "text-text-secondary hover:text-primary"}`
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  menu_book
                </span>{" "}
                Mata Pelajaran
              </NavLink>
              <NavLink
                to="/operator/master/tahun-ajaran"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 transition-colors text-sm ${isActive ? "text-primary font-medium" : "text-text-secondary hover:text-primary"}`
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  calendar_today
                </span>{" "}
                Tahun Ajaran
              </NavLink>
              <NavLink
                to="/operator/master/semester"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 transition-colors text-sm ${isActive ? "text-primary font-medium" : "text-text-secondary hover:text-primary"}`
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  date_range
                </span>{" "}
                Semester
              </NavLink>
            </div>
          </div>

          {/* Akademik */}
          <div className="space-y-2">
            <p className="px-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">
              Akademik
            </p>
            <div className="space-y-1 ml-3 border-l border-outline-variant/30 pl-3">
              <NavLink
                to="/operator/master/jadwal"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 transition-colors text-sm ${isActive ? "text-primary font-medium" : "text-text-secondary hover:text-primary"}`
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  event_note
                </span>{" "}
                Jadwal Pelajaran
              </NavLink>
              <NavLink
                to="/operator/naik-kelas"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 transition-colors text-sm ${isActive ? "text-primary font-medium" : "text-text-secondary hover:text-primary"}`
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  assignment_ind
                </span>{" "}
                Naik Kelas
              </NavLink>
            </div>
          </div>

          {/* Pengguna */}
          <div className="space-y-2">
            <p className="px-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">
              Pengguna
            </p>
            <div className="space-y-1 ml-3 border-l border-outline-variant/30 pl-3">
              <NavLink
                to="/operator"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 transition-colors text-sm ${isActive ? "text-primary font-medium" : "text-text-secondary hover:text-primary"}`
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  person_settings
                </span>{" "}
                Manajemen Akun
              </NavLink>
              <NavLink
                to="/operator/ortu-pending"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 transition-colors text-sm ${isActive ? "text-primary font-medium" : "text-text-secondary hover:text-primary"}`
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  check_circle
                </span>{" "}
                Approval Orang Tua
              </NavLink>
            </div>
          </div>

          {/* Administrasi */}
          <div className="space-y-2">
            <p className="px-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">
              Administrasi
            </p>
            <div className="space-y-1 ml-3 border-l border-outline-variant/30 pl-3">
              <NavLink
                to="/operator/keuangan"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 transition-colors text-sm ${isActive ? "text-primary font-medium" : "text-text-secondary hover:text-primary"}`
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  account_balance_wallet
                </span>{" "}
                Keuangan
              </NavLink>
              <NavLink
                to="/operator/pengumuman"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 transition-colors text-sm ${isActive ? "text-primary font-medium" : "text-text-secondary hover:text-primary"}`
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  notification_important
                </span>{" "}
                Pengumuman
              </NavLink>
              <NavLink
                to="/operator/galeri"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 transition-colors text-sm ${isActive ? "text-primary font-medium" : "text-text-secondary hover:text-primary"}`
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  gallery_thumbnail
                </span>{" "}
                Galeri
              </NavLink>
            </div>
          </div>

          {/* Sistem */}
          <div className="space-y-2">
            <p className="px-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">
              Sistem
            </p>
            <div className="space-y-1 ml-3 border-l border-outline-variant/30 pl-3">
              <NavLink
                to="/operator/logs"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 transition-colors text-sm ${isActive ? "text-primary font-medium" : "text-text-secondary hover:text-primary"}`
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  history_edu
                </span>{" "}
                Audit Log
              </NavLink>
              <NavLink
                to="/operator/settings"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 transition-colors text-sm ${isActive ? "text-primary font-medium" : "text-text-secondary hover:text-primary"}`
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  settings
                </span>{" "}
                Pengaturan
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* User Profile Bottom */}
      <div className="mt-auto pt-6 border-t border-outline-variant/30 animate-slide-in-right animate-delay-500">
        <div className="bg-surface-container-low rounded-xl p-3 flex items-center gap-3 relative group cursor-pointer hover:bg-surface-container-high transition-colors duration-200">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm border border-outline-variant/30 overflow-hidden shrink-0">
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
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface-container-low"></div>
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
            className="text-text-secondary hover:text-danger transition-colors"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
          </button>
        </div>
        <div className="mt-4 px-3 flex items-center justify-between text-[10px] text-text-secondary">
          <span>© 2024 Al-Hikmah</span>
          <span className="font-medium">v2.4.1</span>
        </div>
      </div>
    </aside>
  );
}
