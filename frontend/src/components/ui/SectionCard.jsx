/**
 * SectionCard — card container untuk section dalam halaman detail / form
 * Props:
 *   title: string
 *   description: string (optional)
 *   icon: LucideIcon (optional)
 *   action: ReactNode (optional — tombol di pojok kanan header)
 *   children: ReactNode
 *   className: string
 *   bodyClassName: string
 *
 * Contoh pemakaian:
 *   <SectionCard title="Informasi Pribadi" icon={User}>
 *     <DataField label="Nama" value={guru.nama_lengkap} />
 *   </SectionCard>
 */
export default function SectionCard({
  title,
  description,
  icon: Icon,
  action,
  children,
  className = "",
  bodyClassName = "",
}) {
  return (
    <div
      className={`bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-container">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Icon size={16} />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-sm font-semibold text-on-surface">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-text-secondary mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}

      {/* Body */}
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
