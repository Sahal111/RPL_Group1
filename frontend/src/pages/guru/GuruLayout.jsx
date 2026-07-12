import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import { LayoutDashboard, ClipboardList, Users, BarChart3, CalendarDays, Megaphone, UserCircle } from "lucide-react";

const menus = [
  { path: "/guru", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/guru/siswa", label: "Data Siswa", icon: Users },
  { path: "/guru/absensi", label: "Input Absensi", icon: ClipboardList },
  { path: "/guru/rekap-absensi", label: "Rekap Absensi", icon: BarChart3 },
  { path: "/guru/jadwal", label: "Jadwal Mengajar", icon: CalendarDays },
  { path: "/guru/pengumuman", label: "Pengumuman", icon: Megaphone },
  { path: "/guru/profil", label: "Profil Guru", icon: UserCircle },
];

export default function GuruLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar menus={menus} />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
