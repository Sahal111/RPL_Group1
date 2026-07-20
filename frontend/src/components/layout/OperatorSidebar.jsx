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
    label: "Master Data",
    icon: Database,
    items: [
      {
        path: "/operator/master/siswa",
        label: "Data Siswa",
        icon: GraduationCap,
      },
      {
        path: "/operator/master/guru",
        label: "Data Guru",
        icon: UserRound,
      },
      {
        path: "/operator/master/ortu",
        label: "Data Orang Tua",
        icon: UsersRound,
      },
      {
        path: "/operator/master/kelas",
        label: "Data Kelas",
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
    label: "Manajemen",
    icon: Briefcase,
    items: [
      {
        path: "/operator",
        label: "Manajemen Akun",
        icon: Users,
        end: true,
      },
      {
        path: "/operator/ortu-pending",
        label: "Approval Orang Tua",
        icon: CheckSquare,
      },
      {
        path: "/operator/keuangan",
        label: "Keuangan",
        icon: DollarSign,
      },
    ],
  },
  {
    type: "link",
    path: "/operator/galeri",
    label: "Galeri",
    icon: Image,
    filled: false,
    end: false,
  },
  {
    type: "link",
    path: "/operator/pengumuman",
    label: "Pengumuman",
    icon: Megaphone,
    filled: false,
    end: false,
  },
  {
    type: "dropdown",
    label: "Sistem",
    icon: Settings,
    items: [
      {
        path: "/operator/logs",
        label: "Logs",
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
    <aside className="fixed left-0 top-0 h-screen w-[280px] border-r border-gray-300/40 bg-gray-50/80 hidden md:flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Logo Header */}
      <div className="h-20 flex items-center px-6 shrink-0">
        <span className="font-headline text-[20px] font-bold text-green-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-700 text-white flex items-center justify-center">
            <School className="w-6 h-6" strokeWidth={2.5} />
          </div>
          SIAKAD MI NH3
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {menuConfig.map((menu, idx) => {
          if (menu.type === "link") {
            return (
              <NavLink
                key={idx}
                to={menu.path}
                end={menu.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? "text-white font-semibold bg-green-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-200/60 hover:text-gray-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <menu.icon
                      className="w-5 h-5"
                      strokeWidth={isActive || menu.filled ? 2.5 : 2}
                      fill={isActive && menu.filled ? "currentColor" : "none"}
                    />
                    <span className="text-[13px] leading-[18px] tracking-[0.01em] font-medium">
                      {menu.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          }

          if (menu.type === "dropdown") {
            const isOpen = openDropdowns[menu.label];
            return (
              <div key={idx}>
                <button
                  onClick={() => toggleDropdown(menu.label)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-gray-600 hover:bg-gray-200/60 hover:text-gray-900 transition-all duration-200"
                >
                  <menu.icon className="w-5 h-5" strokeWidth={2} />
                  <span className="flex-1 text-left text-[13px] leading-[18px] tracking-[0.01em] font-medium">
                    {menu.label}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {isOpen && (
                  <div className="mt-1 ml-2 space-y-1">
                    {menu.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-full transition-all duration-200 ${
                            isActive
                              ? "text-white font-semibold bg-green-700 shadow-sm"
                              : "text-gray-600 hover:bg-gray-200/60 hover:text-gray-900"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon
                              className="w-4 h-4"
                              strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className="text-[12px] leading-[16px] tracking-[0.01em] font-medium">
                              {item.label}
                            </span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-300/40 shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-200/60 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm border border-gray-300 overflow-hidden shrink-0">
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
          <div className="flex-1 min-w-0">
            <div className="text-[13px] leading-[18px] tracking-[0.01em] text-gray-900 font-semibold truncate">
              {user?.nama_lengkap || "Admin Operator"}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {user?.email || "admin@minh3.sch.id"}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500 rounded-full hover:bg-red-50"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
