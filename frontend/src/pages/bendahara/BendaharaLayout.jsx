import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import { LayoutDashboard, UserCircle } from "lucide-react";

const menus = [
  { path: "/bendahara", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/bendahara/profil", label: "Profil Bendahara", icon: UserCircle },
];

export default function BendaharaLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar menus={menus} />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
