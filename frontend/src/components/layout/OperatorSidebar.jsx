import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001";

/* ── Data struktur menu ─────────────────────────────────────── */
const MENU_SECTIONS = [
  {
    key: "master",
    label: "Master Data",
    icon: "folder_open",
    items: [
      {
        to: "/operator/master/siswa",
        end: false,
        icon: "school",
        label: "Siswa",
      },
      {
        to: "/operator/master/guru",
        end: false,
        icon: "supervisor_account",
        label: "Guru",
      },
      {
        to: "/operator/master/ortu",
        end: false,
        icon: "family_restroom",
        label: "Orang Tua",
      },
      {
        to: "/operator/master/kelas",
        end: false,
        icon: "meeting_room",
        label: "Kelas",
      },
      {
        to: "/operator/master/mapel",
        end: true,
        icon: "menu_book",
        label: "Mata Pelajaran",
      },
      {
        to: "/operator/master/tahun-ajaran",
        end: false,
        icon: "calendar_today",
        label: "Tahun Ajaran & Semester",
      },
    ],
  },
  {
    key: "akademik",
    label: "Akademik",
    icon: "school",
    items: [
      {
        to: "/operator/akademik/penempatan-siswa",
        icon: "transfer_within_a_station",
        label: "Penempatan Siswa",
        soon: true,
      },
      {
        to: "/operator/akademik/penugasan-guru",
        icon: "assignment_ind",
        label: "Penugasan Guru",
        soon: true,
      },
      {
        to: "/operator/master/jadwal-pelajaran",
        icon: "event_note",
        label: "Jadwal Pelajaran",
      },
      {
        to: "/operator/master/kalender",
        icon: "calendar_month",
        label: "Kalender Akademik",
        soon: true,
      },
      {
        to: "/operator/master/naik-kelas",
        icon: "trending_up",
        label: "Kenaikan Kelas",
      },
      {
        to: "/operator/master/siswa/mutasi",
        icon: "swap_horiz",
        label: "Mutasi Siswa",
        soon: true,
      },
      {
        to: "/operator/akademik/kelulusan",
        icon: "workspace_premium",
        label: "Kelulusan",
        soon: true,
      },
    ],
  },
  {
    key: "ppdb",
    label: "PPDB",
    icon: "how_to_reg",
    items: [
      {
        to: "/operator/ppdb/dashboard",
        icon: "dashboard_customize",
        label: "Dashboard PPDB",
        soon: true,
      },
      {
        to: "/operator/ppdb/gelombang",
        icon: "waves",
        label: "Gelombang",
        soon: true,
      },
      {
        to: "/operator/ppdb/pendaftar",
        icon: "group_add",
        label: "Pendaftar",
        soon: true,
      },
      {
        to: "/operator/ppdb/verifikasi",
        icon: "fact_check",
        label: "Verifikasi Berkas",
        soon: true,
      },
      {
        to: "/operator/ppdb/seleksi",
        icon: "filter_alt",
        label: "Seleksi",
        soon: true,
      },
      {
        to: "/operator/ppdb/pengumuman",
        icon: "campaign",
        label: "Pengumuman",
        soon: true,
      },
      {
        to: "/operator/ppdb/daftar-ulang",
        icon: "how_to_reg",
        label: "Daftar Ulang",
        soon: true,
      },
    ],
  },
  {
    key: "pengguna",
    label: "Pengguna",
    icon: "manage_accounts",
    items: [
      {
        to: "/operator",
        end: true,
        icon: "manage_accounts",
        label: "Manajemen Akun",
      },
      {
        to: "/operator/ortu-pending",
        icon: "verified_user",
        label: "Approval Orang Tua",
      },
    ],
  },
  {
    key: "administrasi",
    label: "Administrasi",
    icon: "admin_panel_settings",
    items: [
      {
        to: "/operator/keuangan",
        icon: "account_balance_wallet",
        label: "Keuangan",
      },
      {
        to: "/operator/arsip-dokumen",
        icon: "folder_zip",
        label: "Arsip Dokumen",
        soon: true,
      },
      {
        to: "/operator/cetak-dokumen",
        icon: "print",
        label: "Cetak Dokumen",
        soon: true,
      },
    ],
  },
  {
    key: "laporan",
    label: "Laporan",
    icon: "bar_chart",
    items: [
      {
        to: "/operator/laporan/siswa",
        icon: "person_search",
        label: "Siswa",
        soon: true,
      },
      {
        to: "/operator/laporan/guru",
        icon: "badge",
        label: "Guru",
        soon: true,
      },
      {
        to: "/operator/laporan/akademik",
        icon: "analytics",
        label: "Akademik",
        soon: true,
      },
      {
        to: "/operator/laporan/absensi",
        icon: "checklist",
        label: "Absensi",
        soon: true,
      },
      {
        to: "/operator/laporan/nilai",
        icon: "grade",
        label: "Nilai",
        soon: true,
      },
      {
        to: "/operator/laporan/keuangan",
        icon: "receipt_long",
        label: "Keuangan",
        soon: true,
      },
      {
        to: "/operator/laporan/ppdb",
        icon: "summarize",
        label: "PPDB",
        soon: true,
      },
    ],
  },
  {
    key: "informasi",
    label: "Informasi",
    icon: "campaign",
    items: [
      {
        to: "/operator/master/pengumuman",
        icon: "notification_important",
        label: "Pengumuman",
      },
      { to: "/operator/master/galeri", icon: "photo_library", label: "Galeri" },
    ],
  },
  {
    key: "sistem",
    label: "Sistem",
    icon: "settings",
    items: [
      {
        to: "/operator/logs",
        icon: "history_edu",
        label: "Audit Log",
        soon: true,
      },
      {
        to: "/operator/backup",
        icon: "backup",
        label: "Backup & Restore",
        soon: true,
      },
      {
        to: "/operator/import-export",
        icon: "sync_alt",
        label: "Import / Export",
        soon: true,
      },
      {
        to: "/operator/settings",
        icon: "tune",
        label: "Pengaturan",
        soon: true,
      },
    ],
  },
];

/* ── Komponen dropdown section ──────────────────────────────── */
function SidebarSection({ section, onClose, defaultOpen }) {
  const location = useLocation();

  // Auto-open kalau salah satu child aktif (skip item soon — tidak punya route nyata)
  const isAnyChildActive = section.items.some((item) => {
    if (item.soon) return false;
    return item.end
      ? location.pathname === item.to
      : location.pathname === item.to ||
          location.pathname.startsWith(item.to + "/");
  });

  const [open, setOpen] = useState(defaultOpen || isAnyChildActive);

  // Re-check saat navigasi berubah
  useEffect(() => {
    if (isAnyChildActive) setOpen(true);
  }, [location.pathname, isAnyChildActive]);

  return (
    <div>
      {/* Section header / toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group ${
          isAnyChildActive
            ? "text-primary bg-primary/5"
            : "text-text-secondary hover:text-on-surface hover:bg-surface-container-low"
        }`}
      >
        <span
          className={`material-symbols-outlined text-[18px] shrink-0 transition-colors ${
            isAnyChildActive
              ? "text-primary"
              : "text-text-secondary group-hover:text-on-surface"
          }`}
        >
          {section.icon}
        </span>
        <span className="flex-1 text-left text-[12px] font-bold uppercase tracking-widest">
          {section.label}
        </span>
        <span
          className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Items */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="ml-3 mt-0.5 border-l border-outline-variant/40 pl-3 pb-1 space-y-0.5">
          {section.items.map((item) => (
            <SidebarItem key={item.to} item={item} onClose={onClose} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Item individual ────────────────────────────────────────── */
function SidebarItem({ item, onClose }) {
  if (item.soon) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-text-secondary/50 cursor-not-allowed select-none">
        <span className="material-symbols-outlined text-[18px] shrink-0 opacity-50">
          {item.icon}
        </span>
        <span className="text-[13px] flex-1">{item.label}</span>
        <span className="text-[9px] font-bold bg-surface-container text-text-secondary/60 px-1.5 py-0.5 rounded uppercase tracking-wide">
          Soon
        </span>
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.end ?? false}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-150 text-[13px] relative ${
          isActive
            ? "text-primary font-semibold bg-primary/10"
            : "text-text-secondary hover:text-on-surface hover:bg-surface-container-low"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-primary rounded-r-full -translate-x-[13px]" />
          )}
          <span
            className={`material-symbols-outlined text-[17px] shrink-0 ${
              isActive ? "text-primary" : ""
            }`}
          >
            {item.icon}
          </span>
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

/* ── SidebarContent ─────────────────────────────────────────── */
export function SidebarContent({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Berhasil logout.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex flex-col h-full w-[260px] bg-surface border-r border-outline-variant/50">
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold text-base shadow-sm shrink-0">
          MH
        </div>
        <div className="flex-1 min-w-0">
          <h1
            className="text-[15px] font-bold text-text-primary tracking-tight leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Al-Hikmah SMS
          </h1>
          <p className="text-[9px] font-semibold text-text-secondary uppercase tracking-widest mt-0.5">
            Admin Portal
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg hover:bg-surface-container text-text-secondary md:hidden"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        )}
      </div>

      {/* ── Navigation (scrollable) ── */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
        {/* Dashboard */}
        <NavLink
          to="/operator/dashboard"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 relative mb-2 ${
              isActive
                ? "bg-primary text-white font-semibold shadow-sm"
                : "text-text-secondary hover:text-on-surface hover:bg-surface-container-low"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined text-[20px] shrink-0">
                dashboard
              </span>
              <span className="text-[13px] font-semibold">Dashboard</span>
              {isActive && (
                <span className="ml-auto material-symbols-outlined text-[14px] opacity-70">
                  arrow_forward_ios
                </span>
              )}
            </>
          )}
        </NavLink>

        {/* Divider */}
        <div className="h-px bg-outline-variant/30 mx-1 mb-2" />

        {/* Semua sections dengan dropdown */}
        <div className="space-y-0.5">
          {MENU_SECTIONS.map((section) => (
            <SidebarSection
              key={section.key}
              section={section}
              onClose={onClose}
              defaultOpen={section.key === "master"}
            />
          ))}
        </div>
      </nav>

      {/* ── User Profile ── */}
      <div className="px-4 pt-3 pb-4 border-t border-outline-variant/30 shrink-0">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
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
        <div className="mt-2 px-1 flex items-center justify-between text-[10px] text-text-secondary">
          <span>© 2024 Al-Hikmah</span>
          <span className="font-semibold">v2.4.1</span>
        </div>
      </div>
    </div>
  );
}

/* ── Default export — desktop fixed sidebar ─────────────────── */
export default function OperatorSidebar({ onClose }) {
  return (
    <aside className="fixed left-0 top-0 h-screen z-40 shadow-sm overflow-hidden">
      <SidebarContent onClose={onClose} />
    </aside>
  );
}
