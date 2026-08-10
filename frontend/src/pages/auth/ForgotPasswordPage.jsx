import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Terjadi kesalahan. Coba lagi.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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
          {!sent ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Lupa Password?
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Masukkan email yang terdaftar, kami akan kirimkan link untuk
                  reset password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Masukkan email kamu"
                      className="input-field pl-10"
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>
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
                      Mengirim...
                    </span>
                  ) : (
                    "Kirim Link Reset"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-14 h-14 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Email Terkirim!
              </h2>
              <p className="text-sm text-gray-500">
                Jika email{" "}
                <span className="font-medium text-gray-700">{email}</span>{" "}
                terdaftar di sistem, kamu akan menerima link reset password
                dalam beberapa menit.
              </p>
              <p className="text-xs text-gray-400 mt-3">
                Cek folder <strong>Spam</strong> jika tidak muncul di Inbox.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Link berlaku selama <strong>60 menit</strong>.
              </p>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:underline font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Login
            </Link>
          </div>
        </div>

        <p className="text-center text-primary-200 text-xs mt-6">
          © 2025 MI Nurul Huda 3. All rights reserved.
        </p>
      </div>
    </div>
  );
}
