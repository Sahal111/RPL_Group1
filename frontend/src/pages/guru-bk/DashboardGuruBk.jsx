import ComingSoonDashboard from "../../components/ui/ComingSoonDashboard";

const features = [
  {
    name: "Sesi Konseling",
    desc: "Catat dan kelola sesi konseling siswa secara individual maupun kelompok",
  },
  {
    name: "Catatan BK",
    desc: "Dokumentasi pelanggaran, prestasi, dan observasi perilaku siswa",
  },
  {
    name: "Rencana Tindak Lanjut",
    desc: "Pantau perkembangan siswa yang sedang dalam pendampingan",
  },
  {
    name: "Laporan BK",
    desc: "Laporan rekap konseling per periode untuk kepala sekolah",
  },
];

export default function DashboardGuruBk() {
  return (
    <ComingSoonDashboard
      roleName="Guru BK"
      description="Modul Bimbingan Konseling sedang dikembangkan. Fitur pencatatan konseling, catatan perilaku siswa, dan laporan BK akan segera tersedia."
      plannedFeatures={features}
      accentColor="green"
    />
  );
}
