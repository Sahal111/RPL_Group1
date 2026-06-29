import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { ArrowLeft, CalendarDays, User, BookOpen, Clock, Info } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const BULAN_OPTIONS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

const STATUS_STYLE = {
  Hadir:  "bg-green-100 text-green-700",
  Izin:   "bg-blue-100 text-blue-700",
  Sakit:  "bg-orange-100 text-orange-700",
  Alpa:   "bg-red-100 text-red-700",
};

export default function RiwayatAbsensiSiswaGuru() {
  const { nisn } = useParams();
  const currentYear  = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [bulan, setBulan] = useState(currentMonth);
  const [tahun, setTahun] = useState(currentYear);

  // Fetch riwayat absensi siswa via /absensi/siswa/{nisn}
  const { data, isLoading } = useQuery({
    queryKey: ["riwayat-siswa", nisn, bulan, tahun],
    queryFn: () =>
      api
        .get(`/absensi/siswa/${nisn}`, { params: { bulan, tahun } })
        .then((r) => r.data.data),
    enabled: !!nisn,
  });

  const summary = data?.summary;
  const detail  = data?.detail ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/guru/siswa"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Riwayat Absensi</h1>
          <p className="text-sm text-gray-500 mt-0.5">NISN: {nisn}</p>
        </div>
      </div>

      {/* Filter bulan & tahun */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:w-52">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Bulan</label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={bulan}
                onChange={(e) => setBulan(Number(e.target.value))}
                className="input-field pl-9 w-full bg-white"
              >
                {BULAN_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full sm:w-36">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Tahun</label>
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="input-field w-full bg-white"
            >
              {[currentYear, currentYear - 1].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <p className="text-sm text-gray-500 pb-1">
            Menampilkan riwayat bulan{" "}
            <span className="font-semibold text-gray-700">
              {BULAN_OPTIONS.find((b) => b.value === bulan)?.label} {tahun}
            </span>
          </p>
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

      {/* Detail Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : detail.length === 0 ? (
        <div className="card text-center py-12">
          <User className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Tidak ada data absensi di bulan ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {detail.map((hari) => (
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
