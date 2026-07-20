import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { Eye, EyeOff, BookOpen } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ login: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.login || !form.password) {
      toast.error("Username dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const user = await login(form.login, form.password);

      toast.success(`Selamat datang, ${user.nama_lengkap}!`);

      // Redirect berdasarkan role
      const redirectMap = {
        operator: "/operator",
        guru: "/guru",
        kepsek: "/kepsek",
        ortu: "/ortu",
        wali_kelas: "/walikelas",
        bendahara: "/bendahara",
        admin_ppdb: "/adminppdb",
      };
      navigate(redirectMap[user.role] ?? "/login", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      let msg = data?.message ?? "Login gagal. Coba lagi.";
      if (data?.errors) {
        const firstErrorKey = Object.keys(data.errors)[0];
        const firstErrorMsg = data.errors[firstErrorKey]?.[0];
        if (firstErrorMsg) msg = firstErrorMsg;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <BookOpen className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-white">MI Nurul Huda 3</h1>
          <p className="text-primary-100 text-sm mt-1">Sistem Absensi Online</p>
        </div>

        {/* Card */}
        <div className="card shadow-xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Masuk ke Akun
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username atau Email
              </label>
              <input
                type="text"
                name="login"
                value={form.login}
                onChange={handleChange}
                placeholder="Masukkan username atau email"
                className="input-field"
                autoComplete="username"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                  className="input-field pr-10"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          {/* Register ortu link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Orang tua siswa?{" "}
            <Link
              to="/register-ortu"
              className="text-primary-600 hover:underline font-medium"
            >
              Daftar di sini
            </Link>
          </p>
        </div>

        <p className="text-center text-primary-200 text-xs mt-6">
          © 2025 MI Nurul Huda 3. All rights reserved.
        </p>
      </div>
    </div>
  );
}
