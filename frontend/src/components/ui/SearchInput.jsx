import { useRef } from "react";
import { Search, X } from "lucide-react";

/**
 * SearchInput — input pencarian dengan tombol clear
 * Props:
 *   value: string
 *   onChange: (value: string) => void
 *   placeholder: string (default: "Cari...")
 *   className: string
 *   disabled: boolean
 */
export default function SearchInput({
  value = "",
  onChange,
  placeholder = "Cari...",
  className = "",
  disabled = false,
}) {
  const inputRef = useRef(null);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full pl-9 pr-8 py-2 text-sm bg-surface-container-low border border-surface-container rounded-xl text-on-surface placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-text-secondary hover:text-on-surface rounded transition-colors"
          aria-label="Hapus pencarian"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
