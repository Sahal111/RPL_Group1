import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

/* ──────────────────────── Option constants ──────────────────────── */
const agamaOptions = [
  "Islam",
  "Kristen Protestan",
  "Kristen Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
  "Lainnya",
];
const statusOpts = [
  { value: "aktif", label: "Aktif" },
  { value: "nonaktif", label: "Non-Aktif" },
  { value: "mutasi_keluar", label: "Mutasi Keluar" },
  { value: "lulus", label: "Lulus" },
  { value: "meninggal", label: "Meninggal" },
];
const keluargaOpts = ["Kandung", "Tiri", "Angkat"];
const pembiayaOpts = [
  "Orang Tua",
  "Sendiri",
  "Pemerintah",
  "Lembaga",
  "Lainnya",
];
const imunisasiOpts = ["Lengkap", "Tidak Lengkap", "Tidak Diketahui"];
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

/* ──────────────────────── Empty parent data ──────────────────────── */
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

/* ──────────────────────── Default form ─────────────────────────── */
const defaultForm = {
  nisn: "",
  nik: "",
  nis: "",
  no_kk: "",
  nama: "",
  jenis_kelamin: "L",
  tempat_lahir: "",
  tanggal_lahir: "",
  agama: "Islam",
  golongan_darah: "",
  kewarganegaraan: "WNI",
  nama_ibu_kandung: "",
  nama_kepala_keluarga: "",
  anak_ke: "",
  jumlah_saudara: "",
  status_dalam_keluarga: "Kandung",
  pembiaya_sekolah: "",
  kebutuhan_khusus: "",
  riwayat_penyakit: "",
  imunisasi: "",
  alamat_jalan: "",
  rt: "",
  rw: "",
  desa_kelurahan: "",
  kecamatan: "",
  kota_kabupaten: "",
  provinsi: "",
  kode_pos: "",
  jarak_tempat_tinggal: "",
  waktu_tempuh: "",
  moda_transportasi: "",
  asal_sekolah: "",
  tanggal_masuk: "",
  tingkat: "",
  status: "aktif",
  orang_tua_id: "",
  orang_tua: emptyOrangTua,
};

/* ──────────────────────── Helpers ──────────────────────── */
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

/* ══════════════════════════════════════════════════════════
   REUSABLE UI COMPONENTS (template style)
   ══════════════════════════════════════════════════════════ */

/** Base input class — matches template exactly */
const inputCls =
  "w-full px-4 py-3 rounded-[12px] border border-border-light bg-surface-container-lowest " +
  "focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-outline-variant " +
  "transition-all font-body-md text-body-md text-on-surface " +
  "placeholder:text-text-secondary placeholder:font-normal shadow-sm outline-none";

/** Select wrapper with custom chevron icon */
const SelectField = ({ value, onChange, children, disabled }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${inputCls} appearance-none cursor-pointer disabled:opacity-60`}
    >
      {children}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-secondary">
      <span className="material-symbols-outlined">expand_more</span>
    </div>
  </div>
);

const Label = ({ children, required }) => (
  <label className="block font-label-md text-label-md text-on-surface mb-2 font-bold">
    {children} {required && <span className="text-danger">*</span>}
  </label>
);

const SectionTitle = ({ icon, children }) => (
  <h3 className="font-section-title text-section-title text-on-surface mb-8 flex items-center gap-2">
    <span className="material-symbols-outlined text-primary">{icon}</span>
    {children}
  </h3>
);

const SubSectionLabel = ({ children }) => (
  <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-4">
    {children}
  </p>
);

const Divider = () => <div className="border-t border-border-light my-6" />;

/* ══════════════════════════════════════════════════════════
   STEPPER
   ══════════════════════════════════════════════════════════ */
const STEPS = [
  { step: 1, label: "Identitas" },
  { step: 2, label: "Keluarga" },
  { step: 3, label: "Alamat" },
  { step: 4, label: "Lainnya" },
];

const Stepper = ({ current, onNavigate, isEdit }) => {
  // Progress line width: 0%, 33%, 66%, 100% for steps 1-4
  const progressWidths = ["0%", "33%", "66%", "100%"];
  const progressWidth = progressWidths[current - 1];

  return (
    <div className="px-8 pt-8 pb-6 border-b border-border-light bg-surface-bright">
      <div className="relative mx-auto max-w-4xl">
        {/* Track */}
        <div className="absolute top-[18px] left-4 right-4 h-[3px] bg-border-light" />
        {/* Active progress */}
        <div
          className="absolute top-[18px] left-4 h-[3px] bg-primary-container transition-all duration-300 ease-out"
          style={{ width: `calc((100% - 2rem) * ${(current - 1) / 3})` }}
        />
        <div className="flex justify-between relative z-10">
          {STEPS.map((s) => {
            const isActive = current === s.step;
            const isCompleted = current > s.step;
            return (
              <div
                key={s.step}
                onClick={() => {
                  if (s.step < current || isEdit) onNavigate(s.step);
                }}
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-label-md font-bold border-4 border-surface-bright shadow-sm transition-all ${
                    isActive
                      ? "bg-primary text-on-primary scale-110"
                      : isCompleted
                        ? "bg-primary-container text-on-primary-container"
                        : "bg-surface-container-highest text-on-surface-variant"
                  }`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[15px]">
                      check
                    </span>
                  ) : (
                    s.step
                  )}
                </div>
                <span
                  className={`font-label-md text-label-md ${
                    isActive
                      ? "font-bold text-primary"
                      : isCompleted
                        ? "font-semibold text-on-surface"
                        : "font-semibold text-on-surface-variant"
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
  );
};

/* ══════════════════════════════════════════════════════════
   STEP 1 — Identitas Siswa
   ══════════════════════════════════════════════════════════ */
const Step1 = ({
  form,
  set,
  setNamaIbu,
  preview,
  setPreview,
  setForm,
  nisnError,
  setNisnError,
  isEdit,
  fileRef,
}) => (
  <div className="p-8">
    <SectionTitle icon="badge">Identitas Siswa</SectionTitle>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* ── Left column: Personal Details ── */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Nama Lengkap */}
        <div>
          <Label required>Nama Lengkap</Label>
          <input
            type="text"
            maxLength={150}
            value={form.nama}
            onChange={(e) => set("nama", e.target.value)}
            className={inputCls}
            placeholder="Contoh: Muhammad Ali"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NISN */}
          <div>
            <Label required>
              NISN
              {nisnError && (
                <span className="text-danger font-normal ml-1 lowercase">
                  ({nisnError})
                </span>
              )}
            </Label>
            <input
              type="text"
              maxLength={10}
              value={form.nisn}
              onChange={(e) => {
                set("nisn", e.target.value);
                setNisnError("");
              }}
              disabled={isEdit}
              className={`${inputCls} ${nisnError ? "border-danger focus:border-danger focus:ring-danger/20" : ""} disabled:opacity-60`}
              placeholder="Contoh: 0051234567"
            />
          </div>

          {/* NIS */}
          <div>
            <Label>NIS</Label>
            <input
              type="text"
              maxLength={20}
              value={form.nis}
              onChange={(e) => set("nis", e.target.value)}
              className={inputCls}
              placeholder="Nomor Induk Siswa lokal (Opsional)"
            />
          </div>

          {/* NIK */}
          <div>
            <Label>NIK</Label>
            <input
              type="text"
              maxLength={16}
              value={form.nik}
              onChange={(e) => set("nik", e.target.value)}
              className={inputCls}
              placeholder="Contoh: 327401..."
            />
          </div>

          {/* Jenis Kelamin */}
          <div>
            <Label required>Jenis Kelamin</Label>
            <SelectField
              value={form.jenis_kelamin}
              onChange={(e) => set("jenis_kelamin", e.target.value)}
            >
              <option disabled value="">
                Pilih Jenis Kelamin
              </option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </SelectField>
          </div>

          {/* Tempat Lahir */}
          <div>
            <Label required>Tempat Lahir</Label>
            <input
              type="text"
              maxLength={100}
              value={form.tempat_lahir}
              onChange={(e) => set("tempat_lahir", e.target.value)}
              className={inputCls}
              placeholder="Contoh: Jakarta"
            />
          </div>

          {/* Tanggal Lahir */}
          <div>
            <Label required>Tanggal Lahir</Label>
            <input
              type="date"
              value={form.tanggal_lahir}
              onChange={(e) => set("tanggal_lahir", e.target.value)}
              className={`${inputCls} cursor-pointer`}
            />
          </div>

          {/* Agama */}
          <div>
            <Label required>Agama</Label>
            <SelectField
              value={form.agama}
              onChange={(e) => set("agama", e.target.value)}
            >
              {agamaOptions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </SelectField>
          </div>

          {/* Golongan Darah */}
          <div>
            <Label>Golongan Darah</Label>
            <SelectField
              value={form.golongan_darah}
              onChange={(e) => set("golongan_darah", e.target.value)}
            >
              <option disabled value="">
                Pilih Gol. Darah
              </option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
              <option value="-">Tidak Tahu</option>
            </SelectField>
          </div>
        </div>

        {/* Kewarganegaraan */}
        <div>
          <Label required>Kewarganegaraan</Label>
          <div className="flex gap-6">
            {["WNI", "WNA"].map((val) => (
              <label
                key={val}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="warga"
                  value={val}
                  checked={form.kewarganegaraan === val}
                  onChange={(e) => set("kewarganegaraan", e.target.value)}
                  className="w-5 h-5 text-primary focus:ring-primary border-border-light cursor-pointer"
                />
                <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">
                  {val}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right column: Foto Upload ── */}
      <div className="lg:col-span-4 flex flex-col">
        <Label>Foto Siswa</Label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border-light rounded-[18px] p-8 flex flex-col items-center justify-center bg-surface-container-lowest hover:bg-surface-container-low hover:border-primary/50 transition-all cursor-pointer group flex-1 min-h-[300px]"
        >
          {preview ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={preview}
                alt="Foto Siswa"
                className="w-[90px] h-[120px] object-cover rounded-[12px] shadow-md border-2 border-white"
              />
              <p className="font-label-md text-label-md text-primary font-semibold text-center">
                Klik untuk mengganti foto
              </p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined text-text-secondary text-3xl group-hover:text-primary transition-colors">
                  cloud_upload
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface font-semibold mb-2 text-center group-hover:text-primary transition-colors">
                Klik untuk unggah atau seret file
              </p>
              <p className="font-label-md text-[13px] text-text-secondary text-center mb-4 font-normal">
                Mendukung PNG, JPG hingga 2MB (Rasio 3:4)
              </p>
              <button
                type="button"
                className="px-4 py-2 rounded-[12px] bg-surface border border-border-light text-on-surface font-label-md text-sm font-semibold group-hover:border-primary group-hover:text-primary transition-colors"
              >
                Pilih File
              </button>
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
);

/* ══════════════════════════════════════════════════════════
   STEP 2 — Data Keluarga
   ══════════════════════════════════════════════════════════ */
const Step2 = ({
  form,
  set,
  setOrangTua,
  setNamaIbu,
  parentSearch,
  setParentSearch,
  searchBy,
  setSearchBy,
  parentOptions,
  isFetchingParents,
  selectExistingParent,
  clearSelectedParent,
}) => (
  <div className="p-8">
    <SectionTitle icon="family_restroom">Data Keluarga</SectionTitle>

    {/* ── Cari orang tua existing ── */}
    <div className="rounded-[14px] border border-primary/20 bg-primary/5 p-5 space-y-3 mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-label-md text-label-md font-bold text-on-surface">
            Pakai Data Orang Tua yang Sudah Ada
          </p>
          <p className="font-label-md text-label-md text-on-surface-variant mt-0.5 font-normal">
            Cari berdasarkan nama, NIK, nomor HP, atau email.
          </p>
        </div>
        {form.orang_tua_id && (
          <button
            type="button"
            onClick={clearSelectedParent}
            className="font-label-md text-label-md font-bold text-danger hover:text-danger/80 shrink-0 transition-colors"
          >
            Bersihkan
          </button>
        )}
      </div>
      <SelectField
        value={searchBy}
        onChange={(e) => {
          setSearchBy(e.target.value);
          setParentSearch("");
        }}
      >
        <option value="all">
          Semua (Nama, NIK, HP, Email, NISN Anak, No. KK)
        </option>
        <option value="nik">NIK Ayah/Ibu/Wali</option>
        <option value="no_kk">No. KK Anak</option>
        <option value="nama">Nama Ayah/Ibu/Wali</option>
        <option value="no_hp">Nomor HP/WA</option>
        <option value="nisn">NISN atau Nama Anak</option>
      </SelectField>
      <input
        value={parentSearch}
        onChange={(e) => setParentSearch(e.target.value)}
        className={inputCls}
        placeholder="Ketik minimal 2 huruf untuk mencari..."
      />
      {form.orang_tua_id && (
        <div className="rounded-[12px] bg-surface-container-lowest border border-primary/30 p-3 font-label-md text-label-md text-primary font-bold flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-[18px]">
            check_circle
          </span>
          Terpilih: {parentDisplayName(form.orang_tua)}
        </div>
      )}
      {parentSearch.trim().length >= 2 && !form.orang_tua_id && (
        <div className="rounded-[12px] bg-surface-container-lowest border border-border-light divide-y divide-border-light overflow-hidden shadow-sm max-h-52 overflow-y-auto">
          {isFetchingParents ? (
            <p className="p-3 font-label-md text-label-md text-on-surface-variant">
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
                <p className="font-body-md text-body-md font-semibold text-on-surface">
                  {parentDisplayName(ortu)}
                </p>
                <p className="font-label-md text-label-md text-on-surface-variant mt-0.5 font-normal">
                  Ayah: {ortu.nama_ayah || "-"} · Ibu: {ortu.nama_ibu || "-"}
                </p>
              </button>
            ))
          ) : (
            <p className="p-3 font-label-md text-label-md text-on-surface-variant font-normal">
              Data orang tua tidak ditemukan. Isi data keluarga baru di bawah.
            </p>
          )}
        </div>
      )}
    </div>

    {/* ── Data Siswa dalam Keluarga ── */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <div>
        <Label required>Status dalam Keluarga</Label>
        <SelectField
          value={form.status_dalam_keluarga}
          onChange={(e) => set("status_dalam_keluarga", e.target.value)}
        >
          {keluargaOpts.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </SelectField>
      </div>
      <div>
        <Label>Anak ke-</Label>
        <input
          type="number"
          min="1"
          value={form.anak_ke}
          onChange={(e) => set("anak_ke", e.target.value)}
          className={inputCls}
          placeholder="Contoh: 1"
        />
      </div>
      <div>
        <Label>Jumlah Saudara</Label>
        <input
          type="number"
          min="0"
          value={form.jumlah_saudara}
          onChange={(e) => set("jumlah_saudara", e.target.value)}
          className={inputCls}
          placeholder="Contoh: 2"
        />
      </div>
      <div>
        <Label>No. Kartu Keluarga (KK)</Label>
        <input
          type="text"
          maxLength={16}
          value={form.no_kk}
          onChange={(e) => set("no_kk", e.target.value)}
          className={inputCls}
          placeholder="16 digit No. KK"
        />
      </div>
      <div>
        <Label>Nama Kepala Keluarga</Label>
        <input
          type="text"
          maxLength={150}
          value={form.nama_kepala_keluarga}
          onChange={(e) => set("nama_kepala_keluarga", e.target.value)}
          className={inputCls}
          placeholder="Nama sesuai KK"
        />
      </div>
      <div>
        <Label required>Nama Ibu Kandung</Label>
        <input
          type="text"
          maxLength={150}
          value={form.nama_ibu_kandung}
          onChange={(e) => {
            set("nama_ibu_kandung", e.target.value);
            setNamaIbu(e.target.value);
          }}
          className={inputCls}
          placeholder="Nama ibu kandung (wajib)"
        />
      </div>
    </div>

    {/* ── Data Ayah ── */}
    <Divider />
    <SubSectionLabel>Data Ayah Kandung</SubSectionLabel>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <div className="md:col-span-2">
        <Label>Nama Ayah</Label>
        <input
          value={form.orang_tua?.nama_ayah ?? ""}
          onChange={(e) => setOrangTua("nama_ayah", e.target.value)}
          className={inputCls}
          placeholder="Nama lengkap ayah kandung"
        />
      </div>
      <div>
        <Label>NIK Ayah</Label>
        <input
          value={form.orang_tua?.nik_ayah ?? ""}
          onChange={(e) => setOrangTua("nik_ayah", e.target.value)}
          className={inputCls}
          placeholder="16 digit NIK"
          maxLength={16}
        />
      </div>
      <div>
        <Label>Tahun Lahir Ayah</Label>
        <input
          type="number"
          min="1900"
          max="2010"
          value={form.orang_tua?.tahun_lahir_ayah ?? ""}
          onChange={(e) => setOrangTua("tahun_lahir_ayah", e.target.value)}
          className={inputCls}
          placeholder="Contoh: 1980"
        />
      </div>
      <div>
        <Label>Pendidikan Ayah</Label>
        <SelectField
          value={form.orang_tua?.pendidikan_ayah ?? ""}
          onChange={(e) => setOrangTua("pendidikan_ayah", e.target.value)}
        >
          <option value="">-- Pilih --</option>
          {pendidikanOpts.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </SelectField>
      </div>
      <div>
        <Label>Pekerjaan Ayah</Label>
        <input
          value={form.orang_tua?.pekerjaan_ayah ?? ""}
          onChange={(e) => setOrangTua("pekerjaan_ayah", e.target.value)}
          className={inputCls}
          placeholder="PNS, Wiraswasta, dll."
        />
      </div>
      <div>
        <Label>Penghasilan Ayah</Label>
        <SelectField
          value={form.orang_tua?.penghasilan_ayah ?? ""}
          onChange={(e) => setOrangTua("penghasilan_ayah", e.target.value)}
        >
          <option value="">-- Pilih --</option>
          {penghasilanOpts.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </SelectField>
      </div>
      <div>
        <Label>No. HP Ayah</Label>
        <input
          value={form.orang_tua?.no_hp_ayah ?? ""}
          onChange={(e) => setOrangTua("no_hp_ayah", e.target.value)}
          className={inputCls}
          placeholder="08xx-xxxx-xxxx"
        />
      </div>
    </div>

    {/* ── Data Ibu ── */}
    <Divider />
    <SubSectionLabel>Data Ibu Kandung</SubSectionLabel>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <div className="md:col-span-2">
        <Label>Nama Ibu</Label>
        <input
          value={form.orang_tua?.nama_ibu ?? ""}
          onChange={(e) => setNamaIbu(e.target.value)}
          className={inputCls}
          placeholder="Nama lengkap ibu kandung"
        />
      </div>
      <div>
        <Label>NIK Ibu</Label>
        <input
          value={form.orang_tua?.nik_ibu ?? ""}
          onChange={(e) => setOrangTua("nik_ibu", e.target.value)}
          className={inputCls}
          placeholder="16 digit NIK"
          maxLength={16}
        />
      </div>
      <div>
        <Label>Tahun Lahir Ibu</Label>
        <input
          type="number"
          min="1900"
          max="2010"
          value={form.orang_tua?.tahun_lahir_ibu ?? ""}
          onChange={(e) => setOrangTua("tahun_lahir_ibu", e.target.value)}
          className={inputCls}
          placeholder="Contoh: 1985"
        />
      </div>
      <div>
        <Label>Pendidikan Ibu</Label>
        <SelectField
          value={form.orang_tua?.pendidikan_ibu ?? ""}
          onChange={(e) => setOrangTua("pendidikan_ibu", e.target.value)}
        >
          <option value="">-- Pilih --</option>
          {pendidikanOpts.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </SelectField>
      </div>
      <div>
        <Label>Pekerjaan Ibu</Label>
        <input
          value={form.orang_tua?.pekerjaan_ibu ?? ""}
          onChange={(e) => setOrangTua("pekerjaan_ibu", e.target.value)}
          className={inputCls}
          placeholder="IRT, PNS, Swasta, dll."
        />
      </div>
      <div>
        <Label>Penghasilan Ibu</Label>
        <SelectField
          value={form.orang_tua?.penghasilan_ibu ?? ""}
          onChange={(e) => setOrangTua("penghasilan_ibu", e.target.value)}
        >
          <option value="">-- Pilih --</option>
          {penghasilanOpts.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </SelectField>
      </div>
      <div>
        <Label>No. HP Ibu</Label>
        <input
          value={form.orang_tua?.no_hp_ibu ?? ""}
          onChange={(e) => setOrangTua("no_hp_ibu", e.target.value)}
          className={inputCls}
          placeholder="08xx-xxxx-xxxx"
        />
      </div>
    </div>

    {/* ── Data Wali ── */}
    <Divider />
    <SubSectionLabel>Data Wali (Opsional)</SubSectionLabel>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Label>Nama Wali</Label>
        <input
          value={form.orang_tua?.nama_wali ?? ""}
          onChange={(e) => setOrangTua("nama_wali", e.target.value)}
          className={inputCls}
          placeholder="Nama wali (jika ada)"
        />
      </div>
      <div>
        <Label>NIK Wali</Label>
        <input
          value={form.orang_tua?.nik_wali ?? ""}
          onChange={(e) => setOrangTua("nik_wali", e.target.value)}
          className={inputCls}
          placeholder="16 digit NIK"
          maxLength={16}
        />
      </div>
      <div>
        <Label>Hubungan Wali</Label>
        <input
          value={form.orang_tua?.hubungan_wali ?? ""}
          onChange={(e) => setOrangTua("hubungan_wali", e.target.value)}
          className={inputCls}
          placeholder="Paman, Kakek, dll."
        />
      </div>
      <div>
        <Label>Pekerjaan Wali</Label>
        <input
          value={form.orang_tua?.pekerjaan_wali ?? ""}
          onChange={(e) => setOrangTua("pekerjaan_wali", e.target.value)}
          className={inputCls}
          placeholder="Pekerjaan wali"
        />
      </div>
      <div>
        <Label>No. HP Wali</Label>
        <input
          value={form.orang_tua?.no_hp_wali ?? ""}
          onChange={(e) => setOrangTua("no_hp_wali", e.target.value)}
          className={inputCls}
          placeholder="08xx-xxxx-xxxx"
        />
      </div>
      <div>
        <Label>Email Orang Tua/Wali</Label>
        <input
          type="email"
          value={form.orang_tua?.email ?? ""}
          onChange={(e) => setOrangTua("email", e.target.value)}
          className={inputCls}
          placeholder="email@contoh.com (Opsional)"
        />
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   STEP 3 — Alamat
   ══════════════════════════════════════════════════════════ */
const Step3 = ({ form, set }) => (
  <div className="p-8">
    <SectionTitle icon="location_on">Alamat Siswa</SectionTitle>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <Label required>Alamat Jalan</Label>
        <textarea
          rows={2}
          maxLength={255}
          value={form.alamat_jalan}
          onChange={(e) => set("alamat_jalan", e.target.value)}
          className={`${inputCls} resize-none`}
          placeholder="Nama jalan, gang, nomor rumah"
        />
      </div>
      <div>
        <Label>RT</Label>
        <input
          type="text"
          maxLength={4}
          value={form.rt}
          onChange={(e) => set("rt", e.target.value)}
          className={inputCls}
          placeholder="001"
        />
      </div>
      <div>
        <Label>RW</Label>
        <input
          type="text"
          maxLength={4}
          value={form.rw}
          onChange={(e) => set("rw", e.target.value)}
          className={inputCls}
          placeholder="001"
        />
      </div>
      <div>
        <Label>Desa / Kelurahan</Label>
        <input
          type="text"
          maxLength={100}
          value={form.desa_kelurahan}
          onChange={(e) => set("desa_kelurahan", e.target.value)}
          className={inputCls}
          placeholder="Nama desa/kelurahan"
        />
      </div>
      <div>
        <Label>Kecamatan</Label>
        <input
          type="text"
          maxLength={100}
          value={form.kecamatan}
          onChange={(e) => set("kecamatan", e.target.value)}
          className={inputCls}
          placeholder="Nama kecamatan"
        />
      </div>
      <div>
        <Label>Kabupaten / Kota</Label>
        <input
          type="text"
          maxLength={100}
          value={form.kota_kabupaten}
          onChange={(e) => set("kota_kabupaten", e.target.value)}
          className={inputCls}
          placeholder="Nama kabupaten/kota"
        />
      </div>
      <div>
        <Label>Provinsi</Label>
        <input
          type="text"
          maxLength={100}
          value={form.provinsi}
          onChange={(e) => set("provinsi", e.target.value)}
          className={inputCls}
          placeholder="Nama provinsi"
        />
      </div>
      <div>
        <Label>Kode Pos</Label>
        <input
          type="text"
          maxLength={10}
          value={form.kode_pos}
          onChange={(e) => set("kode_pos", e.target.value)}
          className={inputCls}
          placeholder="12345"
        />
      </div>
    </div>

    <Divider />
    <SubSectionLabel>Jarak & Transportasi</SubSectionLabel>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
      <div>
        <Label>Jarak Tempat Tinggal (km)</Label>
        <input
          type="number"
          min="0"
          step="0.1"
          value={form.jarak_tempat_tinggal}
          onChange={(e) => set("jarak_tempat_tinggal", e.target.value)}
          className={inputCls}
          placeholder="Contoh: 3.5"
        />
      </div>
      <div>
        <Label>Waktu Tempuh (menit)</Label>
        <input
          type="number"
          min="0"
          value={form.waktu_tempuh}
          onChange={(e) => set("waktu_tempuh", e.target.value)}
          className={inputCls}
          placeholder="Contoh: 15"
        />
      </div>
      <div>
        <Label>Moda Transportasi</Label>
        <input
          type="text"
          maxLength={50}
          value={form.moda_transportasi}
          onChange={(e) => set("moda_transportasi", e.target.value)}
          className={inputCls}
          placeholder="Jalan kaki, Motor, Angkot, dll."
        />
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   STEP 4 — Data Sekolah & Lainnya
   ══════════════════════════════════════════════════════════ */
const Step4 = ({ form, set }) => (
  <div className="p-8">
    <SectionTitle icon="school">Data Sekolah & Status</SectionTitle>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <Label required>Status Siswa</Label>
        <SelectField
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
        >
          {statusOpts.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </SelectField>
      </div>
      <div>
        <Label required>Tanggal Masuk</Label>
        <input
          type="date"
          value={form.tanggal_masuk}
          onChange={(e) => set("tanggal_masuk", e.target.value)}
          className={`${inputCls} cursor-pointer`}
        />
      </div>
      <div>
        <Label>Tingkat / Kelas</Label>
        <SelectField
          value={form.tingkat}
          onChange={(e) => set("tingkat", e.target.value)}
        >
          <option value="">Pilih Tingkat</option>
          {[1, 2, 3, 4, 5, 6].map((t) => (
            <option key={t} value={t}>
              Kelas {t}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <Label>Asal Sekolah</Label>
        <input
          type="text"
          maxLength={200}
          value={form.asal_sekolah}
          onChange={(e) => set("asal_sekolah", e.target.value)}
          className={inputCls}
          placeholder="Nama sekolah asal (TK / SD sebelumnya)"
        />
      </div>
      <div>
        <Label>Pembiaya Sekolah</Label>
        <SelectField
          value={form.pembiaya_sekolah}
          onChange={(e) => set("pembiaya_sekolah", e.target.value)}
        >
          <option value="">-- Pilih --</option>
          {pembiayaOpts.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </SelectField>
      </div>
    </div>

    <Divider />
    <SubSectionLabel>Data Kesehatan (Opsional)</SubSectionLabel>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
      <div>
        <Label>Kebutuhan Khusus</Label>
        <input
          type="text"
          maxLength={100}
          value={form.kebutuhan_khusus}
          onChange={(e) => set("kebutuhan_khusus", e.target.value)}
          className={inputCls}
          placeholder="Jika ada, misalnya: Tuna Netra"
        />
      </div>
      <div>
        <Label>Status Imunisasi</Label>
        <SelectField
          value={form.imunisasi}
          onChange={(e) => set("imunisasi", e.target.value)}
        >
          <option value="">-- Pilih --</option>
          {imunisasiOpts.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <Label>Riwayat Penyakit</Label>
        <textarea
          rows={2}
          value={form.riwayat_penyakit}
          onChange={(e) => set("riwayat_penyakit", e.target.value)}
          className={`${inputCls} resize-none`}
          placeholder="Riwayat penyakit atau alergi (jika ada)"
        />
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */
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

  /* ── Fetch siswa on edit ── */
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
        siswaData?.foto
          ? `http://127.0.0.1:8001/storage/${siswaData.foto}`
          : null,
      );
    }
  }, [siswaData, isEdit]);

  /* ── Fetch parent options ── */
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

  /* ── Mutation ── */
  const mutation = useMutation({
    mutationFn: async (data) => {
      const { _foto, orang_tua, ...rest } = data;
      const payload = { ...rest, orang_tuas: orang_tua ? [orang_tua] : [] };
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
        `Data siswa berhasil ${isEdit ? "diperbarui" : "ditambahkan"}.`,
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

  /* ── Step navigation ── */
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!form.nama.trim()) return toast.error("Nama lengkap wajib diisi.");
      if (!form.nisn.trim()) return toast.error("NISN wajib diisi.");
      if (!form.tempat_lahir.trim() || !form.tanggal_lahir)
        return toast.error("Tempat & tanggal lahir wajib diisi.");
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

  /* ── Loading state ── */
  if (isEdit && isLoadingSiswa) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin">
          progress_activity
        </span>
        <p className="font-body-md text-body-md text-text-secondary">
          Memuat data siswa...
        </p>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <div className="flex-1 p-gutter mx-auto w-full max-w-6xl">
      {/* ── Page Header ── */}
      <div className="mb-space-lg flex items-center justify-between">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-1">
            <span
              onClick={() => navigate("/operator/master/siswa")}
              className="hover:text-primary cursor-pointer transition-colors"
            >
              Data Siswa
            </span>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-on-surface font-semibold">
              {isEdit ? "Edit Siswa" : "Tambah Siswa"}
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-1">
            {isEdit ? "Edit Data Siswa" : "Tambah Siswa Baru"}
          </h2>
          <p className="font-body-md text-body-md text-text-secondary font-medium">
            Lengkapi formulir pendaftaran siswa baru secara bertahap.
          </p>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="bg-surface rounded-[18px] border border-border-light shadow-sm overflow-hidden flex flex-col">
        {/* ── Stepper ── */}
        <Stepper
          current={currentStep}
          onNavigate={setCurrentStep}
          isEdit={isEdit}
        />

        {/* ── Step Content ── */}
        {currentStep === 1 && (
          <Step1
            form={form}
            set={set}
            setNamaIbu={setNamaIbu}
            preview={preview}
            setPreview={setPreview}
            setForm={setForm}
            nisnError={nisnError}
            setNisnError={setNisnError}
            isEdit={isEdit}
            fileRef={fileRef}
          />
        )}
        {currentStep === 2 && (
          <Step2
            form={form}
            set={set}
            setOrangTua={setOrangTua}
            setNamaIbu={setNamaIbu}
            parentSearch={parentSearch}
            setParentSearch={setParentSearch}
            searchBy={searchBy}
            setSearchBy={setSearchBy}
            parentOptions={parentOptions}
            isFetchingParents={isFetchingParents}
            selectExistingParent={selectExistingParent}
            clearSelectedParent={clearSelectedParent}
          />
        )}
        {currentStep === 3 && <Step3 form={form} set={set} />}
        {currentStep === 4 && <Step4 form={form} set={set} />}

        {/* ── Footer Actions ── */}
        <div className="p-6 border-t border-border-light bg-surface-bright flex justify-between items-center rounded-b-[18px]">
          <button
            type="button"
            onClick={handlePrevStep}
            className="px-6 py-3 rounded-[12px] border border-border-light bg-surface-container-lowest text-on-surface font-label-md text-label-md font-bold hover:bg-surface-container-low hover:border-outline-variant transition-colors shadow-sm flex items-center gap-2"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20 }}
            >
              {currentStep === 1 ? "close" : "arrow_back"}
            </span>
            {currentStep === 1 ? "Batal" : "Sebelumnya"}
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-3 rounded-[12px] bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container hover:text-on-primary-container hover:shadow-md transition-all shadow-sm flex items-center gap-2"
            >
              Lanjutkan
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20 }}
              >
                arrow_forward
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending}
              className="px-6 py-3 rounded-[12px] bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container hover:text-on-primary-container hover:shadow-md transition-all shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              {mutation.isPending ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">
                    progress_activity
                  </span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20 }}
                  >
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
