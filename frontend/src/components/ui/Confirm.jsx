import { AlertTriangle, Trash2, X } from "lucide-react";

/**
 * Confirm — dialog konfirmasi standar
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 *   onConfirm: () => void
 *   title: string
 *   message: string
 *   confirmLabel: string (default: "Ya, Lanjutkan")
 *   cancelLabel: string (default: "Batal")
 *   variant: "danger" | "warning" | "info" (default: "danger")
 *   isLoading: boolean
 */
export default function Confirm({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi",
  message = "Apakah kamu yakin?",
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  variant = "danger",
  isLoading = false,
}) {
  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      icon: <Trash2 size={24} />,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      btn: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: <AlertTriangle size={24} />,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      btn: "bg-yellow-500 hover:bg-yellow-600 text-white",
    },
    info: {
      icon: <AlertTriangle size={24} />,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      btn: "bg-blue-600 hover:bg-blue-700 text-white",
    },
  };

  const cfg = variantConfig[variant] ?? variantConfig.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-xl p-6">
        {/* Icon */}
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${cfg.iconBg}`}>
          <span className={cfg.iconColor}>{cfg.icon}</span>
        </div>

        {/* Title & Message */}
        <h3 className="text-base font-semibold text-center text-on-surface mb-1">{title}</h3>
        <p className="text-sm text-text-secondary text-center mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2 px-4 rounded-lg border border-surface-container text-sm font-medium text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${cfg.btn}`}
          >
            {isLoading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
