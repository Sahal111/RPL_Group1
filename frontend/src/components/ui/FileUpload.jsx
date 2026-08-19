import { useRef, useState } from "react";
import { Upload, X, File, Image } from "lucide-react";

/**
 * FileUpload — area upload file dengan drag & drop
 * Props:
 *   value: File | null
 *   onChange: (file: File | null) => void
 *   accept: string (default: "*")
 *   maxSizeMb: number (default: 5)
 *   hint: string (optional)
 *   disabled: boolean
 *   className: string
 *
 * Contoh pemakaian:
 *   <FileUpload
 *     value={file}
 *     onChange={setFile}
 *     accept="image/*"
 *     maxSizeMb={2}
 *     hint="PNG, JPG maks. 2MB"
 *   />
 */
export default function FileUpload({
  value = null,
  onChange,
  accept = "*",
  maxSizeMb = 5,
  hint,
  disabled = false,
  className = "",
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const validate = (file) => {
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Ukuran file maks. ${maxSizeMb}MB.`);
      return false;
    }
    setError("");
    return true;
  };

  const handleFile = (file) => {
    if (!file) return;
    if (validate(file)) onChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const isImage = value?.type?.startsWith("image/");

  return (
    <div className={`space-y-2 ${className}`}>
      {value ? (
        /* Preview */
        <div className="flex items-center gap-3 p-3 bg-surface-container-low border border-surface-container rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            {isImage ? <Image size={18} /> : <File size={18} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-on-surface truncate">
              {value.name}
            </p>
            <p className="text-xs text-text-secondary">
              {(value.size / 1024).toFixed(1)} KB
            </p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setError("");
              }}
              className="p-1 text-text-secondary hover:text-danger rounded transition-colors"
              aria-label="Hapus file"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        /* Drop Zone */
        <button
          type="button"
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          disabled={disabled}
          className={`w-full flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-xl transition-colors text-center ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-surface-container hover:border-primary/40 hover:bg-surface-container-low"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-text-secondary">
            <Upload size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface">
              Klik atau seret file ke sini
            </p>
            {hint && (
              <p className="text-xs text-text-secondary mt-0.5">{hint}</p>
            )}
            {!hint && (
              <p className="text-xs text-text-secondary mt-0.5">
                Maks. {maxSizeMb}MB
              </p>
            )}
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
