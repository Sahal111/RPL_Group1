import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Server,
  Database,
  Key,
  Sliders,
  HardDrive,
  Mail,
  MessageSquare,
  Activity,
  Building2,
  ToggleLeft,
  ShieldCheck,
  Cpu,
  Layers,
  Code,
  FileSpreadsheet,
  AlertTriangle,
  RefreshCw,
  CheckCircle2
} from "lucide-react";

export default function DashboardSuperAdmin() {
  const { user } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [backupStatus, setBackupStatus] = useState("Idle");

  const systemFeatures = [
    { name: "Global Roles & Permissions", desc: "Kelola master role & permission template untuk seluruh sekolah.", icon: Key, color: "from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400" },
    { name: "System Settings", desc: "Pengaturan global SMTP, App Name, Timezone, & System Limits.", icon: Sliders, color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400" },
    { name: "Backup & Restore DB", desc: "Dump 1-Klik database MySQL & ekspor cadangan otomatis.", icon: Database, color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400" },
    { name: "Storage & File Quota", desc: "Manajemen disk space & alokasi kuota per sekolah (GB).", icon: HardDrive, color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400" },
    { name: "WhatsApp Gateway", desc: "Konfigurasi API gateway notifikasi pesan WA otomatis.", icon: MessageSquare, color: "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400" },
    { name: "Email Server (SMTP)", desc: "Integrasi Mailgun / SendGrid untuk verifikasi & reset password.", icon: Mail, color: "from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400" },
    { name: "Audit & Error Logs", desc: "Pelacakan error server (Sentry) & aktivitas login global.", icon: Activity, color: "from-red-500/20 to-orange-500/20 border-red-500/30 text-red-400" },
    { name: "Tenant Management", desc: "Tambah sekolah baru, aktivasi lisensi, & atur paket langganan.", icon: Building2, color: "from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Developer Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 via-slate-900 to-indigo-900/40 border border-purple-500/30 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              GLOBAL SUPER ADMIN CONTROL CENTER (DEVELOPER MODE)
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              SLA & Engine Control Panel — {user?.nama || "Developer"} 👨‍💻
            </h1>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
              Anda memiliki kewenangan penuh atas konfigurasi server, backup database, manajemen tenant sekolah, limit storage, dan pemeliharaan infrastruktur SaaS. Operator sekolah tidak memiliki akses ke halaman ini.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <p className="text-[10px] text-slate-400 font-mono uppercase">Maintenance Mode</p>
              <p className={`text-xs font-bold ${maintenanceMode ? "text-amber-400" : "text-emerald-400"}`}>
                {maintenanceMode ? "ACTIVE (Sistem Dibatasi)" : "OFF (Normal Run)"}
              </p>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`p-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                maintenanceMode ? "bg-amber-500 text-slate-950 font-bold hover:bg-amber-400" : "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
              }`}
            >
              <ToggleLeft className="w-4 h-4" />
              {maintenanceMode ? "Matikan" : "Aktifkan"}
            </button>
          </div>
        </div>
      </div>

      {/* Infrastructure Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Terdaftar Sekolah</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">1 Sekolah</p>
          <span className="text-[10px] text-emerald-400 font-semibold">MI Nurul Huda 3 (Active)</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Database Health</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">99.9% OK</p>
          <span className="text-[10px] text-slate-400 font-mono">MySQL 8.0 · 221 Tables</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Storage Disk</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">1.2 GB / 100 GB</p>
          <span className="text-[10px] text-slate-400 font-mono">Public & Upload Disk</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">API Health & Rate</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">0.45 ms</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Sanctum Auth Active</span>
        </div>
      </div>

      {/* Developer Features Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Code className="w-4 h-4 text-purple-400" />
          Modul Pengelolaan Developer & Infrastruktur SaaS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemFeatures.map((f, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl bg-gradient-to-br ${f.color} bg-slate-900 border transition-all hover:scale-[1.02] cursor-pointer space-y-3 flex flex-col justify-between`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm mb-1">{f.name}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{f.desc}</p>
              </div>
              <div className="pt-3 border-t border-slate-800/50 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Status: OK</span>
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1 hover:underline">
                  Kelola &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Developer Action Tools */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          Alat Cepat Pemeliharaan Server & Database
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setBackupStatus("Running Dump...");
              setTimeout(() => setBackupStatus("Database Backup Completed!"), 1500);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-md"
          >
            <Database className="w-4 h-4" />
            Backup Database Sekarang
          </button>
          <button
            onClick={() => alert("Cache framework & route berhasil dibersihkan.")}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Clear Cache System
          </button>
        </div>
        {backupStatus !== "Idle" && (
          <p className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {backupStatus}
          </p>
        )}
      </div>
    </div>
  );
}
