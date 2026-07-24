import { Link, useNavigate } from "react-router-dom";

// ── Komponen Icon (Material Symbols helper) ───────────────────────────────────
function Icon({ name, className = "", fill = false }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={
        fill
          ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
          : undefined
      }
    >
      {name}
    </span>
  );
}

// ── Riwayat Akademik rows (data statis) ──────────────────────────────────────
const riwayatAkademik = [
  {
    id: 1,
    tahunAjaran: "2026/2027",
    semester: "Ganjil",
    wali: { initial: "A", color: "bg-primary/20 text-primary", nama: "Ahmad S.Pd" },
    jumlahSiswa: 31,
    status: "Aktif",
    isActive: true,
  },
  {
    id: 2,
    tahunAjaran: "2026/2027",
    semester: "Genap",
    wali: { initial: "A", color: "bg-primary/20 text-primary", nama: "Ahmad S.Pd" },
    jumlahSiswa: 31,
    status: "Selesai",
    isActive: false,
  },
  {
    id: 3,
    tahunAjaran: "2025/2026",
    semester: "Ganjil",
    wali: { initial: "R", color: "bg-info/20 text-info", nama: "Rina S.Pd" },
    jumlahSiswa: 30,
    status: "Selesai",
    isActive: false,
  },
];

// ── Riwayat Wali Kelas rows (data statis) ─────────────────────────────────────
const riwayatWali = [
  {
    id: 1,
    foto: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJdbVyCdSI7Gz4O7tk9cVKD4KyCPRKqPCb7LsbFPQkO6SHyE42RnlfcC5_V78VpW43WnM8XWzZbuUFUACLsgtZ7C0QwUkrTpygezbrqTuU9XoFWRaTyLX5-VbRX4vR-pNLqPqXittU9F0hf5l7Mmu7ivZgOxuZEEqayBK_LftFn2gOXxF3nvo-OccFaTt4ZrcduiLuIiMH_OR1OfbUUhMu7tD5autskBiEXzAHNzSLlTe4f04sGDq_WOGOSJlNshqjpbFErdh5O9xl",
    nama: "Ahmad S.Pd",
    periode: "2026/2027",
    lama: "2 Semester",
    status: "Aktif",
    isActive: true,
  },
  {
    id: 2,
    foto: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsxoIMffV4VxhOhmZvvImf2WDpX1DbLxI_YuU9l0SQmot5SpwqhNH0cU4xeh8eg4HFb0v1T9qXQReKD7JpGcW3RCl4nBHR2uKl0DwywCqhGiBtwRAjXQ_CiN-Tm_4_Ji911lIMPHLgTHiXBaHDrf8z0uOu2ef7BLCDtRTwINXN4dxk07mmr48inQfVgFalkFaoObS-ACe38USE_I_6ivF2LaDlifEEqtTETJqHjEUu9Rn5a7uRB57cZZIfMtprrM2TvLwHkrQlc3v5",
    nama: "Rina S.Pd",
    periode: "2025/2026",
    lama: "2 Semester",
    status: "Selesai",
    isActive: false,
  },
];

// ── Timeline items (data statis) ─────────────────────────────────────────────
const timelineItems = [
  { id: 1, tahun: "2026", judul: "Wali kelas berganti", ket: "menjadi Ahmad S.Pd.", isActive: true },
  { id: 2, tahun: "2026", judul: "Ruangan dipindahkan", ket: "ke Ruang 01.", isActive: false },
  { id: 3, tahun: "2025", judul: "Kapasitas diubah", ket: "dari 30 menjadi 32.", isActive: false },
  { id: 4, tahun: "2024", judul: "Kelas dibuat", ket: "Inisialisasi awal data kelas.", isActive: false },
];

// ── Halaman Utama ─────────────────────────────────────────────────────────────
export default function DetailKelasStatis() {
  const navigate = useNavigate();

  return (
    <div className="w-full space-y-6 pb-10 opacity-0 animate-fade-up">
      {/* ── Breadcrumb & Page Header ──────────────────────────────────────── */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-text-secondary mb-3">
          <Link to="/operator/dashboard" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link to="/operator/master" className="hover:text-primary transition-colors">
            Master Data
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link to="/operator/master/kelas" className="hover:text-primary transition-colors">
            Kelas
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-semibold">Detail Kelas</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Detail Master Data Kelas
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Kelola dan lihat riwayat data kelas secara terperinci.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/operator/master/kelas"
              className="px-4 py-2 bg-surface-container-lowest border border-border-light text-text-primary rounded-xl font-medium hover:bg-surface-container-low transition-colors flex items-center gap-2"
            >
              <Icon name="arrow_back" className="text-sm" />
              Kembali
            </Link>
            <button className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-sm">
              <Icon name="edit" className="text-sm" />
              Edit Kelas
            </button>
          </div>
        </div>
      </div>

          {/* ── Hero Card ────────────────────────────────────────────────────── */}
          <div className="bg-surface-container-lowest rounded-[18px] border border-border-light shadow-sm p-6 flex flex-col md:flex-row justify-between gap-8 relative overflow-hidden">
            {/* Decorative blur accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />

            {/* Left — info kelas */}
            <div className="flex-1 z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-surface-container-low rounded-2xl border border-border-light flex items-center justify-center shrink-0">
                  <span className="font-headline-lg text-headline-lg text-primary">1-A</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-headline-md text-headline-md text-text-primary">Kelas 1-A</h3>
                    <span className="px-2.5 py-1 bg-success/10 text-success border border-success/20 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      Aktif
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm mt-1">
                    Master data referensi untuk pendaftaran dan akademik.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <InfoItem icon="tag" label="Kode Kelas" value="KLS001" />
                <InfoItem icon="signal_cellular_alt" label="Tingkat" value="Kelas 1" />
                <InfoItem icon="groups" label="Kapasitas Default" value="32 Siswa" />
                <InfoItem icon="meeting_room" label="Ruangan Default" value="Ruang 01" />
                <div className="flex flex-col sm:col-span-2">
                  <span className="text-text-secondary mb-1 text-xs uppercase tracking-wide font-medium">
                    Deskripsi
                  </span>
                  <span className="text-text-primary italic">-</span>
                </div>
              </div>
            </div>

            {/* Right — Okupansi */}
            <div className="w-full md:w-72 flex flex-col justify-center bg-surface-container-low/50 p-6 rounded-xl border border-border-light z-10">
              <div className="flex justify-between items-end mb-2">
                <span className="font-section-title text-section-title text-text-primary">
                  Okupansi Terkini
                </span>
                <span className="text-2xl font-bold text-primary">
                  31<span className="text-sm text-text-secondary font-normal">/32</span>
                </span>
              </div>
              <div className="w-full bg-border-light rounded-full h-3 mb-2 overflow-hidden">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: "96.8%" }}
                />
              </div>
              <p className="text-xs text-text-secondary text-right">
                Tahun Ajaran 2026/2027 (Ganjil)
              </p>
            </div>
          </div>

          {/* ── Statistics Cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Tahun Digunakan"
              value="3"
              iconName="calendar_today"
              colorClass="bg-primary/10 text-primary"
            />
            <StatCard
              label="Total Semester"
              value="6"
              iconName="layers"
              colorClass="bg-info/10 text-info"
            />
            <StatCard
              label="Total Siswa Pernah Menggunakan"
              value="186"
              iconName="group"
              colorClass="bg-accent-gold/10 text-accent-gold"
            />
            <StatCard
              label="Total Wali Kelas"
              value="4"
              iconName="person"
              colorClass="bg-secondary/10 text-secondary"
            />
          </div>

          {/* ── Main Grid: Left (2/3) + Right (1/3) ─────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Left Column */}
            <div className="xl:col-span-2 space-y-6">

              {/* Riwayat Akademik */}
              <div className="bg-surface-container-lowest rounded-[18px] border border-border-light shadow-sm flex flex-col overflow-hidden">
                <div className="p-6 border-b border-border-light flex justify-between items-center bg-surface-container-lowest">
                  <div>
                    <h3 className="font-section-title text-section-title text-text-primary flex items-center gap-2">
                      <Icon name="history_edu" className="text-primary" />
                      Riwayat Akademik
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      Riwayat penggunaan kelas pada setiap Tahun Ajaran dan Semester.
                    </p>
                  </div>
                  <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors text-text-secondary">
                    <Icon name="filter_list" />
                  </button>
                </div>

                {/* Table — horizontally scrollable on mobile */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead className="bg-surface-container-low/50 border-b border-border-light text-xs uppercase text-text-secondary font-semibold tracking-wider">
                      <tr>
                        <th className="px-6 py-4 whitespace-nowrap">No</th>
                        <th className="px-6 py-4 whitespace-nowrap">Tahun Ajaran</th>
                        <th className="px-6 py-4 whitespace-nowrap">Semester</th>
                        <th className="px-6 py-4 whitespace-nowrap">Wali Kelas</th>
                        <th className="px-6 py-4 whitespace-nowrap">Jumlah Siswa</th>
                        <th className="px-6 py-4 whitespace-nowrap">Status</th>
                        <th className="px-6 py-4 whitespace-nowrap text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light text-sm">
                      {riwayatAkademik.map((row, idx) => (
                        <tr
                          key={row.id}
                          className="hover:bg-surface-container-low/30 transition-colors group"
                        >
                          <td className="px-6 py-4 text-text-secondary">{idx + 1}</td>
                          <td className="px-6 py-4 font-medium text-text-primary">{row.tahunAjaran}</td>
                          <td className="px-6 py-4 text-text-primary">{row.semester}</td>
                          <td className="px-6 py-4 text-text-primary">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full ${row.wali.color} flex items-center justify-center text-xs font-bold`}>
                                {row.wali.initial}
                              </div>
                              {row.wali.nama}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-text-primary">{row.jumlahSiswa}</td>
                          <td className="px-6 py-4">
                            {row.isActive ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success border border-success/20">
                                Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-variant text-on-surface-variant border border-border-light">
                                Selesai
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => navigate(`/operator/master/kelas/1A/periode/${row.id}`)}
                              className={`font-medium text-sm inline-flex items-center gap-1 transition-colors ${
                                row.isActive
                                  ? "text-primary hover:text-primary-container"
                                  : "text-text-secondary hover:text-primary opacity-0 group-hover:opacity-100"
                              }`}
                            >
                              Lihat Detail
                              <Icon name="arrow_forward" className="text-sm" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Riwayat Wali Kelas */}
              <div className="bg-surface-container-lowest rounded-[18px] border border-border-light shadow-sm flex flex-col overflow-hidden">
                <div className="p-6 border-b border-border-light">
                  <h3 className="font-section-title text-section-title text-text-primary flex items-center gap-2">
                    <Icon name="badge" className="text-secondary" />
                    Riwayat Wali Kelas
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[480px]">
                    <thead className="bg-surface-container-low/50 border-b border-border-light text-xs uppercase text-text-secondary font-semibold tracking-wider">
                      <tr>
                        <th className="px-6 py-4 whitespace-nowrap">Nama Guru</th>
                        <th className="px-6 py-4 whitespace-nowrap">Periode</th>
                        <th className="px-6 py-4 whitespace-nowrap">Lama Menjadi Wali</th>
                        <th className="px-6 py-4 whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light text-sm">
                      {riwayatWali.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-surface-container-low/30 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-text-primary">
                            <div className="flex items-center gap-3">
                              <img
                                className="w-8 h-8 rounded-full object-cover bg-border-light shrink-0"
                                src={row.foto}
                                alt={row.nama}
                              />
                              {row.nama}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-text-primary">{row.periode}</td>
                          <td className="px-6 py-4 text-text-secondary">{row.lama}</td>
                          <td className="px-6 py-4">
                            {row.isActive ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success border border-success/20">
                                Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-variant text-on-surface-variant border border-border-light">
                                Selesai
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">

              {/* Timeline Perubahan */}
              <div className="bg-surface-container-lowest rounded-[18px] border border-border-light shadow-sm p-6">
                <h3 className="font-section-title text-section-title text-text-primary mb-6 flex items-center gap-2">
                  <Icon name="update" className="text-warning" />
                  Timeline Perubahan
                </h3>
                <div className="relative border-l border-border-light ml-3 space-y-6">
                  {timelineItems.map((item) => (
                    <div key={item.id} className="relative pl-6">
                      <div
                        className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-surface-container-lowest ${
                          item.isActive ? "bg-primary" : "bg-border-dark"
                        }`}
                      />
                      <div
                        className={`text-xs font-semibold mb-1 ${
                          item.isActive ? "text-primary" : "text-text-secondary"
                        }`}
                      >
                        {item.tahun}
                      </div>
                      <p className="text-sm text-text-primary font-medium">{item.judul}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{item.ket}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Informasi Sistem */}
              <div className="bg-surface-container-lowest rounded-[18px] border border-border-light shadow-sm p-6 bg-gradient-to-b from-transparent to-surface-container-low/30">
                <h3 className="font-section-title text-section-title text-text-primary mb-4 flex items-center gap-2">
                  <Icon name="info" className="text-text-secondary" />
                  Informasi Sistem
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <SistemCard label="Dibuat Pada" value="12 Jan 2024" />
                  <SistemCard label="Diperbarui Pada" value="05 Aug 2026" />
                  <SistemCard label="Dibuat Oleh" value="Admin System" />
                  <SistemCard label="Terakhir Diubah Oleh" value="Admin TU" />
                </div>
              </div>

            </div>
          </div>
    </div>
  );
}

// ── Sub-komponen ──────────────────────────────────────────────────────────────

/** Info item di Hero Card */
function InfoItem({ icon, label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-text-secondary mb-1 text-xs uppercase tracking-wide font-medium">
        {label}
      </span>
      <span className="text-text-primary font-medium flex items-center gap-2">
        <Icon name={icon} className="text-sm text-primary" />
        {value}
      </span>
    </div>
  );
}

/** Kartu statistik */
function StatCard({ label, value, iconName, colorClass }) {
  return (
    <div className="bg-surface-container-lowest rounded-[18px] border border-border-light shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-text-secondary text-sm font-medium mb-1">{label}</p>
          <h4 className="font-headline-lg text-headline-lg text-text-primary">{value}</h4>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
          <Icon name={iconName} />
        </div>
      </div>
    </div>
  );
}

/** Item kartu informasi sistem */
function SistemCard({ label, value }) {
  return (
    <div className="p-3 bg-surface rounded-lg border border-border-light border-dashed">
      <p className="text-xs text-text-secondary mb-1">{label}</p>
      <p className="font-medium text-text-primary">{value}</p>
    </div>
  );
}