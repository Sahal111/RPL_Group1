import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

// ── Constants ─────────────────────────────────────────────────────────────────
const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001";

const jenisPtkOptions = [
  "Kepala Sekolah",
  "Guru Kelas",
  "Guru Mapel",
  "Guru BK",
  "Tenaga Administrasi",
  "Pustakawan",
  "Laboran",
  "Penjaga Sekolah",
  "Lainnya",
];
const statusOptions = ["PNS", "PPPK", "GTY", "GTT", "Honor Daerah", "Lainnya"];
const agamaOptions = [
  "Islam",
  "Kristen Protestan",
  "Kristen Katolik",
  "Hindu",
  "Buddha",
  "Khonghucu",
];
const perkawinanOpts = ["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"];

const defaultForm = {
  nuptk: "",
  nip: "",
  nik: "",
  nama_lengkap: "",
  jenis_kelamin: "L",
  tanggal_lahir: "",
  tempat_lahir: "",
  agama: "Islam",
  status_perkawinan: "Belum Kawin",
  jenis_ptk: "Guru Kelas",
  status_kepegawaian: "GTT",
  golongan: "",
  tmt_golongan: "",
  no_hp: "",
  email: "",
  alamat_jalan: "",
  rt: "",
  rw: "",
  desa: "",
  kecamatan: "",
  kabupaten: "",
  provinsi: "",
  kode_pos: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function fotoUrl(foto) {
  return foto ? `${BASE_URL}/storage/${foto}` : null;
}

function statusColor(status) {
  if (!status)
    return "bg-surface-variant text-text-secondary border-outline-variant/30";
  const s = status.toLowerCase();
  if (s === "aktif" || s === "pns" || s === "pppk")
    return "bg-success/10 text-success border-success/20";
  if (s === "cuti") return "bg-warning/10 text-warning border-warning/20";
  if (s === "nonaktif") return "bg-danger/10 text-danger border-danger/20";
  return "bg-surface-variant text-text-secondary border-outline-variant/30";
}

// ── Form Field Component ──────────────────────────────────────────────────────
const INPUT =
  "w-full px-3 py-2.5 rounded-xl border border-border-light bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-text-primary placeholder:text-text-secondary";
const SELECT = INPUT + " appearance-none";

function Field({ label, required, half, children }) {
  return (
    <div className={half ? "" : ""}>
      <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
        {children}
      </span>
      <div className="flex-1 h-px bg-border-light" />
    </div>
  );
}

// ── Modal Tambah / Edit Guru ──────────────────────────────────────────────────
function ModalGuru({ open, onClose, editData, queryClient }) {
  const isEdit = !!editData;
  const [form, setForm] = useState(defaultForm);
  const [preview, setPreview] = useState(null);
  const [activeSection, setActiveSection] = useState("pribadi");
  const fileRef = useRef();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (open) {
      setForm(editData ?? defaultForm);
      setPreview(editData?.foto ? fotoUrl(editData.foto) : null);
      setActiveSection("pribadi");
    }
  }, [open, editData]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const { _foto, ...payload } = data;
      const res = isEdit
        ? await api.put(`/operator/master-data/guru/${editData.nuptk}`, payload)
        : await api.post("/operator/master-data/guru", payload);
      if (_foto) {
        const fd = new FormData();
        fd.append("foto", _foto);
        await api.post(
          `/operator/master-data/guru/${res.data.data.nuptk}/foto`,
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      }
      return res;
    },
    onSuccess: () => {
      toast.success(
        `Data guru berhasil ${isEdit ? "diperbarui" : "ditambahkan"}.`,
      );
      queryClient.invalidateQueries(["master-guru"]);
      onClose();
    },
    onError: (err) => {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).forEach((e) => toast.error(e[0]));
      else toast.error(err.response?.data?.message ?? "Gagal menyimpan.");
    },
  });

  if (!open) return null;

  const sections = [
    { id: "pribadi", label: "Data Pribadi", icon: "person" },
    { id: "kepegawaian", label: "Kepegawaian", icon: "work" },
    { id: "alamat", label: "Alamat", icon: "location_on" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-auto">
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-2xl my-4 border border-border-light animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">
                supervisor_account
              </span>
            </div>
            <h3
              className="font-bold text-text-primary text-base"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {isEdit ? "Edit Data Guru" : "Tambah Guru Baru"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-border-light px-6 gap-4 bg-surface-container-lowest">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeSection === s.id
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {s.icon}
              </span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-4">
          {activeSection === "pribadi" && (
            <>
              {/* Foto Profil */}
              <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-border-light">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                    {preview ? (
                      <img
                        src={preview}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className="text-primary font-bold text-xl"
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      >
                        {form.nama_lengkap?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-on-primary-fixed-variant transition-colors"
                  >
                    <span className="material-symbols-outlined text-white text-[13px]">
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
                      if (file) {
                        setPreview(URL.createObjectURL(file));
                        setForm((f) => ({ ...f, _foto: file }));
                      }
                    }}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Foto Profil
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    JPG/PNG, maksimal 2MB
                  </p>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="text-xs text-primary hover:underline mt-1"
                  >
                    Ganti foto
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Field label="Nama Lengkap" required>
                    <input
                      value={form.nama_lengkap}
                      onChange={(e) => set("nama_lengkap", e.target.value)}
                      className={INPUT}
                      placeholder="Nama lengkap dengan gelar"
                    />
                  </Field>
                </div>
                <Field label="NUPTK" required>
                  <input
                    value={form.nuptk}
                    onChange={(e) => set("nuptk", e.target.value)}
                    className={INPUT}
                    placeholder="16 digit NUPTK"
                    disabled={isEdit}
                  />
                </Field>
                <Field label="NIP">
                  <input
                    value={form.nip}
                    onChange={(e) => set("nip", e.target.value)}
                    className={INPUT}
                    placeholder="NIP (opsional)"
                  />
                </Field>
                <Field label="NIK">
                  <input
                    value={form.nik}
                    onChange={(e) => set("nik", e.target.value)}
                    className={INPUT}
                    placeholder="16 digit NIK"
                  />
                </Field>
                <Field label="Jenis Kelamin" required>
                  <select
                    value={form.jenis_kelamin}
                    onChange={(e) => set("jenis_kelamin", e.target.value)}
                    className={SELECT}
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </Field>
                <Field label="Tempat Lahir" required>
                  <input
                    value={form.tempat_lahir}
                    onChange={(e) => set("tempat_lahir", e.target.value)}
                    className={INPUT}
                    placeholder="Kota tempat lahir"
                  />
                </Field>
                <Field label="Tanggal Lahir" required>
                  <input
                    type="date"
                    value={form.tanggal_lahir}
                    onChange={(e) => set("tanggal_lahir", e.target.value)}
                    className={INPUT}
                  />
                </Field>
                <Field label="Agama" required>
                  <select
                    value={form.agama}
                    onChange={(e) => set("agama", e.target.value)}
                    className={SELECT}
                  >
                    {agamaOptions.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Status Perkawinan">
                  <select
                    value={form.status_perkawinan}
                    onChange={(e) => set("status_perkawinan", e.target.value)}
                    className={SELECT}
                  >
                    {perkawinanOpts.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="No. HP">
                  <input
                    value={form.no_hp}
                    onChange={(e) => set("no_hp", e.target.value)}
                    className={INPUT}
                    placeholder="Nomor WhatsApp aktif"
                  />
                </Field>
                <div className="col-span-2">
                  <Field label="Email">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={INPUT}
                      placeholder="Email guru"
                    />
                  </Field>
                </div>
              </div>
            </>
          )}

          {activeSection === "kepegawaian" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Jenis PTK" required>
                <select
                  value={form.jenis_ptk}
                  onChange={(e) => set("jenis_ptk", e.target.value)}
                  className={SELECT}
                >
                  {jenisPtkOptions.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status Kepegawaian" required>
                <select
                  value={form.status_kepegawaian}
                  onChange={(e) => set("status_kepegawaian", e.target.value)}
                  className={SELECT}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Golongan">
                <input
                  value={form.golongan}
                  onChange={(e) => set("golongan", e.target.value)}
                  className={INPUT}
                  placeholder="Contoh: III/a"
                />
              </Field>
              <Field label="TMT Golongan">
                <input
                  type="date"
                  value={form.tmt_golongan}
                  onChange={(e) => set("tmt_golongan", e.target.value)}
                  className={INPUT}
                />
              </Field>
            </div>
          )}

          {activeSection === "alamat" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Field label="Alamat Jalan">
                  <textarea
                    value={form.alamat_jalan}
                    onChange={(e) => set("alamat_jalan", e.target.value)}
                    className={INPUT + " resize-none"}
                    rows={2}
                    placeholder="Nama jalan, nomor rumah"
                  />
                </Field>
              </div>
              <Field label="RT">
                <input
                  value={form.rt}
                  onChange={(e) => set("rt", e.target.value)}
                  className={INPUT}
                  placeholder="001"
                />
              </Field>
              <Field label="RW">
                <input
                  value={form.rw}
                  onChange={(e) => set("rw", e.target.value)}
                  className={INPUT}
                  placeholder="001"
                />
              </Field>
              <Field label="Desa/Kelurahan">
                <input
                  value={form.desa}
                  onChange={(e) => set("desa", e.target.value)}
                  className={INPUT}
                  placeholder="Nama desa"
                />
              </Field>
              <Field label="Kecamatan">
                <input
                  value={form.kecamatan}
                  onChange={(e) => set("kecamatan", e.target.value)}
                  className={INPUT}
                  placeholder="Nama kecamatan"
                />
              </Field>
              <Field label="Kabupaten/Kota">
                <input
                  value={form.kabupaten}
                  onChange={(e) => set("kabupaten", e.target.value)}
                  className={INPUT}
                  placeholder="Nama kabupaten"
                />
              </Field>
              <Field label="Provinsi">
                <input
                  value={form.provinsi}
                  onChange={(e) => set("provinsi", e.target.value)}
                  className={INPUT}
                  placeholder="Nama provinsi"
                />
              </Field>
              <div className="col-span-2">
                <Field label="Kode Pos">
                  <input
                    value={form.kode_pos}
                    onChange={(e) => set("kode_pos", e.target.value)}
                    className={INPUT}
                    placeholder="12345"
                  />
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border-light">
          <div className="flex gap-1">
            {sections.map((s, i) => (
              <div
                key={s.id}
                className={`w-2 h-2 rounded-full transition-colors ${activeSection === s.id ? "bg-primary" : "bg-border-light"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface-container text-sm font-medium transition-colors"
            >
              Batal
            </button>
            {activeSection !== "alamat" ? (
              <button
                onClick={() =>
                  setActiveSection(
                    activeSection === "pribadi" ? "kepegawaian" : "alamat",
                  )
                }
                className="px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors flex items-center gap-1.5"
              >
                Lanjut{" "}
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </button>
            ) : (
              <button
                onClick={() => mutation.mutate(form)}
                disabled={mutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-60 flex items-center gap-2"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-border-light">
      {[10, 8, 20, 10, 12, 10, 10].map((w, i) => (
        <td key={i} className="px-6 py-4">
          <div
            className={`h-4 bg-surface-container-high rounded animate-pulse`}
            style={{ width: `${w * 5}px` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, iconBg, iconColor }) {
  return (
    <div className="bg-surface/90 backdrop-blur-md border border-outline-variant/30 shadow-sm rounded-[20px] p-5 relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-container/5 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm text-text-secondary font-medium mb-1">
            {label}
          </p>
          <h3
            className="text-2xl font-bold text-text-primary"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {value}
          </h3>
        </div>
        <div className={`p-2.5 ${iconBg} rounded-xl ${iconColor}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MasterGuru() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [jenis, setJenis] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selected, setSelected] = useState(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ["master-guru", search, jenis, statusFilter, page],
    queryFn: () =>
      api
        .get("/operator/master-data/guru", {
          params: { search, jenis_ptk: jenis, per_page: 10, page },
        })
        .then((r) => r.data.data),
    keepPreviousData: true,
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

  const openEdit = (g) => {
    setEditData({
      ...g,
      tanggal_lahir: g.tanggal_lahir?.split("T")[0] ?? "",
      tmt_golongan: g.tmt_golongan?.split("T")[0] ?? "",
    });
    setModalOpen(true);
  };

  const gurus = data?.data ?? [];
  const total = data?.total ?? 0;
  const lastPage = data?.last_page ?? 1;

  // Stats from loaded page (approximate)
  const totalGuru = total;
  const guruAktif = gurus.filter((g) => !g.nonaktif).length;

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
              title="Import"
              className="flex items-center p-2.5 text-text-secondary hover:text-primary hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                upload_file
              </span>
            </button>
            <div className="w-px bg-border-light" />
            <button
              title="Export"
              className="flex items-center p-2.5 text-text-secondary hover:text-primary hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                download
              </span>
            </button>
            <div className="w-px bg-border-light" />
            <button
              title="Cetak"
              className="flex items-center p-2.5 text-text-secondary hover:text-primary hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                print
              </span>
            </button>
          </div>
          <button
            onClick={() => {
              setEditData(null);
              setModalOpen(true);
            }}
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
              value={
                isLoading
                  ? "—"
                  : Math.max(0, gurus.filter((g) => g.nonaktif).length)
              }
              iconBg="bg-danger/10"
              iconColor="text-danger"
            />
            <StatCard
              icon="supervisor_account"
              label="Wali Kelas"
              value={isLoading ? "—" : gurus.filter((g) => g.kelas_wali).length}
              iconBg="bg-accent-gold/10"
              iconColor="text-accent-gold"
            />
            <StatCard
              icon="workspace_premium"
              label="Bersertifikasi"
              value={isLoading ? "—" : "—"}
              iconBg="bg-info/10"
              iconColor="text-info"
            />
            <StatCard
              icon="menu_book"
              label="Mata Pelajaran"
              value={isLoading ? "—" : "—"}
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
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                    <option value="cuti">Cuti</option>
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
                    gurus.map((g) => {
                      const foto = fotoUrl(g.foto);
                      const wali = g.kelas_wali ?? g.nama_wali_kelas;
                      const statusKepeg = g.status_kepegawaian ?? "";

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
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor(statusKepeg)}`}
                            >
                              {statusKepeg || "—"}
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
                                onClick={() => openEdit(g)}
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
            <ul className="space-y-2.5">
              {[
                {
                  label: "Belum Punya Jadwal",
                  sub: "Membutuhkan plot mengajar",
                  count: 4,
                  color: "bg-danger text-white",
                },
                {
                  label: "NUPTK Kosong",
                  sub: "Perlu diisi untuk sinkronisasi",
                  count: 12,
                  color: "bg-warning text-white",
                },
                {
                  label: "Sertifikasi Expired",
                  sub: "Perlu pembaruan dokumen",
                  count: 2,
                  color: "bg-info text-white",
                },
              ].map((item) => (
                <li
                  key={item.label}
                  className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-border-light gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {item.label}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {item.sub}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold shrink-0 ${item.color}`}
                  >
                    {item.count}
                  </span>
                </li>
              ))}
            </ul>
            <button className="w-full mt-4 py-2 text-sm text-primary font-medium border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors">
              Lihat Detail Laporan
            </button>
          </div>

          {/* Guru Baru Widget */}
          <div className="bg-surface/90 backdrop-blur-md border border-outline-variant/30 shadow-sm rounded-[20px] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-semibold text-text-primary text-sm"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Guru Baru
              </h3>
              <button className="text-xs text-primary hover:underline">
                Lihat Semua
              </button>
            </div>
            <div className="space-y-3">
              {isLoading
                ? [...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-surface-container-high rounded animate-pulse w-4/5" />
                        <div className="h-3 bg-surface-container-high rounded animate-pulse w-3/5" />
                      </div>
                    </div>
                  ))
                : gurus.slice(0, 3).map((g) => {
                    const foto = fotoUrl(g.foto);
                    return (
                      <div key={g.nuptk} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center text-primary font-bold border border-border-light flex-shrink-0">
                          {foto ? (
                            <img
                              src={foto}
                              alt={g.nama_lengkap}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span
                              className="text-sm"
                              style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                              }}
                            >
                              {initials(g.nama_lengkap)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate">
                            {g.nama_lengkap}
                          </p>
                          <p className="text-xs text-text-secondary truncate">
                            {g.jenis_ptk}
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
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      <ModalGuru
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
