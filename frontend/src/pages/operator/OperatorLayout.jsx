import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import OperatorSidebar from "../../components/layout/OperatorSidebar";
import OperatorTopBar from "../../components/layout/OperatorTopBar";

export default function OperatorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Auto-close mobile sidebar saat navigasi
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll saat mobile sidebar buka
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-gradient-animate text-on-surface">
      {/* ── Desktop Sidebar (hidden on mobile) ── */}
      <div className="hidden md:block">
        <OperatorSidebar />
      </div>

      {/* ── Mobile Sidebar Drawer ── */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 h-screen z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <OperatorSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-h-screen md:ml-[290px]">
        <OperatorTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content */}
        <div className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
