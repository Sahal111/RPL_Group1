import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

// ── Helpers ─────────────────────────────────────────────────────────────────
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
  return Math.round((new Date(end) - new Date()) / 86400000);
}

function calcProgress(start, end) {
  if (!start || !end) return 0;
  const total = daysBetween(start, end);
  if (!total) return 0;
  const elapsed = total - (daysRemaining(end) ?? 0);
  return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-[18px] p-5 border border-border-light animate-pulse">
      <div className="w-10 h-10 bg-surface-container-high rounded-xl mb-4" />
      <div className="h-3 w-24 bg-surface-container-high rounded mb-2" />
      <div className="h-6 w-32 bg-surface-container-high rounded" />
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  badge,
  badgeText,
  iconBg = "bg-primary/10",
  iconColor = "text-primary",
  extra,
}) {
  return (
    <div className="bg-white rounded-[18px] p-5 border border-border-light shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] -z-0 group-hover:scale-110 transition-transform" />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div
          className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}
        >
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        {badge && (
          <span className={`text-xs font-medium px-2 py-1 rounded-md ${badge}`}>
            {badgeText}
          </span>
        )}
      </div>
      <h3 className="text-sm text-text-secondary mb-1 relative z-10">
        {label}
      </h3>
      <div className="text-2xl font-bold text-text-primary font-headline-md relative z-10">
        {value}
      </div>
      {extra && <div className="relative z-10">{extra}</div>}
    </div>
  );
}

// ── Semester Card ─────────────────────────────────────────────────────────────
function SemesterCard({ semester, isActive }) {
  if (!semester) return null;

  const progress = calcProgress(semester.tgl_mulai, semester.tgl_selesai);
  const sisa = daysRemaining(semester.tgl_selesai);

  return (
    <div
      className={`rounded-xl p-4 relative ${
        isActive
          ? "border-2 border-primary/20 bg-primary/5"
          : "border border-border-light bg-surface-container-lowest opacity-80 hover:opacity-100 transition-opacity"
      }`}
    >
      {(() => {
        const now = new Date();
        if (isActive)
          return (
            <div className="absolute top-4 right-4 flex items-center gap-1 text-success text-xs font-semibold bg-white px-2 py-1 rounded shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />{" "}
              Running
            </div>
          );
        if (!semester.tgl_mulai || new Date(semester.tgl_mulai) > now)
          return (
            <div className="absolute top-4 right-4 flex items-center gap-1 text-info text-xs font-medium bg-info/10 px-2 py-1 rounded">
              Akan Datang
            </div>
          );
        return (
          <div className="absolute top-4 right-4 flex items-center gap-1 text-text-secondary text-xs font-medium bg-surface-container px-2 py-1 rounded">
            Selesai
          </div>
        );
      })()}
      <h4 className="font-semibold text-text-primary text-base mb-1">
        Semester {semester.nama}
      </h4>
      <p className="text-sm text-text-secondary mb-4 flex items-center gap-1">
        <span className="material-symbols-outlined text-[16px]">event</span>
        {fmt(semester.tgl_mulai)} – {fmt(semester.tgl_selesai)}
      </p>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-text-secondary font-medium">
          <span>Progress</span>
          <span>{isActive ? `${progress}%` : "0%"}</span>
        </div>
        <div
          className={`w-full rounded-full h-2 overflow-hidden shadow-inner ${isActive ? "bg-white" : "bg-surface-container-high"}`}
        >
          <div
            className={`h-full rounded-full ${isActive ? "bg-primary" : "bg-border-light"}`}
            style={{ width: isActive ? `${progress}%` : "0%" }}
          />
        </div>
      </div>
      <div
        className={`mt-4 pt-4 flex justify-between items-center ${isActive ? "border-t border-primary/10" : "border-t border-border-light"}`}
      >
        <span className="text-xs text-text-secondary">
          {isActive && sisa !== null
            ? `${Math.max(0, sisa)} hari tersisa`
            : "Belum dimulai"}
        </span>
        <span className="text-xs text-text-secondary font-medium">
          {semester.is_active ? "Aktif" : "Nonaktif"}
        </span>
      </div>
    </div>
  );
}

// ── Rombel Row ────────────────────────────────────────────────────────────────
function RombelRow({ tingkat, jumlah_kelas, jumlah_siswa, dotColor }) {
  return (
    <div className="flex items-center justify-between p-2 rounded hover:bg-surface-container-low transition-colors">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="text-sm font-medium">Kelas {tingkat}</span>
      </div>
      <div className="text-sm flex gap-4">
        <span className="text-text-secondary">{jumlah_kelas} Rombel</span>
        <span className="font-semibold">{jumlah_siswa} Siswa</span>
      </div>
    </div>
  );
}

const ROMBEL_COLORS = [
  "bg-primary",
  "bg-accent-gold",
  "bg-info",
  "bg-tertiary",
  "bg-success",
  "bg-warning",
];

// ── Kelas Table ───────────────────────────────────────────────────────────────
function KelasTable({ kelasList, totalKelas, totalSiswa, navigate }) {
  return (
    <div className="bg-white rounded-[20px] border border-border-light shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border-light flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-info text-[20px]">
            school
          </span>
          <h3 className="text-section-title font-section-title text-text-primary">
            Daftar Kelas
          </h3>
        </div>
        <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
          {totalKelas} kelas
        </span>
      </div>

      {kelasList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
          <span className="material-symbols-outlined text-[48px] text-outline-variant mb-3">
            school
          </span>
          <p className="font-medium">Belum ada kelas pada tahun ajaran ini</p>
          <button
            onClick={() => navigate("/operator/master/kelas")}
            className="mt-3 text-primary text-sm hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Buat kelas baru
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-surface-container text-text-secondary uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Nama Kelas</th>
                <th className="px-5 py-3 text-left">Tingkat</th>
                <th className="px-5 py-3 text-left">Semester</th>
                <th className="px-5 py-3 text-left">Wali Kelas</th>
                <th className="px-5 py-3 text-left">Kurikulum</th>
                <th className="px-5 py-3 text-left">Ruangan</th>
                <th className="px-5 py-3 text-center">Kapasitas</th>
                <th className="px-5 py-3 text-center">Siswa Aktif</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-sm">
              {kelasList.map((k) => (
                <tr
                  key={k.id}
                  className="hover:bg-surface-container-lowest transition-colors"
                >
                  <td className="px-5 py-3 font-semibold text-text-primary">
                    {k.nama_kelas}
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                      Tingkat {k.tingkat}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-text-secondary">
                    Semester {k.semester}
                  </td>
                  <td className="px-5 py-3 text-text-secondary">
                    {k.nama_wali !== "-" ? (
                      k.nama_wali
                    ) : (
                      <span className="text-outline-variant italic">
                        Belum ditentukan
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1 text-text-secondary">
                      <span className="material-symbols-outlined text-[13px] text-outline-variant">
                        menu_book
                      </span>
                      {k.kurikulum}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {k.ruangan ? (
                      <span className="flex items-center gap-1 text-text-secondary">
                        <span className="material-symbols-outlined text-[13px] text-outline-variant">
                          location_on
                        </span>
                        {k.ruangan}
                      </span>
                    ) : (
                      <span className="text-outline-variant italic">-</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center text-text-secondary">
                    {k.kapasitas}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`font-semibold ${
                        k.total_siswa >= k.kapasitas
                          ? "text-danger"
                          : k.total_siswa >= k.kapasitas * 0.8
                            ? "text-warning"
                            : "text-success"
                      }`}
                    >
                      {k.total_siswa}
                    </span>
                    <span className="text-text-secondary text-xs">
                      /{k.kapasitas}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {k.is_active ? (
                      <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium border border-success/20">
                        Aktif
                      </span>
                    ) : (
                      <span className="text-xs bg-surface-variant text-text-secondary px-2 py-0.5 rounded-full font-medium border border-outline-variant/30">
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => navigate(`/operator/master/kelas/${k.id}`)}
                      className="text-primary hover:text-on-primary-fixed-variant text-xs font-medium hover:underline"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-surface-container">
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-3 text-sm font-semibold text-text-primary"
                >
                  Total: {totalKelas} Kelas
                </td>
                <td className="px-5 py-3 text-center text-sm font-semibold text-text-primary">
                  {totalSiswa}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DetailTahunAjaran() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["detail-tahun-ajaran", id],
    queryFn: () =>
      api.get(`/operator/master-data/tahun-ajaran/${id}`).then((r) => r.data),
  });

  const setAktif = useMutation({
    mutationFn: () =>
      api.patch(`/operator/master-data/tahun-ajaran/${id}/aktif`),
    onSuccess: () => {
      toast.success("Tahun ajaran berhasil diaktifkan.");
      queryClient.invalidateQueries(["detail-tahun-ajaran", id]);
      queryClient.invalidateQueries(["tahun-ajaran"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal mengaktifkan."),
  });

  const hapus = useMutation({
    mutationFn: () => api.delete(`/operator/master-data/tahun-ajaran/${id}`),
    onSuccess: () => {
      toast.success("Tahun ajaran dihapus.");
      navigate("/operator/master/tahun-ajaran");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus."),
  });

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 w-full max-w-container-max mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="h-64 bg-white rounded-[20px] border border-border-light animate-pulse" />
      </div>
    );
  }

  // ── Error ──
  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-text-secondary">
        <span className="material-symbols-outlined text-[56px] text-outline-variant">
          calendar_today
        </span>
        <p className="font-medium text-text-primary">
          Tahun ajaran tidak ditemukan.
        </p>
        <button
          onClick={() => navigate("/operator/master/tahun-ajaran")}
          className="text-primary text-sm hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>
          Kembali ke daftar
        </button>
      </div>
    );
  }

  const ta = data.data;
  const kelasList = data.kelas ?? [];
  const totalKelas = data.total_kelas ?? 0;
  const totalSiswa = data.total_siswa ?? 0;
  const distribusi = data.distribusi_tingkat ?? [];
  const totalGuru = data.total_guru ?? 0;
  const totalMapel = data.total_mapel ?? 0;
  const totalWaliKelas = data.total_wali_kelas ?? 0;
  const totalRuangan = data.total_ruangan ?? 0;
  const totalJadwal = data.total_jadwal ?? 0;
  const kalender = data.kalender ?? [];
  const aktivitas = data.aktivitas ?? [];
  const taPrev = data.ta_prev ?? null;
  const taNext = data.ta_next ?? null;
  const checklist = data.checklist ?? {};
  const semesters = ta.semesters ?? [];
  const ganjil = semesters.find((s) => s.nama === "Ganjil");
  const genap = semesters.find((s) => s.nama === "Genap");
  const semAktif = semesters.find((s) => s.is_active);

  const progressTA = calcProgress(ta.tanggal_mulai, ta.tanggal_selesai);
  const hariTotal = daysBetween(ta.tanggal_mulai, ta.tanggal_selesai);
  const hariSisaTA = daysRemaining(ta.tanggal_selesai);
  const hariBerjalan =
    hariTotal !== null && hariSisaTA !== null ? hariTotal - hariSisaTA : null;

  const hariSisaSem = semAktif ? daysRemaining(semAktif.tgl_selesai) : null;
  const progressSem = semAktif
    ? calcProgress(semAktif.tgl_mulai, semAktif.tgl_selesai)
    : 0;

  return (
    <div className="w-full space-y-6 pb-12 opacity-0 animate-fade-up">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-xs text-text-secondary">
        <span>Dashboard</span>
        <span className="material-symbols-outlined text-[14px]">
          chevron_right
        </span>
        <span>Master Data</span>
        <span className="material-symbols-outlined text-[14px]">
          chevron_right
        </span>
        <button
          onClick={() => navigate("/operator/master/tahun-ajaran")}
          className="hover:text-primary transition-colors"
        >
          Tahun Ajaran
        </button>
        <span className="material-symbols-outlined text-[14px]">
          chevron_right
        </span>
        <span className="text-primary font-semibold">Detail</span>
      </nav>

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2
              className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-text-primary tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Tahun Ajaran {ta.nama ?? ta.tahun}
            </h2>
            {ta.is_active ? (
              <span className="px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-semibold border border-success/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Active
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-surface-variant text-text-secondary text-xs font-semibold border border-outline-variant/30">
                Non-aktif
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary">
            Ringkasan operasional dan pengelolaan tahun ajaran ini.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => navigate("/operator/master/tahun-ajaran")}
            className="px-4 py-2 rounded-lg border border-border-light bg-white text-text-primary text-sm font-medium hover:bg-surface-container-low transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Kembali
          </button>
          {!ta.is_active && (
            <button
              onClick={() => {
                if (
                  confirm(`Jadikan "${ta.tahun}" sebagai tahun ajaran aktif?`)
                )
                  setAktif.mutate();
              }}
              disabled={setAktif.isPending}
              className="px-4 py-2 rounded-lg border border-success/30 bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">
                check_circle
              </span>
              Aktifkan
            </button>
          )}
          <button
            onClick={() =>
              navigate("/operator/master/tahun-ajaran", {
                state: { editId: ta.id },
              })
            }
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tahun Ajaran */}
        <StatCard
          icon="calendar_month"
          label="Tahun Ajaran"
          value={ta.tahun}
          badge="text-text-secondary bg-surface-container-low"
          badgeText="Periode"
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />

        {/* Semester Aktif */}
        <StatCard
          icon="star"
          label="Semester Aktif"
          value={
            semAktif
              ? `${semAktif.nama} (${semAktif.nama === "Ganjil" ? "1" : "2"})`
              : "-"
          }
          badge="text-text-secondary bg-surface-container-low"
          badgeText="Current"
          iconBg="bg-accent-gold/20"
          iconColor="text-accent-gold"
        />

        {/* Progress Hari */}
        <StatCard
          icon="timeline"
          label="Progress Hari"
          value={`${progressSem}%`}
          badge="text-info bg-info/10"
          badgeText={hariBerjalan !== null ? `Hari ke-${hariBerjalan}` : "—"}
          iconBg="bg-info/10"
          iconColor="text-info"
          extra={
            <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-info h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${progressSem}%` }}
              />
            </div>
          }
        />

        {/* Sisa Hari Semester */}
        <StatCard
          icon="hourglass_empty"
          label="Sisa Hari (Semester)"
          value={
            hariSisaSem !== null ? `${Math.max(0, hariSisaSem)} hari` : "-"
          }
          badge="text-text-secondary bg-surface-container-low"
          badgeText="Countdown"
          iconBg="bg-warning/10"
          iconColor="text-warning"
        />

        {/* Total Kelas */}
        <StatCard
          icon="groups"
          label="Total Kelas Aktif"
          value={totalKelas}
          badge="text-text-secondary bg-surface-container-low"
          badgeText="Rombel"
          iconBg="bg-success/10"
          iconColor="text-success"
        />

        {/* Total Siswa */}
        <StatCard
          icon="people"
          label="Total Siswa"
          value={totalSiswa}
          badge="text-text-secondary bg-surface-container-low"
          badgeText="Aktif"
          iconBg="bg-tertiary/10"
          iconColor="text-tertiary"
        />
      </div>

      {/* ── Timeline Akademik ── */}
      <div className="bg-white rounded-[20px] border border-border-light shadow-sm p-6 overflow-hidden">
        <h3
          className="text-section-title font-section-title text-text-primary mb-6"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Timeline Akademik
        </h3>
        <div className="relative max-w-full overflow-x-auto pb-4">
          <div className="min-w-[600px] relative px-4">
            {/* Track */}
            <div className="absolute top-[22px] left-4 right-4 h-1 bg-surface-container-high rounded-full" />
            {/* Active Track */}
            <div
              className="absolute top-[22px] left-4 h-1 bg-primary rounded-full transition-all duration-700"
              style={{ width: `${Math.min(progressTA, 100) * 0.8}%` }}
            />
            <div className="relative flex justify-between items-start z-10">
              {[
                { label: "Awal TA", date: fmt(ta.tanggal_mulai), done: true },
                {
                  label:
                    semAktif?.nama === "Ganjil"
                      ? "Semester Ganjil"
                      : "Semester Genap",
                  date: semAktif ? fmt(semAktif.tgl_mulai) : "—",
                  current: !!semAktif,
                  done: false,
                },
                {
                  label: "UAS Ganjil",
                  date: ganjil ? fmt(ganjil.tgl_selesai) : "—",
                  done: false,
                },
                {
                  label: "Awal Genap",
                  date: genap ? fmt(genap.tgl_mulai) : "—",
                  done: false,
                },
                {
                  label: "Akhir TA",
                  date: fmt(ta.tanggal_selesai),
                  done: false,
                },
              ].map((point, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  {point.current ? (
                    <>
                      <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary text-white animate-bounce mb-1">
                        NOW
                      </div>
                      <div className="w-5 h-5 bg-white border-4 border-primary rounded-full" />
                    </>
                  ) : (
                    <div
                      className={`w-4 h-4 rounded-full mt-[3px] ${
                        point.done
                          ? "bg-primary ring-4 ring-primary/20"
                          : "bg-white border-2 border-outline-variant"
                      }`}
                    />
                  )}
                  <div
                    className={`text-xs font-semibold text-center ${point.done || point.current ? "text-text-primary" : "text-text-secondary"}`}
                  >
                    {point.label}
                  </div>
                  <div className="text-[10px] text-text-secondary text-center">
                    {point.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col (span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Semester Management */}
          <div className="bg-white rounded-[20px] border border-border-light shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3
                  className="text-section-title font-section-title text-text-primary flex items-center gap-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  <span className="material-symbols-outlined text-primary">
                    view_timeline
                  </span>
                  Semester Management
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  Timeline and operational status for periods.
                </p>
              </div>
              <button
                onClick={() =>
                  navigate("/operator/master/tahun-ajaran", {
                    state: { editId: ta.id },
                  })
                }
                className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors"
                title="Edit"
              >
                <span className="material-symbols-outlined">edit_calendar</span>
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <SemesterCard
                semester={ganjil}
                isActive={ganjil?.is_active ?? false}
              />
              <SemesterCard
                semester={genap}
                isActive={genap?.is_active ?? false}
              />
            </div>
            {ta.is_active && (
              <div className="mt-4 pt-4 border-t border-border-light flex items-center justify-between">
                <p className="text-sm text-text-secondary">
                  Semester aktif:{" "}
                  <span className="font-semibold text-primary">
                    {semAktif?.nama ?? "-"}
                  </span>
                </p>
                <button
                  onClick={() => {
                    const target =
                      semAktif?.nama === "Ganjil" ? "Genap" : "Ganjil";
                    if (confirm(`Pindah ke Semester ${target}?`))
                      api
                        .patch(
                          `/operator/master-data/tahun-ajaran/${id}/semester-aktif`,
                          {
                            semester_nama: target,
                          },
                        )
                        .then(() => {
                          toast.success(`Semester ${target} diaktifkan.`);
                          queryClient.invalidateQueries([
                            "detail-tahun-ajaran",
                            id,
                          ]);
                          queryClient.invalidateQueries(["tahun-ajaran"]);
                        })
                        .catch(() => toast.error("Gagal mengganti semester."));
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    swap_horiz
                  </span>
                  Pindah ke Semester{" "}
                  {semAktif?.nama === "Ganjil" ? "Genap" : "Ganjil"}
                </button>
              </div>
            )}
          </div>

          {/* Kebijakan Kurikulum + Rombel (grid) */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Kebijakan Kurikulum */}
            <div className="bg-white rounded-[20px] border border-border-light shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-accent-gold">
                    menu_book
                  </span>
                  <h3
                    className="text-section-title font-section-title text-text-primary"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Kebijakan Kurikulum
                  </h3>
                </div>
                <p className="text-sm text-text-secondary mb-4">
                  Basis pembelajaran dan evaluasi tahun ini.
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-lg border border-border-light">
                    <span className="text-sm text-text-secondary">
                      Versi Kurikulum
                    </span>
                    <span className="text-xs font-semibold text-text-primary">
                      Merdeka (Rev 2024)
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-lg border border-border-light">
                    <span className="text-sm text-text-secondary">
                      Standar Penilaian
                    </span>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
                      Skala 0-100
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-lg border border-border-light">
                    <span className="text-sm text-text-secondary">
                      KKM / KKTP Global
                    </span>
                    <span className="px-2 py-1 bg-accent-gold/10 text-accent-gold text-xs font-semibold rounded">
                      75.00
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rombongan Belajar */}
            <div className="bg-white rounded-[20px] border border-border-light shadow-sm p-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-info">
                  groups
                </span>
                <h3
                  className="text-section-title font-section-title text-text-primary"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Rombongan Belajar
                </h3>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                Distribusi kelas aktif.
              </p>

              {distribusi.length === 0 ? (
                <div className="text-center py-8 text-text-secondary text-sm">
                  <span className="material-symbols-outlined text-[32px] text-outline-variant block mb-2">
                    school
                  </span>
                  Belum ada kelas
                </div>
              ) : (
                <div className="space-y-3">
                  {distribusi.map((d, i) => (
                    <RombelRow
                      key={d.tingkat}
                      tingkat={d.tingkat}
                      jumlah_kelas={d.jumlah_kelas}
                      jumlah_siswa={d.jumlah_siswa}
                      dotColor={ROMBEL_COLORS[i % ROMBEL_COLORS.length]}
                    />
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border-light flex justify-between items-center">
                <div className="text-sm font-semibold text-text-primary">
                  Total: {totalKelas} Kelas
                </div>
                <div className="text-sm font-semibold text-text-primary">
                  {totalSiswa} Siswa
                </div>
              </div>
            </div>
          </div>
          {/* ── Daftar Kelas Table ── */}
          <KelasTable
            kelasList={kelasList}
            totalKelas={totalKelas}
            totalSiswa={totalSiswa}
            navigate={navigate}
          />

          {/* ── Checklist Kesiapan ── */}
          {(() => {
            const items = [
              { key: "ta_dibuat", label: "Tahun Ajaran dibuat" },
              {
                key: "semester_dibuat",
                label: "Semester dibuat (Ganjil & Genap)",
              },
              { key: "rombel_dibuat", label: "Rombel / Kelas dibuat" },
              { key: "guru_mengajar", label: "Guru mengajar ditugaskan" },
              { key: "mapel_lengkap", label: "Mata Pelajaran tersedia" },
              { key: "wali_kelas", label: "Wali Kelas ditentukan" },
              { key: "jadwal_selesai", label: "Jadwal pelajaran dibuat" },
              { key: "kalender", label: "Kalender Akademik diisi" },
              {
                key: "siswa_terdistribusi",
                label: "Siswa terdistribusi ke kelas",
              },
              { key: "kepsek_dikunci", label: "Kepala Sekolah dikunci" },
            ];
            const done = items.filter((i) => checklist[i.key]).length;
            const pct = Math.round((done / items.length) * 100);
            return (
              <div className="bg-white rounded-[20px] border border-border-light shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3
                      className="text-section-title font-section-title text-text-primary flex items-center gap-2"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      <span className="material-symbols-outlined text-primary">
                        checklist
                      </span>
                      Kesiapan Tahun Ajaran
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Pastikan semua item terpenuhi sebelum tahun ajaran
                      berjalan.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-2xl font-bold ${pct === 100 ? "text-success" : pct >= 60 ? "text-warning" : "text-danger"}`}
                    >
                      {pct}%
                    </span>
                    <span className="text-xs text-text-secondary">
                      {done}/{items.length} selesai
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mb-5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? "bg-success" : pct >= 60 ? "bg-warning" : "bg-danger"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                  {items.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center gap-2.5 py-1.5 border-b border-border-light/40 last:border-0"
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] shrink-0 ${checklist[item.key] ? "text-success" : "text-outline-variant"}`}
                      >
                        {checklist[item.key]
                          ? "check_circle"
                          : "radio_button_unchecked"}
                      </span>
                      <span
                        className={`text-sm ${checklist[item.key] ? "text-text-primary" : "text-text-secondary"}`}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          {/* Metrik Akademik */}
          <div className="bg-background-dark text-white rounded-[20px] p-6 relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
            <h3
              className="text-section-title font-section-title mb-4 flex items-center gap-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span className="material-symbols-outlined text-accent-gold">
                analytics
              </span>
              Metrik Akademik {semAktif ? `(${semAktif.nama})` : ""}
            </h3>
            <div className="space-y-4 relative z-10">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progress Semester</span>
                  <span className="font-semibold">{progressSem}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-success h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${progressSem}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progress Tahun Ajaran</span>
                  <span className="font-semibold">{progressTA}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-warning h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${progressTA}%` }}
                  />
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Status Cetak Rapor
                  </div>
                  {ta.is_tutup_buku ? (
                    <span className="px-2 py-1 rounded bg-emerald-700/60 text-xs font-medium text-emerald-300">
                      Terbuka
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-gray-700 text-xs font-medium text-gray-300">
                      Terkunci
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Info Periode */}
          <div className="bg-white rounded-[20px] border border-border-light shadow-sm p-6">
            <h3
              className="text-section-title font-section-title text-text-primary mb-4 flex items-center gap-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span className="material-symbols-outlined text-text-secondary">
                date_range
              </span>
              Ringkasan Periode
            </h3>
            <div className="space-y-3">
              {[
                {
                  label: "Mulai Tahun Ajaran",
                  value: fmtLong(ta.tanggal_mulai),
                  icon: "event",
                },
                {
                  label: "Selesai Tahun Ajaran",
                  value: fmtLong(ta.tanggal_selesai),
                  icon: "event_busy",
                },
                {
                  label: "Durasi Total",
                  value: hariTotal !== null ? `${hariTotal} hari` : "-",
                  icon: "hourglass_full",
                },
                {
                  label: "Hari Berjalan",
                  value:
                    hariBerjalan !== null
                      ? `${Math.max(0, hariBerjalan)} hari`
                      : "-",
                  icon: "timer",
                },
                {
                  label: "Sisa Hari (TA)",
                  value:
                    hariSisaTA !== null
                      ? `${Math.max(0, hariSisaTA)} hari`
                      : "-",
                  icon: "hourglass_empty",
                },
                {
                  label: "Total Hari Libur",
                  value:
                    ta.total_hari_libur != null
                      ? `${ta.total_hari_libur} hari`
                      : "-",
                  icon: "event_busy",
                },
                {
                  label: "Hari Efektif (Est.)",
                  value:
                    hariTotal != null && ta.total_hari_libur != null
                      ? `${Math.max(0, hariTotal - ta.total_hari_libur)} hari`
                      : "-",
                  icon: "today",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2 border-b border-border-light/60 last:border-0 gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-text-secondary">
                      {item.icon}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-text-primary text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* ── Otoritas Tanda Tangan ── */}
          <div className="bg-white rounded-[20px] border border-border-light shadow-sm p-6">
            <h3
              className="text-section-title font-section-title text-text-primary mb-4 flex items-center gap-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span className="material-symbols-outlined text-accent-gold">
                verified
              </span>
              Otoritas Tanda Tangan
            </h3>

            {ta.kepsek_nama ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-border-light">
                  <div className="w-9 h-9 rounded-full bg-accent-gold/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-accent-gold">
                      person
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-secondary mb-0.5">
                      Nama Kepala Sekolah
                    </p>
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {ta.kepsek_nama}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-border-light">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      badge
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-secondary mb-0.5">NIP</p>
                    <p className="text-sm font-semibold text-text-primary">
                      {ta.kepsek_nip || (
                        <span className="italic text-text-secondary font-normal">
                          Belum diisi
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-text-secondary flex items-start gap-1 mt-1">
                  <span className="material-symbols-outlined text-[12px] shrink-0 mt-0.5">
                    info
                  </span>
                  Data ini akan muncul sebagai footer pada rapor dan ijazah.
                  Ubah di menu Pengaturan Sekolah.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-text-secondary gap-2">
                <span className="material-symbols-outlined text-[36px] text-outline-variant">
                  manage_accounts
                </span>
                <p className="text-sm text-center">
                  Kepala Sekolah belum dikonfigurasi.
                </p>
                <button
                  onClick={() => navigate("/operator/pengaturan")}
                  className="text-primary text-xs font-medium hover:underline"
                >
                  Atur di Pengaturan →
                </button>
              </div>
            )}
          </div>
          {/* ── Status Tutup Buku ── */}
          <div className="bg-white rounded-[20px] border border-border-light shadow-sm p-6">
            <h3
              className="text-section-title font-section-title text-text-primary mb-4 flex items-center gap-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span className="material-symbols-outlined text-text-secondary">
                lock_clock
              </span>
              Status Tutup Buku
            </h3>
            <div className="space-y-3">
              <div
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  ta.is_tutup_buku
                    ? "bg-success/5 border-success/20"
                    : "bg-warning/5 border-warning/20"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[24px] ${
                    ta.is_tutup_buku ? "text-success" : "text-warning"
                  }`}
                >
                  {ta.is_tutup_buku ? "check_circle" : "pending"}
                </span>
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      ta.is_tutup_buku ? "text-success" : "text-warning"
                    }`}
                  >
                    {ta.is_tutup_buku ? "Sudah Diproses" : "Belum Diproses"}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {ta.is_tutup_buku
                      ? "Proses kenaikan kelas sudah dieksekusi."
                      : "Kenaikan kelas massal belum dilakukan."}
                  </p>
                </div>
              </div>
              {!ta.is_tutup_buku && (
                <button
                  onClick={() => navigate("/operator/master/naik-kelas")}
                  className="w-full py-2 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_forward
                  </span>
                  Ke Halaman Naik Kelas
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Statistik Akademik + Kalender + Aktivitas + Navigasi (grid) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistik Akademik */}
        <div className="lg:col-span-2 bg-white rounded-[20px] border border-border-light shadow-sm p-6">
          <h3
            className="text-section-title font-section-title text-text-primary flex items-center gap-2 mb-5"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <span className="material-symbols-outlined text-info">
              bar_chart
            </span>
            Statistik Akademik
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              {
                icon: "school",
                label: "Total Kelas",
                value: totalKelas,
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                icon: "people",
                label: "Total Siswa",
                value: totalSiswa,
                color: "text-tertiary",
                bg: "bg-tertiary/10",
              },
              {
                icon: "person",
                label: "Guru Mengajar",
                value: totalGuru,
                color: "text-info",
                bg: "bg-info/10",
              },
              {
                icon: "menu_book",
                label: "Mata Pelajaran",
                value: totalMapel,
                color: "text-accent-gold",
                bg: "bg-accent-gold/10",
              },
              {
                icon: "supervisor_account",
                label: "Wali Kelas",
                value: totalWaliKelas,
                color: "text-success",
                bg: "bg-success/10",
              },
              {
                icon: "door_open",
                label: "Ruangan",
                value: totalRuangan,
                color: "text-warning",
                bg: "bg-warning/10",
              },
              {
                icon: "schedule",
                label: "Entri Jadwal",
                value: totalJadwal,
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                icon: "today",
                label: "Hari Efektif",
                value: ta.total_hari_efektif ?? "-",
                color: "text-success",
                bg: "bg-success/10",
              },
              {
                icon: "event_busy",
                label: "Hari Libur",
                value: ta.total_hari_libur ?? "-",
                color: "text-danger",
                bg: "bg-danger/10",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest border border-border-light hover:shadow-sm transition-shadow"
              >
                <div
                  className={`w-9 h-9 rounded-xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {s.icon}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-text-secondary uppercase tracking-wide">
                    {s.label}
                  </p>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right col — Navigasi TA + Aktivitas */}
        <div className="space-y-5">
          {/* Navigasi TA */}
          <div className="bg-white rounded-[20px] border border-border-light shadow-sm p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-text-secondary text-[18px]">
                swap_horiz
              </span>
              Navigasi Tahun Ajaran
            </h3>
            <div className="space-y-2">
              {taPrev ? (
                <button
                  onClick={() =>
                    navigate(`/operator/master/tahun-ajaran/${taPrev.id}`)
                  }
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border-light hover:bg-surface-container-low hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center gap-2 text-text-secondary group-hover:text-primary">
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_back
                    </span>
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-wide">
                        Sebelumnya
                      </p>
                      <p className="text-sm font-semibold">{taPrev.tahun}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${taPrev.is_active ? "bg-success/10 text-success" : "bg-surface-variant text-text-secondary"}`}
                  >
                    {taPrev.is_active ? "Aktif" : "Selesai"}
                  </span>
                </button>
              ) : (
                <div className="p-3 rounded-xl border border-dashed border-border-light text-center text-xs text-text-secondary">
                  Tidak ada TA sebelumnya
                </div>
              )}
              {taNext ? (
                <button
                  onClick={() =>
                    navigate(`/operator/master/tahun-ajaran/${taNext.id}`)
                  }
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border-light hover:bg-surface-container-low hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center gap-2 text-text-secondary group-hover:text-primary">
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-wide">
                        Berikutnya
                      </p>
                      <p className="text-sm font-semibold">{taNext.tahun}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${taNext.is_active ? "bg-success/10 text-success" : "bg-info/10 text-info"}`}
                  >
                    {taNext.is_active ? "Aktif" : "Akan Datang"}
                  </span>
                </button>
              ) : (
                <div className="p-3 rounded-xl border border-dashed border-border-light text-center text-xs text-text-secondary">
                  Tidak ada TA berikutnya
                </div>
              )}
            </div>
          </div>

          {/* Operasi Cepat */}
          <div className="bg-white rounded-[20px] border border-border-light shadow-sm p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-text-secondary text-[18px]">
                bolt
              </span>
              Operasi Cepat
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  icon: "add",
                  label: "Tambah Kelas",
                  path: "/operator/master/kelas",
                },
                {
                  icon: "event_note",
                  label: "Buat Jadwal",
                  path: "/operator/master/jadwal-pelajaran",
                },
                {
                  icon: "upgrade",
                  label: "Naik Kelas",
                  path: "/operator/master/naik-kelas",
                },
                {
                  icon: "menu_book",
                  label: "Mata Pelajaran",
                  path: "/operator/master/mata-pelajaran",
                },
              ].map((op) => (
                <button
                  key={op.label}
                  onClick={() => navigate(op.path)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border-light hover:border-primary/30 hover:bg-primary/5 text-text-secondary hover:text-primary transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {op.icon}
                  </span>
                  <span className="text-[10px] font-medium text-center leading-tight">
                    {op.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Aktivitas Terbaru */}
          {aktivitas.length > 0 && (
            <div className="bg-white rounded-[20px] border border-border-light shadow-sm p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-text-secondary text-[18px]">
                  history
                </span>
                Aktivitas Terbaru
              </h3>
              <div className="space-y-3 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border-light">
                {aktivitas.map((a) => (
                  <div key={a.id} className="flex gap-3 pl-5 relative">
                    <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-surface-container border-2 border-outline-variant shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-text-primary">
                        {a.keterangan ?? a.action}
                      </p>
                      <p className="text-[10px] text-text-secondary mt-0.5">
                        {a.user?.username ?? "Sistem"} ·{" "}
                        {new Date(a.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Kalender Akademik ── */}
      {kalender.length > 0 && (
        <div className="bg-white rounded-[20px] border border-border-light shadow-sm p-6">
          <h3
            className="text-section-title font-section-title text-text-primary flex items-center gap-2 mb-5"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <span className="material-symbols-outlined text-primary">
              calendar_month
            </span>
            Kalender Akademik
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {kalender.map((k) => {
              const jenisConfig = {
                libur: {
                  color: "text-danger",
                  bg: "bg-danger/10",
                  border: "border-danger/20",
                  icon: "event_busy",
                },
                ujian: {
                  color: "text-warning",
                  bg: "bg-warning/10",
                  border: "border-warning/20",
                  icon: "quiz",
                },
                kegiatan: {
                  color: "text-info",
                  bg: "bg-info/10",
                  border: "border-info/20",
                  icon: "celebration",
                },
                rapat: {
                  color: "text-accent-gold",
                  bg: "bg-accent-gold/10",
                  border: "border-accent-gold/20",
                  icon: "groups",
                },
                lainnya: {
                  color: "text-text-secondary",
                  bg: "bg-surface-container",
                  border: "border-border-light",
                  icon: "event",
                },
              };
              const cfg = jenisConfig[k.jenis] ?? jenisConfig.lainnya;
              const tgl =
                k.tanggal_selesai && k.tanggal_selesai !== k.tanggal_mulai
                  ? `${fmt(k.tanggal_mulai)} – ${fmt(k.tanggal_selesai)}`
                  : fmt(k.tanggal_mulai);
              return (
                <div
                  key={k.id}
                  className={`flex gap-3 p-3 rounded-xl border ${cfg.border} ${cfg.bg}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white/60`}
                  >
                    <span
                      className={`material-symbols-outlined text-[16px] ${cfg.color}`}
                    >
                      {cfg.icon}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold ${cfg.color} truncate`}
                    >
                      {k.judul}
                    </p>
                    <p className="text-[10px] text-text-secondary mt-0.5">
                      {tgl}
                    </p>
                    {k.is_nasional && (
                      <span className="text-[9px] bg-white/70 text-text-secondary px-1.5 py-0.5 rounded-full mt-1 inline-block">
                        Nasional
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
