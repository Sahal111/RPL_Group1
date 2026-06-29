import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import { CalendarCheck, BookUser, ClipboardList, Megaphone, UserCircle } from "lucide-react";

const menus = [
  { path: "/ortu", label: "Dashboard", icon: CalendarCheck, end: true },
  { path: "/ortu/riwayat-absensi", label: "Riwayat Absensi", icon: ClipboardList },
  { path: "/ortu/pengumuman", label: "Pengumuman", icon: Megaphone },
  { path: "/ortu/data-anak", label: "Data Anak", icon: BookUser },
  { path: "/ortu/profil", label: "Profil", icon: UserCircle },
];

export default function OrtuLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar menus={menus} />
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
