import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const FONT = "'Plus Jakarta Sans', 'Inter', sans-serif";
const GREEN = "#00c853";
const DARK_GREEN = "#004d40";
const BG_FIELD = "#f8f9fa";
const BORDER = "#e1e3e4";
const TEXT_SEC = "#3f4945";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [form, setForm] = useState({ password: "", password_confirmation: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState("checking");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

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

  useEffect(() => {
    if (!success) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          navigate("/login", { replace: true });
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [success, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden"
      style={{ backgroundColor: "#F8FAF9", fontFamily: FONT }}
    >
      <style>{`
        @keyframes authFadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes authFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes authPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        @keyframes successPop {
          0%   { opacity: 0; transform: scale(0.7); }
          60%  { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes countdownShrink {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: 125.6; }
        }
        .auth-fade-in-up { opacity:0; animation: authFadeInUp 0.75s cubic-bezier(0.16,1,0.3,1) forwards; }
        .auth-float      { animation: authFloat 6s ease-in-out infinite; }
        .auth-pulse      { animation: authPulse 2s ease-in-out infinite; }
        .success-pop     { animation: successPop 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        .auth-input-wrap { transition: box-shadow 0.3s ease, border-color 0.3s ease; }
        .auth-input-wrap:focus-within { box-shadow: 0 0 0 3px rgba(0,200,83,0.18); border-color: #00c853; }
        .auth-input-wrap:focus-within .auth-icon { color: #00c853; }
        .auth-icon { transition: color 0.3s ease; }
        .auth-btn { transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease; }
        .auth-btn:hover:not(:disabled) {
          background-color: #00e676 !important;
          box-shadow: 0 15px 40px rgba(0,200,83,0.45) !important;
          transform: translateY(-2px);
        }
        .auth-btn:hover:not(:disabled) .auth-btn-icon { transform: translateX(4px); }
        .auth-btn-icon { transition: transform 0.3s ease; }
        .back-link { transition: color 0.25s ease; display: inline-flex; align-items: center; gap: 6px; }
        .back-link:hover { color: #004d40; }
        .back-link:hover .back-arrow { transform: translateX(-3px); }
        .back-arrow { transition: transform 0.25s ease; }
        .strength-bar { transition: width 0.4s ease, background-color 0.4s ease; }
      `}</style>

      {/* Background blobs */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full pointer-events-none"
        style={{ background: "rgba(0,200,83,0.05)", filter: "blur(100px)" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full pointer-events-none"
        style={{ background: "rgba(0,77,64,0.05)", filter: "blur(100px)" }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full flex flex-col md:flex-row overflow-hidden"
        style={{
          maxWidth: "64rem",
          background: "#ffffff",
          borderRadius: "2.5rem",
          boxShadow: "0 25px 60px -12px rgba(0,0,0,0.15)",
          border: "1px solid rgba(255,255,255,0.8)",
          minHeight: "560px",
        }}
      >
        {/* ── LEFT PANEL ── */}
        <div
          className="hidden md:flex md:w-5/12 relative flex-col items-center justify-center text-center p-12 overflow-hidden"
          style={{ background: "rgb(0, 26, 20)" }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.12) 2px, transparent 2px)",
              backgroundSize: "30px 30px",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: 0.05 }}
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="islamic-rsp"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M20 0 L24.4 15.6 L40 20 L24.4 24.4 L20 40 L15.6 24.4 L0 20 L15.6 15.6 Z"
                    fill="#ffffff"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#islamic-rsp)" />
            </svg>
          </div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
            style={{ background: "rgba(0,200,83,0.18)", filter: "blur(80px)" }}
          />

          <div
            className="relative z-10 flex flex-col items-center auth-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full auth-pulse"
                style={{ backgroundColor: GREEN }}
              />
              <span className="text-xs font-bold tracking-widest uppercase text-white">
                Portal Akademik
              </span>
            </div>

            <div
              className="auth-float w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <span className="material-symbols-outlined text-white text-3xl">
                {tokenStatus === "invalid" ? "lock" : "password"}
              </span>
            </div>

            <h1
              className="font-extrabold text-white leading-tight mb-4"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "2.5rem",
                letterSpacing: "-0.02em",
              }}
            >
              MI Nurul <br />
              <span style={{ color: GREEN }}>Huda 3</span>
            </h1>
            <div
              className="w-12 h-1 rounded-full mb-6"
              style={{ backgroundColor: GREEN }}
            />

            {/* Password tips */}
            {tokenStatus === "valid" && !success && (
              <div className="w-full space-y-2.5 mt-2">
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Tips Password Aman
                </p>
                {[
                  { icon: "check_circle", text: "Minimal 8 karakter" },
                  { icon: "check_circle", text: "Kombinasi huruf & angka" },
                  { icon: "check_circle", text: "Hindari info pribadi" },
                  { icon: "check_circle", text: "Gunakan simbol (!@#$)" },
                ].map((tip, i) => (
                  <div key={i} className="flex items-center gap-2 text-left">
                    <span
                      className="material-symbols-outlined shrink-0"
                      style={{ color: "rgba(0,200,83,0.6)", fontSize: "16px" }}
                    >
                      {tip.icon}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "rgba(255,255,255,0.65)" }}
                    >
                      {tip.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-full md:w-7/12 p-12 lg:p-16 flex flex-col justify-center bg-white items-center">
          <div
            className="max-w-md w-full mx-auto auth-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            {/* Mobile logo */}
            <div className="md:hidden flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: DARK_GREEN }}
              >
                <span className="material-symbols-outlined text-white text-xl">
                  school
                </span>
              </div>
              <span className="font-bold text-xl" style={{ color: DARK_GREEN }}>
                MI Nurul Huda 3
              </span>
            </div>

            {/* ── CHECKING STATE ── */}
            {tokenStatus === "checking" && (
              <div className="text-center py-12">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: "rgba(0,200,83,0.08)" }}
                >
                  <svg
                    className="animate-spin h-8 w-8"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ color: GREEN }}
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                </div>
                <p className="font-semibold" style={{ color: DARK_GREEN }}>
                  Memverifikasi link reset...
                </p>
                <p className="text-sm mt-2" style={{ color: TEXT_SEC }}>
                  Mohon tunggu sebentar.
                </p>
              </div>
            )}

            {/* ── INVALID TOKEN ── */}
            {tokenStatus === "invalid" && (
              <div className="text-center py-4 auth-fade-in-up">
                <div
                  className="success-pop w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: "rgba(220,38,38,0.08)" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#DC2626", fontSize: "2.5rem" }}
                  >
                    link_off
                  </span>
                </div>
                <h2
                  className="font-extrabold mb-3"
                  style={{
                    color: DARK_GREEN,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "2rem",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Link Tidak Valid
                </h2>
                <p className="text-sm mb-6" style={{ color: TEXT_SEC }}>
                  Link reset password sudah kadaluarsa atau tidak valid. Silakan
                  minta link baru untuk melanjutkan.
                </p>
                <Link
                  to="/forgot-password"
                  className="auth-btn inline-flex items-center gap-3 font-bold rounded-full"
                  style={{
                    backgroundColor: GREEN,
                    color: "#ffffff",
                    padding: "0.875rem 2rem",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.9rem",
                    boxShadow: "0 8px 24px rgba(0,200,83,0.28)",
                    textDecoration: "none",
                  }}
                >
                  <span className="material-symbols-outlined text-xl">
                    refresh
                  </span>
                  Minta Link Baru
                </Link>
              </div>
            )}

            {/* ── SUCCESS STATE ── */}
            {success && (
              <div className="text-center py-4 auth-fade-in-up">
                <div
                  className="success-pop w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: "rgba(0,200,83,0.1)" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: GREEN, fontSize: "2.5rem" }}
                  >
                    check_circle
                  </span>
                </div>
                <h2
                  className="font-extrabold mb-3"
                  style={{
                    color: DARK_GREEN,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "2rem",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Password Direset!
                </h2>
                <p className="text-sm mb-6" style={{ color: TEXT_SEC }}>
                  Password Anda berhasil diperbarui. Anda akan diarahkan ke
                  halaman login dalam{" "}
                  <span className="font-bold" style={{ color: GREEN }}>
                    {countdown} detik
                  </span>
                  .
                </p>
                {/* Countdown ring */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 44 44">
                      <circle
                        cx="22"
                        cy="22"
                        r="20"
                        fill="none"
                        stroke="#e1e3e4"
                        strokeWidth="3"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="20"
                        fill="none"
                        stroke={GREEN}
                        strokeWidth="3"
                        strokeDasharray="125.6"
                        strokeDashoffset={((5 - countdown) / 5) * 125.6}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                      />
                    </svg>
                    <span
                      className="absolute inset-0 flex items-center justify-center font-bold text-lg"
                      style={{ color: DARK_GREEN }}
                    >
                      {countdown}
                    </span>
                  </div>
                </div>
                <Link
                  to="/login"
                  className="text-sm font-semibold"
                  style={{ color: GREEN }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = DARK_GREEN)
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.color = GREEN)}
                >
                  Login Sekarang →
                </Link>
              </div>
            )}

            {/* ── VALID FORM ── */}
            {tokenStatus === "valid" && !success && (
              <>
                <div className="mb-8">
                  <h2
                    className="font-extrabold tracking-tight mb-3"
                    style={{
                      color: DARK_GREEN,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "2.5rem",
                      lineHeight: "1.15",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Reset Password
                  </h2>
                  <p style={{ color: TEXT_SEC, fontSize: "0.9375rem" }}>
                    Buat password baru untuk akun{" "}
                    <span
                      className="font-semibold"
                      style={{ color: DARK_GREEN }}
                    >
                      {email}
                    </span>
                    .
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Password baru */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: TEXT_SEC }}
                    >
                      Password Baru
                    </label>
                    <div
                      className="auth-input-wrap relative flex items-center rounded-xl overflow-hidden"
                      style={{
                        background: BG_FIELD,
                        border: `1px solid ${BORDER}`,
                      }}
                    >
                      <div className="pl-4 flex items-center pointer-events-none">
                        <span
                          className="material-symbols-outlined auth-icon text-xl"
                          style={{ color: "#6B7280" }}
                        >
                          lock
                        </span>
                      </div>
                      <input
                        type={showPass ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Minimal 8 karakter"
                        className="block w-full pl-3 pr-12 py-3.5 border-none focus:ring-0 bg-transparent outline-none text-sm"
                        style={{ color: "#111827", fontFamily: FONT }}
                        autoComplete="new-password"
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 transition-colors"
                        style={{ color: "#6B7280" }}
                        tabIndex={-1}
                      >
                        {showPass ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {/* Password strength */}
                    {form.password && (
                      <div className="mt-2">
                        <div
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: "#e1e3e4" }}
                        >
                          <div
                            className="h-full rounded-full strength-bar"
                            style={{
                              width:
                                form.password.length >= 12
                                  ? "100%"
                                  : form.password.length >= 8
                                    ? "66%"
                                    : "33%",
                              backgroundColor:
                                form.password.length >= 12
                                  ? GREEN
                                  : form.password.length >= 8
                                    ? "#F2A900"
                                    : "#DC2626",
                            }}
                          />
                        </div>
                        <p
                          className="text-xs mt-1"
                          style={{
                            color:
                              form.password.length >= 12
                                ? GREEN
                                : form.password.length >= 8
                                  ? "#F2A900"
                                  : "#DC2626",
                          }}
                        >
                          {form.password.length >= 12
                            ? "Kuat"
                            : form.password.length >= 8
                              ? "Cukup"
                              : "Lemah"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Konfirmasi password */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: TEXT_SEC }}
                    >
                      Konfirmasi Password
                    </label>
                    <div
                      className="auth-input-wrap relative flex items-center rounded-xl overflow-hidden"
                      style={{
                        background: BG_FIELD,
                        border: `1px solid ${BORDER}`,
                      }}
                    >
                      <div className="pl-4 flex items-center pointer-events-none">
                        <span
                          className="material-symbols-outlined auth-icon text-xl"
                          style={{ color: "#6B7280" }}
                        >
                          lock_reset
                        </span>
                      </div>
                      <input
                        type={showConfirm ? "text" : "password"}
                        name="password_confirmation"
                        value={form.password_confirmation}
                        onChange={handleChange}
                        placeholder="Ulangi password baru"
                        className="block w-full pl-3 pr-12 py-3.5 border-none focus:ring-0 bg-transparent outline-none text-sm"
                        style={{ color: "#111827", fontFamily: FONT }}
                        autoComplete="new-password"
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 transition-colors"
                        style={{ color: "#6B7280" }}
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
                        <p
                          className="text-xs mt-1 flex items-center gap-1"
                          style={{ color: "#DC2626" }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "14px" }}
                          >
                            cancel
                          </span>
                          Password tidak cocok.
                        </p>
                      )}
                    {form.password_confirmation &&
                      form.password === form.password_confirmation &&
                      form.password.length >= 8 && (
                        <p
                          className="text-xs mt-1 flex items-center gap-1"
                          style={{ color: GREEN }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "14px" }}
                          >
                            check_circle
                          </span>
                          Password cocok.
                        </p>
                      )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="auth-btn w-full flex items-center justify-center gap-3 font-bold rounded-full mt-2"
                    style={{
                      backgroundColor: GREEN,
                      color: "#ffffff",
                      padding: "1rem 2rem",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.95rem",
                      boxShadow: "0 8px 24px rgba(0,200,83,0.28)",
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
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
                      <>
                        <span>Simpan Password Baru</span>
                        <span className="material-symbols-outlined auth-btn-icon text-xl">
                          check
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Back to login */}
            {tokenStatus !== "checking" && !success && (
              <div
                className="mt-8 pt-6 text-center"
                style={{ borderTop: "1px solid #e1e3e4" }}
              >
                <Link
                  to="/login"
                  className="back-link text-sm font-semibold"
                  style={{ color: GREEN }}
                >
                  <span className="material-symbols-outlined back-arrow text-base">
                    arrow_back
                  </span>
                  Kembali ke Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
