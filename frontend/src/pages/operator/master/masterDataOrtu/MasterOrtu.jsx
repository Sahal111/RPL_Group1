import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

/* ─── helpers ─────────────────────────────────────────────────── */
const parentDisplayName = (ortu) =>
  ortu?.nama_ayah ||
  ortu?.nama_ibu ||
  ortu?.nama_wali ||
  ortu?.email ||
  `Orang tua #${ortu?.id}`;

const getHubungan = (ortu) => {
  if (ortu?.nama_ayah) return "Ayah";
  if (ortu?.nama_ibu) return "Ibu";
  if (ortu?.nama_wali) return "Wali";
  return "-";
};

const getKontak = (ortu) =>
  ortu?.no_hp_ayah || ortu?.no_hp_ibu || ortu?.no_hp_wali || "-";

const getLinkedStudents = (ortu) =>
  Array.isArray(ortu?.siswa) ? ortu.siswa : [];

const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const avatarColors = [
  { bg: "#E0E7FF", text: "#4338CA", border: "#C7D2FE" },
  { bg: "#FCE7F3", text: "#9D174D", border: "#FBCFE8" },
  { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" },
  { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  { bg: "#DBEAFE", text: "#1D4ED8", border: "#BFDBFE" },
  { bg: "#F3E8FF", text: "#7E22CE", border: "#E9D5FF" },
];
const getAvatarColor = (id) => avatarColors[(id || 0) % avatarColors.length];

const hubunganBadge = {
  Ayah: "bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE]",
  Ibu: "bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF]",
  Wali: "bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]",
  "-": "bg-surface-container text-on-surface-variant border border-border-light",
};

/* ─── component ───────────────────────────────────────────────── */
export default function MasterOrtu() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const queryClient = useQueryClient();

  const emptyForm = {
    nama_ayah: "",
    nama_ibu: "",
    nama_wali: "",
    no_hp_ayah: "",
    no_hp_ibu: "",
    no_hp_wali: "",
    email: "",
    alamat: "",
  };
  const [formData, setFormData] = useState(emptyForm);

  /* mutations */
  const createMutation = useMutation({
    mutationFn: (data) => api.post("/operator/master-data/orang-tua", data),
    onSuccess: () => {
      toast.success("Data orang tua berhasil ditambahkan.");
      queryClient.invalidateQueries(["master-ortu"]);
      setShowAddModal(false);
      setFormData(emptyForm);
    },
    onError: (error) => {
      const errors = error.response?.data?.errors;
      if (errors) Object.values(errors).forEach((item) => toast.error(item[0]));
      else
        toast.error(error.response?.data?.message || "Gagal menambahkan data");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/operator/master-data/orang-tua/${id}`),
    onSuccess: () => {
      toast.success("Data orang tua berhasil dihapus.");
      queryClient.invalidateQueries(["master-ortu"]);
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menghapus data");
      setDeleteTarget(null);
    },
  });

  /* query */
  const { data, isLoading } = useQuery({
    queryKey: ["master-ortu", search, page],
    queryFn: () =>
      api
        .get("/operator/master-data/orang-tua", {
          params: { search, page, paginate: 1 },
        })
        .then((res) => res.data.data),
    keepPreviousData: true,
  });

  const ortuList = data?.data || [];
  const pagination = data || {};
  const totalData = pagination.total || 0;
  const lastPage = pagination.last_page || 1;

  /* stats derived */
  const statsTotal = totalData;
  const statsAktif = ortuList.filter((o) =>
    getLinkedStudents(o).some((s) => s.user_ortu?.length > 0),
  ).length;
  const statsBelumAktif = ortuList.filter(
    (o) => !getLinkedStudents(o).some((s) => s.user_ortu?.length > 0),
  ).length;
  const statsMultiAnak = ortuList.filter(
    (o) => getLinkedStudents(o).length > 1,
  ).length;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const clearFilterStatus = () => setFilterStatus("");

  /* ─── render ─────────────────────────────────────────────────── */
  return (
    <div className="space-y-space-lg">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-label-md text-text-secondary mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span>Data Master</span>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-primary font-semibold">Orang Tua</span>
          </nav>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
            Master Data Orang Tua
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => queryClient.invalidateQueries(["master-ortu"])}
            className="bg-surface-container-lowest hover:bg-surface-container-low border border-border-light text-on-surface font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm text-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">
              refresh
            </span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className="bg-surface-container-lowest hover:bg-surface-container-low border border-border-light text-on-surface font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm text-label-md">
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-on-primary-fixed-variant text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm text-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Tambah Orang Tua</span>
          </button>
        </div>
      </div>

      {/* ── Stats Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total */}
        <div className="bg-surface-container-lowest border border-border-light p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[18px] text-text-secondary">
              group
            </span>
          </div>
          <p className="text-label-md text-text-secondary mb-1">
            Total Orang Tua
          </p>
          <h3 className="text-headline-md font-bold text-on-surface">
            {isLoading ? "—" : statsTotal}
          </h3>
        </div>

        {/* Akun Aktif */}
        <div className="bg-surface-container-lowest border border-border-light p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-on-primary-container flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[18px] text-success">
              verified_user
            </span>
          </div>
          <p className="text-label-md text-text-secondary mb-1">Akun Aktif</p>
          <h3 className="text-headline-md font-bold text-on-surface">
            {isLoading ? "—" : statsAktif}
          </h3>
          {!isLoading && statsTotal > 0 && (
            <div className="w-full bg-border-light rounded-full h-1.5 mt-2">
              <div
                className="bg-success h-1.5 rounded-full"
                style={{
                  width: `${Math.round((statsAktif / ortuList.length) * 100) || 0}%`,
                }}
              />
            </div>
          )}
        </div>

        {/* Belum Aktivasi */}
        <div className="bg-surface-container-lowest border border-border-light p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-[#FEF3C7] flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[18px] text-warning">
              pending_actions
            </span>
          </div>
          <p className="text-label-md text-text-secondary mb-1">
            Belum Aktivasi
          </p>
          <h3 className="text-headline-md font-bold text-on-surface">
            {isLoading ? "—" : statsBelumAktif}
          </h3>
          {!isLoading && ortuList.length > 0 && (
            <div className="w-full bg-border-light rounded-full h-1.5 mt-2">
              <div
                className="bg-warning h-1.5 rounded-full"
                style={{
                  width: `${Math.round((statsBelumAktif / ortuList.length) * 100) || 0}%`,
                }}
              />
            </div>
          )}
        </div>

        {/* Lebih dari 1 anak */}
        <div className="bg-surface-container-lowest border border-border-light p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[18px] text-info">
              family_restroom
            </span>
          </div>
          <p className="text-label-md text-text-secondary mb-1">
            Lebih dari 1 Anak
          </p>
          <h3 className="text-headline-md font-bold text-on-surface">
            {isLoading ? "—" : statsMultiAnak}
          </h3>
          {!isLoading && ortuList.length > 0 && (
            <div className="w-full bg-border-light rounded-full h-1.5 mt-2">
              <div
                className="bg-info h-1.5 rounded-full"
                style={{
                  width: `${Math.round((statsMultiAnak / ortuList.length) * 100) || 0}%`,
                }}
              />
            </div>
          )}
        </div>

        {/* Total Halaman ini */}
        <div className="bg-surface-container-lowest border border-border-light p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[18px] text-text-secondary">
              diversity_1
            </span>
          </div>
          <p className="text-label-md text-text-secondary mb-1">Halaman Ini</p>
          <h3 className="text-headline-md font-bold text-on-surface">
            {isLoading ? "—" : ortuList.length}
          </h3>
        </div>
      </div>

      {/* ── Main Data Card ────────────────────────────────────── */}
      <div className="bg-surface-container-lowest border border-border-light rounded-2xl shadow-sm flex flex-col min-h-[500px]">
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
                placeholder="Cari nama, no HP, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
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
              Filters
            </button>
          </div>

          {/* Filter Chips — desktop always visible, mobile toggled */}
          <div
            className={`${mobileFilterOpen ? "flex" : "hidden"} sm:flex flex-wrap items-center gap-2`}
          >
            <div className="flex items-center border border-border-light rounded-lg bg-background-light px-3 py-1.5 cursor-pointer hover:border-text-secondary transition-colors group">
              <span className="text-label-md text-text-secondary group-hover:text-on-surface">
                Hubungan
              </span>
              <span className="material-symbols-outlined text-[18px] text-text-secondary ml-1">
                arrow_drop_down
              </span>
            </div>
            <div className="flex items-center border border-border-light rounded-lg bg-background-light px-3 py-1.5 cursor-pointer hover:border-text-secondary transition-colors group">
              <span className="text-label-md text-text-secondary group-hover:text-on-surface">
                Anak Tertaut
              </span>
              <span className="material-symbols-outlined text-[18px] text-text-secondary ml-1">
                arrow_drop_down
              </span>
            </div>
            {filterStatus && (
              <div className="flex items-center border border-primary/30 bg-primary/5 rounded-lg px-3 py-1.5">
                <span className="text-label-md text-primary">
                  Status: {filterStatus}
                </span>
                <button
                  onClick={clearFilterStatus}
                  className="ml-2 text-primary hover:text-danger focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    close
                  </span>
                </button>
              </div>
            )}
            {(search || filterStatus) && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterStatus("");
                  setPage(1);
                }}
                className="text-primary hover:text-on-primary-fixed-variant text-label-md underline ml-auto"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* ── Table ──────────────────────────────────────────── */}
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
          ) : ortuList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-[56px] text-border-light mb-3">
                group_off
              </span>
              <p className="text-body-lg text-on-surface font-semibold mb-1">
                Tidak ada data ditemukan
              </p>
              <p className="text-label-md text-text-secondary">
                {search
                  ? `Tidak ada hasil untuk "${search}"`
                  : "Belum ada data orang tua"}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background-light border-b border-border-light text-text-secondary text-label-md">
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">
                    Orang Tua
                  </th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">
                    Hubungan
                  </th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">
                    Anak Tertaut (Kelas)
                  </th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">
                    Kontak
                  </th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">
                    Status Akun
                  </th>
                  <th className="py-3 px-4 font-semibold text-right whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light text-body-md text-on-surface">
                {ortuList.map((ortu) => {
                  const students = getLinkedStudents(ortu);
                  const hasAccount = students.some(
                    (s) => (s.user_ortu?.length ?? 0) > 0,
                  );
                  const hubungan = getHubungan(ortu);
                  const kontak = getKontak(ortu);
                  const displayName = parentDisplayName(ortu);
                  const avatarColor = getAvatarColor(ortu.id);
                  const initials = getInitials(displayName);

                  return (
                    <tr
                      key={ortu.id}
                      className="hover:bg-background-light/60 transition-colors group"
                    >
                      {/* Orang Tua */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 min-w-[190px]">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 border"
                            style={{
                              background: avatarColor.bg,
                              color: avatarColor.text,
                              borderColor: avatarColor.border,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface group-hover:text-primary transition-colors text-body-lg leading-tight">
                              {displayName}
                            </p>
                            {ortu.email ? (
                              <p className="text-[12px] text-text-secondary truncate max-w-[160px]">
                                {ortu.email}
                              </p>
                            ) : (
                              <p className="text-[12px] text-text-secondary italic">
                                Tidak ada email
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Hubungan */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${hubunganBadge[hubungan]}`}
                        >
                          {hubungan}
                        </span>
                        {/* Secondary roles */}
                        <div className="mt-1 space-y-0.5">
                          {ortu.nama_ayah && hubungan !== "Ayah" && (
                            <p className="text-[11px] text-text-secondary">
                              Ayah: {ortu.nama_ayah}
                            </p>
                          )}
                          {ortu.nama_ibu && hubungan !== "Ibu" && (
                            <p className="text-[11px] text-text-secondary">
                              Ibu: {ortu.nama_ibu}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Anak tertaut */}
                      <td className="py-3 px-4">
                        {students.length > 0 ? (
                          <div className="flex flex-col gap-1.5 min-w-[170px]">
                            {students.map((siswa) => (
                              <div
                                key={`${ortu.id}-${siswa.nisn}`}
                                className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
                              >
                                <span className="material-symbols-outlined text-[15px]">
                                  person
                                </span>
                                <span>{siswa.nama_lengkap || "-"}</span>
                                {siswa.kelas?.nama_kelas && (
                                  <span className="text-xs bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant">
                                    {siswa.kelas.nama_kelas}
                                  </span>
                                )}
                                {(siswa.user_ortu?.length ?? 0) > 0 && (
                                  <span
                                    className="material-symbols-outlined text-[14px] text-success"
                                    title="Sudah punya akun"
                                  >
                                    check_circle
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-text-secondary italic">
                            Belum ada anak tertaut
                          </span>
                        )}
                      </td>

                      {/* Kontak */}
                      <td className="py-3 px-4">
                        <p className="text-sm">{kontak}</p>
                        {ortu.alamat && (
                          <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-1 max-w-[140px]">
                            {ortu.alamat}
                          </p>
                        )}
                      </td>

                      {/* Status Akun */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          {hasAccount ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-on-primary-container text-success border border-success/20 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-success" />
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
                              Belum Aktif
                            </span>
                          )}
                          <span className="text-[11px] text-text-secondary">
                            {students.length} anak tertaut
                          </span>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/operator/master/ortu/keluarga/${ortu.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-on-primary-fixed-variant transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              visibility
                            </span>
                            Detail
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(ortu)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-danger/20 text-danger text-xs font-semibold rounded-lg hover:bg-error-container transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              delete
                            </span>
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ─────────────────────────────────────── */}
        {!isLoading && ortuList.length > 0 && (
          <div className="p-4 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text-secondary">
              Menampilkan{" "}
              <span className="font-semibold text-on-surface">
                {(page - 1) * 15 + 1}
              </span>
              –
              <span className="font-semibold text-on-surface">
                {Math.min(page * 15, totalData)}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-on-surface">{totalData}</span>{" "}
              data
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
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
                onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
                disabled={page === lastPage}
                className="px-3 py-1.5 border border-border-light rounded-lg text-sm font-medium text-text-secondary bg-white hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Modal ──────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    person_add
                  </span>
                </div>
                <h3 className="text-section-title font-semibold text-on-surface">
                  Tambah Data Orang Tua
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData(emptyForm);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container-low hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Ayah */}
              <div>
                <p className="text-label-md font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Data Ayah
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nama Ayah"
                    value={formData.nama_ayah}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, nama_ayah: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-background-light border border-border-light rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                  <input
                    type="text"
                    placeholder="No. HP Ayah"
                    value={formData.no_hp_ayah}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, no_hp_ayah: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-background-light border border-border-light rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="h-px bg-border-light" />

              {/* Ibu */}
              <div>
                <p className="text-label-md font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Data Ibu
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nama Ibu"
                    value={formData.nama_ibu}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, nama_ibu: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-background-light border border-border-light rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                  <input
                    type="text"
                    placeholder="No. HP Ibu"
                    value={formData.no_hp_ibu}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, no_hp_ibu: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-background-light border border-border-light rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="h-px bg-border-light" />

              {/* Wali */}
              <div>
                <p className="text-label-md font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Data Wali (Opsional)
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nama Wali"
                    value={formData.nama_wali}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, nama_wali: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-background-light border border-border-light rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                  <input
                    type="text"
                    placeholder="No. HP Wali"
                    value={formData.no_hp_wali}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, no_hp_wali: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-background-light border border-border-light rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="h-px bg-border-light" />

              {/* Kontak & Alamat */}
              <div>
                <p className="text-label-md font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Kontak & Alamat
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-background-light border border-border-light rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                  <textarea
                    placeholder="Alamat"
                    value={formData.alamat}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, alamat: e.target.value }))
                    }
                    rows={2}
                    className="w-full px-4 py-2.5 bg-background-light border border-border-light rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-border-light">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData(emptyForm);
                }}
                className="flex-1 py-2.5 border border-border-light rounded-lg text-on-surface font-semibold hover:bg-surface-container-low transition-colors text-body-md"
              >
                Batal
              </button>
              <button
                onClick={handleAddSubmit}
                disabled={createMutation.isPending}
                className="flex-1 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-on-primary-fixed-variant transition-colors text-body-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      save
                    </span>
                    Simpan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ───────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-error-container flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[28px] text-danger">
                delete_forever
              </span>
            </div>
            <h3 className="text-section-title font-bold text-on-surface mb-2">
              Hapus Data Orang Tua?
            </h3>
            <p className="text-body-md text-text-secondary mb-6">
              Data{" "}
              <span className="font-semibold text-on-surface">
                {parentDisplayName(deleteTarget)}
              </span>{" "}
              akan dihapus secara permanen dan tidak dapat dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-border-light rounded-lg text-on-surface font-semibold hover:bg-surface-container-low transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 bg-danger text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleteMutation.isPending ? (
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
      )}
    </div>
  );
}
