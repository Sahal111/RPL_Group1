import { createContext, useContext, useState, useEffect } from "react";
import api, { backendBaseUrl } from "../lib/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Token tidak lagi disimpan di localStorage — ada di HttpOnly cookie.
    // Cek session aktif via /auth/me agar state user ter-restore saat refresh.
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (loginVal, password) => {
    // Sanctum SPA auth: harus ambil CSRF cookie dulu sebelum POST apapun.
    // Tanpa ini → Laravel return 419 (CSRF token mismatch).
    await api.get("/sanctum/csrf-cookie", {
      baseURL: backendBaseUrl,
    });

    const res = await api.post("/auth/login", {
      login: loginVal,
      password,
    });
    // Token ada di HttpOnly cookie — tidak perlu disimpan secara manual.
    const { user } = res.data.data;
    setUser(user);
    return user;
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      // Cookie di-clear oleh backend. Cukup reset state.
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
