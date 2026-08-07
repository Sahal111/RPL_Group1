/**
 * Badge — pill label komponen
 * Props:
 *   variant: "success" | "warning" | "danger" | "info" | "default" | "neutral"
 *   children: ReactNode
 *   size: "sm" | "md" (default: "md")
 */
const variantMap = {
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  default: "bg-surface-container text-on-surface-variant",
  neutral: "bg-surface-container-high text-text-secondary",
  primary: "bg-primary/10 text-primary",
};

export default function Badge({ variant = "default", size = "md", children, className = "" }) {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClass} ${variantMap[variant] ?? variantMap.default} ${className}`}
    >
      {children}
    </span>
  );
}
