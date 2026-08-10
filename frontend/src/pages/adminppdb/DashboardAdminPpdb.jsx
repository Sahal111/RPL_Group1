import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Users,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRightLeft,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import api from "../../lib/axios";
import { useAuth } from "../../contexts/AuthContext";

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  bgClass,
  isLoading,
  to,
}) {
  const content = (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-3 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${bgClass}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </span>
        <div className={`p-2 rounded-xl ${colorClass}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-800">
        {isLoading ? (
          <span className="inline-block w-10 h-7 bg-gray-200 animate-pulse rounded" />
        ) : (
          (value ?? 0)
        )}
      </p>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

const ALUR = [
  {
    key: "pending",
    label: "Menunggu",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    dot: "bg-yellow-400",
  },
  {
    key: "verifikasi",
    label: "Sedang Diverifikasi",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    dot: "bg-blue-400",
  },
  {
    key: "lulus",
    label: "Lulus Seleksi",
    color: "text-green-600 bg-green-50 border-green-200",
    dot: "bg-green-400",
  },
  {
    key: "tidak_lulus",
    label: "Tidak Lulus",
    color: "text-red-600 bg-red-50 border-red-200",
    dot: "bg-red-400",
  },
  {
    key: "cadangan",
    label: "Cadangan",
    color: "text-orange-600 bg-orange-50 border-orange-200",
    dot: "bg-orange-400",
  },
  {
    key: "converted",
    label: "Sudah Jadi Siswa",
    color: "text-purple-600 bg-purple-50 border-purple-200",
    dot: "bg-purple-400",
  },
  {
    key: "dibatalkan",
    label: "Dibatalkan",
    color: "text-gray-500 bg-gray-50 border-gray-200",
    dot: "bg-gray-300",
  },
];

export default function DashboardAdminPpdb() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["ppdb-dashboard"],
    queryFn: () => api.get("/ppdb/dashboard-stats").then((r) => r.data.data),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const lulusRate = stats?.total_pendaftar
    ? Math.round(
        ((stats.lulus + stats.converted) / stats.total_pendaftar) * 100,
      )
    : 0;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard PPDB</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {today} · Selamat datang, {user?.nama_lengkap || "Admin PPDB"}
          </p>
        </div>
        <Link
          to="/adminppdb/calon-siswa"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm w-fit"
        >
          <Users size={16} />
          Kelola Pendaftar
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Pendaftar"
          value={stats?.total_pendaftar}
          icon={Users}
          bgClass="bg-white border-gray-200"
          colorClass="bg-blue-100 text-blue-600"
          isLoading={isLoading}
          to="/adminppdb/calon-siswa"
        />
        <StatCard
          label="Menunggu Verifikasi"
          value={stats?.pending}
          icon={Clock}
          bgClass="bg-yellow-50 border-yellow-200"
          colorClass="bg-yellow-100 text-yellow-600"
          isLoading={isLoading}
          to="/adminppdb/calon-siswa?status=pending"
        />
        <StatCard
          label="Lulus Seleksi"
          value={stats?.lulus}
          icon={CheckCircle}
          bgClass="bg-green-50 border-green-200"
          colorClass="bg-green-100 text-green-600"
          isLoading={isLoading}
          to="/adminppdb/calon-siswa?status=lulus"
        />
        <StatCard
          label="Sudah Dikonversi"
          value={stats?.converted}
          icon={ArrowRightLeft}
          bgClass="bg-purple-50 border-purple-200"
          colorClass="bg-purple-100 text-purple-600"
          isLoading={isLoading}
          to="/adminppdb/calon-siswa?status=converted"
        />
      </div>

      {/* Tingkat kelulusan + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Tingkat Kelulusan</h3>
            <TrendingUp size={18} className="text-green-500" />
          </div>
          {isLoading ? (
            <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <>
              <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                  className="absolute left-0 top-0 h-full bg-green-500 rounded-full transition-all duration-700"
                  style={{ width: `${lulusRate}%` }}
                />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold text-gray-800">
                    {lulusRate}%
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    dari total pendaftar
                  </p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>{(stats?.lulus ?? 0) + (stats?.converted ?? 0)} lulus</p>
                  <p>{stats?.total_pendaftar ?? 0} total</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">
            Breakdown Status Pendaftar
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-gray-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALUR.map(({ key, label, color, dot }) => {
                const val = stats?.[key] ?? 0;
                const pct = stats?.total_pendaftar
                  ? Math.round((val / stats.total_pendaftar) * 100)
                  : 0;
                return (
                  <Link
                    key={key}
                    to={`/adminppdb/calon-siswa?status=${key}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-sm font-medium transition-all hover:scale-[1.02] ${color}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dot}`} />
                      {label}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{val}</span>
                      <span className="text-xs opacity-60">({pct}%)</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              to: "/adminppdb/calon-siswa",
              icon: Users,
              label: "Semua Pendaftar",
              color: "bg-blue-50 text-blue-600 border-blue-100",
            },
            {
              to: "/adminppdb/calon-siswa?status=pending",
              icon: Clock,
              label: "Perlu Verifikasi",
              color: "bg-yellow-50 text-yellow-600 border-yellow-100",
            },
            {
              to: "/adminppdb/calon-siswa?status=lulus",
              icon: CheckCircle,
              label: "Siap Konversi",
              color: "bg-green-50 text-green-600 border-green-100",
            },
            {
              to: "/adminppdb/calon-siswa?status=tidak_lulus",
              icon: XCircle,
              label: "Tidak Lulus",
              color: "bg-red-50 text-red-600 border-red-100",
            },
          ].map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all hover:shadow-md hover:-translate-y-0.5 ${color}`}
            >
              <Icon size={22} />
              <span className="text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {stats?.pending > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <AlertCircle
            size={18}
            className="text-amber-500 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {stats.pending} pendaftar menunggu verifikasi
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Segera tinjau dan perbarui status mereka.{" "}
              <Link
                to="/adminppdb/calon-siswa?status=pending"
                className="underline font-semibold"
              >
                Lihat sekarang →
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
