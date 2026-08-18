// ── Guru Module Shared Constants & Helpers ────────────────────────────────────

export const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001";

export const jenisPtkOptions = [
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
export const statusOptions = ["PNS", "PPPK", "GTY", "GTT", "Honorer", "Lainnya"];
export const agamaOptions = [
  "Islam",
  "Kristen Protestan",
  "Kristen Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
  "Lainnya",
];
export const perkawinanOpts = [
  "Belum Menikah",
  "Menikah",
  "Cerai Hidup",
  "Cerai Mati",
];

export const defaultForm = {
  nuptk: "",
  nip: "",
  nik: "",
  nama: "",
  jenis_kelamin: "L",
  tanggal_lahir: "",
  tempat_lahir: "",
  agama: "Islam",
  status_perkawinan: "Belum Kawin",
  jenis_ptk: "Guru Kelas",
  status_kepegawaian: "GTT",
  // golongan: "",
  // tmt_golongan: "",
  no_hp: "",
  email: "",
  alamat_jalan: "",
  rt: "",
  rw: "",
  desa_kelurahan: "",
  kecamatan: "",
  kota_kabupaten: "",
  provinsi: "",
  kode_pos: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function fotoUrl(foto) {
  return foto ? `${BASE_URL}/storage/${foto}` : null;
}

export function statusColor(status) {
  if (!status)
    return "bg-surface-variant text-text-secondary border-outline-variant/30";
  const s = status.toLowerCase();
  if (s === "aktif") return "bg-success/10 text-success border-success/20";
  if (s === "cuti") return "bg-warning/10 text-warning border-warning/20";
  if (s === "pensiun" || s === "mutasi" || s === "keluar")
    return "bg-danger/10 text-danger border-danger/20";
  return "bg-surface-variant text-text-secondary border-outline-variant/30";
}

// ── Form Field Components ─────────────────────────────────────────────────────
export const INPUT =
  "w-full px-3 py-2.5 rounded-xl border border-border-light bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-text-primary placeholder:text-text-secondary";
export const SELECT = INPUT + " appearance-none";

export function Field({ label, required, half, children }) {
  return (
    <div className={half ? "" : ""}>
      <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
        {children}
      </span>
      <div className="flex-1 h-px bg-border-light" />
    </div>
  );
}

// ── Skeleton Row ──────────────────────────────────────────────────────────────
export function SkeletonRow() {
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
export function StatCard({ icon, label, value, iconBg, iconColor }) {
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
