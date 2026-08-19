import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

// ── Global CSS ────────────────────────────────────────────────────────────────
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .ds-font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
  .ds-font-body    { font-family: 'Inter', sans-serif; }
  .ds-font-serif   { font-family: 'EB Garamond', serif; }
  .ds-blob-bg { position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:-1; pointer-events:none; overflow:hidden; }
  .ds-blob { position:absolute; border-radius:50%; filter:blur(120px); opacity:0.05; }
  .ds-blob-1 { top:-10%; right:-5%; width:600px; height:600px; background-color:#006e2a; }
  .ds-blob-2 { bottom:-10%; left:-10%; width:800px; height:800px; background-color:#ffdeac; }
  .ds-glass { background:rgba(255,255,255,0.7); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.4); box-shadow:0 4px 24px rgba(0,52,43,0.05); }
  .ds-progress-shimmer { position:relative; overflow:hidden; }
  .ds-progress-shimmer::after { content:""; position:absolute; top:0; left:0; bottom:0; right:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent); animation:ds-shimmer 2s infinite; }
  @keyframes ds-shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
  .ds-pulse-dot { animation:ds-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
  @keyframes ds-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
  .ds-icon-fill { font-variation-settings:'FILL' 1; }
  .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
  .ds-shine { position:relative; overflow:hidden; }
  .ds-shine::before { content:""; position:absolute; inset:0; background:linear-gradient(to right,transparent,rgba(255,255,255,0.2),transparent); transform:translateX(-150%); transition:transform 1s ease-out; pointer-events:none; }
  .ds-shine:hover::before { transform:translateX(150%); }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(str) {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function fmtShort(str) {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}
function daysBetween(a, b) {
  if (!a || !b) return null;
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
}
function daysRemaining(end) {
  if (!end) return null;
  return Math.round((new Date(end) - new Date()) / 86400000);
}
function calcProgress(start, end) {
  if (!start || !end) return 0;
  const total = daysBetween(start, end);
  if (!total) return 0;
  const rem = daysRemaining(end) ?? 0;
  const elapsed = total - rem;
  return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
}
function weeksBetween(a, b) {
  const d = daysBetween(a, b);
  return d != null ? Math.floor(d / 7) : null;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return (
    <div className={"animate-pulse bg-gray-200 rounded-2xl " + className} />
  );
}
function SkeletonPage() {
  return (
    <div className="space-y-8 pb-16">
      <Skeleton className="h-52 rounded-[2.5rem]" />
      <Skeleton className="h-72 rounded-[2.5rem]" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Skeleton className="md:col-span-4 h-40 rounded-3xl" />
        <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      </div>
      <Skeleton className="h-80 rounded-[2.5rem]" />
    </div>
  );
}

// ── Modal Edit Semester ───────────────────────────────────────────────────────
function ModalEditSemester({
  open,
  semester,
  tahunAjaran,
  tahunAjaranId,
  onClose,
  queryClient,
}) {
  const [form, setForm] = useState({ tgl_mulai: "", tgl_selesai: "" });
  useEffect(() => {
    if (open && semester) {
      setForm({
        tgl_mulai: semester.tgl_mulai ? semester.tgl_mulai.slice(0, 10) : "",
        tgl_selesai: semester.tgl_selesai
          ? semester.tgl_selesai.slice(0, 10)
          : "",
      });
    }
  }, [open, semester]);
  const namaSem = semester?.nama?.toLowerCase() ?? "ganjil";
  const mut = useMutation({
    mutationFn: () =>
      api.put("/operator/master-data/tahun-ajaran/" + tahunAjaranId, {
        tahun: tahunAjaran?.tahun,
        is_active: tahunAjaran?.is_active ?? false,
        buat_semester: true,
        ["semester_" + namaSem + "_mulai"]: form.tgl_mulai || null,
        ["semester_" + namaSem + "_selesai"]: form.tgl_selesai || null,
        ...(tahunAjaran?.is_active && semester?.is_active
          ? { semester_aktif: semester.nama }
          : {}),
      }),
    onSuccess: () => {
      toast.success("Semester berhasil diperbarui.");
      queryClient.invalidateQueries(["detail-semester"]);
      queryClient.invalidateQueries(["detail-tahun-ajaran"]);
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
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#006e2a] text-[20px]">
              edit_calendar
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 ds-font-display">
              Edit Semester {semester?.nama}
            </h2>
            <p className="text-xs text-gray-500">
              Ubah tanggal mulai & selesai
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={form.tgl_mulai}
              onChange={(e) =>
                setForm((p) => ({ ...p, tgl_mulai: e.target.value }))
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Tanggal Selesai
            </label>
            <input
              type="date"
              value={form.tgl_selesai}
              onChange={(e) =>
                setForm((p) => ({ ...p, tgl_selesai: e.target.value }))
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700/30"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className="flex-1 py-2.5 bg-[#004d40] text-white rounded-xl text-sm font-semibold hover:bg-[#00342b] transition-colors disabled:opacity-60"
          >
            {mut.isPending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Kalender Item ─────────────────────────────────────────────────────────────
function KalenderItem({ item }) {
  const colorMap = {
    libur: {
      bg: "bg-red-100",
      dot: "bg-red-500",
      text: "text-red-600",
      badge: "bg-red-50/80",
    },
    pts: {
      bg: "bg-green-100",
      dot: "bg-[#006e2a]",
      text: "text-[#006e2a]",
      badge: "bg-green-50/80",
    },
    pas: {
      bg: "bg-amber-100",
      dot: "bg-amber-500",
      text: "text-amber-700",
      badge: "bg-amber-50/80",
    },
    ph: {
      bg: "bg-blue-100",
      dot: "bg-blue-500",
      text: "text-blue-700",
      badge: "bg-blue-50/80",
    },
    kegiatan: {
      bg: "bg-purple-100",
      dot: "bg-purple-500",
      text: "text-purple-700",
      badge: "bg-purple-50/80",
    },
  };
  const jenis = item.jenis?.toLowerCase();
  const c = colorMap[jenis] ?? {
    bg: "bg-gray-100",
    dot: "bg-gray-400",
    text: "text-gray-600",
    badge: "bg-gray-50",
  };
  const isUpcoming =
    item.tanggal_mulai && new Date(item.tanggal_mulai) > new Date();
  return (
    <div className="group/item relative flex gap-6 pl-1 hover:bg-white/50 hover:translate-x-1 p-2 -ml-2 rounded-xl transition-all duration-300">
      <div
        className={
          "relative z-10 flex-shrink-0 w-10 h-10 rounded-xl " +
          c.bg +
          " flex items-center justify-center shadow-sm group-hover/item:scale-110 group-hover/item:shadow-md transition-all duration-300"
        }
      >
        <span
          className={
            "w-2.5 h-2.5 rounded-full " +
            c.dot +
            (isUpcoming ? " ds-pulse-dot" : "")
          }
        />
      </div>
      <div className="flex flex-col gap-1 justify-center">
        <span
          className={
            "text-[10px] font-bold " +
            c.text +
            " uppercase tracking-[0.15em] " +
            c.badge +
            " px-2 py-0.5 rounded-full w-fit border border-current/10"
          }
        >
          {fmtShort(item.tanggal_mulai)}
          {item.tanggal_selesai && item.tanggal_selesai !== item.tanggal_mulai
            ? " – " + fmtShort(item.tanggal_selesai)
            : ""}
        </span>
        <h4 className="text-base font-bold text-[#00342b] ds-font-display">
          {item.judul}
        </h4>
        {item.is_nasional && (
          <span className="text-[10px] text-red-500 font-semibold uppercase">
            Nasional
          </span>
        )}
      </div>
    </div>
  );
}

// ── Alert Badge ───────────────────────────────────────────────────────────────
function AlertBadge({ level }) {
  const map = {
    tinggi: "bg-red-600 text-white",
    sedang: "bg-amber-500 text-white",
    rendah: "bg-gray-500 text-white",
  };
  return (
    <span
      className={
        "px-2 py-0.5 text-[10px] font-bold rounded uppercase " +
        (map[level] ?? map.rendah)
      }
    >
      {level}
    </span>
  );
}

// ── Circular Progress ─────────────────────────────────────────────────────────
function CircularProgress({
  value = 0,
  size = 96,
  stroke = 3.5,
  colorClass = "text-[#006e2a]",
}) {
  const r = 16;
  const dash = Math.round((value / 100) * 100);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <circle
          className="text-gray-200"
          cx="18"
          cy="18"
          fill="none"
          r={r}
          stroke="currentColor"
          strokeWidth={stroke}
        />
        <circle
          className={colorClass}
          cx="18"
          cy="18"
          fill="none"
          r={r}
          stroke="currentColor"
          strokeDasharray={dash + ", 100"}
          strokeLinecap="round"
          strokeWidth={stroke}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-black text-[#00342b] ds-font-display"
          style={{ fontSize: size * 0.22 }}
        >
          {value}%
        </span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DetailSemester() {
  const { taId, semesterNama } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["detail-semester", taId, semesterNama],
    queryFn: () =>
      api.get("/operator/master-data/tahun-ajaran/" + taId).then((r) => r.data),
    enabled: !!taId,
  });

  const setSemAktif = useMutation({
    mutationFn: () =>
      api.patch(
        "/operator/master-data/tahun-ajaran/" + taId + "/semester-aktif",
        { semester_nama: semesterNama },
      ),
    onSuccess: () => {
      toast.success("Semester " + semesterNama + " berhasil diaktifkan.");
      queryClient.invalidateQueries(["detail-semester", taId]);
      queryClient.invalidateQueries(["detail-tahun-ajaran", taId]);
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message ?? "Gagal mengaktifkan semester.",
      ),
  });

  if (isLoading)
    return (
      <div className="px-4 md:px-8 pb-16">
        <style>{GLOBAL_STYLE}</style>
        <div className="ds-blob-bg">
          <div className="ds-blob ds-blob-1" />
          <div className="ds-blob ds-blob-2" />
        </div>
        <SkeletonPage />
      </div>
    );

  if (isError || !data?.data)
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-gray-500">
        <span className="material-symbols-outlined text-[56px] text-gray-300">
          calendar_today
        </span>
        <p className="font-medium text-gray-900 ds-font-display">
          Data tidak ditemukan.
        </p>
        <button
          onClick={() => navigate("/operator/master/tahun-ajaran")}
          className="text-[#006e2a] text-sm hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>{" "}
          Kembali
        </button>
      </div>
    );

  const ta = data.data;
  const semesters = ta.semesters ?? [];
  const semester = semesters.find(
    (s) => s.nama?.toLowerCase() === semesterNama?.toLowerCase(),
  );

  if (!semester)
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-gray-500">
        <span className="material-symbols-outlined text-[56px] text-gray-300">
          event_busy
        </span>
        <p className="font-medium text-gray-900 ds-font-display">
          Semester "{semesterNama}" tidak ditemukan.
        </p>
        <button
          onClick={() => navigate("/operator/master/tahun-ajaran/" + taId)}
          className="text-[#006e2a] text-sm hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>{" "}
          Kembali ke Tahun Ajaran
        </button>
      </div>
    );

  const kelasList = data.kelas ?? [];
  const kalenderAll = data.kalender ?? [];
  const aktivitas = data.aktivitas ?? [];
  const checklist = data.checklist ?? {};
  const tglMulai = semester.tgl_mulai;
  const tglSelesai = semester.tgl_selesai;

  const kalender = kalenderAll.filter((k) => {
    if (!tglMulai || !k.tanggal_mulai) return true;
    const tgl = new Date(k.tanggal_mulai);
    const start = new Date(tglMulai);
    const end = tglSelesai ? new Date(tglSelesai) : null;
    return tgl >= start && (end == null || tgl <= end);
  });

  const progress = calcProgress(tglMulai, tglSelesai);
  const totalHari = daysBetween(tglMulai, tglSelesai);
  const hariSisa = Math.max(0, daysRemaining(tglSelesai) ?? 0);
  const hariBerjalan =
    totalHari != null ? Math.max(0, totalHari - hariSisa) : null;
  const totalMinggu = weeksBetween(tglMulai, tglSelesai);
  const isAktif = semester.is_active;
  const isTaAktif = ta.is_active;

  const checkValues = Object.values(checklist);
  const healthScore = checkValues.length
    ? Math.round(
        (checkValues.filter(Boolean).length / checkValues.length) * 100,
      )
    : 0;

  const alerts = [
    !checklist.jadwal_selesai && {
      msg: "Jadwal pelajaran belum lengkap",
      level: "tinggi",
    },
    !checklist.siswa_terdistribusi && {
      msg: "Siswa belum terdistribusi ke kelas",
      level: "tinggi",
    },
    !checklist.wali_kelas && {
      msg: "Wali kelas belum ditetapkan",
      level: "sedang",
    },
    !checklist.mapel_lengkap && {
      msg: "Mata pelajaran belum diisi",
      level: "sedang",
    },
    !checklist.kalender && {
      msg: "Kalender akademik masih kosong",
      level: "rendah",
    },
    !checklist.kepsek_dikunci && {
      msg: "Profil kepala sekolah belum diisi",
      level: "rendah",
    },
  ].filter(Boolean);

  const kelasFilter = kelasList.filter(
    (k) =>
      k.semester?.toLowerCase() === semesterNama?.toLowerCase() ||
      !k.semester ||
      k.semester === "-",
  );
  const totalSiswa = kelasFilter.reduce((s, k) => s + (k.total_siswa ?? 0), 0);
  const totalKelas = kelasFilter.length;
  const semLain = semesters.find((s) => s.nama !== semester.nama);
  const statusLabel =
    progress >= 100 ? "Selesai" : progress > 0 ? "On Track" : "Belum Mulai";

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div className="ds-blob-bg">
        <div className="ds-blob ds-blob-1" />
        <div className="ds-blob ds-blob-2" />
      </div>
      <ModalEditSemester
        open={showEditModal}
        semester={semester}
        tahunAjaran={ta}
        tahunAjaranId={taId}
        onClose={() => setShowEditModal(false)}
        queryClient={queryClient}
      />

      <div className="w-full space-y-10 pb-16 ds-font-body">
        {/* ═══ SECTION 1: HEADER ═══ */}
        <section className="relative">
          {/* Title bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white/40 backdrop-blur-lg p-6 md:p-8 rounded-[2.5rem] border border-white/20 shadow-xl overflow-hidden mb-8 relative">
            <div className="absolute -left-8 -top-5 w-32 h-32 bg-green-100/30 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-2 max-w-2xl w-full">
              <nav className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap mb-1">
                <Link
                  to="/operator/master/tahun-ajaran"
                  className="hover:text-[#006e2a] transition-colors"
                >
                  Tahun Ajaran
                </Link>
                <span className="material-symbols-outlined text-[12px]">
                  chevron_right
                </span>
                <Link
                  to={"/operator/master/tahun-ajaran/" + taId}
                  className="hover:text-[#006e2a] transition-colors"
                >
                  {ta.tahun}
                </Link>
                <span className="material-symbols-outlined text-[12px]">
                  chevron_right
                </span>
                <span className="text-gray-800">Semester {semester.nama}</span>
              </nav>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                {isAktif ? (
                  <span className="inline-flex items-center gap-2 bg-[#006e2a]/10 px-4 py-1.5 rounded-full border border-[#006e2a]/20 text-[10px] font-bold text-[#006e2a] tracking-widest uppercase shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#006e2a] ds-pulse-dot" />
                    AKTIF
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200 text-[10px] font-bold text-gray-500 tracking-widest uppercase">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    TIDAK AKTIF
                  </span>
                )}
                <div className="h-4 w-px bg-gray-200" />
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                  <span className="material-symbols-outlined text-[18px] text-[#00342b]/40">
                    event_available
                  </span>
                  {fmt(tglMulai)} — {fmt(tglSelesai)}
                </div>
              </div>
              <h1 className="ds-font-display font-extrabold text-[#00342b] tracking-tight leading-[1.1] text-3xl sm:text-4xl md:text-[40px] lg:text-[56px]">
                {ta.tahun}{" "}
                <span className="ds-font-serif italic font-normal text-[#006e2a]/80 ml-1 text-2xl sm:text-3xl md:text-[32px] lg:text-[40px]">
                  — Semester {semester.nama}
                </span>
              </h1>
            </div>
            <div className="relative z-10 flex items-center gap-2 md:gap-3 flex-wrap shrink-0">
              <button
                onClick={() => navigate("/operator/master/tahun-ajaran")}
                className="px-4 py-2.5 bg-white/80 backdrop-blur-md border border-gray-200/60 hover:bg-gray-50 text-[#00342b] rounded-full font-medium text-xs flex items-center gap-2 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">
                  arrow_back
                </span>{" "}
                Kembali
              </button>
              {isTaAktif && !isAktif && (
                <button
                  onClick={() => {
                    if (confirm("Aktifkan Semester " + semester.nama + "?"))
                      setSemAktif.mutate();
                  }}
                  disabled={setSemAktif.isPending}
                  className="px-4 py-2.5 bg-green-50 border border-green-200 text-[#006e2a] rounded-full font-semibold text-xs hover:bg-green-100 transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    check_circle
                  </span>{" "}
                  Set Aktif
                </button>
              )}
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-gradient-to-r from-[#00342b] to-[#004d40] text-white px-6 md:px-8 py-3 md:py-3.5 rounded-full ds-font-display font-bold uppercase tracking-widest text-xs transition-all duration-500 flex items-center gap-2 shadow-[0_10px_25px_-5px_rgba(0,52,43,0.3)] hover:shadow-[0_20px_35px_-5px_rgba(105,255,135,0.3)] hover:scale-[1.02] hover:brightness-110 group"
              >
                <span className="material-symbols-outlined text-[18px] md:text-[20px] transition-transform group-hover:rotate-12">
                  edit_square
                </span>
                Edit Semester
              </button>
              <button className="w-10 h-10 md:w-12 md:h-12 bg-white/80 backdrop-blur-md border border-gray-200/30 hover:bg-gray-100 rounded-full flex items-center justify-center text-[#00342b] transition-all shadow-sm hover:shadow-md">
                <span className="material-symbols-outlined text-[22px] md:text-[24px]">
                  more_horiz
                </span>
              </button>
            </div>
          </div>

          {/* Progress card */}
          <div className="ds-glass rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden border border-white/40 group hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 ease-out">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#006e2a]/5 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="relative z-10">
              {/* Top row */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 md:mb-12">
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#006e2a]/10 flex items-center justify-center text-[#006e2a] group-hover:scale-110 group-hover:bg-[#006e2a]/20 transition-all duration-300">
                      <span className="material-symbols-outlined ds-icon-fill text-[24px]">
                        trending_up
                      </span>
                    </div>
                    <h3 className="ds-font-display font-extrabold text-[#00342b] tracking-tight leading-none text-2xl md:text-[28px]">
                      Semester Progress
                    </h3>
                  </div>
                  <p className="text-gray-500 text-[14px] md:text-[15px] font-medium pl-1">
                    Real-time tracking of academic milestones and curriculum
                    timeline
                  </p>
                </div>
                <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-sm flex items-center gap-4 md:gap-5 w-full md:w-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">
                      Current Progress
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl md:text-4xl font-black text-[#00342b] tracking-tighter group-hover:text-[#006e2a] transition-colors duration-300 ds-font-display">
                        {progress}
                      </span>
                      <span className="text-lg font-bold text-[#006e2a]">
                        %
                      </span>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-gray-200/40" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-[#006e2a]/10 px-3 py-1 rounded-full border border-[#006e2a]/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006e2a] ds-pulse-dot" />
                      <span className="text-[10px] font-black text-[#006e2a] uppercase tracking-wider">
                        {statusLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="material-symbols-outlined text-[14px] text-gray-400">
                        calendar_month
                      </span>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight ds-font-display">
                        {semester.nama} {ta.tahun?.split("/")[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="relative mb-10 md:mb-12">
                <div className="relative h-3 bg-gray-100/60 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00342b] via-[#006e2a] to-[#69ff87] rounded-full ds-progress-shimmer shadow-[0_0_15px_rgba(0,110,42,0.3)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-shadow duration-500"
                    style={{ width: Math.max(2, progress) + "%" }}
                  />
                </div>
                {progress > 2 && progress < 100 && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -ml-3 w-6 h-6 bg-white rounded-full border-4 border-[#006e2a] shadow-lg z-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ left: progress + "%" }}
                  >
                    <div className="w-1.5 h-1.5 bg-[#006e2a] rounded-full ds-pulse-dot" />
                  </div>
                )}
              </div>
              {/* Date cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 items-stretch">
                {/* Start */}
                <div className="relative bg-gradient-to-br from-white to-[#006e2a]/5 backdrop-blur-md rounded-2xl p-5 md:p-6 border border-gray-200/20 border-l-4 border-l-[#006e2a] shadow-sm flex items-center gap-4 md:gap-5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-default group/card overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(#006e2a 0.5px, transparent 0.5px)",
                      backgroundSize: "10px 10px",
                    }}
                  />
                  <div className="relative z-10 w-11 h-11 md:w-12 md:h-12 rounded-xl bg-white/60 backdrop-blur-md border border-white/80 flex items-center justify-center text-[#006e2a] shrink-0 shadow-[0_4px_12px_rgba(0,110,42,0.15)] group-hover/card:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[22px] md:text-[24px] ds-icon-fill">
                      calendar_today
                    </span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-[#006e2a] uppercase tracking-[0.2em] mb-1 ds-font-display">
                      Mulai
                    </p>
                    <h4 className="text-lg md:text-xl font-extrabold text-[#00342b] tracking-tight ds-font-display">
                      {fmt(tglMulai)}
                    </h4>
                  </div>
                </div>
                {/* Center */}
                <div className="bg-[#00342b] rounded-2xl p-5 md:p-6 border border-[#006e2a]/20 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-default group/card">
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#006e2a]/20 rounded-full blur-2xl" />
                  <div className="relative z-10 transform group-hover/card:scale-105 transition-transform duration-500">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#006e2a]/20 border border-[#006e2a]/30 text-green-200 text-[10px] font-bold uppercase tracking-widest mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-200 mr-2 ds-pulse-dot" />
                      Hari Ini
                    </div>
                    <div className="text-white font-extrabold text-2xl md:text-3xl leading-none mb-1 tracking-tight ds-font-display">
                      Day {hariBerjalan ?? "-"}{" "}
                      <span className="ds-font-serif italic font-normal text-green-300 text-base md:text-lg">
                        of {totalHari ?? "-"}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/70 font-bold uppercase tracking-wider mt-2">
                      {hariSisa} hari tersisa
                    </div>
                  </div>
                </div>
                {/* End */}
                <div className="relative bg-gradient-to-bl from-white to-[#00342b]/5 backdrop-blur-md rounded-2xl p-5 md:p-6 border border-gray-200/20 border-r-4 border-r-[#00342b] shadow-sm flex items-center gap-4 md:gap-5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-default group/card overflow-hidden justify-end text-right">
                  <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(#00342b 0.5px, transparent 0.5px)",
                      backgroundSize: "10px 10px",
                    }}
                  />
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-[#00342b] uppercase tracking-[0.2em] mb-1 ds-font-display">
                      Selesai
                    </p>
                    <h4 className="text-lg md:text-xl font-extrabold text-[#00342b] tracking-tight ds-font-display">
                      {fmt(tglSelesai)}
                    </h4>
                  </div>
                  <div className="relative z-10 w-11 h-11 md:w-12 md:h-12 rounded-xl bg-white/60 backdrop-blur-md border border-white/80 flex items-center justify-center text-[#00342b] shrink-0 shadow-[0_4px_12px_rgba(0,52,43,0.15)] group-hover/card:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[22px] md:text-[24px] ds-icon-fill">
                      flag
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 2: STATISTICS OVERVIEW ═══ */}
        <section>
          <div className="flex flex-col gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006e2a] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006e2a]" />
              </span>
              <span className="text-[11px] font-bold text-[#006e2a] uppercase tracking-widest ds-font-display">
                Live Data
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-200/60 to-transparent" />
            </div>
            <h2 className="ds-font-display font-extrabold text-[#00342b] tracking-tight text-3xl md:text-4xl">
              Statistics{" "}
              <span className="ds-font-serif italic font-normal text-[#006e2a]/70">
                Overview
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
            <div className="md:col-span-4 bg-[#00342b] text-white rounded-3xl p-6 shadow-lg relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,200,83,0.15)] ds-shine">
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-green-200/80 uppercase tracking-widest mb-1 ds-font-display">
                  Active Students
                </p>
                <h4 className="text-3xl md:text-4xl font-extrabold ds-font-display">
                  {totalSiswa || data.total_siswa || "-"}
                </h4>
                <div className="mt-4 h-10 w-full flex items-end gap-1">
                  {[40, 60, 50, 90].map((h, i) => (
                    <div
                      key={i}
                      className={
                        "flex-1 rounded-t-sm group-hover:animate-pulse " +
                        (i === 3
                          ? "bg-[#69ff87]"
                          : i === 2
                            ? "bg-white/40"
                            : "bg-white/20")
                      }
                      style={{
                        height: h + "%",
                        animationDelay: i * 100 + "ms",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-7xl">
                  groups
                </span>
              </div>
            </div>
            <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                {
                  label: "Active Teachers",
                  value: data.total_guru ?? totalKelas,
                  sub: "100% Aktif",
                  subColor: "text-[#006e2a]",
                  icon: "check_circle",
                },
                {
                  label: "Classes",
                  value: totalKelas,
                  sub: "Current Term",
                  subColor: "text-gray-400",
                  icon: null,
                },
                {
                  label: "Mata Pelajaran",
                  value: data.total_mapel ?? "-",
                  sub: "Kurikulum",
                  subColor: "text-gray-400",
                  icon: null,
                },
                {
                  label: "Total Jadwal",
                  value: data.total_jadwal ?? "-",
                  sub: "95% Set",
                  subColor: "text-[#006e2a]",
                  icon: "verified",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-4 md:p-5 shadow-sm relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:shadow-md"
                >
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ds-font-display">
                    {m.label}
                  </p>
                  <h4 className="text-xl md:text-2xl font-extrabold text-[#00342b] ds-font-display">
                    {m.value}
                  </h4>
                  <p
                    className={
                      "text-[10px] font-bold mt-2 flex items-center gap-1 " +
                      m.subColor
                    }
                  >
                    {m.icon && (
                      <span className="material-symbols-outlined text-xs">
                        {m.icon}
                      </span>
                    )}
                    {m.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SECTION 3: KESIAPAN AKADEMIK ═══ */}
        <section>
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-gray-100/40 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Left */}
              <div className="lg:w-1/3 space-y-6 md:space-y-8">
                <div>
                  <h2 className="ds-font-display font-extrabold text-[#00342b] tracking-tight mb-2 text-2xl md:text-[28px]">
                    Kesiapan Akademik
                  </h2>
                  <p className="text-gray-500 text-sm font-medium">
                    Overall readiness score berdasarkan checklist operasional
                    semester.
                  </p>
                </div>
                <div className="flex items-center gap-4 md:gap-6 bg-[#00342b]/5 p-5 md:p-6 rounded-3xl border border-[#00342b]/10">
                  <CircularProgress value={healthScore} size={96} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={
                          "w-2 h-2 rounded-full ds-pulse-dot " +
                          (healthScore >= 80
                            ? "bg-[#006e2a]"
                            : healthScore >= 50
                              ? "bg-amber-500"
                              : "bg-red-500")
                        }
                      />
                      <p
                        className={
                          "text-sm font-bold uppercase tracking-wider ds-font-display " +
                          (healthScore >= 80
                            ? "text-[#006e2a]"
                            : healthScore >= 50
                              ? "text-amber-600"
                              : "text-red-600")
                        }
                      >
                        Status:{" "}
                        {healthScore >= 80
                          ? "Good"
                          : healthScore >= 50
                            ? "Perlu Perhatian"
                            : "Kritis"}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {healthScore >= 80
                        ? "Ready for ongoing activities with minor attention needed."
                        : "Beberapa item perlu dilengkapi."}
                    </p>
                  </div>
                </div>
                {alerts.length > 0 && (
                  <div className="bg-red-50/40 rounded-2xl p-4 md:p-5 border border-red-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                        <span className="material-symbols-outlined text-[20px]">
                          warning
                        </span>
                      </div>
                      <h4 className="text-red-600 text-sm font-bold uppercase tracking-widest ds-font-display">
                        Needs Attention
                      </h4>
                    </div>
                    <ul className="space-y-2.5">
                      {alerts.slice(0, 4).map((a, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-gray-600 font-medium"
                        >
                          <span className="w-1 h-1 rounded-full bg-red-500 mt-1.5 shrink-0" />
                          {a.msg}
                          <AlertBadge level={a.level} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* Right */}
              <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {[
                  {
                    key: "siswa_terdistribusi",
                    label: "Students",
                    icon: "groups",
                    color: "green",
                  },
                  {
                    key: "guru_mengajar",
                    label: "Teachers",
                    icon: "school",
                    color: "green",
                  },
                  {
                    key: "rombel_dibuat",
                    label: "Assignment",
                    icon: "assignment",
                    color: "green",
                  },
                  {
                    key: "jadwal_selesai",
                    label: "Schedules",
                    icon: "calendar_month",
                    color: "amber",
                  },
                  {
                    key: "mapel_lengkap",
                    label: "Grading Config",
                    icon: "settings_suggest",
                    color: "green",
                  },
                  {
                    key: "kepsek_dikunci",
                    label: "Report Cards",
                    icon: "description",
                    color: "amber",
                  },
                ].map(({ key, label, icon, color }) => {
                  const done = checklist[key];
                  const pct = done ? 100 : 30;
                  const barColor = done
                    ? "bg-[#006e2a]"
                    : color === "amber"
                      ? "bg-amber-400"
                      : "bg-[#006e2a]";
                  const valColor = done
                    ? "text-[#00342b] group-hover:text-[#006e2a]"
                    : color === "amber"
                      ? "text-amber-600"
                      : "text-amber-600";
                  const iconColor = done
                    ? "text-[#006e2a]/40 group-hover:text-[#006e2a]"
                    : color === "amber"
                      ? "text-amber-400/60 group-hover:text-amber-500"
                      : "text-amber-400/60 group-hover:text-amber-500";
                  return (
                    <div
                      key={key}
                      className={
                        "p-4 md:p-5 bg-gray-50/50 rounded-2xl border transition-colors group " +
                        (done
                          ? "border-gray-100/20 hover:border-[#006e2a]/30"
                          : "border-amber-100/40 hover:border-amber-200/60")
                      }
                    >
                      <div className="flex justify-between items-end mb-3">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 ds-font-display">
                            {label}
                          </p>
                          <p
                            className={
                              "text-xl md:text-2xl font-extrabold transition-colors ds-font-display " +
                              valColor
                            }
                          >
                            {done ? "100%" : "—"}
                          </p>
                        </div>
                        <span
                          className={
                            "material-symbols-outlined transition-colors " +
                            iconColor
                          }
                        >
                          {icon}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={"h-full rounded-full " + barColor}
                          style={{ width: pct + "%" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 4: DISTRIBUSI SISWA + KALENDER ═══ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Student Distribution */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-white/50 shadow-xl flex flex-col h-full relative overflow-hidden group transition-all duration-500 hover:shadow-2xl">
            <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#69ff87]/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="flex justify-between items-start mb-8 md:mb-10 relative z-10">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006e2a] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006e2a]" />
                  </span>
                  <span className="text-[11px] font-bold text-[#006e2a] uppercase tracking-widest ds-font-display">
                    Live Data
                  </span>
                </div>
                <h3 className="ds-font-display font-extrabold text-[#00342b] tracking-tight text-xl md:text-2xl">
                  Distribusi{" "}
                  <span className="ds-font-serif italic font-normal text-[#006e2a]/70">
                    Siswa
                  </span>{" "}
                  per Kelas
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  Populasi aktif semester {semester.nama} {ta.tahun}
                </p>
              </div>
              <button className="w-10 h-10 rounded-xl bg-gray-100/60 flex items-center justify-center text-gray-400 hover:text-[#00342b] hover:bg-[#006e2a]/10 transition-all border border-gray-200/30">
                <span className="material-symbols-outlined text-[20px]">
                  analytics
                </span>
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-end relative z-10">
              {kelasFilter.length > 0 ? (
                <>
                  <div
                    className="relative flex items-end justify-around gap-2 md:gap-4 px-2 pb-10 mt-4"
                    style={{ minHeight: 120 }}
                  >
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-10 pt-4 z-0">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-full h-px bg-gray-100/60" />
                      ))}
                    </div>
                    <div className="relative flex-1 flex items-end justify-around gap-2 md:gap-3 w-full h-full z-10">
                      {kelasFilter.slice(0, 6).map((k) => {
                        const maxSiswa = Math.max(
                          ...kelasFilter.map((x) => x.total_siswa ?? 1),
                          1,
                        );
                        const heightPct = Math.max(
                          15,
                          Math.round(((k.total_siswa ?? 0) / maxSiswa) * 100),
                        );
                        return (
                          <div
                            key={k.id}
                            className="flex-1 flex flex-col items-center gap-2 group/bar cursor-pointer h-full justify-end"
                            onClick={() =>
                              navigate("/operator/master/kelas/" + k.id)
                            }
                          >
                            <div
                              className="relative w-full max-w-[32px] bg-gradient-to-t from-[#00342b] to-[#006e2a] rounded-t-xl transition-all duration-500 group-hover/bar:scale-105 group-hover/bar:shadow-[0_0_15px_rgba(0,110,42,0.3)]"
                              style={{ height: heightPct + "%" }}
                            />
                            <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 truncate w-full text-center ds-font-display">
                              {k.nama_kelas?.slice(-2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 md:gap-3 pt-4 border-t border-gray-100 mt-2">
                    {[
                      {
                        label: "New",
                        value: totalSiswa,
                        color: "text-[#00342b]",
                        bg: "bg-[#00342b]/5",
                        border: "border-[#00342b]/10",
                      },
                      {
                        label: "Kelas",
                        value: totalKelas,
                        color: "text-[#006e2a]",
                        bg: "bg-[#006e2a]/5",
                        border: "border-[#006e2a]/10",
                      },
                      {
                        label: "Rata-rata",
                        value: totalKelas
                          ? Math.round(totalSiswa / totalKelas)
                          : 0,
                        color: "text-[#00342b]",
                        bg: "bg-gray-50",
                        border: "border-gray-100",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className={
                          "flex flex-col items-center p-2 md:p-3 " +
                          s.bg +
                          " rounded-2xl border " +
                          s.border +
                          " hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        }
                      >
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ds-font-display">
                          {s.label}
                        </span>
                        <span
                          className={
                            "text-lg md:text-xl font-extrabold " +
                            s.color +
                            " ds-font-display"
                          }
                        >
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <span className="material-symbols-outlined text-[40px] text-gray-200">
                    groups
                  </span>
                  <p className="text-sm mt-2">Belum ada kelas semester ini.</p>
                </div>
              )}
            </div>
          </div>
          {/* Kalender Akademik */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/40 shadow-sm flex flex-col h-full relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#006e2a]/20 hover:border-[#006e2a]/30">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#006e2a]/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#006e2a]/10 transition-colors duration-500" />
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 relative z-10">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-[#006e2a]/10 flex items-center justify-center text-[#006e2a] shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                <span className="material-symbols-outlined ds-icon-fill text-[26px]">
                  calendar_today
                </span>
              </div>
              <div>
                <h3 className="ds-font-display font-extrabold text-[#00342b] tracking-tight text-xl md:text-2xl">
                  Kalender{" "}
                  <span className="ds-font-serif italic font-normal text-[#006e2a]/70">
                    Akademik
                  </span>
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Agenda pendidikan semester ini
                </p>
              </div>
            </div>
            <div className="relative flex-1 z-10">
              {kalender.length > 0 ? (
                <>
                  <div className="absolute left-[23px] top-4 bottom-4 w-px border-l border-dashed border-[#006e2a]/20" />
                  <div className="flex flex-col gap-5 md:gap-8">
                    {kalender.slice(0, 5).map((item) => (
                      <KalenderItem key={item.id} item={item} />
                    ))}
                    {kalender.length > 5 && (
                      <p className="pl-6 text-xs text-gray-400 font-medium">
                        +{kalender.length - 5} event lainnya...
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <span className="material-symbols-outlined text-[40px] text-gray-200">
                    event_busy
                  </span>
                  <p className="text-sm mt-2">Belum ada event kalender.</p>
                  <Link
                    to="/kepsek/kalender"
                    className="text-[#006e2a] text-xs font-semibold hover:underline mt-1 inline-block"
                  >
                    Tambah event →
                  </Link>
                </div>
              )}
            </div>
            <div className="mt-6 md:mt-10 pt-4 md:pt-6 border-t border-gray-100 relative z-10">
              <Link
                to="/kepsek/kalender"
                className="w-full py-3 bg-[#006e2a]/5 hover:bg-[#006e2a] hover:text-white text-[#006e2a] text-[11px] font-bold uppercase tracking-widest rounded-xl border border-[#006e2a]/20 transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-sm hover:shadow-md ds-font-display"
              >
                Lihat Kalender Lengkap
                <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover/btn:translate-x-2">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 5: SUBJECTS & CHECKLIST / SEMESTER INFO ═══ */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Checklist */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-white/50 shadow-xl relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#00342b]/10 h-full">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#69ff87]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="flex justify-between items-start mb-6 md:mb-8 relative z-10">
              <div className="flex flex-col gap-1">
                <h3 className="ds-font-display font-extrabold text-[#00342b] tracking-tight text-xl md:text-2xl">
                  Checklist{" "}
                  <span className="ds-font-serif italic font-normal text-[#006e2a]/70">
                    Semester
                  </span>
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  Status konfigurasi operasional
                </p>
              </div>
              <div className="p-3 md:p-4 rounded-2xl bg-white/50 border border-white/60">
                <span className="material-symbols-outlined text-[#006e2a] text-3xl ds-icon-fill">
                  menu_book
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-1 relative z-10">
              {[
                {
                  key: "ta_dibuat",
                  label: "Tahun Ajaran Dibuat",
                  icon: "calendar_today",
                },
                {
                  key: "rombel_dibuat",
                  label: "Rombel Tersedia",
                  icon: "door_front",
                },
                {
                  key: "guru_mengajar",
                  label: "Guru Mengajar",
                  icon: "school",
                },
                {
                  key: "mapel_lengkap",
                  label: "Mapel Lengkap",
                  icon: "calculate",
                },
                {
                  key: "wali_kelas",
                  label: "Wali Kelas Ditetapkan",
                  icon: "person",
                },
                {
                  key: "jadwal_selesai",
                  label: "Jadwal Selesai",
                  icon: "schedule",
                },
              ].map(({ key, label, icon }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 md:p-4 rounded-2xl bg-white/50 border border-white/60 hover:bg-gray-50 hover:translate-x-1 transition-all duration-300 group/item cursor-default"
                >
                  <div className="flex items-center gap-3 group-hover/item:scale-105 transition-transform duration-300">
                    <span
                      className={
                        "material-symbols-outlined " +
                        (checklist[key] ? "text-[#006e2a]" : "text-amber-400")
                      }
                    >
                      {icon}
                    </span>
                    <span className="text-sm font-bold text-[#00342b] ds-font-display">
                      {label}
                    </span>
                  </div>
                  <span
                    className={
                      "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ds-font-display " +
                      (checklist[key]
                        ? "text-[#006e2a] bg-green-50 border border-green-100"
                        : "text-amber-600 bg-amber-50 border border-amber-100")
                    }
                  >
                    {checklist[key] ? "✓ Done" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-100 relative z-10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ds-font-display">
                  Schedule Progress
                </span>
                <span className="text-sm font-black text-[#00342b] ds-font-display">
                  {healthScore}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00342b] to-[#006e2a] rounded-full ds-progress-shimmer"
                  style={{ width: healthScore + "%" }}
                />
              </div>
            </div>
          </div>
          {/* Semester Info */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-white/50 shadow-xl relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#69ff87]/20 h-full">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#006e2a]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="flex justify-between items-start mb-6 md:mb-8 relative z-10">
              <div>
                <h3 className="ds-font-display font-extrabold text-[#00342b] tracking-tight text-xl md:text-2xl">
                  Attendance &{" "}
                  <span className="ds-font-serif italic font-normal text-[#006e2a]/70">
                    Reports
                  </span>
                </h3>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  Status & detail konfigurasi semester
                </p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#006e2a]/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-[#006e2a] text-3xl ds-icon-fill animate-pulse">
                  analytics
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-4 md:gap-6 flex-1 relative z-10">
              <div className="flex items-center gap-4 md:gap-6 p-4 md:p-5 bg-[#00342b]/5 rounded-3xl border border-[#00342b]/10 hover:bg-[#00342b]/10 transition-all duration-300">
                <CircularProgress value={healthScore} size={64} stroke={3.5} />
                <div>
                  <p className="text-base font-bold text-[#00342b] ds-font-display">
                    Academic Readiness
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {healthScore >= 80
                      ? "Excellent performance"
                      : "Perlu perhatian"}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 ds-font-display">
                  Detail Semester
                </p>
                {[
                  {
                    label: "Nama",
                    value: semester.nama + " – " + ta.tahun,
                    icon: "info",
                    done: true,
                  },
                  {
                    label: "Tanggal Mulai",
                    value: fmt(tglMulai),
                    icon: "calendar_today",
                    done: true,
                  },
                  {
                    label: "Tanggal Selesai",
                    value: fmt(tglSelesai),
                    icon: "event",
                    done: !!tglSelesai,
                  },
                  {
                    label: "Total Minggu",
                    value: totalMinggu ? totalMinggu + " minggu" : "-",
                    icon: "date_range",
                    done: !!totalMinggu,
                  },
                  {
                    label: "Total Hari",
                    value: totalHari ? totalHari + " hari" : "-",
                    icon: "today",
                    done: !!totalHari,
                  },
                ].map(({ label, value, icon, done }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between p-3 md:p-4 rounded-2xl bg-white/50 border border-white/60 hover:border-[#006e2a]/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={
                          "material-symbols-outlined " +
                          (done ? "text-[#006e2a]" : "text-gray-300") +
                          " text-[20px] ds-icon-fill"
                        }
                      >
                        {icon}
                      </span>
                      <span className="text-sm font-bold text-[#00342b] ds-font-display">
                        {label}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-600 text-right max-w-[140px] truncate">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-auto pt-4 md:pt-6 border-t border-gray-100 flex justify-between items-center relative z-10">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ds-font-display">
                Overall Progress
              </span>
              <div className="flex items-center gap-3">
                <div className="w-20 md:w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#006e2a] rounded-full"
                    style={{ width: progress + "%" }}
                  />
                </div>
                <span className="text-sm font-black text-[#00342b] ds-font-display">
                  {progress}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 6: MATA PELAJARAN ═══ */}
        <section>
          <div className="flex flex-col gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-[#006e2a]/10 px-3 py-1 rounded-full border border-[#006e2a]/20 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006e2a] ds-pulse-dot" />
                <span className="text-[10px] font-bold text-[#006e2a] uppercase tracking-widest ds-font-display">
                  MASTER DATA
                </span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-200/60 to-transparent" />
            </div>
            <div className="space-y-2">
              <h2 className="ds-font-display font-extrabold text-[#00342b] tracking-tight text-3xl md:text-4xl">
                Mata{" "}
                <span className="ds-font-serif italic font-normal text-[#006e2a]/70">
                  Pelajaran
                </span>
              </h2>
              <p className="text-gray-500 text-sm font-medium max-w-2xl leading-relaxed">
                Kelola daftar mata pelajaran inti dan koordinator akademik untuk
                memastikan standar kurikulum terpenuhi di setiap jenjang kelas.
              </p>
            </div>
          </div>
          {data.mapel && data.mapel.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {data.mapel.slice(0, 8).map((mp, idx) => {
                  const icons = [
                    "menu_book",
                    "calculate",
                    "science",
                    "mosque",
                    "translate",
                    "brush",
                    "directions_run",
                    "computer",
                  ];
                  const bgs = [
                    "bg-[#006e2a]/5",
                    "bg-[#00342b]/5",
                    "bg-amber-50",
                    "bg-[#006e2a]/5",
                    "bg-[#00342b]/5",
                    "bg-purple-50",
                    "bg-blue-50",
                    "bg-orange-50",
                  ];
                  const hovers = [
                    "group-hover:bg-[#006e2a]",
                    "group-hover:bg-[#00342b]",
                    "group-hover:bg-amber-500",
                    "group-hover:bg-[#006e2a]",
                    "group-hover:bg-[#00342b]",
                    "group-hover:bg-purple-600",
                    "group-hover:bg-blue-600",
                    "group-hover:bg-orange-600",
                  ];
                  const texts = [
                    "text-[#006e2a]",
                    "text-[#00342b]",
                    "text-amber-600",
                    "text-[#006e2a]",
                    "text-[#00342b]",
                    "text-purple-600",
                    "text-blue-600",
                    "text-orange-600",
                  ];
                  const i = idx % 8;
                  const initials = (mp.nama || "MP")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const isReview = !mp.is_active;
                  return (
                    <div
                      key={mp.id ?? idx}
                      className="group bg-white/80 backdrop-blur-md border border-white/60 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500"
                    >
                      <div className="flex justify-between items-start mb-8">
                        <div
                          className={
                            "w-14 h-14 rounded-2xl " +
                            bgs[i] +
                            " flex items-center justify-center " +
                            texts[i] +
                            " " +
                            hovers[i] +
                            " group-hover:text-white transition-all duration-500 shadow-inner"
                          }
                        >
                          <span className="material-symbols-outlined text-[32px] ds-icon-fill">
                            {icons[i]}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span
                            className={
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ds-font-display " +
                              (isReview
                                ? "bg-amber-50 text-amber-600 border-amber-200"
                                : "bg-[#006e2a]/10 text-[#006e2a] border-[#006e2a]/20")
                            }
                          >
                            {isReview ? "Review" : "Aktif"}
                          </span>
                          {mp.kode && (
                            <span className="text-[10px] text-gray-400 mt-1 font-medium">
                              ID: {mp.kode}
                            </span>
                          )}
                        </div>
                      </div>
                      <h4 className="text-xl font-bold text-[#00342b] ds-font-display mb-6 group-hover:text-[#006e2a] transition-colors">
                        {mp.nama}
                      </h4>
                      <div className="flex items-center gap-3 p-3 bg-gray-50/60 rounded-2xl border border-gray-100 group-hover:border-[#006e2a]/20 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-[#004d40] flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ds-font-display">
                            Koordinator
                          </span>
                          <span className="text-sm font-bold text-[#00342b] ds-font-display">
                            {mp.nama_guru ||
                              mp.koordinator ||
                              "Belum ditetapkan"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-10 md:mt-12 flex justify-center">
                <button
                  onClick={() => navigate("/operator/master/mapel")}
                  className="px-6 md:px-8 py-3 rounded-xl border border-[#006e2a]/30 text-[#006e2a] font-bold text-xs uppercase tracking-widest hover:bg-[#006e2a]/5 transition-all flex items-center gap-2 group ds-font-display"
                >
                  Lihat Semua Mata Pelajaran
                  <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  icon: "menu_book",
                  nama: "Bahasa Indonesia",
                  status: "Aktif",
                  kode: "IND-01",
                  inisial: "SN",
                  guru: "Siti Nurhaliza",
                  bg: "bg-[#006e2a]/5",
                  text: "text-[#006e2a]",
                  hover: "group-hover:bg-[#006e2a]",
                  bb: "bg-[#006e2a]/10 text-[#006e2a] border-[#006e2a]/20",
                  av: "bg-[#004d40]",
                },
                {
                  icon: "calculate",
                  nama: "Matematika",
                  status: "Aktif",
                  kode: "MAT-02",
                  inisial: "AH",
                  guru: "Ahmad Hidayat",
                  bg: "bg-[#00342b]/5",
                  text: "text-[#00342b]",
                  hover: "group-hover:bg-[#00342b]",
                  bb: "bg-[#006e2a]/10 text-[#006e2a] border-[#006e2a]/20",
                  av: "bg-[#006e2a]",
                },
                {
                  icon: "science",
                  nama: "IPA",
                  status: "Review",
                  kode: "IPA-03",
                  inisial: "BK",
                  guru: "Budi Kusuma",
                  bg: "bg-amber-50",
                  text: "text-amber-600",
                  hover: "group-hover:bg-amber-500",
                  bb: "bg-amber-50 text-amber-600 border-amber-200",
                  av: "bg-gray-500",
                },
                {
                  icon: "mosque",
                  nama: "PAI",
                  status: "Aktif",
                  kode: "PAI-04",
                  inisial: "UZ",
                  guru: "Ust. Zulkifli",
                  bg: "bg-[#006e2a]/5",
                  text: "text-[#006e2a]",
                  hover: "group-hover:bg-[#006e2a]",
                  bb: "bg-[#006e2a]/10 text-[#006e2a] border-[#006e2a]/20",
                  av: "bg-[#00342b]",
                },
              ].map((mp) => (
                <div
                  key={mp.nama}
                  className="group bg-white/80 backdrop-blur-md border border-white/60 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div
                      className={
                        "w-14 h-14 rounded-2xl " +
                        mp.bg +
                        " flex items-center justify-center " +
                        mp.text +
                        " " +
                        mp.hover +
                        " group-hover:text-white transition-all duration-500 shadow-inner"
                      }
                    >
                      <span className="material-symbols-outlined text-[32px] ds-icon-fill">
                        {mp.icon}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className={
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ds-font-display " +
                          mp.bb
                        }
                      >
                        {mp.status}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-1 font-medium">
                        ID: {mp.kode}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-[#00342b] ds-font-display mb-6 group-hover:text-[#006e2a] transition-colors">
                    {mp.nama}
                  </h4>
                  <div className="flex items-center gap-3 p-3 bg-gray-50/60 rounded-2xl border border-gray-100 group-hover:border-[#006e2a]/20 transition-colors">
                    <div
                      className={
                        "w-10 h-10 rounded-full " +
                        mp.av +
                        " flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm"
                      }
                    >
                      {mp.inisial}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ds-font-display">
                        Koordinator
                      </span>
                      <span className="text-sm font-bold text-[#00342b] ds-font-display">
                        {mp.guru}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ═══ SECTION 7: KELAS & ROMBEL ═══ */}
        {kelasFilter.length > 0 && (
          <section>
            <div className="flex flex-col gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#00342b]/10 border border-[#00342b]/20 text-[10px] font-bold text-[#00342b] tracking-widest uppercase shadow-sm ds-font-display">
                  MASTER DATA
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-200/60 to-transparent" />
              </div>
              <h2 className="ds-font-display font-extrabold text-[#00342b] tracking-tight text-3xl md:text-4xl">
                Kelas &{" "}
                <span className="ds-font-serif italic font-normal text-[#006e2a]/70">
                  Rombel
                </span>
              </h2>
              <p className="text-gray-500 text-sm font-medium">
                Ringkasan pembagian rombongan belajar dan kapasitas kelas.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {kelasFilter.map((k) => (
                <div
                  key={k.id}
                  onClick={() => navigate("/operator/master/kelas/" + k.id)}
                  className="bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-[#006e2a]/10 flex items-center justify-center text-[#006e2a] group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[26px] md:text-[28px]">
                        door_front
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#006e2a] bg-[#006e2a]/10 px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#006e2a]/20 ds-font-display">
                      Aktif
                    </span>
                  </div>
                  <h4 className="text-base md:text-lg font-extrabold text-[#00342b] ds-font-display mb-3 md:mb-4">
                    {k.nama_kelas}
                  </h4>
                  <div className="flex flex-col gap-2 pt-3 md:pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ds-font-display">
                        Wali Kelas
                      </span>
                      <span className="text-xs font-bold text-[#00342b] text-right max-w-[120px] truncate ds-font-display">
                        {k.nama_wali || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ds-font-display">
                        Siswa
                      </span>
                      <span className="text-xs font-bold text-[#006e2a] ds-font-display">
                        {k.total_siswa ?? 0}
                        {k.kapasitas ? "/" + k.kapasitas : ""} Siswa
                      </span>
                    </div>
                    {k.ruangan && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ds-font-display">
                          Ruangan
                        </span>
                        <span className="text-xs font-bold text-gray-600 ds-font-display">
                          {k.ruangan}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══ SECTION 8: JADWAL PELAJARAN ═══ */}
        <section>
          <div className="flex flex-col gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#006e2a]/10 border border-[#006e2a]/20 text-[10px] font-bold text-[#006e2a] tracking-widest uppercase shadow-sm ds-font-display">
                OPERASIONAL
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-200/60 to-transparent" />
            </div>
            <h2 className="ds-font-display font-extrabold text-[#00342b] tracking-tight text-3xl md:text-4xl">
              Jadwal{" "}
              <span className="ds-font-serif italic font-normal text-[#006e2a]/70">
                Pelajaran
              </span>
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              Pemetaan waktu belajar dan distribusi guru pengampu.
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-center">
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#00342b]/5 flex items-center justify-center text-[#00342b]">
                    <span className="material-symbols-outlined text-3xl md:text-4xl">
                      calendar_clock
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ds-font-display">
                      Status Konfigurasi
                    </p>
                    <h4 className="text-xl md:text-2xl font-extrabold text-[#00342b] ds-font-display">
                      {healthScore}%{" "}
                      <span className="text-sm font-medium text-gray-500">
                        Selesai
                      </span>
                    </h4>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#006e2a] rounded-full"
                    style={{ width: healthScore + "%" }}
                  />
                </div>
                <p className="text-xs font-medium text-gray-500">
                  {totalKelas} kelas / {data.total_jadwal ?? "-"} Jadwal
                  Terkonfigurasi
                </p>
              </div>
              <div className="lg:col-span-5 grid grid-cols-3 gap-3 md:gap-4">
                {[
                  { label: "Kelas", value: totalKelas + "/" + totalKelas },
                  {
                    label: "Guru",
                    value: data.total_guru
                      ? data.total_guru + "/" + data.total_guru
                      : "-",
                  },
                  {
                    label: "Mapel",
                    value: data.total_mapel
                      ? data.total_mapel + "/" + data.total_mapel
                      : "-",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="p-3 md:p-4 bg-gray-50/60 rounded-2xl border border-gray-100 text-center"
                  >
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ds-font-display">
                      {s.label}
                    </p>
                    <p className="text-base md:text-lg font-extrabold text-[#00342b] ds-font-display">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-3 flex justify-start lg:justify-end">
                <button
                  onClick={() => navigate("/operator/master/jadwal")}
                  className="inline-flex items-center gap-2 bg-[#00342b] hover:bg-[#004d40] text-white px-5 md:px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#00342b]/20 group ds-font-display"
                >
                  Lihat Jadwal Lengkap
                  <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 9: RINGKASAN AKADEMIK ═══ */}
        <section>
          <div className="flex flex-col gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="inline-flex items-center gap-2 md:gap-3 bg-[#00342b]/10 border border-[#00342b]/20 px-4 md:px-5 py-2 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-[#00342b] animate-pulse" />
                <span className="text-[#00342b] font-bold text-[10px] md:text-xs tracking-[0.25em] uppercase ds-font-display">
                  Ringkasan
                </span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-[#00342b]/20 to-transparent" />
            </div>
            <h2 className="ds-font-display font-extrabold text-[#00342b] tracking-tight text-3xl md:text-4xl">
              Ringkasan{" "}
              <span className="ds-font-serif italic font-normal text-[#006e2a]/70">
                Akademik
              </span>
            </h2>
          </div>
          <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-white/60 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
              {/* Gauge */}
              <div className="lg:col-span-5 relative group min-h-[300px] md:min-h-[380px]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00342b] to-[#004d40] rounded-[2rem] shadow-2xl shadow-[#00342b]/20 transition-transform duration-500 group-hover:scale-[1.01]" />
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none rounded-[2rem]"
                  style={{
                    backgroundImage:
                      "radial-gradient(#69ff87 0.5px, transparent 0.5px)",
                    backgroundSize: "15px 15px",
                  }}
                />
                <div className="relative z-10 h-full p-6 md:p-10 flex flex-col items-center justify-center text-center">
                  <div className="space-y-1 mb-6 md:mb-8">
                    <p className="text-[10px] font-bold text-green-200/50 uppercase tracking-[0.3em] ds-font-display">
                      Academic Readiness
                    </p>
                    <div className="h-px w-12 mx-auto bg-gradient-to-r from-transparent via-green-300/30 to-transparent" />
                  </div>
                  <div
                    className="relative flex items-center justify-center mb-6 md:mb-8"
                    style={{ width: 200, height: 200 }}
                  >
                    <div className="absolute inset-0 rounded-full border border-white/5 scale-110" />
                    <div className="absolute inset-0 rounded-full border border-white/10 scale-125 opacity-30" />
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 36 36"
                      style={{
                        filter: "drop-shadow(0 0 20px rgba(105,255,135,0.4))",
                      }}
                    >
                      <circle
                        className="text-white/5"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="16"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        fill="none"
                        r="16"
                        stroke="#69ff87"
                        strokeDasharray={healthScore + ", 100"}
                        strokeLinecap="round"
                        strokeWidth="2.5"
                        style={{
                          filter: "drop-shadow(0 0 12px rgba(105,255,135,0.6))",
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="flex items-baseline">
                        <span className="text-5xl md:text-7xl font-black text-white tracking-tighter ds-font-display">
                          {healthScore}
                        </span>
                        <span className="text-xl md:text-2xl font-bold text-[#69ff87] ml-1">
                          %
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest ds-font-display">
                        Readiness Score
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3 md:gap-4">
                    <div className="inline-flex items-center gap-2.5 bg-green-400/10 backdrop-blur-xl px-5 md:px-6 py-2.5 rounded-full border border-green-400/20">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#69ff87] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#69ff87]" />
                      </span>
                      <span className="text-xs font-black text-[#69ff87] uppercase tracking-[0.15em] ds-font-display">
                        Status:{" "}
                        {healthScore >= 80
                          ? "Optimal"
                          : healthScore >= 50
                            ? "Fair"
                            : "Kritis"}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 font-medium max-w-[200px] leading-relaxed italic ds-font-serif">
                      {healthScore >= 80
                        ? '"Exceeding operational benchmarks for the current academic term"'
                        : '"Beberapa item perlu diselesaikan sebelum kegiatan berjalan."'}
                    </p>
                  </div>
                </div>
              </div>
              {/* 2x2 Cards */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                {[
                  {
                    icon: "person_off",
                    label: "Penugasan Guru",
                    desc: checklist.guru_mengajar
                      ? "Semua guru telah mendapat penugasan."
                      : "Beberapa guru belum memiliki penugasan kelas semester ini.",
                    status: checklist.guru_mengajar ? "Verified" : "Attention",
                    color: checklist.guru_mengajar
                      ? {
                          bg: "bg-[#006e2a]/10",
                          text: "text-[#006e2a]",
                          border: "border-[#006e2a]/10",
                          badge:
                            "bg-[#006e2a]/10 text-[#006e2a] border-[#006e2a]/20",
                        }
                      : {
                          bg: "bg-amber-50/40",
                          text: "text-amber-600",
                          border: "border-amber-100",
                          badge: "bg-amber-50 text-amber-600 border-amber-100",
                        },
                  },
                  {
                    icon: "pending_actions",
                    label: "Konfigurasi Rapor",
                    desc: checklist.kepsek_dikunci
                      ? "Konfigurasi rapor telah selesai."
                      : "Pengaturan bobot nilai belum selesai dikonfigurasi.",
                    status: checklist.kepsek_dikunci ? "Done" : "Pending",
                    color: checklist.kepsek_dikunci
                      ? {
                          bg: "bg-[#006e2a]/10",
                          text: "text-[#006e2a]",
                          border: "border-[#006e2a]/10",
                          badge:
                            "bg-[#006e2a]/10 text-[#006e2a] border-[#006e2a]/20",
                        }
                      : {
                          bg: "bg-red-50/40",
                          text: "text-red-500",
                          border: "border-red-100",
                          badge: "bg-red-50 text-red-600 border-red-100",
                        },
                  },
                  {
                    icon: "verified",
                    label: "Kurikulum Inti",
                    desc: checklist.mapel_lengkap
                      ? "Semua silabus mata pelajaran inti telah disetujui."
                      : "Mata pelajaran belum sepenuhnya dikonfigurasi.",
                    status: checklist.mapel_lengkap ? "Verified" : "Belum",
                    color: checklist.mapel_lengkap
                      ? {
                          bg: "bg-[#006e2a]/10",
                          text: "text-[#006e2a]",
                          border: "border-[#006e2a]/10",
                          badge:
                            "bg-[#006e2a]/10 text-[#006e2a] border-[#006e2a]/20",
                        }
                      : {
                          bg: "bg-gray-50",
                          text: "text-gray-500",
                          border: "border-gray-100",
                          badge: "bg-gray-50 text-gray-500 border-gray-200",
                        },
                  },
                  {
                    icon: "group_add",
                    label: "Distribusi Siswa",
                    desc: checklist.siswa_terdistribusi
                      ? "Siswa telah terdistribusi ke semua kelas."
                      : "Proses distribusi siswa ke kelas sedang berlangsung.",
                    status: checklist.siswa_terdistribusi
                      ? "Done"
                      : "In Progress",
                    color: checklist.siswa_terdistribusi
                      ? {
                          bg: "bg-[#006e2a]/10",
                          text: "text-[#006e2a]",
                          border: "border-[#006e2a]/10",
                          badge:
                            "bg-[#006e2a]/10 text-[#006e2a] border-[#006e2a]/20",
                        }
                      : {
                          bg: "bg-[#00342b]/5",
                          text: "text-[#00342b]",
                          border: "border-[#00342b]/10",
                          badge:
                            "bg-[#00342b]/10 text-[#00342b] border-[#00342b]/20",
                        },
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className={
                      "p-5 md:p-6 bg-white/60 backdrop-blur-md border " +
                      card.color.border +
                      " rounded-[2rem] flex flex-col justify-between hover:bg-white/80 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 group"
                    }
                  >
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                      <div
                        className={
                          "w-12 h-12 md:w-14 md:h-14 rounded-2xl " +
                          card.color.bg +
                          " border " +
                          card.color.border +
                          " flex items-center justify-center " +
                          card.color.text +
                          " group-hover:scale-110 transition-transform"
                        }
                      >
                        <span className="material-symbols-outlined text-2xl md:text-3xl ds-icon-fill">
                          {card.icon}
                        </span>
                      </div>
                      <span
                        className={
                          "px-3 py-1 rounded-full " +
                          card.color.badge +
                          " text-[10px] font-bold uppercase tracking-wider border ds-font-display"
                        }
                      >
                        {card.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base md:text-lg font-bold text-[#00342b] mb-1 md:mb-2 ds-font-display">
                        {card.label}
                      </h4>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 10: NAVIGASI SEMESTER ═══ */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {semLain ? (
              <>
                <Link
                  to={
                    "/operator/master/tahun-ajaran/" +
                    taId +
                    "/semester/" +
                    semLain.nama
                  }
                  className="group flex items-center gap-4 md:gap-5 p-5 md:p-6 bg-gray-50/60 border border-gray-100 rounded-3xl hover:border-[#006e2a]/30 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
                >
                  <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white flex items-center justify-center text-gray-400 group-hover:text-[#006e2a] group-hover:scale-110 transition-all duration-500 shadow-sm">
                    <span className="material-symbols-outlined">
                      arrow_back
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1 block ds-font-display">
                      Semester Sebelumnya
                    </span>
                    <span className="text-base md:text-lg font-extrabold text-[#00342b] group-hover:text-[#006e2a] transition-colors ds-font-display">
                      {ta.tahun} — {semLain.nama}
                    </span>
                  </div>
                </Link>
                <Link
                  to={"/operator/master/tahun-ajaran/" + taId}
                  className="group flex items-center justify-end gap-4 md:gap-5 p-5 md:p-6 bg-gray-50/60 border border-gray-100 rounded-3xl hover:border-[#006e2a]/30 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-500 text-right"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1 ds-font-display">
                      Tahun Ajaran
                    </span>
                    <span className="text-base md:text-lg font-extrabold text-[#00342b] group-hover:text-[#006e2a] transition-colors ds-font-display">
                      {ta.tahun}
                    </span>
                  </div>
                  <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white flex items-center justify-center text-gray-400 group-hover:text-[#006e2a] group-hover:scale-110 transition-all duration-500 shadow-sm">
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </div>
                </Link>
              </>
            ) : (
              <Link
                to={"/operator/master/tahun-ajaran/" + taId}
                className="group flex items-center gap-4 md:gap-5 p-5 md:p-6 bg-gray-50/60 border border-gray-100 rounded-3xl hover:border-[#006e2a]/30 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-500 col-span-2"
              >
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white flex items-center justify-center text-gray-400 group-hover:text-[#006e2a] group-hover:scale-110 transition-all duration-500 shadow-sm">
                  <span className="material-symbols-outlined">arrow_back</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1 block ds-font-display">
                    Kembali ke
                  </span>
                  <span className="text-base md:text-lg font-extrabold text-[#00342b] group-hover:text-[#006e2a] transition-colors ds-font-display">
                    {ta.tahun}
                  </span>
                </div>
              </Link>
            )}
          </div>
        </section>

        {/* ═══ SECTION 11: AKTIVITAS TERBARU ═══ */}
        {aktivitas.length > 0 && (
          <section>
            <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
              <h3 className="text-base font-bold text-[#00342b] mb-4 flex items-center gap-2 ds-font-display">
                <span className="material-symbols-outlined text-[18px] text-gray-400">
                  history
                </span>
                Aktivitas Terbaru
              </h3>
              <div className="space-y-3">
                {aktivitas.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#004d40] mt-1.5 shrink-0" />
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      <span className="font-bold text-[#00342b] ds-font-display">
                        {a.user?.username ?? "Sistem"}
                      </span>{" "}
                      {a.keterangan ?? a.action}{" "}
                      <span className="opacity-60">
                        · {new Date(a.created_at).toLocaleDateString("id-ID")}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
