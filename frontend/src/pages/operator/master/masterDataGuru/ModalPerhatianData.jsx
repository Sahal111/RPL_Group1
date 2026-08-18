import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios";

// ── Modal Perhatian Data ──────────────────────────────────────────────────────
export default function ModalPerhatianData({
  open,
  onClose,
  filterField,
  perhatianItems,
  navigate,
}) {
  const defaultField = filterField ?? perhatianItems[0]?.field ?? null;
  const [activeField, setActiveField] = useState(defaultField);

  useEffect(() => {
    setActiveField(filterField ?? perhatianItems[0]?.field ?? null);
  }, [filterField, perhatianItems]);

  const { data, isLoading } = useQuery({
    queryKey: ["guru-perhatian-detail", activeField],
    queryFn: () =>
      api
        .get("/operator/master-data/guru/perhatian-detail", {
          params: { field: activeField },
        })
        .then((r) => r.data.data),
    enabled: open,
  });

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 transition-all duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-border-light/80 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center border border-warning/10">
              <span className="material-symbols-outlined text-warning text-[22px]">
                warning
              </span>
            </div>
            <div>
              <h3 className="text-section-title font-bold text-on-surface">
                Kelengkapan Data Guru
              </h3>
              <p className="text-xs text-text-secondary">
                Daftar guru yang datanya belum lengkap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab filter kategori */}
        <div className="flex gap-2 px-6 pt-4 pb-2 overflow-x-auto shrink-0">
          {perhatianItems.map((item) => (
            <button
              key={item.field}
              onClick={() => setActiveField(item.field)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                activeField === item.field
                  ? "bg-warning text-white border-warning"
                  : "bg-surface-container-low text-text-secondary border-border-light hover:border-warning/50"
              }`}
            >
              {item.label}
              <span
                className={`inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold ${
                  activeField === item.field
                    ? "bg-white/30 text-white"
                    : "bg-warning/20 text-warning"
                }`}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {/* List guru */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-text-secondary">
              <span className="material-symbols-outlined animate-spin text-[20px]">
                progress_activity
              </span>
              <span className="text-sm">Memuat data...</span>
            </div>
          ) : !data?.length ? (
            <p className="text-center text-sm text-text-secondary py-12">
              Tidak ada guru yang perlu dilengkapi 🎉
            </p>
          ) : (
            <div className="space-y-2 mt-2">
              {data.map((guru) => (
                <div
                  key={guru.nuptk}
                  className="flex items-center justify-between p-3 rounded-xl border border-border-light bg-surface-container-lowest hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {guru.nama?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">
                        {guru.nama_lengkap ?? guru.nama}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {guru.nuptk} · {guru.jenis_ptk ?? "-"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/operator/master/guru/edit/${guru.nuptk}`);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      edit
                    </span>
                    Lengkapi
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
