import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { BookOpen } from "lucide-react";

export default function RegisterOrtuPage() {
  const navigate = useNavigate();
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

  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data) => api.post("/auth/register-ortu", data),
    onSuccess: (res) => {
      toast.success(res.data.message || "Registrasi berhasil, menunggu persetujuan operator.", { duration: 5000 });
      navigate("/login");
    },
    onError: (err) => {
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(err.response?.data?.message || "Registrasi gagal.");
      }
    },
    onSettled: () => {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Pendaftaran Orang Tua
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kolom Kiri: Informasi Pribadi */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">
                  Informasi Akun
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nama_lengkap}
                    onChange={(e) => set("nama_lengkap", e.target.value)}
                    className="input-field"
                    placeholder="Masukkan nama lengkap"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => set("username", e.target.value)}
                    className="input-field"
                    placeholder="Masukkan username untuk login"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className="input-field"
                    placeholder="Masukkan email aktif"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. HP
                  </label>
                  <input
                    type="text"
                    required
                    value={form.no_hp}
                    onChange={(e) => set("no_hp", e.target.value)}
                    className="input-field"
                    placeholder="Masukkan nomor telepon/WA"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    className="input-field"
                    placeholder="Minimal 8 karakter"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    required
                    value={form.password_confirmation}
                    onChange={(e) => set("password_confirmation", e.target.value)}
                    className="input-field"
                    placeholder="Ketik ulang password"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Kolom Kanan: Informasi Anak & Sekolah */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2 mt-6 md:mt-0">
                  Informasi Sekolah
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Registrasi Sekolah
                  </label>
                  <input
                    type="text"
                    required
                    value={form.kode_sekolah}
                    onChange={(e) => set("kode_sekolah", e.target.value)}
                    className="input-field"
                    placeholder="Dapatkan dari admin sekolah"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-400 mt-1">Kode unik khusus orang tua</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NISN Anak
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nisn}
                    onChange={(e) => set("nisn", e.target.value)}
                    className="input-field"
                    placeholder="NISN Nasional (10 digit)"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Hubungan
                  </label>
                  <select
                    value={form.hubungan}
                    onChange={(e) => set("hubungan", e.target.value)}
                    className="input-field bg-white"
                    disabled={loading}
                  >
                    <option value="Ayah">Ayah</option>
                    <option value="Ibu">Ibu</option>
                    <option value="Wali">Wali</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-gray-100 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
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
                  "Daftar Sekarang"
                )}
              </button>
            </div>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="text-primary-600 hover:underline font-medium"
            >
              Masuk di sini
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
