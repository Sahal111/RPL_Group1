import ComingSoonDashboard from "../../components/ui/ComingSoonDashboard";

const features = [
  {
    name: "Input Pembayaran SPP",
    desc: "Catat pembayaran siswa per bulan dengan konfirmasi otomatis",
  },
  { name: "Kelola Tagihan", desc: "Lihat dan update status tagihan siswa" },
  {
    name: "Export Data Pembayaran",
    desc: "Export rekap pembayaran ke format Excel",
  },
];

export default function DashboardAdminKeuangan() {
  return (
    <ComingSoonDashboard
      roleName="Admin Keuangan"
      description="Modul Admin Keuangan sedang dikembangkan. Fitur input pembayaran dan pengelolaan tagihan siswa akan segera tersedia."
      plannedFeatures={features}
      accentColor="blue"
    />
  );
}
