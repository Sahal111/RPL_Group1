import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Users,
  Briefcase,
  GraduationCap,
  Calendar,
  MapPin,
  Save,
  Shield,
  ShieldOff,
  Trash2,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

export default function DetailOrtu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEdit, setIsEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    no_hp: "",
    hubungan: "",
    pekerjaan: "",
  });

  const [passwordData, setPasswordData] = useState({
    password: "",
    password_confirmation: "",
  });

  const { data: ortu, isLoading } = useQuery({
    queryKey: ["detail-ortu", id],
    queryFn: () => api.get(`/operator/ortu/${id}`).then((res) => res.data.data),
    onSuccess: (data) => {
      setFormData({
        email: data.email || "",
        no_hp: data.no_hp || "",
        hubungan: data.ortu_profile?.hubungan || "",
        pekerjaan: data.ortu_profile?.pekerjaan || "",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/operator/ortu/${id}`, data),
    onSuccess: () => {
      toast.success("Data orang tua berhasil diperbarui!");
      queryClient.invalidateQueries(["detail-ortu", id]);
      setIsEdit(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui data");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: () => api.patch(`/operator/users/${id}/toggle-active`),
    onSuccess: () => {
      toast.success("Status akun berhasil diubah!");
      queryClient.invalidateQueries(["detail-ortu", id]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal mengubah status");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data) => api.patch(`/operator/users/${id}/reset-password`, data),
    onSuccess: () => {
      toast.success("Password berhasil direset!");
      setShowResetPasswordModal(false);
      setPasswordData({ password: "", password_confirmation: "" });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal reset password");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/operator/users/${id}`),
    onSuccess: () => {
      toast.success("Akun berhasil dihapus!");
      navigate("/operator/master/ortu");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menghapus akun");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    resetPasswordMutation.mutate(passwordData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!ortu) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <p className="text-gray-500">Data orang tua tidak ditemukan</p>
      </div>
    );
  }

  const siswa = ortu.ortu_profile?.siswa;
  const fotoUrl = ortu.foto ? `http://127.0.0.1:8001/storage/${ortu.foto}` : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/operator/master/ortu"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Detail Orang Tua</h1>
            <p className="text-sm text-gray-500 mt-0.5">ID: {ortu.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEdit && (
            <>
              <button
                onClick={() => toggleActiveMutation.mutate()}
                className={`btn-secondary flex items-center gap-2 ${
                  ortu.is_active ? "text-red-600" : "text-green-600"
                }`}
              >
                {ortu.is_active ? (
                  <>
                    <ShieldOff className="w-4 h-4" />
                    Non-Aktifkan
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Aktifkan
                  </>
                )}
              </button>
              <button
                onClick={() => setShowResetPasswordModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                Reset Password
              </button>
              <button
                onClick={() => setIsEdit(true)}
                className="btn-primary"
              >
                Edit Data
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri - Info Anak */}
        <div className="card bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            Data Anak
          </h2>

          {siswa ? (
            <div className="space-y-3">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                  <User className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="font-bold text-gray-800">{siswa.nama_lengkap}</h3>
                <p className="text-sm text-indigo-600">NISN: {siswa.nisn}</p>
              </div>

              <div className="bg-white rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Jenis Kelamin:</span>
                  <span className="font-medium">{siswa.jenis_kelamin}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Lahir:</span>
                  <span className="font-medium text-xs">
                    {siswa.tempat_lahir}, {dayjs(siswa.tanggal_lahir).format("DD/MM/YYYY")}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-gray-600">Alamat:</span>
                    <p className="font-medium text-xs">{siswa.alamat}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Data anak tidak tersedia
            </p>
          )}
        </div>

        {/* Kolom Kanan - Form */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Informasi Orang Tua
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto & Status */}
            <div className="flex items-start gap-6 pb-6 border-b border-gray-100">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                {fotoUrl ? (
                  <img src={fotoUrl} alt={ortu.nama_lengkap} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">{ortu.nama_lengkap}</h3>
                <p className="text-sm text-gray-500">@{ortu.username}</p>
                <div className="mt-2">
                  {ortu.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Shield className="w-3 h-3" />
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <ShieldOff className="w-3 h-3" />
                      Non-Aktif
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    disabled={!isEdit}
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
                    disabled={!isEdit}
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
                  <select
                    value={formData.hubungan}
                    onChange={(e) => setFormData({ ...formData, hubungan: e.target.value })}
                    disabled={!isEdit}
                    className="input pl-10"
                  >
                    <option value="">Pilih Hubungan</option>
                    <option value="Ayah">Ayah</option>
                    <option value="Ibu">Ibu</option>
                    <option value="Wali">Wali</option>
                  </select>
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
                    value={formData.pekerjaan}
                    onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                    disabled={!isEdit}
                    className="input pl-10"
                    placeholder="Pekerjaan"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEdit && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(true);
                  }}
                  className="btn-secondary text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus Akun
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEdit(false)}
                    className="btn-secondary"
                  >
                    Batal
                  </button>
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
                        <Save className="w-4 h-4" />
                        Simpan
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Modal Reset Password */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Reset Password</h3>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, password: e.target.value })
                  }
                  className="input"
                  placeholder="Minimal 8 karakter"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  value={passwordData.password_confirmation}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, password_confirmation: e.target.value })
                  }
                  className="input"
                  placeholder="Ulangi password"
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isLoading}
                  className="btn-primary flex-1"
                >
                  {resetPasswordMutation.isLoading ? "Mereset..." : "Reset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus Akun?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Tindakan ini tidak dapat dibatalkan. Akun <b>{ortu.nama_lengkap}</b> akan
                dihapus secara permanen.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isLoading}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex-1"
                >
                  {deleteMutation.isLoading ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
