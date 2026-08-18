import AppLayout from "../../components/layout/AppLayout";
import {
  LayoutDashboard,
  Mail,
  Archive,
  Stamp,
  UserCircle,
} from "lucide-react";

const menus = [
  { path: "/tata-usaha", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/tata-usaha/surat-masuk", label: "Surat Masuk", icon: Mail },
  { path: "/tata-usaha/surat-keluar", label: "Surat Keluar", icon: Mail },
  { path: "/tata-usaha/arsip", label: "Arsip Surat", icon: Archive },
  { path: "/tata-usaha/legalisir", label: "Legalisir", icon: Stamp },
  { path: "/tata-usaha/profil", label: "Profil", icon: UserCircle },
];

export default function TataUsahaLayout() {
  return <AppLayout menus={menus} />;
}
