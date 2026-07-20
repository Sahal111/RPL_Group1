import { useState } from "react";
import { Outlet } from "react-router-dom";
import OperatorSidebar from "../../components/layout/OperatorSidebar";
import OperatorTopBar from "../../components/layout/OperatorTopBar";

export default function OperatorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f6fbf2] via-[#eaefe6] to-[#f0f5ec] animate-gradient-shift bg-[length:400%_400%]">
      {/* Desktop Sidebar */}
      <OperatorSidebar />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-[290px] border-r border-[#becabc]/50 bg-[#f6fbf2] z-50 transform transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <OperatorSidebar />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full md:ml-[290px] flex flex-col min-h-screen">
        <OperatorTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Canvas */}
        <div className="p-6 md:p-8 flex-1 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
