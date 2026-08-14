import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  UserCircle,
} from "lucide-react";

const menus = [
  { path: "/wakasek", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/wakasek/guru", label: "Data Guru", icon: Users },
  { path: "/wakasek/siswa", label: "Data Siswa", icon: Users },
  { path: "/wakasek/jadwal", label: "Jadwal Pelajaran", icon: CalendarDays },
  { path: "/wakasek/absensi", label: "Rekap Absensi", icon: ClipboardList },
  { path: "/wakasek/laporan", label: "Laporan", icon: FileText },
  { path: "/wakasek/pengumuman", label: "Pengumuman", icon: BookOpen },
  { path: "/wakasek/profil", label: "Profil", icon: UserCircle },
];

export default function WakasekLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar menus={menus} />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
