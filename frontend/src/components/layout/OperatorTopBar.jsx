import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Menu,
  Bell,
  Calendar,
  Settings as SettingsIcon,
  Search,
  ChevronRight,
} from "lucide-react";

export default function OperatorTopBar({ onMenuClick }) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full flex justify-between items-center h-20 px-6 md:px-8 bg-white/90 backdrop-blur-md border-b border-gray-300/30">
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-600 p-2 -ml-2 rounded-full hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb & Search */}
        <div className="hidden md:flex flex-1 items-center gap-6 max-w-2xl">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="hover:text-green-700 cursor-pointer transition-colors">
              Dashboard
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium text-gray-900">Overview</span>
          </div>
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-green-700 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              className="block w-full pl-10 pr-3 py-2 border border-gray-300/50 rounded-full leading-5 bg-gray-100/50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-700/20 focus:border-green-700 transition-all sm:text-sm"
              placeholder="Search students, staff, or documents... (Press '/')"
              type="text"
            />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 mr-2">
          <span className="w-2 h-2 rounded-full bg-green-700 animate-pulse"></span>
          <span className="text-xs font-medium text-gray-500">System Online</span>
        </div>

        <div className="h-6 w-px bg-gray-300/30 mx-1 hidden md:block"></div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-gray-600 hover:text-green-700 hover:bg-green-700/10 rounded-full p-2 transition-all cursor-pointer relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white"></span>
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Notifikasi</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
                    <p className="text-sm text-gray-800 font-medium">
                      Approval baru dari Orang Tua
                    </p>
                    <p className="text-xs text-gray-500 mt-1">5 menit yang lalu</p>
                  </div>
                  <div className="p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
                    <p className="text-sm text-gray-800 font-medium">
                      Data siswa baru ditambahkan
                    </p>
                    <p className="text-xs text-gray-500 mt-1">1 jam yang lalu</p>
                  </div>
                  <div className="p-4 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm text-gray-800 font-medium">
                      Backup database berhasil
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 jam yang lalu</p>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-100 text-center">
                  <button className="text-sm text-green-700 font-semibold hover:underline">
                    Lihat Semua
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Calendar */}
        <button className="text-gray-600 hover:text-green-700 hover:bg-green-700/10 rounded-full p-2 transition-all cursor-pointer hidden sm:block">
          <Calendar className="w-5 h-5" />
        </button>

        {/* Settings */}
        <button className="text-gray-600 hover:text-green-700 hover:bg-green-700/10 rounded-full p-2 transition-all cursor-pointer hidden sm:block">
          <SettingsIcon className="w-5 h-5" />
        </button>

        <div className="hidden md:block ml-2">
          <span className="text-[11px] leading-[16px] tracking-[0.03em] font-semibold text-gray-900 bg-gray-200 px-3 py-1.5 rounded-full border border-gray-300/20">
            TA 2023/2024 Ganjil
          </span>
        </div>
      </div>
    </header>
  );
}
