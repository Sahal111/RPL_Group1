import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import { LayoutDashboard, UserCircle } from "lucide-react";

const menus = [
  { path: "/adminppdb", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/adminppdb/profil", label: "Profil Admin PPDB", icon: UserCircle },
];

export default function AdminPpdbLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar menus={menus} />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
