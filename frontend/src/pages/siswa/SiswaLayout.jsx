import AppLayout from "../../components/layout/AppLayout";
import SiswaSidebar from "../../components/layout/SiswaSidebar";

export default function SiswaLayout() {
  return (
    <AppLayout
      sidebar={<SiswaSidebar />}
      className="bg-slate-50 text-slate-800"
      contentClassName="p-6 flex-1 overflow-y-auto"
      sidebarWidth={256}
    />
  );
}
