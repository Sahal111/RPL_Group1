import { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import toast from "react-hot-toast";
import { ArrowLeft, Camera, User, Shield } from "lucide-react";

export default function DetailSiswa() {
  const { nisn } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef();

  const { data: siswa, isLoading } = useQuery({
    queryKey: ["siswa-detail", nisn],
    queryFn: () =>
      api.get(`/operator/master-data/siswa/${nisn}`).then((r) => r.data.data),
  });

  const uploadFoto = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append("foto", file);
      return api.post(`/operator/master-data/siswa/${nisn}/foto`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Foto berhasil diupload.");
      queryClient.invalidateQueries(["siswa-detail", nisn]);
    },
    onError: () => toast.error("Gagal upload foto."),
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );

  if (!siswa)
    return (
      <div className="text-center py-20 text-gray-400">
        Data siswa tidak ditemukan.
      </div>
    );

  const fotoUrl = siswa.foto
    ? `http://127.0.0.1:8001/storage/${siswa.foto}`
    : null;
  const isL = siswa.jenis_kelamin === "L";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/operator/master/siswa")}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detail Siswa</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Informasi lengkap data siswa
          </p>
        </div>
      </div>

      <div className="card">
        {/* Header profil */}
        <div className="flex items-start gap-5 mb-6">
          <div className="relative flex-shrink-0">
            <div
              className={`w-20 h-20 rounded-2xl overflow-hidden ${isL ? "bg-blue-100" : "bg-pink-100"}`}
            >
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt={siswa.nama_lengkap}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span
                    className={`font-bold text-3xl ${isL ? "text-blue-700" : "text-pink-700"}`}
                  >
                    {siswa.nama_lengkap?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors"
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
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {siswa.nama_lengkap}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${isL ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"}`}
              >
                {isL ? "Laki-laki" : "Perempuan"}
              </span>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${siswa.status_pd === "Aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
              >
                {siswa.status_pd}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Kolom Kiri */}
          <div className="space-y-6">
            <Section title="Data Pribadi">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="NISN" value={siswa.nisn} mono />
                <InfoItem label="NIK" value={siswa.nik ?? "-"} mono />
                <InfoItem label="No. Induk" value={siswa.no_induk ?? "-"} />
                <InfoItem label="Tempat Lahir" value={siswa.tempat_lahir} />
                <InfoItem label="Tanggal Lahir" value={siswa.tanggal_lahir} />
                <InfoItem label="Agama" value={siswa.agama} />
                <InfoItem
                  label="Kewarganegaraan"
                  value={siswa.kewarganegaraan}
                />
                <InfoItem label="No. HP Ortu" value={siswa.no_hp ?? "-"} />
              </div>
            </Section>

            <Section title="Data Keluarga">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <InfoItem
                    label="Nama Ibu Kandung"
                    value={siswa.nama_ibu_kandung}
                  />
                </div>
                <InfoItem
                  label="Status dalam Keluarga"
                  value={siswa.status_dalam_keluarga}
                />
                <InfoItem label="Anak ke-" value={siswa.anak_ke ?? "-"} />
                <InfoItem label="No. KK" value={siswa.no_kk ?? "-"} mono />
                <InfoItem
                  label="No. Akta Lahir"
                  value={siswa.no_akta_lahir ?? "-"}
                />
              </div>
            </Section>
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-6">
            <Section title="Data Sekolah">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Status PD" value={siswa.status_pd} />
                <InfoItem label="Tanggal Masuk" value={siswa.tanggal_masuk} />
                <div className="col-span-2">
                  <InfoItem
                    label="Asal Sekolah"
                    value={siswa.asal_sekolah ?? "-"}
                  />
                </div>
              </div>
            </Section>

            <Section title="Alamat">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <InfoItem label="Jalan" value={siswa.alamat_jalan} />
                </div>
                <InfoItem
                  label="RT / RW"
                  value={`${siswa.rt ?? "-"} / ${siswa.rw ?? "-"}`}
                />
                <InfoItem label="Desa/Kelurahan" value={siswa.desa ?? "-"} />
                <InfoItem label="Kecamatan" value={siswa.kecamatan ?? "-"} />
                <InfoItem
                  label="Kabupaten/Kota"
                  value={siswa.kabupaten ?? "-"}
                />
                <InfoItem label="Provinsi" value={siswa.provinsi ?? "-"} />
                <InfoItem label="Kode Pos" value={siswa.kode_pos ?? "-"} />
              </div>
            </Section>
          </div>
        </div>
      </div>
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
        {value}
      </p>
    </div>
  );
}
