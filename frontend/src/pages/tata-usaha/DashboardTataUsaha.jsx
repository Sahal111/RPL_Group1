import ComingSoonDashboard from "../../components/ui/ComingSoonDashboard";

const features = [
  {
    name: "Surat Masuk & Keluar",
    desc: "Catat, arsip, dan kelola surat resmi sekolah",
  },
  {
    name: "Arsip Digital",
    desc: "Upload dan simpan dokumen surat dalam format digital",
  },
  {
    name: "Legalisir Dokumen",
    desc: "Proses permohonan legalisir ijazah, rapor, dan dokumen resmi lainnya",
  },
  {
    name: "Nomor Agenda Otomatis",
    desc: "Penomoran surat otomatis sesuai format tata naskah dinas",
  },
];

export default function DashboardTataUsaha() {
  return (
    <ComingSoonDashboard
      roleName="Tata Usaha"
      description="Modul Tata Usaha sedang dikembangkan. Fitur pengelolaan surat masuk/keluar, arsip digital, dan legalisir dokumen akan segera tersedia."
      plannedFeatures={features}
      accentColor="orange"
    />
  );
}
