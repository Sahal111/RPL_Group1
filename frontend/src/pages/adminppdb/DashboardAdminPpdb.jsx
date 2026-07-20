import { useAuth } from "../../contexts/AuthContext";
import {
  UserPlus,
  CheckCircle,
  Clock,
  CalendarDays,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

export default function DashboardAdminPpdb() {
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
            Dashboard PPDB — {user?.nama_lengkap} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            {today}
          </p>
        </div>
        <span className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full uppercase tracking-wider">
          Role: Admin PPDB
        </span>
      </div>

      {/* Info Card Placeholder */}
      <div className="card p-6 bg-gradient-to-r from-purple-600 to-indigo-800 text-white shadow-lg">
        <div className="max-w-xl">
          <h2 className="text-xl font-bold mb-2">Penerimaan Peserta Didik Baru (PPDB)</h2>
          <p className="text-purple-100 text-sm leading-relaxed">
            Selamat datang di portal panitia PPDB MI Nurul Huda 3. Kelola berkas pendaftaran calon siswa, lakukan verifikasi data wali murid, dan publikasikan hasil seleksi di sini.
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5 flex items-center gap-4 border-l-4 border-purple-500">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">48</p>
            <p className="text-sm text-gray-500">Pendaftar Baru</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 border-l-4 border-yellow-500">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">12</p>
            <p className="text-sm text-gray-500">Menunggu Verifikasi</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 border-l-4 border-green-500">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">36</p>
            <p className="text-sm text-gray-500">Lolos Seleksi Berkas</p>
          </div>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placeholder Menu Aktif */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Fitur Penerimaan Calon Siswa
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100/70 transition-colors">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700">Verifikasi Formulir Pendaftaran</p>
                <p className="text-xs text-gray-400">Pemeriksaan kecocokan NIK, Kartu Keluarga, Akta Lahir, dan foto calon siswa</p>
              </div>
            </li>
            <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100/70 transition-colors">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700">Manajemen Status PPDB</p>
                <p className="text-xs text-gray-400">Ubah status verifikasi pendaftar menjadi diterima atau ditolak</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Task List / Agenda */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-600" />
            Agenda Sosialisasi & Seleksi
          </h3>
          <div className="space-y-4">
            <div className="border-l-2 border-purple-500 pl-4 py-1">
              <p className="text-sm font-semibold text-gray-700">Verifikasi Berkas Fisik Gelombang I</p>
              <p className="text-xs text-gray-400">Senin - Rabu, pukul 08.00 - 12.00 WIB di Kantor Panitia PPDB</p>
            </div>
            <div className="border-l-2 border-amber-500 pl-4 py-1">
              <p className="text-sm font-semibold text-gray-700">Rapat Pleno Kelulusan PPDB</p>
              <p className="text-xs text-gray-400">Kamis, Ruang Rapat Kepala Madrasah</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
