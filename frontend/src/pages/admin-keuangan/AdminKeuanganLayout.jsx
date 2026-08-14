import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import {
  LayoutDashboard,
  ReceiptText,
  Banknote,
  UserCircle,
} from "lucide-react";

const menus = [
  {
    path: "/admin-keuangan",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    path: "/admin-keuangan/tagihan",
    label: "Tagihan Siswa",
    icon: ReceiptText,
  },
  {
    path: "/admin-keuangan/pembayaran",
    label: "Input Pembayaran",
    icon: Banknote,
  },
  { path: "/admin-keuangan/profil", label: "Profil", icon: UserCircle },
];

export default function AdminKeuanganLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar menus={menus} />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
