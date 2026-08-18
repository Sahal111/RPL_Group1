import { useState } from "react";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

// ── Modal Export ──────────────────────────────────────────────────────────────
export default function ModalExportGuru({ open, onClose, filters, selected }) {
  const [loading, setLoading] = useState(null); // null | "excel" | "backup"

  const doExport = async (type) => {
    setLoading(type);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.jenis_ptk) params.append("jenis_ptk", filters.jenis_ptk);
      if (filters.status_keaktifan)
        params.append("status_keaktifan", filters.status_keaktifan);
      if (selected.size > 0)
        [...selected].forEach((nuptk) => params.append("nuptks[]", nuptk));

      const endpoint =
        type === "backup"
          ? "/operator/master-data/guru/backup"
          : "/operator/master-data/guru/export";

      const res = await api.get(`${endpoint}?${params.toString()}`, {
        responseType: "blob",
      });

      const contentDisp = res.headers["content-disposition"] ?? "";
      const match = contentDisp.match(/filename="?([^";\r\n]+)"?/);
      const filename =
        match?.[1] ??
        (type === "backup" ? "backup_guru.zip" : "data_guru.xlsx");

      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(
        `${type === "backup" ? "Backup" : "Export"} berhasil diunduh.`,
      );
      onClose();
    } catch {
      toast.error("Gagal mengunduh. Coba lagi.");
    } finally {
      setLoading(null);
    }
  };

  if (!open) return null;

  const options = [
    {
      id: "excel",
      icon: "table_view",
      iconBg: "bg-success/10",
      iconColor: "text-success",
      title: "Export Excel",
      desc:
        selected.size > 0
          ? `${selected.size} guru yang dipilih`
          : filters.search || filters.jenis_ptk || filters.status_keaktifan
            ? "Sesuai filter aktif"
            : "Semua guru",
      sub: "Multi-sheet .xlsx — Data Utama, Keluarga, Rekening, Pendidikan, Sertifikasi, Diklat, Jabatan, dll.",
      badge: null,
    },
    {
      id: "backup",
      icon: "folder_zip",
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      title: "Backup Lengkap",
      desc: "Semua guru + foto profil",
      sub: "Format .zip — berisi data Excel & semua foto guru",
      badge: "RECOMMENDED",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md border border-border-light animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">
                download
              </span>
            </div>
            <div>
              <h3
                className="font-bold text-text-primary text-base"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Export & Backup
              </h3>
              <p className="text-xs text-text-secondary">
                Pilih format yang diinginkan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">
          {selected.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary font-medium">
              <span className="material-symbols-outlined text-[15px]">
                check_circle
              </span>
              {selected.size} guru dipilih — export akan terbatas ke guru ini
            </div>
          )}

          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => doExport(opt.id)}
              disabled={loading !== null}
              className="w-full flex items-center gap-4 p-4 bg-surface-container-low border border-border-light rounded-xl hover:border-primary/30 hover:bg-surface-container transition-all text-left disabled:opacity-60 group"
            >
              <div
                className={`w-12 h-12 rounded-xl ${opt.iconBg} flex items-center justify-center shrink-0`}
              >
                {loading === opt.id ? (
                  <span className="material-symbols-outlined animate-spin text-[22px] text-text-secondary">
                    progress_activity
                  </span>
                ) : (
                  <span
                    className={`material-symbols-outlined text-[22px] ${opt.iconColor}`}
                  >
                    {opt.icon}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-text-primary">
                    {opt.title}
                  </p>
                  {opt.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-warning/10 text-warning rounded-full border border-warning/20">
                      {opt.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-primary mt-0.5">
                  {opt.desc}
                </p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  {opt.sub}
                </p>
              </div>
              <span className="material-symbols-outlined text-text-secondary text-[18px] group-hover:text-primary transition-colors shrink-0">
                arrow_forward
              </span>
            </button>
          ))}

          <p className="text-[10px] text-text-secondary text-center pt-1">
            Backup direkomendasikan secara berkala sebagai cadangan data
          </p>
        </div>
      </div>
    </div>
  );
}
