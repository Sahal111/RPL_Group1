import ComingSoonDashboard from "../../components/ui/ComingSoonDashboard";

const features = [
  {
    name: "Entri Pembayaran Siswa",
    desc: "Pencatatan pembayaran SPP, pembangunan, dan iuran lainnya",
  },
  {
    name: "Manajemen Tagihan",
    desc: "Pembuatan dan pengelolaan tagihan per siswa",
  },
  {
    name: "Laporan Keuangan",
    desc: "Export laporan kas masuk dan keluar format Excel/PDF",
  },
  { name: "Dana BOS", desc: "Pencatatan dan pelaporan penggunaan dana BOS" },
];

export default function DashboardBendahara() {
  return (
    <ComingSoonDashboard
      roleName="Bendahara"
      description="Modul keuangan sedang dikembangkan. Fitur entri pembayaran, tagihan siswa, dan laporan keuangan akan segera tersedia."
      plannedFeatures={features}
    />
  );
}
