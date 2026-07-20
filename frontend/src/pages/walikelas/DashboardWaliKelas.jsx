import { useAuth } from "../../contexts/AuthContext";
import {
  Users,
  School,
  ClipboardList,
  CalendarDays,
  FileSpreadsheet,
  Award,
} from "lucide-react";

export default function DashboardWaliKelas() {
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
            Dashboard Wali Kelas — {user?.nama_lengkap} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            {today}
          </p>
        </div>
        <span className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full uppercase tracking-wider">
          Role: Wali Kelas
        </span>
      </div>

      {/* Info Card Placeholder */}
      <div className="card p-6 bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-lg">
        <div className="max-w-xl">
          <h2 className="text-xl font-bold mb-2">Selamat Datang di Halaman Wali Kelas</h2>
          <p className="text-primary-100 text-sm leading-relaxed">
            Halaman ini adalah dashboard untuk mengelola administrasi kelas bimbingan Anda, mencakup rekap nilai, kelayakan rapor, serta koordinasi absensi anak didik.
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5 flex items-center gap-4 border-l-4 border-blue-500">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <School className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">1-A</p>
            <p className="text-sm text-gray-500">Kelas Binaan</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 border-l-4 border-indigo-500">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">32</p>
            <p className="text-sm text-gray-500">Jumlah Siswa Kelas</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 border-l-4 border-green-500">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">Kurikulum Merdeka</p>
            <p className="text-sm text-gray-500">Status Kurikulum</p>
          </div>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placeholder Menu Aktif */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary-600" />
            Fitur Utama Wali Kelas
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100/70 transition-colors">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700">Manajemen Rapor Siswa</p>
                <p className="text-xs text-gray-400">Pengisian nilai sikap, ekstrakurikuler, dan catatan wali kelas</p>
              </div>
            </li>
            <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100/70 transition-colors">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700">Monitoring Absensi Kelas</p>
                <p className="text-xs text-gray-400">Melihat rekapitulasi kehadiran siswa di bawah asuhan Anda</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Task List / Aktivitas */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary-600" />
            Agenda Penting
          </h3>
          <div className="space-y-4">
            <div className="border-l-2 border-primary-500 pl-4 py-1">
              <p className="text-sm font-semibold text-gray-700">Input Catatan Rapor Semester Ganjil</p>
              <p className="text-xs text-gray-400">Batas akhir pengisian 18 Desember 2026</p>
            </div>
            <div className="border-l-2 border-amber-500 pl-4 py-1">
              <p className="text-sm font-semibold text-gray-700">Rapat Koordinasi Wali Kelas</p>
              <p className="text-xs text-gray-400">Jumat, pukul 13.00 WIB di Ruang Guru</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
