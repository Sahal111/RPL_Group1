import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  Users,
  School,
  CheckCircle2,
  XCircle,
  HeartPulse,
  AlertCircle,
  CalendarDays,
  ChevronRight,
  BookOpen,
  TrendingUp,
} from "lucide-react";

const fetchDashboard = () => api.get("/guru/dashboard").then((r) => r.data.data);

// ── Stat Card ─────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className={`card p-5 flex items-center gap-4 border-l-4 ${color}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
        <Icon className="w-6 h-6" style={{ color: "inherit" }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ── Absensi Badge Row ──────────────────────────────────────
function AbsensiBadge({ hadir, sakit, izin, alpa, total }) {
  return (
    <div className="flex items-center gap-2 flex-wrap text-xs">
      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
        ✅ {hadir} Hadir
      </span>
      <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">
        ❌ {alpa} Alpa
      </span>
      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
        🤒 {sakit} Sakit
      </span>
      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
        📋 {izin} Izin
      </span>
      {total !== undefined && (
        <span className="text-gray-400">({total} entri)</span>
      )}
    </div>
  );
}

export default function DashboardGuru() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["guru-dashboard"],
    queryFn: fetchDashboard,
    refetchInterval: 60_000, // refresh tiap 1 menit
  });

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Memuat data...</p>
        </div>
      </div>
    );
  }

  const d = data;
  const absenHariIni = d?.absensi_hari_ini;
  const absenBulan = d?.absensi_bulan_ini;
  const totalHariIni =
    (absenHariIni?.hadir ?? 0) +
    (absenHariIni?.sakit ?? 0) +
    (absenHariIni?.izin ?? 0) +
    (absenHariIni?.alpa ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Selamat Datang, {d?.guru?.nama?.split(" ")[0] ?? user?.nama_lengkap?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            {today}
          </p>
        </div>
        <div className="text-xs text-gray-400 bg-gray-100 rounded-lg px-3 py-2">
          NUPTK: <span className="font-mono font-medium text-gray-600">{d?.guru?.nuptk ?? "—"}</span>
        </div>
      </div>

      {/* Stat Cards Baris 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={School}
          label="Kelas Diampu"
          value={d?.total_kelas}
          color="border-blue-500"
          bg="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={Users}
          label="Total Siswa"
          value={d?.total_siswa}
          color="border-indigo-500"
          bg="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Hadir Hari Ini"
          value={absenHariIni?.hadir ?? 0}
          color="border-green-500"
          bg="bg-green-100 text-green-600"
        />
        <StatCard
          icon={XCircle}
          label="Alpa Hari Ini"
          value={absenHariIni?.alpa ?? 0}
          color="border-red-500"
          bg="bg-red-100 text-red-600"
        />
      </div>

      {/* Baris konten utama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kelas Wali — col 2 */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            Kelas yang Diampu — Absensi Hari Ini
          </h2>

          {d?.kelas?.length === 0 && (
            <div className="card p-8 text-center text-gray-400">
              <School className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Belum ada kelas yang Anda wali.</p>
            </div>
          )}

          {d?.kelas?.map((k) => (
            <div key={k.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{k.nama_kelas}</h3>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      Tingkat {k.tingkat}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{k.total_siswa} siswa</p>
                </div>
                <div className="flex items-center gap-2">
                  {k.sudah_absen ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Sudah diabsen
                    </span>
                  ) : (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full font-medium">
                      Belum diabsen
                    </span>
                  )}
                  <Link
                    to="/guru/absensi"
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-blue-600"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {k.sudah_absen ? (
                <AbsensiBadge
                  hadir={k.hadir}
                  sakit={k.sakit}
                  izin={k.izin}
                  alpa={k.alpa}
                  total={k.hadir + k.sakit + k.izin + k.alpa}
                />
              ) : (
                <p className="text-xs text-gray-400 italic">Absensi belum dilakukan hari ini.</p>
              )}
            </div>
          ))}
        </div>

        {/* Panel Kanan */}
        <div className="space-y-4">
          {/* Ringkasan Hari Ini */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-500" />
              Ringkasan Hari Ini
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Hadir
                </div>
                <span className="font-bold text-gray-800">{absenHariIni?.hadir ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <HeartPulse className="w-4 h-4 text-amber-500" />
                  Sakit
                </div>
                <span className="font-bold text-gray-800">{absenHariIni?.sakit ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  Izin
                </div>
                <span className="font-bold text-gray-800">{absenHariIni?.izin ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Alpa
                </div>
                <span className="font-bold text-gray-800">{absenHariIni?.alpa ?? 0}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">Total tercatat</span>
                <span className="font-bold text-gray-800">{totalHariIni}</span>
              </div>
            </div>
          </div>

          {/* Statistik Bulan Ini */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Statistik Bulan Ini
            </h2>
            {(() => {
              const totalBulan =
                (absenBulan?.hadir ?? 0) +
                (absenBulan?.sakit ?? 0) +
                (absenBulan?.izin ?? 0) +
                (absenBulan?.alpa ?? 0);
              const pctHadir = totalBulan > 0 ? Math.round((absenBulan.hadir / totalBulan) * 100) : 0;
              return (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Kehadiran</span>
                      <span className="font-medium text-green-600">{pctHadir}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 bg-green-500 rounded-full transition-all"
                        style={{ width: `${pctHadir}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-green-700 text-base">{absenBulan?.hadir ?? 0}</p>
                      <p className="text-gray-500">Hadir</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-red-600 text-base">{absenBulan?.alpa ?? 0}</p>
                      <p className="text-gray-500">Alpa</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-amber-600 text-base">{absenBulan?.sakit ?? 0}</p>
                      <p className="text-gray-500">Sakit</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-blue-600 text-base">{absenBulan?.izin ?? 0}</p>
                      <p className="text-gray-500">Izin</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Quick Action */}
          <Link
            to="/guru/absensi"
            className="block card p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Input Absensi</p>
                <p className="text-xs text-blue-100 mt-0.5">Catat kehadiran siswa hari ini</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
