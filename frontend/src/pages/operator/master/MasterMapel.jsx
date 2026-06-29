import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  BookOpen,
  ToggleLeft,
  ToggleRight,
  Filter,
} from "lucide-react";

// ─── Konstanta ──────────────────────────────────────────────────
const KELOMPOK_OPTIONS = [
  "A - Wajib",
  "B - Wajib",
  "C - Muatan Lokal",
  "Pengembangan Diri",
  "Ekstrakurikuler",
];

const TINGKAT_OPTIONS = ["Semua", "1", "2", "3", "4", "5", "6"];

const KURIKULUM_OPTIONS = ["Kurikulum 2013", "Kurikulum Merdeka", "Keduanya"];

const KELOMPOK_COLORS = {
  "A - Wajib":        "bg-blue-50 text-blue-700 border border-blue-100",
  "B - Wajib":        "bg-indigo-50 text-indigo-700 border border-indigo-100",
  "C - Muatan Lokal": "bg-purple-50 text-purple-700 border border-purple-100",
  "Pengembangan Diri":"bg-amber-50 text-amber-700 border border-amber-100",
  Ekstrakurikuler:    "bg-green-50 text-green-700 border border-green-100",
};

// ─── Modal Form ──────────────────────────────────────────────────
function ModalMapel({ open, onClose, editData, queryClient }) {
  const isEdit = !!editData;

  const emptyForm = {
    kode_mapel:     "",
    nama_mapel:     "",
    kelompok:       "A - Wajib",
    tingkat:        "Semua",
    jam_per_minggu: "2",
    kurikulum:      "Keduanya",
  };

  const [form, setForm] = useState(emptyForm);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (open) {
      setForm(
        editData
          ? {
              ...editData,
              jam_per_minggu: String(editData.jam_per_minggu),
              is_active: editData.is_active,
            }
          : emptyForm
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? api.put(`/operator/master-data/mapel/${editData.id}`, data)
        : api.post("/operator/master-data/mapel", data),
    onSuccess: () => {
      toast.success(`Mata pelajaran berhasil ${isEdit ? "diperbarui" : "ditambahkan"}.`);
      queryClient.invalidateQueries(["master-mapel"]);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-blue-600" />
            <h3 className="font-semibold text-gray-800">
              {isEdit ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {/* Kode Mapel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode Mapel <span className="text-red-500">*</span>
              </label>
              <input
                value={form.kode_mapel}
                onChange={(e) => set("kode_mapel", e.target.value.toUpperCase())}
                placeholder="Contoh: MTK, IPA"
                maxLength={20}
                className="input-field"
              />
            </div>

            {/* Jam per Minggu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jam / Minggu <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="40"
                value={form.jam_per_minggu}
                onChange={(e) => set("jam_per_minggu", e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Nama Mapel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Mata Pelajaran <span className="text-red-500">*</span>
            </label>
            <input
              value={form.nama_mapel}
              onChange={(e) => set("nama_mapel", e.target.value)}
              placeholder="Contoh: Matematika"
              maxLength={100}
              className="input-field"
            />
          </div>

          {/* Kelompok */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kelompok <span className="text-red-500">*</span>
            </label>
            <select
              value={form.kelompok}
              onChange={(e) => set("kelompok", e.target.value)}
              className="input-field"
            >
              {KELOMPOK_OPTIONS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tingkat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tingkat <span className="text-red-500">*</span>
              </label>
              <select
                value={form.tingkat}
                onChange={(e) => set("tingkat", e.target.value)}
                className="input-field"
              >
                {TINGKAT_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t === "Semua" ? "Semua Tingkat" : `Tingkat ${t}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Kurikulum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kurikulum <span className="text-red-500">*</span>
              </label>
              <select
                value={form.kurikulum}
                onChange={(e) => set("kurikulum", e.target.value)}
                className="input-field"
              >
                {KURIKULUM_OPTIONS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status (hanya saat edit) */}
          {isEdit && (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <span className="text-sm font-medium text-gray-700">Status Aktif</span>
              <button
                type="button"
                onClick={() => set("is_active", !form.is_active)}
                className={`transition-colors ${form.is_active ? "text-green-500" : "text-gray-400"}`}
              >
                {form.is_active
                  ? <ToggleRight size={32} />
                  : <ToggleLeft size={32} />}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary flex-1">
            Batal
          </button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            className="btn-primary flex-1"
          >
            {mutation.isPending ? "Menyimpan..." : isEdit ? "Perbarui" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Halaman Utama ────────────────────────────────────────────────
export default function MasterMapel() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData]   = useState(null);
  const [search, setSearch]       = useState("");
  const [filterKelompok, setFilterKelompok] = useState("");
  const [filterTingkat, setFilterTingkat]   = useState("");
  const [page, setPage] = useState(1);

  // Reset ke halaman 1 saat filter berubah
  useEffect(() => { setPage(1); }, [search, filterKelompok, filterTingkat]);

  const { data, isLoading } = useQuery({
    queryKey: ["master-mapel", search, filterKelompok, filterTingkat, page],
    queryFn: () =>
      api
        .get("/operator/master-data/mapel", {
          params: {
            search:   search || undefined,
            kelompok: filterKelompok || undefined,
            tingkat:  filterTingkat || undefined,
            page,
          },
        })
        .then((r) => r.data.data),
    keepPreviousData: true,
  });

  const toggleActive = useMutation({
    mutationFn: (id) =>
      api.patch(`/operator/master-data/mapel/${id}/toggle-active`),
    onSuccess: () => {
      queryClient.invalidateQueries(["master-mapel"]);
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  const hapus = useMutation({
    mutationFn: (id) => api.delete(`/operator/master-data/mapel/${id}`),
    onSuccess: () => {
      toast.success("Mata pelajaran dihapus.");
      queryClient.invalidateQueries(["master-mapel"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus."),
  });

  const list = data?.data ?? [];
  const meta = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-blue-600" size={26} />
            Master Data Mata Pelajaran
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola semua mata pelajaran yang tersedia di sekolah
          </p>
        </div>
        <button
          onClick={() => { setEditData(null); setModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Tambah Mapel
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode atau nama mapel..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Kelompok */}
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-gray-400" />
            <select
              value={filterKelompok}
              onChange={(e) => setFilterKelompok(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Semua Kelompok</option>
              {KELOMPOK_OPTIONS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {/* Filter Tingkat */}
          <select
            value={filterTingkat}
            onChange={(e) => setFilterTingkat(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Semua Tingkat</option>
            {["1","2","3","4","5","6"].map((t) => (
              <option key={t} value={t}>Tingkat {t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left">Kode</th>
                <th className="px-5 py-3 text-left">Nama Mata Pelajaran</th>
                <th className="px-5 py-3 text-left">Kelompok</th>
                <th className="px-5 py-3 text-center">Tingkat</th>
                <th className="px-5 py-3 text-center">Jam/Minggu</th>
                <th className="px-5 py-3 text-left">Kurikulum</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-14 text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-14">
                    <BookOpen size={40} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-400 font-medium">Belum ada mata pelajaran</p>
                    <p className="text-gray-300 text-xs mt-1">
                      Klik "Tambah Mapel" untuk menambahkan data baru
                    </p>
                  </td>
                </tr>
              ) : (
                list.map((m) => (
                  <tr
                    key={m.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      !m.is_active ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-5 py-3">
                      <span className="font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-lg text-xs">
                        {m.kode_mapel}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {m.nama_mapel}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${KELOMPOK_COLORS[m.kelompok] ?? "bg-gray-100 text-gray-600"}`}>
                        {m.kelompok}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-gray-600">
                      {m.tingkat === "Semua" ? (
                        <span className="text-xs text-gray-400 italic">Semua</span>
                      ) : (
                        <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          {m.tingkat}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center text-gray-600">
                      {m.jam_per_minggu} jam
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">
                      {m.kurikulum}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {m.is_active ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Aktif
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                          Non-aktif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Toggle aktif */}
                        <button
                          onClick={() => toggleActive.mutate(m.id)}
                          title={m.is_active ? "Non-aktifkan" : "Aktifkan"}
                          className={`p-2 rounded-lg transition-colors ${
                            m.is_active
                              ? "hover:bg-amber-50 text-gray-500 hover:text-amber-600"
                              : "hover:bg-green-50 text-gray-400 hover:text-green-600"
                          }`}
                        >
                          {m.is_active
                            ? <ToggleRight size={16} />
                            : <ToggleLeft size={16} />}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => { setEditData({ ...m }); setModalOpen(true); }}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>

                        {/* Hapus */}
                        <button
                          onClick={() => {
                            if (confirm(`Hapus mata pelajaran "${m.nama_mapel}"?`))
                              hapus.mutate(m.id);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>
              Menampilkan {meta.from}–{meta.to} dari {meta.total} data
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <span className="px-3 py-1.5 text-gray-700 font-medium">
                {page} / {meta.last_page}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      <ModalMapel
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        editData={editData}
        queryClient={queryClient}
      />
    </div>
  );
}
