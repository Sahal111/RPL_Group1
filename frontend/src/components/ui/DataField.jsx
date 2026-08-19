/**
 * DataField — pasangan label + nilai untuk halaman detail
 * Props:
 *   label: string
 *   value: ReactNode
 *   placeholder: string (tampil saat value kosong, default: "-")
 *   horizontal: boolean (default: false — vertikal)
 *   className: string
 *
 * Contoh pemakaian:
 *   <DataField label="Nama Lengkap" value={guru.nama_lengkap} />
 *   <DataField label="Status" value={<StatusBadge status="aktif" />} />
 */
export default function DataField({
  label,
  value,
  placeholder = "-",
  horizontal = false,
  className = "",
}) {
  const isEmpty = value === null || value === undefined || value === "";
  const displayed = isEmpty ? (
    <span className="text-text-secondary italic">{placeholder}</span>
  ) : (
    value
  );

  if (horizontal) {
    return (
      <div
        className={`grid grid-cols-3 gap-2 py-2.5 border-b border-surface-container last:border-0 ${className}`}
      >
        <span className="text-xs text-text-secondary col-span-1 pt-0.5">
          {label}
        </span>
        <span className="text-sm text-on-surface font-medium col-span-2">
          {displayed}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      <span className="text-sm text-on-surface">{displayed}</span>
    </div>
  );
}
