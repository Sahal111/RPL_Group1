import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, CheckCircle, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ModalTahunAjaran({ open, onClose, editData, queryClient }) {
  const isEdit = !!editData;

  const [form, setForm] = useState({
    nama: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
  });

  useEffect(() => {
    if (open) {
      setForm(
        editData ?? {
          nama: "",
          tanggal_mulai: "",
          tanggal_selesai: "",
        },
      );
    }
  }, [open, editData]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? api.put(`/operator/master-data/tahun-ajaran/${editData.id}`, data)
        : api.post("/operator/master-data/tahun-ajaran", data),
    onSuccess: () => {
      toast.success(
        `Tahun ajaran berhasil ${isEdit ? "diperbarui" : "ditambahkan"}.`,
      );
      queryClient.invalidateQueries(["tahun-ajaran"]);
      queryClient.invalidateQueries(["tahun-ajaran-dropdown"]);
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800">
            {isEdit ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">
                (maks. 20 karakter)
              </span>
            </label>
            <input
              value={form.nama}
              onChange={(e) => set("nama", e.target.value)}
              className="input-field"
              placeholder="Contoh: 2025/2026 - Smt 1"
              maxLength={20}
            />
            <p className="text-xs text-gray-400 mt-1">
              {form.nama.length}/20 karakter
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.tanggal_mulai}
              onChange={(e) => set("tanggal_mulai", e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Selesai <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.tanggal_selesai}
              onChange={(e) => set("tanggal_selesai", e.target.value)}
              className="input-field"
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

export default function TahunAjaran() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["tahun-ajaran"],
    queryFn: () =>
      api.get("/operator/master-data/tahun-ajaran").then((r) => r.data.data),
  });

  const setAktif = useMutation({
    mutationFn: (id) =>
      api.patch(`/operator/master-data/tahun-ajaran/${id}/aktif`),
    onSuccess: () => {
      toast.success("Tahun ajaran aktif berhasil diubah.");
      queryClient.invalidateQueries(["tahun-ajaran"]);
      queryClient.invalidateQueries(["tahun-ajaran-dropdown"]);
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  const hapus = useMutation({
    mutationFn: (id) => api.delete(`/operator/master-data/tahun-ajaran/${id}`),
    onSuccess: () => {
      toast.success("Tahun ajaran dihapus.");
      queryClient.invalidateQueries(["tahun-ajaran"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus."),
  });

  const list = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tahun Ajaran</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola tahun ajaran dan semester aktif
          </p>
        </div>
        <button
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
        Hanya satu tahun ajaran yang bisa aktif sekaligus. Tahun ajaran aktif
        akan digunakan sebagai default saat membuat kelas baru.
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-3 text-gray-500 font-medium">
                Nama
              </th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">
                Tanggal Mulai
              </th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">
                Tanggal Selesai
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
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  Memuat data...
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  Belum ada tahun ajaran.
                </td>
              </tr>
            ) : (
              list.map((t) => (
                <tr
                  key={t.id}
                  className={`hover:bg-gray-50 transition-colors ${t.is_active ? "bg-green-50/50" : ""}`}
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {t.nama}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{t.tanggal_mulai}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {t.tanggal_selesai}
                  </td>
                  <td className="px-6 py-4">
                    {t.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                        <CheckCircle className="w-3.5 h-3.5" /> Aktif
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                        Non-aktif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/operator/master/tahun-ajaran/${t.id}`)}
                        title="Lihat detail"
                        className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!t.is_active && (
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Jadikan "${t.nama}" sebagai tahun ajaran aktif?`,
                              )
                            )
                              setAktif.mutate(t.id);
                          }}
                          title="Jadikan aktif"
                          className="p-2 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditData({ ...t });
                          setModalOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus tahun ajaran "${t.nama}"?`))
                            hapus.mutate(t.id);
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

      <ModalTahunAjaran
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
