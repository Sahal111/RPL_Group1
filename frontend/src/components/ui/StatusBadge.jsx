/**
 * StatusBadge — badge dengan dot indicator untuk status entitas
 * Props:
 *   status: "aktif" | "nonaktif" | "pending" | "approved" | "rejected" |
 *           "archived" | "draft" | string
 *   label: string (optional — overrides default label)
 *   dot: boolean (default: true)
 *   size: "sm" | "md" (default: "md")
 */

const STATUS_MAP = {
  aktif: {
    label: "Aktif",
    cls: "bg-green-100 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  nonaktif: {
    label: "Nonaktif",
    cls: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
  },
  pending: {
    label: "Menunggu",
    cls: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  approved: {
    label: "Disetujui",
    cls: "bg-green-100 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Ditolak",
    cls: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  archived: {
    label: "Diarsipkan",
    cls: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
  },
  draft: {
    label: "Draft",
    cls: "bg-blue-100 text-blue-600 border-blue-200",
    dot: "bg-blue-400",
  },
  active: {
    label: "Aktif",
    cls: "bg-green-100 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  inactive: {
    label: "Nonaktif",
    cls: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
  },
};

export default function StatusBadge({
  status = "aktif",
  label,
  dot = true,
  size = "md",
  className = "",
}) {
  const key = status?.toLowerCase();
  const config = STATUS_MAP[key] ?? {
    label: status,
    cls: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  };

  const sizeClass =
    size === "sm"
      ? "px-2 py-0.5 text-[10px] gap-1"
      : "px-2.5 py-1 text-xs gap-1.5";

  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${sizeClass} ${config.cls} ${className}`}
    >
      {dot && (
        <span
          className={`rounded-full flex-shrink-0 ${dotSize} ${config.dot}`}
        />
      )}
      {label ?? config.label}
    </span>
  );
}
