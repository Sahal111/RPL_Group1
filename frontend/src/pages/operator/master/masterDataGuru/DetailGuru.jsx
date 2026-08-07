import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

// Import helper & sub-tab components
import { fmtDate, MetricCard, TabBtn, BASE_URL } from "./tabs/helpers";
import TabIdentitas from "./tabs/TabIdentitas";
import TabPenugasan from "./tabs/TabPenugasan";
import TabPendidikan from "./tabs/TabPendidikan";
import TabKeluarga from "./tabs/TabKeluarga";
import TabDokumen from "./tabs/TabDokumen";
import TabRiwayat from "./tabs/TabRiwayat";
import TabAdministrasi from "./tabs/TabAdministrasi";
import TabAkunLogin from "./tabs/TabAkunLogin";

const TABS = [
  { id: "identitas", label: "Identitas & Kepegawaian" },
  { id: "penugasan", label: "Penugasan & Kompetensi" },
  { id: "pendidikan", label: "Pendidikan & Sertifikasi" },
  { id: "keluarga", label: "Keluarga & Kontak" },
  { id: "dokumen", label: "Dokumen" },
  { id: "riwayat", label: "Riwayat" },
  { id: "administrasi", label: "Administrasi" },
  { id: "akun", label: "Akun Login" },
];

export default function DetailGuru() {
  const { nuptk } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef();
  const [activeTab, setActiveTab] = useState("identitas");

  /* ── Queries ── */
  const { data: guru, isLoading } = useQuery({
    queryKey: ["guru-detail", nuptk],
    queryFn: () => api.get(`/operator/master-data/guru/${nuptk}`).then((r) => r.data.data),
  });

  const { data: akunGuru } = useQuery({
    queryKey: ["guru-akun", nuptk],
    queryFn: () =>
      api.get(`/operator/master-data/guru/${nuptk}/akun`).then((r) => r.data.data).catch(() => null),
    retry: false,
  });

  /* ── Mutations ── */
  const uploadFoto = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append("foto", file);
      return api.post(`/operator/master-data/guru/${nuptk}/foto`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Foto berhasil diupload.");
      queryClient.invalidateQueries(["guru-detail", nuptk]);
    },
    onError: () => toast.error("Gagal upload foto."),
  });

  const toggleActive = useMutation({
    mutationFn: (id) => api.patch(`/operator/users/${id}/toggle-active`),
    onSuccess: () => {
      toast.success("Status akun diperbarui.");
      queryClient.invalidateQueries(["guru-akun", nuptk]);
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  const resetPassword = useMutation({
    mutationFn: ({ id, password }) =>
      api.patch(`/operator/users/${id}/reset-password`, {
        password,
        password_confirmation: password,
      }),
    onSuccess: () => toast.success("Password berhasil direset."),
    onError: (err) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  const hapusAkun = useMutation({
    mutationFn: (id) => api.delete(`/operator/users/${id}`),
    onSuccess: () => {
      toast.success("Akun login dihapus.");
      queryClient.invalidateQueries(["guru-akun", nuptk]);
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  const mutasiVerifikasi = useMutation({
    mutationFn: () =>
      api.patch(
        `/operator/master-data/guru/${nuptk}/${guru.is_verified ? "batal-verifikasi" : "verifikasi"}`
      ),
    onSuccess: () => {
      toast.success(
        guru.is_verified
          ? "Verifikasi dibatalkan."
          : "Data guru berhasil diverifikasi."
      );
      queryClient.invalidateQueries(["guru-detail", nuptk]);
    },
  });

  const [showKoreksiNuptk, setShowKoreksiNuptk] = useState(false);
  const [nuptkBaru, setNuptkBaru] = useState("");
  const [alasanKoreksi, setAlasanKoreksi] = useState("");

  const koreksiNuptk = useMutation({
    mutationFn: () =>
      api.patch(`/operator/master-data/guru/${nuptk}/koreksi-nuptk`, {
        nuptk_baru: nuptkBaru,
        alasan: alasanKoreksi,
      }),
    onSuccess: (res) => {
      const newNuptk = res.data.data.nuptk_baru;
      toast.success("NUPTK berhasil dikoreksi.");
      setShowKoreksiNuptk(false);
      setNuptkBaru("");
      setAlasanKoreksi("");
      queryClient.invalidateQueries(["guru-detail", nuptk]);
      navigate(`/operator/master/guru/${newNuptk}`, { replace: true });
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Gagal mengoreksi NUPTK."),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin">
          progress_activity
        </span>
        <p className="text-sm text-text-secondary">Memuat data guru...</p>
      </div>
    );
  }

  if (!guru) {
    return (
      <div className="text-center py-20 text-text-secondary">
        Data guru tidak ditemukan.
      </div>
    );
  }

  const fotoUrl = guru.foto ? `${BASE_URL}/storage/${guru.foto}` : null;
  const namaLengkap =
    [guru.gelar_depan, guru.nama, guru.gelar_belakang]
      .filter(Boolean)
      .join(" ") ||
    guru.nama_lengkap ||
    guru.nama;

  const _jabatanRows =
    (guru.jabatans ?? []).length > 0 ? guru.jabatans : guru.status_kepegawaian ? [{}] : [];
  const riwayatBadgeFinal = (guru.mutasis?.length ?? 0) + _jabatanRows.length || null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight mb-2">
            Profil Lengkap Guru
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-fixed-variant text-xs font-semibold">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  guru.status_keaktifan === "Aktif" ? "bg-success" : "bg-outline"
                }`}
              />
              {guru.status_keaktifan ?? "Aktif"}
            </span>
            <span className="text-sm text-text-secondary font-medium">
              Terakhir diperbarui: {guru.updated_at ? fmtDate(guru.updated_at) : "-"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={() => navigate("/operator/master/guru")}
            className="px-4 py-2 bg-surface text-on-surface border border-outline-variant hover:bg-surface-container-low rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali
          </button>
          <button
            onClick={() => navigate(`/operator/master/guru/edit/${nuptk}`)}
            className="px-4 py-2 bg-primary text-on-primary hover:bg-primary/90 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Profil
          </button>
          <button
            onClick={() => { setNuptkBaru(guru.nuptk); setShowKoreksiNuptk(true); }}
            className="px-4 py-2 bg-surface text-warning border border-warning/30 hover:bg-warning/5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            Koreksi NUPTK
          </button>
          <button
            onClick={() => mutasiVerifikasi.mutate()}
            disabled={mutasiVerifikasi.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-[12px] text-sm font-bold border transition-colors ${
              guru.is_verified
                ? "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
                : "bg-success/10 text-success border-success/20 hover:bg-success/20"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {guru.is_verified ? "remove_moderator" : "verified_user"}
            </span>
            {guru.is_verified ? "Batalkan Verifikasi" : "Verifikasi Data"}
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 bg-surface text-on-surface border border-outline-variant hover:bg-surface-container-low rounded-lg transition-colors shadow-sm"
            title="Cetak Profil"
          >
            <span className="material-symbols-outlined text-[20px]">print</span>
          </button>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-surface rounded-card p-6 border border-border-light shadow-sm flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-low shadow-sm mb-4 relative">
            {fotoUrl ? (
              <img src={fotoUrl} alt={namaLengkap} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-secondary-container flex items-center justify-center">
                <span className="text-primary font-bold text-4xl">
                  {guru.nama?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
              title="Ganti foto"
            >
              <span className="material-symbols-outlined text-on-primary text-[16px]">
                photo_camera
              </span>
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

          <h2 className="font-section-title text-section-title text-text-primary mb-1">
            {namaLengkap}
          </h2>
          <p className="text-sm text-text-secondary font-medium mb-4">
            {guru.nip ? `NIP. ${guru.nip}` : `NUPTK. ${guru.nuptk}`}
          </p>

          <div className="w-full flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-center py-2 border-b border-surface-container-high text-sm">
              <span className="text-text-secondary">Status</span>
              <span className="font-semibold text-text-primary">{guru.status_kepegawaian ?? "-"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-surface-container-high text-sm">
              <span className="text-text-secondary">Peran Utama</span>
              <span className="font-semibold text-text-primary">{guru.jenis_ptk ?? "-"}</span>
            </div>
            <div className="flex justify-between items-center py-2 text-sm">
              <span className="text-text-secondary">Tugas Tambahan</span>
              <span className="font-semibold text-primary">{guru.tugas_tambahan ?? "—"}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            <MetricCard
              icon="schedule" iconBg="bg-primary-container/10" iconColor="text-primary"
              label="Total Jam Mengajar" value={guru.total_jam ?? "—"} sub="Jam/Minggu"
            />
            <MetricCard
              icon="school" iconBg="bg-secondary-container/30" iconColor="text-secondary"
              label="Masa Kerja" value={guru.masa_kerja_tahun ?? "—"} sub="Tahun"
            />
            <MetricCard
              icon="star" iconBg="bg-warning/10" iconColor="text-warning"
              label="Nilai PKG" value={guru.nilai_pkg ?? "—"} sub={guru.nilai_pkg ? "(Baik)" : ""}
              subColor="text-success"
            />
          </div>

          <div className="bg-gradient-to-r from-surface to-surface-container-low rounded-xl p-5 border border-border-light shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
            <div className="flex flex-wrap items-center gap-6">
              {guru.no_hp && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-text-secondary text-[20px]">call</span>
                  <span className="text-sm font-medium text-text-primary">{guru.no_hp}</span>
                </div>
              )}
              {guru.email && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-text-secondary text-[20px]">mail</span>
                  <span className="text-sm font-medium text-text-primary">{guru.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Content Area */}
      <div className="bg-surface rounded-card border border-border-light shadow-sm overflow-hidden flex flex-col mt-4">
        <div className="flex overflow-x-auto border-b border-surface-container-high px-2 pt-2">
          {TABS.map((t) => (
            <TabBtn
              key={t.id}
              active={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              badge={t.id === "riwayat" ? riwayatBadgeFinal : undefined}
            >
              {t.label}
            </TabBtn>
          ))}
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          {activeTab === "identitas" && (
            <TabIdentitas guru={guru} onGoToRiwayat={() => setActiveTab("riwayat")} />
          )}
          {activeTab === "penugasan" && <TabPenugasan guru={guru} nuptk={nuptk} />}
          {activeTab === "pendidikan" && <TabPendidikan nuptk={nuptk} guru={guru} />}
          {activeTab === "keluarga" && <TabKeluarga guru={guru} />}
          {activeTab === "dokumen" && <TabDokumen nuptk={nuptk} guru={guru} />}
          {activeTab === "riwayat" && <TabRiwayat nuptk={nuptk} guru={guru} />}
          {activeTab === "administrasi" && <TabAdministrasi guru={guru} />}
          {activeTab === "akun" && (
            <TabAkunLogin
              akunGuru={akunGuru} nuptk={nuptk} navigate={navigate}
              toggleActive={toggleActive} resetPassword={resetPassword} hapusAkun={hapusAkun}
            />
          )}
        </div>
      </div>

      {/* Modal Koreksi NUPTK */}
      {showKoreksiNuptk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md border border-border-light">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
              <h3 className="font-bold text-text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-warning text-[20px]">edit_note</span>
                Koreksi NUPTK
              </h3>
              <button onClick={() => setShowKoreksiNuptk(false)} className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">NUPTK Saat Ini</label>
                <input type="text" value={guru.nuptk} readOnly className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface-container text-text-secondary font-mono text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">NUPTK Baru <span className="text-danger">*</span></label>
                <input type="text" maxLength={16} value={nuptkBaru} onChange={(e) => setNuptkBaru(e.target.value.replace(/\D/g, ""))} className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm" placeholder="16 digit NUPTK" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Alasan Koreksi <span className="text-danger">*</span></label>
                <textarea rows={2} maxLength={255} value={alasanKoreksi} onChange={(e) => setAlasanKoreksi(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none" placeholder="Alasan koreksi..." />
              </div>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-border-light">
              <button onClick={() => setShowKoreksiNuptk(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface-container text-sm font-medium transition-colors">Batal</button>
              <button onClick={() => {
                if (nuptkBaru.length !== 16) { toast.error("NUPTK harus 16 digit."); return; }
                if (!alasanKoreksi.trim()) { toast.error("Alasan koreksi wajib diisi."); return; }
                koreksiNuptk.mutate();
              }} disabled={koreksiNuptk.isPending} className="flex-1 px-4 py-2.5 rounded-xl bg-warning text-white text-sm font-semibold hover:bg-warning/90 transition-colors disabled:opacity-60">
                {koreksiNuptk.isPending ? "Menyimpan..." : "Simpan Koreksi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
