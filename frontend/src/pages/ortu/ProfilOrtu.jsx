import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Save, 
  Upload, 
  Camera,
  UserCircle,
  Briefcase,
  Users,
  GraduationCap,
  MapPin,
  Calendar,
  School,
  AlertCircle
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

export default function ProfilOrtu() {
  const queryClient = useQueryClient();
  const [isEditPassword, setIsEditPassword] = useState(false);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    no_hp: "",
    foto: null,
    password_lama: "",
    password_baru: "",
    password_baru_confirmation: "",
  });

  const { data: profil, isLoading, isError } = useQuery({
    queryKey: ["ortu-profil"],
    queryFn: () => api.get("/ortu/profil").then((res) => res.data.data),
    onSuccess: (data) => {
      setFormData((prev) => ({
        ...prev,
        email: data.user.email || "",
        no_hp: data.user.no_hp || "",
      }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => {
      const formDataToSend = new FormData();
      if (data.email) formDataToSend.append("email", data.email);
      if (data.no_hp) formDataToSend.append("no_hp", data.no_hp);
      if (data.foto) formDataToSend.append("foto", data.foto);
      if (data.password_lama) formDataToSend.append("password_lama", data.password_lama);
      if (data.password_baru) formDataToSend.append("password_baru", data.password_baru);
      if (data.password_baru_confirmation) formDataToSend.append("password_baru_confirmation", data.password_baru_confirmation);

      return api.post("/ortu/profil", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Profil berhasil diperbarui!");
      queryClient.invalidateQueries(["ortu-profil"]);
      setIsEditPassword(false);
      setFormData((prev) => ({
        ...prev,
        foto: null,
        password_lama: "",
        password_baru: "",
        password_baru_confirmation: "",
      }));
      setPreview(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui profil");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, foto: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (isError || !profil) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Gagal Memuat Profil</h2>
        <p className="text-gray-500">Silakan refresh halaman atau hubungi admin.</p>
      </div>
    );
  }

  const { user, ortu, siswa } = profil;
  const fotoUrl = user.foto ? `http://127.0.0.1:8001/storage/${user.foto}` : null;
  const fotoSiswaUrl = siswa.foto ? `http://127.0.0.1:8001/storage/${siswa.foto}` : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <UserCircle className="w-7 h-7 text-indigo-600" />
          Profil Orang Tua
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola informasi akun dan data anak Anda
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri - Data Anak */}
        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Data Anak
            </h2>
            
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-24 h-24 bg-indigo-100 rounded-full overflow-hidden mb-3 border-4 border-white shadow-lg">
                {fotoSiswaUrl ? (
                  <img src={fotoSiswaUrl} alt={siswa.nama_lengkap} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-indigo-400 mt-5 mx-auto" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{siswa.nama_lengkap}</h3>
              <p className="text-sm text-indigo-600 font-medium">NISN: {siswa.nisn}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-white rounded-lg p-3">
                <School className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Kelas</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {siswa.kelas ? `${siswa.kelas.nama_kelas} (${siswa.kelas.tingkat})` : "Belum ada kelas"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white rounded-lg p-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Jenis Kelamin</p>
                  <p className="text-sm font-semibold text-gray-800">{siswa.jenis_kelamin}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white rounded-lg p-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Tempat, Tanggal Lahir</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {siswa.tempat_lahir}, {dayjs(siswa.tanggal_lahir).format("DD MMMM YYYY")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white rounded-lg p-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Alamat</p>
                  <p className="text-sm font-semibold text-gray-800">{siswa.alamat}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan - Form Edit Profil */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Foto & Data Orang Tua */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Informasi Akun
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Foto Profil */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-gray-100 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {preview || fotoUrl ? (
                      <img
                        src={preview || fotoUrl}
                        alt={user.nama_lengkap}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400 mt-7 mx-auto" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg">
                    <Camera className="w-5 h-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Format: JPG, PNG (Maks. 2MB)</p>
              </div>

              {/* Data User */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={user.nama_lengkap}
                      disabled
                      className="input pl-10 bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={user.username}
                      disabled
                      className="input pl-10 bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input pl-10"
                      placeholder="email@contoh.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    No. HP
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.no_hp}
                      onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                      className="input pl-10"
                      placeholder="08123456789"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hubungan dengan Siswa
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={ortu.hubungan || "-"}
                      disabled
                      className="input pl-10 bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pekerjaan
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={ortu.pekerjaan || "-"}
                      disabled
                      className="input pl-10 bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Tombol Ganti Password */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditPassword(!isEditPassword)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {isEditPassword ? "Batalkan Ganti Password" : "Ganti Password"}
                </button>
              </div>

              {/* Form Ganti Password */}
              {isEditPassword && (
                <div className="space-y-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password Lama
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={formData.password_lama}
                        onChange={(e) => setFormData({ ...formData, password_lama: e.target.value })}
                        className="input pl-10"
                        placeholder="Masukkan password lama"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password Baru
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={formData.password_baru}
                        onChange={(e) => setFormData({ ...formData, password_baru: e.target.value })}
                        className="input pl-10"
                        placeholder="Minimal 6 karakter"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={formData.password_baru_confirmation}
                        onChange={(e) => setFormData({ ...formData, password_baru_confirmation: e.target.value })}
                        className="input pl-10"
                        placeholder="Ulangi password baru"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tombol Simpan */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={updateMutation.isLoading}
                  className="btn-primary flex items-center gap-2"
                >
                  {updateMutation.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
