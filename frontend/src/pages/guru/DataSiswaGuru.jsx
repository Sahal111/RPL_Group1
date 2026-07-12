import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import { Search, Users, Phone, User, Filter, Eye, History } from "lucide-react";

const fetchSiswa = (params) =>
  api.get("/guru/siswa", { params }).then((r) => r.data.data);

const fetchKelas = () =>
  api.get("/guru/kelas").then((r) => r.data.data);

const genderBadge = {
  L: "bg-blue-100 text-blue-700",
  P: "bg-pink-100 text-pink-700",
};

export default function DataSiswaGuru() {
  const [search, setSearch] = useState("");
  const [kelasFilter, setKelasFilter] = useState("");

  const { data: kelasList } = useQuery({
    queryKey: ["guru-kelas-dropdown"],
    queryFn: fetchKelas,
  });

  const { data: siswaList, isLoading } = useQuery({
    queryKey: ["guru-siswa", search, kelasFilter],
    queryFn: () => fetchSiswa({ search, id_kelas: kelasFilter }),
    keepPreviousData: true,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Data Siswa</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Daftar siswa di kelas yang Anda wali
        </p>
      </div>

      {/* Filter & Search */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, NISN, atau no. induk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              className="input-field pl-9 w-full sm:w-48 bg-white"
            >
              <option value="">Semua Kelas</option>
              {kelasList?.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_kelas}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-gray-500 font-medium w-10">#</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Nama Siswa</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">NISN</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Kelas</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">JK</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Nama Orang Tua</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">No. HP Ortu</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : siswaList?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>Tidak ada siswa ditemukan.</p>
                  </td>
                </tr>
              ) : (
                siswaList?.map((s, idx) => (
                  <tr key={s.nisn} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 font-semibold text-xs ${s.jenis_kelamin === "L" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                          {s.foto ? (
                            <img src={`http://127.0.0.1:8001/storage/${s.foto}`} alt={s.nama_lengkap} className="w-full h-full object-cover" />
                          ) : (
                            s.nama_lengkap?.charAt(0)?.toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{s.nama_lengkap}</p>
                          <p className="text-xs text-gray-400">No. Absen: {s.no_absen ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-600 text-xs">{s.nisn}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {s.nama_kelas ?? s.id_kelas}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${genderBadge[s.jenis_kelamin] ?? "bg-gray-100 text-gray-600"}`}>
                        {s.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.nama_ortu ? (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-700">{s.nama_ortu}</span>
                          {s.hubungan_ortu && (
                            <span className="text-xs text-gray-400">({s.hubungan_ortu})</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Belum terdaftar</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.no_hp_ortu ? (
                        <a
                          href={`https://wa.me/${s.no_hp_ortu?.replace(/^0/, "62")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-green-600 hover:text-green-700 hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {s.no_hp_ortu}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/guru/siswa/${s.nisn}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Detail
                        </Link>
                        <Link
                          to={`/guru/siswa/${s.nisn}/riwayat`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors"
                        >
                          <History className="w-3.5 h-3.5" />
                          Absen
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total count */}
        {(siswaList?.length ?? 0) > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
            Total {siswaList?.length} siswa
          </div>
        )}
      </div>
    </div>
  );
}
