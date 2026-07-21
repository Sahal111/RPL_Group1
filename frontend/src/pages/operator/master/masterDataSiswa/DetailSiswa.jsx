import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";
import { Copy, RefreshCw } from "lucide-react";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001";

const getPrimaryOrangTua = (ortu) => {
  if (Array.isArray(ortu)) return ortu[0] ?? null;
  return ortu ?? null;
};

const yearOnly = (date) => (date ? String(date).slice(0, 4) : "-");

const TABS = [
  { id: "biodata", label: "Biodata" },
  { id: "orang_tua", label: "Orang Tua" },
  { id: "alamat", label: "Alamat" },
  { id: "akademik", label: "Akademik" },
  { id: "kehadiran", label: "Kehadiran" },
  { id: "nilai", label: "Nilai" },
  { id: "pembayaran", label: "Pembayaran" },
  { id: "prestasi", label: "Prestasi" },
  { id: "pelanggaran", label: "Pelanggaran" },
  { id: "dokumen", label: "Dokumen" },
  { id: "riwayat", label: "Riwayat" },
  { id: "log", label: "Log Aktivitas" },
];

export default function DetailSiswa() {
  const { nisn } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef();
  const [activeTab, setActiveTab] = useState("biodata");

  const { data: siswa, isLoading } = useQuery({
    queryKey: ["siswa-detail", nisn],
    queryFn: () =>
      api.get(`/operator/master-data/siswa/${nisn}`).then((r) => r.data.data),
  });

  const uploadFoto = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append("foto", file);
      return api.post(`/operator/master-data/siswa/${nisn}/foto`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Foto berhasil diupload.");
      queryClient.invalidateQueries(["siswa-detail", nisn]);
    },
    onError: () => toast.error("Gagal upload foto."),
  });

  const regenerateKode = useMutation({
    mutationFn: () =>
      api.post(`/operator/master-data/siswa/${nisn}/regenerate-kode-anak`),
    onSuccess: (res) => {
      toast.success("Kode anak berhasil dibuat ulang.");
      queryClient.setQueryData(["siswa-detail", nisn], (old) =>
        old ? { ...old, kode_anak: res.data.data.kode_anak } : old,
      );
    },
    onError: () => toast.error("Gagal membuat ulang kode."),
  });

  const salinKode = () => {
    if (!siswa?.kode_anak) return;
    navigator.clipboard.writeText(siswa.kode_anak);
    toast.success("Kode disalin.");
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-text-secondary font-medium">
            Memuat data siswa...
          </p>
        </div>
      </div>
    );

  if (!siswa)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <span className="material-symbols-outlined text-[64px] text-text-secondary">
          person_off
        </span>
        <p className="text-text-secondary font-medium">
          Data siswa tidak ditemukan.
        </p>
        <button
          onClick={() => navigate("/operator/master/siswa")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-[12px] text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          Kembali ke Daftar Siswa
        </button>
      </div>
    );

  const fotoUrl = siswa.foto ? `${BASE_URL}/storage/${siswa.foto}` : null;
  const isL = siswa.jenis_kelamin === "L";
  const dataOrangTua = getPrimaryOrangTua(siswa.orang_tua);
  const isAktif = siswa.status_pd === "Aktif";
  const kelasAktif = siswa.kelas_aktif ?? siswa.kelas ?? null;

  return (
    <div>
      {/* ── Breadcrumb ── */}
      <nav
        className="flex items-center gap-1.5 text-sm mb-3"
        aria-label="Breadcrumb"
      >
        <button
          onClick={() => navigate("/operator/master/siswa")}
          className="text-text-secondary hover:text-text-primary transition-colors font-medium"
        >
          Data Master
        </button>
        <span className="material-symbols-outlined text-[16px] text-text-secondary">
          chevron_right
        </span>
        <button
          onClick={() => navigate("/operator/master/siswa")}
          className="text-text-secondary hover:text-text-primary transition-colors font-medium"
        >
          Siswa
        </button>
        <span className="material-symbols-outlined text-[16px] text-text-secondary">
          chevron_right
        </span>
        <span className="text-text-primary font-semibold">
          {siswa.nama_lengkap ?? "Detail Siswa"}
        </span>
      </nav>

      {/* ── Page Header & Actions ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="font-headline text-[20px] font-semibold text-text-primary leading-tight">
            Detail Siswa
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-border-light text-text-primary text-sm font-medium rounded-[12px] hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">
              history
            </span>
            Riwayat Perubahan
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-border-light text-text-primary text-sm font-medium rounded-[12px] hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            Download
            <span className="material-symbols-outlined text-[18px]">
              expand_more
            </span>
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-border-light text-text-primary text-sm font-medium rounded-[12px] hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">print</span>
            Cetak Biodata
          </button>
          <button
            onClick={() =>
              navigate(`/operator/master/siswa/edit/${siswa.nisn}`)
            }
            className="inline-flex items-center gap-2 px-4 py-2 bg-info text-white text-sm font-semibold rounded-[12px] hover:bg-blue-700 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Data
          </button>
        </div>
      </div>

      {/* ── Two-column layout: Main | Right Panel ── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ══ LEFT / MAIN COLUMN ══ */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Summary Card */}
          <div className="bg-surface-container-lowest rounded-[16px] border border-border-light shadow-sm p-6 flex flex-col md:flex-row gap-6">
            {/* Portrait photo */}
            <div className="relative flex-shrink-0 self-start">
              <button
                onClick={() => fileRef.current?.click()}
                className="group block w-32 h-40 rounded-xl overflow-hidden border border-border-light shadow-sm bg-surface-container-low"
                title="Ganti Foto"
              >
                {fotoUrl ? (
                  <img
                    src={fotoUrl}
                    alt={siswa.nama_lengkap}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${isL ? "bg-blue-100" : "bg-pink-100"}`}
                  >
                    <span
                      className={`font-bold text-5xl ${isL ? "text-blue-700" : "text-pink-700"}`}
                    >
                      {siswa.nama_lengkap?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white text-[24px]">
                    photo_camera
                  </span>
                </div>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadFoto.mutate(file);
                }}
              />
            </div>

            {/* Info grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name row */}
              <div className="col-span-1 md:col-span-2 flex flex-wrap justify-between items-start gap-2">
                <div>
                  <h3 className="font-headline text-[17px] font-semibold text-text-primary mb-1">
                    {siswa.nama_lengkap}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-text-secondary text-sm">
                    <span>NISN: {siswa.nisn}</span>
                    {siswa.no_induk && (
                      <>
                        <span>•</span>
                        <span>NIS: {siswa.no_induk}</span>
                      </>
                    )}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    isAktif
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-surface-container text-text-secondary border-border-light"
                  }`}
                >
                  {siswa.status_pd ?? "Aktif"}
                </span>
              </div>

              {/* Info items */}
              <div className="space-y-3 text-[15px] mt-2">
                <SummaryItem
                  icon="person"
                  label="Jenis Kelamin"
                  value={isL ? "Laki-laki" : "Perempuan"}
                />
                <SummaryItem
                  icon="cake"
                  label="Tempat, Tgl Lahir"
                  value={
                    siswa.tempat_lahir && siswa.tanggal_lahir
                      ? `${siswa.tempat_lahir}, ${siswa.tanggal_lahir}`
                      : (siswa.tempat_lahir ?? siswa.tanggal_lahir ?? "-")
                  }
                />
                <SummaryItem
                  icon="mosque"
                  label="Agama"
                  value={siswa.agama ?? "-"}
                />
              </div>
              <div className="space-y-3 text-[15px] mt-2">
                <SummaryItem
                  icon="school"
                  label="Kelas / Rombel"
                  value={
                    kelasAktif
                      ? `${kelasAktif.tingkat ?? ""} / ${kelasAktif.nama_kelas ?? "-"}`.replace(
                          /^\/\s*/,
                          "",
                        )
                      : "-"
                  }
                />
                <SummaryItem
                  icon="calendar_today"
                  label="Tahun Ajaran"
                  value={
                    siswa.tanggal_masuk
                      ? `${String(siswa.tanggal_masuk).slice(0, 4)}/${parseInt(String(siswa.tanggal_masuk).slice(0, 4)) + 1}`
                      : "-"
                  }
                />
                <SummaryItem
                  icon="login"
                  label="Tanggal Masuk"
                  value={siswa.tanggal_masuk ?? "-"}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard icon="event_available" label="Kehadiran" value="98%" />
            <StatCard icon="analytics" label="Rata-rata" value="—" />
            <StatCard icon="warning" label="Pelanggaran" value="0" />
            <StatCard icon="emoji_events" label="Prestasi" value="—" />
            <StatCard
              icon="account_balance_wallet"
              label="Tagihan"
              valueClass="text-success"
              value="Rp 0"
            />
          </div>

          {/* Tabs + Content Card */}
          <div
            className="bg-surface-container-lowest rounded-[16px] border border-border-light shadow-sm overflow-hidden flex flex-col"
            style={{ minHeight: "600px" }}
          >
            {/* Tab Nav */}
            <ScrollableTabs
              tabs={TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {activeTab === "biodata" && (
                <TabBiodata siswa={siswa} isL={isL} />
              )}
              {activeTab === "orang_tua" && (
                <TabOrangTua dataOrangTua={dataOrangTua} yearOnly={yearOnly} />
              )}
              {activeTab === "alamat" && <TabAlamat siswa={siswa} />}
              {activeTab === "akademik" && (
                <TabAkademik siswa={siswa} kelasAktif={kelasAktif} />
              )}
              {(activeTab === "kehadiran" ||
                activeTab === "nilai" ||
                activeTab === "pembayaran" ||
                activeTab === "prestasi" ||
                activeTab === "pelanggaran" ||
                activeTab === "dokumen" ||
                activeTab === "riwayat" ||
                activeTab === "log") && (
                <TabComingSoon
                  label={TABS.find((t) => t.id === activeTab)?.label}
                />
              )}
            </div>
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-surface-container-lowest rounded-[16px] border border-border-light shadow-sm p-5 lg:sticky lg:top-[96px]">
            <h4 className="font-headline text-[13px] font-semibold text-text-primary mb-4">
              Quick Actions
            </h4>
            <div className="space-y-3">
              {/* WhatsApp */}
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-border-light hover:border-[#25D366] hover:bg-[#25D366]/5 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                    <span className="material-symbols-outlined text-[18px]">
                      chat
                    </span>
                  </div>
                  <span className="text-sm font-medium text-text-primary group-hover:text-[#25D366] transition-colors">
                    Send WhatsApp
                  </span>
                </div>
                <span className="material-symbols-outlined text-text-secondary text-[18px]">
                  chevron_right
                </span>
              </button>

              {/* Print ID */}
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-border-light hover:border-info hover:bg-info/5 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center text-info">
                    <span className="material-symbols-outlined text-[18px]">
                      badge
                    </span>
                  </div>
                  <span className="text-sm font-medium text-text-primary group-hover:text-info transition-colors">
                    Print ID Card
                  </span>
                </div>
                <span className="material-symbols-outlined text-text-secondary text-[18px]">
                  chevron_right
                </span>
              </button>

              {/* Kode Anak / Generate QR */}
              <button
                onClick={() => {
                  if (siswa?.kode_anak) {
                    navigator.clipboard.writeText(siswa.kode_anak);
                    toast.success("Kode anak disalin.");
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border-light hover:border-text-primary hover:bg-surface-container-low transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-text-primary">
                    <span className="material-symbols-outlined text-[18px]">
                      qr_code
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-medium text-text-primary block">
                      Kode Anak
                    </span>
                    {siswa.kode_anak && (
                      <span className="text-xs font-mono text-text-secondary">
                        {siswa.kode_anak}
                      </span>
                    )}
                  </div>
                </div>
                <Copy className="w-4 h-4 text-text-secondary" />
              </button>

              {/* Regenerate Kode */}
              <button
                onClick={() => regenerateKode.mutate()}
                disabled={regenerateKode.isPending}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border-light hover:border-text-primary hover:bg-surface-container-low transition-colors group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-text-primary">
                    <RefreshCw
                      className={`w-4 h-4 ${regenerateKode.isPending ? "animate-spin" : ""}`}
                    />
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    Regenerate Kode
                  </span>
                </div>
                <span className="material-symbols-outlined text-text-secondary text-[18px]">
                  chevron_right
                </span>
              </button>

              {/* Nonaktifkan — danger */}
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-border-light hover:border-danger hover:bg-danger/5 transition-colors group mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center text-danger">
                    <span className="material-symbols-outlined text-[18px]">
                      block
                    </span>
                  </div>
                  <span className="text-sm font-medium text-danger">
                    Nonaktifkan Siswa
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB: BIODATA
══════════════════════════════════════════ */
function TabBiodata({ siswa, isL }) {
  return (
    <div>
      <h4 className="font-headline text-[13px] font-semibold text-text-primary mb-4">
        Identitas Siswa
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <BiodataField label="Nama Lengkap" value={siswa.nama_lengkap} />
        <BiodataField
          label="Nama Panggilan"
          value={siswa.nama_panggilan ?? "-"}
        />
        <BiodataField label="NIS" value={siswa.no_induk ?? "-"} />
        <BiodataField label="NISN" value={siswa.nisn} />
        <BiodataField label="NIK" value={siswa.nik ?? "-"} />
        <BiodataField label="No. Kartu Keluarga" value={siswa.no_kk ?? "-"} />
        <BiodataField
          label="Tempat, Tanggal Lahir"
          value={
            siswa.tempat_lahir && siswa.tanggal_lahir
              ? `${siswa.tempat_lahir}, ${siswa.tanggal_lahir}`
              : (siswa.tempat_lahir ?? siswa.tanggal_lahir ?? "-")
          }
        />
        <BiodataField
          label="Jenis Kelamin"
          value={isL ? "Laki-laki" : "Perempuan"}
        />
        <BiodataField label="Agama" value={siswa.agama ?? "-"} />
        <BiodataField
          label="Kewarganegaraan"
          value={siswa.kewarganegaraan ?? "-"}
        />
        <BiodataField
          label="Anak Ke / Dari"
          value={siswa.anak_ke ? `${siswa.anak_ke} Bersaudara` : "-"}
        />
        <BiodataField
          label="Status Anak"
          value={siswa.status_dalam_keluarga ?? "-"}
        />
        <BiodataField label="No. Handphone" value={siswa.no_hp ?? "-"} />
        <BiodataField
          label="No. Akta Lahir"
          value={siswa.no_akta_lahir ?? "-"}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB: ORANG TUA
══════════════════════════════════════════ */
function TabOrangTua({ dataOrangTua, yearOnly }) {
  if (!dataOrangTua) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <span className="material-symbols-outlined text-[48px] text-text-secondary">
          family_restroom
        </span>
        <p className="text-text-secondary font-medium text-sm">
          Belum ada data orang tua/wali yang tertaut ke siswa ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Kontak */}
      <div>
        <h4 className="font-headline text-[13px] font-semibold text-text-primary mb-4">
          Kontak & Alamat
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <BiodataField label="Email" value={dataOrangTua.email ?? "-"} />
          <BiodataField label="No. HP" value={dataOrangTua.no_hp ?? "-"} />
          <BiodataField
            label="Alamat Domisili"
            value={dataOrangTua.alamat ?? "-"}
            fullWidth
          />
        </div>
      </div>

      {/* Ayah */}
      <div>
        <h4 className="font-headline text-[13px] font-semibold text-text-primary mb-4">
          Ayah Kandung
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <BiodataField
            label="Nama Lengkap"
            value={dataOrangTua.nama_ayah ?? "-"}
          />
          <BiodataField label="NIK" value={dataOrangTua.nik_ayah ?? "-"} />
          <BiodataField
            label="Tahun Lahir"
            value={yearOnly(dataOrangTua.tanggal_lahir_ayah)}
          />
          <BiodataField
            label="Pendidikan"
            value={dataOrangTua.pendidikan_ayah ?? "-"}
          />
          <BiodataField
            label="Pekerjaan"
            value={dataOrangTua.pekerjaan_ayah ?? "-"}
          />
          <BiodataField
            label="Penghasilan"
            value={dataOrangTua.penghasilan_ayah ?? "-"}
          />
          <BiodataField label="No. HP" value={dataOrangTua.no_hp_ayah ?? "-"} />
        </div>
      </div>

      {/* Ibu */}
      <div>
        <h4 className="font-headline text-[13px] font-semibold text-text-primary mb-4">
          Ibu Kandung
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <BiodataField
            label="Nama Lengkap"
            value={dataOrangTua.nama_ibu ?? "-"}
          />
          <BiodataField label="NIK" value={dataOrangTua.nik_ibu ?? "-"} />
          <BiodataField
            label="Tahun Lahir"
            value={yearOnly(dataOrangTua.tanggal_lahir_ibu)}
          />
          <BiodataField
            label="Pendidikan"
            value={dataOrangTua.pendidikan_ibu ?? "-"}
          />
          <BiodataField
            label="Pekerjaan"
            value={dataOrangTua.pekerjaan_ibu ?? "-"}
          />
          <BiodataField
            label="Penghasilan"
            value={dataOrangTua.penghasilan_ibu ?? "-"}
          />
          <BiodataField label="No. HP" value={dataOrangTua.no_hp_ibu ?? "-"} />
        </div>
      </div>

      {/* Wali */}
      <div>
        <h4 className="font-headline text-[13px] font-semibold text-text-primary mb-4">
          Wali
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <BiodataField
            label="Nama Lengkap"
            value={dataOrangTua.nama_wali ?? "-"}
          />
          <BiodataField label="NIK" value={dataOrangTua.nik_wali ?? "-"} />
          <BiodataField
            label="Hubungan"
            value={dataOrangTua.hubungan_wali ?? "-"}
          />
          <BiodataField
            label="Pekerjaan"
            value={dataOrangTua.pekerjaan_wali ?? "-"}
          />
          <BiodataField
            label="Penghasilan"
            value={dataOrangTua.penghasilan_wali ?? "-"}
          />
          <BiodataField label="No. HP" value={dataOrangTua.no_hp_wali ?? "-"} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB: ALAMAT
══════════════════════════════════════════ */
function TabAlamat({ siswa }) {
  return (
    <div>
      <h4 className="font-headline text-[13px] font-semibold text-text-primary mb-4">
        Alamat Siswa
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <BiodataField
          label="Jalan"
          value={siswa.alamat_jalan ?? "-"}
          fullWidth
        />
        <BiodataField
          label="RT / RW"
          value={
            siswa.rt || siswa.rw
              ? `${siswa.rt ?? "-"} / ${siswa.rw ?? "-"}`
              : "-"
          }
        />
        <BiodataField label="Desa / Kelurahan" value={siswa.desa ?? "-"} />
        <BiodataField label="Kecamatan" value={siswa.kecamatan ?? "-"} />
        <BiodataField label="Kabupaten / Kota" value={siswa.kabupaten ?? "-"} />
        <BiodataField label="Provinsi" value={siswa.provinsi ?? "-"} />
        <BiodataField label="Kode Pos" value={siswa.kode_pos ?? "-"} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB: AKADEMIK
══════════════════════════════════════════ */
function TabAkademik({ siswa, kelasAktif }) {
  return (
    <div>
      <h4 className="font-headline text-[13px] font-semibold text-text-primary mb-4">
        Data Akademik
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <BiodataField label="Status PD" value={siswa.status_pd ?? "-"} />
        <BiodataField
          label="Tanggal Masuk"
          value={siswa.tanggal_masuk ?? "-"}
        />
        <BiodataField
          label="Kelas / Rombel"
          value={
            kelasAktif
              ? `${kelasAktif.tingkat ?? ""} / ${kelasAktif.nama_kelas ?? "-"}`.replace(
                  /^\/\s*/,
                  "",
                )
              : "-"
          }
        />
        <BiodataField
          label="Wali Kelas"
          value={kelasAktif?.wali_kelas ?? "-"}
        />
        <BiodataField
          label="Asal Sekolah"
          value={siswa.asal_sekolah ?? "-"}
          fullWidth
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB: COMING SOON (placeholder)
══════════════════════════════════════════ */
function TabComingSoon({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span className="material-symbols-outlined text-[48px] text-text-secondary">
        construction
      </span>
      <p className="font-semibold text-text-primary">{label}</p>
      <p className="text-sm text-text-secondary">Fitur ini belum tersedia.</p>
    </div>
  );
}

/* ══════════════════════════════════════════
   SCROLLABLE TAB NAV WITH FADE GRADIENTS
══════════════════════════════════════════ */
function ScrollableTabs({ tabs, activeTab, onTabChange }) {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 4);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, []);

  // scroll active tab into view whenever it changes
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const active = el.querySelector("[data-active='true']");
    if (active) {
      active.scrollIntoView({
        inline: "nearest",
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [activeTab]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 140, behavior: "smooth" });
  };

  return (
    <div className="relative border-b border-border-light bg-surface-bright flex-none">
      {/* Left fade + chevron */}
      {showLeft && (
        <div
          className="absolute left-0 top-0 bottom-0 w-12 z-10 flex items-center pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, var(--color-surface-bright) 60%, transparent)",
          }}
        >
          <button
            className="ml-1 w-7 h-7 flex items-center justify-center rounded-full bg-surface-container-low border border-border-light shadow-sm text-text-secondary hover:text-text-primary transition-colors pointer-events-auto"
            onClick={() => scroll(-1)}
            tabIndex={-1}
          >
            <span className="material-symbols-outlined text-[16px]">
              chevron_left
            </span>
          </button>
        </div>
      )}

      {/* Right fade + chevron */}
      {showRight && (
        <div
          className="absolute right-0 top-0 bottom-0 w-12 z-10 flex items-center justify-end pointer-events-none"
          style={{
            background:
              "linear-gradient(to left, var(--color-surface-bright) 60%, transparent)",
          }}
        >
          <button
            className="mr-1 w-7 h-7 flex items-center justify-center rounded-full bg-surface-container-low border border-border-light shadow-sm text-text-secondary hover:text-text-primary transition-colors pointer-events-auto"
            onClick={() => scroll(1)}
            tabIndex={-1}
          >
            <span className="material-symbols-outlined text-[16px]">
              chevron_right
            </span>
          </button>
        </div>
      )}

      {/* Scrollable nav */}
      <div
        ref={scrollRef}
        className="flex px-2 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        aria-label="Tabs"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              data-active={isActive}
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex-shrink-0 ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-light"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SHARED COMPONENTS
══════════════════════════════════════════ */

/** Field bergaya dashed-border seperti template */
function BiodataField({ label, value, fullWidth = false }) {
  return (
    <div className={`space-y-1 ${fullWidth ? "col-span-full" : ""}`}>
      <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
        {label}
      </label>
      <div className="text-[15px] text-text-primary font-medium py-1 border-b border-dashed border-border-light pb-2">
        {value || "-"}
      </div>
    </div>
  );
}

/** Item di Summary Card */
function SummaryItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="material-symbols-outlined text-text-secondary text-[18px] mt-0.5 flex-shrink-0">
        {icon}
      </span>
      <div>
        <span className="text-text-secondary text-sm block">{label}</span>
        <span className="font-medium text-text-primary">{value}</span>
      </div>
    </div>
  );
}

/** Stat card kecil di Quick Stats Grid */
function StatCard({ icon, label, value, valueClass = "text-text-primary" }) {
  return (
    <div className="bg-surface-container-lowest rounded-[16px] border border-border-light shadow-sm p-4 flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-2 text-text-secondary">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div
        className={`text-[18px] font-semibold font-headline leading-tight ${valueClass}`}
      >
        {value}
      </div>
    </div>
  );
}
