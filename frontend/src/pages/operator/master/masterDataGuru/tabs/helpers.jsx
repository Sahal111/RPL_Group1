import api from "../../../../../lib/axios";
import toast from "react-hot-toast";

export const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001";

// Universal file downloader — pakai di semua tab
export function useFileDownload(nuptk) {
  const download = async (filePath, namaFile = "dokumen") => {
    try {
      const res = await api.get(
        `/operator/master-data/guru/${nuptk}/file-download`,
        {
          params: { path: filePath, nama: namaFile },
          responseType: "blob",
        },
      );
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = namaFile;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Gagal mendownload file.");
    }
  };
  return download;
}

/* ─── Date formatter ─── */
export function fmtDate(val) {
  if (!val) return "-";
  try {
    return new Date(val).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return val;
  }
}

/* ─── InfoRow ─── */
export function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between border-b border-surface-container pb-2">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={`text-sm font-semibold ${mono ? "font-mono" : ""}`}>
        {value || "-"}
      </span>
    </div>
  );
}

/* ─── SubLabel ─── */
export function SubLabel({ children }) {
  return (
    <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-3 mt-6">
      {children}
    </p>
  );
}

/* ─── SectionTitle ─── */
export function SectionTitle({ icon, label, desc }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <div>
        <h3 className="font-section-title text-section-title text-text-primary">
          {label}
        </h3>
        {desc && <p className="text-sm text-text-secondary">{desc}</p>}
      </div>
    </div>
  );
}

/* ─── TabBtn ─── */
export function TabBtn({ active, onClick, children, badge }) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors text-primary border-b-2 border-primary bg-surface-container-low/50 rounded-t-lg flex items-center gap-2"
          : "px-5 py-3.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest whitespace-nowrap transition-colors flex items-center gap-2"
      }
    >
      {children}
      {badge != null && (
        <span className="bg-surface-container-high px-1.5 py-0.5 rounded text-xs">
          {badge}
        </span>
      )}
    </button>
  );
}

/* ─── MetricCard ─── */
export function MetricCard({ icon, iconBg, iconColor, label, value, sub, subColor }) {
  return (
    <div className="bg-surface rounded-xl p-5 border border-border-light shadow-sm flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 ${iconBg} ${iconColor} rounded-lg`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className="text-sm font-medium text-text-secondary">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-text-primary">{value}</span>
        {sub && (
          <span className={`text-sm font-medium mb-1 ${subColor ?? "text-text-secondary"}`}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Modal wrapper (inline, sederhana — untuk tab komponen) ─── */
export function InlineModal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        className={`relative w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] flex flex-col bg-surface-container-lowest rounded-2xl shadow-xl`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container shrink-0">
          <h3 className="text-base font-semibold text-on-surface">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4 flex-1">{children}</div>
      </div>
    </div>
  );
}

/* ─── Field wrapper untuk form ─── */
export function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-on-surface-variant mb-1">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
