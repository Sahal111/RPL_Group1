import ComingSoonDashboard from "../../components/ui/ComingSoonDashboard";

const features = [
  {
    name: "Jadwal Pelajaran Harian",
    desc: "Melihat jadwal mata pelajaran sesuai kelas dan semester aktif",
  },
  {
    name: "Kehadiran / Absensi Saya",
    desc: "Riwayat dan rekapitulasi kehadiran pribadi",
  },
  {
    name: "Nilai & Rapor Digital",
    desc: "Akses nilai ulangan, UTS, UAS, dan rapor semester",
  },
  { name: "Pengumuman Sekolah", desc: "Informasi resmi dari madrasah" },
  { name: "Profil Siswa", desc: "Data diri dan informasi akademik" },
];

export default function DashboardSiswa() {
  return (
    <ComingSoonDashboard
      roleName="Siswa"
      description="Portal siswa sedang dalam tahap pengembangan. Fitur akses jadwal, nilai, absensi, dan rapor digital akan segera tersedia."
      plannedFeatures={features}
    />
  );
}
