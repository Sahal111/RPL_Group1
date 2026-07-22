import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

/* ─── Konstanta ──────────────────────────────────────────────── */
const KELOMPOK_OPTIONS = [
  "A - Wajib",
  "B - Wajib",
  "C - Muatan Lokal",
  "Pengembangan Diri",
  "Ekstrakurikuler",
];
const TINGKAT_OPTIONS = ["1", "2", "3", "4", "5", "6"];
const KURIKULUM_OPTIONS = ["Kurikulum 2013", "Kurikulum Merdeka", "Keduanya"];

const KELOMPOK_BADGE = {
  "A - Wajib": "bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE]",
  "B - Wajib": "bg-[#EDE9FE] text-[#5B21B6] border border-[#DDD6FE]",
  "C - Muatan Lokal": "bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF]",
  "Pengembangan Diri": "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]",
  Ekstrakurikuler:
    "bg-on-primary-container text-success border border-success/20",
};

const KELOMPOK_ICON = {
  "A - Wajib": "menu_book",
  "B - Wajib": "import_contacts",
  "C - Muatan Lokal": "diversity_3",
  "Pengembangan Diri": "self_improvement",
  Ekstrakurikuler: "sports_soccer",
};

/* ─── Modal Form ─────────────────────────────────────────────── */
function ModalMapel({ open, onClose, editData, queryClient }) {
  const isEdit = !!editData;

  const emptyForm = {
    kode_mapel: "",
    nama_mapel: "",
    kelompok: "A - Wajib",
    tingkat: "Semua",
    jam_per_minggu: "2",
    kurikulum: "Keduanya",
  };

  const [form, setForm] = useState(emptyForm);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (open) {
      setForm(
        editData
          ? { ...editData, jam_per_minggu: String(editData.jam_per_minggu) }
          : emptyForm,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? api.put(`/operator/master-data/mapel/${editData.id}`, data)
        : api.post("/operator/master-data/mapel", data),
    onSuccess: () => {
      toast.success(
        `Mata pelajaran berhasil ${isEdit ? "diperbarui" : "ditambahkan"}.`,
      );
      queryClient.invalidateQueries(["master-mapel"]);
      onClose();
    },
    onError: (err) => {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).forEach((e) => toast.error(e[0]));
      else toast.error(err.response?.data?.message ?? "Gagal menyimpan.");
    },
  });

  if (!open) return null;

  const inputCls =
    "w-full px-4 py-2.5 bg-background-light border border-border-light rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all";
  const labelCls =
    "block text-label-md font-semibold text-text-secondary mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-primary">
                {isEdit ? "edit_note" : "add_circle"}
              </span>
            </div>
            <h3 className="text-section-title font-semibold text-on-surface">
              {isEdit ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container-low hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[68vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Kode Mapel <span className="text-danger">*</span>
              </label>
              <input
                value={form.kode_mapel}
                onChange={(e) =>
                  set("kode_mapel", e.target.value.toUpperCase())
                }
                placeholder="MTK, IPA, ..."
                maxLength={20}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Jam / Minggu <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="40"
                value={form.jam_per_minggu}
                onChange={(e) => set("jam_per_minggu", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Nama Mata Pelajaran <span className="text-danger">*</span>
            </label>
            <input
              value={form.nama_mapel}
              onChange={(e) => set("nama_mapel", e.target.value)}
              placeholder="Contoh: Matematika"
              maxLength={100}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              Kelompok <span className="text-danger">*</span>
            </label>
            <select
              value={form.kelompok}
              onChange={(e) => set("kelompok", e.target.value)}
              className={inputCls}
            >
              {KELOMPOK_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Tingkat <span className="text-danger">*</span>
              </label>
              <select
                value={form.tingkat}
                onChange={(e) => set("tingkat", e.target.value)}
                className={inputCls}
              >
                <option value="Semua">Semua Tingkat</option>
                {TINGKAT_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    Tingkat {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Kurikulum <span className="text-danger">*</span>
              </label>
              <select
                value={form.kurikulum}
                onChange={(e) => set("kurikulum", e.target.value)}
                className={inputCls}
              >
                {KURIKULUM_OPTIONS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggle status (edit only) */}
          {isEdit && (
            <div className="flex items-center justify-between bg-surface-container-low rounded-xl px-4 py-3 border border-border-light">
              <div>
                <p className="text-body-md font-semibold text-on-surface">
                  Status Aktif
                </p>
                <p className="text-label-md text-text-secondary">
                  {form.is_active
                    ? "Mapel ini aktif dan dapat digunakan"
                    : "Mapel ini tidak aktif"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => set("is_active", !form.is_active)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  form.is_active ? "bg-primary" : "bg-border-light"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    form.is_active ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border-light">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-border-light rounded-lg text-on-surface font-semibold hover:bg-surface-container-low transition-colors text-body-md"
          >
            Batal
          </button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            className="flex-1 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-on-primary-fixed-variant transition-colors text-body-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  save
                </span>
                {isEdit ? "Perbarui" : "Simpan"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete Confirm Modal ───────────────────────────────────── */
function ModalHapus({ target, onClose, onConfirm, isPending }) {
  if (!target) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-error-container flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[28px] text-danger">
            delete_forever
          </span>
        </div>
        <h3 className="text-section-title font-bold text-on-surface mb-2">
          Hapus Mata Pelajaran?
        </h3>
        <p className="text-body-md text-text-secondary mb-6">
          Mata pelajaran{" "}
          <span className="font-semibold text-on-surface">
            {target.nama_mapel}
          </span>{" "}
          akan dihapus secara permanen.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-border-light rounded-lg text-on-surface font-semibold hover:bg-surface-container-low transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-2.5 bg-danger text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  delete
                </span>
                Ya, Hapus
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Halaman Utama ──────────────────────────────────────────── */
export default function MasterMapel() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [filterKelompok, setFilterKelompok] = useState("");
  const [filterTingkat, setFilterTingkat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, filterKelompok, filterTingkat, filterStatus]);

  /* ── Query ── */
  const { data, isLoading } = useQuery({
    queryKey: [
      "master-mapel",
      search,
      filterKelompok,
      filterTingkat,
      filterStatus,
      page,
    ],
    queryFn: () =>
      api
        .get("/operator/master-data/mapel", {
          params: {
            search: search || undefined,
            kelompok: filterKelompok || undefined,
            tingkat: filterTingkat || undefined,
            is_active: filterStatus !== "" ? filterStatus : undefined,
            page,
          },
        })
        .then((r) => r.data.data),
    keepPreviousData: true,
  });

  /* ── Mutations ── */
  const toggleActive = useMutation({
    mutationFn: (id) =>
      api.patch(`/operator/master-data/mapel/${id}/toggle-active`),
    onSuccess: () => queryClient.invalidateQueries(["master-mapel"]),
    onError: (err) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  const hapus = useMutation({
    mutationFn: (id) => api.delete(`/operator/master-data/mapel/${id}`),
    onSuccess: () => {
      toast.success("Mata pelajaran dihapus.");
      queryClient.invalidateQueries(["master-mapel"]);
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? "Gagal menghapus.");
      setDeleteTarget(null);
    },
  });

  const list = data?.data ?? [];
  const meta = data;
  const totalData = meta?.total ?? 0;
  const lastPage = meta?.last_page ?? 1;
  const totalAktif = list.filter((m) => m.is_active).length;
  const totalMapel = list.length;

  const hasActiveFilters =
    filterKelompok || filterTingkat || filterStatus || search;

  const resetFilters = () => {
    setSearch("");
    setFilterKelompok("");
    setFilterTingkat("");
    setFilterStatus("");
    setPage(1);
  };

  /* ── Render ── */
  return (
    <div className="space-y-space-lg">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1 text-label-md text-text-secondary mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span>Data Master</span>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-primary font-semibold">Mata Pelajaran</span>
          </nav>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
            Master Data Mata Pelajaran
          </h1>
          <p className="text-body-md text-text-secondary mt-1">
            Kelola seluruh mata pelajaran yang digunakan pada jadwal, nilai, dan
            rapor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => queryClient.invalidateQueries(["master-mapel"])}
            className="bg-surface-container-lowest hover:bg-surface-container-low border border-border-light text-on-surface font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm text-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">
              refresh
            </span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className="bg-surface-container-lowest hover:bg-surface-container-low border border-border-light text-on-surface font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm text-label-md">
            <span className="material-symbols-outlined text-[18px]">
              file_download
            </span>
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => {
              setEditData(null);
              setModalOpen(true);
            }}
            className="bg-primary hover:bg-on-primary-fixed-variant text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm text-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Mata Pelajaran
          </button>
        </div>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total */}
        <div className="bg-surface-container-lowest border border-border-light p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[18px] text-text-secondary">
              auto_stories
            </span>
          </div>
          <p className="text-label-md text-text-secondary mb-1">Total Mapel</p>
          <h3 className="text-headline-md font-bold text-on-surface">
            {isLoading ? "—" : totalData}
          </h3>
        </div>

        {/* Aktif */}
        <div className="bg-surface-container-lowest border border-border-light p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-on-primary-container flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[18px] text-success">
              check_circle
            </span>
          </div>
          <p className="text-label-md text-text-secondary mb-1">Mapel Aktif</p>
          <h3 className="text-headline-md font-bold text-on-surface">
            {isLoading ? "—" : totalAktif}
          </h3>
          {!isLoading && totalMapel > 0 && (
            <div className="w-full bg-border-light rounded-full h-1.5 mt-2">
              <div
                className="bg-success h-1.5 rounded-full"
                style={{
                  width: `${Math.round((totalAktif / totalMapel) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>

        {/* Non-aktif */}
        <div className="bg-surface-container-lowest border border-border-light p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[18px] text-text-secondary">
              cancel
            </span>
          </div>
          <p className="text-label-md text-text-secondary mb-1">Non-aktif</p>
          <h3 className="text-headline-md font-bold text-on-surface">
            {isLoading ? "—" : totalMapel - totalAktif}
          </h3>
        </div>

        {/* Halaman ini */}
        <div className="bg-surface-container-lowest border border-border-light p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[18px] text-info">
              layers
            </span>
          </div>
          <p className="text-label-md text-text-secondary mb-1">Halaman Ini</p>
          <h3 className="text-headline-md font-bold text-on-surface">
            {isLoading ? "—" : totalMapel}
          </h3>
        </div>
      </div>

      {/* ── Main Data Card ──────────────────────────────────── */}
      <div className="bg-surface-container-lowest border border-border-light rounded-2xl shadow-sm flex flex-col min-h-[480px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-border-light space-y-3">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Cari kode atau nama mapel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background-light border border-border-light rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              />
            </div>
            {/* Mobile filter toggle */}
            <button
              className="sm:hidden flex items-center justify-center gap-2 border border-border-light rounded-lg py-2 px-4 bg-background-light text-text-secondary text-label-md"
              onClick={() => setMobileFilterOpen((v) => !v)}
            >
              <span className="material-symbols-outlined text-[18px]">
                filter_list
              </span>
              Filters{" "}
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary ml-1" />
              )}
            </button>
          </div>

          {/* Filter chips */}
          <div
            className={`${mobileFilterOpen ? "flex" : "hidden"} sm:flex flex-wrap items-center gap-2`}
          >
            {/* Kelompok */}
            <div className="relative">
              <select
                value={filterKelompok}
                onChange={(e) => setFilterKelompok(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 border border-border-light rounded-lg bg-background-light text-label-md text-text-secondary hover:border-text-secondary transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Semua Kelompok</option>
                {KELOMPOK_OPTIONS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-text-secondary pointer-events-none">
                arrow_drop_down
              </span>
            </div>

            {/* Tingkat */}
            <div className="relative">
              <select
                value={filterTingkat}
                onChange={(e) => setFilterTingkat(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 border border-border-light rounded-lg bg-background-light text-label-md text-text-secondary hover:border-text-secondary transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Semua Tingkat</option>
                {TINGKAT_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    Tingkat {t}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-text-secondary pointer-events-none">
                arrow_drop_down
              </span>
            </div>

            {/* Status */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 border border-border-light rounded-lg bg-background-light text-label-md text-text-secondary hover:border-text-secondary transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Semua Status</option>
                <option value="1">Aktif</option>
                <option value="0">Non-aktif</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-text-secondary pointer-events-none">
                arrow_drop_down
              </span>
            </div>

            {/* Active filter chips */}
            {filterKelompok && (
              <div className="flex items-center border border-primary/30 bg-primary/5 rounded-lg px-3 py-1.5">
                <span className="text-label-md text-primary">
                  {filterKelompok}
                </span>
                <button
                  onClick={() => setFilterKelompok("")}
                  className="ml-2 text-primary hover:text-danger"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    close
                  </span>
                </button>
              </div>
            )}
            {filterTingkat && (
              <div className="flex items-center border border-primary/30 bg-primary/5 rounded-lg px-3 py-1.5">
                <span className="text-label-md text-primary">
                  Tingkat {filterTingkat}
                </span>
                <button
                  onClick={() => setFilterTingkat("")}
                  className="ml-2 text-primary hover:text-danger"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    close
                  </span>
                </button>
              </div>
            )}

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-primary hover:text-on-primary-fixed-variant text-label-md underline ml-auto"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-label-md text-text-secondary">
                  Memuat data...
                </p>
              </div>
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[32px] text-primary">
                  auto_stories
                </span>
              </div>
              <p className="text-body-lg text-on-surface font-semibold mb-1">
                {search || hasActiveFilters
                  ? "Tidak ada hasil ditemukan"
                  : "Belum ada mata pelajaran"}
              </p>
              <p className="text-label-md text-text-secondary mb-5">
                {search || hasActiveFilters
                  ? "Coba ubah kata kunci atau filter pencarian"
                  : "Mulai tambahkan mata pelajaran baru untuk menyusun kurikulum"}
              </p>
              {!hasActiveFilters && (
                <button
                  onClick={() => {
                    setEditData(null);
                    setModalOpen(true);
                  }}
                  className="bg-primary text-white font-semibold py-2 px-5 rounded-lg flex items-center gap-2 hover:bg-on-primary-fixed-variant transition-colors text-label-md"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    add
                  </span>
                  Tambah Data Pertama
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background-light border-b border-border-light text-text-secondary text-label-md">
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">
                    Kode
                  </th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">
                    Nama Mata Pelajaran
                  </th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">
                    Kelompok
                  </th>
                  <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">
                    Tingkat
                  </th>
                  <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">
                    Jam/Minggu
                  </th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">
                    Kurikulum
                  </th>
                  <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">
                    Status
                  </th>
                  <th className="py-3 px-4 font-semibold text-right whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light text-body-md text-on-surface">
                {list.map((m) => (
                  <tr
                    key={m.id}
                    className={`hover:bg-background-light/60 transition-colors group ${!m.is_active ? "opacity-60" : ""}`}
                  >
                    {/* Kode */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-primary bg-primary/8 px-2.5 py-1 rounded-lg text-xs tracking-wide border border-primary/15">
                        {m.kode_mapel}
                      </span>
                    </td>

                    {/* Nama */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5 min-w-[160px]">
                        <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[16px] text-text-secondary">
                            {KELOMPOK_ICON[m.kelompok] ?? "book"}
                          </span>
                        </div>
                        <span className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                          {m.nama_mapel}
                        </span>
                      </div>
                    </td>

                    {/* Kelompok */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${KELOMPOK_BADGE[m.kelompok] ?? "bg-surface-container text-on-surface-variant border border-border-light"}`}
                      >
                        {m.kelompok}
                      </span>
                    </td>

                    {/* Tingkat */}
                    <td className="py-3 px-4 text-center">
                      {m.tingkat === "Semua" ? (
                        <span className="text-xs text-text-secondary italic">
                          Semua
                        </span>
                      ) : (
                        <span className="bg-[#EDE9FE] text-[#5B21B6] text-xs font-semibold px-2 py-0.5 rounded-full border border-[#DDD6FE]">
                          Tk. {m.tingkat}
                        </span>
                      )}
                    </td>

                    {/* Jam */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-on-surface">
                        {m.jam_per_minggu}
                      </span>
                      <span className="text-text-secondary text-xs"> jam</span>
                    </td>

                    {/* Kurikulum */}
                    <td className="py-3 px-4">
                      <span className="text-xs text-text-secondary">
                        {m.kurikulum}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      {m.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-on-primary-container text-success border border-success/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-success" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-container text-text-secondary border border-border-light">
                          <span className="w-1.5 h-1.5 rounded-full bg-text-secondary" />
                          Non-aktif
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Toggle aktif */}
                        <button
                          onClick={() => toggleActive.mutate(m.id)}
                          title={m.is_active ? "Non-aktifkan" : "Aktifkan"}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            m.is_active
                              ? "text-warning hover:bg-[#FEF3C7]"
                              : "text-success hover:bg-on-primary-container"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {m.is_active ? "toggle_on" : "toggle_off"}
                          </span>
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditData({ ...m });
                            setModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container hover:text-on-surface transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            edit
                          </span>
                        </button>

                        {/* Hapus */}
                        <button
                          onClick={() => setDeleteTarget(m)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-error-container hover:text-danger transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ────────────────────────────────────── */}
        {!isLoading && list.length > 0 && (
          <div className="p-4 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text-secondary">
              Menampilkan{" "}
              <span className="font-semibold text-on-surface">
                {meta?.from ?? 1}
              </span>
              –
              <span className="font-semibold text-on-surface">
                {meta?.to ?? list.length}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-on-surface">{totalData}</span>{" "}
              data
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-border-light rounded-lg text-sm font-medium text-text-secondary bg-white hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="hidden sm:flex gap-1">
                {Array.from({ length: Math.min(lastPage, 5) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        page === p
                          ? "bg-primary text-white"
                          : "text-text-secondary hover:bg-surface-container-low"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                {lastPage > 5 && (
                  <>
                    <span className="w-8 h-8 flex items-center justify-center text-text-secondary text-sm">
                      ...
                    </span>
                    <button
                      onClick={() => setPage(lastPage)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        page === lastPage
                          ? "bg-primary text-white"
                          : "text-text-secondary hover:bg-surface-container-low"
                      }`}
                    >
                      {lastPage}
                    </button>
                  </>
                )}
              </div>
              <span className="text-sm text-text-secondary sm:hidden">
                Hal {page}/{lastPage}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page === lastPage}
                className="px-3 py-1.5 border border-border-light rounded-lg text-sm font-medium text-text-secondary bg-white hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────── */}
      <ModalMapel
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        editData={editData}
        queryClient={queryClient}
      />
      <ModalHapus
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => hapus.mutate(deleteTarget.id)}
        isPending={hapus.isPending}
      />
    </div>
  );
}
