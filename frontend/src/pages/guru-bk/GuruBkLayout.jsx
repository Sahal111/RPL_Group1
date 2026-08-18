import AppLayout from "../../components/layout/AppLayout";
import {
  LayoutDashboard,
  HeartHandshake,
  NotebookPen,
  BarChart3,
  UserCircle,
} from "lucide-react";

const menus = [
  { path: "/guru-bk", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/guru-bk/konseling", label: "Sesi Konseling", icon: HeartHandshake },
  { path: "/guru-bk/catatan", label: "Catatan BK", icon: NotebookPen },
  { path: "/guru-bk/laporan", label: "Laporan BK", icon: BarChart3 },
  { path: "/guru-bk/profil", label: "Profil", icon: UserCircle },
];

export default function GuruBkLayout() {
  return <AppLayout menus={menus} />;
}
