import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import { useAuth } from "../../contexts/AuthContext";
import {
  TrendingUp,
  School,
  Users,
  CheckCircle,
  DollarSign,
  CalendarDays,
  UserCheck,
  Upload,
  Download,
  UserPlus,
  Building2,
  Calendar,
  RotateCcw,
  Save,
  Image as ImageIcon,
  Megaphone,
  ClipboardList,
  BarChart3,
} from "lucide-react";

// ── Fetch helpers ──────────────────────────────────────────────────────────────
const fetchStats = async () => {
  const [siswa, guru, users, pending] = await Promise.all([
    api
      .get("/operator/master-data/siswa", { params: { per_page: 1 } })
      .then((r) => r.data),
    api
      .get("/operator/master-data/guru", { params: { per_page: 1 } })
      .then((r) => r.data),
    api.get("/operator/users", { params: { per_page: 1 } }).then((r) => r.data),
    api.get("/operator/ortu/pending").then((r) => r.data),
  ]);
  return {
    totalSiswa: siswa?.data?.total ?? 0,
    totalGuru: guru?.data?.total ?? 0,
    totalUser: users?.data?.total ?? 0,
    pendingOrtu: pending?.data?.length ?? 0,
  };
};

const fetchKelas = () =>
  api.get("/operator/master-data/kelas").then((r) => r.data?.data?.data ?? []);

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendText,
  progress,
  subValue,
  highlight = false,
  col span = 1,
}) {
  return (
    <div
      className={`bg-[#ffffff] border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group cursor-pointer opacity-0 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards] ${
        highlight
          ? "bg-[#00652c] text-white col-span-2 sm:col-span-1"
          : ""
      } ${colspan > 1 ? `col-span-${colspan}` : ""}`}
      style={{ animationDelay: `${Math.random() * 0.5}s` }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#00652c]/5 rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-150"></div>

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 ${
              highlight
                ? "bg-white/20"
                : "bg-[#00652c]/10 group-hover:bg-[#00652c] group-hover:text-white"
            } rounded-md ${
              highlight ? "text-white" : "text-[#00652c]"
            } transition-colors duration-300`}
          >
            <Icon className="w-[18px] h-[18px]" />
          </div>
          <span
            className={`text-[13px] leading-[1.4] font-medium ${
              highlight ? "opacity-90" : "text-[#6B7280]"
            }`}
          >
            {label}
          </span>
        </div>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend === "up"
                ? "text-[#16A34A] bg-[#16A34A]/10"
                : trend === "down"
                  ? "text-[#DC2626] bg-[#DC2626]/10"
                  : "text-[#6B7280] bg-[#dfe4db]"
            } px-1.5 py-0.5 rounded flex items-center gap-0.5`}
          >
            {trend === "up" ? (
              <TrendingUp className="w-[10px] h-[10px]" />
            ) : trend === "down" ? (
              <TrendingUp className="w-[10px] h-[10px] rotate-180" />
            ) : (
              <span className="w-[10px] h-[2px] bg-current"></span>
            )}
            {trendText}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between relative z-10">
        <p
          className={`text-[24px] leading-[32px] font-bold ${
            highlight ? "text-white" : "text-[#111827]"
          }`}
        >
          {value ?? "—"}
        </p>
        {subValue && (
          <div className="w-16 h-8 opacity-60">
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 100 30"
            >
              <path
                d={
                  trend === "up"
                    ? "M0,25 C20,25 30,15 50,20 C70,25 80,5 100,10"
                    : "M0,15 L100,15"
                }
                fill="none"
                stroke={trend === "up" ? "#16A34A" : "#6B7280"}
                strokeWidth="2"
                strokeDasharray={trend === "neutral" ? "2,2" : "0"}
              />
            </svg>
          </div>
        )}
      </div>

      {progress && (
        <div className="mt-2 relative z-10">
          <div className="w-full bg-[#dfe4db] rounded-full h-1.5 mt-2">
            <div
              className="bg-[#00652c] h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
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
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex-1 p-6 max-w-[1600px] mx-auto w-full space-y-6 pb-24 md:pb-6">
      {/* ── Welcome Section ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 opacity-0 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        <div>
          <h2 className="text-[32px] leading-[1.2] font-bold text-[#111827] tracking-tight">
            Selamat Datang, Admin Operator
          </h2>
          <p className="text-[#6B7280] mt-1 text-[16px]">{today}</p>
        </div>
        <div className="flex items-center gap-2 bg-[#16A34A]/10 text-[#16A34A] px-3 py-1.5 rounded-full border border-[#16A34A]/20 w-fit">
          <span className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse"></span>
          <span className="text-xs font-semibold">System status: Healthy</span>
        </div>
      </div>

      {/* ── Statistics Grid ── */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {loadingStats ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-100 rounded-[18px] animate-pulse"
              />
            ))
        ) : (
          <>
            <StatCard
              icon={School}
              label="Total Siswa"
              value={stats?.totalSiswa}
              trend="up"
              trendText="+5%"
              subValue
            />
            <StatCard
              icon={Users}
              label="Total Guru"
              value={stats?.totalGuru}
              trend="neutral"
              trendText="0%"
              subValue
            />
            <StatCard
              icon={Building2}
              label="Kapasitas"
              value={`${kelasList.length} Kelas`}
              progress={85}
              subValue="342/400"
            />
            <StatCard
              icon={DollarSign}
              label="Pendapatan"
              value="Rp 45Jt"
              trend="up"
              trendText="+12%"
              subValue
            />
            <StatCard
              icon={CalendarDays}
              label="Tahun Ajaran"
              value="2023/2024"
              subValue="Semester Ganjil"
            />
            <StatCard
              icon={UserCheck}
              label="Presensi Hari Ini"
              value="98%"
              progress={98}
              highlight
            />
          </>
        )}
      </section>

      {/* ── Bento Grid Layout for Main Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Quick Actions Grid ── */}
        <div className="lg:col-span-1 bg-[#ffffff] border border-[#E5E7EB] rounded-[18px] p-6 shadow-sm opacity-0 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.2s_forwards]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[18px] leading-[1.4] font-semibold text-[#111827]">
              Tindakan Cepat
            </h3>
            <button className="text-[#00652c] hover:bg-[#00652c]/10 p-1 rounded transition-colors duration-300">
              <span className="text-sm">•••</span>
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Upload, label: "Import", to: "/operator/master/siswa" },
              { icon: Download, label: "Export", to: "/operator/master/siswa" },
              { icon: UserPlus, label: "Tambah Siswa", to: "/operator/master/siswa" },
              { icon: Users, label: "Tambah Guru", to: "/operator/master/guru" },
              { icon: Building2, label: "Tambah Kelas", to: "/operator/master/kelas" },
              { icon: Calendar, label: "Kalender", to: "/operator/kalender-akademik" },
              { icon: Save, label: "Backup", to: "/operator/backup" },
              { icon: RotateCcw, label: "Restore", to: "/operator/backup" },
            ].map((action, idx) => (
              <Link
                key={idx}
                to={action.to}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#f0f5ec] transition-all duration-300 group hover:scale-105 hover:shadow-[0_0_15px_rgba(21,128,61,0.1)]"
              >
                <div className="w-10 h-10 rounded-full bg-[#dfe4db] flex items-center justify-center text-[#3f493f] group-hover:bg-[#00652c]/10 group-hover:text-[#00652c] transition-colors duration-300">
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-center text-[#6B7280] group-hover:text-[#00652c] transition-colors duration-300">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Financial Overview ── */}
        <div className="lg:col-span-2 bg-[#ffffff] border border-[#E5E7EB] rounded-[18px] p-6 shadow-sm flex flex-col opacity-0 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.3s_forwards]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[18px] leading-[1.4] font-semibold text-[#111827]">
                Financial Overview
              </h3>
              <p className="text-sm text-[#6B7280]">
                Pemasukan vs Pengeluaran 6 bulan terakhir
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#00652c]"></span>
                <span className="text-xs text-[#6B7280]">Pemasukan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#F59E0B]"></span>
                <span className="text-xs text-[#6B7280]">Pengeluaran</span>
              </div>
              <select className="bg-[#eaefe6] border border-[#becabc] rounded-lg text-sm px-3 py-1.5 focus:ring-[#00652c] focus:border-[#00652c] transition-all duration-300 hover:bg-[#e4eae1] cursor-pointer outline-none ml-2">
                <option>6 Bulan Terakhir</option>
                <option>Tahun Ini</option>
              </select>
            </div>
          </div>
          <div className="flex-1 min-h-[220px] bg-[#ffffff] flex items-end justify-between px-2 pt-4 relative group">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-[#6B7280]">
              <span>Rp 50M</span>
              <span>Rp 25M</span>
              <span>0</span>
            </div>
            {/* Horizontal grid lines */}
            <div className="absolute left-10 right-0 top-2 bottom-8 flex flex-col justify-between z-0">
              <div className="w-full border-t border-[#E5E7EB] border-dashed"></div>
              <div className="w-full border-t border-[#E5E7EB] border-dashed"></div>
              <div className="w-full border-t border-[#E5E7EB]"></div>
            </div>
            {/* Bar Groups */}
            <div className="flex-1 ml-12 h-full flex items-end justify-around pb-8 z-10">
              {[
                { month: "Mei", pemasukan: 60, pengeluaran: 40 },
                { month: "Jun", pemasukan: 70, pengeluaran: 45 },
                { month: "Jul", pemasukan: 85, pengeluaran: 60 },
                { month: "Ags", pemasukan: 50, pengeluaran: 40 },
                { month: "Sep", pemasukan: 75, pengeluaran: 55 },
                { month: "Okt", pemasukan: 90, pengeluaran: 50 },
              ].map((data, idx) => (
                <div
                  key={idx}
                  className="flex items-end gap-1 h-[90%] relative group/bar w-full max-w-[40px]"
                >
                  <div
                    className="w-full bg-[#00652c] rounded-t-sm transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{ height: `${data.pemasukan}%` }}
                  ></div>
                  <div
                    className="w-full bg-[#F59E0B] rounded-t-sm transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{ height: `${data.pengeluaran}%` }}
                  ></div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[#6B7280]">
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Second Row: 3 Column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Pending Approvals */}
        <div className="lg:col-span-1 bg-[#ffffff] border border-[#E5E7EB] rounded-[18px] p-6 shadow-sm opacity-0 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.4s_forwards] flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] leading-[1.4] font-semibold text-[#111827]">
              Persetujuan Tertunda
            </h3>
            <span className="bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-bold px-2 py-1 rounded-full">
              5 Baru
            </span>
          </div>
          <ul className="space-y-3 flex-1">
            <li className="flex flex-col p-3 bg-[#f0f5ec] border border-[#E5E7EB]/50 rounded-xl hover:bg-[#e4eae1] transition-colors duration-300 cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#00652c]" />
                  <span className="text-sm font-medium text-[#111827]">
                    Registrasi Siswa Baru
                  </span>
                </div>
                <span className="text-[10px] text-[#6B7280]">2 jam lalu</span>
              </div>
              <p className="text-xs text-[#6B7280] mb-3">
                Ahmad Fauzi - Kelas 1A (Butuh verifikasi dokumen kelulusan)
              </p>
              <div className="flex gap-2 mt-auto">
                <button className="flex-1 bg-[#00652c] text-white text-xs py-1.5 rounded-lg hover:bg-[#00652c]/90 transition-colors">
                  Setuju
                </button>
                <button className="flex-1 bg-[#eaefe6] border border-[#E5E7EB] text-[#111827] text-xs py-1.5 rounded-lg hover:bg-[#dfe4db] transition-colors">
                  Tinjau
                </button>
              </div>
            </li>
            <li className="flex flex-col p-3 bg-[#f0f5ec] border border-[#E5E7EB]/50 rounded-xl hover:bg-[#e4eae1] transition-colors duration-300 cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#F59E0B]" />
                  <span className="text-sm font-medium text-[#111827]">
                    Pengajuan Cuti Guru
                  </span>
                </div>
                <span className="text-[10px] text-[#6B7280]">5 jam lalu</span>
              </div>
              <p className="text-xs text-[#6B7280] mb-3">
                Bpk. Budi Santoso - Sakit (Lampiran surat dokter tersedia)
              </p>
              <div className="flex gap-2 mt-auto">
                <button className="flex-1 bg-[#00652c] text-white text-xs py-1.5 rounded-lg hover:bg-[#00652c]/90 transition-colors">
                  Setuju
                </button>
                <button className="flex-1 bg-[#eaefe6] border border-[#E5E7EB] text-[#111827] text-xs py-1.5 rounded-lg hover:bg-[#dfe4db] transition-colors">
                  Tinjau
                </button>
              </div>
            </li>
          </ul>
          <button className="w-full mt-4 py-2 text-sm text-[#00652c] font-medium border border-[#00652c]/20 rounded-lg hover:bg-[#00652c]/5 transition-colors duration-300">
            Lihat Semua Persetujuan
          </button>
        </div>

        {/* Upcoming Events Timeline */}
        <div className="lg:col-span-1 bg-[#ffffff] border border-[#E5E7EB] rounded-[18px] p-6 shadow-sm opacity-0 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.4s_forwards] flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[18px] leading-[1.4] font-semibold text-[#111827]">
              Acara Mendatang
            </h3>
            <button className="text-[#00652c] hover:bg-[#00652c]/10 p-1 rounded transition-colors duration-300">
              <Calendar className="w-5 h-5" />
            </button>
          </div>
          <div className="relative flex-1 pl-4 border-l-2 border-[#dfe4db] space-y-6">
            {/* Event 1 */}
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#D4AF37] ring-4 ring-[#ffffff]"></div>
              <p className="text-xs text-[#6B7280] mb-1">Besok, 08:00 - 10:00</p>
              <h4 className="text-sm font-medium text-[#111827]">
                Rapat Komite Sekolah
              </h4>
              <p className="text-xs text-[#6B7280] mt-1 flex items-center gap-1">
                <span>📍</span> Ruang Aula Utama
              </p>
            </div>
            {/* Event 2 */}
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#00652c] ring-4 ring-[#ffffff]"></div>
              <p className="text-xs text-[#6B7280] mb-1">Jumat, 27 Okt</p>
              <h4 className="text-sm font-medium text-[#111827]">
                Pembagian Raport Tengah Semester
              </h4>
              <p className="text-xs text-[#6B7280] mt-1 flex items-center gap-1">
                <Users className="w-[14px] h-[14px]" /> Semua Wali Kelas
              </p>
            </div>
            {/* Event 3 */}
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#2563EB] ring-4 ring-[#ffffff]"></div>
              <p className="text-xs text-[#6B7280] mb-1">Senin, 30 Okt</p>
              <h4 className="text-sm font-medium text-[#111827]">
                Upacara Hari Sumpah Pemuda
              </h4>
              <p className="text-xs text-[#6B7280] mt-1 flex items-center gap-1">
                <span>🚩</span> Lapangan Upacara
              </p>
            </div>
          </div>
        </div>

        {/* Recent Logs Data Table */}
        <div className="lg:col-span-1 bg-[#ffffff] border border-[#E5E7EB] rounded-[18px] shadow-sm flex flex-col overflow-hidden opacity-0 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.5s_forwards]">
          <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
            <h3 className="text-[18px] leading-[1.4] font-semibold text-[#111827]">
              Log Aktivitas Terbaru
            </h3>
            <button className="text-sm text-[#00652c] font-medium hover:underline hover:text-[#00652c]/80 transition-colors duration-300">
              Lihat Semua
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f0f5ec]/50 text-[#6B7280] text-[13px] leading-[1.4] font-medium border-b border-[#E5E7EB]">
                  <th className="px-5 py-3 font-medium">Waktu</th>
                  <th className="px-5 py-3 font-medium">Aksi</th>
                  <th className="px-5 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#E5E7EB]/50">
                {[
                  {
                    time: "10:42 AM",
                    action: "Data Siswa Baru",
                    by: "Admin Op 1",
                    status: "Sukses",
                    statusColor: "success",
                  },
                  {
                    time: "09:15 AM",
                    action: "Update absensi Kls 4A",
                    by: "Guru Wali",
                    status: "Sukses",
                    statusColor: "success",
                  },
                  {
                    time: "Kemarin",
                    action: "Backup sistem",
                    by: "Admin Op 1",
                    status: "Proses",
                    statusColor: "warning",
                  },
                  {
                    time: "Kemarin",
                    action: "Sync DAPODIK",
                    by: "System",
                    status: "Gagal",
                    statusColor: "danger",
                  },
                ].map((log, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[#f0f5ec] transition-colors duration-300 group cursor-pointer"
                  >
                    <td className="px-5 py-3 text-[#6B7280] text-xs">
                      {log.time}
                    </td>
                    <td className="px-5 py-3 text-[#111827] group-hover:text-[#00652c] transition-colors duration-300 text-xs">
                      <div className="font-medium">{log.action}</div>
                      <div className="text-[10px] text-[#6B7280] mt-0.5">
                        Oleh: {log.by}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                          log.statusColor === "success"
                            ? "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20"
                            : log.statusColor === "warning"
                              ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                              : "bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Third Row: 2 Column Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Monthly Attendance Trend Card */}
        <div className="bg-[#ffffff] border border-[#E5E7EB] rounded-[18px] p-6 shadow-sm opacity-0 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.5s_forwards] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[18px] leading-[1.4] font-semibold text-[#111827]">
                Tren Kehadiran Bulanan
              </h3>
              <p className="text-xs text-[#6B7280]">
                Rata-rata kehadiran 6 bulan terakhir
              </p>
            </div>
            <div className="p-2 bg-[#00652c]/10 rounded-lg text-[#00652c]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex-1 min-h-[180px] relative mt-4">
            {/* SVG Area Chart */}
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 400 150"
            >
              <defs>
                <linearGradient
                  id="grad-emerald"
                  x1="0%"
                  x2="0%"
                  y1="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "#16A34A", stopOpacity: 0.2 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#16A34A", stopOpacity: 0 }}
                  />
                </linearGradient>
              </defs>
              {/* Area Fill */}
              <path
                d="M0,120 C50,110 80,130 120,90 C160,50 200,70 250,40 C300,10 350,30 400,20 L400,150 L0,150 Z"
                fill="url(#grad-emerald)"
              />
              {/* Line */}
              <path
                d="M0,120 C50,110 80,130 120,90 C160,50 200,70 250,40 C300,10 350,30 400,20"
                fill="none"
                stroke="#16A34A"
                strokeLinecap="round"
                strokeWidth="3"
              />
              {/* Data Points */}
              <circle cx="120" cy="90" fill="#16A34A" r="4" />
              <circle cx="250" cy="40" fill="#16A34A" r="4" />
              <circle cx="400" cy="20" fill="#16A34A" r="4" />
            </svg>
            <div className="flex justify-between mt-4 text-[10px] text-[#6B7280] font-medium">
              <span>Mei</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Ags</span>
              <span>Sep</span>
              <span>Okt</span>
            </div>
          </div>
        </div>

        {/* Average Grade Distribution Card */}
        <div className="bg-[#ffffff] border border-[#E5E7EB] rounded-[18px] p-6 shadow-sm opacity-0 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.5s_forwards] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[18px] leading-[1.4] font-semibold text-[#111827]">
                Distribusi Nilai Rata-rata
              </h3>
              <p className="text-xs text-[#6B7280]">
                Performa akademik per mata pelajaran
              </p>
            </div>
            <div className="p-2 bg-[#00652c]/10 rounded-lg text-[#00652c]">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {[
              { subject: "Matematika", score: 88 },
              { subject: "IPA", score: 92 },
              { subject: "Bahasa Indonesia", score: 85 },
              { subject: "Al-Qur'an Hadits", score: 95 },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#111827]">{item.subject}</span>
                  <span className="text-[#00652c]">{item.score}</span>
                </div>
                <div className="w-full bg-[#dfe4db] rounded-full h-2">
                  <div
                    className="bg-[#00652c] h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
