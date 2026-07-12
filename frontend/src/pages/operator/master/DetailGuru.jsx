import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  KeyRound,
  UserX,
  UserCheck,
  Trash2,
  Camera,
} from "lucide-react";

export default function DetailGuru() {
  const { nuptk } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef();

  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const { data: guru, isLoading } = useQuery({
    queryKey: ["guru-detail", nuptk],
    queryFn: () =>
      api.get(`/operator/master-data/guru/${nuptk}`).then((r) => r.data.data),
  });

  const { data: akunGuru, refetch: refetchAkun } = useQuery({
    queryKey: ["guru-akun", nuptk],
    queryFn: () =>
      api.get(`/operator/master-data/guru/${nuptk}/akun`).then((r) => r.data.data),
  });

  const uploadFoto = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append("foto", file);
      return api.post(`/operator/master-data/guru/${nuptk}/foto`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (res) => {
      toast.success("Foto berhasil diupload.");
      queryClient.invalidateQueries(["guru-detail", nuptk]);
    },
    onError: () => toast.error("Gagal upload foto."),
  });

  const toggleActive = useMutation({
    mutationFn: (id) => api.patch(`/operator/users/${id}/toggle-active`),
    onSuccess: () => {
      toast.success("Status akun diperbarui.");
      queryClient.invalidateQueries(["guru-akun", nuptk]);
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  const resetPassword = useMutation({
    mutationFn: ({ id, password }) =>
      api.patch(`/operator/users/${id}/reset-password`, {
        password,
        password_confirmation: password,
      }),
    onSuccess: () => {
      toast.success("Password berhasil direset.");
      setShowResetModal(false);
      setNewPassword("");
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  const hapusAkun = useMutation({
    mutationFn: (id) => api.delete(`/operator/users/${id}`),
    onSuccess: () => {
      toast.success("Akun login dihapus.");
      queryClient.invalidateQueries(["guru-akun", nuptk]);
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );

  if (!guru)
    return (
      <div className="text-center py-20 text-gray-400">
        Data guru tidak ditemukan.
      </div>
    );

  const fotoUrl = guru.foto
    ? `http://127.0.0.1:8001/storage/${guru.foto}`
    : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/operator/master/guru")}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detail Guru</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Informasi lengkap data guru
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Kolom Kiri */}
        <div className="col-span-2 space-y-6">
          {/* Card Profil */}
          <div className="card">
            <div className="flex items-start gap-5 mb-6">
              {/* Foto */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-blue-100 overflow-hidden">
                  {fotoUrl ? (
                    <img
                      src={fotoUrl}
                      alt={guru.nama_lengkap}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-blue-700 font-bold text-3xl">
                        {guru.nama_lengkap?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors"
                  title="Ganti foto"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFoto.mutate(file);
                  }}
                />
              </div>

              {/* Info Utama */}
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {guru.nama_lengkap}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                    {guru.jenis_ptk}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                    {guru.status_kepegawaian}
                  </span>
                  {guru.golongan && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
                      Gol. {guru.golongan}
                    </span>
                  )}
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${guru.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                  >
                    {guru.is_active ? "Aktif" : "Non-aktif"}
                  </span>
                </div>
              </div>
            </div>

            {/* Data Pribadi */}
            <Section title="Data Pribadi">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="NUPTK" value={guru.nuptk} mono />
                <InfoItem label="NIP" value={guru.nip ?? "-"} mono />
                <InfoItem label="NIK" value={guru.nik ?? "-"} mono />
                <InfoItem
                  label="Jenis Kelamin"
                  value={guru.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                />
                <InfoItem label="Tempat Lahir" value={guru.tempat_lahir} />
                <InfoItem label="Tanggal Lahir" value={guru.tanggal_lahir} />
                <InfoItem label="Agama" value={guru.agama ?? "-"} />
                <InfoItem
                  label="Status Perkawinan"
                  value={guru.status_perkawinan ?? "-"}
                />
                {guru.no_hp && (
                  <InfoItem label="No. HP" value={guru.no_hp} icon={Phone} />
                )}
                {guru.email && (
                  <InfoItem label="Email" value={guru.email} icon={Mail} />
                )}
              </div>
            </Section>

            {/* Kepegawaian */}
            <Section title="Kepegawaian">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Golongan" value={guru.golongan ?? "-"} />
                <InfoItem
                  label="TMT Golongan"
                  value={guru.tmt_golongan ?? "-"}
                />
              </div>
            </Section>

            {/* Alamat */}
            <Section title="Alamat">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <InfoItem label="Jalan" value={guru.alamat_jalan ?? "-"} />
                </div>
                <InfoItem
                  label="RT / RW"
                  value={`${guru.rt ?? "-"} / ${guru.rw ?? "-"}`}
                />
                <InfoItem label="Desa/Kelurahan" value={guru.desa ?? "-"} />
                <InfoItem label="Kecamatan" value={guru.kecamatan ?? "-"} />
                <InfoItem
                  label="Kabupaten/Kota"
                  value={guru.kabupaten ?? "-"}
                />
                <InfoItem label="Provinsi" value={guru.provinsi ?? "-"} />
                <InfoItem label="Kode Pos" value={guru.kode_pos ?? "-"} />
              </div>
            </Section>
          </div>
        </div>

        {/* Kolom Kanan — Akun Login */}
        <div>
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" /> Akun Login
            </h3>

            {akunGuru ? (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <div>
                    <p className="text-xs text-gray-400">Username</p>
                    <p className="text-sm font-medium text-gray-700">
                      {akunGuru.username}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-700">
                      {akunGuru.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${akunGuru.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                    >
                      {akunGuru.is_active ? "Aktif" : "Non-aktif"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowResetModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm text-gray-600 transition-colors"
                >
                  <KeyRound className="w-4 h-4" /> Reset Password
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `${akunGuru.is_active ? "Nonaktifkan" : "Aktifkan"} akun ini?`,
                      )
                    )
                      toggleActive.mutate(akunGuru.id);
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${akunGuru.is_active ? "border-orange-200 hover:bg-orange-50 text-orange-600" : "border-green-200 hover:bg-green-50 text-green-600"}`}
                >
                  {akunGuru.is_active ? (
                    <>
                      <UserX className="w-4 h-4" /> Nonaktifkan
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" /> Aktifkan
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Hapus akun login guru ini?"))
                      hapusAkun.mutate(akunGuru.id);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 text-sm text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Hapus Akun Login
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Guru ini belum memiliki akun login.
                </p>
                <button
                  onClick={() =>
                    navigate("/operator", { state: { openModal: true, nuptk } })
                  }
                  className="btn-primary text-sm w-full"
                >
                  Buat Akun Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Reset Password */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">Reset Password</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Akun: {akunGuru?.username}
              </p>
            </div>
            <div className="px-6 py-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Baru <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="Minimal 8 karakter"
              />
            </div>
            <div className="flex gap-2 px-6 py-4 border-t">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setNewPassword("");
                }}
                className="btn-secondary flex-1"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (newPassword.length < 8) {
                    toast.error("Password minimal 8 karakter.");
                    return;
                  }
                  resetPassword.mutate({
                    id: akunGuru.id,
                    password: newPassword,
                  });
                }}
                disabled={resetPassword.isPending}
                className="btn-primary flex-1"
              >
                {resetPassword.isPending ? "Mereset..." : "Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper Components ──────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="mt-6">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function InfoItem({ label, value, mono = false, icon: Icon }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p
        className={`text-sm text-gray-700 ${mono ? "font-mono" : "font-medium"}`}
      >
        {value}
      </p>
    </div>
  );
}
