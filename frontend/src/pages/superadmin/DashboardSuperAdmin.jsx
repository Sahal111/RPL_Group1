import ComingSoonDashboard from "../../components/ui/ComingSoonDashboard";

const features = [
  {
    name: "Tenant Management",
    desc: "Tambah sekolah baru, aktivasi lisensi, dan atur paket langganan",
  },
  {
    name: "Role & Permission System",
    desc: "Kelola master role dan permission template global",
  },
  {
    name: "System Configuration",
    desc: "Pengaturan SMTP, App Name, Timezone, dan System Limits",
  },
  {
    name: "Database Backup & Restore",
    desc: "Backup dan restore database MySQL",
  },
  {
    name: "Audit & Error Logs",
    desc: "Pelacakan error server dan aktivitas login global",
  },
  {
    name: "Storage Management",
    desc: "Manajemen disk space dan alokasi kuota per sekolah",
  },
];

export default function DashboardSuperAdmin() {
  return (
    <ComingSoonDashboard
      roleName="Super Admin"
      description="Panel infrastruktur SaaS sedang dikembangkan. Fitur manajemen tenant, konfigurasi sistem, dan monitoring platform akan segera tersedia."
      plannedFeatures={features}
    />
  );
}
