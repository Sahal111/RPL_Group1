import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
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
const statusOptions = ["PNS", "PPPK", "GTY", "GTT", "Honorer", "Lainnya"];
const agamaOptions = [
  "Islam",
  "Kristen Protestan",
  "Kristen Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
  "Lainnya",
];
const perkawinanOpts = [
  "Belum Menikah",
  "Menikah",
  "Cerai Hidup",
  "Cerai Mati",
];

const defaultForm = {
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
  if (s === "aktif") return "bg-success/10 text-success border-success/20";
  if (s === "cuti") return "bg-warning/10 text-warning border-warning/20";
  if (s === "pensiun" || s === "mutasi" || s === "keluar")
    return "bg-danger/10 text-danger border-danger/20";
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
// function ModalGuru({ open, onClose, editData, queryClient }) {
//   const isEdit = !!editData;
//   const [form, setForm] = useState(defaultForm);
//   const [preview, setPreview] = useState(null);
//   const [activeSection, setActiveSection] = useState("pribadi");
//   const fileRef = useRef();

//   const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

//   useEffect(() => {
//     if (open) {
//       setForm(editData ?? defaultForm);
//       setPreview(editData?.foto ? fotoUrl(editData.foto) : null);
//       setActiveSection("pribadi");
//     }
//   }, [open, editData]);

//   const mutation = useMutation({
//     mutationFn: async (data) => {
//       const { _foto, ...payload } = data;
//       const res = isEdit
//         ? await api.put(`/operator/master-data/guru/${editData.nuptk}`, payload)
//         : await api.post("/operator/master-data/guru", payload);
//       if (_foto) {
//         const fd = new FormData();
//         fd.append("foto", _foto);
//         await api.post(
//           `/operator/master-data/guru/${res.data.data.nuptk}/foto`,
//           fd,
//           {
//             headers: { "Content-Type": "multipart/form-data" },
//           },
//         );
//       }
//       return res;
//     },
//     onSuccess: () => {
//       toast.success(
//         `Data guru berhasil ${isEdit ? "diperbarui" : "ditambahkan"}.`,
//       );
//       queryClient.invalidateQueries(["master-guru"]);
//       onClose();
//     },
//     onError: (err) => {
//       const errors = err.response?.data?.errors;
//       if (errors) Object.values(errors).forEach((e) => toast.error(e[0]));
//       else toast.error(err.response?.data?.message ?? "Gagal menyimpan.");
//     },
//   });

//   if (!open) return null;

//   const sections = [
//     { id: "pribadi", label: "Data Pribadi", icon: "person" },
//     { id: "kepegawaian", label: "Kepegawaian", icon: "work" },
//     { id: "alamat", label: "Alamat", icon: "location_on" },
//   ];

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-auto">
//       <div
//         className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-2xl my-4 border border-border-light animate-fade-up"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
//               <span className="material-symbols-outlined text-[20px]">
//                 supervisor_account
//               </span>
//             </div>
//             <h3
//               className="font-bold text-text-primary text-base"
//               style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
//             >
//               {isEdit ? "Edit Data Guru" : "Tambah Guru Baru"}
//             </h3>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container transition-colors"
//           >
//             <span className="material-symbols-outlined text-[20px]">close</span>
//           </button>
//         </div>

//         {/* Section Tabs */}
//         <div className="flex border-b border-border-light px-6 gap-4 bg-surface-container-lowest">
//           {sections.map((s) => (
//             <button
//               key={s.id}
//               onClick={() => setActiveSection(s.id)}
//               className={`flex items-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
//                 activeSection === s.id
//                   ? "border-primary text-primary"
//                   : "border-transparent text-text-secondary hover:text-text-primary"
//               }`}
//             >
//               <span className="material-symbols-outlined text-[15px]">
//                 {s.icon}
//               </span>
//               {s.label}
//             </button>
//           ))}
//         </div>

//         {/* Body */}
//         <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-4">
//           {activeSection === "pribadi" && (
//             <>
//               {/* Foto Profil */}
//               <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-border-light">
//                 <div className="relative shrink-0">
//                   <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-primary/20">
//                     {preview ? (
//                       <img
//                         src={preview}
//                         alt="preview"
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <span
//                         className="text-primary font-bold text-xl"
//                         style={{
//                           fontFamily: "'Plus Jakarta Sans', sans-serif",
//                         }}
//                       >
//                         {form.nama?.charAt(0)?.toUpperCase() || "?"}
//                       </span>
//                     )}
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => fileRef.current?.click()}
//                     className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-on-primary-fixed-variant transition-colors"
//                   >
//                     <span className="material-symbols-outlined text-white text-[13px]">
//                       photo_camera
//                     </span>
//                   </button>
//                   <input
//                     ref={fileRef}
//                     type="file"
//                     accept="image/*"
//                     className="hidden"
//                     onChange={(e) => {
//                       const file = e.target.files?.[0];
//                       if (file) {
//                         setPreview(URL.createObjectURL(file));
//                         setForm((f) => ({ ...f, _foto: file }));
//                       }
//                     }}
//                   />
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold text-text-primary">
//                     Foto Profil
//                   </p>
//                   <p className="text-xs text-text-secondary mt-0.5">
//                     JPG/PNG, maksimal 2MB
//                   </p>
//                   <button
//                     onClick={() => fileRef.current?.click()}
//                     className="text-xs text-primary hover:underline mt-1"
//                   >
//                     Ganti foto
//                   </button>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="col-span-2">
//                   <Field label="Nama Lengkap" required>
//                     <input
//                       value={form.nama}
//                       onChange={(e) => set("nama", e.target.value)}
//                       className={INPUT}
//                       placeholder="Nama lengkap dengan gelar"
//                     />
//                   </Field>
//                 </div>
//                 <Field label="NUPTK" required>
//                   <input
//                     value={form.nuptk}
//                     onChange={(e) => set("nuptk", e.target.value)}
//                     className={INPUT}
//                     placeholder="16 digit NUPTK"
//                     disabled={isEdit}
//                   />
//                 </Field>
//                 <Field label="NIP">
//                   <input
//                     value={form.nip}
//                     onChange={(e) => set("nip", e.target.value)}
//                     className={INPUT}
//                     placeholder="NIP (opsional)"
//                   />
//                 </Field>
//                 <Field label="NIK">
//                   <input
//                     value={form.nik}
//                     onChange={(e) => set("nik", e.target.value)}
//                     className={INPUT}
//                     placeholder="16 digit NIK"
//                   />
//                 </Field>
//                 <Field label="Jenis Kelamin" required>
//                   <select
//                     value={form.jenis_kelamin}
//                     onChange={(e) => set("jenis_kelamin", e.target.value)}
//                     className={SELECT}
//                   >
//                     <option value="L">Laki-laki</option>
//                     <option value="P">Perempuan</option>
//                   </select>
//                 </Field>
//                 <Field label="Tempat Lahir" required>
//                   <input
//                     value={form.tempat_lahir}
//                     onChange={(e) => set("tempat_lahir", e.target.value)}
//                     className={INPUT}
//                     placeholder="Kota tempat lahir"
//                   />
//                 </Field>
//                 <Field label="Tanggal Lahir" required>
//                   <input
//                     type="date"
//                     value={form.tanggal_lahir}
//                     onChange={(e) => set("tanggal_lahir", e.target.value)}
//                     className={INPUT}
//                   />
//                 </Field>
//                 <Field label="Agama" required>
//                   <select
//                     value={form.agama}
//                     onChange={(e) => set("agama", e.target.value)}
//                     className={SELECT}
//                   >
//                     {agamaOptions.map((a) => (
//                       <option key={a} value={a}>
//                         {a}
//                       </option>
//                     ))}
//                   </select>
//                 </Field>
//                 <Field label="Status Perkawinan">
//                   <select
//                     value={form.status_perkawinan}
//                     onChange={(e) => set("status_perkawinan", e.target.value)}
//                     className={SELECT}
//                   >
//                     {perkawinanOpts.map((p) => (
//                       <option key={p} value={p}>
//                         {p}
//                       </option>
//                     ))}
//                   </select>
//                 </Field>
//                 <Field label="No. HP">
//                   <input
//                     value={form.no_hp}
//                     onChange={(e) => set("no_hp", e.target.value)}
//                     className={INPUT}
//                     placeholder="Nomor WhatsApp aktif"
//                   />
//                 </Field>
//                 <div className="col-span-2">
//                   <Field label="Email">
//                     <input
//                       type="email"
//                       value={form.email}
//                       onChange={(e) => set("email", e.target.value)}
//                       className={INPUT}
//                       placeholder="Email guru"
//                     />
//                   </Field>
//                 </div>
//               </div>
//             </>
//           )}

//           {activeSection === "kepegawaian" && (
//             <div className="grid grid-cols-2 gap-3">
//               <Field label="Jenis PTK" required>
//                 <select
//                   value={form.jenis_ptk}
//                   onChange={(e) => set("jenis_ptk", e.target.value)}
//                   className={SELECT}
//                 >
//                   {jenisPtkOptions.map((j) => (
//                     <option key={j} value={j}>
//                       {j}
//                     </option>
//                   ))}
//                 </select>
//               </Field>
//               <Field label="Status Kepegawaian" required>
//                 <select
//                   value={form.status_kepegawaian}
//                   onChange={(e) => set("status_kepegawaian", e.target.value)}
//                   className={SELECT}
//                 >
//                   {statusOptions.map((s) => (
//                     <option key={s} value={s}>
//                       {s}
//                     </option>
//                   ))}
//                 </select>
//               </Field>
//               {/* <Field label="Golongan">
//                 <input
//                   value={form.golongan}
//                   onChange={(e) => set("golongan", e.target.value)}
//                   className={INPUT}
//                   placeholder="Contoh: III/a"
//                 />
//               </Field>
//               <Field label="TMT Golongan">
//                 <input
//                   type="date"
//                   value={form.tmt_golongan}
//                   onChange={(e) => set("tmt_golongan", e.target.value)}
//                   className={INPUT}
//                 />
//               </Field> */}
//             </div>
//           )}

//           {activeSection === "alamat" && (
//             <div className="grid grid-cols-2 gap-3">
//               <div className="col-span-2">
//                 <Field label="Alamat Jalan">
//                   <textarea
//                     value={form.alamat_jalan}
//                     onChange={(e) => set("alamat_jalan", e.target.value)}
//                     className={INPUT + " resize-none"}
//                     rows={2}
//                     placeholder="Nama jalan, nomor rumah"
//                   />
//                 </Field>
//               </div>
//               <Field label="RT">
//                 <input
//                   value={form.rt}
//                   onChange={(e) => set("rt", e.target.value)}
//                   className={INPUT}
//                   placeholder="001"
//                 />
//               </Field>
//               <Field label="RW">
//                 <input
//                   value={form.rw}
//                   onChange={(e) => set("rw", e.target.value)}
//                   className={INPUT}
//                   placeholder="001"
//                 />
//               </Field>
//               <Field label="Desa/Kelurahan">
//                 <input
//                   value={form.desa_kelurahan}
//                   onChange={(e) => set("desa_kelurahan", e.target.value)}
//                   className={INPUT}
//                   placeholder="Nama desa"
//                 />
//               </Field>
//               <Field label="Kecamatan">
//                 <input
//                   value={form.kecamatan}
//                   onChange={(e) => set("kecamatan", e.target.value)}
//                   className={INPUT}
//                   placeholder="Nama kecamatan"
//                 />
//               </Field>
//               <Field label="Kabupaten/Kota">
//                 <input
//                   value={form.kota_kabupaten}
//                   onChange={(e) => set("kota_kabupaten", e.target.value)}
//                   className={INPUT}
//                   placeholder="Nama kabupaten"
//                 />
//               </Field>
//               <Field label="Provinsi">
//                 <input
//                   value={form.provinsi}
//                   onChange={(e) => set("provinsi", e.target.value)}
//                   className={INPUT}
//                   placeholder="Nama provinsi"
//                 />
//               </Field>
//               <div className="col-span-2">
//                 <Field label="Kode Pos">
//                   <input
//                     value={form.kode_pos}
//                     onChange={(e) => set("kode_pos", e.target.value)}
//                     className={INPUT}
//                     placeholder="12345"
//                   />
//                 </Field>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border-light">
//           <div className="flex gap-1">
//             {sections.map((s, i) => (
//               <div
//                 key={s.id}
//                 className={`w-2 h-2 rounded-full transition-colors ${activeSection === s.id ? "bg-primary" : "bg-border-light"}`}
//               />
//             ))}
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={onClose}
//               className="px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface-container text-sm font-medium transition-colors"
//             >
//               Batal
//             </button>
//             {activeSection !== "alamat" ? (
//               <button
//                 onClick={() =>
//                   setActiveSection(
//                     activeSection === "pribadi" ? "kepegawaian" : "alamat",
//                   )
//                 }
//                 className="px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors flex items-center gap-1.5"
//               >
//                 Lanjut{" "}
//                 <span className="material-symbols-outlined text-[16px]">
//                   arrow_forward
//                 </span>
//               </button>
//             ) : (
//               <button
//                 onClick={() => mutation.mutate(form)}
//                 disabled={mutation.isPending}
//                 className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-60 flex items-center gap-2"
//               >
//                 {mutation.isPending ? (
//                   <>
//                     <span className="material-symbols-outlined text-[16px] animate-spin">
//                       progress_activity
//                     </span>
//                     Menyimpan...
//                   </>
//                 ) : isEdit ? (
//                   "Perbarui"
//                 ) : (
//                   "Simpan"
//                 )}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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
  const totalGuru = stats?.total ?? total;
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
      <ModalImport
        open={importOpen}
        onClose={() => setImportOpen(false)}
        queryClient={queryClient}
      />

      {/* ── Modal Export ── */}
      <ModalExport
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

// ── Modal Import Enterprise ───────────────────────────────────────────────────
function ModalImport({ open, onClose, queryClient }) {
  // step: "type" | "upload" | "preview" | "mapping" | "confirm" | "progress" | "done"
  const [step, setStep]           = useState("type");
  const [importType, setImportType] = useState(null); // "excel" | "zip" | "foto"
  const [file, setFile]           = useState(null);
  const [dragging, setDragging]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [batchId, setBatchId]     = useState(null);
  const [preview, setPreview]     = useState(null);   // { headers, sample_rows, auto_mapping, db_fields, dup_stats, total_baris }
  const [mapping, setMapping]     = useState({});     // { userHeader: dbField }
  const [modeDuplikat, setModeDuplikat] = useState("replace");
  const [progress, setProgress]   = useState(null);  // dari polling
  const [history, setHistory]     = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileRef = useRef();
  const pollRef = useRef(null);

  const reset = () => {
    setStep("type");
    setImportType(null);
    setFile(null);
    setBatchId(null);
    setPreview(null);
    setMapping({});
    setProgress(null);
    setLoading(false);
    clearInterval(pollRef.current);
  };

  const handleClose = () => { reset(); onClose(); };

  // ── Polling progress ───────────────────────────────────────────────────────
  const startPolling = (bid) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/operator/master-data/guru/import-status/${bid}`);
        const d   = res.data.data;
        setProgress(d);
        if (["done", "failed", "rolled_back"].includes(d.status)) {
          clearInterval(pollRef.current);
          setStep("done");
          queryClient.invalidateQueries(["master-guru"]);
        }
      } catch { clearInterval(pollRef.current); }
    }, 2000);
  };

  // ── Step 1: Upload + Preview ───────────────────────────────────────────────
  const handleUploadPreview = async () => {
    if (!file) return;
    setLoading(true);
    try {
      if (importType === "excel") {
        setBatchId(null); // reset dulu batchId lama
        const fd = new FormData();
        fd.append("file", file);
        const res = await api.post(
          "/operator/master-data/guru/import-preview",
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        const d = res.data;
        setBatchId(d.batch_id);
        setPreview(d);
        setMapping(d.auto_mapping ?? {});
        setStep("preview");
      } else if (importType === "zip") {
        // ZIP: langsung ke confirm (tidak ada preview per-baris)
        setStep("confirm");
      } else {
        // foto: langsung submit
        const fd = new FormData();
        fd.append("file", file);
        const res = await api.post(
          "/operator/master-data/guru/import-foto",
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        setProgress({ status: "done", ...res.data.data });
        setStep("done");
        queryClient.invalidateQueries(["master-guru"]);
        toast.success(res.data.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message ?? "Gagal memulai import.";
      const status = err.response?.status;
      // 404 = file tidak ada di server, suruh upload ulang
      if (status === 422 && msg.includes("tidak ada")) {
        toast.error("File sudah tidak ada di server. Silakan upload ulang.");
        setStep("upload");
        setBatchId(null);
        setFile(null);
      } else {
        toast.error(msg);
        setStep("confirm");
      }
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Execute import ─────────────────────────────────────────────────
  const handleExecute = async () => {
    // Guard: pastikan batchId ada (preview harus sudah selesai)
    if (importType === "excel" && !batchId) {
      toast.error("Upload file terlebih dahulu.");
      setStep("upload");
      return;
    }

    setLoading(true);
    setStep("progress");
    setProgress({
      status: "processing",
      progress_persen: 0,
      total_baris: preview?.total_baris ?? 0,
    });
    try {
      if (importType === "excel") {
        const res = await api.post(
          "/operator/master-data/guru/import-execute",
          {
            batch_id: batchId,
            column_mapping: mapping,
            mode_duplikat: modeDuplikat,
          },
        );
        // Simulasikan progress bar naik saat response datang
        setProgress({ status: "processing", progress_persen: 80 });
        await new Promise((r) => setTimeout(r, 300));
        setProgress(res.data.data);
        setStep("done");
        queryClient.invalidateQueries(["master-guru"]);
        if ((res.data.data?.jumlah_gagal ?? 0) === 0) {
          toast.success(
            `Import selesai! ${res.data.data?.jumlah_insert ?? 0} baru, ${res.data.data?.jumlah_update ?? 0} update.`,
          );
        } else {
          toast.error(
            `Import selesai dengan ${res.data.data?.jumlah_gagal} error. Cek laporan.`,
          );
        }
      } else if (importType === "zip") {
        // ZIP tetap async (file besar) — pakai polling
        const fd = new FormData();
        fd.append("file", file);
        fd.append("mode_duplikat", modeDuplikat);
        const res = await api.post(
          "/operator/master-data/guru/import-zip",
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        setBatchId(res.data.batch_id);
        startPolling(res.data.batch_id);
        toast.success("ZIP sedang diproses di background...");
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Gagal memulai import.");
      setStep("confirm");
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  // ── Download error report ──────────────────────────────────────────────────
  const downloadErrorReport = async () => {
    if (!batchId) return;
    try {
      const res = await api.get(`/operator/master-data/guru/import-error-report/${batchId}`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `error_import_${batchId}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Gagal mengunduh laporan error."); }
  };

  // ── Load history ───────────────────────────────────────────────────────────
  const loadHistory = async () => {
    try {
      const res = await api.get("/operator/master-data/guru/import-history");
      setHistory(res.data.data ?? []);
      setShowHistory(true);
    } catch { toast.error("Gagal memuat riwayat."); }
  };

  // ── Download template ──────────────────────────────────────────────────────
  const downloadTemplate = async () => {
    try {
      const res = await api.get("/operator/master-data/guru/template", { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = "template_import_guru.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Gagal mengunduh template."); }
  };

  useEffect(() => { return () => clearInterval(pollRef.current); }, []);

  if (!open) return null;

  const DB_FIELD_LABELS = {
    nuptk: "NUPTK*", nip: "NIP", nik: "NIK", nama: "Nama*",
    jenis_kelamin: "Jenis Kelamin", tanggal_lahir: "Tanggal Lahir",
    tempat_lahir: "Tempat Lahir", agama: "Agama", no_hp: "No. HP",
    email: "Email", jenis_ptk: "Jenis PTK", status_kepegawaian: "Status Kepegawaian",
    status_keaktifan: "Status Keaktifan", gelar_depan: "Gelar Depan",
    gelar_belakang: "Gelar Belakang", no_kk: "No. KK", alamat_jalan: "Alamat",
    provinsi: "Provinsi", kota_kabupaten: "Kota/Kab", kecamatan: "Kecamatan",
  };

  // ─────────────────────── RENDER STEPS ────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-2xl border border-border-light animate-fade-up flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">upload_file</span>
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Import Data Guru
              </h3>
              <p className="text-xs text-text-secondary">
                {step === "type" && "Pilih tipe import"}
                {step === "upload" && "Upload file"}
                {step === "preview" && "Preview & mapping kolom"}
                {step === "confirm" && "Konfirmasi import"}
                {step === "progress" && "Sedang memproses..."}
                {step === "done" && "Import selesai"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadHistory} className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container transition-colors" title="Riwayat Import">
              <span className="material-symbols-outlined text-[18px]">history</span>
            </button>
            <button onClick={handleClose} className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Stepper */}
        {!showHistory && (
          <div className="flex items-center gap-0 px-6 py-3 border-b border-border-light bg-surface-container-low shrink-0 overflow-x-auto">
            {[
              { id: "type", label: "Tipe" },
              { id: "upload", label: "Upload" },
              { id: "preview", label: "Preview" },
              { id: "confirm", label: "Konfirmasi" },
              { id: "progress", label: "Proses" },
              { id: "done", label: "Selesai" },
            ].map((s, i, arr) => {
              const steps = ["type", "upload", "preview", "confirm", "progress", "done"];
              const cur   = steps.indexOf(step);
              const me    = steps.indexOf(s.id);
              const done  = me < cur;
              const active = me === cur;
              return (
                <div key={s.id} className="flex items-center shrink-0">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${active ? "text-primary" : done ? "text-success" : "text-text-tertiary"}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${active ? "bg-primary text-white" : done ? "bg-success text-white" : "bg-surface-container text-text-secondary"}`}>
                      {done ? "✓" : me + 1}
                    </span>
                    {s.label}
                  </div>
                  {i < arr.length - 1 && (
                    <span className="text-border-light mx-0.5 text-[10px]">›</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── HISTORY ── */}
          {showHistory && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-text-primary text-sm">Riwayat Import (20 Terakhir)</h4>
                <button onClick={() => setShowHistory(false)} className="text-xs text-primary hover:underline">← Kembali</button>
              </div>
              {history.length === 0 ? (
                <p className="text-text-secondary text-sm text-center py-8">Belum ada riwayat import.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((h) => (
                    <div key={h.batch_id} className="border border-border-light rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate">{h.nama_file ?? h.batch_id.slice(0, 8) + "..."}</p>
                          <p className="text-xs text-text-secondary mt-0.5">
                            {h.oleh} · {h.ip_address} · {new Date(h.created_at).toLocaleString("id-ID")}
                          </p>
                          <div className="flex gap-3 mt-1.5 text-[11px]">
                            <span className="text-success">+{h.jumlah_insert ?? 0} baru</span>
                            <span className="text-info">~{h.jumlah_update ?? 0} update</span>
                            <span className="text-text-secondary">⟳{h.jumlah_skip ?? 0} skip</span>
                            {(h.jumlah_gagal ?? 0) > 0 && <span className="text-danger">✗{h.jumlah_gagal} gagal</span>}
                            <span className="text-text-tertiary">{h.durasi_detik}s</span>
                          </div>
                        </div>
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          h.status === "done" ? "bg-success/10 text-success" :
                          h.status === "failed" ? "bg-danger/10 text-danger" :
                          "bg-warning/10 text-warning"
                        }`}>{h.status.toUpperCase()}</span>
                      </div>
                      {h.status === "done" && h.jumlah_gagal > 0 && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await api.get(`/operator/master-data/guru/import-error-report/${h.batch_id}`, { responseType: "blob" });
                              const url = URL.createObjectURL(res.data);
                              const a = document.createElement("a"); a.href = url; a.download = `error_${h.batch_id.slice(0,8)}.xlsx`; a.click();
                            } catch { toast.error("Gagal unduh laporan."); }
                          }}
                          className="mt-2 text-[11px] text-danger hover:underline flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[13px]">download</span>
                          Download laporan error
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STEP: TYPE ── */}
          {!showHistory && step === "type" && (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary mb-4">Pilih metode import yang sesuai dengan data kamu:</p>
              {[
                { id: "excel", icon: "table_view", iconBg: "bg-primary/10", iconColor: "text-primary",
                  title: "Import Excel (Multi-Sheet)", desc: "Upload file .xlsx dengan format template. Mendukung Data Utama + Keluarga, Pendidikan, Sertifikasi, Diklat, dll dalam satu file.", badge: "RECOMMENDED" },
                { id: "zip", icon: "folder_zip", iconBg: "bg-warning/10", iconColor: "text-warning",
                  title: "Import ZIP (Excel + Foto + Dokumen)", desc: "Upload .zip berisi guru.xlsx, folder foto/, ijazah/, ktp/, kk/, sertifikat/, sk/, dll. Sistem akan membaca Excel terlebih dahulu lalu mencocokkan file.", badge: "ENTERPRISE" },
                { id: "foto", icon: "image", iconBg: "bg-info/10", iconColor: "text-info",
                  title: "Import Foto & Dokumen (ZIP)", desc: "Upload .zip berisi foto profil dan file dokumen saja. Data guru harus sudah ada di database.", badge: null },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setImportType(opt.id); setStep("upload"); }}
                  className="w-full text-left flex items-start gap-4 p-4 border border-border-light rounded-xl hover:border-primary/40 hover:bg-surface-container-low transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl ${opt.iconBg} flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined ${opt.iconColor} text-[22px]`}>{opt.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">{opt.title}</p>
                      {opt.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{opt.badge}</span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">{opt.desc}</p>
                  </div>
                  <span className="material-symbols-outlined text-text-secondary text-[18px] shrink-0 mt-1">chevron_right</span>
                </button>
              ))}
            </div>
          )}

          {/* ── STEP: UPLOAD ── */}
          {!showHistory && step === "upload" && (
            <div className="space-y-4">
              <button onClick={() => setStep("type")} className="text-xs text-primary hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">arrow_back</span> Ganti tipe import
              </button>

              {importType === "excel" && (
                <div className="flex items-start gap-3 p-3 bg-info/5 border border-info/20 rounded-xl">
                  <span className="material-symbols-outlined text-info text-[18px] shrink-0 mt-0.5">info</span>
                  <div className="text-xs text-text-secondary leading-relaxed">
                    Upload <strong>.xlsx</strong> sesuai template multi-sheet. Kolom bisa berbeda nama — mapping akan dilakukan otomatis, dan kamu bisa koreksi sebelum import.
                    <button onClick={downloadTemplate} className="block mt-1.5 text-primary font-semibold hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">download</span> Unduh Template Excel
                    </button>
                  </div>
                </div>
              )}

              {importType === "zip" && (
                <div className="flex items-start gap-3 p-3 bg-warning/5 border border-warning/20 rounded-xl">
                  <span className="material-symbols-outlined text-warning text-[18px] shrink-0 mt-0.5">folder_zip</span>
                  <div className="text-xs text-text-secondary leading-relaxed space-y-1">
                    <p>Upload <strong>.zip</strong> berisi <code className="bg-surface-container px-1 rounded">guru.xlsx</code> di dalamnya + folder media:</p>
                    <div className="bg-surface-container rounded-lg p-2 font-mono text-[10px] leading-5">
                      <div>📁 guru.zip</div>
                      <div className="pl-3">📄 guru.xlsx <span className="text-text-tertiary">(wajib — acuan utama)</span></div>
                      <div className="pl-3">📁 foto/ <span className="text-text-tertiary">atau</span> foto-guru/</div>
                      <div className="pl-3">📁 ijazah/ <span className="text-text-tertiary">atau</span> file-ijazah/</div>
                      <div className="pl-3">📁 ktp/ · 📁 kk/ · 📁 sertifikat/ · 📁 sk/ · 📁 transkrip/</div>
                    </div>
                    <p>Nama file: <code className="bg-surface-container px-1 rounded">NUPTK.ext</code> (foto) atau <code className="bg-surface-container px-1 rounded">NUPTK_id.ext</code> (dokumen)</p>
                  </div>
                </div>
              )}

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragging ? "border-primary bg-primary/5" : file ? "border-success/40 bg-success/5" : "border-border-light hover:border-primary/40 hover:bg-surface-container-low"}`}
              >
                <input ref={fileRef} type="file"
                  accept={importType === "excel" ? ".xlsx,.xls" : ".zip"}
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0])}
                />
                {file ? (
                  <>
                    <span className="material-symbols-outlined text-success text-[36px]">{importType === "excel" ? "table_view" : "folder_zip"}</span>
                    <p className="text-sm font-semibold text-text-primary mt-2">{file.name}</p>
                    <p className="text-xs text-text-secondary mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-2 text-xs text-danger hover:underline">Ganti file</button>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-text-secondary text-[36px]">{importType === "excel" ? "table_view" : "folder_zip"}</span>
                    <p className="text-sm font-semibold text-text-primary mt-2">Drag & drop file di sini</p>
                    <p className="text-xs text-text-secondary mt-1">atau klik untuk pilih file</p>
                    <p className="text-[10px] text-text-secondary mt-1 opacity-70">
                      {importType === "excel" ? ".xlsx — Maks 20 MB" : ".zip — Maks 100 MB"}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── STEP: PREVIEW ── */}
          {!showHistory && step === "preview" && preview && (
            <div className="space-y-4">
              {/* Statistik */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-container rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-text-primary">{preview.total_baris?.toLocaleString()}</p>
                  <p className="text-xs text-text-secondary mt-0.5">Total Baris</p>
                </div>
                <div className="bg-success/5 border border-success/20 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-success">{preview.sheets?.length ?? 1}</p>
                  <p className="text-xs text-text-secondary mt-0.5">Sheet Ditemukan</p>
                </div>
                <div className="bg-warning/5 border border-warning/20 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-warning">
                    {Object.values(preview.dup_stats ?? {}).reduce((a, b) => a + b, 0)}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">Potensi Duplikat (sample)</p>
                </div>
              </div>

              {/* Mapping Kolom */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-text-primary">Mapping Kolom</h4>
                  <span className="text-xs text-text-secondary">{Object.keys(mapping).filter(k => mapping[k]).length}/{preview.headers?.length} kolom dipetakan</span>
                </div>
                <div className="border border-border-light rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-surface-container sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-text-secondary font-semibold">Kolom di File Kamu</th>
                        <th className="px-3 py-2 text-left text-text-secondary font-semibold">→ Kolom Database</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(preview.headers ?? []).map((h) => (
                        <tr key={h} className="border-t border-border-light">
                          <td className="px-3 py-1.5 text-text-primary font-mono">{h}</td>
                          <td className="px-3 py-1.5">
                            <select
                              value={mapping[h] ?? ""}
                              onChange={(e) => setMapping(prev => ({ ...prev, [h]: e.target.value || undefined }))}
                              className="w-full text-xs border border-border-light rounded-lg px-2 py-1 bg-surface-container-lowest focus:outline-none focus:border-primary"
                            >
                              <option value="">(abaikan kolom ini)</option>
                              {(preview.db_fields ?? []).map(f => (
                                <option key={f} value={f}>{DB_FIELD_LABELS[f] ?? f}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sample Data */}
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2">Preview Data (5 Baris Pertama)</h4>
                <div className="border border-border-light rounded-xl overflow-auto max-h-40">
                  <table className="w-full text-[11px] whitespace-nowrap">
                    <thead className="bg-surface-container">
                      <tr>
                        {(preview.headers ?? []).map((h, i) => (
                          <th key={i} className="px-2 py-1.5 text-left text-text-secondary font-semibold border-r border-border-light last:border-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(preview.sample_rows ?? []).map((row, ri) => (
                        <tr key={ri} className={`border-t border-border-light ${ri % 2 === 0 ? "" : "bg-surface-container-low"}`}>
                          {row.map((cell, ci) => (
                            <td key={ci} className="px-2 py-1 text-text-primary border-r border-border-light last:border-0 max-w-[120px] truncate">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: CONFIRM ── */}
          {!showHistory && step === "confirm" && (
            <div className="space-y-4">
              <div className="p-4 bg-surface-container rounded-xl space-y-3">
                <h4 className="text-sm font-semibold text-text-primary">Pengaturan Import</h4>

                {/* Mode Duplikat */}
                <div>
                  <p className="text-xs text-text-secondary mb-2 font-medium">Jika data sudah ada (deteksi via NUPTK → NIP → NIK → Email):</p>
                  <div className="space-y-2">
                    {[
                      { id: "replace", label: "Replace", desc: "Timpa semua field dengan data dari file", icon: "sync" },
                      { id: "merge", label: "Merge", desc: "Update hanya field yang tidak kosong di file", icon: "merge" },
                      { id: "skip", label: "Skip", desc: "Lewati — jangan ubah data yang sudah ada", icon: "skip_next" },
                    ].map((m) => (
                      <label key={m.id} className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${modeDuplikat === m.id ? "border-primary bg-primary/5" : "border-border-light hover:border-primary/30"}`}>
                        <input type="radio" name="mode_duplikat" value={m.id} checked={modeDuplikat === m.id} onChange={() => setModeDuplikat(m.id)} className="mt-0.5 accent-primary" />
                        <div>
                          <p className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-primary">{m.icon}</span>
                            {m.label}
                          </p>
                          <p className="text-xs text-text-secondary mt-0.5">{m.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ringkasan */}
              <div className="flex items-start gap-3 p-3 bg-warning/5 border border-warning/20 rounded-xl">
                <span className="material-symbols-outlined text-warning text-[18px] shrink-0 mt-0.5">warning</span>
                <div className="text-xs text-text-secondary leading-relaxed">
                  <p className="font-semibold text-text-primary">Siap Import</p>
                  <p className="mt-1">
                    {importType === "excel" && <>File: <strong>{file?.name}</strong> · {preview?.total_baris?.toLocaleString()} baris · Mode: <strong>{modeDuplikat}</strong></>}
                    {importType === "zip" && <>File: <strong>{file?.name}</strong> · Mode: <strong>{modeDuplikat}</strong> · Foto & dokumen akan dicocokkan otomatis dengan data Excel di dalam ZIP.</>}
                  </p>
                  <p className="mt-1 text-warning">Proses ini tidak bisa dibatalkan setelah dimulai. Pastikan data sudah benar.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: PROGRESS ── */}
          {!showHistory && step === "progress" && (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <span className="material-symbols-outlined text-primary text-[48px] animate-spin">progress_activity</span>
                <p className="text-sm font-semibold text-text-primary mt-3">Sedang Memproses...</p>
                <p className="text-xs text-text-secondary mt-1">Jangan tutup halaman ini</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Progress</span>
                  <span>{progress?.progress_persen ?? 0}%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress?.progress_persen ?? 0}%` }}
                  />
                </div>
              </div>

              {/* Stats realtime */}
              {progress && (
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Total", val: progress.total_baris ?? "-", color: "text-text-primary" },
                    { label: "Berhasil", val: (progress.jumlah_insert ?? 0) + (progress.jumlah_update ?? 0), color: "text-success" },
                    { label: "Skip", val: progress.jumlah_skip ?? 0, color: "text-text-secondary" },
                    { label: "Gagal", val: progress.jumlah_gagal ?? 0, color: "text-danger" },
                  ].map((s) => (
                    <div key={s.label} className="bg-surface-container rounded-xl p-3 text-center">
                      <p className={`text-xl font-bold ${s.color}`}>{s.val?.toLocaleString()}</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STEP: DONE ── */}
          {!showHistory && step === "done" && progress && (
            <div className="space-y-4 py-2">
              {/* Header status */}
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${progress.status === "done" ? "bg-success/5 border-success/20" : "bg-danger/5 border-danger/20"}`}>
                <span className={`material-symbols-outlined text-[32px] ${progress.status === "done" ? "text-success" : "text-danger"}`}>
                  {progress.status === "done" ? "check_circle" : "error"}
                </span>
                <div>
                  <p className={`font-bold ${progress.status === "done" ? "text-success" : "text-danger"}`}>
                    {progress.status === "done" ? "Import Berhasil!" : "Import Selesai dengan Error"}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Durasi: {progress.durasi_detik ?? "–"}s
                  </p>
                </div>
              </div>

              {/* Statistik */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Total", val: progress.total_baris ?? 0, color: "text-text-primary", bg: "bg-surface-container" },
                  { label: "Baru", val: progress.jumlah_insert ?? 0, color: "text-success", bg: "bg-success/5" },
                  { label: "Update", val: progress.jumlah_update ?? 0, color: "text-info", bg: "bg-info/5" },
                  { label: "Skip", val: progress.jumlah_skip ?? 0, color: "text-text-secondary", bg: "bg-surface-container" },
                  { label: "Gagal", val: progress.jumlah_gagal ?? 0, color: "text-danger", bg: progress.jumlah_gagal > 0 ? "bg-danger/5" : "bg-surface-container" },
                ].map((s) => (
                  <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                    <p className={`text-xl font-bold ${s.color}`}>{s.val?.toLocaleString()}</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Relasi per sheet */}
              {progress.statistik_relasi && Object.keys(progress.statistik_relasi).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-secondary mb-2">Relasi yang diimport:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(progress.statistik_relasi).filter(([,v]) => typeof v === "number" && v > 0).map(([k, v]) => (
                      <span key={k} className="text-[11px] px-2 py-1 bg-surface-container rounded-lg text-text-secondary">
                        {k}: <strong className="text-text-primary">{v}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Error list */}
              {progress.error_detail?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-danger">{progress.error_detail.length} error ditemukan:</p>
                    {batchId && (
                      <button onClick={downloadErrorReport} className="text-[11px] text-primary hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">download</span>
                        Download Laporan Error
                      </button>
                    )}
                  </div>
                  <ul className="space-y-1 max-h-32 overflow-y-auto">
                    {progress.error_detail.slice(0, 20).map((e, i) => (
                      <li key={i} className="text-xs text-danger/80 flex gap-1">
                        <span className="shrink-0">•</span>
                        {typeof e === "string" ? e : (e.pesan ?? JSON.stringify(e))}
                      </li>
                    ))}
                    {progress.error_detail.length > 20 && (
                      <li className="text-xs text-text-secondary">... dan {progress.error_detail.length - 20} error lainnya. Download laporan untuk detail lengkap.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-border-light shrink-0">
          <button onClick={handleClose} className="px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface-container text-sm font-medium transition-colors">
            {step === "done" ? "Tutup" : "Batal"}
          </button>

          <div className="flex gap-2">
            {step === "upload" && !showHistory && (
              <button
                onClick={handleUploadPreview}
                disabled={!file || loading}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-on-primary-fixed-variant disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {loading ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Memproses...</> :
                  <><span className="material-symbols-outlined text-[16px]">arrow_forward</span> {importType === "foto" ? "Upload & Proses" : "Lanjut: Preview"}</>}
              </button>
            )}

            {step === "preview" && !showHistory && (
              <button
                onClick={() => setStep("confirm")}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-on-primary-fixed-variant flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span> Lanjut: Konfirmasi
              </button>
            )}

            {step === "confirm" && !showHistory && (
              <button
                onClick={handleExecute}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-on-primary-fixed-variant disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {loading ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Memulai...</> :
                  <><span className="material-symbols-outlined text-[16px]">upload</span> Mulai Import</>}
              </button>
            )}

            {step === "done" && !showHistory && (
              <button
                onClick={reset}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-on-primary-fixed-variant flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span> Import Lagi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal Export ──────────────────────────────────────────────────────────────
function ModalExport({ open, onClose, filters, selected }) {
  const [loading, setLoading] = useState(null); // null | "excel" | "backup"

  const doExport = async (type) => {
    setLoading(type);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.jenis_ptk) params.append("jenis_ptk", filters.jenis_ptk);
      if (filters.status_keaktifan)
        params.append("status_keaktifan", filters.status_keaktifan);
      if (selected.size > 0)
        [...selected].forEach((nuptk) => params.append("nuptks[]", nuptk));

      const endpoint =
        type === "backup"
          ? "/operator/master-data/guru/backup"
          : "/operator/master-data/guru/export";

      const res = await api.get(`${endpoint}?${params.toString()}`, {
        responseType: "blob",
      });

      const contentDisp = res.headers["content-disposition"] ?? "";
      const match = contentDisp.match(/filename="?([^";\r\n]+)"?/);
      const filename =
        match?.[1] ??
        (type === "backup" ? "backup_guru.zip" : "data_guru.xlsx");

      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(
        `${type === "backup" ? "Backup" : "Export"} berhasil diunduh.`,
      );
      onClose();
    } catch {
      toast.error("Gagal mengunduh. Coba lagi.");
    } finally {
      setLoading(null);
    }
  };

  if (!open) return null;

  const options = [
    {
      id: "excel",
      icon: "table_view",
      iconBg: "bg-success/10",
      iconColor: "text-success",
      title: "Export Excel",
      desc:
        selected.size > 0
          ? `${selected.size} guru yang dipilih`
          : filters.search || filters.jenis_ptk || filters.status_keaktifan
            ? "Sesuai filter aktif"
            : "Semua guru",
      sub: "Multi-sheet .xlsx — Data Utama, Keluarga, Rekening, Pendidikan, Sertifikasi, Diklat, Jabatan, dll.",
      badge: null,
    },
    {
      id: "backup",
      icon: "folder_zip",
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      title: "Backup Lengkap",
      desc: "Semua guru + foto profil",
      sub: "Format .zip — berisi data Excel & semua foto guru",
      badge: "RECOMMENDED",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md border border-border-light animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">
                download
              </span>
            </div>
            <div>
              <h3
                className="font-bold text-text-primary text-base"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Export & Backup
              </h3>
              <p className="text-xs text-text-secondary">
                Pilih format yang diinginkan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">
          {selected.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary font-medium">
              <span className="material-symbols-outlined text-[15px]">
                check_circle
              </span>
              {selected.size} guru dipilih — export akan terbatas ke guru ini
            </div>
          )}

          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => doExport(opt.id)}
              disabled={loading !== null}
              className="w-full flex items-center gap-4 p-4 bg-surface-container-low border border-border-light rounded-xl hover:border-primary/30 hover:bg-surface-container transition-all text-left disabled:opacity-60 group"
            >
              <div
                className={`w-12 h-12 rounded-xl ${opt.iconBg} flex items-center justify-center shrink-0`}
              >
                {loading === opt.id ? (
                  <span className="material-symbols-outlined animate-spin text-[22px] text-text-secondary">
                    progress_activity
                  </span>
                ) : (
                  <span
                    className={`material-symbols-outlined text-[22px] ${opt.iconColor}`}
                  >
                    {opt.icon}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-text-primary">
                    {opt.title}
                  </p>
                  {opt.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-warning/10 text-warning rounded-full border border-warning/20">
                      {opt.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-primary mt-0.5">
                  {opt.desc}
                </p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  {opt.sub}
                </p>
              </div>
              <span className="material-symbols-outlined text-text-secondary text-[18px] group-hover:text-primary transition-colors shrink-0">
                arrow_forward
              </span>
            </button>
          ))}

          <p className="text-[10px] text-text-secondary text-center pt-1">
            Backup direkomendasikan secara berkala sebagai cadangan data
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Modal Perhatian Data ──────────────────────────────────────────────────────
function ModalPerhatianData({
  open,
  onClose,
  filterField,
  perhatianItems,
  navigate,
}) {
  const defaultField = filterField ?? perhatianItems[0]?.field ?? null;
  const [activeField, setActiveField] = useState(defaultField);

  useEffect(() => {
    setActiveField(filterField ?? perhatianItems[0]?.field ?? null);
  }, [filterField, perhatianItems]);
  const { data, isLoading } = useQuery({
    queryKey: ["guru-perhatian-detail", activeField],
    queryFn: () =>
      api
        .get("/operator/master-data/guru/perhatian-detail", {
          params: { field: activeField },
        })
        .then((r) => r.data.data),
    enabled: open,
  });

  if (!open) return null;

  const activeItem =
    perhatianItems.find((i) => i.field === activeField) ?? perhatianItems[0];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 transition-all duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-border-light/80 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center border border-warning/10">
              <span className="material-symbols-outlined text-warning text-[22px]">
                warning
              </span>
            </div>
            <div>
              <h3 className="text-section-title font-bold text-on-surface">
                Kelengkapan Data Guru
              </h3>
              <p className="text-xs text-text-secondary">
                Daftar guru yang datanya belum lengkap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab filter kategori */}
        <div className="flex gap-2 px-6 pt-4 pb-2 overflow-x-auto shrink-0">
          {perhatianItems.map((item) => (
            <button
              key={item.field}
              onClick={() => setActiveField(item.field)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                activeField === item.field
                  ? "bg-warning text-white border-warning"
                  : "bg-surface-container-low text-text-secondary border-border-light hover:border-warning/50"
              }`}
            >
              {item.label}
              <span
                className={`inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold ${
                  activeField === item.field
                    ? "bg-white/30 text-white"
                    : "bg-warning/20 text-warning"
                }`}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {/* List guru */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-text-secondary">
              <span className="material-symbols-outlined animate-spin text-[20px]">
                progress_activity
              </span>
              <span className="text-sm">Memuat data...</span>
            </div>
          ) : !data?.length ? (
            <p className="text-center text-sm text-text-secondary py-12">
              Tidak ada guru yang perlu dilengkapi 🎉
            </p>
          ) : (
            <div className="space-y-2 mt-2">
              {data.map((guru) => (
                <div
                  key={guru.nuptk}
                  className="flex items-center justify-between p-3 rounded-xl border border-border-light bg-surface-container-lowest hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {guru.nama?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">
                        {guru.nama_lengkap ?? guru.nama}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {guru.nuptk} · {guru.jenis_ptk ?? "-"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/operator/master/guru/edit/${guru.nuptk}`);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      edit
                    </span>
                    Lengkapi
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
