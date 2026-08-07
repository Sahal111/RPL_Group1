import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Modal — reusable dialog overlay
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 *   title: string
 *   size: "sm" | "md" | "lg" | "xl" | "full" (default: "md")
 *   children: ReactNode
 */
export default function Modal({ isOpen, onClose, title, size = "md", children }) {
  const overlayRef = useRef(null);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeMap = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    "2xl": "max-w-4xl",
    full: "max-w-7xl",
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <div
        className={`relative w-full ${sizeMap[size] ?? sizeMap.md} max-h-[90vh] flex flex-col bg-surface-container-lowest rounded-2xl shadow-xl`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container shrink-0">
            <h3 className="text-base font-semibold text-on-surface">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container transition-colors"
              aria-label="Tutup modal"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto px-6 py-4 flex-1">{children}</div>
      </div>
    </div>
  );
}
