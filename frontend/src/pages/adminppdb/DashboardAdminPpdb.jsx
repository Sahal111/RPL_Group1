import ComingSoonDashboard from "../../components/ui/ComingSoonDashboard";

const features = [
  {
    name: "Manajemen Pendaftar",
    desc: "Daftar calon siswa yang mendaftar beserta status berkas",
  },
  {
    name: "Verifikasi Berkas",
    desc: "Pemeriksaan NIK, Kartu Keluarga, Akta Lahir, dan foto",
  },
  {
    name: "Manajemen Status PPDB",
    desc: "Ubah status pendaftar: diterima, antrian, atau ditolak",
  },
  { name: "Laporan PPDB", desc: "Rekap statistik penerimaan siswa baru" },
];

export default function DashboardAdminPpdb() {
  return (
    <ComingSoonDashboard
      roleName="Admin PPDB"
      description="Modul penerimaan peserta didik baru (PPDB) sedang dikembangkan. Fitur verifikasi berkas dan manajemen status pendaftar akan segera tersedia."
      plannedFeatures={features}
    />
  );
}
