import { useAuth } from "../../contexts/AuthContext";
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  BookOpen,
  Award,
  Bell,
  Clock,
  UserCheck,
  TrendingUp
} from "lucide-react";

export default function DashboardSiswa() {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const jadwalToday = [
    { jam: "07.00 - 08.20", mapel: "Pendidikan Agama Islam", guru: "Ust. Ahmad Dahlan, M.Pd", ruang: "Kelas 1-A" },
    { jam: "08.20 - 09.40", mapel: "Matematika", guru: "Siti Rahmawati, S.Pd", ruang: "Kelas 1-A" },
    { jam: "09.40 - 10.00", mapel: "Istirahat Pertama", guru: "-", ruang: "Kantin / Halaman" },
    { jam: "10.00 - 11.20", mapel: "Bahasa Indonesia", guru: "Budi Santoso, S.Pd", ruang: "Kelas 1-A" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold uppercase tracking-wider mb-3 inline-block">
            Portal Siswa Digital
          </span>
          <h1 className="text-2xl font-bold mb-2">
            Selamat Datang, {user?.nama || "Siswa"}! 👋
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            Pantau kehadiran harian, jadwal mata pelajaran, hasil penilaian rapor, dan pengumuman resmi madrasah secara real-time di sini.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">96.5%</p>
            <p className="text-xs font-medium text-slate-500">Persentase Kehadiran</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">88.50</p>
            <p className="text-xs font-medium text-slate-500">Rata-rata Nilai (Rapor)</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">1-A</p>
            <p className="text-xs font-medium text-slate-500">Kelas Rombel</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">Peringkat 3</p>
            <p className="text-xs font-medium text-slate-500">Prestasi Akademik</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Jadwal Today & Announcement */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Jadwal Pelajaran Hari Ini (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Jadwal Pelajaran Hari Ini
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{today}</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              4 Sesi Belajar
            </span>
          </div>

          <div className="space-y-3">
            {jadwalToday.map((j, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-100/60 text-blue-700">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{j.mapel}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{j.guru} · {j.ruang}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-xs">
                  {j.jam}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pengumuman Terbaru (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Pengumuman Sekolah
              </h3>
            </div>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <span className="text-[10px] font-bold text-amber-700 uppercase">Penting</span>
                <h4 className="font-semibold text-slate-800 text-xs mt-0.5">Persiapan Ulangan Tengah Semester (UTS)</h4>
                <p className="text-[11px] text-slate-600 mt-1">UTS Semester Ganjil dimulai pekan depan. Harap melengkapi catatan & tugas.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/60">
                <span className="text-[10px] font-bold text-blue-700 uppercase">Kegiatan</span>
                <h4 className="font-semibold text-slate-800 text-xs mt-0.5">Kegiatan Ekstrakurikuler Pramuka</h4>
                <p className="text-[11px] text-slate-600 mt-1">Hari Sabtu pukul 15.00 WIB Wajib memakai seragam Pramuka lengkap.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
