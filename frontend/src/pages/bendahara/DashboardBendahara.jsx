import { useAuth } from "../../contexts/AuthContext";
import {
  Wallet,
  ArrowDownCircle,
  FileSpreadsheet,
  CalendarDays,
  FileText,
  Percent,
} from "lucide-react";

export default function DashboardBendahara() {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard Bendahara — {user?.nama_lengkap} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            {today}
          </p>
        </div>
        <span className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full uppercase tracking-wider">
          Role: Bendahara
        </span>
      </div>

      {/* Info Card Placeholder */}
      <div className="card p-6 bg-gradient-to-r from-emerald-600 to-teal-800 text-white shadow-lg">
        <div className="max-w-xl">
          <h2 className="text-xl font-bold mb-2">Manajemen Keuangan Sekolah</h2>
          <p className="text-emerald-50 text-sm leading-relaxed">
            Halaman ini dikhususkan untuk pencatatan transaksi keuangan siswa, pembayaran SPP/BOS, pembuatan tagihan, dan pelaporan keuangan madrasah secara real-time.
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5 flex items-center gap-4 border-l-4 border-emerald-500">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">Rp 12.500.000</p>
            <p className="text-sm text-gray-500">Kas Masuk Bulan Ini</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 border-l-4 border-orange-500">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">Rp 4.200.000</p>
            <p className="text-sm text-gray-500">Pengeluaran Operasional</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 border-l-4 border-blue-500">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">85%</p>
            <p className="text-sm text-gray-500">Persentase Pelunasan SPP</p>
          </div>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placeholder Menu Aktif */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Fitur Utama Keuangan
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100/70 transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700">Entri Pembayaran Siswa</p>
                <p className="text-xs text-gray-400">Pencatatan pembayaran iuran SPP, pembangunan, dan administrasi lainnya</p>
              </div>
            </li>
            <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100/70 transition-colors">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700">Pembuatan Laporan Keuangan</p>
                <p className="text-xs text-gray-400">Export laporan kas masuk dan kas keluar format Excel/PDF</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Task List / Aktivitas */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Agenda & Tagihan Terdekat
          </h3>
          <div className="space-y-4">
            <div className="border-l-2 border-emerald-500 pl-4 py-1">
              <p className="text-sm font-semibold text-gray-700">Pembayaran Dana BOS Tahap II</p>
              <p className="text-xs text-gray-400">Pencairan estimasi akhir bulan Juli 2026</p>
            </div>
            <div className="border-l-2 border-amber-500 pl-4 py-1">
              <p className="text-sm font-semibold text-gray-700">Rekonsiliasi Laporan Bulanan</p>
              <p className="text-xs text-gray-400">Batas pelaporan ke Kepala Sekolah setiap tanggal 5 bulan berikutnya</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
