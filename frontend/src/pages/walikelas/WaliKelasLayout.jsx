import AppLayout from "../../components/layout/AppLayout";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  FileText,
  BookOpen,
  UserCircle,
} from "lucide-react";

const menus = [
  { path: "/walikelas", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/walikelas/siswa", label: "Data Siswa", icon: Users },
  { path: "/walikelas/jadwal", label: "Jadwal Pelajaran", icon: CalendarDays },
  { path: "/walikelas/absensi", label: "Rekap Absensi", icon: ClipboardList },
  { path: "/walikelas/laporan", label: "Laporan", icon: FileText },
  { path: "/walikelas/pengumuman", label: "Pengumuman", icon: BookOpen },
  { path: "/walikelas/profil", label: "Profil", icon: UserCircle },
];

export default function WaliKelasLayout() {
  return <AppLayout menus={menus} />;
}
