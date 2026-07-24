import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function fmt(str) {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function occupancyColor(pct) {
  if (pct >= 1) return "bg-danger";
  if (pct >= 0.85) return "bg-warning";
  return "bg-primary";
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-surface-container-high rounded-xl ${className}`} />
  );
}

function SkeletonPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <div className="flex gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
      {/* Hero */}
      <Skeleton className="h-56 rounded-[18px]" />
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-[18px]" />)}
      </div>
      {/* Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Skeleton className="h-64 rounded-[18px]" />
          <Skeleton className="h-48 rounded-[18px]" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-[18px]" />
          <Skeleton className="h-44 rounded-[18px]" />
        </div>
      </div>
    </div>
  );
}

// ── Modal Edit Kelas ──────────────────────────────────────────────────────────
function ModalEditKelas({ open, kelas, onClose, queryClient, id }) {
  const [form, setForm] = useState({
    nama_kelas: "",
    tingkat: "1",
    kurikulum: "Kurikulum Merdeka",
    kapasitas: "30",
    ruangan: "",
    is_active: true,
  });

  // Sync when open
  useState(() => {
    if (open && kelas) {
      setForm({
        nama_kelas: kelas.nama_kelas ?? "",
        tingkat: String(kelas.tingkat ?? "1"),
        kurikulum: kelas.kurikulum ?? "Kurikulum Merdeka",
        kapasitas: String(kelas.kapasitas ?? "30"),
        ruangan: kelas.ruangan ?? "",
        is_active: kelas.is_active ?? true,
      });
    }
  }, [open, kelas]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const mut = useMutation({
    mutationFn: (data) => api.put(`/operator/master-data/kelas/${id}`, data),
    onSuccess: () => {
      toast.success("Kelas berhasil diperbarui.");
      queryClient.invalidateQueries(["detail-kelas", id]);
      onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menyimpan."),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-surface-container text-text-secondary"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[20px]">edit</span>
          </div>
          <div>
            <h2 className="font-semibold text-text-primary">Edit Data Kelas</h2>
            <p className="text-xs text-text-secondary">Ubah informasi master data kelas</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Nama Kelas</label>
            <input
              type="text"
              value={form.nama_kelas}
              onChange={(e) => set("nama_kelas", e.target.value)}
              className="w-full border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Contoh: Kelas 1-A"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Tingkat</label>
              <select
                value={form.tingkat}
                onChange={(e) => set("tingkat", e.target.value)}
                className="w-full border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              >
                {[1, 2, 3, 4, 5, 6].map((t) => (
                  <option key={t} value={String(t)}>Kelas {t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Kapasitas</label>
              <input
                type="number"
                value={form.kapasitas}
                onChange={(e) => set("kapasitas", e.target.value)}
                min={1}
                max={60}
                className="w-full border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Kurikulum</label>
            <select
              value={form.kurikulum}
              onChange={(e) => set("kurikulum", e.target.value)}
              className="w-full border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            >
              <option>Kurikulum Merdeka</option>
              <option>Kurikulum 2013</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Ruangan</label>
            <input
              type="text"
              value={form.ruangan}
              onChange={(e) => set("ruangan", e.target.value)}
              className="w-full border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Contoh: Ruang 01"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set("is_active", !form.is_active)}
              className={`relative inline-flex w-11 h-6 rounded-full transition-colors focus:outline-none ${
                form.is_active ? "bg-primary" : "bg-border-light"
              }`}
            >
              <span
                className={`inline-block w-4 h-4 mt-1 rounded-full bg-white shadow transition-transform ${
                  form.is_active ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-text-primary">
              Status: <span className={form.is_active ? "text-success font-medium" : "text-text-secondary"}>{form.is_active ? "Aktif" : "Tidak Aktif"}</span>
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-border-light text-text-secondary rounded-xl text-sm font-medium hover:bg-surface-container transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() =>
              mut.mutate({
                nama_kelas: form.nama_kelas,
                tingkat: parseInt(form.tingkat),
                kurikulum: form.kurikulum,
                kapasitas: parseInt(form.kapasitas),
                ruangan: form.ruangan,
                is_active: form.is_active,
              })
            }
            disabled={mut.isPending}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-60"
          >
            {mut.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DetailKelas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["detail-kelas", id],
    queryFn: () =>
      api.get(`/operator/master-data/kelas/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });

  if (isLoading) return <SkeletonPage />;

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-text-secondary">
        <span className="material-symbols-outlined text-[56px] text-outline-variant">
          class
        </span>
        <p className="font-medium text-text-primary">Data kelas tidak ditemukan.</p>
        <button
          onClick={() => navigate("/operator/master/kelas")}
          className="text-primary text-sm hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Kembali ke Master Kelas
        </button>
      </div>
    );
  }

  // ── Derived values ──
  const kelas = data;
  const totalSiswa = kelas.total_siswa ?? 0;
  const kapasitas = kelas.kapasitas ?? 0;
  const occupancyPct = kapasitas > 0 ? (totalSiswa / kapasitas) * 100 : 0;
  const occupancyBar = Math.min(100, occupancyPct);
  const isAktif = kelas.is_active === 1 || kelas.is_active === true;
  const wali = kelas.wali;

  // Riwayat dari siswas + siswa_keluar → group by (kita tampilkan dari data yang ada)
  const siswasAktif = kelas.siswas ?? [];
  const siswasKeluar = kelas.siswa_keluar ?? [];

  // Statistik sederhana dari data yang tersedia
  const totalSiswaHistory = siswasAktif.length + siswasKeluar.length;

  return (
    <div className="space-y-space-lg pb-12">

      {/* ── Breadcrumb ── */}
      <nav className="hidden sm:flex items-center text-sm text-text-secondary gap-1.5 mt-2">
        <Link to="/operator/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        <span className="material-symbols-outlined text-sm text-outline-variant">chevron_right</span>
        <Link to="/operator/master/kelas" className="hover:text-primary transition-colors">Master Data</Link>
        <span className="material-symbols-outlined text-sm text-outline-variant">chevron_right</span>
        <Link to="/operator/master/kelas" className="hover:text-primary transition-colors">Kelas</Link>
        <span className="material-symbols-outlined text-sm text-outline-variant">chevron_right</span>
        <span className="text-text-primary font-medium">Detail Kelas</span>
      </nav>

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-text-primary">
            Detail Master Data Kelas
          </h2>
          <p className="text-text-secondary mt-1 text-sm">
            Kelola dan lihat riwayat data kelas secara terperinci.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate("/operator/master/kelas")}
            className="px-4 py-2 bg-surface-container-lowest border border-border-light text-text-primary rounded-lg font-medium hover:bg-surface-container-low transition-colors flex items-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary-container transition-colors flex items-center gap-2 shadow-sm text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Kelas
          </button>
        </div>
      </div>

      {/* ── Hero Card ── */}
      <div className="bg-surface-container-lowest rounded-[18px] border border-border-light shadow-sm p-space-lg flex flex-col md:flex-row justify-between gap-8 relative overflow-hidden">
        {/* Decorative blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />

        {/* Left: Info */}
        <div className="flex-1 z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-surface-container-low rounded-2xl border border-border-light flex items-center justify-center shrink-0">
              <span className="font-bold text-xl text-primary leading-none">
                {kelas.nama_kelas?.split(" ").slice(-1)[0] || kelas.nama_kelas || "?"}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-headline-md text-headline-md text-text-primary">
                  {kelas.nama_kelas}
                </h3>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border ${
                    isAktif
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-surface-variant text-text-secondary border-border-light"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isAktif ? "bg-success" : "bg-text-secondary"}`} />
                  {isAktif ? "Aktif" : "Tidak Aktif"}
                </span>
              </div>
              <p className="text-text-secondary text-sm mt-1">
                Master data referensi untuk pendaftaran dan akademik.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div className="flex flex-col">
              <span className="text-text-secondary mb-1 text-xs uppercase tracking-wide font-medium">Kode Kelas</span>
              <span className="text-text-primary font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">tag</span>
                {kelas.id ? `KLS${String(kelas.id).padStart(3, "0")}` : "-"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-text-secondary mb-1 text-xs uppercase tracking-wide font-medium">Tingkat</span>
              <span className="text-text-primary font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">signal_cellular_alt</span>
                {kelas.tingkat ? `Kelas ${kelas.tingkat}` : "-"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-text-secondary mb-1 text-xs uppercase tracking-wide font-medium">Kapasitas Default</span>
              <span className="text-text-primary font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">groups</span>
                {kelas.kapasitas ? `${kelas.kapasitas} Siswa` : "-"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-text-secondary mb-1 text-xs uppercase tracking-wide font-medium">Ruangan Default</span>
              <span className="text-text-primary font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">meeting_room</span>
                {kelas.ruangan || "-"}
              </span>
            </div>
            <div className="flex flex-col sm:col-span-2">
              <span className="text-text-secondary mb-1 text-xs uppercase tracking-wide font-medium">Kurikulum</span>
              <span className="text-text-primary font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">menu_book</span>
                {kelas.kurikulum || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Occupancy */}
        <div className="w-full md:w-72 flex flex-col justify-center bg-surface-container-low/50 p-6 rounded-xl border border-border-light z-10 shrink-0">
          <div className="flex justify-between items-end mb-2">
            <span className="font-semibold text-sm text-text-primary">Okupansi Terkini</span>
            <span className="text-2xl font-bold text-primary">
              {totalSiswa}
              <span className="text-sm text-text-secondary font-normal">/{kapasitas || "?"}</span>
            </span>
          </div>
          <div className="w-full bg-border-light rounded-full h-3 mb-2 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ease-out ${occupancyColor(totalSiswa / (kapasitas || 1))}`}
              style={{ width: `${occupancyBar}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary text-right">
            {kapasitas > 0 ? `${Math.round(occupancyPct)}% terisi` : "Kapasitas belum diatur"}
          </p>
          {wali && (
            <div className="mt-4 pt-4 border-t border-border-light flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                {initials(wali.nama_guru)}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-secondary">Wali Kelas</p>
                <p className="text-sm font-medium text-text-primary truncate">{wali.nama_guru}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Statistics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest rounded-[18px] border border-border-light shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-text-secondary text-sm font-medium mb-1">Siswa Aktif</p>
              <h4 className="font-headline-lg text-headline-lg text-text-primary">{siswasAktif.length}</h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success shrink-0">
              <span className="material-symbols-outlined text-[20px]">person_check</span>
            </div>
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-surface-container-lowest rounded-[18px] border border-border-light shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-text-secondary text-sm font-medium mb-1">Total Pernah Menggunakan</p>
              <h4 className="font-headline-lg text-headline-lg text-text-primary">{totalSiswaHistory}</h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold shrink-0">
              <span className="material-symbols-outlined text-[20px]">group</span>
            </div>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-surface-container-lowest rounded-[18px] border border-border-light shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-text-secondary text-sm font-medium mb-1">Siswa Keluar</p>
              <h4 className="font-headline-lg text-headline-lg text-text-primary">{siswasKeluar.length}</h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger shrink-0">
              <span className="material-symbols-outlined text-[20px]">person_remove</span>
            </div>
          </div>
        </div>
        {/* Card 4 */}
        <div className="bg-surface-container-lowest rounded-[18px] border border-border-light shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-text-secondary text-sm font-medium mb-1">Wali Kelas</p>
              <h4 className="font-headline-lg text-headline-lg text-text-primary">{wali ? "1" : "0"}</h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined text-[20px]">person</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-lg">

        {/* ── Left Column (span 2) ── */}
        <div className="xl:col-span-2 space-y-space-lg">

          {/* Daftar Siswa Aktif */}
          <div className="bg-surface-container-lowest rounded-[18px] border border-border-light shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-border-light flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-section-title text-text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">groups</span>
                  Daftar Siswa Aktif
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  Siswa yang saat ini terdaftar di kelas ini.
                </p>
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                {siswasAktif.length} siswa
              </span>
            </div>

            {siswasAktif.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-text-secondary gap-3">
                <span className="material-symbols-outlined text-[48px] text-outline-variant">group_off</span>
                <p className="text-sm">Belum ada siswa aktif di kelas ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low/50 border-b border-border-light">
                    <tr className="text-xs uppercase text-text-secondary font-semibold tracking-wider">
                      <th className="px-6 py-4 whitespace-nowrap">No Absen</th>
                      <th className="px-6 py-4 whitespace-nowrap">Nama Siswa</th>
                      <th className="px-6 py-4 whitespace-nowrap">NISN</th>
                      <th className="px-6 py-4 whitespace-nowrap">Jenis Kelamin</th>
                      <th className="px-6 py-4 whitespace-nowrap">Tanggal Masuk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light text-sm">
                    {siswasAktif.map((rk, idx) => (
                      <tr key={rk.id ?? idx} className="hover:bg-surface-container-low/30 transition-colors group">
                        <td className="px-6 py-4 text-text-secondary font-medium">{rk.no_absen ?? idx + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                              {initials(rk.siswa?.nama_lengkap)}
                            </div>
                            <Link
                              to={`/operator/master/siswa/${rk.siswa?.nisn}`}
                              className="font-medium text-text-primary hover:text-primary transition-colors"
                            >
                              {rk.siswa?.nama_lengkap ?? "-"}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text-secondary font-mono text-xs">{rk.siswa?.nisn ?? "-"}</td>
                        <td className="px-6 py-4 text-text-primary">
                          {rk.siswa?.jenis_kelamin === "L" ? "Laki-laki" : rk.siswa?.jenis_kelamin === "P" ? "Perempuan" : "-"}
                        </td>
                        <td className="px-6 py-4 text-text-secondary">{fmt(rk.tanggal_masuk)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Riwayat Siswa Keluar */}
          {siswasKeluar.length > 0 && (
            <div className="bg-surface-container-lowest rounded-[18px] border border-border-light shadow-sm flex flex-col overflow-hidden">
              <div className="p-6 border-b border-border-light">
                <h3 className="font-semibold text-section-title text-text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-danger">person_remove</span>
                  Riwayat Siswa Keluar
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low/50 border-b border-border-light">
                    <tr className="text-xs uppercase text-text-secondary font-semibold tracking-wider">
                      <th className="px-6 py-4 whitespace-nowrap">Nama Siswa</th>
                      <th className="px-6 py-4 whitespace-nowrap">NISN</th>
                      <th className="px-6 py-4 whitespace-nowrap">Tanggal Masuk</th>
                      <th className="px-6 py-4 whitespace-nowrap">Tanggal Keluar</th>
                      <th className="px-6 py-4 whitespace-nowrap">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light text-sm">
                    {siswasKeluar.map((rk, idx) => (
                      <tr key={rk.id ?? idx} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-surface-variant text-text-secondary flex items-center justify-center text-xs font-bold shrink-0">
                              {initials(rk.siswa?.nama_lengkap)}
                            </div>
                            <span className="text-text-primary font-medium">{rk.siswa?.nama_lengkap ?? "-"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text-secondary font-mono text-xs">{rk.siswa?.nisn ?? "-"}</td>
                        <td className="px-6 py-4 text-text-secondary">{fmt(rk.tanggal_masuk)}</td>
                        <td className="px-6 py-4 text-text-secondary">{fmt(rk.tanggal_keluar)}</td>
                        <td className="px-6 py-4">
                          {rk.keterangan ? (
                            <span className="text-text-secondary">{rk.keterangan}</span>
                          ) : (
                            <span className="text-outline-variant italic text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-space-lg">

          {/* Info Wali Kelas */}
          <div className="bg-surface-container-lowest rounded-[18px] border border-border-light shadow-sm p-6">
            <h3 className="font-semibold text-section-title text-text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-secondary">badge</span>
              Wali Kelas
            </h3>
            {wali ? (
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/15 text-primary flex items-center justify-center text-2xl font-bold shrink-0">
                  {initials(wali.nama_guru)}
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{wali.nama_guru}</p>
                  {wali.nuptk && (
                    <p className="text-xs text-text-secondary mt-0.5 font-mono">NUPTK: {wali.nuptk}</p>
                  )}
                  {wali.email && (
                    <p className="text-xs text-text-secondary mt-0.5">{wali.email}</p>
                  )}
                </div>
                <Link
                  to={`/operator/master/guru/${wali.nuptk}`}
                  className="text-primary text-sm font-medium hover:underline flex items-center gap-1 mt-1"
                >
                  Lihat Detail Guru
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-text-secondary">
                <span className="material-symbols-outlined text-[40px] text-outline-variant">person_off</span>
                <p className="text-sm">Belum ada wali kelas</p>
              </div>
            )}
          </div>

          {/* Informasi Kelas */}
          <div className="bg-surface-container-lowest rounded-[18px] border border-border-light shadow-sm p-6">
            <h3 className="font-semibold text-section-title text-text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-warning">update</span>
              Ringkasan Kelas
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border-light">
                <span className="text-sm text-text-secondary">Nama Kelas</span>
                <span className="text-sm font-medium text-text-primary">{kelas.nama_kelas}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-light">
                <span className="text-sm text-text-secondary">Tingkat</span>
                <span className="text-sm font-medium text-text-primary">Kelas {kelas.tingkat}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-light">
                <span className="text-sm text-text-secondary">Kapasitas</span>
                <span className="text-sm font-medium text-text-primary">{kelas.kapasitas} siswa</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-light">
                <span className="text-sm text-text-secondary">Ruangan</span>
                <span className="text-sm font-medium text-text-primary">{kelas.ruangan || "-"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-light">
                <span className="text-sm text-text-secondary">Kurikulum</span>
                <span className="text-sm font-medium text-text-primary">{kelas.kurikulum || "-"}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-text-secondary">Status</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    isAktif
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-surface-variant text-text-secondary border-border-light"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isAktif ? "bg-success" : "bg-text-secondary"}`} />
                  {isAktif ? "Aktif" : "Tidak Aktif"}
                </span>
              </div>
            </div>
          </div>

          {/* Informasi Sistem */}
          <div className="bg-surface-container-lowest rounded-[18px] border border-border-light shadow-sm p-6">
            <h3 className="font-semibold text-section-title text-text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-text-secondary">info</span>
              Informasi Sistem
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-surface rounded-lg border border-border-light border-dashed">
                <p className="text-xs text-text-secondary mb-1">Dibuat Pada</p>
                <p className="font-medium text-text-primary">{fmt(kelas.created_at)}</p>
              </div>
              <div className="p-3 bg-surface rounded-lg border border-border-light border-dashed">
                <p className="text-xs text-text-secondary mb-1">Diperbarui Pada</p>
                <p className="font-medium text-text-primary">{fmt(kelas.updated_at)}</p>
              </div>
              <div className="p-3 bg-surface rounded-lg border border-border-light border-dashed col-span-2">
                <p className="text-xs text-text-secondary mb-1">ID Kelas</p>
                <p className="font-medium text-text-primary font-mono">#{kelas.id}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Modal Edit ── */}
      <ModalEditKelas
        open={showEditModal}
        kelas={kelas}
        id={id}
        onClose={() => setShowEditModal(false)}
        queryClient={queryClient}
      />
    </div>
  );
}