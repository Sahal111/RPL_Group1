// import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";
// import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, X, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ModalKelas({ open, onClose, editData, queryClient }) {
  const isEdit = !!editData;

  const [form, setForm] = useState({
    id: "",
    id_tahun_ajaran: "",
    nama_kelas: "",
    tingkat: "1",
    semester: "1",
    nuptk_wali: "",
    kurikulum: "Kurikulum Merdeka",
    ruangan: "",
    kapasitas: "30",
  });

  // ← TAMBAHKAN INI
  useEffect(() => {
    if (open) {
      setForm(
        editData ?? {
          id: "",
          id_tahun_ajaran: "",
          nama_kelas: "",
          tingkat: "1",
          semester: "1",
          nuptk_wali: "",
          kurikulum: "Kurikulum Merdeka",
          ruangan: "",
          kapasitas: "30",
        },
      );
    }
  }, [open, editData]);

  // ... sisa kode tetap sama
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const { data: guruList } = useQuery({
    queryKey: ["guru-dropdown"],
    queryFn: () =>
      api.get("/operator/master-data/guru").then((r) => r.data.data.data),
  });

  const { data: tahunAjaranList } = useQuery({
    queryKey: ["tahun-ajaran-dropdown"],
    queryFn: () =>
      api.get("/operator/master-data/tahun-ajaran").then((r) => r.data.data),
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? api.put(`/operator/master-data/kelas/${editData.id}`, data)
        : api.post("/operator/master-data/kelas", data),
    onSuccess: () => {
      toast.success(
        `Data kelas berhasil ${isEdit ? "diperbarui" : "ditambahkan"}.`,
      );
      queryClient.invalidateQueries(["master-kelas"]);
      onClose();
    },
    onError: (err) => {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).forEach((e) => toast.error(e[0]));
      else toast.error(err.response?.data?.message ?? "Gagal menyimpan.");
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800">
            {isEdit ? "Edit Data Kelas" : "Tambah Kelas Baru"}
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-4 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {/* Tahun Ajaran — full width */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahun Ajaran <span className="text-red-500">*</span>
            </label>
            <select
              value={form.id_tahun_ajaran}
              onChange={(e) => set("id_tahun_ajaran", e.target.value)}
              className="input-field"
            >
              <option value="">-- Pilih Tahun Ajaran --</option>
              {(tahunAjaranList ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nama} {t.is_active ? "(Aktif)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Kelas <span className="text-red-500">*</span>
            </label>
            <input
              value={form.id}
              onChange={(e) => set("id", e.target.value)}
              className="input-field"
              placeholder="Contoh: 1A-2026"
              disabled={isEdit}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Kelas <span className="text-red-500">*</span>
            </label>
            <input
              value={form.nama_kelas}
              onChange={(e) => set("nama_kelas", e.target.value)}
              className="input-field"
              placeholder="Contoh: Kelas 1A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tingkat <span className="text-red-500">*</span>
            </label>
            <select
              value={form.tingkat}
              onChange={(e) => set("tingkat", e.target.value)}
              className="input-field"
            >
              {[1, 2, 3, 4, 5, 6].map((t) => (
                <option key={t} value={t}>
                  Kelas {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester <span className="text-red-500">*</span>
            </label>
            <select
              value={form.semester}
              onChange={(e) => set("semester", e.target.value)}
              className="input-field"
            >
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wali Kelas
            </label>
            <select
              value={form.nuptk_wali}
              onChange={(e) => set("nuptk_wali", e.target.value)}
              className="input-field"
            >
              <option value="">-- Pilih Wali Kelas --</option>
              {(guruList ?? []).map((g) => (
                <option key={g.nuptk} value={g.nuptk}>
                  {g.nama_lengkap}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kurikulum
            </label>
            <select
              value={form.kurikulum}
              onChange={(e) => set("kurikulum", e.target.value)}
              className="input-field"
            >
              <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
              <option value="Kurikulum 2013">Kurikulum 2013</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ruangan
            </label>
            <input
              value={form.ruangan}
              onChange={(e) => set("ruangan", e.target.value)}
              className="input-field"
              placeholder="Contoh: Ruang 1A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kapasitas
            </label>
            <input
              type="number"
              value={form.kapasitas}
              onChange={(e) => set("kapasitas", e.target.value)}
              className="input-field"
              placeholder="30"
            />
          </div>
        </div>

        <div className="flex gap-2 px-6 py-4 border-t">
          <button onClick={onClose} className="btn-secondary flex-1">
            Batal
          </button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            className="btn-primary flex-1"
          >
            {mutation.isPending
              ? "Menyimpan..."
              : isEdit
                ? "Perbarui"
                : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MasterKelas() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [tingkat, setTingkat] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["master-kelas", search, tingkat],
    queryFn: () =>
      api
        .get("/operator/master-data/kelas", { params: { search, tingkat } })
        .then((r) => r.data.data),
    keepPreviousData: true,
  });

  const hapus = useMutation({
    mutationFn: (id) => api.delete(`/operator/master-data/kelas/${id}`),
    onSuccess: () => {
      toast.success("Data kelas dihapus.");
      queryClient.invalidateQueries(["master-kelas"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus."),
  });

  const kelasList = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Master Data Kelas
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola data kelas dan wali kelas
          </p>
        </div>
        <button
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Kelas
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama kelas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select
            value={tingkat}
            onChange={(e) => setTingkat(e.target.value)}
            className="input-field w-full sm:w-44"
          >
            <option value="">Semua Tingkat</option>
            {[1, 2, 3, 4, 5, 6].map((t) => (
              <option key={t} value={t}>
                Kelas {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Nama Kelas
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Tingkat
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Semester
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Wali Kelas
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Ruangan
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : kelasList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Belum ada data kelas.
                  </td>
                </tr>
              ) : (
                kelasList.map((k) => (
                  <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {k.nama_kelas}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">{k.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
                        Kelas {k.tingkat}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      Semester {k.semester}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {k.wali?.nama_lengkap ?? (
                        <span className="text-gray-300 italic">
                          Belum ditentukan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {k.ruangan ?? "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${k.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {k.is_active ? "Aktif" : "Non-aktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            navigate(`/operator/master/kelas/${k.id}`)
                          }
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                          title="Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditData(k);
                            setModalOpen(true);
                          }}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus kelas ${k.nama_kelas}?`))
                              hapus.mutate(k.id);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data?.total > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
            Menampilkan {kelasList.length} dari {data.total} kelas
          </div>
        )}
      </div>

      <ModalKelas
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        editData={editData}
        queryClient={queryClient}
      />
    </div>
  );
}
