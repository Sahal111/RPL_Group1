import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001";

/* ─────────────────────────────────────────
   OPTION CONSTANTS
───────────────────────────────────────── */
const jenisMutasiOpts = [
  { value: "mutasi_keluar", label: "Mutasi Keluar" },
  { value: "mutasi_masuk", label: "Mutasi Masuk" },
  { value: "lulus", label: "Lulus" },
  { value: "drop_out", label: "Drop Out" },
  { value: "mengundurkan_diri", label: "Mengundurkan Diri" },
  { value: "meninggal_dunia", label: "Meninggal Dunia" },
];

/* jenis yg butuh info sekolah tujuan */
const needsSekolahTujuan = ["mutasi_keluar", "mutasi_masuk"];

/* ─────────────────────────────────────────
   DEFAULT FORM
───────────────────────────────────────── */
const defaultForm = {
  jenis_mutasi: "mutasi_keluar",
  tanggal_mutasi: "",
  alasan: "",
  sekolah_tujuan: "",
  npsn_tujuan: "",
  no_surat: "",
  catatan_internal: "",
};

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function MutasiSiswa() {
  const { nisn } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(defaultForm);
  const [suratFile, setSuratFile] = useState(null);
  const [dokumenFiles, setDokumenFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const suratRef = useRef();
  const dokumenRef = useRef();

  /* ── Fetch data siswa ── */
  const { data: siswa, isLoading } = useQuery({
    queryKey: ["siswa-mutasi", nisn],
    queryFn: () =>
      api.get(`/operator/master-data/siswa/${nisn}`).then((r) => r.data.data),
  });

  /* ── Submit mutasi ── */
  const mutation = useMutation({
    mutationFn: (fd) =>
      api.post(`/operator/master-data/siswa/${nisn}/mutasi`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      toast.success("Data mutasi berhasil disimpan.");
      navigate("/operator/master/siswa");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menyimpan mutasi."),
  });

  /* ── Helpers ── */
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const resetForm = () => {
    setForm(defaultForm);
    setSuratFile(null);
    setDokumenFiles([]);
  };

  const handleSuratChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setSuratFile(file);
  };

  const handleDokumenChange = (files) => {
    const arr = Array.from(files);
    setDokumenFiles((prev) => [...prev, ...arr]);
  };

  const removeDokumen = (idx) =>
    setDokumenFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (!form.jenis_mutasi) return toast.error("Pilih jenis mutasi.");
    if (!form.tanggal_mutasi) return toast.error("Isi tanggal mutasi.");
    if (needsSekolahTujuan.includes(form.jenis_mutasi) && !form.sekolah_tujuan)
      return toast.error("Isi nama sekolah tujuan.");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (suratFile) fd.append("surat_keterangan", suratFile);
    dokumenFiles.forEach((f) => fd.append("dokumen_pendukung[]", f));

    mutation.mutate(fd);
  };

  /* ── Loading state ── */
  if (isLoading)
    return (
      <div className="flex items-center justify-center py-40">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-text-secondary font-medium">
            Memuat data siswa…
          </p>
        </div>
      </div>
    );

  if (!siswa)
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <span className="material-symbols-outlined text-[64px] text-text-secondary">
          person_off
        </span>
        <p className="text-text-secondary font-medium">
          Data siswa tidak ditemukan.
        </p>
        <button
          onClick={() => navigate("/operator/master/siswa")}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-[12px] text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          Kembali ke Daftar Siswa
        </button>
      </div>
    );

  /* ── Derived ── */
  const fotoUrl = siswa.foto ? `${BASE_URL}/storage/${siswa.foto}` : null;
  const isL = siswa.jenis_kelamin === "L";
  const kelasAktif =
    siswa.kelas_aktif ?? siswa.kelas ?? siswa.kelas_nama ?? null;
  const statusPd = siswa.status_pd ?? "Aktif";
  const isAktif =
    typeof statusPd === "string" && statusPd.toLowerCase() === "aktif";
  const waliKelas = siswa.wali_kelas ?? siswa.wali_kelas_nama ?? null;
  const tahunAjaran =
    siswa.tahun_ajaran ?? siswa.tahun_pelajaran ?? "2024/2025";
  const showSekolahSection = needsSekolahTujuan.includes(form.jenis_mutasi);

  const jenisMutasiLabel =
    jenisMutasiOpts.find((o) => o.value === form.jenis_mutasi)?.label ?? "";

  return (
    <div className="space-y-6 pb-28">
      {/* ── Breadcrumb ── */}
      <nav
        className="flex items-center gap-1.5 text-sm mt-1"
        aria-label="Breadcrumb"
      >
        <button
          onClick={() => navigate("/operator/master/siswa")}
          className="text-text-secondary hover:text-text-primary transition-colors font-medium"
        >
          Data Master
        </button>
        <span className="material-symbols-outlined text-[14px] text-text-secondary">
          chevron_right
        </span>
        <button
          onClick={() => navigate("/operator/master/siswa")}
          className="text-text-secondary hover:text-text-primary transition-colors font-medium"
        >
          Siswa
        </button>
        <span className="material-symbols-outlined text-[14px] text-text-secondary">
          chevron_right
        </span>
        <span className="text-text-primary font-semibold">Tambah Mutasi</span>
      </nav>

      {/* ══════════════════════════════════════════
          STUDENT PROFILE CARD (read-only)
      ══════════════════════════════════════════ */}
      <section className="bg-white rounded-[18px] border border-border-light shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:gap-8 items-start sm:items-center">
        {/* Photo */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 ${
              isAktif ? "border-primary/20" : "border-border-light"
            } shadow-sm bg-surface-container-low flex items-center justify-center`}
          >
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={siswa.nama_lengkap}
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className={`text-3xl font-extrabold ${
                  isL ? "text-info" : "text-tertiary"
                }`}
              >
                {siswa.nama_lengkap?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
            )}
          </div>
          {isAktif && (
            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1 rounded-lg border-2 border-white shadow-sm">
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3">
          {/* Left col */}
          <div>
            <h2 className="font-headline text-[18px] sm:text-[20px] font-bold text-primary mb-1 leading-tight">
              {siswa.nama_lengkap ?? "—"}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-text-secondary">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">
                  fingerprint
                </span>
                {siswa.nisn ?? "—"}
                {siswa.nis || siswa.no_induk
                  ? ` / ${siswa.nis ?? siswa.no_induk}`
                  : ""}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">
                  person
                </span>
                {isL ? "Laki-laki" : "Perempuan"}
              </span>
              {(siswa.tempat_lahir || siswa.tanggal_lahir) && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">
                    calendar_month
                  </span>
                  {[siswa.tempat_lahir, siswa.tanggal_lahir?.split("T")[0]]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
            </div>
          </div>

          {/* Right col */}
          <div className="lg:border-l lg:pl-8 flex flex-col justify-center gap-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className={`px-3 py-1 text-[11px] font-bold rounded-full border uppercase tracking-wide ${
                  isAktif
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }`}
              >
                {statusPd}
              </span>
              {kelasAktif && (
                <span className="text-[14px] font-semibold text-text-primary">
                  {kelasAktif}
                </span>
              )}
            </div>
            {waliKelas && (
              <p className="text-[13px] text-text-secondary">
                Wali Kelas:{" "}
                <span className="font-semibold text-text-primary">
                  {waliKelas}
                </span>
              </p>
            )}
            <p className="text-[12px] text-text-secondary">
              Tahun Ajaran: {tahunAjaran}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MUTATION FORM CARD
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-[18px] border border-border-light shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 bg-surface-container-low border-b border-border-light">
          <h3 className="font-headline text-[17px] font-bold text-primary">
            Formulir Mutasi Siswa
          </h3>
          <p className="text-[13px] text-text-secondary mt-0.5">
            Silakan lengkapi data mutasi untuk memproses pemindahan atau
            kelulusan siswa.
          </p>
        </div>

        <div className="p-5 sm:p-8 space-y-8">
          {/* ── Section 1: Core Fields ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 lg:gap-x-8 gap-y-5 sm:gap-y-6">
            {/* Jenis Mutasi */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-text-primary">
                Jenis Mutasi <span className="text-error">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.jenis_mutasi}
                  onChange={(e) => set("jenis_mutasi", e.target.value)}
                  className="w-full bg-surface-container-lowest border border-border-light rounded-[12px] py-3 px-4 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[14px] text-text-primary"
                >
                  {jenisMutasiOpts.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary text-[20px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Tanggal Mutasi */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-text-primary">
                Tanggal Mutasi <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={form.tanggal_mutasi}
                onChange={(e) => set("tanggal_mutasi", e.target.value)}
                className="w-full bg-surface-container-lowest border border-border-light rounded-[12px] py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[14px] text-text-primary"
              />
            </div>

            {/* Alasan — full width */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-[13px] font-semibold text-text-primary">
                Alasan Mutasi
              </label>
              <textarea
                rows={3}
                value={form.alasan}
                onChange={(e) => set("alasan", e.target.value)}
                placeholder="Contoh: Mengikuti perpindahan tugas orang tua ke luar kota…"
                className="w-full bg-surface-container-lowest border border-border-light rounded-[12px] py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[14px] text-text-primary resize-none"
              />
            </div>
          </div>

          {/* ── Section 2: Dynamic — Sekolah Tujuan / Info Lulus ── */}
          {showSekolahSection && (
            <div className="pt-6 border-t border-border-light space-y-5 sm:space-y-6">
              {/* Section title */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[18px]">
                    transfer_within_a_station
                  </span>
                </div>
                <h4 className="font-headline text-[15px] font-bold text-primary">
                  Informasi Sekolah Tujuan
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 lg:gap-x-8 gap-y-5 sm:gap-y-6">
                {/* Sekolah Tujuan */}
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-text-primary">
                    Sekolah Tujuan <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.sekolah_tujuan}
                    onChange={(e) => set("sekolah_tujuan", e.target.value)}
                    placeholder="Nama sekolah penerima"
                    className="w-full bg-surface-container-lowest border border-border-light rounded-[12px] py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[14px] text-text-primary"
                  />
                </div>

                {/* NPSN Tujuan */}
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-text-primary">
                    NPSN Tujuan
                  </label>
                  <input
                    type="text"
                    value={form.npsn_tujuan}
                    onChange={(e) => set("npsn_tujuan", e.target.value)}
                    placeholder="Masukkan 8 digit NPSN"
                    maxLength={8}
                    className="w-full bg-surface-container-lowest border border-border-light rounded-[12px] py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[14px] text-text-primary"
                  />
                </div>

                {/* Nomor Surat */}
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-text-primary">
                    Nomor Surat Mutasi <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.no_surat}
                    onChange={(e) => set("no_surat", e.target.value)}
                    placeholder="Contoh: 421.3/001/SMA/2024"
                    className="w-full bg-surface-container-lowest border border-border-light rounded-[12px] py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[14px] text-text-primary"
                  />
                </div>

                {/* Upload Surat */}
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-text-primary">
                    Upload Surat Keterangan{" "}
                    <span className="text-error">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      ref={suratRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleSuratChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div
                      className={`border-2 border-dashed rounded-[12px] p-3 flex items-center justify-between transition-all ${
                        suratFile
                          ? "border-primary bg-primary/5"
                          : "border-border-light group-hover:border-primary bg-surface-container-lowest"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`material-symbols-outlined text-[20px] flex-shrink-0 ${
                            suratFile
                              ? "text-primary"
                              : "text-text-secondary group-hover:text-primary"
                          }`}
                        >
                          {suratFile ? "check_circle" : "upload_file"}
                        </span>
                        <span
                          className={`text-[13px] truncate ${
                            suratFile
                              ? "text-primary font-medium"
                              : "text-text-secondary"
                          }`}
                        >
                          {suratFile ? suratFile.name : "Pilih file PDF/JPG…"}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-text-secondary uppercase ml-2 flex-shrink-0">
                        Maks 2MB
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lulus / DO / Meninggal — info sederhana */}
          {!showSekolahSection && (
            <div className="pt-6 border-t border-border-light">
              <div className="flex items-start gap-3 p-4 bg-warning/5 border border-warning/20 rounded-[12px]">
                <span className="material-symbols-outlined text-warning text-[20px] mt-0.5 flex-shrink-0">
                  info
                </span>
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  Jenis mutasi{" "}
                  <strong className="text-text-primary">
                    {jenisMutasiLabel}
                  </strong>{" "}
                  tidak memerlukan informasi sekolah tujuan. Pastikan alasan
                  mutasi sudah diisi dengan lengkap dan benar.
                </p>
              </div>
            </div>
          )}

          {/* ── Section 3: Catatan & Dokumen Pendukung ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-6 border-t border-border-light">
            {/* Catatan Internal */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-text-primary">
                Catatan Internal
              </label>
              <textarea
                rows={4}
                value={form.catatan_internal}
                onChange={(e) => set("catatan_internal", e.target.value)}
                placeholder="Catatan tambahan bagi tata usaha…"
                className="w-full bg-surface-container-lowest border border-border-light rounded-[12px] py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[14px] text-text-primary resize-none"
              />
            </div>

            {/* Dokumen Pendukung */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-text-primary">
                Dokumen Pendukung Lainnya
              </label>

              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded-[12px] transition-all flex flex-col items-center justify-center text-center cursor-pointer group ${
                  dragOver
                    ? "border-primary bg-primary/5 scale-[0.99]"
                    : "border-border-light hover:border-primary hover:bg-primary/5"
                } ${dokumenFiles.length > 0 ? "py-5" : "py-8"}`}
                onClick={() => dokumenRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleDokumenChange(e.dataTransfer.files);
                }}
              >
                <input
                  ref={dokumenRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDokumenChange(e.target.files)}
                  className="hidden"
                />
                <div className="w-11 h-11 rounded-full bg-surface-container-high group-hover:bg-primary/10 flex items-center justify-center mb-2.5 transition-colors">
                  <span className="material-symbols-outlined text-[24px] text-text-secondary group-hover:text-primary">
                    cloud_upload
                  </span>
                </div>
                <p className="text-[13px] font-semibold text-text-primary">
                  Klik untuk unggah atau seret file
                </p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  PDF, PNG, JPG (Maks. 5MB per file)
                </p>
              </div>

              {/* File chips */}
              {dokumenFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {dokumenFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-full border border-border-light text-[12px] text-text-primary font-medium max-w-[180px]"
                    >
                      <span className="material-symbols-outlined text-[14px] text-primary flex-shrink-0">
                        attach_file
                      </span>
                      <span className="truncate">{f.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDokumen(i);
                        }}
                        className="ml-0.5 text-text-secondary hover:text-error transition-colors flex-shrink-0"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          close
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STICKY BOTTOM ACTION BAR
      ══════════════════════════════════════════ */}
      <div className="fixed bottom-0 right-0 left-0 md:left-[290px] bg-white/95 backdrop-blur-sm border-t border-border-light px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-40 shadow-lg gap-3">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-text-secondary font-semibold text-[13px] sm:text-[14px] hover:bg-surface-container-low rounded-[12px] transition-all group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          <span className="hidden sm:inline">Kembali</span>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 sm:px-6 py-2.5 border border-border-light text-text-secondary font-semibold text-[13px] sm:text-[14px] hover:bg-surface-container-low rounded-[12px] transition-all"
          >
            Reset Form
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="px-5 sm:px-8 py-2.5 bg-primary text-white font-bold text-[13px] sm:text-[14px] rounded-[12px] shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {mutation.isPending ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                <span className="hidden sm:inline">Menyimpan…</span>
              </>
            ) : (
              <>
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  save
                </span>
                <span className="hidden xs:inline">Simpan Data Mutasi</span>
                <span className="xs:hidden">Simpan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
