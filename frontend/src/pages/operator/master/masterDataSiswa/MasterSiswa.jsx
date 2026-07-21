import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────── */
const statusPdOpts = [
  { value: "aktif", label: "Aktif" },
  { value: "nonaktif", label: "Non-Aktif" },
  { value: "mutasi_keluar", label: "Mutasi Keluar" },
  { value: "lulus", label: "Lulus" },
  { value: "meninggal", label: "Meninggal" },
];

const statusConfig = {
  aktif: {
    bg: "bg-success/5",
    text: "text-success",
    border: "border-success/10",
    label: "Aktif",
  },
  nonaktif: {
    bg: "bg-gray-100",
    text: "text-gray-500",
    border: "border-gray-200",
    label: "Non-Aktif",
  },
  mutasi_keluar: {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/20",
    label: "Mutasi Keluar",
  },
  lulus: {
    bg: "bg-info/10",
    text: "text-info",
    border: "border-info/20",
    label: "Lulus",
  },
  meninggal: {
    bg: "bg-gray-100",
    text: "text-gray-500",
    border: "border-gray-200",
    label: "Meninggal",
  },
};
const getStatusStyle = (s) =>
  statusConfig[s] || {
    bg: "bg-gray-100",
    text: "text-gray-500",
    border: "border-gray-200",
    label: s ?? "—",
  };

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function MasterSiswa() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ["master-siswa", search, status],
    queryFn: () =>
      api
        .get("/operator/master-data/siswa", { params: { search, status } })
        .then((r) => r.data.data),
    keepPreviousData: true,
  });

  const hapus = useMutation({
    mutationFn: (nisn) => api.delete(`/operator/master-data/siswa/${nisn}`),
    onSuccess: () => {
      toast.success("Data siswa dihapus.");
      queryClient.invalidateQueries(["master-siswa"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus."),
  });

  const siswaList = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalL = siswaList.filter((s) => s.jenis_kelamin === "L").length;
  const totalP = siswaList.filter((s) => s.jenis_kelamin === "P").length;
  const totalBaru = siswaList.filter((s) => {
    const yr = s.tanggal_masuk ? new Date(s.tanggal_masuk).getFullYear() : null;
    return yr === new Date().getFullYear();
  }).length;

  /* checkbox logic */
  const allChecked = siswaList.length > 0 && selected.size === siswaList.length;
  const toggleAll = () =>
    setSelected(allChecked ? new Set() : new Set(siswaList.map((s) => s.nisn)));
  const toggleOne = (nisn) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(nisn) ? n.delete(nisn) : n.add(nisn);
      return n;
    });
  const clearSel = () => setSelected(new Set());

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb & Actions ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-4">
        <div>
          <div className="flex items-center gap-1.5 text-text-secondary text-[13px] mb-2">
            <span className="hover:text-primary cursor-pointer transition-colors">
              Data Master
            </span>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-text-primary font-bold">Siswa</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">
            Data Siswa
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-white border border-border-light rounded-xl font-bold text-sm text-text-primary hover:bg-surface-container-low transition-all flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">
              upload_file
            </span>
            Import Excel
          </button>
          <button
            onClick={() => navigate("/operator/master/siswa/tambah")}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-soft hover:shadow-lg active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Siswa */}
        <div className="bg-white rounded-xl p-6 border border-border-light shadow-soft hover:shadow-md transition-all relative group overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-y-2 translate-x-2 pointer-events-none">
            <svg
              className="text-primary"
              width="100"
              height="40"
              viewBox="0 0 100 40"
            >
              <path
                d="M0,40 Q25,10 50,30 T100,5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
            </svg>
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined icon-fill">
                groups
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-success/10 text-success rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">
                trending_up
              </span>{" "}
              2.5%
            </span>
          </div>
          <p className="text-text-secondary text-sm font-medium">
            Total Siswa (Aktif)
          </p>
          <h3 className="text-3xl font-extrabold text-text-primary mt-1">
            {isLoading
              ? "—"
              : (total || siswaList.length).toLocaleString("id-ID")}
          </h3>
        </div>

        {/* Laki-laki */}
        <div className="bg-white rounded-xl p-6 border border-border-light shadow-soft hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center text-info">
              <span className="material-symbols-outlined icon-fill">boy</span>
            </div>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mt-1">
              {isLoading || !siswaList.length
                ? "—"
                : `${Math.round((totalL / siswaList.length) * 100)}% of total`}
            </p>
          </div>
          <p className="text-text-secondary text-sm font-medium">
            Siswa Laki-laki
          </p>
          <h3 className="text-3xl font-extrabold text-text-primary mt-1">
            {isLoading ? "—" : totalL}
          </h3>
        </div>

        {/* Perempuan */}
        <div className="bg-white rounded-xl p-6 border border-border-light shadow-soft hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined icon-fill">girl</span>
            </div>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mt-1">
              {isLoading || !siswaList.length
                ? "—"
                : `${Math.round((totalP / siswaList.length) * 100)}% of total`}
            </p>
          </div>
          <p className="text-text-secondary text-sm font-medium">
            Siswa Perempuan
          </p>
          <h3 className="text-3xl font-extrabold text-text-primary mt-1">
            {isLoading ? "—" : totalP}
          </h3>
        </div>

        {/* Siswa Baru */}
        <div className="bg-white rounded-xl p-6 border border-border-light shadow-soft hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-8xl -rotate-12 translate-x-4 translate-y-4">
              person_add
            </span>
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
              <span className="material-symbols-outlined icon-fill">
                person_add
              </span>
            </div>
            <p className="text-[10px] font-bold text-warning uppercase tracking-wider mt-1">
              {new Date().getFullYear()}
            </p>
          </div>
          <p className="text-text-secondary text-sm font-medium">Siswa Baru</p>
          <h3 className="text-3xl font-extrabold text-text-primary mt-1">
            {isLoading ? "—" : totalBaru}
          </h3>
        </div>
      </div>

      {/* ── Table Section ── */}
      <div className="bg-white rounded-[18px] border border-border-light shadow-soft overflow-hidden relative">
        {/* Selection Toolbar */}
        {selected.size > 0 && (
          <div className="absolute top-0 inset-x-0 h-[64px] bg-primary text-white z-20 flex items-center justify-between px-6">
            <div className="flex items-center gap-6">
              <span className="text-sm font-bold">
                {selected.size} siswa dipilih
              </span>
              <div className="h-6 w-px bg-white/20" />
              <button
                onClick={() => navigate("/operator/master/siswa/mutasi")}
                className="flex items-center gap-2 text-sm font-bold hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  swap_horiz
                </span>{" "}
                Mutasi
              </button>
              <button className="flex items-center gap-2 text-sm font-bold hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[18px]">
                  print
                </span>{" "}
                Print Kartu
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (confirm(`Hapus ${selected.size} siswa yang dipilih?`)) {
                    selected.forEach((nisn) => hapus.mutate(nisn));
                    clearSel();
                  }
                }}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors"
              >
                Hapus Terpilih
              </button>
              <button
                onClick={clearSel}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Table Header Controls */}
        <div className="px-6 py-5 border-b border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full group">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-[20px] group-focus-within:text-primary transition-colors">
                search
              </span>
              <input
                type="text"
                placeholder="Search by name, NISN, or class..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  clearSel();
                }}
                className="w-full pl-11 pr-4 py-2.5 bg-background-light border border-border-light rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
              />
            </div>
            <button className="px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-primary hover:bg-surface-container-low transition-all flex items-center gap-2 text-sm font-bold whitespace-nowrap">
              <span className="material-symbols-outlined text-[18px]">
                filter_list
              </span>
              Filters
              <span className="bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1">
                2
              </span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:text-danger hover:bg-error-container transition-all flex items-center gap-2 text-sm font-bold whitespace-nowrap">
              <span className="material-symbols-outlined text-[18px]">
                delete_sweep
              </span>
              Tempat Sampah
            </button>
            <button className="px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-primary hover:bg-surface-container-low transition-all flex items-center gap-2 text-sm font-bold">
              <span className="material-symbols-outlined text-[18px]">
                download
              </span>
              Export
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-light/50 border-b border-border-light">
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="rounded border-border-light text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-text-secondary uppercase tracking-widest">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
                    Siswa{" "}
                    <span className="material-symbols-outlined text-[14px]">
                      unfold_more
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-text-secondary uppercase tracking-widest">
                  NISN / NIS
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-text-secondary uppercase tracking-widest">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
                    Kelas{" "}
                    <span className="material-symbols-outlined text-[14px]">
                      arrow_downward
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-text-secondary uppercase tracking-widest">
                  Gender
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-text-secondary uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-text-secondary uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-[48px] text-primary animate-spin">
                        progress_activity
                      </span>
                      <p className="text-sm text-text-secondary font-medium">
                        Memuat data siswa...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : siswaList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-[32px] text-text-secondary">
                          person_off
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">
                          Belum ada data siswa
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                          {search || status
                            ? "Coba ubah kata kunci pencarian"
                            : "Klik 'Tambah Siswa' untuk mulai"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                siswaList.map((s) => {
                  const st = getStatusStyle(
                    s.status_pd?.toLowerCase() ?? s.status,
                  );
                  const isL = s.jenis_kelamin === "L";
                  const isAktif =
                    (s.status_pd ?? s.status)?.toLowerCase() === "aktif";
                  const kelasSiswa =
                    s.kelas_aktif?.nama_kelas ??
                    s.riwayat_kelas?.[0]?.kelas?.nama_kelas ??
                    null;
                  const isSel = selected.has(s.nisn);

                  return (
                    <tr
                      key={s.nisn}
                      className={`hover:bg-surface-container-low/50 transition-colors group ${isSel ? "bg-primary/5" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSel}
                          onChange={() => toggleOne(s.nisn)}
                          className="rounded border-border-light text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                        />
                      </td>
                      {/* Siswa */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 border ${isL ? "bg-info/10 border-info/20" : "bg-tertiary/10 border-tertiary/20"} ${!isAktif ? "grayscale opacity-60" : ""}`}
                          >
                            {s.foto ? (
                              <img
                                src={`http://127.0.0.1:8001/storage/${s.foto}`}
                                alt={s.nama_lengkap}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span
                                className={`font-bold text-sm ${isL ? "text-info" : "text-tertiary"}`}
                              >
                                {s.nama_lengkap?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p
                              className={`font-bold text-sm group-hover:text-primary transition-colors ${!isAktif ? "text-text-secondary" : "text-text-primary"}`}
                            >
                              {s.nama_lengkap}
                            </p>
                            <p className="text-[11px] text-text-secondary">
                              {s.tempat_lahir
                                ? `${s.tempat_lahir}, ${s.tanggal_lahir?.split("T")[0] ?? ""}`
                                : (s.tanggal_lahir?.split("T")[0] ?? "—")}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* NISN / NIS */}
                      <td className="px-6 py-4 font-mono text-[13px] text-text-secondary">
                        {s.nisn}
                        {s.no_induk && (
                          <span className="text-[11px]"> / {s.no_induk}</span>
                        )}
                      </td>
                      {/* Kelas */}
                      <td className="px-6 py-4">
                        {kelasSiswa ? (
                          <span className="px-2.5 py-1 bg-surface-container text-text-primary text-[12px] font-bold rounded-lg border border-border-light">
                            {kelasSiswa}
                          </span>
                        ) : (
                          <span className="text-text-secondary text-xs">—</span>
                        )}
                      </td>
                      {/* Gender */}
                      <td className="px-6 py-4 text-text-secondary text-sm">
                        {isL ? "Laki-laki" : "Perempuan"}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border ${st.bg} ${st.text} ${st.border}`}
                        >
                          {st.label}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate("/operator/master/siswa/mutasi")}
                            className="p-2 text-text-secondary hover:text-warning hover:bg-warning/10 rounded-xl transition-all"
                            title="Mutasi Siswa"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              swap_horiz
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(`Hapus data siswa ${s.nama_lengkap}?`)
                              )
                                hapus.mutate(s.nisn);
                            }}
                            className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                            title="Hapus"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              delete
                            </span>
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/operator/master/siswa/${s.nisn}`)
                            }
                            className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                            title="Detail"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              visibility
                            </span>
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/operator/master/siswa/edit/${s.nisn}`)
                            }
                            className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              edit
                            </span>
                          </button>
                          <button className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                            <span className="material-symbols-outlined text-[20px]">
                              more_vert
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
        {!isLoading && (total > 0 || siswaList.length > 0) && (
          <div className="px-6 py-5 border-t border-border-light bg-background-light/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text-secondary font-medium">
              Showing <span className="font-bold text-text-primary">1</span> to{" "}
              <span className="font-bold text-text-primary">
                {siswaList.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-text-primary">
                {(total || siswaList.length).toLocaleString("id-ID")}
              </span>{" "}
              entries
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled
                className="px-3.5 py-2 border border-border-light rounded-xl text-text-secondary hover:bg-white hover:text-primary hover:border-primary transition-all disabled:opacity-50 text-sm font-bold"
              >
                Previous
              </button>
              <div className="flex items-center gap-1 px-1">
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white text-sm font-bold shadow-soft">
                  1
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white text-text-secondary hover:text-primary transition-all text-sm font-bold">
                  2
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white text-text-secondary hover:text-primary transition-all text-sm font-bold">
                  3
                </button>
                <span className="px-2 text-text-secondary font-bold">...</span>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white text-text-secondary hover:text-primary transition-all text-sm font-bold">
                  {Math.ceil((total || siswaList.length) / 10)}
                </button>
              </div>
              <button
                disabled
                className="px-3.5 py-2 border border-border-light rounded-xl text-text-secondary hover:bg-white hover:text-primary hover:border-primary transition-all text-sm font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
