import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../../lib/axios";
import { Eye, Mail, Phone, Search, Users } from "lucide-react";

const parentDisplayName = (ortu) =>
  ortu?.nama_ayah ||
  ortu?.nama_ibu ||
  ortu?.nama_wali ||
  ortu?.email ||
  `Orang tua #${ortu?.id}`;

const getLinkedStudents = (ortu) => (Array.isArray(ortu?.siswa) ? ortu.siswa : []);
const firstFilled = (...values) => values.find((value) => value) ?? "-";

export default function MasterOrtu() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["master-ortu", search, page],
    queryFn: () =>
      api
        .get("/operator/master-data/orang-tua", {
          params: { search, page, paginate: 1 },
        })
        .then((res) => res.data.data),
    keepPreviousData: true,
  });

  const ortuList = data?.data || [];
  const pagination = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-7 h-7 text-indigo-600" />
          Master Data Orang Tua
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Data orang tua/wali dari form siswa dan anak yang tertaut
        </p>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Search className="w-4 h-4 inline mr-1" />
          Cari Orang Tua
        </label>
        <input
          type="text"
          placeholder="Nama ayah/ibu/wali, NIK, no HP, email, NISN, atau nama anak..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="input w-full"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : ortuList.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Tidak ada data orang tua ditemukan.</p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Orang Tua/Wali
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Anak Tertaut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Kontak
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Alamat
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ortuList.map((ortu, idx) => {
                    const students = getLinkedStudents(ortu);
                    const firstStudent = students[0];

                    return (
                      <tr key={ortu.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {(page - 1) * 15 + idx + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            {parentDisplayName(ortu)}
                          </div>
                          <div className="mt-1 space-y-0.5 text-xs text-gray-500">
                            <p>Ayah: {ortu.nama_ayah || "-"}</p>
                            <p>Ibu: {ortu.nama_ibu || "-"}</p>
                            <p>Wali: {ortu.nama_wali || "-"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {students.length > 0 ? (
                            <div className="space-y-1">
                              {students.map((siswa) => (
                                <div key={`${ortu.id}-${siswa.nisn}`} className="leading-tight">
                                  <div className="font-medium text-gray-900">
                                    {siswa.nama_lengkap || "-"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    NISN: {siswa.nisn || "-"}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Belum ada anak tertaut</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>
                                {firstFilled(ortu.no_hp_ayah, ortu.no_hp_ibu, ortu.no_hp_wali)}
                              </span>
                            </div>
                            {ortu.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="text-xs">{ortu.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                          <span className="line-clamp-2">{ortu.alamat || "-"}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {firstStudent?.nisn ? (
                            <Link
                              to={`/operator/master/siswa/${firstStudent.nisn}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Lihat Siswa
                            </Link>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.last_page > 1 && (
            <div className="flex items-center justify-between card py-3">
              <p className="text-sm text-gray-600">
                Menampilkan {ortuList.length} dari {pagination.total} data
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Hal {page} / {pagination.last_page}
                </span>
                <button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, pagination.last_page))
                  }
                  disabled={page === pagination.last_page}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
