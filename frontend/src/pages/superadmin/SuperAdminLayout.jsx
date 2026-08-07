import { useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  ShieldAlert,
  Server,
  Database,
  Key,
  Sliders,
  HardDrive,
  Mail,
  MessageSquare,
  Activity,
  LogOut,
  Building2,
  FileCheck,
  ToggleLeft,
  Cpu,
  Layers,
  Code
} from "lucide-react";

export default function SuperAdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Developer Dashboard", icon: Server, path: "/superadmin" },
    { label: "Tenant & Multi-School", icon: Building2, path: "/superadmin" },
    { label: "Role & Permissions System", icon: Key, path: "/superadmin" },
    { label: "System Config & Gateways", icon: Sliders, path: "/superadmin" },
    { label: "Database Backup & Restore", icon: Database, path: "/superadmin" },
    { label: "Storage & Server Quotas", icon: HardDrive, path: "/superadmin" },
    { label: "Audit & Error Logs", icon: Activity, path: "/superadmin" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className={`bg-slate-900 border-r border-slate-800 w-64 flex flex-col transition-all ${sidebarOpen ? "block" : "hidden sm:block"}`}>
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white tracking-wide">SIAKAD SaaS Platform</h2>
            <p className="text-[10px] text-purple-400 uppercase font-mono tracking-widest font-semibold">Global Super Admin</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            ⚙️ System Infrastructure
          </div>
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <item.icon className="w-4 h-4 text-purple-400" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
              SA
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.nama || "Developer Super Admin"}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar Developer Mode
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              PRODUCTION READY — GOD MODE
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Environment: <strong className="text-slate-200">Local (Development)</strong></span>
          </div>
        </header>

        {/* Page Container */}
        <main className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
