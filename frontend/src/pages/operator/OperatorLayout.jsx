import { useState } from "react";
import { Outlet } from "react-router-dom";
import OperatorSidebar from "../../components/layout/OperatorSidebar";
import OperatorTopBar from "../../components/layout/OperatorTopBar";
import OperatorFooter from "../../components/layout/OperatorFooter";

export default function OperatorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f4faff]">
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
        className={`fixed left-0 top-0 h-screen w-[280px] border-r border-gray-300/40 bg-gray-50/80 z-50 transform transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <OperatorSidebar />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full md:ml-[280px] flex flex-col min-h-screen">
        <OperatorTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Canvas */}
        <div className="p-4 md:p-8 flex-1 max-w-[1440px] mx-auto w-full flex flex-col gap-8">
          <Outlet />
        </div>

        <OperatorFooter />
      </main>
    </div>
  );
}
