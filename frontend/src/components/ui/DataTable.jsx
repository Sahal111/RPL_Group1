import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import Skeleton from "./Skeleton";
import Pagination from "./Pagination";

/**
 * DataTable — tabel data responsif dengan kolom configurable
 * Props:
 *   columns: ColumnDef[]  (dari @tanstack/react-table)
 *   data: any[]
 *   isLoading: boolean
 *   meta: { current_page, last_page, per_page, total, from, to } | null
 *   onPageChange: (page: number) => void
 *   emptyMessage: string
 *   className: string
 */
export default function DataTable({
  columns,
  data = [],
  isLoading = false,
  meta = null,
  onPageChange,
  emptyMessage = "Tidak ada data.",
  className = "",
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: meta?.last_page ?? 1,
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table wrapper */}
      <div className="overflow-x-auto rounded-xl border border-surface-container">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-surface-container text-left">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-surface-container">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6">
                  <Skeleton type="table" rows={5} cols={columns.length} />
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-text-secondary py-10 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-on-surface">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && onPageChange && (
        <Pagination meta={meta} onPageChange={onPageChange} />
      )}
    </div>
  );
}
