import axios from "axios";

// Satu sumber kebenaran untuk backend URL.
// VITE_API_URL  → full URL termasuk /api  (contoh: http://127.0.0.1:8000/api)
// VITE_BACKEND_URL → root URL tanpa /api  (contoh: http://127.0.0.1:8000)
// Jika hanya VITE_BACKEND_URL yang diset, /api di-append otomatis.
const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000";

export const apiBaseUrl = import.meta.env.VITE_API_URL ?? `${backendUrl}/api`;
export const backendBaseUrl = backendUrl;

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});

// Token tidak perlu di-attach manual — browser otomatis kirim HttpOnly cookie
// karena withCredentials: true sudah diset di atas.

// Response interceptor — handle 401 global
// PENTING: /auth/me DIKECUALIKAN karena endpoint itu memang bisa return 401
// untuk user yang belum login di halaman publik. AuthContext sudah handle sendiri.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isAuthMe = requestUrl.includes("/auth/me");

    if (error.response?.status === 401 && !isAuthMe) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
