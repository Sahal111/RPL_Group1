import { backendBaseUrl } from "./axios";

/**
 * Build full URL untuk file di Laravel storage.
 * Semua komponen pakai ini — tidak ada hardcode URL di component.
 *
 * @param {string|null} path - path relatif dari storage (contoh: "foto/guru/abc.jpg")
 * @returns {string|null}
 */
export function storageUrl(path) {
  if (!path) return null;
  // Sudah full URL (external) — kembalikan apa adanya
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${backendBaseUrl}/storage/${path}`;
}
