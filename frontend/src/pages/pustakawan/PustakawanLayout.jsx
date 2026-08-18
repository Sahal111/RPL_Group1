import AppLayout from "../../components/layout/AppLayout";
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
  return <AppLayout menus={menus} />;
}
