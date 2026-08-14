import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const FONT = "'Plus Jakarta Sans', 'Inter', sans-serif";
const GREEN = "#00c853";
const DARK_GREEN = "#004d40";
const BG_FIELD = "#f8f9fa";
const BORDER = "#e1e3e4";
const TEXT_SEC = "#3f4945";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

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
      toast.error(
        err.response?.data?.message ?? "Terjadi kesalahan. Coba lagi.",
      );
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
          100% { transform: scale(1); }
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
        .back-link { transition: color 0.25s ease, transform 0.25s ease; display: inline-flex; align-items: center; gap: 6px; }
        .back-link:hover { color: #004d40; }
        .back-link:hover .back-arrow { transform: translateX(-3px); }
        .back-arrow { transition: transform 0.25s ease; }
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
                  id="islamic-fp"
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
              <rect width="100%" height="100%" fill="url(#islamic-fp)" />
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
                lock_reset
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
            <p
              className="text-base leading-relaxed max-w-xs"
              style={{ color: "rgba(255,255,255,0.78)" }}
            >
              Kami akan mengirimkan tautan pemulihan ke email yang Anda
              daftarkan.
            </p>

            {/* Step indicator */}
            <div className="mt-8 w-full space-y-3">
              {[
                { num: "01", label: "Masukkan email terdaftar" },
                { num: "02", label: "Cek inbox atau folder spam" },
                { num: "03", label: "Klik link & buat password baru" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-left">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs"
                    style={{
                      background: i === 0 ? GREEN : "rgba(255,255,255,0.1)",
                      color: i === 0 ? "#fff" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {step.num}
                  </div>
                  <span
                    className="text-sm"
                    style={{
                      color:
                        i === 0
                          ? "rgba(255,255,255,0.9)"
                          : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
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

            {!sent ? (
              <>
                {/* Header */}
                <div className="mb-10">
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
                    Lupa Password?
                  </h2>
                  <p style={{ color: TEXT_SEC, fontSize: "0.9375rem" }}>
                    Masukkan email yang terdaftar dan kami akan kirimkan link
                    untuk reset password Anda.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: TEXT_SEC }}
                    >
                      Alamat Email
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
                          mail
                        </span>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="block w-full pl-3 pr-4 py-3.5 border-none focus:ring-0 bg-transparent outline-none text-sm"
                        style={{ color: "#111827", fontFamily: FONT }}
                        autoComplete="email"
                        disabled={loading}
                        required
                      />
                    </div>
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
                        Mengirim...
                      </span>
                    ) : (
                      <>
                        <span>Kirim Link Reset</span>
                        <span className="material-symbols-outlined auth-btn-icon text-xl">
                          send
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success State */
              <div className="text-center py-4 auth-fade-in-up">
                <div
                  className="success-pop w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: "rgba(0,200,83,0.1)" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: GREEN, fontSize: "2.5rem" }}
                  >
                    mark_email_read
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
                  Email Terkirim!
                </h2>
                <p className="text-sm mb-2" style={{ color: TEXT_SEC }}>
                  Jika email{" "}
                  <span className="font-semibold" style={{ color: DARK_GREEN }}>
                    {email}
                  </span>{" "}
                  terdaftar di sistem, Anda akan menerima link reset password
                  dalam beberapa menit.
                </p>
                <div
                  className="mt-4 rounded-2xl p-4 text-left space-y-2"
                  style={{
                    background: "rgba(0,200,83,0.06)",
                    border: "1px solid rgba(0,200,83,0.18)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined shrink-0"
                      style={{ color: GREEN, fontSize: "16px" }}
                    >
                      folder
                    </span>
                    <p className="text-xs" style={{ color: TEXT_SEC }}>
                      Cek folder <strong>Spam</strong> jika tidak muncul di
                      Inbox.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined shrink-0"
                      style={{ color: GREEN, fontSize: "16px" }}
                    >
                      schedule
                    </span>
                    <p className="text-xs" style={{ color: TEXT_SEC }}>
                      Link berlaku selama <strong>60 menit</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Back to login */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
