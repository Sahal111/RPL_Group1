import AppLayout from "../../components/layout/AppLayout";
import AnakSelector from "../../components/ortu/AnakSelector";
import {
  CalendarCheck,
  BookUser,
  ClipboardList,
  Megaphone,
  UserCircle,
  UserPlus,
} from "lucide-react";

const menus = [
  { path: "/ortu", label: "Dashboard", icon: CalendarCheck, end: true },
  {
    path: "/ortu/riwayat-absensi",
    label: "Riwayat Absensi",
    icon: ClipboardList,
  },
  { path: "/ortu/pengumuman", label: "Pengumuman", icon: Megaphone },
  { path: "/ortu/data-anak", label: "Data Anak", icon: BookUser },
  { path: "/ortu/tambah-anak", label: "Tambah Anak", icon: UserPlus },
  { path: "/ortu/profil", label: "Profil", icon: UserCircle },
];

export default function OrtuLayout() {
  return <AppLayout menus={menus} header={<AnakSelector />} />;
}
