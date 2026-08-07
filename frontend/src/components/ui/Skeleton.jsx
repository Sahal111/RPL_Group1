/**
 * Skeleton — loading placeholder
 * Props:
 *   type: "text" | "card" | "table" | "circle" | "rect"
 *   rows: number (untuk type "text" & "table")
 *   className: string
 */

function SkeletonBlock({ className = "" }) {
  return (
    <div className={`animate-pulse bg-surface-container rounded ${className}`} />
  );
}

function SkeletonText({ rows = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonBlock
          key={i}
          className={`h-4 ${i === rows - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex gap-3 pb-2">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBlock key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 py-2 border-b border-surface-container">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonBlock key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl border border-surface-container space-y-3">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="h-3 w-24" />
        </div>
      </div>
      <SkeletonText rows={2} />
    </div>
  );
}

export default function Skeleton({ type = "text", rows, cols, className = "" }) {
  if (type === "table") return <SkeletonTable rows={rows} cols={cols} />;
  if (type === "card") return <SkeletonCard />;
  if (type === "circle") return <SkeletonBlock className={`rounded-full ${className || "h-10 w-10"}`} />;
  if (type === "rect") return <SkeletonBlock className={className || "h-32 w-full"} />;
  return <SkeletonText rows={rows ?? 3} />;
}
