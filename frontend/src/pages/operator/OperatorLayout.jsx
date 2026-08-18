import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarContent } from "../../components/layout/OperatorSidebar";
import OperatorTopBar from "../../components/layout/OperatorTopBar";
import OperatorFooter from "../../components/layout/OperatorFooter";

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
    <div className="flex h-screen bg-[#f8faf9] text-[#191c1c] overflow-hidden">
      {/* ── Background decorative blobs ── */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: 0,
          left: "20%",
          width: 300,
          height: 300,
          background: "rgba(105,255,135,0.05)",
          filter: "blur(100px)",
          borderRadius: "50%",
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          bottom: 0,
          right: "10%",
          width: 300,
          height: 300,
          background: "rgba(255,222,172,0.05)",
          filter: "blur(100px)",
          borderRadius: "50%",
        }}
      />

      {/* ── Desktop Sidebar — fixed, hanya tampil md+ ── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen z-40 shadow-2xl overflow-hidden">
        <SidebarContent />
      </aside>

      {/* ── Mobile Drawer Overlay ── */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      {/* ── Mobile Drawer ── */}
      <aside
        className={`fixed left-0 top-0 h-screen z-50 md:hidden shadow-xl
          overflow-hidden transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex flex-col flex-1 md:ml-[280px] min-w-0 h-screen relative z-10">
        {/* TopBar */}
        <OperatorTopBar onMenuClick={() => setSidebarOpen((v) => !v)} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto flex flex-col min-h-0">
          {location.pathname === "/operator/dashboard" ? (
            <Outlet />
          ) : (
            <div className="p-3 sm:p-4 md:p-6 w-full max-w-[1600px] mx-auto flex-1">
              <Outlet />
            </div>
          )}
        </main>
        <OperatorFooter />
      </div>
    </div>
  );
}
