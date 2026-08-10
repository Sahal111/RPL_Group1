import ComingSoonDashboard from "../../components/ui/ComingSoonDashboard";

const features = [
  {
    name: "Manajemen Rapor Siswa",
    desc: "Pengisian nilai sikap, ekstrakurikuler, dan catatan wali kelas",
  },
  {
    name: "Monitoring Absensi Kelas",
    desc: "Rekap kehadiran seluruh siswa di kelas bimbingan",
  },
  {
    name: "Data Siswa Kelas Binaan",
    desc: "Informasi lengkap siswa yang berada di bawah bimbingan",
  },
];

export default function DashboardWaliKelas() {
  return (
    <ComingSoonDashboard
      roleName="Wali Kelas"
      description="Modul wali kelas sedang dikembangkan. Fitur manajemen rapor dan monitoring absensi kelas binaan akan segera tersedia."
      plannedFeatures={features}
    />
  );
}
