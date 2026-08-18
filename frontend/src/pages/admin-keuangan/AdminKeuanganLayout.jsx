import AppLayout from "../../components/layout/AppLayout";
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
  return <AppLayout menus={menus} />;
}
