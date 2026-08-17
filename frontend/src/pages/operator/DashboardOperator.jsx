import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import { useAuth } from "../../contexts/AuthContext";

// ── Fetch helpers ──────────────────────────────────────────────────────────────
const fetchStats = async () => {
  const [siswa, guru, users, pending] = await Promise.all([
    api.get("/operator/master-data/siswa", { params: { per_page: 1 } }).then((r) => r.data),
    api.get("/operator/master-data/guru", { params: { per_page: 1 } }).then((r) => r.data),
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
    <div className="flex-1 flex flex-col min-h-full w-full">
      {/* ── Content Canvas ── */}
      <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full flex flex-col gap-8">

      {/* ── 1. Header Section ──────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col md:flex-row justify-between items-center gap-8 p-8 rounded-[1.5rem] border border-white/20 shadow-xl overflow-hidden"
        style={{ background: "rgba(248,250,249,0.4)", backdropFilter: "blur(16px)" }}
      >
        {/* Decorative blob */}
        <div
          className="absolute -left-8 -top-5 w-32 h-32 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(105,255,135,0.1)" }}
        />
        {/* Welcome text */}
        <div className="relative z-10 flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-4 flex-wrap">
            <h2
              className="font-extrabold text-[#00342b] tracking-tight text-3xl md:text-4xl"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Selamat Datang{" "}
              <span className="italic font-normal text-[#3ce36a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Kembali
              </span>
              , {user?.nama_lengkap?.split(" ")[0] || "Admin"}!
            </h2>
            <span className="text-4xl inline-block transform rotate-12 animate-pulse drop-shadow-[0_0_10px_rgba(105,255,135,0.4)]">
              👋
            </span>
          </div>
          <p className="text-[#3f4945]/80 text-lg leading-relaxed">
            Pantau dan kelola operasional madrasah dengan efisiensi tinggi hari ini.
          </p>
        </div>

        {/* Academic Status Card */}
        <div className="relative z-10 group">
          <div
            className="absolute inset-0 rounded-2xl blur-xl transition-all duration-500 pointer-events-none"
            style={{ background: "rgba(105,255,135,0.2)" }}
          />
          <div
            className="relative border border-[#69ff87]/30 rounded-2xl p-5 flex items-center gap-5 min-w-[300px] md:min-w-[320px] shadow-lg transition-all"
            style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)" }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
              style={{ background: "#00342b" }}
            >
              <span className="material-symbols-outlined text-[#69ff87] text-[32px]">calendar_today</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold text-[#065043] uppercase tracking-[0.2em]">Status Akademik</p>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#69ff87] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#69ff87]" />
                </span>
              </div>
              <h3 className="font-bold text-[#00342b] text-xl leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                2026/2027
              </h3>
              <p className="text-sm font-medium text-[#065043] mt-1">Semester Ganjil</p>
              <div className="mt-2 pt-2 border-t border-[#bfc9c4]/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px] text-[#707975]">event_available</span>
                <span className="text-[11px] text-[#3f4945] font-medium">Mulai 13 Juli 2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Statistik Utama ──────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Academic Performance Trend (8 cols) */}
        <div
          className="lg:col-span-8 rounded-3xl p-6 border border-white/40 shadow-sm flex flex-col relative overflow-hidden group"
          style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", height: "400px" }}
        >
          <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(0,52,43,0.05)" }} />
          <div className="flex justify-between items-start mb-8 relative z-10 flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-[#00342b] text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Academic Performance Trend
              </h3>
              <p className="text-xs text-[#3f4945]">Student growth &amp; engagement over last 6 months</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00342b]/10 text-[#00342b] text-[10px] font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#00342b]" /> Growth
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006e2a]/10 text-[#006e2a] text-[10px] font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#006e2a]" /> Target
              </span>
            </div>
          </div>
          <div className="flex-1 relative flex items-end gap-1 px-2">
            <svg className="absolute inset-0 w-full h-full px-6 pb-12" preserveAspectRatio="none" viewBox="0 0 800 200">
              <defs>
                <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#004d40" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#004d40" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,150 Q100,120 200,140 T400,80 T600,100 T800,40"
                fill="none" stroke="#004d40" strokeLinecap="round" strokeWidth="4"
                className="transition-all duration-300 hover:stroke-[6] cursor-pointer"
              />
              <path d="M0,150 Q100,120 200,140 T400,80 T600,100 T800,40 L800,200 L0,200 Z" fill="url(#lineGradient)" />
              <circle cx="200" cy="140" fill="#004d40" r="6" stroke="white" strokeWidth="2" className="cursor-pointer" />
              <circle cx="400" cy="80" fill="#004d40" r="6" stroke="white" strokeWidth="2" className="cursor-pointer" />
              <circle cx="600" cy="100" fill="#004d40" r="6" stroke="white" strokeWidth="2" className="cursor-pointer" />
              <circle cx="800" cy="40" fill="#004d40" r="6" stroke="white" strokeWidth="2" className="cursor-pointer" />
            </svg>
            <div className="absolute bottom-4 left-0 w-full flex justify-between px-6 text-[10px] font-bold text-[#3f4945] uppercase tracking-widest">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            </div>
          </div>
        </div>

        {/* Right metrics (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Mini Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total Students */}
            <div
              className="rounded-3xl p-5 shadow-lg relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(0,200,83,0.15)] cursor-pointer"
              style={{ background: "#00342b" }}
            >
              <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 z-20 pointer-events-none" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-[#94d3c1] uppercase tracking-widest mb-1">Total Siswa</p>
                <h4 className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {loadingStats ? "—" : stats?.totalSiswa?.toLocaleString() ?? "1,248"}
                </h4>
                <div className="mt-2 h-8 w-full flex items-end gap-0.5">
                  <div className="flex-1 bg-white/20 rounded-t-sm" style={{ height: "40%" }} />
                  <div className="flex-1 bg-white/20 rounded-t-sm" style={{ height: "60%" }} />
                  <div className="flex-1 bg-white/40 rounded-t-sm" style={{ height: "50%" }} />
                  <div className="flex-1 bg-[#69ff87] rounded-t-sm" style={{ height: "90%" }} />
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-6xl text-white">groups</span>
              </div>
            </div>
            {/* Active Teachers */}
            <div
              className="rounded-3xl p-5 shadow-sm relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(0,200,83,0.15)] cursor-pointer border border-white/40"
              style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}
            >
              <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 z-20 pointer-events-none" />
              <p className="text-[10px] font-bold text-[#3f4945] uppercase tracking-widest mb-1">Total Guru</p>
              <h4 className="text-3xl font-extrabold text-[#00342b]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {loadingStats ? "—" : stats?.totalGuru ?? "52"}
              </h4>
              <p className="text-[10px] text-[#006e2a] font-bold mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">check_circle</span> 92% Hadir
              </p>
            </div>
          </div>

          {/* Student Demographics Doughnut */}
          <div
            className="flex-1 rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(0,200,83,0.15)] cursor-pointer border border-white/40"
            style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}
          >
            <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 z-20 pointer-events-none" />
            <h3 className="font-bold text-[#00342b] text-sm mb-4">Student Demographics</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 transition-transform duration-500 group-hover:scale-110">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="transparent" r="40" stroke="#e1e3e2" strokeWidth="12" />
                  <circle cx="50" cy="50" fill="transparent" r="40" stroke="#00342b" strokeDasharray="150 251.2" strokeWidth="12" />
                  <circle cx="50" cy="50" fill="transparent" r="40" stroke="#3ce36a" strokeDasharray="101.2 251.2" strokeDashoffset="-150" strokeWidth="12" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#00342b]">Ratio</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00342b]" />
                  <span className="text-xs font-medium text-[#191c1c]">Laki-laki (60%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#3ce36a]" />
                  <span className="text-xs font-medium text-[#191c1c]">Perempuan (40%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Attendance Area Chart (full width) */}
        <div
          className="lg:col-span-12 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group border border-white/50"
          style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)" }}
        >
          <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full blur-[100px] pointer-events-none" style={{ background: "rgba(105,255,135,0.1)" }} />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 relative z-10 gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-[#00342b] text-2xl tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Teacher Attendance &amp; Workload
              </h3>
              <p className="text-sm text-[#3f4945]/70">Weekly overview of faculty engagement and classroom hours</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-t from-[#00342b] to-[#69ff87] shadow-[0_0_8px_rgba(105,255,135,0.4)]" />
                <span className="text-[11px] font-bold text-[#3f4945] uppercase tracking-widest">Attendance</span>
              </div>
              <a href="#" className="group/link flex items-center gap-2 px-4 py-2 bg-[#00342b]/5 hover:bg-[#00342b] text-[#006e2a] hover:text-white rounded-full transition-all duration-300 border border-[#006e2a]/20 text-xs font-bold uppercase tracking-wider">
                View Full Report
                <span className="material-symbols-outlined text-sm transition-transform group-hover/link:translate-x-1">arrow_forward</span>
              </a>
            </div>
          </div>
          <div className="relative h-64 w-full z-10 px-2 mt-4">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 200">
              <defs>
                <linearGradient id="attendanceGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#00c853" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#004d40" stopOpacity="0" />
                </linearGradient>
                <filter id="auraGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <path d="M0,160 Q133,120 266,140 T533,80 T800,100 L800,200 L0,200 Z" fill="url(#attendanceGradient)" />
              <path d="M0,160 Q133,120 266,140 T533,80 T800,100" fill="none" stroke="#00c853" strokeLinecap="round" strokeWidth="4" filter="url(#auraGlow)" />
              <circle cx="0" cy="160" fill="#00c853" r="5" stroke="white" strokeWidth="2" />
              <circle cx="133" cy="120" fill="#00c853" r="5" stroke="white" strokeWidth="2" />
              <circle cx="266" cy="140" fill="#00c853" r="5" stroke="white" strokeWidth="2" />
              <circle cx="400" cy="100" fill="#00c853" r="5" stroke="white" strokeWidth="2" />
              <circle cx="533" cy="80" fill="#00c853" r="5" stroke="white" strokeWidth="2" />
              <circle cx="666" cy="110" fill="#00c853" r="5" stroke="white" strokeWidth="2" />
              <circle cx="800" cy="100" fill="#00c853" r="5" stroke="white" strokeWidth="2" />
            </svg>
            <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 text-[11px] font-bold text-[#3f4945] uppercase tracking-widest">
              <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Ringkasan Akademik & Data Visualizations ──────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Distribusi Siswa - Bar Chart */}
        <div
          className="rounded-3xl p-8 border border-white/50 shadow-xl flex flex-col relative overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-[#69ff87]/20"
          style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", height: "450px" }}
        >
          <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full blur-[100px] pointer-events-none" style={{ background: "rgba(105,255,135,0.1)" }} />
          <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none">
            <span className="material-symbols-outlined text-[120px]" style={{ transform: "rotate(12deg)" }}>grid_view</span>
          </div>
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006e2a] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006e2a]" />
                </span>
                <span className="text-[10px] font-bold text-[#006e2a] uppercase tracking-widest">Live Data</span>
              </div>
              <h3 className="font-extrabold text-[#00342b] text-2xl tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Distribusi{" "}
                <span className="italic font-normal text-[#3ce36a]">Siswa</span>{" "}
                per Kelas
              </h3>
              <p className="text-sm text-[#3f4945]/70 font-medium">Populasi aktif semester ganjil 2026/2027</p>
            </div>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-[#707975] hover:text-[#00342b] hover:bg-[#69ff87]/20 transition-all border border-[#bfc9c4]/20" style={{ background: "rgba(236,238,237,0.5)" }}>
              <span className="material-symbols-outlined text-[20px]">analytics</span>
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-end relative z-10">
            <div className="relative flex-1 flex items-end justify-around gap-4 px-2 pb-10 mt-6">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-10 pt-4 z-0">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-full h-[1px]" style={{ background: "rgba(191,201,196,0.1)" }} />
                ))}
              </div>
              {/* Bars */}
              <div className="relative flex-1 flex items-end justify-around gap-3 md:gap-5 w-full h-full z-10">
                {[
                  { label: "K1", val: 124, pct: 60 },
                  { label: "K2", val: 118, pct: 50 },
                  { label: "K3", val: 130, pct: 70 },
                  { label: "K4", val: 122, pct: 55 },
                  { label: "K5", val: 115, pct: 45 },
                  { label: "K6", val: 128, pct: 65 },
                ].map((bar) => (
                  <div key={bar.label} className="flex-1 flex flex-col items-center gap-2 group/bar cursor-pointer h-full justify-end">
                    <span className="text-[12px] font-bold text-[#00342b] opacity-0 group-hover/bar:opacity-100 transition-all duration-300 translate-y-2 group-hover/bar:translate-y-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {bar.val}
                    </span>
                    <div
                      className="relative w-full max-w-[40px] rounded-t-xl transition-all duration-500 hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,200,83,0.4)] shadow-sm"
                      style={{
                        height: `${bar.pct}%`,
                        background: "linear-gradient(to top, #006e2a, #69ff87)",
                      }}
                    />
                    <span className="text-[11px] font-bold text-[#3f4945] group-hover/bar:text-[#00342b] transition-colors uppercase tracking-widest mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-12 pt-6 border-t border-[#bfc9c4]/20 flex-wrap px-4 pb-2 mt-4 items-center">
              <div className="flex items-center gap-3 group cursor-default">
                <div className="w-3 h-3 rounded-full bg-[#00342b] shadow-md transition-transform group-hover:scale-125" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#3f4945]/60 uppercase tracking-widest leading-none mb-1">Laki-laki</span>
                  <span className="text-sm font-extrabold text-[#00342b]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>642</span>
                </div>
              </div>
              <div className="flex items-center gap-3 group cursor-default">
                <div className="w-3 h-3 rounded-full bg-[#3ce36a] shadow-md transition-transform group-hover:scale-125" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#3f4945]/60 uppercase tracking-widest leading-none mb-1">Perempuan</span>
                  <span className="text-sm font-extrabold text-[#00342b]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>606</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Distribusi Guru - Donut Chart */}
        <div
          className="rounded-3xl p-8 border border-white/50 shadow-xl flex flex-col relative overflow-hidden group transition-all duration-500 hover:shadow-2xl"
          style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", minHeight: "450px" }}
        >
          <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full blur-[100px] pointer-events-none" style={{ background: "rgba(0,52,43,0.05)" }} />
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-[#00342b] text-2xl tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Distribusi <span className="italic font-normal text-[#3ce36a]">Guru</span> &amp; Staff
              </h3>
              <p className="text-sm text-[#3f4945]/70 font-medium">Komposisi tenaga kependidikan</p>
            </div>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-[#707975] hover:text-[#00342b] hover:bg-[#69ff87]/20 transition-all border border-[#bfc9c4]/20" style={{ background: "rgba(236,238,237,0.5)" }}>
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10 w-full">
            {/* Donut */}
            <div className="relative w-48 h-48 group shrink-0 transition-transform duration-500 group-hover:scale-110">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#eceeed" strokeWidth="10" />
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#00342b" strokeDasharray="115.6 251.2" strokeDashoffset="0" strokeLinecap="round" strokeWidth="12" className="transition-all duration-1000" />
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#006e2a" strokeDasharray="77.8 251.2" strokeDashoffset="-115.6" strokeLinecap="round" strokeWidth="12" className="transition-all duration-1000" />
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#3ce36a" strokeDasharray="37.7 251.2" strokeDashoffset="-193.4" strokeLinecap="round" strokeWidth="12" className="transition-all duration-1000" />
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#bfc9c4" strokeDasharray="20.1 251.2" strokeDashoffset="-231.1" strokeLinecap="round" strokeWidth="12" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-[#00342b] leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {loadingStats ? "—" : stats?.totalGuru ?? "52"}
                </span>
                <span className="text-[10px] font-bold text-[#3f4945] uppercase tracking-widest mt-1">Total</span>
              </div>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full px-2 justify-items-center">
              {[
                { color: "#00342b", label: "Guru Tetap", pct: "46% (24)" },
                { color: "#006e2a", label: "Guru Kelas", pct: "31% (16)" },
                { color: "#3ce36a", label: "Guru Mapel", pct: "15% (8)" },
                { color: "#bfc9c4", label: "Staff Admin", pct: "8% (4)" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-[#00342b] leading-none">{item.label}</span>
                    <span className="text-[11px] font-medium text-[#3f4945]">{item.pct}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Data Health & Status ──────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* EMIS Card */}
        <div
          className="rounded-[2.5rem] p-8 border border-white/50 shadow-xl relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#69ff87]/20 h-full"
          style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)" }}
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] pointer-events-none" style={{ background: "rgba(105,255,135,0.05)" }} />
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-[#00342b] text-2xl tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Status Kelengkapan{" "}
                <span className="italic font-normal text-[#3ce36a]">Data EMIS</span>
              </h3>
              <p className="text-sm text-[#3f4945]/70 font-medium">Sinkronisasi terakhir: Hari ini, 08:30 WIB</p>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500"
              style={{ background: "rgba(105,255,135,0.2)" }}
            >
              <span className="material-symbols-outlined text-[#006e2a] text-3xl animate-pulse">cloud_done</span>
            </div>
          </div>

          <div className="flex flex-col gap-6 flex-1 relative z-10">
            {[
              { label: "Data Siswa Aktif", pct: 100, color: "from-[#00342b] to-[#006e2a]", badge: "text-[#006e2a] bg-[#006e2a]/10" },
              { label: "Profil & Penugasan Guru", pct: 98, color: "from-[#006e2a] to-[#3ce36a]", badge: "text-[#3ce36a] bg-[#69ff87]/10" },
              { label: "Kapasitas & Fasilitas Kelas", pct: 92, color: "from-[#00342b] to-[#94d3c1]", badge: "text-[#94d3c1] bg-[#00342b]/5" },
              { label: "Validasi Akun Orang Tua", pct: 86, color: "from-[#3f2900] to-[#ffba3b]", badge: "text-[#ffba3b] bg-[#3f2900]/5" },
              { label: "Dokumen Pendukung Guru", pct: 67, color: "from-[#ba1a1a] to-[#ffdad6]", badge: "text-[#ba1a1a] bg-[#ba1a1a]/10", warn: true },
            ].map((item) => (
              <div key={item.label} className="group/item hover:bg-[#00342b]/5 p-2 -mx-2 rounded-xl transition-all duration-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-[#00342b]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.label}</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${item.badge}`}>{item.pct}%</span>
                </div>
                <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: "#eceeed" }}>
                  <div
                    className={`bg-gradient-to-r ${item.color} h-full rounded-full transition-all duration-1000 group-hover/item:shadow-[0_0_15px_rgba(105,255,135,0.5)] group-hover/item:brightness-110`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                {item.warn && (
                  <div className="flex items-center gap-2 mt-2 p-2 rounded-lg border border-[#ba1a1a]/10" style={{ background: "rgba(186,26,26,0.05)" }}>
                    <span className="material-symbols-outlined text-[#ba1a1a] text-sm">info</span>
                    <p className="text-[10px] text-[#ba1a1a] font-bold uppercase tracking-wider">
                      17 guru belum upload sertifikat pendidik
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            className="w-full py-4 text-white font-bold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_25px_-5px_rgba(0,52,43,0.3)] hover:shadow-[0_20px_35px_-5px_rgba(105,255,135,0.3)] hover:scale-[1.02] hover:brightness-110 transition-all duration-500 relative overflow-hidden group z-10 mt-12"
            style={{ background: "linear-gradient(to right, #00342b, #00342b)" }}
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <span className="material-symbols-outlined text-[20px]">analytics</span>
            <span>Lihat Detail Data EMIS</span>
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
          </button>
        </div>

        {/* Activity Log Card */}
        <div
          className="rounded-[2.5rem] p-8 border border-white/50 shadow-xl flex flex-col relative overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-[#00342b]/5 h-full"
          style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)" }}
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] pointer-events-none" style={{ background: "rgba(105,255,135,0.05)" }} />
          <div className="flex justify-between items-center mb-10 relative z-10">
            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-[#00342b] text-2xl tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Log Aktivitas{" "}
                <span className="italic font-normal text-[#3ce36a]">Terbaru</span>
              </h3>
              <p className="text-sm text-[#3f4945]/70 font-medium">Pantauan sistem real-time</p>
            </div>
            <button className="px-5 py-2 text-[#006e2a] text-[11px] font-bold uppercase tracking-widest rounded-full border border-[#006e2a]/20 transition-all shadow-sm hover:shadow-md hover:bg-[#006e2a]/10" style={{ background: "rgba(0,110,42,0.05)" }}>
              Semua Log
            </button>
          </div>
          <div className="relative flex-1 overflow-y-auto pr-3 -mr-3 z-10" style={{ scrollbarWidth: "thin" }}>
            <div className="absolute left-[43px] top-8 bottom-8 w-[1px] border-l border-dashed border-[#006e2a]/20" />
            <div className="flex flex-col gap-8">
              {[
                {
                  icon: "person_add", bg: "bg-[#006e2a]/10", text: "text-[#006e2a]",
                  tag: "Pendaftaran", tagStyle: "text-[#006e2a] bg-[#006e2a]/10",
                  time: "5m lalu",
                  desc: <>Operator <span className="font-bold text-[#00342b]">Ahmad Reza</span> menambahkan data guru baru <span className="inline-block text-[11px] bg-[#00342b]/5 px-2 py-0.5 rounded font-mono text-[#00342b] border border-[#00342b]/10 ml-1">NIP: 198502...</span></>
                },
                {
                  icon: "sync_alt", bg: "bg-[#00342b]/10", text: "text-[#00342b]",
                  tag: "Sistem", tagStyle: "text-[#00342b] bg-[#00342b]/10",
                  time: "23m lalu",
                  desc: <>Sistem melakukan auto-update status <span className="font-bold text-[#006e2a]">42 Siswa</span> ke Kelas 2A.</>
                },
                {
                  icon: "warning", bg: "bg-[#ba1a1a]/10", text: "text-[#ba1a1a]",
                  tag: "Peringatan", tagStyle: "text-[#ba1a1a] bg-[#ba1a1a]/10",
                  time: "1j lalu",
                  desc: <>Peringatan: <span className="font-bold text-[#ba1a1a]">12 Akun Orang Tua</span> belum diverifikasi lebih dari 30 hari.</>,
                  pulse: true,
                },
                {
                  icon: "notifications_active", bg: "bg-[#3f2900]/10", text: "text-[#3f2900]",
                  tag: "Notifikasi", tagStyle: "text-[#3f2900] bg-[#3f2900]/10",
                  time: "2j lalu",
                  desc: <>Notifikasi Pendaftaran: <span className="font-bold text-[#00342b]">3 calon siswa baru</span> mendaftar via portal PPDB Online.</>
                },
              ].map((entry, i) => (
                <div key={i} className="group relative flex gap-6 p-5 rounded-3xl transition-all duration-300 hover:bg-white hover:shadow-2xl hover:shadow-[#00342b]/10 hover:-translate-y-1 cursor-pointer border border-transparent hover:border-[#00342b]/10">
                  <div className={`relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl ${entry.bg} flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-[#00342b] group-hover:text-white transition-all duration-300`}>
                    <span className={`material-symbols-outlined ${entry.text} text-2xl group-hover:text-white transition-colors duration-300 ${entry.pulse ? "animate-pulse" : ""}`}>
                      {entry.icon}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${entry.tagStyle}`}>
                        {entry.tag}
                      </span>
                      <span className="text-[10px] font-medium text-[#3f4945]/60 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">schedule</span> {entry.time}
                      </span>
                    </div>
                    <p className="text-sm text-[#191c1c] leading-relaxed">{entry.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. PPDB & Informasi ──────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* PPDB Overview */}
        <div
          className="rounded-[1.5rem] p-8 border border-white/40 shadow-xl relative overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-[#69ff87]/10"
          style={{
            background: "linear-gradient(to bottom right, #ffffff, rgba(248,250,249,0.5))",
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5z' fill='%23004d40' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E\")",
          }}
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] pointer-events-none" style={{ background: "rgba(105,255,135,0.1)" }} />
          <div className="flex justify-between items-start border-b border-[#bfc9c4]/20 pb-4 mb-4">
            <div>
              <h3 className="font-bold text-[#00342b] text-lg flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <span className="material-symbols-outlined text-[#006e2a]">app_registration</span>
                PPDB 2026/2027
              </h3>
              <p className="text-sm text-[#3f4945] mt-1">Gelombang 1: Dibuka s.d 30 Agustus</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold border border-[#69ff87]/30 shadow-sm uppercase tracking-widest" style={{ background: "rgba(105,255,135,0.1)", color: "#006e2a" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006e2a] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006e2a]" />
              </span>
              Sedang Berjalan
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { icon: "group", color: "text-[#006e2a]", bg: "bg-[#006e2a]/10", label: "Pendaftar", val: "128", accent: "#006e2a" },
              { icon: "pending_actions", color: "text-[#ffba3b]", bg: "bg-[#ffba3b]/10", label: "Menunggu", val: "24", accent: "#ffba3b" },
              { icon: "how_to_reg", color: "text-[#3ce36a]", bg: "bg-[#3ce36a]/10", label: "Diterima", val: "65", accent: "#3ce36a" },
              { icon: "person_remove", color: "text-[#ba1a1a]", bg: "bg-[#ba1a1a]/10", label: "Ditolak", val: "4", accent: "#ba1a1a" },
            ].map((item) => (
              <div key={item.label} className="group/card relative rounded-2xl p-5 border border-white/60 flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-lg cursor-pointer" style={{ background: "rgba(255,255,255,0.4)", backdropFilter: "blur(12px)" }}>
                <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center mb-3 group-hover/card:scale-110 transition-transform duration-500`}>
                  <span className={`material-symbols-outlined ${item.color} text-[22px]`}>{item.icon}</span>
                </div>
                <p className="text-[10px] font-bold text-[#3f4945]/70 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-3xl font-extrabold text-[#00342b] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.val}</p>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-t-full opacity-40 group-hover/card:w-20 transition-all duration-500" style={{ background: item.accent }} />
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="mb-8 relative z-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-[#006e2a] uppercase tracking-widest">Progress Harian</span>
              <span className="text-[10px] font-bold text-[#3f4945]">85% Target</span>
            </div>
            <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "#eceeed" }}>
              <div
                className="h-full rounded-full shadow-[0_0_10px_rgba(105,255,135,0.4)]"
                style={{ width: "85%", background: "linear-gradient(to right, #00342b, #69ff87)" }}
              />
            </div>
          </div>

          <button
            className="w-full flex items-center justify-center gap-3 py-4 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-500 relative overflow-hidden group"
            style={{ background: "linear-gradient(to right, #00342b, #006e2a)" }}
          >
            Kelola PPDB Sekarang
            <span className="material-symbols-outlined text-sm transition-transform duration-500 group-hover:translate-x-2">arrow_forward</span>
          </button>
        </div>

        {/* Informasi & Pengumuman */}
        <div
          className="rounded-[1.5rem] p-6 border border-[#bfc9c4]/30 shadow-sm flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,52,43,0.15)] hover:border-[#00342b]/20"
          style={{ background: "#ffffff" }}
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] pointer-events-none" style={{ background: "rgba(105,255,135,0.05)" }} />
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-[#00342b] text-2xl tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Informasi &amp;{" "}
                <span className="italic font-normal text-[#3ce36a]">Pengumuman</span>
              </h3>
              <p className="text-sm text-[#3f4945]/70 font-medium">Update terkini untuk civitas madrasah</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#00342b]/5 flex items-center justify-center text-[#00342b]">
              <span className="material-symbols-outlined text-[24px]">campaign</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-4 relative z-10">
            {[
              { icon: "dns", color: "text-[#006e2a]", bg: "bg-[#006e2a]/10", accent: "#69ff87", tag: "Penting", tagStyle: "text-[#006e2a] bg-[#006e2a]/10", date: "25 Juli 2026", title: "Jadwal Maintenance Server Kemenag", hoverBorder: "#69ff87" },
              { icon: "event_busy", color: "text-[#ba1a1a]", bg: "bg-[#ba1a1a]/10", accent: "#ba1a1a", tag: "Segera", tagStyle: "text-[#ba1a1a] bg-[#ba1a1a]/10", date: "Kemarin", title: "Batas Akhir Input Nilai PTS", hoverBorder: "#ba1a1a" },
              { icon: "groups", color: "text-[#3f2900]", bg: "bg-[#3f2900]/10", accent: "#ffba3b", tag: "Internal", tagStyle: "text-[#3f2900] bg-[#3f2900]/10", date: "3 hari lalu", title: "Persiapan Rapat Evaluasi Kurikulum", hoverBorder: "#ffba3b" },
            ].map((item, i) => (
              <div key={i} className="group relative flex items-center gap-5 p-4 rounded-2xl border border-white/60 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden" style={{ background: "rgba(255,255,255,0.5)" }}>
                <div className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: item.accent }} />
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                  <span className={`material-symbols-outlined ${item.color} text-2xl`}>{item.icon}</span>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${item.tagStyle}`}>{item.tag}</span>
                    <span className="text-[10px] font-medium text-[#3f4945]/60">{item.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#00342b] group-hover:text-[#006e2a] transition-colors">{item.title}</h4>
                </div>
                <span className="material-symbols-outlined text-[#bfc9c4] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500">chevron_right</span>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-3 border border-[#bfc9c4]/50 rounded-xl text-xs font-bold text-[#00342b] uppercase tracking-widest hover:bg-[#00342b] hover:text-white hover:border-[#00342b] transition-all duration-300 flex items-center justify-center gap-2">
            Lihat Semua Pengumuman
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </button>
        </div>
      </section>

      {/* ── 6. Quick Actions Floating Bar ──────────────────────────────────────── */}
      <div className="fixed bottom-6 left-4 right-4 md:left-[calc(280px+2rem)] md:right-8 z-30 flex justify-center pointer-events-none">
        <div
          className="border border-white/40 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-2xl p-2 flex gap-2 pointer-events-auto overflow-x-auto max-w-full hover:shadow-[0_20px_50px_rgba(105,255,135,0.2)] transition-all duration-500 animate-pulse hover:animate-none"
          style={{ background: "rgba(248,250,249,0.9)", backdropFilter: "blur(16px)" }}
        >
          <Link to="/operator/master/siswa">
            <button className="flex items-center gap-2 px-4 py-2 text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(105,255,135,0.6)] transition-all whitespace-nowrap text-sm duration-300 group" style={{ background: "#00342b" }}>
              <span className="material-symbols-outlined text-[18px] group-hover:scale-125 transition-transform duration-300">person_add</span>
              Tambah Siswa
            </button>
          </Link>
          <Link to="/operator/master/guru">
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#00342b] border border-[#00342b]/20 rounded-xl font-bold hover:bg-[#00342b]/5 transition-all whitespace-nowrap text-sm hover:-translate-y-1 hover:border-[#006e2a] hover:shadow-[0_0_15px_rgba(105,255,135,0.3)] duration-300 group">
              <span className="material-symbols-outlined text-[18px] group-hover:scale-125 transition-transform duration-300">person_add_alt</span>
              Tambah Guru
            </button>
          </Link>
          <div className="w-[1px] bg-[#bfc9c4]/30 mx-1 h-8 self-center" />
          <Link to="/operator/master/kelas">
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#3f4945] border border-[#bfc9c4]/30 rounded-xl font-medium hover:bg-[#eceeed] hover:text-[#00342b] transition-all whitespace-nowrap text-sm hover:-translate-y-1 hover:border-[#006e2a]/40 hover:shadow-[0_0_15px_rgba(105,255,135,0.2)] duration-300 group">
              <span className="material-symbols-outlined text-[18px] group-hover:scale-125 transition-transform duration-300">add_business</span>
              Kelas Baru
            </button>
          </Link>
          <Link to="/operator/master/mapel">
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#3f4945] border border-[#bfc9c4]/30 rounded-xl font-medium hover:bg-[#eceeed] hover:text-[#00342b] transition-all whitespace-nowrap text-sm hover:-translate-y-1 hover:border-[#006e2a]/40 hover:shadow-[0_0_15px_rgba(105,255,135,0.2)] duration-300 group">
              <span className="material-symbols-outlined text-[18px] group-hover:scale-125 transition-transform duration-300">library_add</span>
              Mapel Baru
            </button>
          </Link>
          <div className="w-[1px] bg-[#bfc9c4]/30 mx-1 h-8 self-center" />
          <Link to="/operator/import-export">
            <button className="flex items-center gap-2 px-4 py-2 text-[#3f4945] hover:text-[#006e2a] hover:bg-[#006e2a]/10 rounded-xl font-medium transition-all whitespace-nowrap text-sm hover:-translate-y-1 hover:shadow-[0_0_10px_rgba(105,255,135,0.15)] duration-300 group">
              <span className="material-symbols-outlined text-[18px] group-hover:scale-125 transition-transform duration-300">upload_file</span>
              Import Data
            </button>
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 text-[#3f4945] hover:text-[#006e2a] hover:bg-[#006e2a]/10 rounded-xl font-medium transition-all whitespace-nowrap text-sm hover:-translate-y-1 hover:shadow-[0_0_10px_rgba(105,255,135,0.15)] duration-300 group">
            <span className="material-symbols-outlined text-[18px] group-hover:scale-125 transition-transform duration-300">download</span>
            Export Laporan
          </button>
        </div>
      </div>

      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────────── */}
      <footer className="w-full py-10 px-8 flex flex-col md:flex-row justify-between items-center bg-white border-t border-[#bfc9c4]/30 mt-auto z-10 font-bold pb-24 md:pb-10 relative overflow-hidden islamic-pattern">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00342b]/5 via-transparent to-[#006e2a]/5 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <span className="font-bold text-[#00342b] tracking-wide text-xs" style={{ letterSpacing: "0.2em" }}>
            © 2026 MI Nurul Huda 3. All rights reserved.
          </span>
          <span className="hidden md:inline text-[#bfc9c4]">•</span>
          <span
            className="text-[#006e2a] font-medium italic text-sm"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Modern Islamic Excellence.
          </span>
        </div>
        <div className="relative z-10 flex gap-8 mt-4 md:mt-0">
          {["Privacy Policy", "Terms of Service", "Help Desk"].map((link) => (
            <a
              key={link}
              href="#"
              className="group flex items-center gap-1 text-[#3f4945] hover:text-[#006e2a] transition-all duration-300 hover:-translate-y-0.5 text-xs font-bold"
              style={{ letterSpacing: "0.15em" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#006e2a] opacity-0 group-hover:opacity-100 transition-opacity" />
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
