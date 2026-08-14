import ComingSoonDashboard from "../../components/ui/ComingSoonDashboard";

const features = [
  {
    name: "Katalog Buku",
    desc: "Kelola data buku: tambah, edit, upload cover, dan atur lokasi rak",
  },
  {
    name: "Peminjaman & Pengembalian",
    desc: "Catat transaksi pinjam-kembali dengan stok otomatis",
  },
  {
    name: "Denda Keterlambatan",
    desc: "Hitung denda otomatis berdasarkan batas waktu pengembalian",
  },
  {
    name: "Laporan Perpustakaan",
    desc: "Statistik peminjaman, buku populer, dan rekap denda",
  },
];

export default function DashboardPustakawan() {
  return (
    <ComingSoonDashboard
      roleName="Pustakawan"
      description="Modul Perpustakaan sedang dikembangkan. Fitur katalog buku, peminjaman, pengembalian, dan laporan akan segera tersedia."
      plannedFeatures={features}
      accentColor="yellow"
    />
  );
}
