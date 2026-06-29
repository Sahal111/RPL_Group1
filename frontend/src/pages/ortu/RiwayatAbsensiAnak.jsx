import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { CalendarDays, Filter, Clock, Info, BookOpen } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const STATUS_STYLE = {
  Hadir:  "bg-green-100 text-green-700",
  Izin:   "bg-blue-100 text-blue-700",
  Sakit:  "bg-orange-100 text-orange-700",
  Alpa:   "bg-red-100 text-red-700",
  Alfa:   "bg-red-100 text-red-700",
};

export default function RiwayatAbsensiAnak() {
  const [filter, setFilter] = useState("bulan");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ortu-riwayat-absensi", filter],
    queryFn: () =>
      api.get(`/ortu/absensi?filter=${filter}`).then((res) => res.data.data),
    keepPreviousData: true,
  });

  const summary = data?.summary;
  const riwayat = data?.detail ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Riwayat Absensi</h1>
          <p className="text-sm text-gray-500 mt-1">
            NISN: {data?.nisn || "-"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input max-w-[200px]"
          >
            <option value="minggu">Minggu Ini</option>
            <option value="bulan">Bulan Ini</option>
            <option value="semester">Semester Ini</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {!isLoading && summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Hadir",  value: summary.hadir, color: "bg-green-50 text-green-700 border-green-100" },
            { label: "Sakit",  value: summary.sakit, color: "bg-orange-50 text-orange-700 border-orange-100" },
            { label: "Izin",   value: summary.izin,  color: "bg-blue-50 text-blue-700 border-blue-100" },
            { label: "Alpa",   value: summary.alpa,  color: "bg-red-50 text-red-700 border-red-100" },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl border p-4 ${item.color}`}>
              <p className="text-3xl font-bold">{item.value}</p>
              <p className="text-sm font-medium mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : isError ? (
        <div className="card text-center py-10 text-red-500">Gagal memuat data.</div>
      ) : !riwayat || riwayat.length === 0 ? (
        <div className="card text-center py-12">
          <CalendarDays className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Belum ada riwayat absensi untuk periode ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {riwayat.map((hari) => (
            <div key={hari.tanggal} className="card shadow-sm border border-gray-100 overflow-hidden p-0">
              {/* Header Tanggal */}
              <div className="bg-indigo-50 px-5 py-3 border-b border-indigo-100 flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-indigo-500" />
                <span className="font-bold text-indigo-800">
                  {dayjs(hari.tanggal).format("dddd, DD MMMM YYYY")}
                </span>
                <span className="ml-auto text-xs text-indigo-500 font-medium bg-indigo-100 px-2 py-1 rounded-md">
                  {hari.mapel.length} mata pelajaran
                </span>
              </div>

              {/* Tabel Mata Pelajaran */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-600">
                  <thead className="bg-gray-50/60 text-gray-500 text-xs font-semibold uppercase">
                    <tr>
                      <th className="px-5 py-3 text-left">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" /> Mata Pelajaran
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Waktu
                        </div>
                      </th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-left">
                        <div className="flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" /> Keterangan
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {hari.mapel.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-gray-800">
                          {m.nama_mapel}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                          {m.jam_mulai && m.jam_selesai
                            ? `${m.jam_mulai.slice(0, 5)} – ${m.jam_selesai.slice(0, 5)}`
                            : m.created_at
                            ? dayjs(m.created_at).format("HH:mm")
                            : "-"}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              STATUS_STYLE[m.status] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {m.status === "Alpa" ? "Alfa" : m.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 italic text-xs">
                          {m.keterangan || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
