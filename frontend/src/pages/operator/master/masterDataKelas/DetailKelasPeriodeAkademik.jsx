import { useState } from "react";
import { Link, useParams } from "react-router-dom";

// ── Icon Helper ────────────────────────────────────────────────────────────────
function Icon({ name, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

// ── Data Statis (sample) ───────────────────────────────────────────────────────
const siswaList = [
  {
    id: 1,
    nip: "20261001",
    nisn: "0123456789",
    nama: "Ahmad Fauzi",
    jenisKelamin: "L",
    status: "Aktif",
    initial: "A",
    colorClass: "bg-primary-container text-on-primary-container",
  },
  {
    id: 2,
    nip: "20261002",
    nisn: "0123456790",
    nama: "Bunga Citra",
    jenisKelamin: "P",
    status: "Aktif",
    initial: "B",
    colorClass: "bg-tertiary-container text-on-tertiary-container",
  },
  {
    id: 3,
    nip: "20261003",
    nisn: "0123456791",
    nama: "Deni Saputra",
    jenisKelamin: "L",
    status: "Mutasi",
    initial: "D",
    colorClass: "bg-secondary-container text-secondary",
  },
];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DetailKelasPeriodeAkademik() {
  const { kelasId, periodeId } = useParams();
  const [activeTab, setActiveTab] = useState("siswa");
  const [search, setSearch] = useState("");

  const tabs = [
    { id: "informasi", label: "Informasi" },
    { id: "siswa", label: "Siswa" },
    { id: "jadwal", label: "Jadwal" },
    { id: "absensi", label: "Absensi" },
    { id: "nilai", label: "Nilai" },
    { id: "rapor", label: "Rapor" },
    { id: "dokumen", label: "Dokumen" },
    { id: "log", label: "Log Aktivitas" },
  ];

  return (
    <div className="w-full space-y-6 pb-10 opacity-0 animate-fade-up">
      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <nav className="flex text-sm text-text-secondary font-label-md mb-6">
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
          <li className="inline-flex items-center">
            <Link to="/operator/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <Icon name="chevron_right" className="text-[16px] mx-1" />
              <Link to="/operator/master" className="hover:text-primary transition-colors">
                Master Data
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <Icon name="chevron_right" className="text-[16px] mx-1" />
              <Link to="/operator/master/kelas" className="hover:text-primary transition-colors">
                Kelas
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <Icon name="chevron_right" className="text-[16px] mx-1" />
              <Link to="/operator/master/kelas/detail" className="hover:text-primary transition-colors">
                Detail Master Kelas
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <Icon name="chevron_right" className="text-[16px] mx-1" />
              <span className="text-primary font-semibold">2026/2027 - Semester Ganjil</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Detail Kelas Periode Akademik
          </h1>
          <p className="text-sm text-text-secondary max-w-2xl">
            Kelola seluruh data operasional kelas berdasarkan Tahun Ajaran dan Semester.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to={`/operator/master/kelas/${kelasId}`}
            className="px-4 py-2 rounded-xl border border-border-light bg-white text-text-primary text-sm font-medium hover:bg-surface-container-low transition-colors shadow-sm flex items-center gap-2"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            Kembali
          </Link>
          <button className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm flex items-center gap-2">
            <Icon name="edit" className="text-[18px]" />
            Edit Penempatan
          </button>
        </div>
      </div>

      {/* ── 2 Column Layout ───────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left Column (Main Content) */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Hero Card */}
          <div className="bg-white rounded-[18px] border border-border-light p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

            <div className="flex-1 relative z-10 w-full">
              <div className="flex items-center gap-4 mb-6">
                <h2
                  className="text-2xl font-bold text-text-primary"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Kelas 1-A
                </h2>
                <span className="px-3 py-1 bg-on-primary-container text-on-primary-fixed-variant text-xs font-semibold rounded-full border border-primary-fixed">
                  Aktif
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                <InfoItem label="Tahun Ajaran" value="2026/2027" />
                <InfoItem label="Semester" value="Ganjil" />
                <InfoItem label="Kurikulum" value="Merdeka" />
                <InfoItem
                  label="Wali Kelas"
                  value={
                    <div className="flex items-center gap-2">
                      <img
                        className="w-6 h-6 rounded-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqqcodrA2BD-HrfBJZ27Qvael_M5D6Q_Xf7dyZL8PD47pwnkAQoVP4CgFQYQuQKWyUuGq9txnWC3Hk38NUOq3nxn8zWQPQ7C4q3vZQVdGl3ZFaxdzRqweyjAuTgXgAUHyttL_oAzIBWzjBP6R_Yf4nRrAtKwNXTzCduzAoEpzmm-Z12CrUtaphgO65uycsh_qHkzVZXb3R2M0IXCWe9B0Fuu2JhhEIgbfOTL-GZ9g7TsyZTyvy9_6K56UFuDMB_5tlmqhyo4ueqOmP"
                        alt="Ahmad S.Pd"
                      />
                      <span className="font-semibold text-text-primary">Ahmad S.Pd</span>
                    </div>
                  }
                />
                <InfoItem label="Ruangan" value="Ruang 01" />
              </div>
            </div>

            {/* Donut Chart */}
            <div className="w-full md:w-auto flex flex-col items-center justify-center p-6 bg-surface-bright rounded-xl border border-border-light shadow-sm shrink-0 relative z-10">
              <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-surface-variant stroke-current"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    strokeWidth="8"
                  />
                  <circle
                    className="text-primary stroke-current"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    strokeDasharray="251.2"
                    strokeDashoffset="7.5"
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-text-primary">
                    31<span className="text-sm font-normal text-text-secondary">/32</span>
                  </span>
                </div>
              </div>
              <span className="text-sm font-medium text-text-secondary text-center">
                Kapasitas Terisi
                <br />
                (97%)
              </span>
            </div>
          </div>

          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon="groups"
              iconColor="text-primary"
              iconBg="bg-secondary-container"
              label="Total Siswa"
              value="31"
              badge="+2"
              badgeColor="success"
              footer="Breakdown: 15L / 16P"
            />
            <StatCard
              icon="fact_check"
              iconColor="text-secondary"
              iconBg="bg-surface-container"
              label="Rata-rata Kehadiran"
              value="98%"
              progressBar
              progressPercent={98}
            />
            <StatCard
              icon="book"
              iconColor="text-info"
              iconBg="bg-surface-container"
              label="Mata Pelajaran"
              value="10"
              footer="32 Jam Pelajaran / Minggu"
            />
            <StatCard
              icon="co_present"
              iconColor="text-warning"
              iconBg="bg-surface-container"
              label="Guru Mengajar"
              value="8"
              avatars
            />
          </div>

          {/* Content Area with Tabs */}
          <div className="bg-white rounded-[18px] border border-border-light shadow-sm overflow-hidden flex flex-col">
            {/* Navigation Tabs */}
            <div className="border-b border-border-light px-2 pt-2 bg-surface-bright overflow-x-auto">
              <ul className="flex whitespace-nowrap min-w-max">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 rounded-t-lg ${
                        activeTab === tab.id
                          ? "text-primary bg-white border-primary font-semibold"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-container-low border-transparent"
                      }`}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tab Content (Siswa) */}
            {activeTab === "siswa" && (
              <div className="p-6">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                  <div className="relative w-full sm:w-72">
                    <Icon
                      name="search"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]"
                    />
                    <input
                      className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg bg-surface-bright focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      placeholder="Cari nama, NIS, NISN..."
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none px-3 py-2 border border-border-light rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2">
                      <Icon name="filter_list" className="text-[18px]" />
                      Filter
                    </button>
                    <button className="flex-1 sm:flex-none px-3 py-2 border border-border-light rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2">
                      <Icon name="download" className="text-[18px]" />
                      Export
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-border-light rounded-xl">
                  <table className="w-full text-left text-sm text-text-secondary">
                    <thead className="bg-surface-bright text-xs uppercase text-text-secondary font-semibold border-b border-border-light sticky top-0">
                      <tr>
                        <th className="px-4 py-3 w-12 text-center">No</th>
                        <th className="px-4 py-3">NIP / NISN</th>
                        <th className="px-4 py-3">Nama Lengkap</th>
                        <th className="px-4 py-3">L/P</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                      {siswaList.map((siswa, idx) => (
                        <tr key={siswa.id} className="hover:bg-surface-container-lowest transition-colors bg-white">
                          <td className="px-4 py-3 text-center">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-text-primary">{siswa.nip}</div>
                            <div className="text-xs">{siswa.nisn}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full ${siswa.colorClass} flex items-center justify-center font-bold text-xs shrink-0`}
                              >
                                {siswa.initial}
                              </div>
                              <span className="font-medium text-text-primary">{siswa.nama}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">{siswa.jenisKelamin}</td>
                          <td className="px-4 py-3">
                            {siswa.status === "Aktif" ? (
                              <span className="px-2.5 py-1 bg-on-primary-container text-on-primary-fixed-variant text-[10px] uppercase font-bold rounded-full border border-primary-fixed">
                                Aktif
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-warning/10 text-warning text-[10px] uppercase font-bold rounded-full border border-warning/20">
                                Mutasi
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button
                              className="text-text-secondary hover:text-primary transition-colors p-1"
                              title="Detail"
                            >
                              <Icon name="visibility" className="text-[18px]" />
                            </button>
                            <button
                              className="text-text-secondary hover:text-info transition-colors p-1 ml-1"
                              title="Edit"
                            >
                              <Icon name="edit" className="text-[18px]" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="text-text-secondary">Menampilkan 1-3 dari 31 siswa</span>
                  <div className="flex items-center gap-1">
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded border border-border-light text-text-secondary hover:bg-surface-container-low disabled:opacity-50"
                      disabled
                    >
                      <Icon name="chevron_left" className="text-[18px]" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white font-medium">
                      1
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-border-light text-text-secondary hover:bg-surface-container-low">
                      2
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-border-light text-text-secondary hover:bg-surface-container-low">
                      <Icon name="chevron_right" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs placeholder */}
            {activeTab !== "siswa" && (
              <div className="p-6 text-center text-text-secondary">
                <Icon name="construction" className="text-[48px] text-outline-variant mb-3" />
                <p className="text-sm font-medium">Tab {activeTab} belum tersedia</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Sidebar Summary & Actions) */}
        <aside className="w-full xl:w-[320px] shrink-0 flex flex-col gap-6">
          {/* Summary Card */}
          <div className="bg-white rounded-[18px] border border-border-light p-5 shadow-sm">
            <h3
              className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <Icon name="info" className="text-primary text-[20px]" />
              Ringkasan Kelas
            </h3>
            <div className="space-y-4">
              <SummaryRow label="Status" value={<StatusBadge />} />
              <SummaryRow label="Wali Kelas" value="Ahmad S.Pd" />
              <SummaryRow label="Kapasitas" value="31 / 32" />
              <SummaryRow label="Kurikulum" value="Merdeka" />
              <SummaryRow label="Terakhir Diupdate" value="12 Sep 2024" last />
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-[18px] border border-border-light p-5 shadow-sm">
            <h3
              className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <Icon name="flash_on" className="text-primary text-[20px]" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <QuickActionButton icon="person_add" label="Tambah Siswa" />
              <QuickActionButton icon="calendar_month" label="Kelola Jadwal" />
              <QuickActionButton icon="checklist" label="Input Absensi" />
              <QuickActionButton icon="edit_document" label="Input Nilai" />
              <div className="h-px bg-border-light my-2 w-full" />
              <QuickActionButton icon="print" label="Cetak Daftar Siswa" secondary />
              <QuickActionButton icon="summarize" label="Generate Rapor" secondary />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── Sub-Components ─────────────────────────────────────────────────────────────

/** Info Item */
function InfoItem({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">{label}</span>
      {typeof value === "string" ? (
        <span className="text-sm font-semibold text-text-primary">{value}</span>
      ) : (
        value
      )}
    </div>
  );
}

/** Stat Card */
function StatCard({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  badge,
  badgeColor = "success",
  footer,
  progressBar,
  progressPercent,
  avatars,
}) {
  return (
    <div className="bg-white p-5 rounded-[18px] border border-border-light shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center ${iconColor}`}>
          <Icon name={icon} />
        </div>
        {badge && (
          <span
            className={`text-xs font-semibold ${badgeColor === "success" ? "text-success" : "text-warning"} bg-surface-container px-2 py-1 rounded-md flex items-center gap-1`}
          >
            <Icon name="trending_up" className="text-[14px]" />
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-text-secondary font-medium mb-1">{label}</p>
        <h3
          className="text-2xl font-bold text-text-primary"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {value}
        </h3>
      </div>
      {progressBar && (
        <div className="w-full bg-surface-variant rounded-full h-1.5 mt-auto">
          <div className="bg-success h-1.5 rounded-full" style={{ width: `${progressPercent}%` }} />
        </div>
      )}
      {footer && <div className="text-xs text-text-secondary mt-auto">{footer}</div>}
      {avatars && (
        <div className="flex -space-x-2 mt-auto">
          <img
            className="w-6 h-6 rounded-full border-2 border-white object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuACZjs80twITiElvjPGleVyGMO7sVo4px8mombYfeUe4E5JUprsVZeGSJgtXedfmo-_Oj6V-pWFsonXDgt5fqv42c1I6nla2AOD0ly2ALxndPalD3m9Gzrh_MT1sJlnh6dbtl7MH3612EcoCdEktnbMroam-wt1XBK36D1ixXnOyEKM-FuesPw9GKN7ldPTHIDJsQRMJS74dRPkRjFpHN2ahJk309BTWsldQ8YLVrgw0KPvmZ2fW1a3bzTLJSKaVVo67bkdVPTrAu1M"
            alt="teacher"
          />
          <img
            className="w-6 h-6 rounded-full border-2 border-white object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmtfpldPUJg-aZ7fSqSx2OvbHgCV6cvovFCjGjqF86nZIRmNtX31yuoC-DkEhqx7ql5R4dIjgKq26Kt_dow0iAv2N8tUjHE5sDfUZcS6UnIGb4pNrnrQ0A6M4CKAqubRNcwonc3K8nAW6nWBHDFzH0m6gNSuwuNJZ5dedK2JhapjIcGCND9-UE4SVaFKuvqLTQVArFdXZO1stoZf4LVb1AF-_zmwrPJqZ9lzhQL-IMVD9XgQqPdg8emAGnXFO0IavWbd_FTjMBrRF1"
            alt="teacher"
          />
          <img
            className="w-6 h-6 rounded-full border-2 border-white object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEXVdpHEM-qXbzGQ4bozZ16fzIJhRH9PR9dmf7UgViE3QcCTEEqOgdMXwrIF32krrFvkqQxGnnHh-jcu4GmoOoGfhHHcvCzneef7JgrxuM6fON9p_e17GeSP_IvHuQkUmq7pf_pqat2XvB1XoBWZxMO6nC7j0gtgN_bZwRWMNHzapqXprSaoDRACakm3_Cq2Zcf5HW73MvpI75AIfQhXUD2CQNuONmHj3DKrsSaxQ5DCbTqnmnxHSMdiUNdKhgG8wKwIvZ-GjxT_ZT"
            alt="teacher"
          />
          <div className="w-6 h-6 rounded-full border-2 border-white bg-surface-variant flex items-center justify-center text-[10px] font-medium text-text-secondary">
            +5
          </div>
        </div>
      )}
    </div>
  );
}

/** Summary Row */
function SummaryRow({ label, value, last = false }) {
  return (
    <div className={`flex justify-between items-center py-2 ${!last ? "border-b border-border-light/50" : ""}`}>
      <span className="text-sm text-text-secondary">{label}</span>
      {typeof value === "string" ? (
        <span className="text-sm font-medium text-text-primary">{value}</span>
      ) : (
        value
      )}
    </div>
  );
}

/** Status Badge */
function StatusBadge() {
  return (
    <span className="px-2 py-0.5 bg-on-primary-container text-on-primary-fixed-variant text-xs font-semibold rounded-full">
      Aktif
    </span>
  );
}

/** Quick Action Button */
function QuickActionButton({ icon, label, secondary = false }) {
  return (
    <button
      className={`flex items-center justify-start gap-3 w-full p-3 rounded-lg border border-border-light transition-all text-sm font-medium text-text-primary group ${
        secondary
          ? "hover:bg-surface-container-low"
          : "hover:border-primary hover:bg-surface-bright hover:text-primary"
      }`}
    >
      <Icon
        name={icon}
        className={`text-text-secondary text-[20px] ${!secondary ? "group-hover:text-primary transition-colors" : ""}`}
      />
      {label}
    </button>
  );
}
