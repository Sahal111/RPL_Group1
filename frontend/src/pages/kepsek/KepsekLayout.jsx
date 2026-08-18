import AppLayout from "../../components/layout/AppLayout";
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
  return <AppLayout menus={menus} />;
}
