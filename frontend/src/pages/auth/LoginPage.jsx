import { useState } from "react";
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
      style={{ backgroundColor: "#F8FAF9" }}
    >
      {/* Background glows */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full pointer-events-none"
        style={{
          background: "rgba(0,200,83,0.05)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full pointer-events-none"
        style={{
          background: "rgba(0,77,64,0.05)",
          filter: "blur(100px)",
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row overflow-hidden"
        style={{
          background: "#ffffff",
          borderRadius: "2.5rem",
          boxShadow: "0 25px 60px -12px rgba(0,0,0,0.12)",
          border: "1px solid rgba(255,255,255,0.8)",
          minHeight: "560px",
        }}
      >
        {/* ── LEFT PANEL ── */}
        <div
          className="hidden md:flex md:w-5/12 relative flex-col items-center justify-center text-center p-12 overflow-hidden"
          style={{ background: "rgb(0, 26, 20)" }}
        >
          {/* dot pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.1) 2px, transparent 2px)",
              backgroundSize: "30px 30px",
            }}
          />
          {/* glow blob */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
            style={{ background: "rgba(0,200,83,0.15)", filter: "blur(80px)" }}
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#00c853" }}
              />
              <span
                className="text-xs font-bold tracking-widest uppercase"
                style={{
                  color: "#ffffff",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Portal Akademik
              </span>
            </div>

            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
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
              className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
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
              style={{
                color: "rgba(255,255,255,0.75)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Membangun pondasi masa depan yang kokoh melalui integrasi nilai
              Islami dan keunggulan akademik.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-full md:w-7/12 p-10 lg:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
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
                  fontSize: "2.5rem",
                  lineHeight: "1.15",
                  letterSpacing: "-0.02em",
                }}
              >
                Selamat Datang
              </h2>
              <p
                style={{
                  color: "#6B7280",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.9rem",
                }}
              >
                Silakan masuk ke akun Anda untuk melanjutkan.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username/Email */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{
                    color: "#374151",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Username atau Email
                </label>
                <div
                  className="relative flex items-center rounded-xl overflow-hidden transition-all duration-300"
                  style={{
                    background: "#F8FAF9",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <div className="pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-xl">
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
                      fontFamily: "'Inter', sans-serif",
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
                    style={{
                      color: "#374151",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Kata Sandi
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium transition-colors"
                    style={{ color: "#00c853" }}
                  >
                    Lupa sandi?
                  </Link>
                </div>
                <div
                  className="relative flex items-center rounded-xl overflow-hidden transition-all duration-300"
                  style={{
                    background: "#F8FAF9",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <div className="pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-xl">
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
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.875rem",
                    }}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
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
                  className="text-sm cursor-pointer"
                  style={{
                    color: "#6B7280",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Ingat saya di perangkat ini
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 font-bold rounded-full transition-all duration-300 mt-4"
                style={{
                  backgroundColor: "#00c853",
                  color: "#ffffff",
                  padding: "1rem 2rem",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.95rem",
                  boxShadow: "0 8px 24px rgba(0,200,83,0.25)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = "#00e676";
                    e.currentTarget.style.boxShadow =
                      "0 12px 32px rgba(0,200,83,0.4)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#00c853";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(0,200,83,0.25)";
                  e.currentTarget.style.transform = "translateY(0)";
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
                    <span className="material-symbols-outlined text-xl">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <p
              className="text-center text-sm mt-8"
              style={{ color: "#6B7280", fontFamily: "'Inter', sans-serif" }}
            >
              Orang tua siswa?{" "}
              <Link
                to="/register-ortu"
                className="font-bold transition-colors"
                style={{ color: "#004d40" }}
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
