import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Eye,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

const parentDisplayName = (ortu) =>
  ortu?.nama_ayah ||
  ortu?.nama_ibu ||
  ortu?.nama_wali ||
  ortu?.email ||
  `Orang tua #${ortu?.id}`;

const getLinkedStudents = (ortu) =>
  Array.isArray(ortu?.siswa) ? ortu.siswa : [];
const firstFilled = (...values) => values.find((value) => value) ?? "-";

export default function MasterOrtu() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const emptyForm = {
    nama_ayah: "",
    nama_ibu: "",
    nama_wali: "",
    no_hp_ayah: "",
    no_hp_ibu: "",
    no_hp_wali: "",
    email: "",
    alamat: "",
  };
  const [formData, setFormData] = useState(emptyForm);

  const createMutation = useMutation({
    mutationFn: (data) => api.post("/operator/master-data/orang-tua", data),
    onSuccess: () => {
      toast.success("Data orang tua berhasil ditambahkan.");
      queryClient.invalidateQueries(["master-ortu"]);
      setShowAddModal(false);
      setFormData(emptyForm);
    },
    onError: (error) => {
      const errors = error.response?.data?.errors;
      if (errors) Object.values(errors).forEach((item) => toast.error(item[0]));
      else
        toast.error(error.response?.data?.message || "Gagal menambahkan data");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/operator/master-data/orang-tua/${id}`),
    onSuccess: () => {
      toast.success("Data orang tua berhasil dihapus.");
      queryClient.invalidateQueries(["master-ortu"]);
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menghapus data");
      setDeleteTarget(null);
    },
  });

  const handleAddSubmit = (event) => {
    event.preventDefault();
    createMutation.mutate(formData);
  };

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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            Master Data Orang Tua
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Data orang tua/wali dari form siswa dan anak yang tertaut
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Data Orang Tua
        </button>
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
                            <div className="space-y-1.5">
                              {students.map((siswa) => {
                                const hasAccount =
                                  (siswa.user_ortu?.length ?? 0) > 0;

                                return (
                                  <div
                                    key={`${ortu.id}-${siswa.nisn}`}
                                    className="leading-tight"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-medium text-gray-900">
                                        {siswa.nama_lengkap || "-"}
                                      </span>
                                      {hasAccount && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      NISN: {siswa.nisn || "-"}
                                      {hasAccount && (
                                        <span className="text-green-600">
                                          {" "}
                                          · sudah punya akun
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Belum ada anak tertaut
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>
                                {firstFilled(
                                  ortu.no_hp_ayah,
                                  ortu.no_hp_ibu,
                                  ortu.no_hp_wali,
                                )}
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
                          <span className="line-clamp-2">
                            {ortu.alamat || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/operator/master/ortu/keluarga/${ortu.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Lihat Detail
                            </Link>
                            <button
                              onClick={() => setDeleteTarget(ortu)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Hapus
                            </button>
                          </div>
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Tambah Data Orang Tua
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Nama Ayah"
                value={formData.nama_ayah}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, nama_ayah: e.target.value }))
                }
                className="input w-full"
              />
              <input
                type="text"
                placeholder="Nama Ibu"
                value={formData.nama_ibu}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, nama_ibu: e.target.value }))
                }
                className="input w-full"
              />
              <input
                type="text"
                placeholder="Nama Wali"
                value={formData.nama_wali}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, nama_wali: e.target.value }))
                }
                className="input w-full"
              />
              <input
                type="text"
                placeholder="No. HP Ayah"
                value={formData.no_hp_ayah}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, no_hp_ayah: e.target.value }))
                }
                className="input w-full"
              />
              <input
                type="text"
                placeholder="No. HP Ibu"
                value={formData.no_hp_ibu}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, no_hp_ibu: e.target.value }))
                }
                className="input w-full"
              />
              <input
                type="text"
                placeholder="No. HP Wali"
                value={formData.no_hp_wali}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, no_hp_wali: e.target.value }))
                }
                className="input w-full"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                className="input w-full"
              />
              <textarea
                placeholder="Alamat"
                value={formData.alamat}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, alamat: e.target.value }))
                }
                className="input w-full"
                rows={2}
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {createMutation.isPending ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Hapus Data Orang Tua?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Data <b>{parentDisplayName(deleteTarget)}</b> akan dihapus
              permanen.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary flex-1"
              >
                Batal
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex-1 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
