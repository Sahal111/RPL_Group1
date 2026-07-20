import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Menu,
  Bell,
  MessageSquare,
  Search,
  ChevronDown,
} from "lucide-react";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001";

export default function OperatorTopBar({ onMenuClick }) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-[72px] w-full bg-[#f6fbf2]/75 backdrop-blur-lg border-b border-[#becabc]/30 flex items-center justify-between px-6 max-w-[1600px] mx-auto transition-all duration-300 ease-out">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-[#181d17] p-2 rounded-lg hover:bg-[#f0f5ec] transition-colors duration-300"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative hidden sm:flex items-center">
          <Search className="absolute left-3 text-[#6B7280] w-[14px] h-[14px]" />
          <input
            className="pl-10 pr-12 py-2 bg-[#eaefe6]/50 border border-[#E5E7EB]/50 rounded-xl focus:ring-2 focus:ring-[#00652c]/20 focus:border-[#00652c]/30 focus:bg-[#f6fbf2] text-sm w-64 transition-all duration-300 focus:w-80 outline-none hover:bg-[#eaefe6]/80 text-[#111827] placeholder:text-[#6B7280]"
            placeholder="Search across portal..."
            type="text"
          />
          <div className="absolute right-3 flex items-center gap-1">
            <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium text-[#6B7280] bg-[#f6fbf2] rounded border border-[#E5E7EB] shadow-sm">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        <div className="hidden lg:flex items-center gap-2 bg-[#00652c]/5 px-3 py-1.5 rounded-full border border-[#00652c]/10">
          <span className="w-1.5 h-1.5 bg-[#00652c] rounded-full"></span>
          <span className="text-xs font-semibold text-[#00652c]">
            Academic Year: 2023-24
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-[#6B7280] hover:bg-[#eaefe6] hover:text-[#111827] rounded-lg transition-all duration-300 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#DC2626] rounded-full ring-2 ring-[#f6fbf2]"></span>
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
                      <p className="text-xs text-gray-500 mt-1">
                        5 menit yang lalu
                      </p>
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
                    <button className="text-sm text-[#00652c] font-semibold hover:underline">
                      Lihat Semua
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Messages */}
          <button className="p-2 text-[#6B7280] hover:bg-[#eaefe6] hover:text-[#111827] rounded-lg transition-all duration-300">
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>

        <div className="h-6 w-px bg-[#becabc]/40 mx-1"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-[#eaefe6]/50 p-1.5 pr-3 rounded-xl transition-colors duration-300 group border border-transparent hover:border-[#E5E7EB]/50">
          <img
            alt="Administrator Profile"
            className="w-8 h-8 rounded-lg object-cover border border-[#becabc]/50 shadow-sm"
            src={
              user?.foto
                ? `${BASE_URL}/storage/${user.foto}`
                : "https://lh3.googleusercontent.com/aida-public/AB6AXuBhIpxfHfKrgRWMnrhW7_WEsvNxScEmeuc39OzjA2hlMvTMgtjzT2VC7PH1Pl2KZ1ZUeeKagGX1pyo2VzHh9atrUzRt4LDiNnyTkwiuWNJDdkuyho8egKbfKEdprdEDKEsrTUs02V6Wi1ZVDw4m8CH0wMSbDUIDgyHrMXqKcrgrXfxJFaLvIORBXcv1AKtVgVOeGwr5-9XXcNZmYE24wRwG77cWb47QesC-sYeaWPQGf2eW-G9e3vaRuREbzksgIWJoBcHQiuFY47aL"
            }
          />
          <div className="hidden sm:flex flex-col items-start">
            <p className="text-sm font-semibold text-[#111827] leading-tight">
              {user?.nama_lengkap || "Admin Operator"}
            </p>
            <p className="text-[11px] text-[#6B7280] font-medium">
              MI Nurul Huda 3
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-[#6B7280] hidden sm:block group-hover:text-[#111827] transition-colors" />
        </div>
      </div>
    </header>
  );
}
