import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [form, setForm] = useState({
    password: "",
    password_confirmation: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState("checking"); // checking | valid | invalid
  const [success, setSuccess] = useState(false);

  // Verifikasi token saat halaman dimuat
  useEffect(() => {
    if (!token || !email) {
      setTokenStatus("invalid");
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get("/auth/verify-reset-token", {
          params: { token, email },
        });
        setTokenStatus(res.data.valid ? "valid" : "invalid");
      } catch {
        setTokenStatus("invalid");
      }
    };

    verify();
  }, [token, email]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.password || !form.password_confirmation) {
      toast.error("Semua field wajib diisi.");
      return;
    }

    if (form.password !== form.password_confirmation) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password minimal 8 karakter.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      setSuccess(true);
      toast.success("Password berhasil direset!");

      // Redirect ke login setelah 3 detik
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    } catch (err) {
      const data = err.response?.data;
      let msg = data?.message ?? "Gagal mereset password. Coba lagi.";
      if (data?.errors) {
        const first = Object.values(data.errors)[0]?.[0];
        if (first) msg = first;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (tokenStatus === "checking") {
      return (
        <div className="text-center py-8">
          <svg
            className="animate-spin h-8 w-8 text-primary-500 mx-auto mb-3"
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
          <p className="text-sm text-gray-500">Memverifikasi link reset...</p>
        </div>
      );
    }

    if (tokenStatus === "invalid") {
      return (
        <div className="text-center py-4">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-14 h-14 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Link Tidak Valid
          </h2>
          <p className="text-sm text-gray-500">
            Link reset password sudah kadaluarsa atau tidak valid. Silakan minta
            link baru.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block mt-5 btn-primary text-sm px-6 py-2"
          >
            Minta Link Baru
          </Link>
        </div>
      );
    }

    if (success) {
      return (
        <div className="text-center py-4">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Password Berhasil Direset!
          </h2>
          <p className="text-sm text-gray-500">
            Password kamu sudah diperbarui. Kamu akan diarahkan ke halaman login
            dalam 3 detik...
          </p>
          <Link
            to="/login"
            className="inline-block mt-5 text-sm text-primary-600 hover:underline font-medium"
          >
            Login Sekarang
          </Link>
        </div>
      );
    }

    return (
      <>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Reset Password
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Buat password baru untuk akun{" "}
            <span className="font-medium text-gray-700">{email}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Baru */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Baru
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimal 8 karakter"
                className="input-field pl-10 pr-10"
                autoComplete="new-password"
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
            <p className="text-xs text-gray-400 mt-1">
              Minimal 8 karakter, mengandung huruf dan angka.
            </p>
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showConfirm ? "text" : "password"}
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                placeholder="Ulangi password baru"
                className="input-field pl-10 pr-10"
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {form.password_confirmation &&
              form.password !== form.password_confirmation && (
                <p className="text-xs text-red-500 mt-1">
                  Password tidak cocok.
                </p>
              )}
          </div>

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
                Menyimpan...
              </span>
            ) : (
              "Simpan Password Baru"
            )}
          </button>
        </form>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-4">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold">SIAKAD</h1>
          <p className="text-primary-200 text-sm mt-1">MI Nurul Huda 3</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderContent()}

          {tokenStatus === "valid" && !success && (
            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <Link
                to="/login"
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Kembali ke Login
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-primary-200 text-xs mt-6">
          © 2025 MI Nurul Huda 3. All rights reserved.
        </p>
      </div>
    </div>
  );
}
