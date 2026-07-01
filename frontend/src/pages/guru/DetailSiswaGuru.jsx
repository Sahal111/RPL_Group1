import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { ArrowLeft, User, Phone, Mail, AtSign, Users } from "lucide-react";

export default function DetailSiswaGuru() {
  const { nisn } = useParams();
  const navigate = useNavigate();

  const { data: siswa, isLoading } = useQuery({
    queryKey: ["guru-siswa-detail", nisn],
    queryFn: () => api.get(`/guru/siswa/${nisn}`).then((r) => r.data.data),
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
        Data siswa tidak ditemukan atau bukan dari kelas Anda.
      </div>
    );

  const fotoUrl = siswa.foto
    ? `http://127.0.0.1:8001/storage/${siswa.foto}`
    : null;
  const isL = siswa.jenis_kelamin === "L";
  const ortuList = Array.isArray(siswa.user_ortu) ? siswa.user_ortu : [];

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/guru/siswa")}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detail Siswa</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Informasi lengkap profil siswa
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              </div>
            </Section>

            <Section
              title={`Data Orang Tua / Wali${ortuList.length > 0 ? ` (${ortuList.length} terdaftar)` : ""}`}
            >
              {ortuList.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 italic">
                    Belum ada akun orang tua yang terhubung.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ortuList.map((ortu, idx) => (
                    <div
                      key={ortu.user_id ?? idx}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3"
                    >
                      {/* Nama + Badge Hubungan */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="font-semibold text-gray-800">
                            {ortu.user?.nama_lengkap ?? "-"}
                          </span>
                        </div>
                        <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
                          {ortu.hubungan}
                        </span>
                      </div>

                      {/* Detail kontak */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                        {/* Username */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <AtSign className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="font-mono text-xs">
                            {ortu.user?.username ?? "-"}
                          </span>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-xs truncate">
                            {ortu.user?.email ?? "-"}
                          </span>
                        </div>

                        {/* No HP + WhatsApp */}
                        {ortu.user?.no_hp ? (
                          <a
                            href={`https://wa.me/${ortu.user.no_hp.replace(/^0/, "62")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium col-span-full"
                          >
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            {ortu.user.no_hp}
                            <span className="text-xs text-green-500 font-normal">
                              (Hubungi via WhatsApp)
                            </span>
                          </a>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400 col-span-full">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="text-xs italic">
                              No. HP belum diisi
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status akun */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${ortu.user?.is_active ? "bg-green-500" : "bg-gray-300"}`}
                        />
                        <span className="text-xs text-gray-400">
                          Akun {ortu.user?.is_active ? "aktif" : "tidak aktif"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              </div>
            </Section>
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-6">
            <Section title="Alamat Tempat Tinggal">
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
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
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
