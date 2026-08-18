import AppLayout from "../../components/layout/AppLayout";
import { LayoutDashboard, UserCircle } from "lucide-react";

const menus = [
  { path: "/adminppdb", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/adminppdb/profil", label: "Profil Admin PPDB", icon: UserCircle },
];

export default function AdminPpdbLayout() {
  return <AppLayout menus={menus} />;
}
