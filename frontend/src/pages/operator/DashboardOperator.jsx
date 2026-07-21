import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import { useAuth } from "../../contexts/AuthContext";

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
    <div className="w-full space-y-space-lg pb-24 md:pb-gutter">
      {/* ── 1. Welcome Section ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 opacity-0 animate-fade-up">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-text-primary tracking-tight">
            Selamat Datang, {user?.nama_lengkap || "Admin Operator"}
          </h2>
          <p className="font-body-lg text-body-lg text-text-secondary mt-1">
            {today}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-1.5 rounded-full border border-success/20 w-fit shrink-0">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-xs font-semibold">System status: Healthy</span>
        </div>
      </div>

      {/* ── 2. Statistics Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Stat 1 — Total Siswa */}
        <div className="bg-surface-container-lowest border border-border-light rounded-[18px] p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group opacity-0 animate-fade-up animate-delay-100 cursor-pointer">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-150" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-md text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined text-lg">
                  school
                </span>
              </div>
              <span className="font-label-md text-label-md text-text-secondary">
                Total Siswa
              </span>
            </div>
            <span className="text-xs font-medium text-success bg-success/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px]">
                trending_up
              </span>{" "}
              +5%
            </span>
          </div>
          <div className="flex items-end justify-between relative z-10">
            <p className="font-headline-md text-headline-md font-bold text-text-primary">
              {loadingStats ? "—" : stats?.totalSiswa}
            </p>
            <div className="w-16 h-8 opacity-60">
              <svg
                className="w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 30"
              >
                <path
                  d="M0,25 C20,25 30,15 50,20 C70,25 80,5 100,10"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Stat 2 — Total Guru */}
        <div className="bg-surface-container-lowest border border-border-light rounded-[18px] p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group opacity-0 animate-fade-up animate-delay-200 cursor-pointer">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-150" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-md text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined text-lg">badge</span>
              </div>
              <span className="font-label-md text-label-md text-text-secondary">
                Total Guru
              </span>
            </div>
            <span className="text-xs font-medium text-text-secondary bg-surface-container-highest px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px]">
                horizontal_rule
              </span>{" "}
              0%
            </span>
          </div>
          <div className="flex items-end justify-between relative z-10">
            <p className="font-headline-md text-headline-md font-bold text-text-primary">
              {loadingStats ? "—" : stats?.totalGuru}
            </p>
            <div className="w-16 h-8 opacity-60">
              <svg
                className="w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 30"
              >
                <path
                  d="M0,15 L100,15"
                  fill="none"
                  stroke="#6B7280"
                  strokeDasharray="2,2"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Stat 3 — Kapasitas */}
        <div className="bg-surface-container-lowest border border-border-light rounded-[18px] p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group opacity-0 animate-fade-up animate-delay-300 cursor-pointer">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-150" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-md text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined text-lg">
                  meeting_room
                </span>
              </div>
              <span className="font-label-md text-label-md text-text-secondary">
                Kapasitas
              </span>
            </div>
            <span className="text-xs font-medium text-text-secondary">
              85% Penuh
            </span>
          </div>
          <div className="mt-2 relative z-10">
            <div className="flex justify-between items-end mb-1">
              <p className="font-headline-md text-headline-md font-bold text-text-primary">
                {loadingKelas ? "—" : kelasList.length}{" "}
                <span className="text-sm font-normal text-text-secondary">
                  Kelas
                </span>
              </p>
              <span className="text-xs text-text-secondary">342/400</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-2">
              <div
                className="bg-primary h-1.5 rounded-full"
                style={{ width: "85%" }}
              />
            </div>
          </div>
        </div>

        {/* Stat 4 — Pendapatan */}
        <div className="bg-surface-container-lowest border border-border-light rounded-[18px] p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group opacity-0 animate-fade-up animate-delay-400 cursor-pointer">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-150" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-md text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined text-lg">
                  account_balance_wallet
                </span>
              </div>
              <span className="font-label-md text-label-md text-text-secondary">
                Pendapatan
              </span>
            </div>
            <span className="text-xs font-medium text-success bg-success/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px]">
                trending_up
              </span>{" "}
              +12%
            </span>
          </div>
          <div className="flex items-end justify-between relative z-10 mt-1">
            <p className="font-headline-md text-headline-md font-bold text-text-primary">
              Rp 45Jt
            </p>
            <div className="w-16 h-8 opacity-60">
              <svg
                className="w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 30"
              >
                <path
                  d="M0,28 C20,25 30,15 50,18 C70,22 80,5 100,2"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Stat 5 — Tahun Ajaran */}
        <div className="bg-surface-container-lowest border border-border-light rounded-[18px] p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden col-span-2 sm:col-span-1 opacity-0 animate-fade-up animate-delay-500 cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <span className="material-symbols-outlined text-xl">
                calendar_today
              </span>
            </div>
            <span className="font-label-md text-label-md text-text-secondary">
              Tahun Ajaran
            </span>
          </div>
          <p className="font-section-title text-section-title font-semibold text-text-primary mt-1">
            2023/2024
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-md">
              Semester Ganjil
            </span>
            <span className="text-xs text-text-secondary">Minggu ke-12</span>
          </div>
        </div>

        {/* Stat 6 — Presensi (highlight + shimmer) */}
        <div className="bg-primary border border-primary-container rounded-[18px] p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden col-span-2 sm:col-span-1 text-on-primary opacity-0 animate-fade-up animate-delay-500 cursor-pointer">
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[18px]">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12" />
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="p-2 bg-white/20 rounded-lg">
              <span className="material-symbols-outlined text-xl">
                how_to_reg
              </span>
            </div>
            <span className="font-label-md text-label-md opacity-90">
              Presensi Hari Ini
            </span>
          </div>
          <div className="flex flex-col relative z-10">
            <div className="flex items-end gap-2 mb-2">
              <p className="font-headline-md text-headline-md font-bold">98%</p>
              <span className="text-xs opacity-80 mb-1">+2% vs kemarin</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-1.5 mt-1">
              <div
                className="bg-white h-1.5 rounded-full"
                style={{ width: "98%" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Row 1: Quick Actions + Financial ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-surface-container-lowest border border-border-light rounded-[18px] p-space-lg shadow-sm opacity-0 animate-fade-up animate-delay-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-section-title text-section-title font-semibold text-text-primary">
              Tindakan Cepat
            </h3>
            <button className="text-primary hover:bg-primary/10 p-1 rounded transition-colors duration-300">
              <span className="material-symbols-outlined text-sm">
                more_horiz
              </span>
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              {
                icon: "upload_file",
                label: "Import",
                to: "/operator/master/siswa",
              },
              {
                icon: "download",
                label: "Export",
                to: "/operator/master/siswa",
              },
              {
                icon: "person_add",
                label: "Tambah Siswa",
                to: "/operator/master/siswa",
              },
              {
                icon: "supervisor_account",
                label: "Tambah Guru",
                to: "/operator/master/guru",
              },
              {
                icon: "class",
                label: "Tambah Kelas",
                to: "/operator/master/kelas",
              },
              {
                icon: "event",
                label: "Kalender",
                to: "/operator/kalender-akademik",
              },
              { icon: "backup", label: "Backup", to: "/operator/backup" },
              { icon: "restore", label: "Restore", to: "/operator/backup" },
            ].map((action, idx) => (
              <Link
                key={idx}
                to={action.to}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-surface-container-low transition-all duration-300 group hover:scale-105 hover:shadow-[0_0_15px_rgba(21,128,61,0.1)]"
              >
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
                  <span className="material-symbols-outlined text-[20px]">
                    {action.icon}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-center text-text-secondary group-hover:text-primary transition-colors duration-300">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Financial Overview */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-border-light rounded-[18px] p-space-lg shadow-sm flex flex-col opacity-0 animate-fade-up animate-delay-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-section-title text-section-title font-semibold text-text-primary">
                Financial Overview
              </h3>
              <p className="text-sm text-text-secondary">
                Pemasukan vs Pengeluaran 6 bulan terakhir
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-primary" />
                <span className="text-xs text-text-secondary">Pemasukan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-warning" />
                <span className="text-xs text-text-secondary">Pengeluaran</span>
              </div>
              <select className="bg-surface-container border border-outline-variant rounded-lg text-sm px-3 py-1.5 focus:ring-primary focus:border-primary transition-all duration-300 hover:bg-surface-container-high cursor-pointer outline-none ml-2">
                <option>6 Bulan Terakhir</option>
                <option>Tahun Ini</option>
              </select>
            </div>
          </div>
          <div className="flex-1 min-h-[220px] bg-surface-container-lowest flex items-end justify-between px-2 pt-4 relative group">
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-text-secondary">
              <span>Rp 50M</span>
              <span>Rp 25M</span>
              <span>0</span>
            </div>
            <div className="absolute left-10 right-0 top-2 bottom-8 flex flex-col justify-between z-0">
              <div className="w-full border-t border-border-light border-dashed" />
              <div className="w-full border-t border-border-light border-dashed" />
              <div className="w-full border-t border-border-light" />
            </div>
            <div className="flex-1 ml-12 h-full flex items-end justify-around pb-8 z-10">
              {[
                { month: "Mei", p: 60, k: 40 },
                { month: "Jun", p: 70, k: 45 },
                { month: "Jul", p: 85, k: 60 },
                { month: "Ags", p: 50, k: 40 },
                { month: "Sep", p: 75, k: 55 },
                { month: "Okt", p: 90, k: 50 },
              ].map((d, i) => (
                <div
                  key={i}
                  className="flex items-end gap-1 h-[90%] relative w-full max-w-[40px]"
                >
                  <div
                    className="w-full bg-primary rounded-t-sm transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{ height: `${d.p}%` }}
                  />
                  <div
                    className="w-full bg-warning rounded-t-sm transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{ height: `${d.k}%` }}
                  />
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-text-secondary">
                    {d.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Row 2: Approvals + Timeline + Log ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Pending Approvals */}
        <div className="lg:col-span-1 bg-surface-container-lowest border border-border-light rounded-[18px] p-space-lg shadow-sm opacity-0 animate-fade-up animate-delay-400 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-section-title text-section-title font-semibold text-text-primary">
              Persetujuan Tertunda
            </h3>
            <span className="bg-warning/10 text-warning text-xs font-bold px-2 py-1 rounded-full">
              5 Baru
            </span>
          </div>
          <ul className="space-y-3 flex-1">
            <li className="flex flex-col p-3 bg-surface-container-low border border-border-light/50 rounded-xl hover:bg-surface-container-high transition-colors duration-300 cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">
                    person_add
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    Registrasi Siswa Baru
                  </span>
                </div>
                <span className="text-[10px] text-text-secondary">
                  2 jam lalu
                </span>
              </div>
              <p className="text-xs text-text-secondary mb-3">
                Ahmad Fauzi - Kelas 1A (Butuh verifikasi dokumen kelulusan)
              </p>
              <div className="flex gap-2 mt-auto">
                <button className="flex-1 bg-primary text-white text-xs py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
                  Setuju
                </button>
                <button className="flex-1 bg-surface-container border border-border-light text-text-primary text-xs py-1.5 rounded-lg hover:bg-surface-container-high transition-colors">
                  Tinjau
                </button>
              </div>
            </li>
            <li className="flex flex-col p-3 bg-surface-container-low border border-border-light/50 rounded-xl hover:bg-surface-container-high transition-colors duration-300 cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-warning text-sm">
                    event_busy
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    Pengajuan Cuti Guru
                  </span>
                </div>
                <span className="text-[10px] text-text-secondary">
                  5 jam lalu
                </span>
              </div>
              <p className="text-xs text-text-secondary mb-3">
                Bpk. Budi Santoso - Sakit (Lampiran surat dokter tersedia)
              </p>
              <div className="flex gap-2 mt-auto">
                <button className="flex-1 bg-primary text-white text-xs py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
                  Setuju
                </button>
                <button className="flex-1 bg-surface-container border border-border-light text-text-primary text-xs py-1.5 rounded-lg hover:bg-surface-container-high transition-colors">
                  Tinjau
                </button>
              </div>
            </li>
          </ul>
          <button className="w-full mt-4 py-2 text-sm text-primary font-medium border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors duration-300">
            Lihat Semua Persetujuan
          </button>
        </div>

        {/* Upcoming Events Timeline */}
        <div className="lg:col-span-1 bg-surface-container-lowest border border-border-light rounded-[18px] p-space-lg shadow-sm opacity-0 animate-fade-up animate-delay-400 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-section-title text-section-title font-semibold text-text-primary">
              Acara Mendatang
            </h3>
            <button className="text-primary hover:bg-primary/10 p-1 rounded transition-colors duration-300">
              <span className="material-symbols-outlined text-sm">
                calendar_month
              </span>
            </button>
          </div>
          <div className="relative flex-1 pl-4 border-l-2 border-surface-container-high space-y-6">
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-accent-gold ring-4 ring-surface-container-lowest" />
              <p className="text-xs text-text-secondary mb-1">
                Besok, 08:00 - 10:00
              </p>
              <h4 className="text-sm font-medium text-text-primary">
                Rapat Komite Sekolah
              </h4>
              <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  location_on
                </span>{" "}
                Ruang Aula Utama
              </p>
            </div>
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-surface-container-lowest" />
              <p className="text-xs text-text-secondary mb-1">Jumat, 27 Okt</p>
              <h4 className="text-sm font-medium text-text-primary">
                Pembagian Raport Tengah Semester
              </h4>
              <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  groups
                </span>{" "}
                Semua Wali Kelas
              </p>
            </div>
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-info ring-4 ring-surface-container-lowest" />
              <p className="text-xs text-text-secondary mb-1">Senin, 30 Okt</p>
              <h4 className="text-sm font-medium text-text-primary">
                Upacara Hari Sumpah Pemuda
              </h4>
              <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  flag
                </span>{" "}
                Lapangan Upacara
              </p>
            </div>
          </div>
        </div>

        {/* Log Aktivitas */}
        <div className="lg:col-span-1 bg-surface-container-lowest border border-border-light rounded-[18px] shadow-sm flex flex-col overflow-hidden opacity-0 animate-fade-up animate-delay-500">
          <div className="p-space-lg border-b border-border-light flex items-center justify-between">
            <h3 className="font-section-title text-section-title font-semibold text-text-primary">
              Log Aktivitas Terbaru
            </h3>
            <button className="text-sm text-primary font-medium hover:underline hover:text-primary/80 transition-colors duration-300">
              Lihat Semua
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 text-text-secondary font-label-md text-label-md border-b border-border-light">
                  <th className="px-5 py-3 font-medium">Waktu</th>
                  <th className="px-5 py-3 font-medium">Aksi</th>
                  <th className="px-5 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-border-light/50">
                {[
                  {
                    time: "10:42 AM",
                    action: "Data Siswa Baru",
                    by: "Admin Op 1",
                    status: "Sukses",
                    color: "success",
                  },
                  {
                    time: "09:15 AM",
                    action: "Update absensi Kls 4A",
                    by: "Guru Wali",
                    status: "Sukses",
                    color: "success",
                  },
                  {
                    time: "Kemarin",
                    action: "Backup sistem",
                    by: "Admin Op 1",
                    status: "Proses",
                    color: "warning",
                  },
                  {
                    time: "Kemarin",
                    action: "Sync DAPODIK",
                    by: "System",
                    status: "Gagal",
                    color: "danger",
                  },
                ].map((log, i) => (
                  <tr
                    key={i}
                    className="hover:bg-surface-container-low transition-colors duration-300 group cursor-pointer"
                  >
                    <td className="px-5 py-3 text-text-secondary text-xs">
                      {log.time}
                    </td>
                    <td className="px-5 py-3 text-text-primary group-hover:text-primary transition-colors duration-300 text-xs">
                      <div className="font-medium">{log.action}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5">
                        Oleh: {log.by}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium
                        ${log.color === "success" ? "bg-success/10 text-success border border-success/20" : ""}
                        ${log.color === "warning" ? "bg-warning/10 text-warning border border-warning/20" : ""}
                        ${log.color === "danger" ? "bg-danger/10 text-danger border border-danger/20" : ""}
                      `}
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

      {/* ── 5. Bottom Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Tren Kehadiran */}
        <div className="bg-surface-container-lowest border border-border-light rounded-[18px] p-space-lg shadow-sm opacity-0 animate-fade-up animate-delay-500 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-section-title text-section-title font-semibold text-text-primary">
                Tren Kehadiran Bulanan
              </h3>
              <p className="text-xs text-text-secondary">
                Rata-rata kehadiran 6 bulan terakhir
              </p>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <span className="material-symbols-outlined text-xl">
                trending_up
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-[180px] relative mt-4">
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
              <path
                d="M0,120 C50,110 80,130 120,90 C160,50 200,70 250,40 C300,10 350,30 400,20 L400,150 L0,150 Z"
                fill="url(#grad-emerald)"
              />
              <path
                d="M0,120 C50,110 80,130 120,90 C160,50 200,70 250,40 C300,10 350,30 400,20"
                fill="none"
                stroke="#16A34A"
                strokeLinecap="round"
                strokeWidth="3"
              />
              <circle cx="120" cy="90" fill="#16A34A" r="4" />
              <circle cx="250" cy="40" fill="#16A34A" r="4" />
              <circle cx="400" cy="20" fill="#16A34A" r="4" />
            </svg>
            <div className="flex justify-between mt-4 text-[10px] text-text-secondary font-medium">
              <span>Mei</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Ags</span>
              <span>Sep</span>
              <span>Okt</span>
            </div>
          </div>
        </div>

        {/* Distribusi Nilai */}
        <div className="bg-surface-container-lowest border border-border-light rounded-[18px] p-space-lg shadow-sm opacity-0 animate-fade-up animate-delay-500 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-section-title text-section-title font-semibold text-text-primary">
                Distribusi Nilai Rata-rata
              </h3>
              <p className="text-xs text-text-secondary">
                Performa akademik per mata pelajaran
              </p>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <span className="material-symbols-outlined text-xl">
                bar_chart
              </span>
            </div>
          </div>
          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {[
              { label: "Matematika", score: 88 },
              { label: "IPA", score: 92 },
              { label: "Bahasa Indonesia", score: 85 },
              { label: "Al-Qur'an Hadits", score: 95 },
            ].map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-text-primary">{item.label}</span>
                  <span className="text-primary">{item.score}</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-outline-variant/30 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-label-md text-label-md text-on-surface-variant">
        <div className="flex-1">
          <p>© 2023 Madrasah Management System. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="hover:text-primary transition-colors duration-200"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="hover:text-primary transition-colors duration-200"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="hover:text-primary transition-colors duration-200"
          >
            Documentation
          </a>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className="w-1.5 h-1.5 bg-success rounded-full" />
          <span className="font-medium opacity-80">v2.4.1</span>
        </div>
      </footer>
    </div>
  );
}
