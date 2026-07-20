import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  UserRound,
  UsersRound,
  School,
  BookOpen,
  CalendarRange,
  CalendarDays,
  DollarSign,
  Users,
  CheckSquare,
  History,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Database,
  Briefcase,
  Image,
  Megaphone,
  UserPlus,
  Upload,
  CalendarCheck,
  ClipboardList,
} from "lucide-react";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001";

const menuConfig = [
  {
    type: "link",
    path: "/operator/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    filled: true,
    end: false,
  },
  {
    type: "dropdown",
    label: "Data Master",
    icon: Database,
    items: [
      {
        path: "/operator/master/siswa",
        label: "Siswa",
        icon: GraduationCap,
      },
      {
        path: "/operator/master/guru",
        label: "Guru",
        icon: Users,
      },
      {
        path: "/operator/master/ortu",
        label: "Orang Tua",
        icon: UsersRound,
      },
      {
        path: "/operator/master/kelas",
        label: "Kelas",
        icon: School,
      },
      {
        path: "/operator/master/mapel",
        label: "Mata Pelajaran",
        icon: BookOpen,
      },
      {
        path: "/operator/master/tahun-ajaran",
        label: "Tahun Ajaran",
        icon: CalendarRange,
      },
      {
        path: "/operator/master/semester",
        label: "Semester",
        icon: CalendarDays,
      },
    ],
  },
  {
    type: "dropdown",
    label: "Akademik",
    icon: ClipboardList,
    items: [
      {
        path: "/operator/master/jadwal-pelajaran",
        label: "Jadwal Pelajaran",
        icon: CalendarCheck,
      },
      {
        path: "/operator/kurikulum",
        label: "Kurikulum",
        icon: BookOpen,
      },
      {
        path: "/operator/wali-kelas",
        label: "Wali Kelas",
        icon: UserRound,
      },
      {
        path: "/operator/rombel",
        label: "Rombel",
        icon: Users,
      },
      {
        path: "/operator/kalender-akademik",
        label: "Kalender Akademik",
        icon: CalendarRange,
      },
    ],
  },
  {
    type: "dropdown",
    label: "Pengguna",
    icon: Users,
    items: [
      {
        path: "/operator",
        label: "Manajemen Akun",
        icon: UserRound,
        end: true,
      },
      {
        path: "/operator/roles",
        label: "Role & Permission",
        icon: Settings,
      },
      {
        path: "/operator/ortu-pending",
        label: "Approval Orang Tua",
        icon: CheckSquare,
      },
      {
        path: "/operator/login-activity",
        label: "Login Activity",
        icon: History,
      },
    ],
  },
  {
    type: "dropdown",
    label: "Operasional",
    icon: Briefcase,
    items: [
      {
        path: "/operator/presensi",
        label: "Presensi",
        icon: CalendarCheck,
      },
      {
        path: "/operator/penilaian",
        label: "Penilaian",
        icon: ClipboardList,
      },
      {
        path: "/operator/ppdb",
        label: "PPDB",
        icon: GraduationCap,
      },
    ],
  },
  {
    type: "dropdown",
    label: "Administrasi",
    icon: Megaphone,
    items: [
      {
        path: "/operator/keuangan",
        label: "Keuangan",
        icon: DollarSign,
      },
      {
        path: "/operator/pengumuman",
        label: "Pengumuman",
        icon: Megaphone,
      },
      {
        path: "/operator/galeri",
        label: "Galeri",
        icon: Image,
      },
    ],
  },
  {
    type: "dropdown",
    label: "Laporan",
    icon: ClipboardList,
    items: [
      {
        path: "/operator/laporan",
        label: "Laporan",
        icon: ClipboardList,
      },
      {
        path: "/operator/import-export",
        label: "Import & Export",
        icon: Upload,
      },
    ],
  },
  {
    type: "dropdown",
    label: "Sistem",
    icon: Settings,
    items: [
      {
        path: "/operator/backup",
        label: "Backup",
        icon: Upload,
      },
      {
        path: "/operator/logs",
        label: "Audit Log",
        icon: History,
      },
      {
        path: "/operator/settings",
        label: "Pengaturan",
        icon: Settings,
      },
    ],
  },
];

export default function OperatorSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (label) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Berhasil logout.");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[290px] border-r border-[#becabc]/50 bg-[#f6fbf2] hidden md:flex flex-col z-50 shadow-sm p-4 pb-6">
      {/* Logo Header */}
      <div className="flex items-center gap-4 px-2 py-4 mb-6 opacity-0 animate-[slideInRight_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        <div className="w-10 h-10 rounded-xl bg-[#15803d] text-white flex items-center justify-center font-bold text-lg shadow-sm">
          MH
        </div>
        <div>
          <h1 className="text-[18px] font-bold text-[#111827] tracking-tight">
            Al-Hikmah SMS
          </h1>
          <p className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider mt-0.5">
            Admin Portal
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 px-2 opacity-0 animate-[slideInRight_0.5s_cubic-bezier(0.16,1,0.3,1)_0.1s_forwards]">
        <p className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#f0f5ec] hover:bg-[#00652c]/10 hover:text-[#00652c] transition-all duration-200 border border-[#becabc]/30">
            <UserPlus className="w-[18px] h-[18px] mb-1" />
            <span className="text-[10px] font-medium">Siswa</span>
          </button>
          <button className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#f0f5ec] hover:bg-[#00652c]/10 hover:text-[#00652c] transition-all duration-200 border border-[#becabc]/30">
            <Users className="w-[18px] h-[18px] mb-1" />
            <span className="text-[10px] font-medium">Guru</span>
          </button>
          <button className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#f0f5ec] hover:bg-[#00652c]/10 hover:text-[#00652c] transition-all duration-200 border border-[#becabc]/30">
            <Upload className="w-[18px] h-[18px] mb-1" />
            <span className="text-[10px] font-medium">Import</span>
          </button>
          <button className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#f0f5ec] hover:bg-[#00652c]/10 hover:text-[#00652c] transition-all duration-200 border border-[#becabc]/30">
            <Megaphone className="w-[18px] h-[18px] mb-1" />
            <span className="text-[10px] font-medium">Info</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-8">
          {menuConfig.map((menu, idx) => {
            if (menu.type === "link") {
              return (
                <div key={idx} className="space-y-1">
                  <NavLink
                    to={menu.path}
                    end={menu.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 ${
                        isActive
                          ? "bg-[#00652c]/10 text-[#00652c] font-medium rounded-lg relative"
                          : "text-[#6B7280] hover:text-[#00652c]"
                      } transition-all duration-200 group`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00652c] rounded-r-full"></div>
                        )}
                        <menu.icon className="w-5 h-5" strokeWidth={2} />
                        <span className="text-sm">{menu.label}</span>
                      </>
                    )}
                  </NavLink>
                </div>
              );
            }

            if (menu.type === "dropdown") {
              const isOpen = openDropdowns[menu.label];
              return (
                <div key={idx} className="space-y-2">
                  <p className="px-3 text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
                    {menu.label}
                  </p>
                  <div className="space-y-1 ml-3 border-l border-[#becabc]/30 pl-3">
                    {menu.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 ${
                            isActive
                              ? "text-[#00652c]"
                              : "text-[#6B7280] hover:text-[#00652c]"
                          } transition-colors text-sm`
                        }
                      >
                        <item.icon className="w-5 h-5" strokeWidth={2} />
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="mt-auto pt-6 border-t border-[#becabc]/30 opacity-0 animate-[slideInRight_0.5s_cubic-bezier(0.16,1,0.3,1)_0.5s_forwards]">
        <div className="bg-[#f0f5ec] rounded-xl p-3 flex items-center gap-3 relative group cursor-pointer hover:bg-[#e4eae1] transition-colors duration-200">
          <div className="relative">
            <img
              src={
                user?.foto
                  ? `${BASE_URL}/storage/${user.foto}`
                  : "https://lh3.googleusercontent.com/aida-public/AB6AXuBhIpxfHfKrgRWMnrhW7_WEsvNxScEmeuc39OzjA2hlMvTMgtjzT2VC7PH1Pl2KZ1ZUeeKagGX1pyo2VzHh9atrUzRt4LDiNnyTkwiuWNJDdkuyho8egKbfKEdprdEDKEsrTUs02V6Wi1ZVDw4m8CH0wMSbDUIDgyHrMXqKcrgrXfxJFaLvIORBXcv1AKtVgVOeGwr5-9XXcNZmYE24wRwG77cWb47QesC-sYeaWPQGf2eW-G9e3vaRuREbzksgIWJoBcHQiuFY47aL"
              }
              className="w-10 h-10 rounded-lg object-cover border border-[#becabc]/30"
              alt="Admin"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#16A34A] rounded-full border-2 border-[#f0f5ec]"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#111827] truncate">
              {user?.nama_lengkap || "Admin Operator"}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-[#00652c]/10 text-[#00652c] px-1.5 py-0.5 rounded uppercase">
                Admin
              </span>
              <span className="text-[10px] text-[#6B7280] truncate">
                MI Nurul Huda 3
              </span>
            </div>
          </div>
          <Settings className="w-4 h-4 text-[#6B7280]" />
        </div>
        <div className="mt-4 px-3 flex items-center justify-between text-[10px] text-[#6B7280]">
          <span>© 2023 Al-Hikmah</span>
          <span className="font-medium">v2.4.1</span>
        </div>
      </div>
    </aside>
  );
}
