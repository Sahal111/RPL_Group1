import { useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  BookOpen,
  Award,
  Bell,
  User,
  LogOut,
  Menu,
  X
} from "lucide-react";

export default function SiswaLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard Siswa", icon: GraduationCap, path: "/siswa" },
    { label: "Jadwal Pelajaran", icon: Calendar, path: "/siswa" },
    { label: "Kehadiran / Absensi Saya", icon: CheckCircle2, path: "/siswa" },
    { label: "Nilai & Rapor Digital", icon: Award, path: "/siswa" },
    { label: "Pengumuman Sekolah", icon: Bell, path: "/siswa" },
    { label: "Profil Saya", icon: User, path: "/siswa" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-slate-200 w-full md:w-64 flex flex-col transition-all ${sidebarOpen ? "block" : "hidden md:block"}`}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-800 tracking-tight">Portal Siswa</h2>
              <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">MI Nurul Huda 3</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <item.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
              {user?.nama?.charAt(0) || "S"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.nama || "Siswa Test"}</p>
              <p className="text-[10px] text-slate-500 truncate">NISN: {user?.username || "9999999999"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar Portal
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-slate-600 p-1">
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-xs font-semibold text-slate-500">
              Tahun Ajaran: <strong className="text-slate-800">2026/2027 (Semester Ganjil)</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider">
              Status: Siswa Aktif
            </span>
          </div>
        </header>

        {/* Body Container */}
        <main className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
