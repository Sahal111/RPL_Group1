import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8001/api",
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
