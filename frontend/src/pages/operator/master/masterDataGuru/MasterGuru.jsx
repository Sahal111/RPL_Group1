import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

// ── Shared Constants, Helpers & Subcomponents ──────────────────────────────────
import {
  jenisPtkOptions,
  initials,
  fotoUrl,
  statusColor,
  SkeletonRow,
  StatCard,
} from "./guruConstants";

// ── Modals ────────────────────────────────────────────────────────────────────
import ModalImportGuru from "./ModalImportGuru";
import ModalExportGuru from "./ModalExportGuru";
import ModalPerhatianData from "./ModalPerhatianData";

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MasterGuru() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [jenis, setJenis] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [perhatianOpen, setPerhatianOpen] = useState(false);
  const [perhatianFilter, setPerhatianFilter] = useState(null); // field yang dipilih

  const { data, isLoading } = useQuery({
    queryKey: ["master-guru", search, jenis, statusFilter, page],
    queryFn: () =>
      api
        .get("/operator/master-data/guru", {
          params: {
            search,
            jenis_ptk: jenis,
            status_keaktifan: statusFilter,
            per_page: 10,
            page,
          },
        })
        .then((r) => r.data.data),
    keepPreviousData: true,
  });

  const { data: stats } = useQuery({
    queryKey: ["master-guru-stats"],
    queryFn: () =>
      api.get("/operator/master-data/guru/stats").then((r) => r.data.data),
    staleTime: 30_000,
  });

  const { data: guruTanpaPenugasan = [] } = useQuery({
    queryKey: ["guru-tanpa-penugasan"],
    queryFn: () =>
      api
        .get("/operator/master-data/guru/tanpa-penugasan")
        .then((r) => r.data.data),
    staleTime: 60_000,
  });

  const { data: aktivitasTerkini = [] } = useQuery({
    queryKey: ["guru-aktivitas-terkini"],
    queryFn: () =>
      api
        .get("/operator/master-data/guru/aktivitas-terkini")
        .then((r) => r.data.data),
    staleTime: 30_000,
  });

  const hapus = useMutation({
    mutationFn: (nuptk) => api.delete(`/operator/master-data/guru/${nuptk}`),
    onSuccess: () => {
      toast.success("Data guru berhasil dihapus.");
      queryClient.invalidateQueries(["master-guru"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus."),
  });

  const gurus = data?.data ?? [];
  const total = data?.total ?? 0;
  const lastPage = data?.last_page ?? 1;

  // Stats from loaded page (approximate)
  const guruAktif = stats?.aktif ?? 0;
  const guruNonaktif = stats?.nonaktif ?? 0;
  const guruWali = stats?.wali_kelas ?? 0;
  const guruBersert = stats?.bersertifikasi ?? 0;
  const jumlahMapel = stats?.jumlah_mapel ?? 0;
  const perhatianItems = stats?.perhatian ?? [];
  const toggleSelect = (nuptk) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(nuptk) ? next.delete(nuptk) : next.add(nuptk);
      return next;
    });
  };
  const toggleAll = () => {
    if (selected.size === gurus.length) setSelected(new Set());
    else setSelected(new Set(gurus.map((g) => g.nuptk)));
  };

  return (
    <div className="w-full space-y-6 pb-10 opacity-0 animate-fade-up">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="flex-1">
          <nav className="flex items-center gap-1.5 text-xs text-text-secondary mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span>Master Data</span>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-primary font-semibold">Guru</span>
          </nav>
          <h2
            className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Master Data Guru
          </h2>
          <p className="text-sm text-text-secondary mt-1 max-w-xl">
            Kelola seluruh data guru, wali kelas, status kepegawaian, dan
            penugasan mengajar.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => queryClient.invalidateQueries(["master-guru"])}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface-container-lowest border border-border-light text-text-secondary rounded-xl text-sm hover:bg-surface-container-high transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              refresh
            </span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <div className="flex bg-surface-container-lowest rounded-xl border border-border-light shadow-sm overflow-hidden">
            <button
              title="Import Data / Foto"
              onClick={() => setImportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-text-secondary hover:text-primary hover:bg-surface-container-low transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[20px]">
                upload_file
              </span>
              <span className="hidden sm:inline">Import</span>
            </button>
            <div className="w-px bg-border-light" />
            <button
              title="Export / Backup"
              onClick={() => setExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-text-secondary hover:text-primary hover:bg-surface-container-low transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[20px]">
                download
              </span>
              <span className="hidden sm:inline">Export</span>
            </button>
            <div className="w-px bg-border-light" />
            <button
              title="Cetak"
              onClick={() => window.print()}
              className="flex items-center p-2.5 text-text-secondary hover:text-primary hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                print
              </span>
            </button>
          </div>
          <button
            onClick={() => navigate("/operator/master/guru/tambah")}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-container text-on-primary rounded-xl text-sm font-semibold hover:bg-on-primary-fixed-variant transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Tambah Guru</span>
          </button>
        </div>
      </div>

      {/* ── Main Grid: Left (Stats + Table) | Right (Widgets) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left column */}
        <div className="xl:col-span-3 space-y-6">
          {/* ── Stats Bento Grid ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              icon="groups"
              label="Total Guru"
              value={isLoading ? "—" : total}
              iconBg="bg-secondary-container"
              iconColor="text-primary"
            />
            <StatCard
              icon="verified_user"
              label="Guru Aktif"
              value={isLoading ? "—" : guruAktif}
              iconBg="bg-success/10"
              iconColor="text-success"
            />
            <StatCard
              icon="person_off"
              label="Guru Nonaktif"
              value={isLoading ? "—" : guruNonaktif}
              iconBg="bg-danger/10"
              iconColor="text-danger"
            />
            <StatCard
              icon="supervisor_account"
              label="Wali Kelas"
              value={isLoading ? "—" : guruWali}
              iconBg="bg-accent-gold/10"
              iconColor="text-accent-gold"
            />
            <StatCard
              icon="workspace_premium"
              label="Bersertifikasi"
              value={isLoading ? "—" : guruBersert}
              iconBg="bg-info/10"
              iconColor="text-info"
            />
            <StatCard
              icon="menu_book"
              label="Mata Pelajaran"
              value={isLoading ? "—" : jumlahMapel}
              iconBg="bg-secondary/10"
              iconColor="text-secondary"
            />
          </div>

          {/* ── Table Card ── */}
          <div className="bg-surface/90 backdrop-blur-md border border-outline-variant/30 shadow-sm rounded-[20px] overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="p-5 border-b border-border-light bg-white/50">
              <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
                {/* Search */}
                <div className="relative w-full md:w-72">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
                    search
                  </span>
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-border-light rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-primary placeholder:text-text-secondary transition-all"
                    placeholder="Cari Nama / NUPTK Guru..."
                  />
                </div>
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 text-sm border border-border-light rounded-xl bg-white text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="">Status: Semua</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Pensiun">Pensiun</option>
                    <option value="Mutasi">Mutasi</option>
                    <option value="Keluar">Keluar</option>
                  </select>
                  <select
                    value={jenis}
                    onChange={(e) => {
                      setJenis(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 text-sm border border-border-light rounded-xl bg-white text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="">Jenis PTK</option>
                    {jenisPtkOptions.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                  <button
                    title="Filter lanjutan"
                    className="p-2 bg-white border border-border-light rounded-xl text-text-secondary hover:bg-surface-container-low hover:text-primary transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      tune
                    </span>
                  </button>
                  {(search || jenis || statusFilter) && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setJenis("");
                        setStatusFilter("");
                        setPage(1);
                      }}
                      className="p-2 bg-danger/5 border border-danger/20 rounded-xl text-danger hover:bg-danger/10 transition-colors"
                      title="Reset filter"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        close
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-light">
                <thead className="bg-surface-container-low/50">
                  <tr>
                    <th className="px-6 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={
                          gurus.length > 0 && selected.size === gurus.length
                        }
                        onChange={toggleAll}
                        className="h-4 w-4 text-primary focus:ring-primary border-border-light rounded"
                      />
                    </th>
                    {[
                      "Guru",
                      "NUPTK / Status",
                      "Jenis PTK",
                      "Wali Kelas",
                      "Status",
                      "Aksi",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`px-6 py-4 text-left text-[10px] font-bold text-text-secondary uppercase tracking-wider ${i === 5 ? "text-right" : ""} ${i >= 2 ? "hidden md:table-cell" : ""} ${i === 3 ? "hidden lg:table-cell" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border-light">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                  ) : gurus.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-16 text-text-secondary"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <span className="material-symbols-outlined text-[48px] text-outline-variant">
                            supervisor_account
                          </span>
                          <p className="font-medium">Belum ada data guru.</p>
                          <button
                            onClick={() =>
                              navigate("/operator/master/guru/tambah")
                            }
                            className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              add
                            </span>{" "}
                            Tambah sekarang
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    gurus.map((g) => {
                      const foto = fotoUrl(g.foto);
                      const wali =
                        g.wali_kelas?.find((w) => w.is_active)?.kelas
                          ?.nama_kelas ?? null;
                      const statusKepeg = g.status_kepegawaian ?? "";
                      const statusAktif = g.status_keaktifan ?? "Aktif";

                      return (
                        <tr
                          key={g.nuptk}
                          className="hover:bg-surface-container-lowest/80 transition-colors group"
                        >
                          {/* Checkbox */}
                          <td
                            className="px-6 py-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelect(g.nuptk);
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selected.has(g.nuptk)}
                              readOnly
                              className="h-4 w-4 text-primary focus:ring-primary border-border-light rounded"
                            />
                          </td>

                          {/* Guru */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border border-border-light bg-surface-container-high flex items-center justify-center">
                                {foto ? (
                                  <img
                                    src={foto}
                                    alt={g.nama_lengkap}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span
                                    className="text-primary font-bold text-sm"
                                    style={{
                                      fontFamily:
                                        "'Plus Jakarta Sans', sans-serif",
                                    }}
                                  >
                                    {initials(g.nama_lengkap)}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-text-primary">
                                  {g.nama_lengkap}
                                </p>
                                <p className="text-xs text-text-secondary mt-0.5">
                                  {g.no_hp ??
                                    (g.jenis_kelamin === "L"
                                      ? "Laki-laki"
                                      : "Perempuan")}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* NUPTK / Status Kepegawaian */}
                          <td className="px-6 py-4 hidden md:table-cell">
                            <p className="text-sm text-text-primary font-mono text-xs">
                              {g.nuptk}
                            </p>
                            <p className="text-xs text-text-secondary mt-0.5">
                              {statusKepeg}
                            </p>
                          </td>

                          {/* Jenis PTK */}
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20">
                              {g.jenis_ptk}
                            </span>
                          </td>

                          {/* Wali Kelas */}
                          <td className="px-6 py-4 hidden lg:table-cell">
                            {wali ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border border-border-light bg-white text-text-primary">
                                {wali}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border border-border-light bg-surface-container-low text-text-secondary">
                                Tidak Ada
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 hidden md:table-cell text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor(statusAktif)}`}
                            >
                              {statusAktif}
                            </span>
                          </td>

                          {/* Aksi */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-0.5">
                              <button
                                onClick={() =>
                                  navigate(`/operator/master/guru/${g.nuptk}`)
                                }
                                title="Detail"
                                className="p-1.5 rounded-lg text-text-secondary hover:text-info hover:bg-info/10 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  visibility
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/operator/master/guru/edit/${g.nuptk}`,
                                  )
                                }
                                title="Edit"
                                className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  edit
                                </span>
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Hapus data guru ${g.nama_lengkap}?`,
                                    )
                                  )
                                    hapus.mutate(g.nuptk);
                                }}
                                title="Hapus"
                                className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
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

            {/* Pagination */}
            <div className="bg-white px-6 py-4 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-text-secondary">
                Menampilkan{" "}
                <span className="font-semibold text-text-primary">
                  {(page - 1) * 10 + 1}
                </span>{" "}
                –{" "}
                <span className="font-semibold text-text-primary">
                  {Math.min(page * 10, total)}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-text-primary">{total}</span>{" "}
                data
              </p>
              <nav className="inline-flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-border-light bg-white text-text-secondary hover:bg-surface-container-low disabled:opacity-40 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_left
                  </span>
                </button>
                {[...Array(Math.min(lastPage, 5))].map((_, i) => {
                  const pg = i + 1;
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                        page === pg
                          ? "bg-primary text-white border-primary"
                          : "bg-white border-border-light text-text-primary hover:bg-surface-container-low"
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}
                {lastPage > 5 && (
                  <span className="self-center text-text-secondary text-xs px-1">
                    …{lastPage}
                  </span>
                )}
                <button
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page >= lastPage}
                  className="p-1.5 rounded-lg border border-border-light bg-white text-text-secondary hover:bg-surface-container-low disabled:opacity-40 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_right
                  </span>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* ── Right Sidebar Widgets ── */}
        <div className="xl:col-span-1 space-y-5">
          {/* Perhatian Data Widget */}
          <div className="bg-surface/90 backdrop-blur-md border border-outline-variant/30 shadow-sm rounded-[20px] p-5">
            <h3
              className="font-semibold text-text-primary mb-1 flex items-center gap-2 text-sm"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span className="material-symbols-outlined text-warning text-[18px]">
                warning
              </span>
              Perhatian Data
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Operator perlu melengkapi data berikut:
            </p>
            <ul className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {perhatianItems.length === 0 ? (
                <li className="text-sm text-text-secondary text-center py-4">
                  Data guru sudah lengkap 🎉
                </li>
              ) : (
                perhatianItems.map((item) => (
                  <li
                    key={item.field}
                    onClick={() => {
                      setPerhatianFilter(item.field);
                      setPerhatianOpen(true);
                    }}
                    className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-border-light gap-2 cursor-pointer hover:bg-surface-container transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {item.label}
                      </p>
                    </div>
                    <span className="inline-flex items-center justify-center h-6 min-w-6 px-1 rounded-full text-xs font-bold shrink-0 bg-warning text-white">
                      {item.count}
                    </span>
                  </li>
                ))
              )}
            </ul>
            <button
              onClick={() => {
                setPerhatianFilter(null);
                setPerhatianOpen(true);
              }}
              className="mt-3 w-full py-2 text-sm text-primary font-medium border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors"
            >
              Lihat Detail Laporan
            </button>
          </div>

          {/* Guru Tanpa Penugasan */}
          <div className="bg-surface/90 backdrop-blur-md border border-outline-variant/30 shadow-sm rounded-[20px] p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-danger text-[18px]">
                person_off
              </span>
              <h3
                className="font-semibold text-text-primary text-sm"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Belum Ada Penugasan
              </h3>
            </div>
            <p className="text-xs text-text-secondary mb-3">
              Guru aktif yang belum di-assign mata pelajaran semester ini
            </p>

            {guruTanpaPenugasan.length === 0 ? (
              <p className="text-xs text-text-secondary text-center py-3">
                Semua guru sudah memiliki penugasan ✓
              </p>
            ) : (
              <ul className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {guruTanpaPenugasan.map((g) => {
                  const foto = fotoUrl(g.foto);
                  return (
                    <li key={g.nuptk} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center text-primary font-bold border border-border-light shrink-0 text-xs">
                        {foto ? (
                          <img
                            src={foto}
                            alt={g.nama_lengkap}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          initials(g.nama_lengkap)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {g.nama_lengkap}
                        </p>
                        <p className="text-xs text-text-secondary truncate">
                          {g.jenis_ptk ?? "—"}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          navigate(`/operator/master/guru/${g.nuptk}`)
                        }
                        className="shrink-0 text-text-secondary hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          arrow_forward
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Aktivitas Terkini */}
          <div className="bg-surface/90 backdrop-blur-md border border-outline-variant/30 shadow-sm rounded-[20px] p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-[18px]">
                history
              </span>
              <h3
                className="font-semibold text-text-primary text-sm"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Aktivitas Terkini
              </h3>
            </div>
            <p className="text-xs text-text-secondary mb-3">
              Data guru yang terakhir diubah
            </p>

            {aktivitasTerkini.length === 0 ? (
              <p className="text-xs text-text-secondary text-center py-3">
                Belum ada aktivitas tercatat
              </p>
            ) : (
              <ul className="space-y-2">
                {aktivitasTerkini.map((g) => {
                  const foto = fotoUrl(g.foto);
                  const waktu = g.updated_at
                    ? new Date(g.updated_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";
                  return (
                    <li key={g.nuptk} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center text-primary font-bold border border-border-light shrink-0 text-xs">
                        {foto ? (
                          <img
                            src={foto}
                            alt={g.nama_lengkap}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          initials(g.nama_lengkap)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {g.nama_lengkap}
                        </p>
                        <p className="text-xs text-text-secondary truncate">
                          {waktu}
                          {g.updated_by_nama ? ` · ${g.updated_by_nama}` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          navigate(`/operator/master/guru/${g.nuptk}`)
                        }
                        className="shrink-0 text-text-secondary hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          arrow_forward
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal Import ── */}
      <ModalImportGuru
        open={importOpen}
        onClose={() => setImportOpen(false)}
        queryClient={queryClient}
      />

      {/* ── Modal Export ── */}
      <ModalExportGuru
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        filters={{ search, jenis_ptk: jenis, status_keaktifan: statusFilter }}
        selected={selected}
      />

      {/* ── Modal Perhatian Data ── */}
      <ModalPerhatianData
        open={perhatianOpen}
        onClose={() => setPerhatianOpen(false)}
        filterField={perhatianFilter}
        perhatianItems={perhatianItems}
        navigate={navigate}
      />
    </div>
  );
}
