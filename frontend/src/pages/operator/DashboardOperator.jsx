import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import { useAuth } from "../../contexts/AuthContext";
import {
  Users,
  GraduationCap,
  UsersRound,
  UserCheck,
  UserX,
  CalendarCheck,
  ClipboardList,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  BookOpen,
  UserPlus,
  Upload,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// ── Fetch helpers ──────────────────────────────────────────────────────────────
const fetchStats = async () => {
  const [siswa, guru, users, pending] = await Promise.all([
    api.get("/master/siswa", { params: { per_page: 1 } }).then((r) => r.data),
    api.get("/master/guru", { params: { per_page: 1 } }).then((r) => r.data),
    api.get("/operator/users", { params: { per_page: 1 } }).then((r) => r.data),
    api.get("/operator/ortu-pending").then((r) => r.data),
  ]);
  return {
    totalSiswa: siswa?.data?.total ?? 0,
    totalGuru: guru?.data?.total ?? 0,
    totalUser: users?.data?.total ?? 0,
    pendingOrtu: pending?.data?.length ?? 0,
  };
};

const fetchKelas = () =>
  api.get("/master/kelas").then((r) => r.data?.data ?? []);

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  subColor = "text-green-600",
  accent,
}) {
  return (
    <div
      className={`bg-white border border-gray-300/50 rounded-xl p-4 flex flex-col gap-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow ${accent ? `${accent} border-l-4` : ""}`}
    >
      <div className="flex justify-between items-center text-gray-500">
        <span className="text-[11px] leading-[16px] tracking-[0.03em] font-semibold uppercase">
          {label}
        </span>
        <Icon className="w-[18px] h-[18px]" />
      </div>
      <p className="text-[24px] leading-[32px] font-semibold text-gray-900">{value ?? "—"}</p>
      {sub && (
        <p
          className={`text-xs flex items-center gap-1 font-medium ${subColor}`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Quick Action Button ────────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, desc, to }) {
  return (
    <Link
      to={to}
      className="w-full flex items-center justify-start gap-4 p-4 rounded-lg border border-gray-300/50 hover:bg-gray-100/50 hover:border-green-700/50 transition-all text-left group"
    >
      <div className="w-10 h-10 rounded-full bg-green-700/10 flex items-center justify-center text-green-700 group-hover:bg-green-700 group-hover:text-white transition-colors flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] leading-[18px] tracking-[0.01em] font-semibold text-gray-900">
          {label}
        </p>
        <p className="text-xs text-gray-500 truncate">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 transition-colors flex-shrink-0" />
    </Link>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DashboardOperator() {
  const { user } = useAuth();

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["operator-dashboard-stats"],
    queryFn: fetchStats,
    refetchInterval: 60_000,
  });

  const { data: kelasList = [], isLoading: loadingKelas } = useQuery({
    queryKey: ["operator-dashboard-kelas"],
    queryFn: fetchKelas,
  });

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Data chart kelas (bar)
  const kelasChartData = kelasList.slice(0, 8).map((k) => ({
    nama: k.nama_kelas ?? k.nama ?? "-",
    siswa: k.total_siswa ?? 0,
  }));

  // Dummy data chart absensi mingguan
  const absensiWeekly = [
    { hari: "Sen", hadir: 88, alpa: 3 },
    { hari: "Sel", hadir: 92, alpa: 2 },
    { hari: "Rab", hadir: 85, alpa: 5 },
    { hari: "Kam", hadir: 94, alpa: 1 },
    { hari: "Jum", hadir: 90, alpa: 4 },
    { hari: "Sab", hadir: 60, alpa: 2 },
  ];

  const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
  );

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* ── Page Header ── */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline text-[28px] md:text-[32px] leading-[36px] md:leading-[40px] tracking-[-0.01em] font-semibold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Welcome back, Operator. Here's what's happening today.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/operator/master/siswa"
            className="bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 text-[13px] leading-[18px] tracking-[0.01em] font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Upload className="w-[14px] h-[14px]" />
            <span>Import Excel</span>
          </Link>
          <Link
            to="/operator/master/guru"
            className="bg-white text-green-700 border border-green-700 rounded-lg px-4 py-2 text-[13px] leading-[18px] tracking-[0.01em] font-medium hover:bg-green-700/5 transition-colors flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="w-[14px] h-[14px]" />
            <span>Tambah Guru</span>
          </Link>
          <Link
            to="/operator/master/siswa"
            className="bg-green-700 text-white rounded-lg px-4 py-2 text-[13px] leading-[18px] tracking-[0.01em] font-medium hover:bg-green-700/90 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <UserPlus className="w-[14px] h-[14px]" />
            <span>Tambah Siswa</span>
          </Link>
        </div>
      </section>

      {/* ── Stats Grid ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loadingStats ? (
          Array(8)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : (
          <>
            <StatCard
              icon={GraduationCap}
              label="Jumlah Siswa"
              value={stats?.totalSiswa}
              sub={
                <>
                  <TrendingUp className="w-3 h-3" /> +12 from last year
                </>
              }
            />
            <StatCard
              icon={Users}
              label="Guru Aktif"
              value={stats?.totalGuru}
              sub="Stable"
              subColor="text-gray-500"
            />
            <StatCard
              icon={UsersRound}
              label="Orang Tua"
              value={stats?.totalUser}
              sub={
                <>
                  <TrendingUp className="w-3 h-3" /> +5 new accounts
                </>
              }
            />
            <StatCard
              icon={UserCheck}
              label="User Aktif"
              value="128"
              sub="Currently online"
              subColor="text-gray-500"
            />
            <StatCard
              icon={UserX}
              label="Approval Pending"
              value={stats?.pendingOrtu}
              sub={
                stats?.pendingOrtu > 0
                  ? "Needs attention"
                  : "All clear"
              }
              subColor={
                stats?.pendingOrtu > 0 ? "text-red-500" : "text-green-600"
              }
              accent={stats?.pendingOrtu > 0 ? "border-l-red-500" : ""}
            />
            <StatCard
              icon={CalendarCheck}
              label="Absensi Hari Ini"
              value="98%"
              sub={
                <>
                  <span className="text-green-500">✓</span> 8 absent
                </>
              }
            />
            <StatCard
              icon={ClipboardList}
              label="PPDB Baru"
              value="24"
              sub={
                <>
                  <TrendingUp className="w-3 h-3" /> This week
                </>
              }
            />
            <StatCard
              icon={AlertCircle}
              label="Data Belum Lengkap"
              value="7"
              sub="Student profiles"
              subColor="text-red-500"
              accent="border-l-red-500"
            />
          </>
        )}
      </section>

      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Kolom kiri — charts */}
        <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
          {/* Bar chart siswa per kelas */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base md:text-lg font-bold text-gray-800">
                Jumlah Siswa per Kelas
              </h2>
              <BarChart3 className="w-5 h-5 text-gray-300" />
            </div>
            {loadingKelas ? (
              <Skeleton className="h-56" />
            ) : kelasChartData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-gray-300 text-sm">
                Belum ada data kelas
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={kelasChartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="nama"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",
                      fontSize: 12,
                    }}
                    formatter={(v) => [`${v} siswa`, "Jumlah"]}
                  />
                  <Bar dataKey="siswa" fill="#2e7d32" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Line chart absensi mingguan */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base md:text-lg font-bold text-gray-800">
                Statistik Absensi Mingguan
              </h2>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                Minggu ini
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={absensiWeekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="hari"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hadir"
                  stroke="#2e7d32"
                  strokeWidth={2.5}
                  dot={{
                    r: 4,
                    fill: "#fff",
                    stroke: "#2e7d32",
                    strokeWidth: 2,
                  }}
                  name="Hadir"
                />
                <Line
                  type="monotone"
                  dataKey="alpa"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{
                    r: 3,
                    fill: "#fff",
                    stroke: "#ef4444",
                    strokeWidth: 2,
                  }}
                  name="Alpa"
                  strokeDasharray="4 2"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-0.5 bg-green-700 inline-block rounded" />
                Hadir
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-0.5 bg-red-400 inline-block rounded border-dashed" />
                Alpa
              </span>
            </div>
          </div>
        </div>

        {/* Kolom kanan */}
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-col gap-2">
              <QuickAction
                icon={UserCheck}
                label="Approval Orang Tua"
                desc={`${stats?.pendingOrtu ?? 0} akun menunggu review`}
                to="/operator/ortu-pending"
              />
              <QuickAction
                icon={ClipboardList}
                label="Laporan Bulanan"
                desc="Rekap data akademik"
                to="/operator/master/jadwal-pelajaran"
              />
              <QuickAction
                icon={Users}
                label="Manajemen Akun"
                desc="Kelola semua user"
                to="/operator"
              />
              <QuickAction
                icon={BookOpen}
                label="Master Jadwal"
                desc="Atur jadwal pelajaran"
                to="/operator/master/jadwal-pelajaran"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 flex-1">
            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-4">
              Aktivitas Terbaru
            </h2>
            <div className="flex flex-col gap-4 relative">
              {/* Timeline line */}
              <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-100" />

              {[
                {
                  icon: <GraduationCap className="w-3 h-3" />,
                  bg: "bg-green-100 text-green-700",
                  text: (
                    <>
                      <span className="font-semibold">Operator</span> menambah
                      data siswa baru
                    </>
                  ),
                  time: "10 menit lalu",
                },
                {
                  icon: <UserCheck className="w-3 h-3" />,
                  bg: "bg-blue-50 text-blue-600",
                  text: (
                    <>
                      <span className="font-semibold">Sistem</span> memproses
                      sinkronisasi absensi harian
                    </>
                  ),
                  time: "1 jam lalu",
                },
                {
                  icon: <AlertCircle className="w-3 h-3" />,
                  bg: "bg-red-50 text-red-500",
                  text: (
                    <>
                      <span className="font-semibold">Admin</span> menghapus
                      duplikat di Master Data
                    </>
                  ),
                  time: "3 jam lalu",
                },
                {
                  icon: <UserCheck className="w-3 h-3" />,
                  bg: "bg-green-50 text-green-600",
                  text: (
                    <>
                      <span className="font-semibold">Operator</span> menyetujui
                      5 akun orang tua
                    </>
                  ),
                  time: "Kemarin, 14:30",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 relative z-10">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${item.bg}`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 leading-snug">
                      {item.text}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/operator"
              className="block w-full mt-5 text-center text-sm font-semibold text-green-700 hover:underline"
            >
              Lihat Semua Log
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
