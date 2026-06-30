import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  AlertCircle,
  Eye,
  KeyRound,
  Mail,
  Pencil,
  Phone,
  Save,
  Shield,
  ShieldOff,
  User,
  Users,
} from "lucide-react";

const yearOnly = (date) => (date ? String(date).slice(0, 4) : "-");
const parentDisplayName = (ortu) =>
  ortu?.nama_ayah ||
  ortu?.nama_ibu ||
  ortu?.nama_wali ||
  ortu?.email ||
  `Orang tua #${ortu?.id}`;

// Kumpulkan semua akun login yang tertaut ke keluarga ini lintas semua anak,
// lalu dedupe per akun (satu akun bisa tertaut ke lebih dari satu anak di keluarga yang sama).
const collectAkun = (siswaList) => {
  const map = new Map();

  (siswaList ?? []).forEach((siswa) => {
    (siswa.user_ortu ?? []).forEach((relasi) => {
      if (!relasi.user) return;
      const anakEntry = {
        nisn: siswa.nisn,
        nama_lengkap: siswa.nama_lengkap,
        hubungan: relasi.hubungan,
      };
      const existing = map.get(relasi.user.id);

      if (existing) {
        existing.anak.push(anakEntry);
      } else {
        map.set(relasi.user.id, { ...relasi.user, anak: [anakEntry] });
      }
    });
  });

  return Array.from(map.values());
};

export default function DetailDataOrtu() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [resetTarget, setResetTarget] = useState(null);
  const [passwordData, setPasswordData] = useState({
    password: "",
    password_confirmation: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const emptyForm = {
    nama_ayah: "",
    nik_ayah: "",
    tanggal_lahir_ayah: "",
    pendidikan_ayah: "",
    pekerjaan_ayah: "",
    penghasilan_ayah: "",
    no_hp_ayah: "",
    nama_ibu: "",
    nik_ibu: "",
    tanggal_lahir_ibu: "",
    pendidikan_ibu: "",
    pekerjaan_ibu: "",
    penghasilan_ibu: "",
    no_hp_ibu: "",
    nama_wali: "",
    nik_wali: "",
    hubungan_wali: "",
    pekerjaan_wali: "",
    penghasilan_wali: "",
    no_hp_wali: "",
    email: "",
    alamat: "",
  };
  const [formData, setFormData] = useState(emptyForm);

  const { data: ortu, isLoading } = useQuery({
    queryKey: ["detail-data-ortu", id],
    queryFn: () =>
      api
        .get(`/operator/master-data/orang-tua/${id}`)
        .then((res) => res.data.data),
  });

  useEffect(() => {
    if (!ortu) return;
    setFormData({
      nama_ayah: ortu.nama_ayah || "",
      nik_ayah: ortu.nik_ayah || "",
      tanggal_lahir_ayah: ortu.tanggal_lahir_ayah || "",
      pendidikan_ayah: ortu.pendidikan_ayah || "",
      pekerjaan_ayah: ortu.pekerjaan_ayah || "",
      penghasilan_ayah: ortu.penghasilan_ayah || "",
      no_hp_ayah: ortu.no_hp_ayah || "",
      nama_ibu: ortu.nama_ibu || "",
      nik_ibu: ortu.nik_ibu || "",
      tanggal_lahir_ibu: ortu.tanggal_lahir_ibu || "",
      pendidikan_ibu: ortu.pendidikan_ibu || "",
      pekerjaan_ibu: ortu.pekerjaan_ibu || "",
      penghasilan_ibu: ortu.penghasilan_ibu || "",
      no_hp_ibu: ortu.no_hp_ibu || "",
      nama_wali: ortu.nama_wali || "",
      nik_wali: ortu.nik_wali || "",
      hubungan_wali: ortu.hubungan_wali || "",
      pekerjaan_wali: ortu.pekerjaan_wali || "",
      penghasilan_wali: ortu.penghasilan_wali || "",
      no_hp_wali: ortu.no_hp_wali || "",
      email: ortu.email || "",
      alamat: ortu.alamat || "",
    });
  }, [ortu]);

  const toggleActiveMutation = useMutation({
    mutationFn: (userId) =>
      api.patch(`/operator/users/${userId}/toggle-active`),
    onSuccess: () => {
      toast.success("Status akun berhasil diubah.");
      queryClient.invalidateQueries(["detail-data-ortu", id]);
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message ?? "Gagal mengubah status akun.",
      ),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, data }) =>
      api.patch(`/operator/users/${userId}/reset-password`, data),
    onSuccess: () => {
      toast.success("Password berhasil direset.");
      setResetTarget(null);
      setPasswordData({ password: "", password_confirmation: "" });
    },
    onError: (error) =>
      toast.error(error.response?.data?.message ?? "Gagal reset password."),
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      api.put(`/operator/master-data/orang-tua/${id}`, data),
    onSuccess: () => {
      toast.success("Data orang tua berhasil diperbarui.");
      queryClient.invalidateQueries(["detail-data-ortu", id]);
      queryClient.invalidateQueries(["master-ortu"]);
      setIsEdit(false);
    },
    onError: (error) =>
      toast.error(error.response?.data?.message ?? "Gagal memperbarui data."),
  });

  const handleUpdateSubmit = (event) => {
    event.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleResetPassword = (event) => {
    event.preventDefault();
    if (!resetTarget) return;
    resetPasswordMutation.mutate({
      userId: resetTarget.id,
      data: passwordData,
    });
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

  const siswaList = ortu.siswa ?? [];
  const akunList = collectAkun(siswaList);

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
            <h1 className="text-2xl font-bold text-gray-800">
              {parentDisplayName(ortu)}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Data keluarga, anak tertaut, dan akun login orang tua
            </p>
          </div>
        </div>

        {!isEdit && (
          <button
            onClick={() => setIsEdit(true)}
            className="btn-primary flex items-center gap-2 flex-shrink-0"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form
          onSubmit={handleUpdateSubmit}
          className="xl:col-span-2 card space-y-8"
        >
          <Section title="Data Ayah Kandung">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <EditableField
                  label="Nama Lengkap"
                  editing={isEdit}
                  value={isEdit ? formData.nama_ayah : ortu.nama_ayah}
                  onChange={(v) => setFormData((p) => ({ ...p, nama_ayah: v }))}
                />
              </div>
              <EditableField
                label="NIK"
                mono
                editing={isEdit}
                value={isEdit ? formData.nik_ayah : ortu.nik_ayah}
                onChange={(v) => setFormData((p) => ({ ...p, nik_ayah: v }))}
              />
              <EditableField
                label="Tanggal Lahir"
                editing={isEdit}
                value={
                  isEdit
                    ? formData.tanggal_lahir_ayah
                    : yearOnly(ortu.tanggal_lahir_ayah)
                }
                onChange={(v) =>
                  setFormData((p) => ({ ...p, tanggal_lahir_ayah: v }))
                }
              />
              <EditableField
                label="Pendidikan Terakhir"
                editing={isEdit}
                value={isEdit ? formData.pendidikan_ayah : ortu.pendidikan_ayah}
                onChange={(v) =>
                  setFormData((p) => ({ ...p, pendidikan_ayah: v }))
                }
              />
              <EditableField
                label="Pekerjaan Utama"
                editing={isEdit}
                value={isEdit ? formData.pekerjaan_ayah : ortu.pekerjaan_ayah}
                onChange={(v) =>
                  setFormData((p) => ({ ...p, pekerjaan_ayah: v }))
                }
              />
              <EditableField
                label="Penghasilan Bulanan"
                editing={isEdit}
                value={
                  isEdit ? formData.penghasilan_ayah : ortu.penghasilan_ayah
                }
                onChange={(v) =>
                  setFormData((p) => ({ ...p, penghasilan_ayah: v }))
                }
              />
              <EditableField
                label="Nomor Telepon/HP"
                editing={isEdit}
                value={isEdit ? formData.no_hp_ayah : ortu.no_hp_ayah}
                onChange={(v) => setFormData((p) => ({ ...p, no_hp_ayah: v }))}
              />
            </div>
          </Section>

          <Section title="Data Ibu Kandung">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <EditableField
                  label="Nama Lengkap"
                  editing={isEdit}
                  value={isEdit ? formData.nama_ibu : ortu.nama_ibu}
                  onChange={(v) => setFormData((p) => ({ ...p, nama_ibu: v }))}
                />
              </div>
              <EditableField
                label="NIK"
                mono
                editing={isEdit}
                value={isEdit ? formData.nik_ibu : ortu.nik_ibu}
                onChange={(v) => setFormData((p) => ({ ...p, nik_ibu: v }))}
              />
              <EditableField
                label="Tanggal Lahir"
                editing={isEdit}
                value={
                  isEdit
                    ? formData.tanggal_lahir_ibu
                    : yearOnly(ortu.tanggal_lahir_ibu)
                }
                onChange={(v) =>
                  setFormData((p) => ({ ...p, tanggal_lahir_ibu: v }))
                }
              />
              <EditableField
                label="Pendidikan Terakhir"
                editing={isEdit}
                value={isEdit ? formData.pendidikan_ibu : ortu.pendidikan_ibu}
                onChange={(v) =>
                  setFormData((p) => ({ ...p, pendidikan_ibu: v }))
                }
              />
              <EditableField
                label="Pekerjaan Utama"
                editing={isEdit}
                value={isEdit ? formData.pekerjaan_ibu : ortu.pekerjaan_ibu}
                onChange={(v) =>
                  setFormData((p) => ({ ...p, pekerjaan_ibu: v }))
                }
              />
              <EditableField
                label="Penghasilan Bulanan"
                editing={isEdit}
                value={isEdit ? formData.penghasilan_ibu : ortu.penghasilan_ibu}
                onChange={(v) =>
                  setFormData((p) => ({ ...p, penghasilan_ibu: v }))
                }
              />
              <EditableField
                label="Nomor Telepon/HP"
                editing={isEdit}
                value={isEdit ? formData.no_hp_ibu : ortu.no_hp_ibu}
                onChange={(v) => setFormData((p) => ({ ...p, no_hp_ibu: v }))}
              />
            </div>
          </Section>

          <Section title="Data Wali">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <EditableField
                  label="Nama Lengkap"
                  editing={isEdit}
                  value={isEdit ? formData.nama_wali : ortu.nama_wali}
                  onChange={(v) => setFormData((p) => ({ ...p, nama_wali: v }))}
                />
              </div>
              <EditableField
                label="NIK"
                mono
                editing={isEdit}
                value={isEdit ? formData.nik_wali : ortu.nik_wali}
                onChange={(v) => setFormData((p) => ({ ...p, nik_wali: v }))}
              />
              <EditableField
                label="Hubungan dengan Siswa"
                editing={isEdit}
                value={isEdit ? formData.hubungan_wali : ortu.hubungan_wali}
                onChange={(v) =>
                  setFormData((p) => ({ ...p, hubungan_wali: v }))
                }
              />
              <EditableField
                label="Pekerjaan Utama"
                editing={isEdit}
                value={isEdit ? formData.pekerjaan_wali : ortu.pekerjaan_wali}
                onChange={(v) =>
                  setFormData((p) => ({ ...p, pekerjaan_wali: v }))
                }
              />
              <EditableField
                label="Penghasilan Bulanan"
                editing={isEdit}
                value={
                  isEdit ? formData.penghasilan_wali : ortu.penghasilan_wali
                }
                onChange={(v) =>
                  setFormData((p) => ({ ...p, penghasilan_wali: v }))
                }
              />
              <EditableField
                label="Nomor Telepon/HP"
                editing={isEdit}
                value={isEdit ? formData.no_hp_wali : ortu.no_hp_wali}
                onChange={(v) => setFormData((p) => ({ ...p, no_hp_wali: v }))}
              />
            </div>
          </Section>

          <Section title="Kontak & Domisili Orang Tua/Wali">
            <div className="grid grid-cols-2 gap-4">
              <EditableField
                label="Email"
                type="email"
                editing={isEdit}
                value={isEdit ? formData.email : ortu.email}
                onChange={(v) => setFormData((p) => ({ ...p, email: v }))}
              />
              <div className="col-span-2">
                <EditableField
                  label="Alamat Domisili"
                  editing={isEdit}
                  value={isEdit ? formData.alamat : ortu.alamat}
                  onChange={(v) => setFormData((p) => ({ ...p, alamat: v }))}
                />
              </div>
            </div>
          </Section>

          {isEdit && (
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
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
          )}
        </form>

        <div className="space-y-6">
          <div className="card">
            <Section title={`Anak Tertaut (${siswaList.length})`}>
              {siswaList.length > 0 ? (
                <div className="space-y-2">
                  {siswaList.map((siswa) => (
                    <Link
                      key={siswa.nisn}
                      to={`/operator/master/siswa/${siswa.nisn}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {siswa.nama_lengkap}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          NISN: {siswa.nisn}
                        </p>
                      </div>
                      <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Belum ada anak tertaut.</p>
              )}
            </Section>
          </div>

          <div className="card">
            <Section title={`Akun Login Orang Tua (${akunList.length})`}>
              {akunList.length > 0 ? (
                <div className="space-y-3">
                  {akunList.map((akun) => (
                    <div
                      key={akun.id}
                      className="rounded-lg border border-gray-100 p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {akun.nama_lengkap}
                          </p>
                          <p className="text-xs text-gray-500">
                            @{akun.username}
                          </p>
                        </div>
                        {akun.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 flex-shrink-0">
                            <Shield className="w-3 h-3" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 flex-shrink-0">
                            <ShieldOff className="w-3 h-3" /> Non-Aktif
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 space-y-1">
                        {akun.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {akun.email}
                          </div>
                        )}
                        {akun.no_hp && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {akun.no_hp}
                          </div>
                        )}
                        <div className="flex items-start gap-1">
                          <Users className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>
                            {akun.anak
                              .map(
                                (a) => `${a.hubungan} dari ${a.nama_lengkap}`,
                              )
                              .join(", ")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => toggleActiveMutation.mutate(akun.id)}
                          className={`text-xs font-medium px-2 py-1 rounded-lg border transition-colors ${
                            akun.is_active
                              ? "border-red-200 text-red-600 hover:bg-red-50"
                              : "border-green-200 text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {akun.is_active ? "Non-Aktifkan" : "Aktifkan"}
                        </button>
                        <button
                          onClick={() => setResetTarget(akun)}
                          className="text-xs font-medium px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
                        >
                          <KeyRound className="w-3 h-3" /> Reset Password
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Belum ada akun login yang terhubung ke keluarga ini.
                  </p>
                </div>
              )}
            </Section>
          </div>
        </div>
      </div>

      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Reset Password
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Akun: {resetTarget.nama_lengkap}
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(event) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
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
                    setPasswordData((prev) => ({
                      ...prev,
                      password_confirmation: event.target.value,
                    }))
                  }
                  className="input-field"
                  placeholder="Ulangi password"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
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
      <p
        className={`text-sm text-gray-700 ${mono ? "font-mono" : "font-medium"}`}
      >
        {value || "-"}
      </p>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  editing,
  mono = false,
  type = "text",
}) {
  if (!editing) {
    return <InfoItem label={label} value={value} mono={mono} />;
  }

  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="input-field"
      />
    </div>
  );
}
