import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(str) {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtLong(str) {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function daysBetween(a, b) {
  if (!a || !b) return null;
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function daysRemaining(end) {
  if (!end) return null;
  const diff = Math.round((new Date(end) - new Date()) / 86400000);
  return diff;
}

function getTglMulai(t) {
  if (!t || !t.semesters) return null;
  const ganjil = t.semesters.find(s => s.nama === 'Ganjil');
  return ganjil ? ganjil.tgl_mulai : null;
}

function getTglSelesai(t) {
  if (!t || !t.semesters) return null;
  const genap = t.semesters.find(s => s.nama === 'Genap');
  const ganjil = t.semesters.find(s => s.nama === 'Ganjil');
  return genap ? genap.tgl_selesai : (ganjil ? ganjil.tgl_selesai : null);
}

// ── Modal Tambah / Edit Tahun Ajaran ──────────────────────────────────────────
function ModalTahunAjaran({ open, onClose, editData, queryClient }) {
  const isEdit = !!editData;
  const [form, setForm] = useState({
    tahun: "",
    is_active: false,
    buat_semester: true,
    semester_ganjil_mulai: "",
    semester_ganjil_selesai: "",
    semester_genap_mulai: "",
    semester_genap_selesai: "",
    semester_aktif: "Ganjil"
  });

  useEffect(() => {
    if (open) {
      if (editData) {
        const ganjil = editData.semesters?.find(s => s.nama === 'Ganjil');
        const genap = editData.semesters?.find(s => s.nama === 'Genap');
        let semAktif = "";
        if (ganjil?.is_active) semAktif = "Ganjil";
        else if (genap?.is_active) semAktif = "Genap";
        
        setForm({
          tahun: editData.tahun || "",
          is_active: editData.is_active || false,
          buat_semester: !!(ganjil || genap),
          semester_ganjil_mulai: ganjil?.tgl_mulai || "",
          semester_ganjil_selesai: ganjil?.tgl_selesai || "",
          semester_genap_mulai: genap?.tgl_mulai || "",
          semester_genap_selesai: genap?.tgl_selesai || "",
          semester_aktif: semAktif
        });
      } else {
        setForm({ 
          tahun: "", 
          is_active: false, 
          buat_semester: true,
          semester_ganjil_mulai: "",
          semester_ganjil_selesai: "",
          semester_genap_mulai: "",
          semester_genap_selesai: "",
          semester_aktif: "Ganjil"
        });
      }
    }
  }, [open, editData]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? api.put(`/operator/master-data/tahun-ajaran/${editData.id}`, data)
        : api.post("/operator/master-data/tahun-ajaran", data),
    onSuccess: () => {
      toast.success(
        `Tahun ajaran berhasil ${isEdit ? "diperbarui" : "ditambahkan"}.`,
      );
      queryClient.invalidateQueries(["tahun-ajaran"]);
      queryClient.invalidateQueries(["tahun-ajaran-dropdown"]);
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">
                {isEdit ? "edit_note" : "add_circle"}
              </span>
            </div>
            <h3 className="text-section-title font-semibold text-on-surface">
              {isEdit ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
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
        <div className="px-6 py-5 space-y-5 max-h-[68vh] overflow-y-auto custom-scrollbar">
          {/* INFORMASI TAHUN AJARAN */}
          <div>
            <h4 className="text-body-md font-bold text-on-surface mb-3 border-b border-border-light pb-2">INFORMASI TAHUN AJARAN</h4>
            <div>
              <label className={labelCls}>
                Nama Tahun Ajaran <span className="text-danger">*</span>
              </label>
              <input
                value={form.tahun}
                onChange={(e) => set("tahun", e.target.value)}
                className={inputCls}
                placeholder="Contoh: 2025/2026"
                maxLength={9}
              />
            </div>
          </div>

          {/* PENGATURAN SEMESTER */}
          <div>
            <div className="flex items-center justify-between border-b border-border-light pb-2 mb-3">
               <h4 className="text-body-md font-bold text-on-surface">PENGATURAN SEMESTER</h4>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={form.buat_semester}
                   onChange={(e) => set("buat_semester", e.target.checked)}
                   className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary"
                 />
                 <span className="text-label-md font-medium text-text-secondary">Buat Semester Otomatis</span>
               </label>
            </div>
            
            {form.buat_semester && (
              <div className="space-y-4">
                {/* Semester Ganjil */}
                <div className="p-4 bg-background-light rounded-xl border border-border-light">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[18px] text-primary">looks_one</span>
                    <h5 className="text-body-md font-bold text-on-surface">Semester Ganjil</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Tanggal Mulai</label>
                      <input
                        type="date"
                        value={form.semester_ganjil_mulai}
                        onChange={(e) => set("semester_ganjil_mulai", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Tanggal Selesai</label>
                      <input
                        type="date"
                        value={form.semester_ganjil_selesai}
                        onChange={(e) => set("semester_ganjil_selesai", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>

                {/* Semester Genap */}
                <div className="p-4 bg-background-light rounded-xl border border-border-light">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[18px] text-text-secondary">looks_two</span>
                    <h5 className="text-body-md font-bold text-on-surface">Semester Genap</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Tanggal Mulai</label>
                      <input
                        type="date"
                        value={form.semester_genap_mulai}
                        onChange={(e) => set("semester_genap_mulai", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Tanggal Selesai</label>
                      <input
                        type="date"
                        value={form.semester_genap_selesai}
                        onChange={(e) => set("semester_genap_selesai", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PENGATURAN LAIN */}
          <div>
            <h4 className="text-body-md font-bold text-on-surface mb-3 border-b border-border-light pb-2">PENGATURAN</h4>
            <div className="space-y-3">
               <label className="flex items-center gap-3 cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={form.is_active}
                   onChange={(e) => {
                     set("is_active", e.target.checked);
                     if (!e.target.checked) set("semester_aktif", "");
                   }}
                   className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary"
                 />
                 <span className="text-body-md font-medium text-on-surface">Jadikan Tahun Ajaran Aktif</span>
               </label>
               
               {form.is_active && form.buat_semester && (
                 <div className="ml-7 flex flex-col gap-2">
                   <p className="text-label-md text-text-secondary mb-1">Pilih semester yang aktif:</p>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input 
                       type="radio" 
                       name="semester_aktif"
                       checked={form.semester_aktif === 'Ganjil'}
                       onChange={() => set("semester_aktif", "Ganjil")}
                       className="w-4 h-4 border-border-light text-primary focus:ring-primary"
                     />
                     <span className="text-body-md text-on-surface">Semester Ganjil</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input 
                       type="radio" 
                       name="semester_aktif"
                       checked={form.semester_aktif === 'Genap'}
                       onChange={() => set("semester_aktif", "Genap")}
                       className="w-4 h-4 border-border-light text-primary focus:ring-primary"
                     />
                     <span className="text-body-md text-on-surface">Semester Genap</span>
                   </label>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border-light bg-background-light">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-border-light text-text-secondary hover:bg-surface-container-low font-medium transition-colors text-body-md"
          >
            Batal
          </button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-body-md"
          >
            {mutation.isPending ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
                Menyimpan...
              </>
            ) : isEdit ? (
              "Perbarui"
            ) : (
              "Simpan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Loader ────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-border-light">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div
            className="h-4 bg-surface-container-high rounded animate-pulse"
            style={{ width: `${[60, 80, 90, 50, 40][i]}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  badge,
  badgeColor = "success",
  iconBg = "bg-primary/10",
  iconColor = "text-primary",
}) {
  const badgeColors = {
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    info: "bg-info/10 text-info border-info/20",
    secondary:
      "bg-surface-variant text-text-secondary border-outline-variant/30",
  };

  return (
    <div className="bg-surface-container-lowest rounded-[18px] p-5 border border-border-light shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/3 rounded-full -mr-6 -mt-6 transition-transform duration-500 group-hover:scale-150" />
      <div className="flex items-start justify-between relative z-10">
        <div
          className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}
        >
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        {badge && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColors[badgeColor]}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {badge}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
          {label}
        </p>
        <h3
          className="text-2xl font-bold text-text-primary"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {value}
        </h3>
      </div>
    </div>
  );
}

// ── Timeline Item ──────────────────────────────────────────────────────────────
function TimelineItem({ dot, title, subtitle, active }) {
  return (
    <div className="relative pl-6">
      <div
        className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 ring-surface-container-lowest ${active ? "bg-primary" : "bg-outline-variant"}`}
      />
      <div
        className={`text-sm font-medium ${active ? "text-primary" : "text-text-secondary"}`}
      >
        {title}
      </div>
      <div className="text-xs text-text-secondary mt-0.5">{subtitle}</div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function TahunAjaran() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["tahun-ajaran"],
    queryFn: () =>
      api.get("/operator/master-data/tahun-ajaran").then((r) => r.data.data),
  });

  const setAktif = useMutation({
    mutationFn: (id) =>
      api.patch(`/operator/master-data/tahun-ajaran/${id}/aktif`),
    onSuccess: () => {
      toast.success("Tahun ajaran aktif berhasil diubah.");
      queryClient.invalidateQueries(["tahun-ajaran"]);
      queryClient.invalidateQueries(["tahun-ajaran-dropdown"]);
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  const hapus = useMutation({
    mutationFn: (id) => api.delete(`/operator/master-data/tahun-ajaran/${id}`),
    onSuccess: () => {
      toast.success("Tahun ajaran dihapus.");
      queryClient.invalidateQueries(["tahun-ajaran"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus."),
  });

  const list = data ?? [];
  const filtered = list.filter(
    (t) => !search || t.tahun?.toLowerCase().includes(search.toLowerCase()),
  );
  const aktif = list.find((t) => t.is_active);

  // compute stats
  const hariSisa = aktif ? daysRemaining(getTglSelesai(aktif)) : null;
  const hariTotal = aktif
    ? daysBetween(getTglMulai(aktif), getTglSelesai(aktif))
    : null;
  const hariBerjalan =
    aktif && hariTotal !== null && hariSisa !== null
      ? hariTotal - hariSisa
      : null;
  const progress = hariTotal
    ? Math.max(0, Math.min(100, Math.round((hariBerjalan / hariTotal) * 100)))
    : 0;

  return (
    <div className="w-full space-y-6 pb-10 opacity-0 animate-fade-up">
      {/* ── Breadcrumb & Header ── */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-text-secondary mb-3">
          <span>Dashboard</span>
          <span className="material-symbols-outlined text-[14px]">
            chevron_right
          </span>
          <span>Master Data</span>
          <span className="material-symbols-outlined text-[14px]">
            chevron_right
          </span>
          <span className="text-primary font-semibold">
            Tahun Ajaran &amp; Semester
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2
              className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Tahun Ajaran &amp; Semester
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Kelola periode akademik sekolah beserta semester yang digunakan
              seluruh sistem.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => queryClient.invalidateQueries(["tahun-ajaran"])}
              title="Refresh"
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-container-lowest border border-border-light text-text-secondary hover:text-primary hover:border-outline-variant transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">
                refresh
              </span>
            </button>
            <button
              onClick={() => {
                setEditData(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-on-primary-fixed-variant transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="hidden sm:inline">Tambah Tahun Ajaran</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="calendar_today"
          label="Tahun Ajaran Aktif"
          value={aktif?.tahun ?? "-"}
          badge={aktif ? "Aktif" : undefined}
          badgeColor="success"
        />
        <StatCard
          icon="school"
          label="Total Tahun Ajaran"
          value={list.length}
          iconBg="bg-info/10"
          iconColor="text-info"
        />
        <StatCard
          icon="schedule"
          label="Hari Berjalan"
          value={hariBerjalan !== null ? `${hariBerjalan} Hari` : "-"}
          iconBg="bg-warning/10"
          iconColor="text-warning"
        />
        <StatCard
          icon="hourglass_empty"
          label="Sisa Hari"
          value={hariSisa !== null ? `${Math.max(0, hariSisa)} Hari` : "-"}
          badge={
            hariSisa !== null && hariSisa < 30 ? "Segera Berakhir" : undefined
          }
          badgeColor="warning"
          iconBg="bg-tertiary/10"
          iconColor="text-tertiary"
        />
      </div>

      {/* ── Main Grid: Table + Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Data Table (col-span-2) ── */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-border-light rounded-[18px] shadow-sm overflow-hidden flex flex-col">
          {/* Table header */}
          <div className="px-5 py-4 border-b border-border-light flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3
              className="font-semibold text-text-primary text-sm"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Daftar Tahun Ajaran
            </h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[16px]">
                  search
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 border border-border-light rounded-xl text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none w-full sm:w-44 bg-surface text-text-primary placeholder:text-text-secondary"
                  placeholder="Cari tahun ajaran..."
                />
              </div>
            </div>
          </div>

          {/* Info banner */}
          <div className="mx-5 my-3 flex items-start gap-2 px-4 py-3 bg-info/5 border border-info/20 rounded-xl text-xs text-info">
            <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
              info
            </span>
            <span>
              Hanya satu tahun ajaran yang bisa aktif sekaligus. Tahun ajaran
              aktif digunakan sebagai default saat membuat kelas baru.
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-text-secondary border-b border-border-light">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider w-10" />
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider">
                    Tahun Ajaran
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider hidden sm:table-cell">
                    Periode
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light text-sm">
                {isLoading ? (
                  [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-16 text-text-secondary"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-[40px] text-outline-variant">
                          calendar_today
                        </span>
                        <p className="font-medium">
                          {search
                            ? "Tidak ada hasil pencarian."
                            : "Belum ada tahun ajaran."}
                        </p>
                        {!search && (
                          <button
                            onClick={() => {
                              setEditData(null);
                              setModalOpen(true);
                            }}
                            className="text-primary text-xs font-medium hover:underline flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              add
                            </span>{" "}
                            Tambah sekarang
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <>
                      {/* Main Row */}
                      <tr
                        key={t.id}
                        className={`group cursor-pointer transition-colors ${
                          t.is_active
                            ? "bg-primary/3 hover:bg-primary/5"
                            : "hover:bg-background-light"
                        } ${expandedId === t.id ? "bg-primary/5" : ""}`}
                        onClick={() =>
                          setExpandedId(expandedId === t.id ? null : t.id)
                        }
                      >
                        {/* Expand toggle */}
                        <td className="px-5 py-4 w-10">
                          <button
                            className={`transition-colors flex items-center ${expandedId === t.id ? "text-primary" : "text-text-secondary group-hover:text-primary"}`}
                          >
                            <span
                              className="material-symbols-outlined text-[20px] transition-transform duration-200"
                              style={{
                                transform:
                                  expandedId === t.id
                                    ? "rotate(90deg)"
                                    : "rotate(0deg)",
                              }}
                            >
                              chevron_right
                            </span>
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.is_active ? "bg-primary/10 text-primary" : "bg-surface-container text-text-secondary"}`}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {t.is_active
                                  ? "event_available"
                                  : "calendar_today"}
                              </span>
                            </div>
                            <span
                              className={`font-semibold text-sm ${t.is_active ? "text-primary" : "text-text-primary"}`}
                            >
                              {t.tahun}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-text-secondary text-xs hidden sm:table-cell">
                          {fmt(getTglMulai(t))} – {fmt(getTglSelesai(t))}
                        </td>

                        <td className="px-5 py-4">
                          {t.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/10 text-success border border-success/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-variant text-text-secondary border border-outline-variant/30">
                              Selesai
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() =>
                                navigate(
                                  `/operator/master/tahun-ajaran/${t.id}`,
                                )
                              }
                              title="Detail"
                              className="p-1.5 rounded-lg text-text-secondary hover:text-info hover:bg-info/10 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                visibility
                              </span>
                            </button>
                            {!t.is_active && (
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Jadikan "${t.tahun}" sebagai tahun ajaran aktif?`,
                                    )
                                  )
                                    setAktif.mutate(t.id);
                                }}
                                title="Aktifkan"
                                className="p-1.5 rounded-lg text-text-secondary hover:text-success hover:bg-success/10 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  check_circle
                                </span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditData({ ...t });
                                setModalOpen(true);
                              }}
                              title="Edit"
                              className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus tahun ajaran "${t.tahun}"?`))
                                  hapus.mutate(t.id);
                              }}
                              title="Hapus"
                              className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded sub-table */}
                      {expandedId === t.id && (
                        <tr className="bg-background-light">
                          <td
                            colSpan={5}
                            className="px-5 pb-4 pt-2 border-b-2 border-primary/10"
                          >
                            <div className="ml-8 bg-surface-container-lowest border border-border-light rounded-xl overflow-hidden shadow-sm">
                              {/* Sub-header */}
                              <div className="px-4 py-3 bg-surface-container/50 border-b border-border-light flex items-center justify-between">
                                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[14px] text-primary">
                                    school
                                  </span>
                                  Detail Periode — {t.tahun}
                                </span>
                                <span className="text-xs text-text-secondary">
                                  {fmt(getTglMulai(t))} –{" "}
                                  {fmt(getTglSelesai(t))}
                                </span>
                              </div>

                              {/* Semester info rows */}
                              <div className="divide-y divide-border-light/60">
                                <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                      <span className="material-symbols-outlined text-[14px]">
                                        looks_one
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-text-primary">
                                        Semester Ganjil
                                      </p>
                                      <p className="text-xs text-text-secondary">
                                        Semester pertama
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 ml-10 sm:ml-0">
                                    {t.is_active ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/10 text-success border border-success/20">
                                        <span className="w-1 h-1 rounded-full bg-success animate-pulse" />
                                        Aktif
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-variant text-text-secondary border border-outline-variant/30">
                                        Selesai
                                      </span>
                                    )}
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/operator/master/tahun-ajaran/${t.id}`,
                                        )
                                      }
                                      className="text-primary text-xs font-medium hover:underline flex items-center gap-0.5"
                                    >
                                      Detail
                                      <span className="material-symbols-outlined text-[12px]">
                                        arrow_forward
                                      </span>
                                    </button>
                                  </div>
                                </div>

                                <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-surface-container text-text-secondary flex items-center justify-center">
                                      <span className="material-symbols-outlined text-[14px]">
                                        looks_two
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-text-secondary">
                                        Semester Genap
                                      </p>
                                      <p className="text-xs text-text-secondary">
                                        Semester kedua
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 ml-10 sm:ml-0">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-variant text-text-secondary border border-outline-variant/30">
                                      Belum aktif
                                    </span>
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/operator/master/tahun-ajaran/${t.id}`,
                                        )
                                      }
                                      className="text-primary text-xs font-medium hover:underline flex items-center gap-0.5"
                                    >
                                      Detail
                                      <span className="material-symbols-outlined text-[12px]">
                                        arrow_forward
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Duration bar */}
                              <div className="px-4 py-3 bg-surface-container/30 border-t border-border-light">
                                <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
                                  <span>Durasi total</span>
                                  <span className="font-medium">
                                    {daysBetween(
                                      getTglMulai(t),
                                      getTglSelesai(t),
                                    ) ?? "?"}{" "}
                                    hari
                                  </span>
                                </div>
                                {t.is_active && hariTotal !== null && (
                                  <>
                                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-primary rounded-full transition-all duration-1000"
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-text-secondary mt-1">
                                      <span>{hariBerjalan} hari berjalan</span>
                                      <span>{progress}%</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-5 py-3 border-t border-border-light bg-surface flex items-center justify-between text-xs text-text-secondary">
            <span>
              Menampilkan {filtered.length} dari {list.length} tahun ajaran
            </span>
            <div className="flex items-center gap-1 text-text-secondary">
              <span className="material-symbols-outlined text-[14px]">
                info
              </span>
              <span>Klik baris untuk detail semester</span>
            </div>
          </div>
        </div>

        {/* ── Sidebar: Timeline + Progress ── */}
        <div className="flex flex-col gap-5">
          {/* Active Year Card */}
          {aktif && (
            <div className="bg-primary rounded-[18px] p-5 shadow-sm text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-6 -mb-6" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[16px] text-white/70">
                    event_available
                  </span>
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Tahun Ajaran Aktif
                  </span>
                </div>
                <h4
                  className="text-2xl font-bold mb-1"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {aktif.tahun}
                </h4>
                <p className="text-xs text-white/70 mb-4">
                  {fmtLong(getTglMulai(aktif))} –{" "}
                  {fmtLong(getTglSelesai(aktif))}
                </p>

                {/* Progress ring simulation with bar */}
                {hariTotal !== null && (
                  <div>
                    <div className="flex justify-between text-xs text-white/80 mb-1.5">
                      <span>Progress tahun ajaran</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/60 mt-1.5">
                      <span>{hariBerjalan} hari berlalu</span>
                      <span>{Math.max(0, hariSisa)} hari tersisa</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline Widget */}
          {aktif && (
            <div className="bg-surface-container-lowest border border-border-light rounded-[18px] shadow-sm p-5">
              <h3
                className="font-semibold text-text-primary text-sm mb-4 flex items-center gap-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <span className="material-symbols-outlined text-primary text-[18px]">
                  timeline
                </span>
                Timeline {aktif.tahun}
              </h3>
              <div className="relative border-l-2 border-outline-variant/30 ml-3 space-y-5">
                <TimelineItem
                  title="Mulai Tahun Ajaran"
                  subtitle={fmtLong(getTglMulai(aktif))}
                  active={false}
                />
                <TimelineItem
                  title="Semester Ganjil (Berjalan)"
                  subtitle={`${fmt(getTglMulai(aktif))} – pertengahan`}
                  active={true}
                />
                <TimelineItem
                  title="Libur Semester Ganjil"
                  subtitle="Akhir Desember – Awal Januari"
                  active={false}
                />
                <TimelineItem
                  title="Semester Genap"
                  subtitle={`Awal Januari – ${fmt(getTglSelesai(aktif))}`}
                  active={false}
                />
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-outline-variant/50 ring-4 ring-surface-container-lowest border-2 border-dashed border-outline-variant" />
                  <div className="text-sm font-medium text-text-secondary">
                    Selesai
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    {fmtLong(getTglSelesai(aktif))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-surface-container-lowest border border-border-light rounded-[18px] shadow-sm p-5">
            <h3
              className="font-semibold text-text-primary text-sm mb-4 flex items-center gap-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span className="material-symbols-outlined text-text-secondary text-[18px]">
                bar_chart
              </span>
              Ringkasan
            </h3>
            <div className="space-y-3">
              {[
                {
                  label: "Total Tahun Ajaran",
                  value: list.length,
                  icon: "calendar_today",
                  color: "text-primary",
                },
                {
                  label: "Tahun Aktif",
                  value: list.filter((t) => t.is_active).length,
                  icon: "event_available",
                  color: "text-success",
                },
                {
                  label: "Tahun Selesai",
                  value: list.filter((t) => !t.is_active).length,
                  icon: "event_busy",
                  color: "text-text-secondary",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between py-2 border-b border-border-light/60 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-[16px] ${s.color}`}
                    >
                      {s.icon}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {s.label}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${s.color}`}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      <ModalTahunAjaran
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        editData={editData}
        queryClient={queryClient}
      />
    </div>
  );
}
