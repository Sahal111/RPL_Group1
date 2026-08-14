import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
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
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar menus={menus} />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
