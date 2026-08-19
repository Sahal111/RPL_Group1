import { Inbox } from "lucide-react";

/**
 * EmptyState — tampilan kosong dengan ikon, judul, deskripsi, dan aksi
 * Props:
 *   icon: LucideIcon (default: Inbox)
 *   title: string
 *   description: string (optional)
 *   action: ReactNode (optional — tombol atau link)
 *   className: string
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = "Belum ada data",
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-14 px-6 text-center ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
        <Icon size={28} className="text-text-secondary" />
      </div>
      <p className="text-sm font-semibold text-on-surface mb-1">{title}</p>
      {description && (
        <p className="text-sm text-text-secondary max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
