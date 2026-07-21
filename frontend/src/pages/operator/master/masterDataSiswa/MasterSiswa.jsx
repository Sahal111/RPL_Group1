import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";
import { Camera, X, Search } from "lucide-react";

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
const pendidikanOpts = [
  "Tidak Sekolah",
  "SD",
  "SMP",
  "SMA",
  "D1",
  "D2",
  "D3",
  "S1",
  "S2",
  "S3",
];
const penghasilanOpts = [
  "Tidak Berpenghasilan",
  "< 500rb",
  "500rb - 1jt",
  "1jt - 2jt",
  "2jt - 3jt",
  "3jt - 5jt",
  "> 5jt",
];

const emptyOrangTua = {
  nama_ayah: "",
  nik_ayah: "",
  tahun_lahir_ayah: "",
  pendidikan_ayah: "",
  pekerjaan_ayah: "",
  penghasilan_ayah: "",
  nama_ibu: "",
  nik_ibu: "",
  tahun_lahir_ibu: "",
  pendidikan_ibu: "",
  pekerjaan_ibu: "",
  penghasilan_ibu: "",
  nama_wali: "",
  nik_wali: "",
  hubungan_wali: "",
  pekerjaan_wali: "",
  penghasilan_wali: "",
  no_hp_ayah: "",
  no_hp_ibu: "",
  no_hp_wali: "",
  email: "",
  alamat: "",
};

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
  orang_tua_id: "",
  orang_tua: emptyOrangTua,
};

const yearFromDate = (v) => (v ? String(v).slice(0, 4) : "");
const getPrimaryOrangTua = (o) => (Array.isArray(o) ? (o[0] ?? {}) : (o ?? {}));
const parentDisplayName = (o) =>
  o?.nama_ayah ||
  o?.nama_ibu ||
  o?.nama_wali ||
  o?.email ||
  `Orang tua #${o?.id}`;

const normalizeOrangTua = (ortu) => {
  const d = getPrimaryOrangTua(ortu);
  return {
    ...emptyOrangTua,
    ...d,
    tahun_lahir_ayah: d.tahun_lahir_ayah ?? yearFromDate(d.tanggal_lahir_ayah),
    tahun_lahir_ibu: d.tahun_lahir_ibu ?? yearFromDate(d.tanggal_lahir_ibu),
  };
};

const normalizeForm = (data) => ({
  ...defaultForm,
  ...(data ?? {}),
  orang_tua_id: getPrimaryOrangTua(data?.orang_tua)?.id ?? "",
  orang_tua: {
    ...normalizeOrangTua(data?.orang_tua),
    nama_ibu:
      getPrimaryOrangTua(data?.orang_tua)?.nama_ibu ??
      data?.nama_ibu_kandung ??
      "",
  },
});

const statusConfig = {
  Aktif: {
    bg: "bg-success/5",
    text: "text-success",
    border: "border-success/20",
  },
  "Mutasi Keluar": {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/20",
  },
  Lulus: { bg: "bg-info/10", text: "text-info", border: "border-info/20" },
  Dropout: {
    bg: "bg-danger/10",
    text: "text-danger",
    border: "border-danger/20",
  },
  Meninggal: {
    bg: "bg-gray-100",
    text: "text-gray-500",
    border: "border-gray-200",
  },
};
const getStatusStyle = (s) =>
  statusConfig[s] || {
    bg: "bg-gray-100",
    text: "text-gray-500",
    border: "border-gray-200",
  };

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text-primary transition-all";

function FamilySection({ title, children }) {
  return (
    <div className="border-t border-border-light pt-4">
      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">
        {title}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function ModalSiswa({ open, onClose, editData, queryClient }) {
  const isEdit = !!editData;
  const [form, setForm] = useState(defaultForm);
  const [preview, setPreview] = useState(null);
  const [parentSearch, setParentSearch] = useState("");
  const [searchBy, setSearchBy] = useState("all");
  const [nisnError, setNisnError] = useState("");
  const fileRef = useRef();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setOrangTua = (k, v) =>
    setForm((f) => ({
      ...f,
      unlink_orang_tua: false,
      orang_tua: { ...emptyOrangTua, ...(f.orang_tua ?? {}), [k]: v },
    }));
  const setNamaIbu = (value) =>
    setForm((f) => ({
      ...f,
      unlink_orang_tua: false,
      nama_ibu_kandung: value,
      orang_tua: { ...emptyOrangTua, ...(f.orang_tua ?? {}), nama_ibu: value },
    }));

  useEffect(() => {
    if (open) {
      setForm(normalizeForm(editData));
      setPreview(
        editData?.foto
          ? `http://127.0.0.1:8001/storage/${editData.foto}`
          : null,
      );
      setParentSearch("");
      setSearchBy("all");
      setNisnError("");
    }
  }, [open, editData]);

  const { data: parentOptions = [], isFetching: isFetchingParents } = useQuery({
    queryKey: ["orang-tua-options", parentSearch, searchBy, open],
    queryFn: () =>
      api
        .get("/operator/master-data/siswa/orang-tua-options", {
          params: { search: parentSearch, search_by: searchBy },
        })
        .then((res) => res.data.data ?? []),
    enabled: open && parentSearch.trim().length >= 2,
  });

  const selectExistingParent = (ortu) => {
    const normalized = normalizeOrangTua(ortu);
    setForm((prev) => ({
      ...prev,
      orang_tua_id: ortu.id,
      unlink_orang_tua: false,
      nama_ibu_kandung: normalized.nama_ibu || prev.nama_ibu_kandung,
      orang_tua: normalized,
    }));
    setParentSearch(parentDisplayName(ortu));
    toast.success("Data orang tua lama dipakai untuk siswa ini.");
  };

  const clearSelectedParent = () => {
    setForm((prev) => ({
      ...prev,
      orang_tua_id: "",
      orang_tua: emptyOrangTua,
      unlink_orang_tua: true,
    }));
    setParentSearch("");
    setSearchBy("all");
  };

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
      if (errors) {
        Object.entries(errors).forEach(([field, messages]) => {
          if (field === "nisn") setNisnError(messages[0]);
          messages.forEach((msg) => toast.error(msg));
        });
      } else {
        toast.error(err.response?.data?.message ?? "Gagal menyimpan.");
      }
    },
  });

  if (!open) return null;

  const isL = form.jenis_kelamin === "L";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-auto backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-4 border border-border-light overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">
                {isEdit ? "edit" : "person_add"}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-base">
                {isEdit ? "Edit Data Siswa" : "Tambah Siswa Baru"}
              </h3>
              <p className="text-[11px] text-text-secondary">
                {isEdit
                  ? `Memperbarui: ${editData?.nama_lengkap}`
                  : "Isi formulir data siswa dengan lengkap"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-secondary hover:text-danger hover:bg-danger/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* Foto */}
          <div className="flex items-center gap-4 pb-4 border-b border-border-light">
            <div className="relative">
              <div
                className={`w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shadow-soft ${isL ? "bg-info/10" : "bg-tertiary/10"}`}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span
                    className={`font-bold text-2xl ${isL ? "text-info" : "text-tertiary"}`}
                  >
                    {form.nama_lengkap?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-soft hover:bg-primary/90 transition-all"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setPreview(URL.createObjectURL(f));
                    setForm((x) => ({ ...x, _foto: f }));
                  }
                }}
              />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Foto Siswa</p>
              <p className="text-xs text-text-secondary mt-0.5">
                JPG atau PNG, maksimal 2MB
              </p>
            </div>
          </div>

          {/* Data Pribadi */}
          <div>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">
              Data Pribadi
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nama Lengkap *" className="sm:col-span-2">
                <input
                  value={form.nama_lengkap}
                  onChange={(e) => set("nama_lengkap", e.target.value)}
                  className={inputCls}
                  placeholder="Nama lengkap siswa"
                />
              </Field>
              <Field label={`NISN *${nisnError ? " — " + nisnError : ""}`}>
                <input
                  value={form.nisn}
                  onChange={(e) => {
                    set("nisn", e.target.value);
                    setNisnError("");
                  }}
                  className={`${inputCls} ${nisnError ? "border-danger" : ""}`}
                  placeholder="10 digit NISN"
                  disabled={isEdit}
                />
              </Field>
              <Field label="NIK">
                <input
                  value={form.nik}
                  onChange={(e) => set("nik", e.target.value)}
                  className={inputCls}
                  placeholder="16 digit NIK"
                />
              </Field>
              <Field label="No. Induk">
                <input
                  value={form.no_induk}
                  onChange={(e) => set("no_induk", e.target.value)}
                  className={inputCls}
                  placeholder="Nomor induk sekolah"
                />
              </Field>
              <Field label="Jenis Kelamin *">
                <select
                  value={form.jenis_kelamin}
                  onChange={(e) => set("jenis_kelamin", e.target.value)}
                  className={inputCls}
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </Field>
              <Field label="Tempat Lahir *">
                <input
                  value={form.tempat_lahir}
                  onChange={(e) => set("tempat_lahir", e.target.value)}
                  className={inputCls}
                  placeholder="Kota tempat lahir"
                />
              </Field>
              <Field label="Tanggal Lahir *">
                <input
                  type="date"
                  value={form.tanggal_lahir}
                  onChange={(e) => set("tanggal_lahir", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Agama *">
                <select
                  value={form.agama}
                  onChange={(e) => set("agama", e.target.value)}
                  className={inputCls}
                >
                  {agamaOptions.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Kewarganegaraan">
                <select
                  value={form.kewarganegaraan}
                  onChange={(e) => set("kewarganegaraan", e.target.value)}
                  className={inputCls}
                >
                  <option value="WNI">WNI</option>
                  <option value="WNA">WNA</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Cari Orang Tua */}
          <div>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">
              Data Keluarga
            </p>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3 mb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    Pakai Data Orang Tua yang Sudah Ada
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Cari berdasarkan nama, NIK, nomor HP, atau email.
                  </p>
                </div>
                {form.orang_tua_id && (
                  <button
                    type="button"
                    onClick={clearSelectedParent}
                    className="text-xs font-bold text-danger hover:text-danger/80 whitespace-nowrap"
                  >
                    Bersihkan
                  </button>
                )}
              </div>
              <select
                value={searchBy}
                onChange={(e) => {
                  setSearchBy(e.target.value);
                  setParentSearch("");
                }}
                className={inputCls}
              >
                <option value="all">
                  Semua (Nama, NIK, HP, Email, NISN Anak, No. KK)
                </option>
                <option value="nik">NIK Ayah/Ibu/Wali</option>
                <option value="no_kk">No. KK Anak</option>
                <option value="nama">Nama Ayah/Ibu/Wali</option>
                <option value="no_hp">Nomor HP/WA</option>
                <option value="nisn">NISN atau Nama Anak</option>
              </select>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  value={parentSearch}
                  onChange={(e) => setParentSearch(e.target.value)}
                  className={`${inputCls} pl-10`}
                  placeholder="Ketik minimal 2 huruf untuk mencari..."
                />
                {parentSearch && (
                  <button
                    type="button"
                    onClick={() => setParentSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {form.orang_tua_id && (
                <div className="rounded-xl bg-white border border-primary/20 p-3 text-sm text-primary font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    check_circle
                  </span>
                  Terpilih: <b>{parentDisplayName(form.orang_tua)}</b>
                </div>
              )}
              {parentSearch.trim().length >= 2 && !form.orang_tua_id && (
                <div className="rounded-xl bg-white border border-border-light divide-y divide-border-light overflow-hidden shadow-soft">
                  {isFetchingParents ? (
                    <p className="p-3 text-sm text-text-secondary">
                      Mencari data orang tua...
                    </p>
                  ) : parentOptions.length > 0 ? (
                    parentOptions.map((ortu) => (
                      <button
                        key={ortu.id}
                        type="button"
                        onClick={() => selectExistingParent(ortu)}
                        className="w-full text-left p-3 hover:bg-surface-container-low transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-text-primary">
                              {parentDisplayName(ortu)}
                            </p>
                            <p className="text-xs text-text-secondary mt-1">
                              Ayah: {ortu.nama_ayah || "-"} · Ibu:{" "}
                              {ortu.nama_ibu || "-"}
                            </p>
                            {ortu.siswa?.length > 0 && (
                              <p className="text-xs text-primary font-medium mt-0.5">
                                Anak:{" "}
                                {ortu.siswa
                                  .map((s) => s.nama_lengkap)
                                  .join(", ")}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                            {ortu.siswa?.length ?? 0} anak
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="p-3 text-sm text-text-secondary">
                      Tidak ditemukan. Isi data keluarga baru di bawah.
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Status dalam Keluarga *">
                <select
                  value={form.status_dalam_keluarga}
                  onChange={(e) => set("status_dalam_keluarga", e.target.value)}
                  className={inputCls}
                >
                  {keluargaOpts.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Anak ke-">
                <input
                  type="number"
                  value={form.anak_ke}
                  onChange={(e) => set("anak_ke", e.target.value)}
                  className={inputCls}
                  placeholder="1"
                  min="1"
                />
              </Field>
              <Field label="No. KK">
                <input
                  value={form.no_kk}
                  onChange={(e) => set("no_kk", e.target.value)}
                  className={inputCls}
                  placeholder="16 digit No. KK"
                />
              </Field>
              <Field label="No. Akta Lahir">
                <input
                  value={form.no_akta_lahir}
                  onChange={(e) => set("no_akta_lahir", e.target.value)}
                  className={inputCls}
                  placeholder="Nomor akta lahir"
                />
              </Field>
            </div>
          </div>

          <FamilySection title="Data Ayah Kandung">
            <Field label="Nama Lengkap" className="sm:col-span-2">
              <input
                value={form.orang_tua?.nama_ayah ?? ""}
                onChange={(e) => setOrangTua("nama_ayah", e.target.value)}
                className={inputCls}
                placeholder="Sesuai KK atau akta kelahiran"
              />
            </Field>
            <Field label="NIK">
              <input
                value={form.orang_tua?.nik_ayah ?? ""}
                onChange={(e) => setOrangTua("nik_ayah", e.target.value)}
                className={inputCls}
                placeholder="16 digit NIK"
              />
            </Field>
            <Field label="Tahun Lahir">
              <input
                type="number"
                value={form.orang_tua?.tahun_lahir_ayah ?? ""}
                onChange={(e) =>
                  setOrangTua("tahun_lahir_ayah", e.target.value)
                }
                className={inputCls}
                min="1900"
                max={new Date().getFullYear()}
                placeholder="1980"
              />
            </Field>
            <Field label="Pendidikan Terakhir">
              <select
                value={form.orang_tua?.pendidikan_ayah ?? ""}
                onChange={(e) => setOrangTua("pendidikan_ayah", e.target.value)}
                className={inputCls}
              >
                <option value="">-- Pilih --</option>
                {pendidikanOpts.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Pekerjaan Utama">
              <input
                value={form.orang_tua?.pekerjaan_ayah ?? ""}
                onChange={(e) => setOrangTua("pekerjaan_ayah", e.target.value)}
                className={inputCls}
                placeholder="PNS, Karyawan, Wiraswasta"
              />
            </Field>
            <Field label="Penghasilan Bulanan">
              <select
                value={form.orang_tua?.penghasilan_ayah ?? ""}
                onChange={(e) =>
                  setOrangTua("penghasilan_ayah", e.target.value)
                }
                className={inputCls}
              >
                <option value="">-- Pilih --</option>
                {penghasilanOpts.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Nomor HP/WA">
              <input
                value={form.orang_tua?.no_hp_ayah ?? ""}
                onChange={(e) => setOrangTua("no_hp_ayah", e.target.value)}
                className={inputCls}
                placeholder="Nomor aktif"
              />
            </Field>
          </FamilySection>

          <FamilySection title="Data Ibu Kandung">
            <Field label="Nama Lengkap" className="sm:col-span-2">
              <input
                value={form.orang_tua?.nama_ibu ?? ""}
                onChange={(e) => setNamaIbu(e.target.value)}
                className={inputCls}
                placeholder="Sesuai KK atau akta kelahiran"
              />
            </Field>
            <Field label="NIK">
              <input
                value={form.orang_tua?.nik_ibu ?? ""}
                onChange={(e) => setOrangTua("nik_ibu", e.target.value)}
                className={inputCls}
                placeholder="16 digit NIK"
              />
            </Field>
            <Field label="Tahun Lahir">
              <input
                type="number"
                value={form.orang_tua?.tahun_lahir_ibu ?? ""}
                onChange={(e) => setOrangTua("tahun_lahir_ibu", e.target.value)}
                className={inputCls}
                min="1900"
                max={new Date().getFullYear()}
                placeholder="1980"
              />
            </Field>
            <Field label="Pendidikan Terakhir">
              <select
                value={form.orang_tua?.pendidikan_ibu ?? ""}
                onChange={(e) => setOrangTua("pendidikan_ibu", e.target.value)}
                className={inputCls}
              >
                <option value="">-- Pilih --</option>
                {pendidikanOpts.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Pekerjaan Utama">
              <input
                value={form.orang_tua?.pekerjaan_ibu ?? ""}
                onChange={(e) => setOrangTua("pekerjaan_ibu", e.target.value)}
                className={inputCls}
                placeholder="PNS, Karyawan, IRT"
              />
            </Field>
            <Field label="Penghasilan Bulanan">
              <select
                value={form.orang_tua?.penghasilan_ibu ?? ""}
                onChange={(e) => setOrangTua("penghasilan_ibu", e.target.value)}
                className={inputCls}
              >
                <option value="">-- Pilih --</option>
                {penghasilanOpts.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Nomor HP/WA">
              <input
                value={form.orang_tua?.no_hp_ibu ?? ""}
                onChange={(e) => setOrangTua("no_hp_ibu", e.target.value)}
                className={inputCls}
                placeholder="Nomor aktif"
              />
            </Field>
          </FamilySection>

          <FamilySection title="Data Wali (Opsional)">
            <Field label="Nama Lengkap" className="sm:col-span-2">
              <input
                value={form.orang_tua?.nama_wali ?? ""}
                onChange={(e) => setOrangTua("nama_wali", e.target.value)}
                className={inputCls}
                placeholder="Diisi jika siswa tinggal/ditanggung wali"
              />
            </Field>
            <Field label="NIK">
              <input
                value={form.orang_tua?.nik_wali ?? ""}
                onChange={(e) => setOrangTua("nik_wali", e.target.value)}
                className={inputCls}
                placeholder="16 digit NIK"
              />
            </Field>
            <Field label="Hubungan dengan Siswa">
              <input
                value={form.orang_tua?.hubungan_wali ?? ""}
                onChange={(e) => setOrangTua("hubungan_wali", e.target.value)}
                className={inputCls}
                placeholder="Kakek, Nenek, Paman"
              />
            </Field>
            <Field label="Pekerjaan Utama">
              <input
                value={form.orang_tua?.pekerjaan_wali ?? ""}
                onChange={(e) => setOrangTua("pekerjaan_wali", e.target.value)}
                className={inputCls}
                placeholder="Pekerjaan wali"
              />
            </Field>
            <Field label="Penghasilan Bulanan">
              <select
                value={form.orang_tua?.penghasilan_wali ?? ""}
                onChange={(e) =>
                  setOrangTua("penghasilan_wali", e.target.value)
                }
                className={inputCls}
              >
                <option value="">-- Pilih --</option>
                {penghasilanOpts.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Nomor HP/WA">
              <input
                value={form.orang_tua?.no_hp_wali ?? ""}
                onChange={(e) => setOrangTua("no_hp_wali", e.target.value)}
                className={inputCls}
                placeholder="Nomor aktif"
              />
            </Field>
          </FamilySection>

          <FamilySection title="Kontak & Domisili Orang Tua/Wali">
            <Field label="Email">
              <input
                type="email"
                value={form.orang_tua?.email ?? ""}
                onChange={(e) => setOrangTua("email", e.target.value)}
                className={inputCls}
                placeholder="email@example.com"
              />
            </Field>
            <Field label="Alamat Domisili" className="sm:col-span-2">
              <textarea
                value={form.orang_tua?.alamat ?? ""}
                onChange={(e) => setOrangTua("alamat", e.target.value)}
                className={`${inputCls} resize-none`}
                rows={2}
                placeholder="Alamat tinggal saat ini"
              />
            </Field>
          </FamilySection>

          {/* Alamat Siswa */}
          <div>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">
              Alamat Siswa
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Alamat Jalan *" className="sm:col-span-2">
                <textarea
                  value={form.alamat_jalan}
                  onChange={(e) => set("alamat_jalan", e.target.value)}
                  className={`${inputCls} resize-none`}
                  rows={2}
                  placeholder="Nama jalan, nomor rumah"
                />
              </Field>
              <Field label="RT">
                <input
                  value={form.rt}
                  onChange={(e) => set("rt", e.target.value)}
                  className={inputCls}
                  placeholder="001"
                />
              </Field>
              <Field label="RW">
                <input
                  value={form.rw}
                  onChange={(e) => set("rw", e.target.value)}
                  className={inputCls}
                  placeholder="001"
                />
              </Field>
              <Field label="Desa/Kelurahan">
                <input
                  value={form.desa}
                  onChange={(e) => set("desa", e.target.value)}
                  className={inputCls}
                  placeholder="Nama desa"
                />
              </Field>
              <Field label="Kecamatan">
                <input
                  value={form.kecamatan}
                  onChange={(e) => set("kecamatan", e.target.value)}
                  className={inputCls}
                  placeholder="Nama kecamatan"
                />
              </Field>
              <Field label="Kabupaten/Kota">
                <input
                  value={form.kabupaten}
                  onChange={(e) => set("kabupaten", e.target.value)}
                  className={inputCls}
                  placeholder="Nama kabupaten"
                />
              </Field>
              <Field label="Provinsi">
                <input
                  value={form.provinsi}
                  onChange={(e) => set("provinsi", e.target.value)}
                  className={inputCls}
                  placeholder="Nama provinsi"
                />
              </Field>
              <Field label="Kode Pos">
                <input
                  value={form.kode_pos}
                  onChange={(e) => set("kode_pos", e.target.value)}
                  className={inputCls}
                  placeholder="12345"
                />
              </Field>
            </div>
          </div>

          {/* Data Sekolah */}
          <div>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">
              Data Sekolah
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Status *">
                <select
                  value={form.status_pd}
                  onChange={(e) => set("status_pd", e.target.value)}
                  className={inputCls}
                >
                  {statusPdOpts.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tanggal Masuk *">
                <input
                  type="date"
                  value={form.tanggal_masuk}
                  onChange={(e) => set("tanggal_masuk", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Asal Sekolah" className="sm:col-span-2">
                <input
                  value={form.asal_sekolah}
                  onChange={(e) => set("asal_sekolah", e.target.value)}
                  className={inputCls}
                  placeholder="Nama sekolah asal (TK/SD sebelumnya)"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border-light bg-surface-container-lowest">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-2.5 bg-white border border-border-light rounded-xl font-bold text-sm text-text-primary hover:bg-surface-container-low transition-all"
          >
            Batal
          </button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            className="flex-1 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-soft disabled:opacity-60 active:scale-[0.98]"
          >
            {mutation.isPending ? (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  progress_activity
                </span>{" "}
                Menyimpan...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  {isEdit ? "save" : "person_add"}
                </span>{" "}
                {isEdit ? "Perbarui Data" : "Simpan Siswa"}
              </>
            )}
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
  const total = data?.total ?? 0;
  const totalAktif = siswaList.filter((s) => s.status_pd === "Aktif").length;
  const totalL = siswaList.filter((s) => s.jenis_kelamin === "L").length;
  const totalP = siswaList.filter((s) => s.jenis_kelamin === "P").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-text-secondary text-[13px] mb-2">
            <span className="hover:text-primary cursor-pointer transition-colors">
              Data Master
            </span>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-text-primary font-bold">Siswa</span>
          </div>
          <h1
            className="text-2xl font-extrabold text-text-primary tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Data Siswa
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Kelola seluruh data siswa MI Nurul Huda 3
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-white border border-border-light rounded-xl font-bold text-sm text-text-primary hover:bg-surface-container-low transition-all flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">
              upload_file
            </span>
            Import Excel
          </button>
          <button
            onClick={() => navigate("/operator/master/siswa/tambah")}
            className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-soft hover:shadow-lg active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">
              person_add
            </span>
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-border-light shadow-soft hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">
                groups
              </span>
            </div>
          </div>
          <p className="text-text-secondary text-xs font-medium">Total Siswa</p>
          <h3 className="text-2xl font-extrabold text-text-primary mt-0.5">
            {isLoading ? "—" : total || siswaList.length}
          </h3>
        </div>
        <div className="bg-white rounded-xl p-5 border border-border-light shadow-soft hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
              <span className="material-symbols-outlined text-[22px]">
                how_to_reg
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-success/10 text-success rounded-full">
              Aktif
            </span>
          </div>
          <p className="text-text-secondary text-xs font-medium">Siswa Aktif</p>
          <h3 className="text-2xl font-extrabold text-text-primary mt-0.5">
            {isLoading ? "—" : totalAktif}
          </h3>
        </div>
        <div className="bg-white rounded-xl p-5 border border-border-light shadow-soft hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center text-info">
              <span className="material-symbols-outlined text-[22px]">boy</span>
            </div>
          </div>
          <p className="text-text-secondary text-xs font-medium">Siswa Putra</p>
          <h3 className="text-2xl font-extrabold text-text-primary mt-0.5">
            {isLoading ? "—" : totalL}
          </h3>
        </div>
        <div className="bg-white rounded-xl p-5 border border-border-light shadow-soft hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[22px]">
                girl
              </span>
            </div>
          </div>
          <p className="text-text-secondary text-xs font-medium">Siswa Putri</p>
          <h3 className="text-2xl font-extrabold text-text-primary mt-0.5">
            {isLoading ? "—" : totalP}
          </h3>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[18px] border border-border-light shadow-soft overflow-hidden">
        {/* Controls */}
        <div className="px-6 py-4 border-b border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative max-w-sm w-full group">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-[20px] group-focus-within:text-primary transition-colors">
                search
              </span>
              <input
                type="text"
                placeholder="Cari nama atau NISN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-surface-container-lowest border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2.5 bg-white border border-border-light rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            >
              <option value="">Semua Status</option>
              {statusPdOpts.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <button className="px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-primary hover:bg-surface-container-low transition-all flex items-center gap-2 text-sm font-bold">
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            Export
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest/60 border-b border-border-light">
                <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
                    Siswa{" "}
                    <span className="material-symbols-outlined text-[14px]">
                      unfold_more
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                  NISN
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                  Gender
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                  Agama
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-[40px] text-text-secondary">
                        progress_activity
                      </span>
                      <p className="text-sm text-text-secondary font-medium">
                        Memuat data siswa...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : siswaList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-[32px] text-text-secondary">
                          person_off
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">
                          Belum ada data siswa
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                          {search || status
                            ? "Coba ubah kata kunci pencarian"
                            : "Klik 'Tambah Siswa' untuk mulai"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                siswaList.map((s) => {
                  const st = getStatusStyle(s.status_pd);
                  const isL = s.jenis_kelamin === "L";
                  return (
                    <tr
                      key={s.nisn}
                      className="hover:bg-surface-container-lowest/70 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 border ${isL ? "bg-info/10 border-info/20" : "bg-tertiary/10 border-tertiary/20"} ${s.status_pd !== "Aktif" ? "grayscale opacity-60" : ""}`}
                          >
                            {s.foto ? (
                              <img
                                src={`http://127.0.0.1:8001/storage/${s.foto}`}
                                alt={s.nama_lengkap}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span
                                className={`font-bold text-sm ${isL ? "text-info" : "text-tertiary"}`}
                              >
                                {s.nama_lengkap?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p
                              className={`font-bold text-sm group-hover:text-primary transition-colors ${s.status_pd !== "Aktif" ? "text-text-secondary" : "text-text-primary"}`}
                            >
                              {s.nama_lengkap}
                            </p>
                            <p className="text-[11px] text-text-secondary">
                              {s.tempat_lahir}, {s.tanggal_lahir?.split("T")[0]}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[13px] text-text-secondary">
                        {s.nisn}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${isL ? "bg-info/10 text-info border-info/20" : "bg-tertiary/10 text-tertiary border-tertiary/20"}`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {isL ? "boy" : "girl"}
                          </span>
                          {isL ? "Laki-laki" : "Perempuan"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {s.agama}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border ${st.bg} ${st.text} ${st.border}`}
                        >
                          {s.status_pd}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              navigate(`/operator/master/siswa/${s.nisn}`)
                            }
                            className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                            title="Detail Siswa"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              visibility
                            </span>
                          </button>
                          <button
                            onClick={() => navigate(`/operator/master/siswa/edit/${s.nisn}`)}
                            className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                            title="Edit Siswa"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(`Hapus data siswa ${s.nama_lengkap}?`)
                              )
                                hapus.mutate(s.nisn);
                            }}
                            className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                            title="Hapus Siswa"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && (total > 0 || siswaList.length > 0) && (
          <div className="px-6 py-4 border-t border-border-light bg-surface-container-lowest/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-text-secondary font-medium">
              Menampilkan{" "}
              <span className="font-bold text-text-primary">
                {siswaList.length}
              </span>
              {total > 0 && total !== siswaList.length && (
                <>
                  {" "}
                  dari{" "}
                  <span className="font-bold text-text-primary">{total}</span>
                </>
              )}{" "}
              siswa
            </p>
            {(search || status) && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatus("");
                }}
                className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">
                  filter_alt_off
                </span>
                Hapus Filter
              </button>
            )}
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
