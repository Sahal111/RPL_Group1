import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  Megaphone,
  CalendarDays,
  UserCircle,
} from "lucide-react";

const menus = [
  { path: "/kepsek", label: "Dashboard", icon: LayoutDashboard, end: true },
  {
    path: "/kepsek/monitoring-absensi",
    label: "Monitoring Absensi",
    icon: ClipboardCheck,
  },
  { path: "/kepsek/guru", label: "Data Guru", icon: Users },
  { path: "/kepsek/siswa", label: "Data Siswa", icon: GraduationCap },
  { path: "/kepsek/pengumuman", label: "Pengumuman", icon: Megaphone },
  { path: "/kepsek/kalender", label: "Kalender Akademik", icon: CalendarDays },
  { path: "/kepsek/profil", label: "Profil Saya", icon: UserCircle },
];

export default function KepsekLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar menus={menus} />
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
