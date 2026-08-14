import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const FONT = "'Plus Jakarta Sans', 'Inter', sans-serif";
const GREEN = "#00c853";
const DARK_GREEN = "#004d40";
const BG_FIELD = "#f8f9fa";
const BORDER = "#e1e3e4";
const TEXT_SEC = "#3f4945";

export default function RegisterOrtuPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    nama_lengkap: "",
    no_hp: "",
    nisn: "",
    kode_sekolah: "",
    hubungan: "Ayah",
  });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data) => api.post("/auth/register-ortu", data),
    onSuccess: (res) => {
      toast.success(
        res.data.message ||
          "Registrasi berhasil, menunggu persetujuan operator.",
        { duration: 5000 },
      );
      navigate("/login");
    },
    onError: (err) => {
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach((e) =>
          toast.error(e[0]),
        );
      } else {
        toast.error(err.response?.data?.message || "Registrasi gagal.");
      }
    },
    onSettled: () => setLoading(false),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      toast.error("Password dan konfirmasi password tidak cocok.");
      return;
    }
    setLoading(true);
    mutation.mutate(form);
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
        .auth-fade-in-up { opacity:0; animation: authFadeInUp 0.75s cubic-bezier(0.16,1,0.3,1) forwards; }
        .auth-float      { animation: authFloat 6s ease-in-out infinite; }
        .auth-pulse      { animation: authPulse 2s ease-in-out infinite; }
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
        .reg-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 16px; }
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
          maxWidth: "80rem",
          background: "#ffffff",
          borderRadius: "2.5rem",
          boxShadow: "0 25px 60px -12px rgba(0,0,0,0.15)",
          border: "1px solid rgba(255,255,255,0.8)",
          minHeight: "600px",
        }}
      >
        {/* ── LEFT PANEL ── */}
        <div
          className="hidden md:flex md:w-[38%] relative flex-col items-center justify-center text-center p-12 overflow-hidden"
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
                  id="islamic-rp"
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
              <rect width="100%" height="100%" fill="url(#islamic-rp)" />
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
                family_restroom
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
              Daftar <br />
              <span style={{ color: GREEN }}>Orang Tua</span>
            </h1>
            <div
              className="w-12 h-1 rounded-full mb-6"
              style={{ backgroundColor: GREEN }}
            />
            <p
              className="text-base leading-relaxed max-w-xs"
              style={{ color: "rgba(255,255,255,0.78)" }}
            >
              Daftarkan akun Anda untuk memantau perkembangan akademik
              putra-putri Anda secara real-time.
            </p>

            {/* Info box */}
            <div
              className="mt-8 w-full rounded-2xl p-4 text-left space-y-3"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {[
                { icon: "school", text: "Kode sekolah dari admin" },
                { icon: "badge", text: "NISN 10 digit anak Anda" },
                { icon: "email", text: "Email aktif yang bisa diakses" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(0,200,83,0.2)" }}
                  >
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{ color: GREEN, fontSize: "14px" }}
                    >
                      {item.icon}
                    </span>
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: "rgba(255,255,255,0.75)" }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-full md:w-[62%] p-10 lg:p-14 flex flex-col justify-center bg-white">
          <div
            className="max-w-2xl w-full mx-auto auth-fade-in-up"
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

            {/* Header */}
            <div className="mb-8">
              <h2
                className="font-extrabold tracking-tight mb-2"
                style={{
                  color: DARK_GREEN,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "2.25rem",
                  lineHeight: "1.15",
                  letterSpacing: "-0.02em",
                }}
              >
                Pendaftaran Orang Tua
              </h2>
              <p style={{ color: TEXT_SEC, fontSize: "0.9375rem" }}>
                Lengkapi data berikut untuk membuat akun portal orang tua.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* KOLOM KIRI */}
                <div className="space-y-4">
                  <div
                    className="flex items-center gap-2 pb-2"
                    style={{ borderBottom: `1px solid #e1e3e4` }}
                  >
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ color: GREEN }}
                    >
                      manage_accounts
                    </span>
                    <h3
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: TEXT_SEC }}
                    >
                      Informasi Akun
                    </h3>
                  </div>

                  {/* Nama Lengkap */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: TEXT_SEC }}
                    >
                      Nama Lengkap
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
                          person
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        value={form.nama_lengkap}
                        onChange={(e) => set("nama_lengkap", e.target.value)}
                        placeholder="Nama lengkap Anda"
                        disabled={loading}
                        className="block w-full pl-3 pr-4 py-3 border-none focus:ring-0 bg-transparent outline-none text-sm"
                        style={{ color: "#111827" }}
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: TEXT_SEC }}
                    >
                      Username
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
                          alternate_email
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        value={form.username}
                        onChange={(e) => set("username", e.target.value)}
                        placeholder="Username untuk login"
                        disabled={loading}
                        className="block w-full pl-3 pr-4 py-3 border-none focus:ring-0 bg-transparent outline-none text-sm"
                        style={{ color: "#111827" }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: TEXT_SEC }}
                    >
                      Email
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
                        required
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="Email aktif Anda"
                        disabled={loading}
                        className="block w-full pl-3 pr-4 py-3 border-none focus:ring-0 bg-transparent outline-none text-sm"
                        style={{ color: "#111827" }}
                      />
                    </div>
                  </div>

                  {/* No HP */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: TEXT_SEC }}
                    >
                      No. HP / WhatsApp
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
                          phone
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        value={form.no_hp}
                        onChange={(e) => set("no_hp", e.target.value)}
                        placeholder="Nomor telepon/WA"
                        disabled={loading}
                        className="block w-full pl-3 pr-4 py-3 border-none focus:ring-0 bg-transparent outline-none text-sm"
                        style={{ color: "#111827" }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: TEXT_SEC }}
                    >
                      Password
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
                        required
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        placeholder="Min. 8 karakter"
                        disabled={loading}
                        className="block w-full pl-3 pr-12 py-3 border-none focus:ring-0 bg-transparent outline-none text-sm"
                        style={{ color: "#111827" }}
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
                  </div>

                  {/* Konfirmasi Password */}
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
                        required
                        value={form.password_confirmation}
                        onChange={(e) =>
                          set("password_confirmation", e.target.value)
                        }
                        placeholder="Ulangi password"
                        disabled={loading}
                        className="block w-full pl-3 pr-12 py-3 border-none focus:ring-0 bg-transparent outline-none text-sm"
                        style={{ color: "#111827" }}
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
                          className="text-xs mt-1"
                          style={{ color: "#DC2626" }}
                        >
                          Password tidak cocok.
                        </p>
                      )}
                  </div>
                </div>

                {/* KOLOM KANAN */}
                <div className="space-y-4">
                  <div
                    className="flex items-center gap-2 pb-2"
                    style={{ borderBottom: `1px solid #e1e3e4` }}
                  >
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ color: GREEN }}
                    >
                      school
                    </span>
                    <h3
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: TEXT_SEC }}
                    >
                      Informasi Sekolah
                    </h3>
                  </div>

                  {/* Kode Sekolah */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: TEXT_SEC }}
                    >
                      Kode Registrasi Sekolah
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
                          key
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        value={form.kode_sekolah}
                        onChange={(e) => set("kode_sekolah", e.target.value)}
                        placeholder="Dapatkan dari admin sekolah"
                        disabled={loading}
                        className="block w-full pl-3 pr-4 py-3 border-none focus:ring-0 bg-transparent outline-none text-sm"
                        style={{ color: "#111827" }}
                      />
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                      Kode unik khusus orang tua MI Nurul Huda 3
                    </p>
                  </div>

                  {/* NISN */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: TEXT_SEC }}
                    >
                      NISN Anak
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
                          badge
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        value={form.nisn}
                        onChange={(e) => set("nisn", e.target.value)}
                        placeholder="NISN Nasional (10 digit)"
                        disabled={loading}
                        className="block w-full pl-3 pr-4 py-3 border-none focus:ring-0 bg-transparent outline-none text-sm"
                        style={{ color: "#111827" }}
                      />
                    </div>
                  </div>

                  {/* Hubungan */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: TEXT_SEC }}
                    >
                      Status Hubungan
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
                          family_restroom
                        </span>
                      </div>
                      <select
                        value={form.hubungan}
                        onChange={(e) => set("hubungan", e.target.value)}
                        disabled={loading}
                        className="reg-select block w-full pl-3 pr-10 py-3 border-none focus:ring-0 bg-transparent outline-none text-sm"
                        style={{ color: "#111827" }}
                      >
                        <option value="Ayah">Ayah</option>
                        <option value="Ibu">Ibu</option>
                        <option value="Wali">Wali</option>
                      </select>
                    </div>
                  </div>

                  {/* Info card */}
                  <div
                    className="rounded-2xl p-4 mt-4"
                    style={{
                      background: "rgba(0,200,83,0.06)",
                      border: "1px solid rgba(0,200,83,0.18)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="material-symbols-outlined shrink-0 mt-0.5"
                        style={{ color: GREEN, fontSize: "18px" }}
                      >
                        info
                      </span>
                      <div>
                        <p
                          className="text-sm font-semibold mb-1"
                          style={{ color: DARK_GREEN }}
                        >
                          Persetujuan Operator
                        </p>
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: TEXT_SEC }}
                        >
                          Akun Anda akan diverifikasi oleh operator sekolah
                          sebelum dapat digunakan. Proses verifikasi biasanya
                          membutuhkan 1×24 jam.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div
                className="mt-8 pt-6"
                style={{ borderTop: "1px solid #e1e3e4" }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="auth-btn w-full flex items-center justify-center gap-3 font-bold rounded-full"
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
                      Memproses...
                    </span>
                  ) : (
                    <>
                      <span>Daftar Sekarang</span>
                      <span className="material-symbols-outlined auth-btn-icon text-xl">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>

                <p
                  className="text-center text-sm mt-6"
                  style={{ color: TEXT_SEC }}
                >
                  Sudah punya akun?{" "}
                  <Link
                    to="/login"
                    className="font-bold transition-colors"
                    style={{ color: DARK_GREEN }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = GREEN)}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = DARK_GREEN)
                    }
                  >
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
