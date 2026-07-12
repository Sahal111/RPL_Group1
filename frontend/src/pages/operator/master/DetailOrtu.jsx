import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  AlertCircle,
  Briefcase,
  GraduationCap,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Shield,
  ShieldOff,
  Trash2,
  User,
  Users,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const yearOnly = (date) => (date ? String(date).slice(0, 4) : "-");
const formatDate = (date) => date ? dayjs(date).format("DD MMMM YYYY") : "-";
const getOrtuProfiles = (ortu) => {
  if (Array.isArray(ortu?.ortu_profiles) && ortu.ortu_profiles.length > 0) {
    return ortu.ortu_profiles;
  }

  return ortu?.ortu_profile ? [ortu.ortu_profile] : [];
};
const profileNisn = (profile) => profile?.nisn ?? profile?.siswa?.nisn ?? "";
const getPrimaryOrangTua = (siswa) => {
  if (Array.isArray(siswa?.orang_tua)) {
    return siswa.orang_tua[0] ?? null;
  }

  return siswa?.orang_tua ?? null;
};

export default function DetailOrtu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEdit, setIsEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedNisn, setSelectedNisn] = useState("");
  const [linkData, setLinkData] = useState({
    nisn: "",
    hubungan: "Ayah",
  });

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
  });

  useEffect(() => {
    if (!ortu) return;
    const profiles = getOrtuProfiles(ortu);
    const firstProfile = profiles[0] ?? {};
    const nextSelected = profileNisn(firstProfile);

    setFormData({
      email: ortu.email || "",
      no_hp: ortu.no_hp || "",
      hubungan: firstProfile.hubungan || "",
      pekerjaan: firstProfile.pekerjaan || "",
    });
    setSelectedNisn((current) =>
      profiles.some((profile) => profileNisn(profile) === current) ? current : nextSelected,
    );
  }, [ortu]);

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/operator/ortu/${id}`, data),
    onSuccess: () => {
      toast.success("Data orang tua berhasil diperbarui.");
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
      toast.success("Status akun berhasil diubah.");
      queryClient.invalidateQueries(["detail-ortu", id]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal mengubah status");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data) => api.patch(`/operator/users/${id}/reset-password`, data),
    onSuccess: () => {
      toast.success("Password berhasil direset.");
      setShowResetPasswordModal(false);
      setPasswordData({ password: "", password_confirmation: "" });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal reset password");
    },
  });

  const linkAnakMutation = useMutation({
    mutationFn: (data) => api.post(`/operator/ortu/${id}/anak`, data),
    onSuccess: () => {
      toast.success("Anak berhasil ditautkan.");
      queryClient.invalidateQueries(["detail-ortu", id]);
      queryClient.invalidateQueries(["master-ortu"]);
      setLinkData({ nisn: "", hubungan: "Ayah" });
    },
    onError: (error) => {
      const errors = error.response?.data?.errors;
      if (errors) Object.values(errors).forEach((item) => toast.error(item[0]));
      else toast.error(error.response?.data?.message || "Gagal menautkan anak");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/operator/users/${id}`),
    onSuccess: () => {
      toast.success("Akun berhasil dihapus.");
      navigate("/operator/master/ortu");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menghapus akun");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleResetPassword = (event) => {
    event.preventDefault();
    resetPasswordMutation.mutate(passwordData);
  };

  const handleLinkAnak = (event) => {
    event.preventDefault();
    linkAnakMutation.mutate(linkData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
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

  const profiles = getOrtuProfiles(ortu);
  const selectedProfile = profiles.find((profile) => profileNisn(profile) === selectedNisn) ?? profiles[0];
  const siswa = selectedProfile?.siswa;
  const dataKeluarga = getPrimaryOrangTua(siswa);
  const fotoUrl = ortu.foto ? `http://127.0.0.1:8001/storage/${ortu.foto}` : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/operator/master/ortu"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Detail Orang Tua</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Data akun dan profil keluarga siswa
            </p>
          </div>
        </div>

        {!isEdit && (
          <div className="flex items-center gap-2">
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
            <button onClick={() => setIsEdit(true)} className="btn-primary">
              Edit Akun
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-indigo-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                {fotoUrl ? (
                  <img src={fotoUrl} alt={ortu.nama_lengkap} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-indigo-500" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-800 truncate">{ortu.nama_lengkap}</h2>
                <p className="text-sm text-gray-500">@{ortu.username}</p>
                <div className="mt-2">
                  {ortu.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <Shield className="w-3 h-3" />
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      <ShieldOff className="w-3 h-3" />
                      Non-Aktif
                    </span>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Section title="Akun Orang Tua">
                <div className="space-y-4">
                  <EditField
                    icon={Mail}
                    label="Email"
                    type="email"
                    value={formData.email}
                    disabled={!isEdit}
                    onChange={(value) => setFormData((prev) => ({ ...prev, email: value }))}
                  />
                  <EditField
                    icon={Phone}
                    label="No. HP Akun"
                    value={formData.no_hp}
                    disabled={!isEdit}
                    onChange={(value) => setFormData((prev) => ({ ...prev, no_hp: value }))}
                  />
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Hubungan Akun</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={formData.hubungan}
                        onChange={(event) => setFormData((prev) => ({ ...prev, hubungan: event.target.value }))}
                        disabled={!isEdit}
                        className="input-field pl-9 bg-white disabled:bg-gray-50 disabled:text-gray-600"
                      >
                        <option value="">Pilih Hubungan</option>
                        <option value="Ayah">Ayah</option>
                        <option value="Ibu">Ibu</option>
                        <option value="Wali">Wali</option>
                      </select>
                    </div>
                  </div>
                  <EditField
                    icon={Briefcase}
                    label="Pekerjaan Akun"
                    value={formData.pekerjaan}
                    disabled={!isEdit}
                    onChange={(value) => setFormData((prev) => ({ ...prev, pekerjaan: value }))}
                  />
                </div>
              </Section>

              {isEdit && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
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
                      disabled={updateMutation.isPending}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="card">
            <Section title="Data Anak">
              {profiles.length > 0 ? (
                <div className="space-y-3">
                  {profiles.map((profile) => {
                    const child = profile.siswa;
                    const nisn = profileNisn(profile);

                    return (
                      <button
                        key={nisn}
                        type="button"
                        onClick={() => setSelectedNisn(nisn)}
                        className={`w-full text-left rounded-lg border p-3 transition-colors ${
                          nisn === selectedNisn
                            ? "border-indigo-300 bg-indigo-50"
                            : "border-gray-100 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {child?.nama_lengkap ?? "-"}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">NISN: {nisn || "-"}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                            {profile.hubungan ?? "-"}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {siswa && (
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                      <InfoItem label="Jenis Kelamin" value={siswa.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"} />
                      <InfoItem label="Tempat Lahir" value={siswa.tempat_lahir ?? "-"} />
                      <InfoItem label="Tanggal Lahir" value={formatDate(siswa.tanggal_lahir)} />
                      <div className="col-span-2">
                        <InfoItem label="Alamat Siswa" value={siswa.alamat_jalan ?? "-"} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Data anak tidak tersedia.</p>
              )}
            </Section>

            <form onSubmit={handleLinkAnak} className="mt-5 pt-5 border-t border-gray-100 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Tautkan Anak Lain
              </p>
              <input
                type="text"
                value={linkData.nisn}
                onChange={(event) => setLinkData((prev) => ({ ...prev, nisn: event.target.value }))}
                className="input-field"
                placeholder="Masukkan NISN anak"
                required
              />
              <select
                value={linkData.hubungan}
                onChange={(event) => setLinkData((prev) => ({ ...prev, hubungan: event.target.value }))}
                className="input-field bg-white"
              >
                <option value="Ayah">Ayah</option>
                <option value="Ibu">Ibu</option>
                <option value="Wali">Wali</option>
              </select>
              <button
                type="submit"
                disabled={linkAnakMutation.isPending}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {linkAnakMutation.isPending ? "Menautkan..." : "Tautkan Anak"}
              </button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2 card">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Data Keluarga</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Mengikuti isian Data Ayah, Ibu, Wali, Kontak, dan Domisili pada form data siswa.
              </p>
            </div>
            <GraduationCap className="w-5 h-5 text-indigo-500" />
          </div>

          {dataKeluarga ? (
            <div className="space-y-8">
              <Section title="Data Ayah Kandung">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <InfoItem label="Nama Lengkap" value={dataKeluarga.nama_ayah ?? "-"} />
                  </div>
                  <InfoItem label="NIK" value={dataKeluarga.nik_ayah ?? "-"} mono />
                  <InfoItem label="Tahun Lahir" value={yearOnly(dataKeluarga.tanggal_lahir_ayah)} />
                  <InfoItem label="Pendidikan Terakhir" value={dataKeluarga.pendidikan_ayah ?? "-"} />
                  <InfoItem label="Pekerjaan Utama" value={dataKeluarga.pekerjaan_ayah ?? "-"} />
                  <InfoItem label="Penghasilan Bulanan" value={dataKeluarga.penghasilan_ayah ?? "-"} />
                  <InfoItem label="Nomor Telepon/HP" value={dataKeluarga.no_hp_ayah ?? "-"} />
                </div>
              </Section>

              <Section title="Data Ibu Kandung">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <InfoItem label="Nama Lengkap" value={dataKeluarga.nama_ibu ?? siswa?.nama_ibu_kandung ?? "-"} />
                  </div>
                  <InfoItem label="NIK" value={dataKeluarga.nik_ibu ?? "-"} mono />
                  <InfoItem label="Tahun Lahir" value={yearOnly(dataKeluarga.tanggal_lahir_ibu)} />
                  <InfoItem label="Pendidikan Terakhir" value={dataKeluarga.pendidikan_ibu ?? "-"} />
                  <InfoItem label="Pekerjaan Utama" value={dataKeluarga.pekerjaan_ibu ?? "-"} />
                  <InfoItem label="Penghasilan Bulanan" value={dataKeluarga.penghasilan_ibu ?? "-"} />
                  <InfoItem label="Nomor Telepon/HP" value={dataKeluarga.no_hp_ibu ?? "-"} />
                </div>
              </Section>

              <Section title="Data Wali">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <InfoItem label="Nama Lengkap" value={dataKeluarga.nama_wali ?? "-"} />
                  </div>
                  <InfoItem label="NIK" value={dataKeluarga.nik_wali ?? "-"} mono />
                  <InfoItem label="Hubungan dengan Siswa" value={dataKeluarga.hubungan_wali ?? "-"} />
                  <InfoItem label="Pekerjaan Utama" value={dataKeluarga.pekerjaan_wali ?? "-"} />
                  <InfoItem label="Penghasilan Bulanan" value={dataKeluarga.penghasilan_wali ?? "-"} />
                  <InfoItem label="Nomor Telepon/HP" value={dataKeluarga.no_hp_wali ?? "-"} />
                </div>
              </Section>

              <Section title="Kontak & Domisili Orang Tua/Wali">
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Email" value={dataKeluarga.email ?? ortu.email ?? "-"} />
                  <InfoItem label="No. HP Akun" value={ortu.no_hp ?? "-"} />
                  <div className="col-span-2">
                    <InfoItem label="Alamat Domisili" value={dataKeluarga.alamat ?? "-"} />
                  </div>
                </div>
              </Section>
            </div>
          ) : (
            <div className="border border-dashed border-gray-200 rounded-lg p-8 text-center">
              <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Data keluarga belum diisi pada form data siswa.
              </p>
            </div>
          )}
        </div>
      </div>

      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                  onChange={(event) =>
                    setPasswordData((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className="input-field"
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
                  onChange={(event) =>
                    setPasswordData((prev) => ({ ...prev, password_confirmation: event.target.value }))
                  }
                  className="input-field"
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
                  disabled={resetPasswordMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {resetPasswordMutation.isPending ? "Mereset..." : "Reset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus Akun?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Akun <b>{ortu.nama_lengkap}</b> akan dihapus permanen.
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
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex-1 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function InfoItem({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm text-gray-700 ${mono ? "font-mono" : "font-medium"}`}>
        {value || "-"}
      </p>
    </div>
  );
}

function EditField({ icon: Icon, label, value, onChange, disabled, type = "text" }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="input-field pl-9 disabled:bg-gray-50 disabled:text-gray-600"
        />
      </div>
    </div>
  );
}
