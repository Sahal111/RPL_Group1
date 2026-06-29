import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import { User, Mail, Phone, Lock, Upload, Save, Shield, CheckCircle2, UserCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilGuru() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    no_hp: "",
    password_lama: "",
    password_baru: "",
    password_baru_confirmation: "",
    foto: null,
  });
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch Profil Data
  const { data, isLoading } = useQuery({
    queryKey: ["guru-profil"],
    queryFn: () => api.get("/guru/profil").then((r) => r.data.data),
    onSuccess: (data) => {
      setFormData((prev) => ({
        ...prev,
        email: data.user.email || "",
        no_hp: data.user.no_hp || data.master?.no_hp || "",
      }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const form = new FormData();
      if (data.email) form.append("email", data.email);
      if (data.no_hp) form.append("no_hp", data.no_hp);
      
      if (data.password_lama && data.password_baru) {
        form.append("password_lama", data.password_lama);
        form.append("password_baru", data.password_baru);
        form.append("password_baru_confirmation", data.password_baru_confirmation);
      }
      
      if (data.foto) {
        form.append("foto", data.foto);
      }

      return api.post("/guru/profil/update", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Profil berhasil diperbarui");
      queryClient.invalidateQueries(["guru-profil"]);
      queryClient.invalidateQueries(["auth-user"]); // Refresh auth user data globally
      setIsEditing(false);
      setFormData((prev) => ({
        ...prev,
        password_lama: "",
        password_baru: "",
        password_baru_confirmation: "",
        foto: null,
      }));
      setPreviewImage(null);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Gagal memperbarui profil";
      toast.error(msg);
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, foto: file });
      setPreviewImage(URL.createObjectURL(file));
      setIsEditing(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password_baru && formData.password_baru !== formData.password_baru_confirmation) {
      toast.error("Konfirmasi password baru tidak cocok.");
      return;
    }
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="card p-12 text-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full mx-auto mb-3" />
        Memuat data profil...
      </div>
    );
  }

  const { user, master } = data || {};
  const fotoUrl = previewImage 
    ? previewImage 
    : (user?.foto ? `http://127.0.0.1:8001/storage/${user.foto}` : null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Info Singkat */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-10">
          <Shield className="w-64 h-64" />
        </div>
        
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white/20 border-4 border-white/30 overflow-hidden backdrop-blur-sm flex-shrink-0 flex items-center justify-center shadow-inner">
              {fotoUrl ? (
                <img src={fotoUrl} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-16 h-16 sm:w-20 sm:h-20 text-white/70" />
              )}
            </div>
            {isEditing && (
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                <Upload className="w-6 h-6 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
          </div>
          
          <div className="text-center sm:text-left mt-2 sm:mt-4">
            <h1 className="text-3xl font-bold">{user?.nama_lengkap}</h1>
            <p className="text-indigo-100 text-lg mt-1 font-medium">{master?.nip || "NIP Belum Tersedia"}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-green-300" />
                {master?.status_kepegawaian || "Status Pegawai"}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                <User className="w-4 h-4 text-blue-200" />
                {master?.jenis_ptk || "Jenis PTK"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom Kiri: Detail Akun (Bisa di-edit) */}
        <div className="md:col-span-2 space-y-6">
          <div className="card p-0 overflow-hidden shadow-sm border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                Pengaturan Akun & Keamanan
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setFormData({
                      ...formData,
                      email: user?.email || "",
                      no_hp: user?.no_hp || master?.no_hp || "",
                    });
                  }}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Edit Profil
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-sm font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Batal
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      disabled={!isEditing}
                      value={isEditing ? formData.email : (user?.email || "-")}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field pl-10 disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Nomor HP
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={isEditing ? formData.no_hp : (user?.no_hp || master?.no_hp || "-")}
                      onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                      className="input-field pl-10 disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="pt-5 mt-5 border-t border-gray-100 space-y-5">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Ganti Password (Opsional)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Lama</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          value={formData.password_lama}
                          onChange={(e) => setFormData({ ...formData, password_lama: e.target.value })}
                          className="input-field pl-10"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Baru</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                          <input
                            type="password"
                            value={formData.password_baru}
                            onChange={(e) => setFormData({ ...formData, password_baru: e.target.value })}
                            className="input-field pl-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password Baru</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                          <input
                            type="password"
                            value={formData.password_baru_confirmation}
                            onChange={(e) => setFormData({ ...formData, password_baru_confirmation: e.target.value })}
                            className="input-field pl-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="flex justify-end pt-5">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Data Master dari Operator (Read-only) */}
        <div className="space-y-6">
          <div className="card shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-4 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Informasi Kepegawaian
            </h2>
            
            {master ? (
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">NUPTK</span>
                  <span className="text-sm font-semibold text-gray-800">{master.nuptk || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">NIK</span>
                  <span className="text-sm font-semibold text-gray-800">{master.nik || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">Jenis Kelamin</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {master.jenis_kelamin === 'L' ? 'Laki-Laki' : (master.jenis_kelamin === 'P' ? 'Perempuan' : '-')}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">Tempat, Tanggal Lahir</span>
                  <span className="text-sm font-semibold text-gray-800 capitalize">
                    {master.tempat_lahir || "-"}, {master.tanggal_lahir ? new Date(master.tanggal_lahir).toLocaleDateString('id-ID') : "-"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">Golongan</span>
                  <span className="text-sm font-semibold text-gray-800 uppercase">{master.golongan || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">Agama</span>
                  <span className="text-sm font-semibold text-gray-800 capitalize">{master.agama || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">Alamat</span>
                  <span className="text-sm font-semibold text-gray-800 leading-snug">
                    {master.alamat_jalan ? `${master.alamat_jalan} RT ${master.rt || '-'} / RW ${master.rw || '-'}\n${master.desa || '-'}, ${master.kecamatan || '-'}\n${master.kabupaten || '-'} - ${master.provinsi || '-'}` : "-"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">
                  Data master kepegawaian belum tersedia atau belum ditautkan oleh operator.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
