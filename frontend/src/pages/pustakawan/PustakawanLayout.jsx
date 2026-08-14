import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import {
  LayoutDashboard,
  BookMarked,
  BookOpenCheck,
  BarChart3,
  UserCircle,
} from "lucide-react";

const menus = [
  { path: "/pustakawan", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/pustakawan/buku", label: "Katalog Buku", icon: BookMarked },
  { path: "/pustakawan/peminjaman", label: "Peminjaman", icon: BookOpenCheck },
  { path: "/pustakawan/laporan", label: "Laporan", icon: BarChart3 },
  { path: "/pustakawan/profil", label: "Profil", icon: UserCircle },
];

export default function PustakawanLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar menus={menus} />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
