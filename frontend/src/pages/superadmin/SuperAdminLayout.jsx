import AppLayout from "../../components/layout/AppLayout";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";

export default function SuperAdminLayout() {
  return (
    <AppLayout
      sidebar={<SuperAdminSidebar />}
      className="bg-slate-950 text-slate-100"
      contentClassName="p-6 flex-1 overflow-y-auto"
      sidebarWidth={256}
    />
  );
}
