import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import { User, MapPin, Calendar, FileText, UserPlus } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import useSelectedAnak from "../../hooks/useSelectedAnak";

dayjs.locale("id");

export default function DataAnak() {
  const { selectedNisn } = useSelectedAnak();
  const {
    data: siswa,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["ortu-profil-anak", selectedNisn],
    queryFn: () =>
      api
        .get("/ortu/profil-anak", {
          params: selectedNisn ? { nisn: selectedNisn } : {},
        })
        .then((res) => res.data.data),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (isError || !siswa) {
    return (
      <div className="text-center py-20 text-gray-500">
        Data anak tidak ditemukan atau belum ditautkan.
      </div>
    );
  }

  const fotoUrl = siswa.foto
    ? `http://127.0.0.1:8001/storage/${siswa.foto}`
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Diri Anak</h1>
          <p className="text-sm text-gray-500 mt-1">
            Informasi lengkap profil siswa yang terdaftar di sistem.
          </p>
        </div>
        <Link
          to="/ortu/tambah-anak"
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Anak
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom Kiri: Profil Singkat */}
        <div className="space-y-6">
          <div className="card text-center p-8">
            <div className="w-32 h-32 mx-auto bg-indigo-50 rounded-2xl overflow-hidden mb-4 border border-indigo-100 flex items-center justify-center shadow-inner">
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt={siswa.nama_lengkap}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-indigo-300" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {siswa.nama_lengkap}
            </h2>
            <p className="text-indigo-600 font-medium mt-1">
              NISN: {siswa.nisn}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${
                  siswa.status_pd === "Aktif"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {siswa.status_pd}
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                {siswa.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
              </span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Detail Lengkap */}
        <div className="md:col-span-2 space-y-6">
          <div className="card shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
              <FileText className="w-5 h-5 text-indigo-500" /> Identitas Pribadi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem label="NISN" value={siswa.nisn} />
              <InfoItem label="NIK" value={siswa.nik || "-"} />
              <InfoItem label="No. Induk (NIS)" value={siswa.no_induk || "-"} />
              <InfoItem
                label="Tempat, Tanggal Lahir"
                value={`${siswa.tempat_lahir || "-"}, ${
                  siswa.tanggal_lahir
                    ? dayjs(siswa.tanggal_lahir).format("DD MMMM YYYY")
                    : "-"
                }`}
              />
              <InfoItem label="Agama" value={siswa.agama || "-"} />
              <InfoItem
                label="Kewarganegaraan"
                value={siswa.kewarganegaraan || "-"}
              />
              <InfoItem label="Anak ke-" value={siswa.anak_ke || "-"} />
              <InfoItem
                label="Status dalam Keluarga"
                value={siswa.status_dalam_keluarga || "-"}
              />
              <InfoItem
                label="No. Akta Lahir"
                value={siswa.no_akta_lahir || "-"}
              />
              <InfoItem label="No. Kartu Keluarga" value={siswa.no_kk || "-"} />
            </div>
          </div>

          <div className="card shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
              <MapPin className="w-5 h-5 text-green-500" /> Kontak & Alamat
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-1 sm:col-span-2">
                <InfoItem
                  label="Jalan/Dusun"
                  value={siswa.alamat_jalan || "-"}
                />
              </div>
              <InfoItem
                label="RT / RW"
                value={`${siswa.rt || "-"} / ${siswa.rw || "-"}`}
              />
              <InfoItem label="Desa/Kelurahan" value={siswa.desa || "-"} />
              <InfoItem label="Kecamatan" value={siswa.kecamatan || "-"} />
              <InfoItem label="Kabupaten/Kota" value={siswa.kabupaten || "-"} />
              <InfoItem label="Provinsi" value={siswa.provinsi || "-"} />
              <InfoItem label="Kode Pos" value={siswa.kode_pos || "-"} />
              <div className="col-span-1 sm:col-span-2">
                <InfoItem label="Nomor HP" value={siswa.no_hp || "-"} />
              </div>
            </div>
          </div>

          <div className="card shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Calendar className="w-5 h-5 text-orange-500" /> Data Akademik
              Awal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem
                label="Asal Sekolah"
                value={siswa.asal_sekolah || "-"}
              />
              <InfoItem
                label="Tanggal Masuk"
                value={
                  siswa.tanggal_masuk
                    ? dayjs(siswa.tanggal_masuk).format("DD MMMM YYYY")
                    : "-"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-700">{value}</p>
    </div>
  );
}
