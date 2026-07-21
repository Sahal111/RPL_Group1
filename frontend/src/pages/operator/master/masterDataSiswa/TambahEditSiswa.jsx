import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

const agamaOptions = [
  "Islam",
  "Kristen Protestan",
  "KristenKatolik",
  "Hindu",
  "Buddha",
  "Khonghucu",
];
const statusPdOpts = ["Aktif", "Mutasi Keluar", "Lulus", "Dropout", "Meninggal"];
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
  golongan_darah: "",
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
const getPrimaryOrangTua = (o) => (Array.isArray(o) ? o[0] ?? {} : o ?? {});
const parentDisplayName = (o) =>
  o?.nama_ayah || o?.nama_ibu || o?.nama_wali || o?.email || `Orang tua #${o?.id}`;

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

export default function TambahEditSiswa() {
  const { nisn } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!nisn;

  const [currentStep, setCurrentStep] = useState(1);
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

  // Fetch student data if edit mode
  const { data: siswaData, isLoading: isLoadingSiswa } = useQuery({
    queryKey: ["siswa-detail-form", nisn],
    queryFn: () =>
      api.get(`/operator/master-data/siswa/${nisn}`).then((r) => r.data.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (siswaData && isEdit) {
      setForm(normalizeForm(siswaData));
      setPreview(
        siswaData?.foto ? `http://127.0.0.1:8001/storage/${siswaData.foto}` : null
      );
    }
  }, [siswaData, isEdit]);

  // Query search parent options
  const { data: parentOptions = [], isFetching: isFetchingParents } = useQuery({
    queryKey: ["orang-tua-options", parentSearch, searchBy],
    queryFn: () =>
      api
        .get("/operator/master-data/siswa/orang-tua-options", {
          params: { search: parentSearch, search_by: searchBy },
        })
        .then((res) => res.data.data ?? []),
    enabled: parentSearch.trim().length >= 2,
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

  // Submit Mutation
  const mutation = useMutation({
    mutationFn: async (data) => {
      const { _foto, ...payload } = data;
      const res = isEdit
        ? await api.put(`/operator/master-data/siswa/${nisn}`, payload)
        : await api.post("/operator/master-data/siswa", payload);
      if (_foto) {
        const fd = new FormData();
        fd.append("foto", _foto);
        const targetNisn = res.data?.data?.nisn || data.nisn;
        await api.post(`/operator/master-data/siswa/${targetNisn}/foto`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      return res;
    },
    onSuccess: () => {
      toast.success(
        `Data siswa berhasil ${isEdit ? "diperbarui" : "ditambahkan"}.`
      );
      queryClient.invalidateQueries(["master-siswa"]);
      navigate("/operator/master/siswa");
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

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!form.nama_lengkap.trim()) {
        toast.error("Nama lengkap wajib diisi.");
        return;
      }
      if (!form.nisn.trim()) {
        toast.error("NISN wajib diisi.");
        return;
      }
      if (!form.tempat_lahir.trim() || !form.tanggal_lahir) {
        toast.error("Tempat & tanggal lahir wajib diisi.");
        return;
      }
    }
    if (currentStep < 4) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/operator/master/siswa");
    }
  };

  const stepLineWidth =
    currentStep === 1
      ? "0%"
      : currentStep === 2
      ? "33%"
      : currentStep === 3
      ? "66%"
      : "100%";

  if (isEdit && isLoadingSiswa) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin">
          progress_activity
        </span>
        <p className="text-sm font-medium text-text-secondary">
          Memuat data siswa...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
      {/* Top Title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-text-secondary text-[13px] mb-2">
            <span
              onClick={() => navigate("/operator/master/siswa")}
              className="hover:text-primary cursor-pointer transition-colors"
            >
              Data Siswa
            </span>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-text-primary font-bold">
              {isEdit ? "Edit Siswa" : "Tambah Siswa"}
            </span>
          </div>
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-primary mb-1 tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {isEdit ? "Edit Data Siswa" : "Tambah Siswa Baru"}
          </h2>
          <p className="text-sm text-text-secondary">
            Lengkapi formulir pendaftaran siswa baru secara bertahap.
          </p>
        </div>
        <button
          onClick={() => navigate("/operator/master/siswa")}
          className="px-4 py-2 bg-white border border-border-light rounded-xl font-bold text-sm text-text-primary hover:bg-surface-container-low transition-all self-start sm:self-auto flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          Kembali
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-[18px] border border-border-light shadow-sm overflow-hidden">
        {/* Stepper */}
        <div className="px-4 sm:px-8 pt-8 pb-6 border-b border-border-light bg-surface-container-lowest relative z-10">
          <div className="relative max-w-2xl mx-auto">
            {/* Background Line */}
            <div className="absolute top-4 left-0 w-full h-[2px] bg-border-light -z-10" />
            {/* Active Line */}
            <div
              className="absolute top-4 left-0 h-[2px] bg-primary -z-10 transition-all duration-300"
              style={{ width: stepLineWidth }}
            />

            <div className="flex justify-between relative z-10">
              {[
                { step: 1, label: "Identitas" },
                { step: 2, label: "Keluarga" },
                { step: 3, label: "Alamat" },
                { step: 4, label: "Lainnya" },
              ].map((s) => {
                const isActive = currentStep === s.step;
                const isCompleted = currentStep > s.step;
                return (
                  <div
                    key={s.step}
                    onClick={() => {
                      if (s.step < currentStep || isEdit) setCurrentStep(s.step);
                    }}
                    className={`flex flex-col items-center gap-2 cursor-pointer group`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-4 border-white transition-all shadow-sm ${
                        isActive
                          ? "bg-primary text-white scale-110"
                          : isCompleted
                          ? "bg-primary-container text-white"
                          : "bg-surface-container-high text-text-secondary"
                      }`}
                    >
                      {isCompleted ? (
                        <span className="material-symbols-outlined text-[16px]">
                          check
                        </span>
                      ) : (
                        s.step
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        isActive
                          ? "text-primary font-bold"
                          : isCompleted
                          ? "text-text-primary"
                          : "text-text-secondary"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 1: Identitas Siswa */}
        {currentStep === 1 && (
          <div className="p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                badge
              </span>
              Identitas Siswa
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Lengkap */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Nama Lengkap <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  maxLength={150}
                  value={form.nama_lengkap}
                  onChange={(e) => set("nama_lengkap", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  placeholder="Masukkan nama lengkap sesuai ijazah"
                />
              </div>

              {/* NISN */}
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  NISN <span className="text-danger">*</span>
                  {nisnError && (
                    <span className="text-danger lowercase font-normal ml-1">
                      ({nisnError})
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={form.nisn}
                  onChange={(e) => {
                    set("nisn", e.target.value);
                    setNisnError("");
                  }}
                  disabled={isEdit}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    nisnError ? "border-danger" : "border-border-light"
                  } bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm disabled:opacity-60`}
                  placeholder="10 digit nomor NISN"
                />
              </div>

              {/* NIS */}
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  NIS (No. Induk)
                </label>
                <input
                  type="text"
                  value={form.no_induk}
                  onChange={(e) => set("no_induk", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  placeholder="Nomor Induk Siswa lokal (Opsional)"
                />
              </div>

              {/* NIK */}
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  NIK Siswa
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={form.nik}
                  onChange={(e) => set("nik", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  placeholder="16 digit NIK Siswa"
                />
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Jenis Kelamin <span className="text-danger">*</span>
                </label>
                <select
                  value={form.jenis_kelamin}
                  onChange={(e) => set("jenis_kelamin", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              {/* Tempat Lahir */}
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Tempat Lahir <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={form.tempat_lahir}
                  onChange={(e) => set("tempat_lahir", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  placeholder="Kota/Kabupaten kelahiran"
                />
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Tanggal Lahir <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  value={form.tanggal_lahir}
                  onChange={(e) => set("tanggal_lahir", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                />
              </div>

              {/* Agama */}
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Agama <span className="text-danger">*</span>
                </label>
                <select
                  value={form.agama}
                  onChange={(e) => set("agama", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                >
                  {agamaOptions.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              {/* Golongan Darah */}
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Golongan Darah
                </label>
                <select
                  value={form.golongan_darah || ""}
                  onChange={(e) => set("golongan_darah", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                >
                  <option value="">Pilih Gol. Darah</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                  <option value="-">Tidak Tahu</option>
                </select>
              </div>

              {/* Kewarganegaraan */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Kewarganegaraan <span className="text-danger">*</span>
                </label>
                <div className="flex gap-6 items-center">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-primary">
                    <input
                      type="radio"
                      name="warga"
                      value="WNI"
                      checked={form.kewarganegaraan === "WNI"}
                      onChange={(e) => set("kewarganegaraan", e.target.value)}
                      className="text-primary focus:ring-primary w-4 h-4"
                    />
                    WNI
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-primary">
                    <input
                      type="radio"
                      name="warga"
                      value="WNA"
                      checked={form.kewarganegaraan === "WNA"}
                      onChange={(e) => set("kewarganegaraan", e.target.value)}
                      className="text-primary focus:ring-primary w-4 h-4"
                    />
                    WNA
                  </label>
                </div>
              </div>

              {/* Foto Upload */}
              <div className="col-span-1 md:col-span-2 mt-2">
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Foto Siswa
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border-light rounded-2xl p-6 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container-high transition-all cursor-pointer group relative overflow-hidden"
                >
                  {preview ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={preview}
                        alt="Foto Siswa"
                        className="w-24 h-32 object-cover rounded-xl shadow-md border border-white"
                      />
                      <p className="text-xs text-primary font-bold">
                        Klik untuk mengganti foto
                      </p>
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-text-secondary text-4xl mb-2 group-hover:text-primary transition-colors">
                        add_a_photo
                      </span>
                      <p className="text-sm font-semibold text-text-primary mb-1">
                        Klik untuk unggah foto siswa
                      </p>
                      <p className="text-xs text-text-secondary">
                        PNG, JPG maksimal 2MB (Rasio 3:4)
                      </p>
                    </>
                  )}
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
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Data Keluarga */}
        {currentStep === 2 && (
          <div className="p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                family_restroom
              </span>
              Data Keluarga
            </h3>

            {/* Existing Parent Box */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
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
                    className="text-xs font-bold text-danger hover:text-danger/80 transition-colors"
                  >
                    Bersihkan Choice
                  </button>
                )}
              </div>

              <select
                value={searchBy}
                onChange={(e) => {
                  setSearchBy(e.target.value);
                  setParentSearch("");
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-border-light bg-white text-sm"
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
                <input
                  value={parentSearch}
                  onChange={(e) => setParentSearch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Ketik minimal 2 huruf untuk mencari..."
                />
              </div>

              {form.orang_tua_id && (
                <div className="rounded-xl bg-white border border-primary/30 p-3 text-xs text-primary font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    check_circle
                  </span>
                  Data Terpilih: {parentDisplayName(form.orang_tua)}
                </div>
              )}

              {parentSearch.trim().length >= 2 && !form.orang_tua_id && (
                <div className="rounded-xl bg-white border border-border-light divide-y divide-border-light overflow-hidden shadow-sm">
                  {isFetchingParents ? (
                    <p className="p-3 text-xs text-text-secondary">
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
                        <p className="text-sm font-bold text-text-primary">
                          {parentDisplayName(ortu)}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          Ayah: {ortu.nama_ayah || "-"} · Ibu:{" "}
                          {ortu.nama_ibu || "-"}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="p-3 text-xs text-text-secondary">
                      Data orang tua tidak ditemukan. Isi data keluarga baru di
                      bawah.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Status dalam Keluarga <span className="text-danger">*</span>
                </label>
                <select
                  value={form.status_dalam_keluarga}
                  onChange={(e) => set("status_dalam_keluarga", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 text-sm"
                >
                  {keluargaOpts.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Anak ke-
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.anak_ke}
                  onChange={(e) => set("anak_ke", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 text-sm"
                  placeholder="Contoh: 1"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  No. Kartu Keluarga (KK)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={form.no_kk}
                  onChange={(e) => set("no_kk", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 text-sm"
                  placeholder="16 digit No. KK"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  No. Akta Lahir
                </label>
                <input
                  type="text"
                  value={form.no_akta_lahir}
                  onChange={(e) => set("no_akta_lahir", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 text-sm"
                  placeholder="Nomor Akta Kelahiran"
                />
              </div>
            </div>

            {/* Ayah */}
            <div className="border-t border-border-light pt-4 space-y-4">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                Data Ayah Kandung
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Nama Ayah
                  </label>
                  <input
                    value={form.orang_tua?.nama_ayah ?? ""}
                    onChange={(e) => setOrangTua("nama_ayah", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-light text-sm"
                    placeholder="Nama lengkap ayah kandung"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    NIK Ayah
                  </label>
                  <input
                    value={form.orang_tua?.nik_ayah ?? ""}
                    onChange={(e) => setOrangTua("nik_ayah", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-light text-sm"
                    placeholder="16 digit NIK"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Pekerjaan Ayah
                  </label>
                  <input
                    value={form.orang_tua?.pekerjaan_ayah ?? ""}
                    onChange={(e) => setOrangTua("pekerjaan_ayah", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-light text-sm"
                    placeholder="PNS, Wiraswasta, dll."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Pendidikan Ayah
                  </label>
                  <select
                    value={form.orang_tua?.pendidikan_ayah ?? ""}
                    onChange={(e) => setOrangTua("pendidikan_ayah", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-light text-sm"
                  >
                    <option value="">-- Pilih --</option>
                    {pendidikanOpts.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Penghasilan Ayah
                  </label>
                  <select
                    value={form.orang_tua?.penghasilan_ayah ?? ""}
                    onChange={(e) => setOrangTua("penghasilan_ayah", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-light text-sm"
                  >
                    <option value="">-- Pilih --</option>
                    {penghasilanOpts.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Ibu */}
            <div className="border-t border-border-light pt-4 space-y-4">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                Data Ibu Kandung
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Nama Ibu
                  </label>
                  <input
                    value={form.orang_tua?.nama_ibu ?? ""}
                    onChange={(e) => setNamaIbu(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-light text-sm"
                    placeholder="Nama lengkap ibu kandung"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    NIK Ibu
                  </label>
                  <input
                    value={form.orang_tua?.nik_ibu ?? ""}
                    onChange={(e) => setOrangTua("nik_ibu", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-light text-sm"
                    placeholder="16 digit NIK"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Pekerjaan Ibu
                  </label>
                  <input
                    value={form.orang_tua?.pekerjaan_ibu ?? ""}
                    onChange={(e) => setOrangTua("pekerjaan_ibu", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-light text-sm"
                    placeholder="IRT, PNS, Swasta, dll."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Alamat */}
        {currentStep === 3 && (
          <div className="p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                location_on
              </span>
              Alamat Siswa
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Alamat Jalan <span className="text-danger">*</span>
                </label>
                <textarea
                  rows={2}
                  value={form.alamat_jalan}
                  onChange={(e) => set("alamat_jalan", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                  placeholder="Nama jalan, RT/RW, Dusun"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  RT
                </label>
                <input
                  type="text"
                  value={form.rt}
                  onChange={(e) => set("rt", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light text-sm"
                  placeholder="001"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  RW
                </label>
                <input
                  type="text"
                  value={form.rw}
                  onChange={(e) => set("rw", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light text-sm"
                  placeholder="001"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Desa / Kelurahan
                </label>
                <input
                  type="text"
                  value={form.desa}
                  onChange={(e) => set("desa", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light text-sm"
                  placeholder="Nama desa/kelurahan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Kecamatan
                </label>
                <input
                  type="text"
                  value={form.kecamatan}
                  onChange={(e) => set("kecamatan", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light text-sm"
                  placeholder="Nama kecamatan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Kabupaten / Kota
                </label>
                <input
                  type="text"
                  value={form.kabupaten}
                  onChange={(e) => set("kabupaten", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light text-sm"
                  placeholder="Nama kabupaten"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Provinsi
                </label>
                <input
                  type="text"
                  value={form.provinsi}
                  onChange={(e) => set("provinsi", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light text-sm"
                  placeholder="Nama provinsi"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Kode Pos
                </label>
                <input
                  type="text"
                  value={form.kode_pos}
                  onChange={(e) => set("kode_pos", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light text-sm"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Sekolah & Lainnya */}
        {currentStep === 4 && (
          <div className="p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                school
              </span>
              Data Sekolah & Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Status Siswa <span className="text-danger">*</span>
                </label>
                <select
                  value={form.status_pd}
                  onChange={(e) => set("status_pd", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 text-sm"
                >
                  {statusPdOpts.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Tanggal Masuk <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  value={form.tanggal_masuk}
                  onChange={(e) => set("tanggal_masuk", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light text-sm"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Asal Sekolah
                </label>
                <input
                  type="text"
                  value={form.asal_sekolah}
                  onChange={(e) => set("asal_sekolah", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light text-sm"
                  placeholder="Nama sekolah asal (TK / SD sebelumnya)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Nomor HP Siswa / WA
                </label>
                <input
                  type="text"
                  value={form.no_hp}
                  onChange={(e) => set("no_hp", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light text-sm"
                  placeholder="Nomor HP siswa (Opsional)"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-6 border-t border-border-light bg-surface-container-lowest flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={handlePrevStep}
            className="px-6 py-2.5 rounded-xl border border-border-light bg-white text-text-primary font-semibold text-sm hover:bg-surface-container-low transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            {currentStep === 1 ? "Batal" : "Sebelumnya"}
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
            >
              Lanjutkan
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              {mutation.isPending ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    check_circle
                  </span>
                  {isEdit ? "Perbarui Data Siswa" : "Simpan Siswa"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
