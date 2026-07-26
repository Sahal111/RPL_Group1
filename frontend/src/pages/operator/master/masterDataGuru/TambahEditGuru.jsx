import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001";

/* ─── Option Constants ─── */
const agamaOpts = [
  "Islam",
  "Kristen Protestan",
  "Kristen Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
  "Lainnya",
];
const golDarahOpts = [
  "A",
  "B",
  "AB",
  "O",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];
const jenisPtkOpts = [
  "Guru Kelas",
  "Guru Mapel",
  "Guru BK",
  "Kepala Sekolah",
  "Operator",
  "Tenaga Administrasi",
];
const statusKepegawaianOpts = [
  "PNS",
  "PPPK",
  "GTY",
  "GTT",
  "Honorer",
  "Lainnya",
];
const statusKeaktifanOpts = ["Aktif", "Cuti", "Pensiun", "Mutasi", "Keluar"];
const statusHidupOpts = ["Aktif", "Meninggal"];
const statusNikahOpts = [
  "Belum Menikah",
  "Menikah",
  "Cerai Hidup",
  "Cerai Mati",
];

const jenjangOpts = [
  "SD",
  "SMP",
  "SMA/SMK",
  "D1",
  "D2",
  "D3",
  "D4",
  "S1",
  "S2",
  "S3",
];
const tingkatKompetensiOpts = ["Dasar", "Menengah", "Mahir", "Ahli"];
const jenisDokumenOpts = [
  "KTP",
  "KK",
  "NPWP",
  "Ijazah",
  "Transkrip",
  "SK Pengangkatan",
  "SK Berkala",
  "Sertifikat Pendidik",
  "Sertifikat Pelatihan",
  "Pakta Integritas",
  "CV",
  "Buku Rekening",
  "Lainnya",
];

/* ─── Default Form ─── */
const defaultForm = {
  // Identitas
  nuptk: "",
  nip: "",
  nik: "",
  no_kk: "",
  no_karpeg: "",
  nama: "",
  gelar_depan: "",
  gelar_belakang: "",
  jenis_kelamin: "L",
  tempat_lahir: "",
  tanggal_lahir: "",
  agama: "Islam",
  golongan_darah: "",
  kewarganegaraan: "WNI",
  status_hidup: "Aktif",
  nama_ibu_kandung: "",
  // Kontak
  no_hp: "",
  no_wa: "",
  email: "",
  // Alamat
  alamat_jalan: "",
  rt: "",
  rw: "",
  dusun: "",
  desa_kelurahan: "",
  kecamatan: "",
  kota_kabupaten: "",
  provinsi: "",
  kode_pos: "",
  // Kepegawaian
  jenis_ptk: "",
  status_kepegawaian: "",
  status_keaktifan: "Aktif",
  tanggal_bergabung: "",
  tmt_pns: "",
  tmt_gty: "",
  no_sk_pengangkatan: "",
  tgl_sk_pengangkatan: "",
  instansi_pengangkat: "",
  masa_kerja_tahun: "",
  // Keluarga
  status_perkawinan: "",
  nama_pasangan: "",
  nik_pasangan: "",
  pekerjaan_pasangan: "",
  jumlah_anak: "",
  anaks: [],
  // Kontak darurat
  kontak_darurat: [],
  // Administrasi
  nama_bank: "",
  no_rekening: "",
  atas_nama: "",
  npwp: "",
  no_bpjs_kesehatan: "",
  no_bpjs_ketenagakerjaan: "",
};

/* ─── Steps ─── */
const STEPS = [
  { step: 1, label: "Identitas", icon: "badge" },
  { step: 2, label: "Kepegawaian", icon: "work" },
  { step: 3, label: "Alamat", icon: "location_on" },
  { step: 4, label: "Keluarga", icon: "family_restroom" },
  { step: 5, label: "Administrasi", icon: "account_balance" },
];
const TOTAL_STEPS = STEPS.length;

/* ══════════════════════════════════════════════════════════
   REUSABLE UI
   ══════════════════════════════════════════════════════════ */
const inputCls =
  "w-full px-4 py-3 rounded-[12px] border border-border-light bg-surface-container-lowest " +
  "focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-outline-variant " +
  "transition-all font-body-md text-body-md text-on-surface " +
  "placeholder:text-text-secondary placeholder:font-normal shadow-sm outline-none";

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

const FieldError = ({ msg }) =>
  msg ? (
    <p className="text-danger text-[12px] mt-1 font-medium">{msg}</p>
  ) : null;

/* ══════════════════════════════════════════════════════════
   STEPPER
   ══════════════════════════════════════════════════════════ */
const Stepper = ({ current, onNavigate, isEdit }) => (
  <div className="px-8 pt-8 pb-6 border-b border-border-light bg-surface-bright">
    <div className="relative mx-auto max-w-4xl">
      <div className="absolute top-[18px] left-4 right-4 h-[3px] bg-border-light" />
      <div
        className="absolute top-[18px] left-4 h-[3px] bg-primary-container transition-all duration-300 ease-out"
        style={{
          width: `calc((100% - 2rem) * ${(current - 1) / (TOTAL_STEPS - 1)})`,
        }}
      />
      <div className="flex justify-between relative z-10">
        {STEPS.map((s) => {
          const isActive = current === s.step;
          const isDone = current > s.step;
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
                    : isDone
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                {isDone ? (
                  <span className="material-symbols-outlined text-[15px]">
                    check
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[15px]">
                    {s.icon}
                  </span>
                )}
              </div>
              <span
                className={`font-label-md text-label-md ${
                  isActive
                    ? "font-bold text-primary"
                    : isDone
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

/* ══════════════════════════════════════════════════════════
   STEP 1 — Identitas Guru
   ══════════════════════════════════════════════════════════ */
const Step1 = ({
  form,
  set,
  errors,
  preview,
  setPreview,
  setForm,
  fileRef,
  isEdit,
}) => (
  <div className="p-8">
    <SectionTitle icon="badge">Identitas Guru</SectionTitle>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Kiri */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Nama */}
        <div>
          <Label required>Nama (tanpa gelar)</Label>
          <input
            type="text"
            maxLength={100}
            value={form.nama}
            onChange={(e) => set("nama", e.target.value)}
            className={`${inputCls} ${errors.nama ? "border-danger" : ""}`}
            placeholder="Contoh: Siti Rahma"
          />
          <FieldError msg={errors.nama} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Gelar Depan</Label>
            <input
              type="text"
              maxLength={30}
              value={form.gelar_depan}
              onChange={(e) => set("gelar_depan", e.target.value)}
              className={inputCls}
              placeholder="Drs., Dr., dll."
            />
          </div>
          <div>
            <Label>Gelar Belakang</Label>
            <input
              type="text"
              maxLength={50}
              value={form.gelar_belakang}
              onChange={(e) => set("gelar_belakang", e.target.value)}
              className={inputCls}
              placeholder="S.Pd., M.Pd., dll."
            />
          </div>

          {/* NUPTK */}
          <div>
            <Label required>NUPTK</Label>
            <input
              type="text"
              maxLength={16}
              value={form.nuptk}
              onChange={(e) => set("nuptk", e.target.value)}
              disabled={isEdit}
              className={`${inputCls} ${errors.nuptk ? "border-danger" : ""} disabled:opacity-60`}
              placeholder="16 digit NUPTK"
            />
            <FieldError msg={errors.nuptk} />
          </div>

          {/* NIP */}
          <div>
            <Label>NIP / NI PPPK</Label>
            <input
              type="text"
              maxLength={18}
              value={form.nip}
              onChange={(e) => set("nip", e.target.value)}
              className={`${inputCls} ${errors.nip ? "border-danger" : ""}`}
              placeholder="18 digit (hanya ASN)"
            />
            <FieldError msg={errors.nip} />
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
              placeholder="16 digit NIK KTP"
            />
          </div>

          {/* No KK */}
          <div>
            <Label>No. Kartu Keluarga</Label>
            <input
              type="text"
              maxLength={16}
              value={form.no_kk}
              onChange={(e) => set("no_kk", e.target.value)}
              className={inputCls}
              placeholder="16 digit No. KK"
            />
          </div>

          {/* Jenis Kelamin */}
          <div>
            <Label required>Jenis Kelamin</Label>
            <SelectField
              value={form.jenis_kelamin}
              onChange={(e) => set("jenis_kelamin", e.target.value)}
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </SelectField>
          </div>

          {/* Tempat Lahir */}
          <div>
            <Label required>Tempat Lahir</Label>
            <input
              type="text"
              maxLength={60}
              value={form.tempat_lahir}
              onChange={(e) => set("tempat_lahir", e.target.value)}
              className={`${inputCls} ${errors.tempat_lahir ? "border-danger" : ""}`}
              placeholder="Contoh: Bogor"
            />
            <FieldError msg={errors.tempat_lahir} />
          </div>

          {/* Tanggal Lahir */}
          <div>
            <Label required>Tanggal Lahir</Label>
            <input
              type="date"
              value={form.tanggal_lahir}
              onChange={(e) => set("tanggal_lahir", e.target.value)}
              className={`${inputCls} ${errors.tanggal_lahir ? "border-danger" : ""} cursor-pointer`}
            />
            <FieldError msg={errors.tanggal_lahir} />
          </div>

          {/* Agama */}
          <div>
            <Label required>Agama</Label>
            <SelectField
              value={form.agama}
              onChange={(e) => set("agama", e.target.value)}
            >
              {agamaOpts.map((a) => (
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
              <option value="">-- Pilih --</option>
              {golDarahOpts.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </SelectField>
          </div>

          {/* Status Hidup */}
          <div>
            <Label required>Status Hidup</Label>
            <SelectField
              value={form.status_hidup}
              onChange={(e) => set("status_hidup", e.target.value)}
            >
              {statusHidupOpts.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
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
                  name="kewarganegaraan"
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

        {/* Nama Ibu Kandung */}
        <div>
          <Label required>Nama Ibu Kandung</Label>
          <input
            type="text"
            maxLength={100}
            value={form.nama_ibu_kandung}
            onChange={(e) => set("nama_ibu_kandung", e.target.value)}
            className={`${inputCls} ${errors.nama_ibu_kandung ? "border-danger" : ""}`}
            placeholder="Nama ibu kandung sesuai dokumen"
          />
          <FieldError msg={errors.nama_ibu_kandung} />
        </div>
      </div>

      {/* Kanan: Foto */}
      <div className="lg:col-span-4 flex flex-col">
        <Label>Foto Guru</Label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border-light rounded-[18px] p-8 flex flex-col items-center justify-center bg-surface-container-lowest hover:bg-surface-container-low hover:border-primary/50 transition-all cursor-pointer group flex-1 min-h-[300px]"
        >
          {preview ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={preview}
                alt="Foto Guru"
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
                Klik untuk unggah foto
              </p>
              <p className="font-label-md text-[13px] text-text-secondary text-center mb-4 font-normal">
                PNG, JPG maks 2MB (3:4)
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

    {/* Kontak */}
    <Divider />
    <SubSectionLabel>Kontak</SubSectionLabel>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <Label required>Nomor HP</Label>
        <input
          type="text"
          maxLength={20}
          value={form.no_hp}
          onChange={(e) => set("no_hp", e.target.value)}
          className={`${inputCls} ${errors.no_hp ? "border-danger" : ""}`}
          placeholder="08xx-xxxx-xxxx"
        />
        <FieldError msg={errors.no_hp} />
      </div>
      <div>
        <Label>Nomor WhatsApp</Label>
        <input
          type="text"
          maxLength={20}
          value={form.no_wa}
          onChange={(e) => set("no_wa", e.target.value)}
          className={inputCls}
          placeholder="Kosongkan jika sama dengan HP"
        />
      </div>
      <div>
        <Label>Email</Label>
        <input
          type="email"
          maxLength={100}
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          className={`${inputCls} ${errors.email ? "border-danger" : ""}`}
          placeholder="contoh@email.com"
        />
        <FieldError msg={errors.email} />
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   STEP 2 — Kepegawaian
   ══════════════════════════════════════════════════════════ */
const Step2 = ({ form, set, errors }) => (
  <div className="p-8">
    <SectionTitle icon="work">Status Kepegawaian</SectionTitle>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <Label required>Status Guru</Label>
        <SelectField
          value={form.status_kepegawaian}
          onChange={(e) => set("status_kepegawaian", e.target.value)}
        >
          <option value="">-- Pilih --</option>
          {statusKepegawaianOpts.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </SelectField>
        <FieldError msg={errors.status_kepegawaian} />
      </div>
      <div>
        <Label required>Status Keaktifan</Label>
        <SelectField
          value={form.status_keaktifan}
          onChange={(e) => set("status_keaktifan", e.target.value)}
        >
          {statusKeaktifanOpts.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </SelectField>
      </div>
      <div>
        <Label required>Jenis PTK</Label>
        <SelectField
          value={form.jenis_ptk}
          onChange={(e) => set("jenis_ptk", e.target.value)}
        >
          <option value="">-- Pilih --</option>
          {jenisPtkOpts.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </SelectField>
        <FieldError msg={errors.jenis_ptk} />
      </div>
      <div>
        <Label>Tanggal Bergabung</Label>
        <input
          type="date"
          value={form.tanggal_bergabung}
          onChange={(e) => set("tanggal_bergabung", e.target.value)}
          className={`${inputCls} cursor-pointer`}
        />
      </div>
      <div>
        <Label>TMT PNS / PPPK</Label>
        <input
          type="date"
          value={form.tmt_pns}
          onChange={(e) => set("tmt_pns", e.target.value)}
          className={`${inputCls} cursor-pointer`}
        />
      </div>
      <div>
        <Label>TMT GTY</Label>
        <input
          type="date"
          value={form.tmt_gty}
          onChange={(e) => set("tmt_gty", e.target.value)}
          className={`${inputCls} cursor-pointer`}
        />
      </div>
      <div>
        <Label>Masa Kerja (tahun)</Label>
        <input
          type="number"
          min={0}
          max={50}
          value={form.masa_kerja_tahun}
          onChange={(e) => set("masa_kerja_tahun", e.target.value)}
          className={inputCls}
          placeholder="Contoh: 5"
        />
      </div>
    </div>

    <Divider />
    <SubSectionLabel>SK Pengangkatan</SubSectionLabel>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Label>Nomor SK Pengangkatan</Label>
        <input
          type="text"
          maxLength={80}
          value={form.no_sk_pengangkatan}
          onChange={(e) => set("no_sk_pengangkatan", e.target.value)}
          className={inputCls}
          placeholder="Nomor surat keputusan"
        />
      </div>
      <div>
        <Label>Tanggal SK</Label>
        <input
          type="date"
          value={form.tgl_sk_pengangkatan}
          onChange={(e) => set("tgl_sk_pengangkatan", e.target.value)}
          className={`${inputCls} cursor-pointer`}
        />
      </div>
      <div className="md:col-span-2 lg:col-span-3">
        <Label>Instansi Pengangkat</Label>
        <input
          type="text"
          maxLength={150}
          value={form.instansi_pengangkat}
          onChange={(e) => set("instansi_pengangkat", e.target.value)}
          className={inputCls}
          placeholder="Contoh: Kementerian Agama Kab. Bogor, Yayasan Nurul Huda"
        />
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   STEP 3 — Alamat
   ══════════════════════════════════════════════════════════ */
const Step3 = ({ form, set, errors }) => (
  <div className="p-8">
    <SectionTitle icon="location_on">Alamat Guru</SectionTitle>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <Label required>Alamat Jalan</Label>
        <textarea
          rows={2}
          maxLength={255}
          value={form.alamat_jalan}
          onChange={(e) => set("alamat_jalan", e.target.value)}
          className={`${inputCls} ${errors.alamat_jalan ? "border-danger" : ""} resize-none`}
          placeholder="Nama jalan, gang, nomor rumah"
        />
        <FieldError msg={errors.alamat_jalan} />
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
        <Label>Dusun / Kampung</Label>
        <input
          type="text"
          maxLength={100}
          value={form.dusun}
          onChange={(e) => set("dusun", e.target.value)}
          className={inputCls}
          placeholder="Nama dusun (opsional)"
        />
      </div>
      <div>
        <Label required>Desa / Kelurahan</Label>
        <input
          type="text"
          maxLength={60}
          value={form.desa_kelurahan}
          onChange={(e) => set("desa_kelurahan", e.target.value)}
          className={`${inputCls} ${errors.desa_kelurahan ? "border-danger" : ""}`}
          placeholder="Nama desa/kelurahan"
        />
        <FieldError msg={errors.desa_kelurahan} />
      </div>
      <div>
        <Label required>Kecamatan</Label>
        <input
          type="text"
          maxLength={60}
          value={form.kecamatan}
          onChange={(e) => set("kecamatan", e.target.value)}
          className={`${inputCls} ${errors.kecamatan ? "border-danger" : ""}`}
          placeholder="Nama kecamatan"
        />
        <FieldError msg={errors.kecamatan} />
      </div>
      <div>
        <Label required>Kabupaten / Kota</Label>
        <input
          type="text"
          maxLength={60}
          value={form.kota_kabupaten}
          onChange={(e) => set("kota_kabupaten", e.target.value)}
          className={`${inputCls} ${errors.kota_kabupaten ? "border-danger" : ""}`}
          placeholder="Nama kabupaten/kota"
        />
        <FieldError msg={errors.kota_kabupaten} />
      </div>
      <div>
        <Label>Provinsi</Label>
        <input
          type="text"
          maxLength={60}
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
  </div>
);

/* ══════════════════════════════════════════════════════════
   STEP 4 — Keluarga
   ══════════════════════════════════════════════════════════ */
const Step4 = ({ form, set, setAnak, addAnak, removeAnak }) => (
  <div className="p-8">
    <SectionTitle icon="family_restroom">Data Keluarga</SectionTitle>

    {/* Perkawinan */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <Label>Status Pernikahan</Label>
        <SelectField
          value={form.status_perkawinan}
          onChange={(e) => set("status_perkawinan", e.target.value)}
        >
          <option value="">-- Pilih --</option>
          {statusNikahOpts.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </SelectField>
      </div>
      <div>
        <Label>Jumlah Anak</Label>
        <input
          type="number"
          min={0}
          value={form.jumlah_anak}
          onChange={(e) => set("jumlah_anak", e.target.value)}
          className={inputCls}
          placeholder="0"
        />
      </div>
    </div>

    {/* Data Pasangan — tampil jika sudah menikah */}
    {form.status_perkawinan === "Menikah" && (
      <>
        <Divider />
        <SubSectionLabel>Data Pasangan</SubSectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Label>Nama Pasangan</Label>
            <input
              type="text"
              maxLength={150}
              value={form.nama_pasangan}
              onChange={(e) => set("nama_pasangan", e.target.value)}
              className={inputCls}
              placeholder="Nama lengkap pasangan"
            />
          </div>
          <div>
            <Label>NIK Pasangan</Label>
            <input
              type="text"
              maxLength={16}
              value={form.nik_pasangan}
              onChange={(e) => set("nik_pasangan", e.target.value)}
              className={inputCls}
              placeholder="16 digit NIK"
            />
          </div>
          <div>
            <Label>Pekerjaan Pasangan</Label>
            <input
              type="text"
              maxLength={100}
              value={form.pekerjaan_pasangan}
              onChange={(e) => set("pekerjaan_pasangan", e.target.value)}
              className={inputCls}
              placeholder="PNS, Wiraswasta, IRT, dll."
            />
          </div>
        </div>
      </>
    )}

    {/* Data Anak */}
    <Divider />
    <div className="flex items-center justify-between mb-4">
      <SubSectionLabel>Data Anak</SubSectionLabel>
      <button
        type="button"
        onClick={addAnak}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-primary/10 text-primary font-label-md text-[13px] font-bold hover:bg-primary/20 transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        Tambah Anak
      </button>
    </div>
    {form.anaks.length === 0 && (
      <p className="text-text-secondary font-body-md text-[14px] text-center py-6 border border-dashed border-border-light rounded-[12px]">
        Belum ada data anak. Klik "Tambah Anak" jika perlu.
      </p>
    )}
    <div className="space-y-4">
      {form.anaks.map((anak, i) => (
        <div
          key={i}
          className="border border-border-light rounded-[14px] p-5 bg-surface-container-lowest relative"
        >
          <button
            type="button"
            onClick={() => removeAnak(i)}
            className="absolute top-4 right-4 text-text-secondary hover:text-danger transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <p className="font-label-md text-label-md font-bold text-on-surface mb-4">
            Anak ke-{i + 1}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label required>Nama Anak</Label>
              <input
                type="text"
                maxLength={150}
                value={anak.nama}
                onChange={(e) => setAnak(i, "nama", e.target.value)}
                className={inputCls}
                placeholder="Nama lengkap anak"
              />
            </div>
            <div>
              <Label>Jenis Kelamin</Label>
              <SelectField
                value={anak.jenis_kelamin ?? ""}
                onChange={(e) => setAnak(i, "jenis_kelamin", e.target.value)}
              >
                <option value="">-- Pilih --</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </SelectField>
            </div>
            <div>
              <Label>Tanggal Lahir</Label>
              <input
                type="date"
                value={anak.tanggal_lahir ?? ""}
                onChange={(e) => setAnak(i, "tanggal_lahir", e.target.value)}
                className={`${inputCls} cursor-pointer`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   STEP 5 — Administrasi
   ══════════════════════════════════════════════════════════ */
const Step5 = ({
  form,
  set,
  kontakDarurat,
  setKontak,
  addKontak,
  removeKontak,
}) => (
  <div className="p-8">
    <SectionTitle icon="account_balance">Data Administrasi</SectionTitle>

    {/* Rekening & Keuangan */}
    <SubSectionLabel>Rekening Bank</SubSectionLabel>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <Label>Nama Bank</Label>
        <input
          type="text"
          maxLength={100}
          value={form.nama_bank}
          onChange={(e) => set("nama_bank", e.target.value)}
          className={inputCls}
          placeholder="BRI, BNI, Mandiri, dll."
        />
      </div>
      <div>
        <Label>Nomor Rekening</Label>
        <input
          type="text"
          maxLength={30}
          value={form.no_rekening}
          onChange={(e) => set("no_rekening", e.target.value)}
          className={inputCls}
          placeholder="Nomor rekening aktif"
        />
      </div>
      <div>
        <Label>Atas Nama</Label>
        <input
          type="text"
          maxLength={150}
          value={form.atas_nama}
          onChange={(e) => set("atas_nama", e.target.value)}
          className={inputCls}
          placeholder="Nama pemilik rekening"
        />
      </div>
    </div>

    <Divider />
    <SubSectionLabel>NPWP & BPJS</SubSectionLabel>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <Label>NPWP</Label>
        <input
          type="text"
          maxLength={20}
          value={form.npwp}
          onChange={(e) => set("npwp", e.target.value)}
          className={inputCls}
          placeholder="Nomor NPWP"
        />
      </div>
      <div>
        <Label>No. BPJS Kesehatan</Label>
        <input
          type="text"
          maxLength={30}
          value={form.no_bpjs_kesehatan}
          onChange={(e) => set("no_bpjs_kesehatan", e.target.value)}
          className={inputCls}
          placeholder="13 digit No. BPJS Kesehatan"
        />
      </div>
      <div>
        <Label>No. BPJS Ketenagakerjaan</Label>
        <input
          type="text"
          maxLength={30}
          value={form.no_bpjs_ketenagakerjaan}
          onChange={(e) => set("no_bpjs_ketenagakerjaan", e.target.value)}
          className={inputCls}
          placeholder="No. BPJS Ketenagakerjaan"
        />
      </div>
    </div>

    <Divider />
    {/* Kontak Darurat */}
    <div className="flex items-center justify-between mb-4">
      <SubSectionLabel>Kontak Darurat</SubSectionLabel>
      <button
        type="button"
        onClick={addKontak}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-primary/10 text-primary font-label-md text-[13px] font-bold hover:bg-primary/20 transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        Tambah Kontak
      </button>
    </div>
    {kontakDarurat.length === 0 && (
      <p className="text-text-secondary font-body-md text-[14px] text-center py-6 border border-dashed border-border-light rounded-[12px]">
        Belum ada kontak darurat. Klik "Tambah Kontak" untuk menambahkan.
      </p>
    )}
    <div className="space-y-4">
      {kontakDarurat.map((k, i) => (
        <div
          key={i}
          className="border border-border-light rounded-[14px] p-5 bg-surface-container-lowest relative"
        >
          <button
            type="button"
            onClick={() => removeKontak(i)}
            className="absolute top-4 right-4 text-text-secondary hover:text-danger transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <p className="font-label-md text-label-md font-bold text-on-surface mb-4">
            Kontak {i + 1}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label required>Nama</Label>
              <input
                type="text"
                maxLength={150}
                value={k.nama}
                onChange={(e) => setKontak(i, "nama", e.target.value)}
                className={inputCls}
                placeholder="Nama lengkap kontak darurat"
              />
            </div>
            <div>
              <Label required>Hubungan</Label>
              <input
                type="text"
                maxLength={50}
                value={k.hubungan}
                onChange={(e) => setKontak(i, "hubungan", e.target.value)}
                className={inputCls}
                placeholder="Istri, Suami, Orang Tua, dll."
              />
            </div>
            <div>
              <Label required>Nomor HP</Label>
              <input
                type="text"
                maxLength={20}
                value={k.no_hp}
                onChange={(e) => setKontak(i, "no_hp", e.target.value)}
                className={inputCls}
                placeholder="08xx-xxxx-xxxx"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Alamat</Label>
              <input
                type="text"
                maxLength={255}
                value={k.alamat ?? ""}
                onChange={(e) => setKontak(i, "alamat", e.target.value)}
                className={inputCls}
                placeholder="Alamat (opsional)"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   VALIDATION
   ══════════════════════════════════════════════════════════ */
const validateStep = (step, form) => {
  const e = {};
  if (step === 1) {
    if (!form.nama?.trim()) e.nama = "Nama wajib diisi.";
    if (!form.nuptk?.trim()) e.nuptk = "NUPTK wajib diisi.";
    if (form.nuptk && !/^\d{16}$/.test(form.nuptk))
      e.nuptk = "NUPTK harus 16 digit angka.";
    if (form.nip && !/^\d{18}$/.test(form.nip))
      e.nip = "NIP harus 18 digit angka.";
    if (!form.tempat_lahir?.trim())
      e.tempat_lahir = "Tempat lahir wajib diisi.";
    if (!form.tanggal_lahir) e.tanggal_lahir = "Tanggal lahir wajib diisi.";
    if (!form.nama_ibu_kandung?.trim())
      e.nama_ibu_kandung = "Nama ibu kandung wajib diisi.";
    if (!form.no_hp?.trim()) e.no_hp = "Nomor HP wajib diisi.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Format email tidak valid.";
  }
  if (step === 2) {
    if (!form.status_kepegawaian)
      e.status_kepegawaian = "Status guru wajib dipilih.";
    if (!form.jenis_ptk) e.jenis_ptk = "Jenis PTK wajib dipilih.";
  }
  if (step === 3) {
    if (!form.alamat_jalan?.trim())
      e.alamat_jalan = "Alamat jalan wajib diisi.";
    if (!form.desa_kelurahan?.trim())
      e.desa_kelurahan = "Desa/kelurahan wajib diisi.";
    if (!form.kecamatan?.trim()) e.kecamatan = "Kecamatan wajib diisi.";
    if (!form.kota_kabupaten?.trim())
      e.kota_kabupaten = "Kabupaten/kota wajib diisi.";
  }
  if (step === 4) {
    form.anaks?.forEach((anak, i) => {
      if (!anak.nama?.trim())
        e[`anak_${i}_nama`] = `Nama anak ke-${i + 1} wajib diisi.`;
    });
  }
  if (step === 5) {
    form.kontak_darurat?.forEach((k, i) => {
      if (!k.nama?.trim())
        e[`kontak_${i}_nama`] = `Nama kontak ${i + 1} wajib diisi.`;
      if (!k.hubungan?.trim())
        e[`kontak_${i}_hubungan`] = `Hubungan kontak ${i + 1} wajib diisi.`;
      if (!k.no_hp?.trim())
        e[`kontak_${i}_no_hp`] = `No. HP kontak ${i + 1} wajib diisi.`;
    });
  }
  return e;
};

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function TambahEditGuru() {
  const { nuptk } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!nuptk;

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const setAnak = (i, k, v) =>
    setForm((f) => {
      const a = [...(f.anaks ?? [])];
      a[i] = { ...a[i], [k]: v };
      return { ...f, anaks: a };
    });
  const addAnak = () =>
    setForm((f) => ({
      ...f,
      anaks: [
        ...(f.anaks ?? []),
        {
          nama: "",
          jenis_kelamin: "",
          tanggal_lahir: "",
          urutan: (f.anaks?.length ?? 0) + 1,
        },
      ],
    }));
  const removeAnak = (i) =>
    setForm((f) => {
      const a = [...(f.anaks ?? [])];
      a.splice(i, 1);
      return { ...f, anaks: a };
    });

  const setKontak = (i, k, v) =>
    setForm((f) => {
      const kd = [...(f.kontak_darurat ?? [])];
      kd[i] = { ...kd[i], [k]: v };
      return { ...f, kontak_darurat: kd };
    });
  const addKontak = () =>
    setForm((f) => ({
      ...f,
      kontak_darurat: [
        ...(f.kontak_darurat ?? []),
        { nama: "", hubungan: "", no_hp: "", alamat: "" },
      ],
    }));
  const removeKontak = (i) =>
    setForm((f) => {
      const kd = [...(f.kontak_darurat ?? [])];
      kd.splice(i, 1);
      return { ...f, kontak_darurat: kd };
    });

  /* ── Fetch data saat edit ── */
  const { data: guruData, isLoading } = useQuery({
    queryKey: ["guru-form", nuptk],
    queryFn: () =>
      api.get(`/operator/master-data/guru/${nuptk}`).then((r) => r.data.data),
    enabled: isEdit,
  });
const toDateStr = (v) => (v ? String(v).slice(0, 10) : "");
  useEffect(() => {
    if (guruData && isEdit) {
      const keluarga = guruData.keluarga ?? {};
      setForm({
        ...defaultForm,
        ...guruData,
        tanggal_lahir: toDateStr(guruData.tanggal_lahir),
        tanggal_bergabung: toDateStr(guruData.tanggal_bergabung),
        tmt_pns: toDateStr(guruData.tmt_pns),
        tmt_gty: toDateStr(guruData.tmt_gty),
        tgl_sk_pengangkatan: toDateStr(guruData.tgl_sk_pengangkatan),
        // flatten keluarga
        status_perkawinan: keluarga.status_perkawinan ?? "",
        nama_pasangan: keluarga.nama_pasangan ?? "",
        nik_pasangan: keluarga.nik_pasangan ?? "",
        pekerjaan_pasangan: keluarga.pekerjaan_pasangan ?? "",
        jumlah_anak: keluarga.jumlah_anak ?? "",
        anaks: guruData.anaks ?? [],
        kontak_darurat: guruData.kontak_darurat ?? [],
        // flatten rekening utama
        nama_bank: guruData.rekenings?.[0]?.nama_bank ?? "",
        no_rekening: guruData.rekenings?.[0]?.no_rekening ?? "",
        atas_nama: guruData.rekenings?.[0]?.atas_nama ?? "",
        npwp: guruData.rekenings?.[0]?.npwp ?? "",
        no_bpjs_kesehatan: guruData.rekenings?.[0]?.no_bpjs_kesehatan ?? "",
        no_bpjs_ketenagakerjaan:
          guruData.rekenings?.[0]?.no_bpjs_ketenagakerjaan ?? "",
      });
      if (guruData.foto) setPreview(`${BASE_URL}/storage/${guruData.foto}`);
    }
  }, [guruData, isEdit]);

  /* ── Mutation simpan guru utama ── */
  const mutation = useMutation({
    mutationFn: async (data) => {
      const {
        _foto,
        anaks,
        kontak_darurat,
        status_perkawinan,
        nama_pasangan,
        nik_pasangan,
        pekerjaan_pasangan,
        jumlah_anak,
        nama_bank,
        no_rekening,
        atas_nama,
        npwp,
        no_bpjs_kesehatan,
        no_bpjs_ketenagakerjaan,
        ...rest
      } = data;

      // 1. Simpan data utama guru
      const res = isEdit
        ? await api.put(`/operator/master-data/guru/${nuptk}`, rest)
        : await api.post("/operator/master-data/guru", rest);

      const targetNuptk = res.data?.data?.nuptk ?? data.nuptk;

      // 2. Upload foto jika ada
      if (_foto) {
        const fd = new FormData();
        fd.append("foto", _foto);
        await api.post(`/operator/master-data/guru/${targetNuptk}/foto`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // 3. Simpan keluarga + anak
      await api.put(`/operator/master-data/guru/${targetNuptk}/keluarga`, {
        status_perkawinan,
        nama_pasangan,
        nik_pasangan,
        pekerjaan_pasangan,
        jumlah_anak,
        anaks,
      });

      // 4. Simpan administrasi
      if (
        nama_bank ||
        no_rekening ||
        npwp ||
        no_bpjs_kesehatan ||
        no_bpjs_ketenagakerjaan
      ) {
        await api.put(
          `/operator/master-data/guru/${targetNuptk}/administrasi`,
          {
            nama_bank,
            no_rekening,
            atas_nama,
            npwp,
            no_bpjs_kesehatan,
            no_bpjs_ketenagakerjaan,
            is_primary: 1,
          },
        );
      }

      // 5. Sync kontak darurat — simpan satu-satu jika ada yang baru
      for (const k of kontak_darurat ?? []) {
        if (!k.id) {
          await api.post(
            `/operator/master-data/guru/${targetNuptk}/kontak-darurat`,
            k,
          );
        }
      }

      return res;
    },
    onSuccess: () => {
      toast.success(
        `Data guru berhasil ${isEdit ? "diperbarui" : "ditambahkan"}.`,
      );
      queryClient.invalidateQueries(["master-guru"]);
      navigate("/operator/master/guru");
    },
    onError: (err) => {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        setErrors(
          Object.fromEntries(
            Object.entries(serverErrors).map(([k, v]) => [k, v[0]]),
          ),
        );
        Object.values(serverErrors).forEach((msgs) =>
          msgs.forEach((m) => toast.error(m)),
        );
      } else {
        toast.error(
          err.response?.data?.message ?? "Gagal menyimpan data guru.",
        );
      }
    },
  });

  /* ── Navigasi step ── */
  const handleNext = () => {
    const errs = validateStep(currentStep, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const first = Object.values(errs)[0];
      toast.error(first);
      return;
    }
    setErrors({});
    setCurrentStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/operator/master/guru");
    }
  };

  const handleSubmit = () => {
    const errs = validateStep(currentStep, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error(Object.values(errs)[0]);
      return;
    }
    mutation.mutate(form);
  };

  /* ── Loading ── */
  if (isEdit && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin">
          progress_activity
        </span>
        <p className="font-body-md text-body-md text-text-secondary">
          Memuat data guru...
        </p>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-space-lg flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-1">
            <span
              onClick={() => navigate("/operator/master/guru")}
              className="hover:text-primary cursor-pointer transition-colors"
            >
              Data Guru
            </span>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-on-surface font-semibold">
              {isEdit ? "Edit Guru" : "Tambah Guru"}
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-1">
            {isEdit ? "Edit Data Guru" : "Tambah Guru Baru"}
          </h2>
          <p className="font-body-md text-body-md text-text-secondary font-medium">
            Lengkapi formulir data guru secara bertahap. Field bertanda{" "}
            <span className="text-danger">*</span> wajib diisi.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-surface rounded-[18px] border border-border-light shadow-sm overflow-hidden flex flex-col">
        <Stepper
          current={currentStep}
          onNavigate={setCurrentStep}
          isEdit={isEdit}
        />

        {/* Content */}
        {currentStep === 1 && (
          <Step1
            form={form}
            set={set}
            errors={errors}
            preview={preview}
            setPreview={setPreview}
            setForm={setForm}
            fileRef={fileRef}
            isEdit={isEdit}
          />
        )}
        {currentStep === 2 && <Step2 form={form} set={set} errors={errors} />}
        {currentStep === 3 && <Step3 form={form} set={set} errors={errors} />}
        {currentStep === 4 && (
          <Step4
            form={form}
            set={set}
            setAnak={setAnak}
            addAnak={addAnak}
            removeAnak={removeAnak}
          />
        )}
        {currentStep === 5 && (
          <Step5
            form={form}
            set={set}
            kontakDarurat={form.kontak_darurat ?? []}
            setKontak={setKontak}
            addKontak={addKontak}
            removeKontak={removeKontak}
          />
        )}

        {/* Footer */}
        <div className="p-6 border-t border-border-light bg-surface-bright flex justify-between items-center rounded-b-[18px]">
          <button
            type="button"
            onClick={handlePrev}
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

          {currentStep < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
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
              onClick={handleSubmit}
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
                  {isEdit ? "Perbarui Data Guru" : "Simpan Guru"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
