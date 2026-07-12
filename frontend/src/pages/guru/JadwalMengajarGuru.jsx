import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { BookOpen, Clock, GraduationCap, Calendar, AlertCircle } from "lucide-react";

const HARI_ORDER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const HARI_COLOR = {
  Senin:   { bg: "bg-blue-50",   border: "border-blue-200",   badge: "bg-blue-600",   text: "text-blue-700"   },
  Selasa:  { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-600", text: "text-purple-700" },
  Rabu:    { bg: "bg-green-50",  border: "border-green-200",  badge: "bg-green-600",  text: "text-green-700"  },
  Kamis:   { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-500", text: "text-orange-700" },
  Jumat:   { bg: "bg-rose-50",   border: "border-rose-200",   badge: "bg-rose-600",   text: "text-rose-700"   },
  Sabtu:   { bg: "bg-gray-50",   border: "border-gray-200",   badge: "bg-gray-500",   text: "text-gray-700"   },
};

const fmt = (t) => {
  if (!t) return "";
  // Format "08:00:00" → "08.00"
  return t.slice(0, 5).replace(":", ".");
};

export default function JadwalMengajarGuru() {
  const { data, isLoading } = useQuery({
    queryKey: ["guru-jadwal"],
    queryFn: () => api.get("/guru/jadwal").then((r) => r.data.data),
  });

  const jadwalGrouped = data?.jadwal ?? {};
  const total = data?.total ?? 0;

  // Hari yang tampil sesuai urutan + hanya yang punya jadwal
  const hariAktif = HARI_ORDER.filter((h) => jadwalGrouped[h]?.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Jadwal Mengajar</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Jadwal kelas dan mata pelajaran yang Anda ampu.
          </p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold border border-indigo-100">
            <BookOpen className="w-4 h-4" />
            {total} sesi per minggu
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="card p-12 text-center text-gray-400">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full mx-auto mb-3" />
          Memuat jadwal...
        </div>
      )}

      {/* Empty */}
      {!isLoading && hariAktif.length === 0 && (
        <div className="card p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada jadwal mengajar yang ditetapkan.</p>
          <p className="text-sm text-gray-400 mt-1">
            Hubungi operator untuk menambahkan jadwal Anda.
          </p>
        </div>
      )}

      {/* Grid per hari */}
      {!isLoading && hariAktif.length > 0 && (
        <div className="grid gap-4">
          {hariAktif.map((hari) => {
            const c = HARI_COLOR[hari] ?? HARI_COLOR["Senin"];
            const sesi = jadwalGrouped[hari] ?? [];

            return (
              <div key={hari} className={`card p-0 overflow-hidden border ${c.border}`}>
                {/* Day header */}
                <div className={`flex items-center gap-3 px-5 py-3 ${c.bg} border-b ${c.border}`}>
                  <span className={`px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider ${c.badge}`}>
                    {hari}
                  </span>
                  <span className="text-sm text-gray-500">{sesi.length} sesi</span>
                </div>

                {/* Session rows */}
                <div className="divide-y divide-gray-50">
                  {sesi.map((s) => (
                    <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                      {/* Jam */}
                      <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
                        <Clock className={`w-4 h-4 ${c.text}`} />
                        <span className="text-sm font-semibold text-gray-700">
                          {fmt(s.jam_mulai)} – {fmt(s.jam_selesai)}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="h-10 w-px bg-gray-100 flex-shrink-0" />

                      {/* Mata Pelajaran */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <BookOpen className={`w-4 h-4 flex-shrink-0 ${c.text}`} />
                          <p className="font-semibold text-gray-800 truncate">
                            {s.mata_pelajaran ?? "—"}
                          </p>
                          {s.kode_mapel && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${c.bg} ${c.text} border ${c.border} flex-shrink-0`}>
                              {s.kode_mapel}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Kelas */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm font-semibold ${c.text}`}>
                          {s.nama_kelas ?? "—"}
                        </span>
                      </div>

                      {/* Semester / Tahun */}
                      <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
                        <Calendar className="w-4 h-4 text-gray-300" />
                        <span className="text-xs text-gray-400">
                          Sem {s.semester} · {s.tahun_ajaran}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
