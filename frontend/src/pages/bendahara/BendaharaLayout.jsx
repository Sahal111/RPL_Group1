import AppLayout from "../../components/layout/AppLayout";
import { LayoutDashboard, UserCircle } from "lucide-react";

const menus = [
  { path: "/bendahara", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/bendahara/profil", label: "Profil Bendahara", icon: UserCircle },
];

export default function BendaharaLayout() {
  return <AppLayout menus={menus} />;
}
