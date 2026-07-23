import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

// ── Helpers ──────────────────────────────────────────────────────────────────
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

// ── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-surface-container-high rounded-xl ${className}`}
    />
  );
}

function SkeletonPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex gap-3 mb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-10 w-72 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Skeleton className="h-52" />
          <Skeleton className="h-44" />
          <Skeleton className="h-56" />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-56" />
        </div>
      </div>
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
  const [form, setForm] = useState({
    tgl_mulai: semester?.tgl_mulai?.slice(0, 10) ?? "",
    tgl_selesai: semester?.tgl_selesai?.slice(0, 10) ?? "",
  });

  const namaSem = semester?.nama?.toLowerCase() ?? "ganjil";

  const mut = useMutation({
    mutationFn: () =>
      api.put(`/operator/master-data/tahun-ajaran/${tahunAjaranId}`, {
        tahun: tahunAjaran?.tahun,
        is_active: tahunAjaran?.is_active ?? false,
        buat_semester: true,
        [`semester_${namaSem}_mulai`]: form.tgl_mulai || null,
        [`semester_${namaSem}_selesai`]: form.tgl_selesai || null,
        // Kirim semester_aktif hanya kalau TA ini aktif,
        // supaya backend tahu mana semester yang sedang aktif & tidak me-reset yang lain.
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
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-surface-container text-text-secondary"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[20px]">
              edit_calendar
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-text-primary">
              Edit Semester {semester?.nama}
            </h2>
            <p className="text-xs text-text-secondary">
              Ubah tanggal mulai & selesai
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={form.tgl_mulai}
              onChange={(e) =>
                setForm((p) => ({ ...p, tgl_mulai: e.target.value }))
              }
              className="w-full border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Tanggal Selesai
            </label>
            <input
              type="date"
              value={form.tgl_selesai}
              onChange={(e) =>
                setForm((p) => ({ ...p, tgl_selesai: e.target.value }))
              }
              className="w-full border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-border-light text-text-secondary rounded-xl text-sm font-medium hover:bg-surface-container transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className="flex-1 py-2.5 bg-primary-container text-white rounded-xl text-sm font-semibold hover:bg-primary-container/90 transition-colors disabled:opacity-60"
          >
            {mut.isPending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ value = 0, colorClass = "bg-primary-container" }) {
  return (
    <div className="w-full bg-surface-variant rounded-full overflow-hidden h-2">
      <div
        className={`h-full ${colorClass} rounded-full transition-all duration-700`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-primary-container text-xs font-bold border border-emerald-200/60">
      <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
      Aktif
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-text-secondary text-xs font-bold border border-border-light">
      <span className="w-1.5 h-1.5 rounded-full bg-text-secondary" />
      Tidak Aktif
    </span>
  );
}

// ── Kalender Item ─────────────────────────────────────────────────────────────
function KalenderItem({ item }) {
  const colorMap = {
    libur: "bg-red-400",
    pts: "bg-primary-container",
    pas: "bg-warning",
    ph: "bg-info",
    kegiatan: "bg-purple-400",
  };
  const jenis = item.jenis?.toLowerCase();
  const dot = colorMap[jenis] ?? "bg-border-light";
  const isUpcoming =
    item.tanggal_mulai && new Date(item.tanggal_mulai) > new Date();

  return (
    <div className="relative pl-6">
      <div
        className={`absolute w-2.5 h-2.5 ${dot} rounded-full -left-[5px] top-1`}
      />
      <p
        className={`text-xs mb-0.5 ${isUpcoming ? "text-primary-container font-semibold" : "text-text-secondary"}`}
      >
        {fmtShort(item.tanggal_mulai)}
        {item.tanggal_selesai && item.tanggal_selesai !== item.tanggal_mulai
          ? ` – ${fmtShort(item.tanggal_selesai)}`
          : ""}
      </p>
      <p
        className={`text-sm font-medium ${isUpcoming ? "text-text-primary" : "text-text-secondary"}`}
      >
        {item.judul}
      </p>
      {item.is_nasional && (
        <span className="text-[10px] text-red-500 font-semibold uppercase">
          Nasional
        </span>
      )}
    </div>
  );
}

// ── Alert Badge ───────────────────────────────────────────────────────────────
function AlertBadge({ level }) {
  const map = {
    tinggi: "bg-danger text-white",
    sedang: "bg-warning text-white",
    rendah: "bg-text-secondary text-white",
  };
  return (
    <span
      className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${map[level] ?? map.rendah}`}
    >
      {level}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DetailSemester() {
  const { taId, semesterNama } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch detail tahun ajaran (includes semesters, kelas, kalender, checklist, dll)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["detail-semester", taId, semesterNama],
    queryFn: () =>
      api.get(`/operator/master-data/tahun-ajaran/${taId}`).then((r) => r.data),
    enabled: !!taId,
  });

  // Mutation: aktifkan semester ini
  const setSemAktif = useMutation({
    mutationFn: () =>
      api.patch(`/operator/master-data/tahun-ajaran/${taId}/semester-aktif`, {
        semester_nama: semesterNama,
      }),
    onSuccess: () => {
      toast.success(`Semester ${semesterNama} berhasil diaktifkan.`);
      queryClient.invalidateQueries(["detail-semester", taId]);
      queryClient.invalidateQueries(["detail-tahun-ajaran", taId]);
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message ?? "Gagal mengaktifkan semester.",
      ),
  });

  // ── Loading ──
  if (isLoading) return <SkeletonPage />;

  // ── Error ──
  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-text-secondary">
        <span className="material-symbols-outlined text-[56px] text-outline-variant">
          calendar_today
        </span>
        <p className="font-medium text-text-primary">Data tidak ditemukan.</p>
        <button
          onClick={() => navigate(`/operator/master/tahun-ajaran`)}
          className="text-primary text-sm hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>
          Kembali
        </button>
      </div>
    );
  }

  // ── Extract Data ──
  const ta = data.data;
  const semesters = ta.semesters ?? [];
  const semester = semesters.find(
    (s) => s.nama?.toLowerCase() === semesterNama?.toLowerCase(),
  );

  if (!semester) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-text-secondary">
        <span className="material-symbols-outlined text-[56px] text-outline-variant">
          event_busy
        </span>
        <p className="font-medium text-text-primary">
          Semester &ldquo;{semesterNama}&rdquo; tidak ditemukan.
        </p>
        <button
          onClick={() => navigate(`/operator/master/tahun-ajaran/${taId}`)}
          className="text-primary text-sm hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>
          Kembali ke Tahun Ajaran
        </button>
      </div>
    );
  }

  const kelasList = data.kelas ?? [];
  const kalenderAll = data.kalender ?? [];
  const aktivitas = data.aktivitas ?? [];
  const checklist = data.checklist ?? {};

  const tglMulai = semester.tgl_mulai;
  const tglSelesai = semester.tgl_selesai;

  // Filter kalender relevan dengan rentang semester
  const kalender = kalenderAll.filter((k) => {
    if (!tglMulai || !k.tanggal_mulai) return true;
    const tgl = new Date(k.tanggal_mulai);
    const start = new Date(tglMulai);
    const end = tglSelesai ? new Date(tglSelesai) : null;
    return tgl >= start && (end == null || tgl <= end);
  });

  // Hitung stats
  const progress = calcProgress(tglMulai, tglSelesai);
  const totalHari = daysBetween(tglMulai, tglSelesai);
  const hariSisa = Math.max(0, daysRemaining(tglSelesai) ?? 0);
  const hariBerjalan =
    totalHari != null ? Math.max(0, totalHari - hariSisa) : null;
  const totalMinggu = weeksBetween(tglMulai, tglSelesai);

  const isAktif = semester.is_active;
  const isTaAktif = ta.is_active;

  // Health score dari checklist
  const checkValues = Object.values(checklist);
  const healthScore = checkValues.length
    ? Math.round(
        (checkValues.filter(Boolean).length / checkValues.length) * 100,
      )
    : 0;

  // Alerts dinamis
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

  // Kelas yang relevan semester ini
  const kelasFilter = kelasList.filter(
    (k) =>
      k.semester?.toLowerCase() === semesterNama?.toLowerCase() ||
      !k.semester ||
      k.semester === "-",
  );
  const totalSiswa = kelasFilter.reduce((s, k) => s + (k.total_siswa ?? 0), 0);
  const totalKelas = kelasFilter.length;

  const semLain = semesters.find((s) => s.nama !== semester.nama);

  return (
    <>
      <ModalEditSemester
        open={showEditModal}
        semester={semester}
        tahunAjaran={ta}
        tahunAjaranId={taId}
        onClose={() => setShowEditModal(false)}
        queryClient={queryClient}
      />

      <div className="w-full space-y-6 pb-12">
        {/* ── Page Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-text-secondary mb-2 font-medium flex-wrap">
              <Link
                to="/operator/master/tahun-ajaran"
                className="hover:text-primary transition-colors"
              >
                Tahun Ajaran
              </Link>
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
              <Link
                to={`/operator/master/tahun-ajaran/${taId}`}
                className="hover:text-primary transition-colors"
              >
                {ta.tahun}
              </Link>
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
              <span className="text-on-surface">Semester {semester.nama}</span>
            </nav>

            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary font-headline tracking-tight">
                Detail Semester {semester.nama} {ta.tahun}
              </h2>
              <StatusBadge active={isAktif} />
            </div>
            <p className="text-sm text-text-secondary mt-1">
              {fmt(tglMulai)} &mdash; {fmt(tglSelesai)}
              {totalHari != null && ` · ${totalHari} hari`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => navigate("/operator/master/tahun-ajaran")}
              className="px-4 py-2 bg-white border border-border-light/60 text-on-surface rounded-xl font-medium hover:bg-surface-container-low transition-colors flex items-center gap-2 text-sm shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">
                arrow_back
              </span>
              Kembali
            </button>

            {isTaAktif && !isAktif && (
              <button
                onClick={() => {
                  if (confirm(`Aktifkan Semester ${semester.nama}?`))
                    setSemAktif.mutate();
                }}
                disabled={setSemAktif.isPending}
                className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-primary-container rounded-xl font-semibold text-sm hover:bg-emerald-100 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[16px]">
                  check_circle
                </span>
                Set Aktif
              </button>
            )}

            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-primary-container text-white rounded-xl font-semibold hover:bg-primary-container/90 transition-colors flex items-center gap-2 shadow-sm text-sm"
            >
              <span className="material-symbols-outlined text-[16px]">
                edit
              </span>
              Edit Semester
            </button>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Academic Summary */}
            <div className="bg-white border border-border-light/40 rounded-[18px] p-6 shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgb(0,0,0,0.06)] transition-shadow">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold text-text-primary">
                  Ringkasan Akademik
                </h3>
                <span className="px-2.5 py-1 bg-emerald-50 text-primary-container text-xs font-bold rounded-lg border border-emerald-200/60">
                  Semester {semester.nama}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-text-secondary">
                    Progress Semester
                  </span>
                  <span className="text-lg font-bold text-primary-container">
                    {progress}%
                  </span>
                </div>
                <ProgressBar value={progress} />
              </div>

              {/* Stat 3-col */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-surface-bright p-3 rounded-xl border border-border-light/30 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-text-secondary mb-1">
                    Hari Berjalan
                  </p>
                  <p className="text-xl font-bold text-text-primary">
                    {hariBerjalan ?? "-"}
                  </p>
                </div>
                <div className="bg-surface-bright p-3 rounded-xl border border-border-light/30 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-text-secondary mb-1">
                    Total Minggu
                  </p>
                  <p className="text-xl font-bold text-text-primary">
                    {totalMinggu ?? "-"}
                  </p>
                </div>
                <div className="bg-surface-bright p-3 rounded-xl border border-border-light/30 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-text-secondary mb-1">
                    Sisa Hari
                  </p>
                  <p
                    className={`text-xl font-bold ${hariSisa > 0 && hariSisa <= 14 ? "text-danger" : "text-text-primary"}`}
                  >
                    {hariSisa}
                  </p>
                </div>
              </div>

              {/* Stats grid 2x2 */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: "Total Kelas", value: totalKelas },
                  { label: "Total Siswa", value: totalSiswa },
                  { label: "Guru Mengajar", value: data.total_guru ?? "-" },
                  { label: "Mata Pelajaran", value: data.total_mapel ?? "-" },
                  { label: "Wali Kelas", value: data.total_wali_kelas ?? "-" },
                  { label: "Total Jadwal", value: data.total_jadwal ?? "-" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between p-2.5 bg-surface-bright rounded-xl border border-border-light/30"
                  >
                    <span className="text-text-secondary font-medium">
                      {s.label}
                    </span>
                    <span className="font-bold text-text-primary">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Semester Health */}
            <div className="bg-white border border-border-light/40 rounded-[18px] p-6 shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgb(0,0,0,0.06)] transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-text-primary">
                  Semester Health
                </h3>
                <div
                  className={`text-lg font-bold px-3 py-1 rounded-full border ${
                    healthScore >= 80
                      ? "bg-emerald-50 text-primary-container border-emerald-200/60"
                      : healthScore >= 50
                        ? "bg-amber-50 text-warning border-amber-200/60"
                        : "bg-red-50 text-danger border-red-200/60"
                  }`}
                >
                  {healthScore}%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                {[
                  { key: "ta_dibuat", label: "Tahun Ajaran Dibuat" },
                  { key: "semester_dibuat", label: "Semester Dibuat" },
                  { key: "rombel_dibuat", label: "Rombel Tersedia" },
                  { key: "guru_mengajar", label: "Guru Mengajar" },
                  { key: "mapel_lengkap", label: "Mapel Lengkap" },
                  { key: "wali_kelas", label: "Wali Kelas" },
                  { key: "jadwal_selesai", label: "Jadwal Selesai" },
                  { key: "kalender", label: "Kalender Diisi" },
                  { key: "siswa_terdistribusi", label: "Siswa Terdistribusi" },
                  { key: "kepsek_dikunci", label: "Profil Kepsek Lengkap" },
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    className={`flex items-center gap-2 text-xs ${
                      checklist[key]
                        ? "text-text-primary"
                        : "text-warning font-semibold"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[16px] shrink-0 ${
                        checklist[key]
                          ? "text-primary-container"
                          : "text-warning"
                      }`}
                    >
                      {checklist[key] ? "check_circle" : "warning"}
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Alert Center */}
            {alerts.length > 0 && (
              <div className="bg-red-50/30 border border-red-100 rounded-[18px] p-6 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                <h3 className="text-base font-semibold text-danger mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    notifications_active
                  </span>
                  Alert Center
                </h3>
                <div className="space-y-2">
                  {alerts.map((alert, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-2 bg-white/50 rounded-lg border ${
                        alert.level === "tinggi"
                          ? "border-red-100"
                          : "border-orange-100"
                      }`}
                    >
                      <span className="text-xs font-medium text-text-primary">
                        {alert.msg}
                      </span>
                      <AlertBadge level={alert.level} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daftar Kelas */}
            {kelasFilter.length > 0 && (
              <div className="bg-white border border-border-light/40 rounded-[18px] p-6 shadow-[0_2px_8px_rgb(0,0,0,0.04)]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-text-primary">
                    Daftar Kelas
                  </h3>
                  <span className="text-xs font-bold text-primary-container bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                    {totalKelas} Kelas &middot; {totalSiswa} Siswa
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-light/60">
                        {["Kelas", "Wali Kelas", "Siswa", "Ruangan"].map(
                          (h) => (
                            <th
                              key={h}
                              className="text-left py-2.5 px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light/40">
                      {kelasFilter.map((k) => (
                        <tr
                          key={k.id}
                          className="hover:bg-surface-bright transition-colors cursor-pointer"
                          onClick={() =>
                            navigate(`/operator/master/kelas/${k.id}`)
                          }
                        >
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                                {k.tingkat}
                              </div>
                              <span className="font-medium text-text-primary text-xs">
                                {k.nama_kelas}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-xs text-text-secondary">
                            {k.nama_wali}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-xs font-bold text-text-primary">
                              {k.total_siswa}
                            </span>
                            {k.kapasitas && (
                              <span className="text-text-secondary text-xs">
                                /{k.kapasitas}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-xs text-text-secondary">
                            {k.ruangan || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Info Semester */}
            <div className="bg-white border border-border-light/40 rounded-[18px] p-6 shadow-[0_2px_8px_rgb(0,0,0,0.04)]">
              <h3 className="text-base font-semibold text-text-primary mb-4">
                Status Semester
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: "Status",
                    value: isAktif ? "Aktif" : "Tidak Aktif",
                    dot: isAktif ? "bg-primary-container" : "bg-text-secondary",
                    color: isAktif
                      ? "text-primary-container"
                      : "text-text-secondary",
                  },
                  {
                    label: "Nama",
                    value: `${semester.nama} – ${ta.tahun}`,
                    dot: "bg-info",
                    color: "text-info",
                  },
                  {
                    label: "Tanggal Mulai",
                    value: fmt(tglMulai),
                    dot: "bg-border-light",
                    color: "text-text-primary",
                  },
                  {
                    label: "Tanggal Selesai",
                    value: fmt(tglSelesai),
                    dot: "bg-border-light",
                    color: "text-text-primary",
                  },
                  {
                    label: "Tahun Ajaran",
                    value: isTaAktif ? `${ta.tahun} (Aktif)` : ta.tahun,
                    dot: isTaAktif
                      ? "bg-primary-container"
                      : "bg-text-secondary",
                    color: isTaAktif
                      ? "text-primary-container"
                      : "text-text-secondary",
                  },
                  {
                    label: "Kurikulum",
                    value: kelasList[0]?.kurikulum ?? "-",
                    dot: "bg-border-light",
                    color: "text-text-primary",
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between items-center p-3 bg-surface-bright rounded-xl border border-border-light/40"
                  >
                    <span className="text-sm text-text-primary font-medium">
                      {row.label}
                    </span>
                    <span
                      className={`flex items-center gap-1.5 text-sm font-semibold ${row.color}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${row.dot} shrink-0`}
                      />
                      {row.value}
                    </span>
                  </div>
                ))}

                {/* Switch semester */}
                {semLain && (
                  <div className="pt-2 border-t border-border-light/60 flex items-center justify-between">
                    <p className="text-xs text-text-secondary">
                      Semester lain:{" "}
                      <span className="font-semibold text-primary">
                        {semLain.nama}
                      </span>
                    </p>
                    <Link
                      to={`/operator/master/tahun-ajaran/${taId}/semester/${semLain.nama}`}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        swap_horiz
                      </span>
                      Lihat {semLain.nama}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-border-light/40 rounded-[18px] p-6 shadow-[0_2px_8px_rgb(0,0,0,0.04)]">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 px-1">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    icon: "edit_note",
                    label: "Input Nilai",
                    to: "/operator/master/jadwal-pelajaran",
                  },
                  {
                    icon: "calendar_month",
                    label: "Kelola Jadwal",
                    to: "/operator/master/jadwal-pelajaran",
                  },
                  {
                    icon: "event_add",
                    label: "Tambah Event",
                    to: "/kepsek/kalender",
                  },
                  {
                    icon: "file_upload",
                    label: "Import Nilai",
                    to: null,
                    comingSoon: true,
                  },
                  {
                    icon: "print",
                    label: "Cetak Rapor",
                    to: null,
                    comingSoon: true,
                  },
                  {
                    icon: "bar_chart",
                    label: "Monitoring",
                    to: `/operator/master/tahun-ajaran/${taId}`,
                  },
                ].map((action) =>
                  action.to ? (
                    <Link
                      key={action.label}
                      to={action.to}
                      className="flex items-center gap-2 px-3 py-2.5 bg-white hover:bg-surface-bright border border-border-light/40 rounded-xl transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px] text-primary-container">
                        {action.icon}
                      </span>
                      <span className="font-medium text-text-primary text-xs">
                        {action.label}
                      </span>
                    </Link>
                  ) : action.comingSoon ? (
                    <div
                      key={action.label}
                      title="Fitur belum tersedia"
                      className="relative flex items-center gap-2 px-3 py-2.5 bg-surface-container border border-border-light/40 rounded-xl cursor-not-allowed opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px] text-text-secondary">
                        {action.icon}
                      </span>
                      <span className="font-medium text-text-secondary text-xs">
                        {action.label}
                      </span>
                      <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1 py-0.5 rounded bg-outline-variant text-text-secondary leading-none">
                        Segera
                      </span>
                    </div>
                  ) : (
                    <button
                      key={action.label}
                      onClick={() => toast("Fitur segera hadir 🚧")}
                      className="flex items-center gap-2 px-3 py-2.5 bg-white hover:bg-surface-bright border border-border-light/40 rounded-xl transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px] text-primary-container">
                        {action.icon}
                      </span>
                      <span className="font-medium text-text-primary text-xs">
                        {action.label}
                      </span>
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Kalender Timeline */}
            <div className="bg-white border border-border-light/40 rounded-[18px] p-6 shadow-[0_2px_8px_rgb(0,0,0,0.04)]">
              <h3 className="text-base font-semibold text-text-primary mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-text-secondary">
                  calendar_today
                </span>
                Kalender Semester
              </h3>

              {kalender.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  <span className="material-symbols-outlined text-[40px] text-outline-variant">
                    event_busy
                  </span>
                  <p className="text-sm mt-2">Belum ada event kalender.</p>
                  <Link
                    to="/kepsek/kalender"
                    className="text-primary text-xs font-semibold hover:underline mt-1 inline-block"
                  >
                    Tambah event →
                  </Link>
                </div>
              ) : (
                <div className="relative border-l border-border-light/60 ml-3 space-y-5 pb-2">
                  {kalender.slice(0, 8).map((item) => (
                    <KalenderItem key={item.id} item={item} />
                  ))}
                  {kalender.length > 8 && (
                    <p className="pl-6 text-xs text-text-secondary font-medium">
                      +{kalender.length - 8} event lainnya...
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Aktivitas Terbaru */}
            {aktivitas.length > 0 && (
              <div className="bg-white border border-border-light/40 rounded-[18px] p-6 shadow-[0_2px_8px_rgb(0,0,0,0.04)]">
                <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-text-secondary">
                    history
                  </span>
                  Aktivitas Terbaru
                </h3>
                <div className="space-y-3">
                  {aktivitas.slice(0, 5).map((a) => (
                    <div key={a.id} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-container mt-1.5 shrink-0" />
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        <span className="font-bold text-text-primary">
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}
