import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pagination — komponen pagination dari response API Laravel
 * Props:
 *   meta: { current_page, last_page, per_page, total, from, to }
 *   onPageChange: (page: number) => void
 *   className: string
 */
export default function Pagination({ meta, onPageChange, className = "" }) {
  if (!meta || meta.last_page <= 1) return null;

  const { current_page, last_page, from, to, total } = meta;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(1, current_page - delta);
    const right = Math.min(last_page, current_page + delta);

    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push("...");
    }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < last_page) {
      if (right < last_page - 1) pages.push("...");
      pages.push(last_page);
    }
    return pages;
  };

  return (
    <div className={`flex items-center justify-between gap-4 flex-wrap ${className}`}>
      {/* Info */}
      <p className="text-sm text-text-secondary">
        Menampilkan <span className="font-medium text-on-surface">{from ?? 0}–{to ?? 0}</span>{" "}
        dari <span className="font-medium text-on-surface">{total}</span> data
      </p>

      {/* Pages */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
          className="p-1.5 rounded-lg border border-surface-container hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, i) =>
          page === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-text-secondary text-sm select-none">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors ${
                page === current_page
                  ? "bg-primary text-on-primary"
                  : "border border-surface-container hover:bg-surface-container text-on-surface"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
          className="p-1.5 rounded-lg border border-surface-container hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
