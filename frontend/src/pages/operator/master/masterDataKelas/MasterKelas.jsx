import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ── Helpers ────────────────────────────────────────────────────────────────────
function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function kapasitasColor(siswa, kapasitas) {
  if (!kapasitas) return "bg-surface-container";
  const pct = siswa / kapasitas;
  if (pct >= 1) return "bg-info";
  if (pct >= 0.8) return "bg-warning";
  return "bg-success";
}

function statusLabel(siswa, kapasitas, wali) {
  if (!wali)
    return {
      text: "No Wali",
      cls: "bg-surface-variant text-text-secondary border-outline-variant/30",
    };
  if (!kapasitas)
    return {
      text: "Aktif",
      cls: "bg-success/10 text-success border-success/20",
    };
  const pct = siswa / kapasitas;
  if (pct >= 1)
    return { text: "Penuh", cls: "bg-info/10 text-info border-info/20" };
  if (pct >= 0.8)
    return {
      text: "Hampir Penuh",
      cls: "bg-warning/10 text-warning border-warning/20",
    };
  return { text: "Aktif", cls: "bg-success/10 text-success border-success/20" };
}

// ── Form field ─────────────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT =
  "w-full px-3 py-2.5 rounded-xl border border-border-light bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-text-primary placeholder:text-text-secondary";
const SELECT = INPUT + " appearance-none";

// ── Modal Tambah / Edit Kelas ─────────────────────────────────────────────────
function ModalKelas({ open, onClose, editData, queryClient }) {
  const isEdit = !!editData;

  const emptyForm = {
    id: "",
    nama_kelas: "",
    tingkat: "1",
    kurikulum: "Kurikulum Merdeka",
    ruangan: "",
    kapasitas: "30",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open)
      setForm(
        editData
          ? { ...emptyForm, ...editData }
          : emptyForm,
      );
  }, [open, editData]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? api.put(`/operator/master-data/kelas/${editData.id}`, data)
        : api.post("/operator/master-data/kelas", data),
    onSuccess: () => {
      toast.success(
        `Data kelas berhasil ${isEdit ? "diperbarui" : "ditambahkan"}.`,
      );
      queryClient.invalidateQueries(["master-kelas"]);
      onClose();
    },
    onError: (err) => {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).forEach((e) => toast.error(e[0]));
      else toast.error(err.response?.data?.message ?? "Gagal menyimpan.");
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg border border-border-light animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">
                meeting_room
              </span>
            </div>
            <h3
              className="font-semibold text-text-primary"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {isEdit ? "Edit Data Kelas" : "Tambah Kelas Baru"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid grid-cols-2 gap-4 max-h-[68vh] overflow-y-auto">
          <Field label="ID Kelas" required>
            <input
              value={form.id}
              onChange={(e) => set("id", e.target.value)}
              className={INPUT}
              placeholder="Contoh: 1A-2026"
              disabled={isEdit}
            />
          </Field>

          <Field label="Nama Kelas" required>
            <input
              value={form.nama_kelas}
              onChange={(e) => set("nama_kelas", e.target.value)}
              className={INPUT}
              placeholder="Contoh: Kelas 1A"
            />
          </Field>

          <Field label="Tingkat" required>
            <select
              value={form.tingkat}
              onChange={(e) => set("tingkat", e.target.value)}
              className={SELECT}
            >
              {[1, 2, 3, 4, 5, 6].map((t) => (
                <option key={t} value={t}>
                  Kelas {t}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Kurikulum" required>
            <select
              value={form.kurikulum}
              onChange={(e) => set("kurikulum", e.target.value)}
              className={SELECT}
            >
              <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
              <option value="Kurikulum 2013">Kurikulum 2013</option>
            </select>
          </Field>

          <Field label="Ruangan">
            <input
              value={form.ruangan}
              onChange={(e) => set("ruangan", e.target.value)}
              className={INPUT}
              placeholder="Contoh: R-101"
            />
          </Field>

          <Field label="Kapasitas">
            <input
              type="number"
              value={form.kapasitas}
              onChange={(e) => set("kapasitas", e.target.value)}
              className={INPUT}
              placeholder="30"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-border-light">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface-container text-sm font-medium transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
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

// ── Skeleton loader ────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-border-light">
      {[12, 8, 16, 12, 20, 10, 10, 10, 12].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className="h-3.5 bg-surface-container-high rounded animate-pulse"
            style={{ width: `${w * 4}px` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  badge,
  iconBg,
  iconColor,
  bar,
  barPct,
  barColor,
}) {
  return (
    <div className="bg-surface-container-lowest p-4 rounded-2xl border border-border-light shadow-sm flex flex-col gap-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/3 rounded-full -mr-5 -mt-5 group-hover:scale-150 transition-transform duration-500" />
      <div className="flex justify-between items-start relative z-10">
        <div
          className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}
        >
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        {badge && (
          <span className="text-[10px] font-semibold text-text-secondary bg-surface-container px-2 py-0.5 rounded-full border border-border-light">
            {badge}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
          {label}
        </p>
        <p
          className="text-2xl font-bold text-text-primary mt-0.5"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {value}
        </p>
      </div>
      {bar && (
        <div className="relative z-10">
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div
              className={`${barColor} h-full rounded-full transition-all duration-700`}
              style={{ width: `${barPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Side Drawer ────────────────────────────────────────────────────────────────
function DrawerDetail({ kelas, open, onClose, onEdit, onDelete }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    if (open) setActiveTab("info");
  }, [open, kelas?.id]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!kelas) return null;

  const siswa = kelas.total_siswa ?? 0;
  const kap = kelas.kapasitas ?? 0;
  const pct = kap ? Math.round((siswa / kap) * 100) : 0;
  const { text: stText, cls: stCls } = statusLabel(
    siswa,
    kap,
    kelas.wali?.nama_lengkap ?? kelas.nama_wali,
  );

  const tabs = [
    { id: "info", label: "Informasi" },
    { id: "siswa", label: "Daftar Siswa" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-surface-container-lowest shadow-2xl border-l border-border-light z-50 flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-border-light bg-surface-container-low/50 shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h3
                className="font-bold text-text-primary text-base"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {kelas.nama_kelas}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Kode: <span className="font-mono font-medium">{kelas.id}</span>
                {kelas.tahun_ajaran?.nama
                  ? ` • TA ${kelas.tahun_ajaran.nama}`
                  : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-container rounded-lg transition-colors shrink-0 ml-3"
            >
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-light shrink-0 px-6 overflow-x-auto gap-5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === "info" && (
            <>
              {/* Quick info cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface p-4 rounded-xl border border-border-light">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Wali Kelas
                  </p>
                  {(kelas.wali?.nama_lengkap ?? kelas.nama_wali) ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold shrink-0">
                          {initials(
                            kelas.wali?.nama_lengkap ?? kelas.nama_wali,
                          )}
                        </div>
                        <span className="text-sm font-medium text-text-primary leading-tight">
                          {kelas.wali?.nama_lengkap ?? kelas.nama_wali}
                        </span>
                      </div>
                      {kelas.wali?.nuptk && (
                        <p className="text-[10px] text-info font-mono">
                          NUPTK: {kelas.wali.nuptk}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm italic text-text-secondary">
                      Belum ditugaskan
                    </p>
                  )}
                </div>
                <div className="bg-surface p-4 rounded-xl border border-border-light">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Ruangan
                  </p>
                  <p className="text-sm font-semibold text-text-primary">
                    {kelas.ruangan || "-"}
                  </p>
                  <p className="text-[10px] text-text-secondary mt-1">
                    Kapasitas: {kap} kursi
                  </p>
                </div>
              </div>

              {/* Capacity chart */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-border-light">
                <h4
                  className="text-sm font-semibold text-text-primary mb-4"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Statistik Siswa
                </h4>
                <div className="flex items-center gap-5">
                  {/* Donut via conic-gradient */}
                  <div
                    className="relative w-20 h-20 rounded-full shrink-0 flex items-center justify-center"
                    style={{
                      background: kap
                        ? `conic-gradient(#00652c 0% ${pct}%, #eaefe6 ${pct}% 100%)`
                        : "#eaefe6",
                    }}
                  >
                    <div className="w-14 h-14 bg-surface-container-low rounded-full flex items-center justify-center flex-col">
                      <span
                        className="font-bold text-base text-text-primary"
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      >
                        {siswa}
                      </span>
                      <span className="text-[9px] text-text-secondary uppercase tracking-wide">
                        Siswa
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2.5">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text-secondary">Terisi</span>
                        <span className="font-semibold text-text-primary">
                          {siswa}/{kap} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${kapasitasColor(siswa, kap)}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${stCls}`}
                      >
                        {stText}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail akademik */}
              <div className="space-y-1">
                <h4
                  className="text-sm font-semibold text-text-primary pb-2 border-b border-border-light"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Detail Akademik
                </h4>
                {[
                  { label: "Tingkat", value: `Kelas ${kelas.tingkat}` },
                  { label: "Semester", value: `Semester ${kelas.semester}` },
                  { label: "Kurikulum", value: kelas.kurikulum || "-" },
                  {
                    label: "Tahun Ajaran",
                    value: kelas.tahun_ajaran?.nama || "-",
                  },
                  {
                    label: "Status",
                    value: null,
                    badge: stText,
                    badgeCls: stCls,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-3 py-2.5 border-b border-border-light border-dashed last:border-0 gap-2"
                  >
                    <span className="text-xs text-text-secondary col-span-1">
                      {row.label}
                    </span>
                    <span className="text-sm font-medium text-text-primary col-span-2">
                      {row.badge ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${row.badgeCls}`}
                        >
                          {row.badge}
                        </span>
                      ) : (
                        row.value
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "siswa" && (
            <div className="text-center py-10 text-text-secondary">
              <span className="material-symbols-outlined text-[40px] text-outline-variant block mb-3">
                group
              </span>
              <p className="text-sm font-medium">
                Lihat detail lengkap daftar siswa
              </p>
              <button
                onClick={() => navigate(`/operator/master/kelas/${kelas.id}`)}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-on-primary-fixed-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  open_in_new
                </span>
                Buka Halaman Detail
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-border-light bg-surface flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              onDelete(kelas);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-danger border border-danger/20 bg-danger/5 hover:bg-danger/10 text-sm font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              delete
            </span>
            Hapus
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border-light text-text-secondary rounded-xl text-sm font-medium hover:bg-surface-container transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onEdit(kelas);
                onClose();
              }}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">
                edit
              </span>
              Edit Kelas
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function MasterKelas() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [tingkat, setTingkat] = useState("");
  const [semester, setSemester] = useState("");
  const [tahunAjaranFilter, setTahunAjaranFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [drawerKelas, setDrawerKelas] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const { data, isLoading } = useQuery({
    queryKey: [
      "master-kelas",
      search,
      tingkat,
      semester,
      tahunAjaranFilter,
      page,
    ],
    queryFn: () =>
      api
        .get("/operator/master-data/kelas", {
          params: { search, tingkat, semester, page, per_page: 10 },
        })
        .then((r) => r.data.data),
    keepPreviousData: true,
  });

  const { data: tahunAjaranList } = useQuery({
    queryKey: ["tahun-ajaran-dropdown"],
    queryFn: () =>
      api.get("/operator/master-data/tahun-ajaran").then((r) => r.data.data),
  });

  const hapus = useMutation({
    mutationFn: (id) => api.delete(`/operator/master-data/kelas/${id}`),
    onSuccess: () => {
      toast.success("Data kelas dihapus.");
      queryClient.invalidateQueries(["master-kelas"]);
      setDrawerOpen(false);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus."),
  });

  const kelasList = data?.data ?? [];
  const total = data?.total ?? 0;
  const lastPage = data?.last_page ?? 1;

  // Computed stats
  const totalKelas = total;
  const kelasAktif = kelasList.filter((k) => k.is_active).length;
  const totalSiswa = kelasList.reduce((s, k) => s + (k.total_siswa ?? 0), 0);
  const kelasPenuh = kelasList.filter(
    (k) => k.kapasitas && k.total_siswa >= k.kapasitas,
  ).length;
  const totalWali = kelasList.filter((k) => k.wali || k.nama_wali).length;
  const totalKap = kelasList.reduce((s, k) => s + (k.kapasitas ?? 0), 0);
  const sisaPct = totalKap
    ? Math.round(((totalKap - totalSiswa) / totalKap) * 100)
    : 0;

  const openDrawer = (k) => {
    setDrawerKelas(k);
    setDrawerOpen(true);
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === kelasList.length) setSelected(new Set());
    else setSelected(new Set(kelasList.map((k) => k.id)));
  };

  return (
    <div className="w-full space-y-6 pb-10 opacity-0 animate-fade-up">
      {/* ── Breadcrumb & Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-text-secondary mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span>Master Data</span>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-primary font-semibold">Kelas</span>
          </nav>
          <h2
            className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Master Data Kelas
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => queryClient.invalidateQueries(["master-kelas"])}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-lowest border border-border-light text-text-secondary rounded-xl text-sm hover:bg-surface-container-high transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              refresh
            </span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-lowest border border-border-light text-text-secondary rounded-xl text-sm hover:bg-surface-container-high transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">
              upload
            </span>
            <span className="hidden sm:inline">Import</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-lowest border border-border-light text-text-secondary rounded-xl text-sm hover:bg-surface-container-high transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => {
              setEditData(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-on-primary-fixed-variant transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Tambah Kelas</span>
          </button>
        </div>
      </div>

      {/* ── Stat Cards Bento ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon="meeting_room"
          label="Total Kelas"
          value={isLoading ? "—" : totalKelas}
          badge={"+2"}
          iconBg="bg-info/10"
          iconColor="text-info"
        />
        <StatCard
          icon="check_circle"
          label="Kelas Aktif"
          value={isLoading ? "—" : kelasAktif}
          iconBg="bg-success/10"
          iconColor="text-success"
          bar
          barPct={totalKelas ? Math.round((kelasAktif / totalKelas) * 100) : 0}
          barColor="bg-success"
        />
        <StatCard
          icon="person_play"
          label="Total Wali Kelas"
          value={isLoading ? "—" : totalWali}
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          icon="groups"
          label="Total Siswa"
          value={isLoading ? "—" : totalSiswa.toLocaleString()}
          iconBg="bg-accent-gold/10"
          iconColor="text-accent-gold"
        />
        <StatCard
          icon="warning"
          label="Kelas Penuh"
          value={isLoading ? "—" : kelasPenuh}
          iconBg="bg-warning/10"
          iconColor="text-warning"
        />
        <StatCard
          icon="pie_chart"
          label="Sisa Kapasitas"
          value={isLoading ? "—" : `${sisaPct}%`}
          iconBg="bg-secondary/10"
          iconColor="text-secondary"
          bar
          barPct={sisaPct}
          barColor="bg-secondary"
        />
      </div>

      {/* ── Filter & Search Bar ── */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-border-light shadow-sm flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari nama kelas atau kode..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-primary placeholder:text-text-secondary transition-all"
          />
        </div>
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={tahunAjaranFilter}
            onChange={(e) => {
              setTahunAjaranFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 bg-surface-container-low border border-border-light rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="">Tahun Ajaran (Semua)</option>
            {(tahunAjaranList ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.nama}
              </option>
            ))}
          </select>
          <select
            value={semester}
            onChange={(e) => {
              setSemester(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 bg-surface-container-low border border-border-light rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="">Semester (Semua)</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
          <select
            value={tingkat}
            onChange={(e) => {
              setTingkat(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 bg-surface-container-low border border-border-light rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="">Tingkat (Semua)</option>
            {[1, 2, 3, 4, 5, 6].map((t) => (
              <option key={t} value={t}>
                Kelas {t}
              </option>
            ))}
          </select>
          {(search || tingkat || semester || tahunAjaranFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setTingkat("");
                setSemester("");
                setTahunAjaranFilter("");
                setPage(1);
              }}
              className="px-3 py-2.5 bg-danger/5 border border-danger/20 rounded-xl text-sm text-danger hover:bg-danger/10 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">
                close
              </span>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="bg-surface-container-lowest rounded-2xl border border-border-light shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-border-light sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      kelasList.length > 0 && selected.size === kelasList.length
                    }
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary"
                  />
                </th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-secondary uppercase tracking-wider w-8">
                  No
                </th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Kode
                </th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Nama Kelas
                </th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-secondary uppercase tracking-wider hidden md:table-cell">
                  Tingkat
                </th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-secondary uppercase tracking-wider hidden lg:table-cell">
                  Wali Kelas
                </th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-secondary uppercase tracking-wider hidden lg:table-cell">
                  Jumlah Siswa
                </th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-secondary uppercase tracking-wider hidden xl:table-cell">
                  Kapasitas
                </th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-secondary uppercase tracking-wider hidden xl:table-cell">
                  Ruangan
                </th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-secondary uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border-light">
              {isLoading ? (
                [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
              ) : kelasList.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="text-center py-16 text-text-secondary"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-[48px] text-outline-variant">
                        meeting_room
                      </span>
                      <p className="font-medium">Belum ada data kelas.</p>
                      <button
                        onClick={() => {
                          setEditData(null);
                          setModalOpen(true);
                        }}
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
                kelasList.map((k, idx) => {
                  const s = k.total_siswa ?? 0;
                  const kap = k.kapasitas ?? 0;
                  const pct = kap ? Math.round((s / kap) * 100) : 0;
                  const { text: stText, cls: stCls } = statusLabel(
                    s,
                    kap,
                    k.wali?.nama_lengkap ?? k.nama_wali,
                  );
                  const waliName = k.wali?.nama_lengkap ?? k.nama_wali;

                  return (
                    <tr
                      key={k.id}
                      className={`group hover:bg-background-light transition-colors cursor-pointer ${selected.has(k.id) ? "bg-primary/3" : ""}`}
                      onClick={() => openDrawer(k)}
                    >
                      <td
                        className="py-3.5 px-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(k.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(k.id)}
                          readOnly
                          className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary text-xs">
                        {(page - 1) * 10 + idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-semibold text-text-secondary bg-surface-container px-2 py-0.5 rounded">
                          {k.id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-primary">
                          {k.nama_kelas}
                        </p>
                        <p className="text-[10px] text-text-secondary mt-0.5">
                          Sem. {k.semester} • {k.kurikulum}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                          Kelas {k.tingkat}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 hidden lg:table-cell">
                        {waliName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                              {initials(waliName)}
                            </div>
                            <span className="text-xs text-text-primary truncate max-w-[120px]">
                              {waliName}
                            </span>
                          </div>
                        ) : (
                          <span className="italic text-xs text-text-secondary">
                            Belum ditugaskan
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 hidden lg:table-cell">
                        {kap ? (
                          <div className="flex flex-col gap-1 w-28">
                            <div className="flex justify-between text-[10px] text-text-secondary">
                              <span>
                                {s}/{kap}
                              </span>
                              <span>{pct}%</span>
                            </div>
                            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${kapasitasColor(s, kap)}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-text-secondary">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-text-secondary hidden xl:table-cell">
                        {kap || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-text-secondary hidden xl:table-cell">
                        {k.ruangan || "-"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${stCls}`}
                        >
                          {stText}
                        </span>
                      </td>
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            onClick={() =>
                              navigate(`/operator/master/kelas/${k.id}`)
                            }
                            title="Detail"
                            className="p-1.5 rounded-lg text-text-secondary hover:text-info hover:bg-info/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[17px]">
                              visibility
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setEditData(k);
                              setModalOpen(true);
                            }}
                            title="Edit"
                            className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[17px]">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus kelas ${k.nama_kelas}?`))
                                hapus.mutate(k.id);
                            }}
                            title="Hapus"
                            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[17px]">
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
        <div className="px-5 py-3.5 border-t border-border-light bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-text-secondary">
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
            kelas
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-border-light text-text-secondary hover:bg-surface-container-high disabled:opacity-40 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                chevron_left
              </span>
            </button>
            {[...Array(Math.min(lastPage, 5))].map((_, i) => {
              const pg = i + 1;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors border ${
                    page === pg
                      ? "bg-primary text-white border-primary"
                      : "border-border-light text-text-primary hover:bg-surface-container-high"
                  }`}
                >
                  {pg}
                </button>
              );
            })}
            {lastPage > 5 && (
              <span className="text-text-secondary text-xs px-1">
                …{lastPage}
              </span>
            )}
            <button
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page >= lastPage}
              className="p-1.5 rounded-lg border border-border-light text-text-secondary hover:bg-surface-container-high disabled:opacity-40 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Side Drawer ── */}
      <DrawerDetail
        kelas={drawerKelas}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onEdit={(k) => {
          setEditData(k);
          setModalOpen(true);
        }}
        onDelete={(k) => {
          if (confirm(`Hapus kelas ${k.nama_kelas}?`)) hapus.mutate(k.id);
        }}
      />

      {/* ── Modal Tambah/Edit ── */}
      <ModalKelas
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
