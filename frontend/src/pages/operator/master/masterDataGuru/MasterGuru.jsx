import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";
import { Plus, Search, Pencil, Trash2, X, Eye, Camera } from "lucide-react";

const jenisPtkOptions = [
  "Kepala Sekolah",
  "Guru Kelas",
  "Guru Mapel",
  "Guru BK",
  "Tenaga Administrasi",
  "Pustakawan",
  "Laboran",
  "Penjaga Sekolah",
  "Lainnya",
];
const statusOptions = ["PNS", "PPPK", "GTY", "GTT", "Honor Daerah", "Lainnya"];
const agamaOptions = [
  "Islam",
  "Kristen Protestan",
  "KristenKatolik",
  "Hindu",
  "Buddha",
  "Khonghucu",
];
const perkawinanOpts = ["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"];

const fetchGuru = (search, jenis) =>
  api
    .get("/operator/master-data/guru", { params: { search, jenis_ptk: jenis } })
    .then((r) => r.data.data);

const defaultForm = {
  nuptk: "",
  nip: "",
  nik: "",
  nama_lengkap: "",
  jenis_kelamin: "L",
  tanggal_lahir: "",
  tempat_lahir: "",
  agama: "Islam",
  status_perkawinan: "Belum Kawin",
  jenis_ptk: "Guru Kelas",
  status_kepegawaian: "GTT",
  golongan: "",
  tmt_golongan: "",
  no_hp: "",
  email: "",
  alamat_jalan: "",
  rt: "",
  rw: "",
  desa: "",
  kecamatan: "",
  kabupaten: "",
  provinsi: "",
  kode_pos: "",
};

// ── Modal ──────────────────────────────────────────────────
function ModalGuru({ open, onClose, editData, queryClient }) {
  const isEdit = !!editData;
  const [form, setForm] = useState(defaultForm);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(editData ?? defaultForm);
      setPreview(
        editData?.foto
          ? `http://127.0.0.1:8001/storage/${editData.foto}`
          : null,
      );
    }
  }, [open, editData]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      // Simpan data dulu
      const { _foto, ...payload } = data;
      const res = isEdit
        ? await api.put(`/operator/master-data/guru/${editData.nuptk}`, payload)
        : await api.post("/operator/master-data/guru", payload);

      // Upload foto kalau ada
      if (_foto) {
        const fd = new FormData();
        fd.append("foto", _foto);
        await api.post(
          `/operator/master-data/guru/${res.data.data.nuptk}/foto`,
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      }

      return res;
    },
    onSuccess: () => {
      toast.success(
        `Data guru berhasil ${isEdit ? "diperbarui" : "ditambahkan"}.`,
      );
      queryClient.invalidateQueries(["master-guru"]);
      queryClient.invalidateQueries(["guru-detail"]);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800">
            {isEdit ? "Edit Data Guru" : "Tambah Data Guru"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Foto Profil */}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="relative">
              <div className="w-16 h-16 rounded-xl bg-blue-100 overflow-hidden flex items-center justify-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-blue-700 font-bold text-xl">
                    {form.nama_lengkap?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center shadow"
              >
                <Camera className="w-3 h-3 text-white" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPreview(URL.createObjectURL(file));
                    setForm((f) => ({ ...f, _foto: file }));
                  }
                }}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Foto Profil</p>
              <p className="text-xs text-gray-400">JPG/PNG, maks 2MB</p>
            </div>
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Data Pribadi
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                value={form.nama_lengkap}
                onChange={(e) => set("nama_lengkap", e.target.value)}
                className="input-field"
                placeholder="Nama lengkap guru"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NUPTK <span className="text-red-500">*</span>
              </label>
              <input
                value={form.nuptk}
                onChange={(e) => set("nuptk", e.target.value)}
                className="input-field"
                placeholder="16 digit NUPTK"
                disabled={isEdit}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIP
              </label>
              <input
                value={form.nip}
                onChange={(e) => set("nip", e.target.value)}
                className="input-field"
                placeholder="NIP (opsional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIK
              </label>
              <input
                value={form.nik}
                onChange={(e) => set("nik", e.target.value)}
                className="input-field"
                placeholder="16 digit NIK"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                value={form.jenis_kelamin}
                onChange={(e) => set("jenis_kelamin", e.target.value)}
                className="input-field"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempat Lahir <span className="text-red-500">*</span>
              </label>
              <input
                value={form.tempat_lahir}
                onChange={(e) => set("tempat_lahir", e.target.value)}
                className="input-field"
                placeholder="Kota tempat lahir"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.tanggal_lahir}
                onChange={(e) => set("tanggal_lahir", e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agama <span className="text-red-500">*</span>
              </label>
              <select
                value={form.agama}
                onChange={(e) => set("agama", e.target.value)}
                className="input-field"
              >
                {agamaOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Perkawinan
              </label>
              <select
                value={form.status_perkawinan}
                onChange={(e) => set("status_perkawinan", e.target.value)}
                className="input-field"
              >
                {perkawinanOpts.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. HP
              </label>
              <input
                value={form.no_hp}
                onChange={(e) => set("no_hp", e.target.value)}
                className="input-field"
                placeholder="Nomor WhatsApp aktif"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="input-field"
                placeholder="Email guru"
              />
            </div>
          </div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">
            Kepegawaian
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis PTK <span className="text-red-500">*</span>
              </label>
              <select
                value={form.jenis_ptk}
                onChange={(e) => set("jenis_ptk", e.target.value)}
                className="input-field"
              >
                {jenisPtkOptions.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Kepegawaian <span className="text-red-500">*</span>
              </label>
              <select
                value={form.status_kepegawaian}
                onChange={(e) => set("status_kepegawaian", e.target.value)}
                className="input-field"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Golongan
              </label>
              <input
                value={form.golongan}
                onChange={(e) => set("golongan", e.target.value)}
                className="input-field"
                placeholder="Contoh: III/a"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TMT Golongan
              </label>
              <input
                type="date"
                value={form.tmt_golongan}
                onChange={(e) => set("tmt_golongan", e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">
            Alamat
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Jalan
              </label>
              <textarea
                value={form.alamat_jalan}
                onChange={(e) => set("alamat_jalan", e.target.value)}
                className="input-field resize-none"
                rows={2}
                placeholder="Nama jalan, nomor rumah"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RT
              </label>
              <input
                value={form.rt}
                onChange={(e) => set("rt", e.target.value)}
                className="input-field"
                placeholder="001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RW
              </label>
              <input
                value={form.rw}
                onChange={(e) => set("rw", e.target.value)}
                className="input-field"
                placeholder="001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desa/Kelurahan
              </label>
              <input
                value={form.desa}
                onChange={(e) => set("desa", e.target.value)}
                className="input-field"
                placeholder="Nama desa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kecamatan
              </label>
              <input
                value={form.kecamatan}
                onChange={(e) => set("kecamatan", e.target.value)}
                className="input-field"
                placeholder="Nama kecamatan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kabupaten/Kota
              </label>
              <input
                value={form.kabupaten}
                onChange={(e) => set("kabupaten", e.target.value)}
                className="input-field"
                placeholder="Nama kabupaten"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provinsi
              </label>
              <input
                value={form.provinsi}
                onChange={(e) => set("provinsi", e.target.value)}
                className="input-field"
                placeholder="Nama provinsi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode Pos
              </label>
              <input
                value={form.kode_pos}
                onChange={(e) => set("kode_pos", e.target.value)}
                className="input-field"
                placeholder="12345"
              />
            </div>
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

// ── Main Page ──────────────────────────────────────────────
export default function MasterGuru() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [jenis, setJenis] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["master-guru", search, jenis],
    queryFn: () => fetchGuru(search, jenis),
    keepPreviousData: true,
  });

  const hapus = useMutation({
    mutationFn: (nuptk) => api.delete(`/operator/master-data/guru/${nuptk}`),
    onSuccess: () => {
      toast.success("Data guru berhasil dihapus.");
      queryClient.invalidateQueries(["master-guru"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus."),
  });

  const openEdit = (guru) => {
    setEditData({
      ...guru,
      tanggal_lahir: guru.tanggal_lahir?.split("T")[0] ?? "",
      tmt_golongan: guru.tmt_golongan?.split("T")[0] ?? "",
    });
    setModalOpen(true);
  };

  const gurus = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Data Guru</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola data seluruh guru dan tenaga pendidik
          </p>
        </div>
        <button
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Guru
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau NUPTK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
            className="input-field w-full sm:w-48"
          >
            <option value="">Semua Jenis PTK</option>
            {jenisPtkOptions.map((j) => (
              <option key={j} value={j}>
                {j}
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
                  Nama Guru
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  NUPTK
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Jenis PTK
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  No. HP
                </th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : gurus.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    Belum ada data guru.
                  </td>
                </tr>
              ) : (
                gurus.map((g) => (
                  <tr
                    key={g.nuptk}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {g.foto ? (
                            <img
                              src={`http://127.0.0.1:8001/storage/${g.foto}`}
                              alt={g.nama_lengkap}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-700 font-semibold text-xs">
                              {g.nama_lengkap?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {g.nama_lengkap}
                          </p>
                          <p className="text-xs text-gray-400">
                            {g.jenis_kelamin === "L"
                              ? "Laki-laki"
                              : "Perempuan"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                      {g.nuptk}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                        {g.jenis_ptk}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                        {g.status_kepegawaian}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {g.no_hp ?? "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            navigate(`/operator/master/guru/${g.nuptk}`)
                          }
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                          title="Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(g)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus data guru ${g.nama_lengkap}?`))
                              hapus.mutate(g.nuptk);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                          title="Hapus"
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
            Menampilkan {gurus.length} dari {data.total} guru
          </div>
        )}
      </div>

      <ModalGuru
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
