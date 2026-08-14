import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ login: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

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
      toast.success(`Selamat datang, ${user.nama}!`);
      const redirectMap = {
        super_admin: "/superadmin",
        operator: "/operator",
        super_operator: "/operator",
        kepsek: "/kepsek",
        wakasek: "/wakasek",
        guru: "/guru",
        guru_bk: "/guru-bk",
        wali_kelas: "/walikelas",
        pustakawan: "/pustakawan",
        tata_usaha: "/tata-usaha",
        bendahara: "/bendahara",
        admin_keuangan: "/admin-keuangan",
        admin_ppdb: "/adminppdb",
        ortu: "/ortu",
        siswa: "/siswa",
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
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden"
      style={{
        backgroundColor: "#F8FAF9",
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      }}
    >
      {/* Inline keyframes */}
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
        .auth-fade-in-up {
          opacity: 0;
          animation: authFadeInUp 0.75s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .auth-float { animation: authFloat 6s ease-in-out infinite; }
        .auth-pulse { animation: authPulse 2s ease-in-out infinite; }
        .auth-input-wrap { transition: box-shadow 0.3s ease, border-color 0.3s ease; }
        .auth-input-wrap:focus-within {
          box-shadow: 0 0 0 3px rgba(0,200,83,0.18);
          border-color: #00c853;
        }
        .auth-input-wrap:focus-within .auth-icon { color: #00c853; }
        .auth-icon { transition: color 0.3s ease; }
        .auth-btn {
          transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
        }
        .auth-btn:hover:not(:disabled) {
          background-color: #00e676;
          box-shadow: 0 15px 40px rgba(0,200,83,0.45);
          transform: translateY(-2px);
        }
        .auth-btn:hover:not(:disabled) .auth-btn-icon {
          transform: translateX(4px);
        }
        .auth-btn-icon { transition: transform 0.3s ease; }
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
          maxWidth: "72rem",
          background: "#ffffff",
          borderRadius: "2.5rem",
          boxShadow: "0 25px 60px -12px rgba(0,0,0,0.15)",
          border: "1px solid rgba(255,255,255,0.8)",
          minHeight: "600px",
        }}
      >
        {/* ── LEFT PANEL ── */}
        <div
          className="hidden md:flex md:w-5/12 relative flex-col items-center justify-center text-center p-12 overflow-hidden"
          style={{ background: "rgb(0, 26, 20)" }}
        >
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.12) 2px, transparent 2px)",
              backgroundSize: "30px 30px",
            }}
          />
          {/* Islamic SVG pattern */}
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
                  id="islamic-lp"
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
              <rect width="100%" height="100%" fill="url(#islamic-lp)" />
            </svg>
          </div>
          {/* Glow blob */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
            style={{ background: "rgba(0,200,83,0.18)", filter: "blur(80px)" }}
          />

          <div
            className="relative z-10 flex flex-col items-center auth-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full auth-pulse"
                style={{ backgroundColor: "#00c853" }}
              />
              <span className="text-xs font-bold tracking-widest uppercase text-white">
                Portal Akademik
              </span>
            </div>

            {/* Icon */}
            <div
              className="auth-float w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <span className="material-symbols-outlined text-white text-3xl">
                school
              </span>
            </div>

            {/* Title */}
            <h1
              className="font-extrabold text-white leading-tight mb-4"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "2.75rem",
                letterSpacing: "-0.02em",
              }}
            >
              MI Nurul <br />
              <span style={{ color: "#00c853" }}>Huda 3</span>
            </h1>

            <div
              className="w-12 h-1 rounded-full mb-6"
              style={{ backgroundColor: "#00c853" }}
            />

            <p
              className="text-lg leading-relaxed max-w-xs"
              style={{ color: "rgba(255,255,255,0.78)" }}
            >
              Membangun pondasi masa depan yang kokoh melalui integrasi nilai
              Islami dan keunggulan akademik.
            </p>
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
                style={{ backgroundColor: "#004d40" }}
              >
                <span className="material-symbols-outlined text-white text-xl">
                  school
                </span>
              </div>
              <span
                className="font-bold text-xl"
                style={{
                  color: "#004d40",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                MI Nurul Huda 3
              </span>
            </div>

            {/* Header */}
            <div className="mb-10">
              <h2
                className="font-extrabold tracking-tight mb-3"
                style={{
                  color: "#004d40",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "2.75rem",
                  lineHeight: "1.15",
                  letterSpacing: "-0.02em",
                }}
              >
                Selamat Datang
              </h2>
              <p style={{ color: "#3f4945", fontSize: "0.9375rem" }}>
                Silakan masuk ke akun Anda untuk melanjutkan.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "#3f4945" }}
                >
                  Username atau Email
                </label>
                <div
                  className="auth-input-wrap relative flex items-center rounded-xl overflow-hidden"
                  style={{ background: "#f8f9fa", border: "1px solid #e1e3e4" }}
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
                    type="text"
                    name="login"
                    value={form.login}
                    onChange={handleChange}
                    placeholder="Masukkan username atau email"
                    className="block w-full pl-3 pr-4 py-3.5 border-none focus:ring-0 bg-transparent outline-none"
                    style={{
                      color: "#111827",
                      fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
                      fontSize: "0.875rem",
                    }}
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className="block text-sm font-medium"
                    style={{ color: "#3f4945" }}
                  >
                    Kata Sandi
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium"
                    style={{ color: "#00c853" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#004d40")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#00c853")
                    }
                  >
                    Lupa sandi?
                  </Link>
                </div>
                <div
                  className="auth-input-wrap relative flex items-center rounded-xl overflow-hidden"
                  style={{ background: "#f8f9fa", border: "1px solid #e1e3e4" }}
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
                    placeholder="••••••••"
                    className="block w-full pl-3 pr-12 py-3.5 border-none focus:ring-0 bg-transparent outline-none"
                    style={{
                      color: "#111827",
                      fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
                      fontSize: "0.875rem",
                    }}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 transition-colors"
                    style={{ color: "#6B7280" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#374151")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#6B7280")
                    }
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

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded cursor-pointer"
                  style={{ accentColor: "#00c853" }}
                />
                <label
                  htmlFor="remember"
                  className="text-sm cursor-pointer font-medium"
                  style={{ color: "#3f4945" }}
                >
                  Ingat saya di perangkat ini
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="auth-btn w-full flex items-center justify-center gap-3 font-bold rounded-full mt-6"
                style={{
                  backgroundColor: "#00c853",
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
                    Memproses...
                  </span>
                ) : (
                  <>
                    <span>Masuk ke Portal</span>
                    <span className="material-symbols-outlined auth-btn-icon text-xl">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <p
              className="text-center text-sm mt-8"
              style={{ color: "#3f4945" }}
            >
              Orang tua siswa?{" "}
              <Link
                to="/register-ortu"
                className="font-bold transition-colors"
                style={{ color: "#004d40" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#00c853")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#004d40")}
              >
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
