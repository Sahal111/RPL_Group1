import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { Megaphone, CalendarDays, User, Clock, AlertTriangle, Info, Calendar } from "lucide-react";

// Konfigurasi style dan ikon berdasarkan kategori
const KATEGORI_CONFIG = {
  "Libur": { 
    color: "bg-green-100 text-green-700 border-green-200", 
    icon: CalendarDays, 
    iconColor: "text-green-600" 
  },
  "Rapat": { 
    color: "bg-blue-100 text-blue-700 border-blue-200", 
    icon: Users, 
    iconColor: "text-blue-600" 
  },
  "Jadwal Ujian": { 
    color: "bg-purple-100 text-purple-700 border-purple-200", 
    icon: Calendar, 
    iconColor: "text-purple-600" 
  },
  "Penting": { 
    color: "bg-red-100 text-red-700 border-red-200", 
    icon: AlertTriangle, 
    iconColor: "text-red-600" 
  },
  "Informasi": { 
    color: "bg-indigo-100 text-indigo-700 border-indigo-200", 
    icon: Info, 
    iconColor: "text-indigo-600" 
  },
};

const formatWaktu = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const timeAgo = (dateStr) => {
  const diffMs = new Date() - new Date(dateStr);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  return formatWaktu(dateStr);
};

export default function PengumumanGuru() {
  const { data: pengumuman, isLoading } = useQuery({
    queryKey: ["pengumuman-list"],
    queryFn: () => api.get("/pengumuman").then((r) => r.data.data),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Megaphone className="w-8 h-8 opacity-90" />
            Papan Pengumuman
          </h1>
          <p className="mt-2 text-indigo-100 max-w-2xl text-sm sm:text-base">
            Informasi penting, jadwal, dan pemberitahuan terbaru dari pihak sekolah (Operator & Kepala Sekolah).
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-400">Memuat pengumuman...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!pengumuman || pengumuman.length === 0) && (
        <div className="card p-16 text-center">
          <Megaphone className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Tidak ada pengumuman</h3>
          <p className="text-gray-500 mt-1">Saat ini belum ada informasi terbaru dari sekolah.</p>
        </div>
      )}

      {/* List Pengumuman */}
      {!isLoading && pengumuman?.length > 0 && (
        <div className="grid gap-5">
          {pengumuman.map((item) => {
            const cfg = KATEGORI_CONFIG[item.kategori] || KATEGORI_CONFIG["Informasi"];
            const Icon = cfg.icon || Megaphone;

            return (
              <div key={item.id} className="card p-0 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="p-6 sm:p-7">
                  {/* Card Header (Meta) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${cfg.color}`}>
                      <Icon className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
                      {item.kategori}
                    </span>
                    
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      {timeAgo(item.created_at)}
                    </span>
                  </div>

                  {/* Konten Utama */}
                  <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                    {item.judul}
                  </h2>
                  <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {item.konten}
                  </div>
                </div>

                {/* Card Footer (Author) */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-gray-500">
                      Dikirim oleh <span className="text-gray-700 font-semibold">{item.penulis?.username || "Admin"}</span>
                    </span>
                  </div>
                  
                  <span className="text-xs text-gray-400">
                    {formatWaktu(item.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Untuk render icon fallback
function Users(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
