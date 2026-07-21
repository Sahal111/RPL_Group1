import { useState } from "react";
import { Outlet } from "react-router-dom";
import OperatorSidebar from "../../components/layout/OperatorSidebar";
import OperatorTopBar from "../../components/layout/OperatorTopBar";

export default function OperatorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-animate text-on-surface">
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
      {sidebarOpen && (
        <div className="fixed left-0 top-0 h-screen w-[290px] z-50 md:hidden">
          <OperatorSidebar />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen md:ml-[290px]">
        <OperatorTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Canvas */}
        <div className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
