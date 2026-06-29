import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import toast from "react-hot-toast";
import { Plus, Search, Pencil, Trash2, X, Eye, Camera } from "lucide-react";

const agamaOptions = [
  "Islam",
  "Kristen Protestan",
  "KristenKatolik",
  "Hindu",
  "Buddha",
  "Khonghucu",
];
const statusPdOpts = [
  "Aktif",
  "Mutasi Keluar",
  "Lulus",
  "Dropout",
  "Meninggal",
];
const keluargaOpts = ["Anak Kandung", "AnakTiri", "Anak Angkat"];

const defaultForm = {
  nisn: "",
  nik: "",
  no_induk: "",
  nama_lengkap: "",
  jenis_kelamin: "L",
  tanggal_lahir: "",
  tempat_lahir: "",
  agama: "Islam",
  status_dalam_keluarga: "Anak Kandung",
  anak_ke: "",
  no_kk: "",
  no_akta_lahir: "",
  nama_ibu_kandung: "",
  kewarganegaraan: "WNI",
  alamat_jalan: "",
  rt: "",
  rw: "",
  desa: "",
  kecamatan: "",
  kabupaten: "",
  provinsi: "",
  kode_pos: "",
  no_hp: "",
  status_pd: "Aktif",
  asal_sekolah: "",
  tanggal_masuk: "",
};

function ModalSiswa({ open, onClose, editData, queryClient }) {
  const isEdit = !!editData;
  const [form, setForm] = useState(defaultForm);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
      const { _foto, ...payload } = data;
      const res = isEdit
        ? await api.put(`/operator/master-data/siswa/${editData.nisn}`, payload)
        : await api.post("/operator/master-data/siswa", payload);

      if (_foto) {
        const fd = new FormData();
        fd.append("foto", _foto);
        await api.post(
          `/operator/master-data/siswa/${res.data.data.nisn}/foto`,
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
        `Data siswa berhasil ${isEdit ? "diperbarui" : "ditambahkan"}.`,
      );
      queryClient.invalidateQueries(["master-siswa"]);
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
            {isEdit ? "Edit Data Siswa" : "Tambah Data Siswa"}
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Foto */}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="relative">
              <div
                className={`w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center ${form.jenis_kelamin === "L" ? "bg-blue-100" : "bg-pink-100"}`}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span
                    className={`font-bold text-xl ${form.jenis_kelamin === "L" ? "text-blue-700" : "text-pink-700"}`}
                  >
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
              <p className="text-sm font-medium text-gray-700">Foto Siswa</p>
              <p className="text-xs text-gray-400">JPG/PNG, maks 2MB</p>
            </div>
          </div>

          {/* Data Pribadi */}
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
                placeholder="Nama lengkap siswa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NISN <span className="text-red-500">*</span>
              </label>
              <input
                value={form.nisn}
                onChange={(e) => set("nisn", e.target.value)}
                className="input-field"
                placeholder="10 digit NISN"
                disabled={isEdit}
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
                No. Induk
              </label>
              <input
                value={form.no_induk}
                onChange={(e) => set("no_induk", e.target.value)}
                className="input-field"
                placeholder="Nomor induk sekolah"
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
                Kewarganegaraan
              </label>
              <select
                value={form.kewarganegaraan}
                onChange={(e) => set("kewarganegaraan", e.target.value)}
                className="input-field"
              >
                <option value="WNI">WNI</option>
                <option value="WNA">WNA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. HP Ortu
              </label>
              <input
                value={form.no_hp}
                onChange={(e) => set("no_hp", e.target.value)}
                className="input-field"
                placeholder="Nomor HP"
              />
            </div>
          </div>

          {/* Data Keluarga */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">
            Data Keluarga
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Ibu Kandung <span className="text-red-500">*</span>
              </label>
              <input
                value={form.nama_ibu_kandung}
                onChange={(e) => set("nama_ibu_kandung", e.target.value)}
                className="input-field"
                placeholder="Nama ibu kandung"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status dalam Keluarga <span className="text-red-500">*</span>
              </label>
              <select
                value={form.status_dalam_keluarga}
                onChange={(e) => set("status_dalam_keluarga", e.target.value)}
                className="input-field"
              >
                {keluargaOpts.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anak ke-
              </label>
              <input
                type="number"
                value={form.anak_ke}
                onChange={(e) => set("anak_ke", e.target.value)}
                className="input-field"
                placeholder="1"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. KK
              </label>
              <input
                value={form.no_kk}
                onChange={(e) => set("no_kk", e.target.value)}
                className="input-field"
                placeholder="16 digit No. KK"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Akta Lahir
              </label>
              <input
                value={form.no_akta_lahir}
                onChange={(e) => set("no_akta_lahir", e.target.value)}
                className="input-field"
                placeholder="Nomor akta lahir"
              />
            </div>
          </div>

          {/* Alamat */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">
            Alamat
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Jalan <span className="text-red-500">*</span>
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

          {/* Data Sekolah */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">
            Data Sekolah
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={form.status_pd}
                onChange={(e) => set("status_pd", e.target.value)}
                className="input-field"
              >
                {statusPdOpts.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Masuk <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.tanggal_masuk}
                onChange={(e) => set("tanggal_masuk", e.target.value)}
                className="input-field"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asal Sekolah
              </label>
              <input
                value={form.asal_sekolah}
                onChange={(e) => set("asal_sekolah", e.target.value)}
                className="input-field"
                placeholder="Nama sekolah asal (TK/SD sebelumnya)"
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

export default function MasterSiswa() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["master-siswa", search, status],
    queryFn: () =>
      api
        .get("/operator/master-data/siswa", { params: { search, status } })
        .then((r) => r.data.data),
    keepPreviousData: true,
  });

  const hapus = useMutation({
    mutationFn: (nisn) => api.delete(`/operator/master-data/siswa/${nisn}`),
    onSuccess: () => {
      toast.success("Data siswa dihapus.");
      queryClient.invalidateQueries(["master-siswa"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus."),
  });

  const openEdit = (s) => {
    setEditData({
      ...s,
      tanggal_lahir: s.tanggal_lahir?.split("T")[0] ?? "",
      tanggal_masuk: s.tanggal_masuk?.split("T")[0] ?? "",
    });
    setModalOpen(true);
  };

  const siswaList = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Master Data Siswa
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola data seluruh siswa MI Nurul Huda 3
          </p>
        </div>
        <button
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Siswa
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau NISN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field w-full sm:w-44"
          >
            <option value="">Semua Status</option>
            {statusPdOpts.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-3 text-gray-500 font-medium">
                Nama Siswa
              </th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">
                NISN
              </th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">
                L/P
              </th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">
                Agama
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
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  Memuat data...
                </td>
              </tr>
            ) : siswaList.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  Belum ada data siswa.
                </td>
              </tr>
            ) : (
              siswaList.map((s) => (
                <tr key={s.nisn} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${s.jenis_kelamin === "L" ? "bg-blue-100" : "bg-pink-100"}`}
                      >
                        {s.foto ? (
                          <img
                            src={`http://127.0.0.1:8001/storage/${s.foto}`}
                            alt={s.nama_lengkap}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span
                            className={`font-semibold text-xs ${s.jenis_kelamin === "L" ? "text-blue-700" : "text-pink-700"}`}
                          >
                            {s.nama_lengkap?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {s.nama_lengkap}
                        </p>
                        <p className="text-xs text-gray-400">
                          {s.tempat_lahir}, {s.tanggal_lahir?.split("T")[0]}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">
                    {s.nisn}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.jenis_kelamin === "L" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"}`}
                    >
                      {s.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{s.agama}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.status_pd === "Aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      {s.status_pd}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() =>
                          navigate(`/operator/master/siswa/${s.nisn}`)
                        }
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(s)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus data siswa ${s.nama_lengkap}?`))
                            hapus.mutate(s.nisn);
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
        {data?.total > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
            Menampilkan {siswaList.length} dari {data.total} siswa
          </div>
        )}
      </div>

      <ModalSiswa
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
