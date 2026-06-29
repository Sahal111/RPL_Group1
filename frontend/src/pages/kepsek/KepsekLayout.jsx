import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import { LayoutDashboard, BarChart2 } from "lucide-react";

const menus = [
  { path: "/kepsek", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/kepsek/rekap", label: "Rekap Absensi", icon: BarChart2 },
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
