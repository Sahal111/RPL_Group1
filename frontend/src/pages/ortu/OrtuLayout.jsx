import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import { CalendarCheck, BookUser, ClipboardList, Megaphone, UserCircle } from "lucide-react";
import useSelectedAnak from "../../hooks/useSelectedAnak";

const menus = [
  { path: "/ortu", label: "Dashboard", icon: CalendarCheck, end: true },
  { path: "/ortu/riwayat-absensi", label: "Riwayat Absensi", icon: ClipboardList },
  { path: "/ortu/pengumuman", label: "Pengumuman", icon: Megaphone },
  { path: "/ortu/data-anak", label: "Data Anak", icon: BookUser },
  { path: "/ortu/profil", label: "Profil", icon: UserCircle },
];

export default function OrtuLayout() {
  const { anak, selectedNisn, setSelectedNisn } = useSelectedAnak();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar menus={menus} />
      <main className="flex-1 p-8 overflow-auto">
        {anak.length > 1 && (
          <div className="mb-6 flex justify-end">
            <label className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-medium">Pilih Anak</span>
              <select
                value={selectedNisn}
                onChange={(event) => setSelectedNisn(event.target.value)}
                className="input-field min-w-[240px] bg-white"
              >
                {anak.map((item) => (
                  <option key={item.nisn} value={item.nisn}>
                    {item.nama_lengkap} - {item.nisn}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
