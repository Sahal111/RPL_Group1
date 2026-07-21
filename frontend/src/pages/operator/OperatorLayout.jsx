import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarContent } from "../../components/layout/OperatorSidebar";
import OperatorTopBar from "../../components/layout/OperatorTopBar";

export default function OperatorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Auto-close drawer saat pindah halaman
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll saat drawer buka
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen bg-gradient-animate text-on-surface overflow-hidden">
      {/* ── Desktop Sidebar — fixed, hanya tampil md+ ── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen z-40 shadow-sm overflow-hidden">
        <SidebarContent />
      </aside>

      {/* ── Mobile Drawer ── */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`fixed left-0 top-0 h-screen z-50 md:hidden shadow-xl
          overflow-hidden transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex flex-col flex-1 md:ml-[290px] min-w-0 h-screen">
        {/* TopBar di luar scroll container → tidak ikut scroll */}
        <OperatorTopBar onMenuClick={() => setSidebarOpen((v) => !v)} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6 w-full max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
