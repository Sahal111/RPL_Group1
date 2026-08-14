import ComingSoonDashboard from "../../components/ui/ComingSoonDashboard";

const features = [
  { name: "Rekap Absensi Seluruh Kelas", desc: "Pantau kehadiran guru dan siswa semua kelas" },
  { name: "Kelola Jadwal Pelajaran", desc: "Atur dan validasi jadwal mengajar per kelas" },
  { name: "Manajemen Kurikulum", desc: "Kelola mata pelajaran, KKM, dan komponen penilaian" },
  { name: "Laporan Akademik", desc: "Laporan hasil belajar siswa per semester" },
  { name: "Kelola Pengumuman", desc: "Buat dan distribusikan pengumuman ke warga sekolah" },
];

export default function DashboardWakasek() {
  return (
    <ComingSoonDashboard
      roleName="Wakil Kepala Sekolah"
      description="Modul Wakasek sedang dikembangkan. Fitur kelola kurikulum, kesiswaan, jadwal, dan laporan akademik akan segera tersedia."
      plannedFeatures={features}
      accentColor="indigo"
    />
  );
}