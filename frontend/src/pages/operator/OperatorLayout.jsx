import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";

import {
  Users,
  UserCheck,
  GraduationCap,
  BookUser,
  School,
  CalendarDays,
  ArrowUpCircle,
  BookOpen,
  Clock,
  Megaphone,
  UserCircle,
  Images,
} from "lucide-react";

const menus = [
  { path: "/operator", label: "Manajemen Akun", icon: Users, end: true },
  { path: "/operator/ortu-pending", label: "Approval Ortu", icon: UserCheck },
  {
    path: "/operator/master/tahun-ajaran",
    label: "Tahun Ajaran",
    icon: CalendarDays,
  },
  {
    path: "/operator/master/guru",
    label: "Master Data Guru",
    icon: GraduationCap,
  },
  {
    path: "/operator/master/siswa",
    label: "Master Data Siswa",
    icon: BookUser,
  },
  { path: "/operator/master/kelas", label: "Master Data Kelas", icon: School },
  {
    path: "/operator/master/ortu",
    label: "Master Data Ortu",
    icon: UserCircle,
  },
  {
    path: "/operator/master/naik-kelas",
    label: "Naik Kelas Massal",
    icon: ArrowUpCircle,
  },
  {
    path: "/operator/master/mapel",
    label: "Mata Pelajaran",
    icon: BookOpen,
  },
  {
    path: "/operator/master/jadwal-pelajaran",
    label: "Jadwal Pelajaran",
    icon: Clock,
  },
  {
    path: "/operator/master/pengumuman",
    label: "Pengumuman",
    icon: Megaphone,
  },
  {
    path: "/operator/master/galeri",
    label: "Galeri Foto",
    icon: Images,
  },
];

export default function OperatorLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar menus={menus} />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
