import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import {
  ArrowLeft,
  CalendarDays,
  School,
  Users,
  CheckCircle,
  BookOpen,
  ChevronRight,
  MapPin,
  Loader2,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function formatTanggal(str) {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DetailTahunAjaran() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["detail-tahun-ajaran", id],
    queryFn: () =>
      api.get(`/operator/master-data/tahun-ajaran/${id}`).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] gap-2 text-gray-400">
        <Loader2 size={20} className="animate-spin" />
        <span>Memuat data...</span>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="text-center py-20 text-gray-400">
        <CalendarDays size={48} className="mx-auto mb-4 opacity-30" />
        <p className="font-medium">Tahun ajaran tidak ditemukan.</p>
        <button
          onClick={() => navigate("/operator/master/tahun-ajaran")}
          className="mt-4 text-blue-600 text-sm hover:underline"
        >
          Kembali ke daftar
        </button>
      </div>
    );
  }

  const ta = data.data;
  const kelasList = data.kelas ?? [];
  const totalKelas = data.total_kelas ?? 0;
  const totalSiswa = data.total_siswa ?? 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button
          onClick={() => navigate("/operator/master/tahun-ajaran")}
          className="hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          Tahun Ajaran
        </button>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-medium">{ta.nama}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <CalendarDays className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{ta.nama}</h1>
                <p className="text-blue-100 text-sm mt-0.5">
                  {formatTanggal(ta.tanggal_mulai)} – {formatTanggal(ta.tanggal_selesai)}
                </p>
              </div>
            </div>
            {ta.is_active ? (
              <span className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/30">
                <CheckCircle size={14} />
                Aktif
              </span>
            ) : (
              <span className="bg-white/10 text-white/70 text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                Non-aktif
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={CalendarDays}
          label="Durasi"
          value={(() => {
            if (!ta.tanggal_mulai || !ta.tanggal_selesai) return "-";
            const d = Math.round(
              (new Date(ta.tanggal_selesai) - new Date(ta.tanggal_mulai)) /
                (1000 * 60 * 60 * 24)
            );
            return `${d} hari`;
          })()}
          color="blue"
        />
        <StatCard icon={School} label="Total Kelas" value={totalKelas} color="purple" />
        <StatCard icon={Users} label="Total Siswa Aktif" value={totalSiswa} color="green" />
      </div>

      {/* Daftar Kelas */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-800">Daftar Kelas</h2>
          </div>
          <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
            {totalKelas} kelas
          </span>
        </div>

        {kelasList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <School size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Belum ada kelas pada tahun ajaran ini</p>
            <Link
              to="/operator/master/kelas"
              className="mt-3 text-blue-600 text-sm hover:underline"
            >
              Buat kelas baru
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Nama Kelas</th>
                  <th className="px-5 py-3 text-left">Tingkat</th>
                  <th className="px-5 py-3 text-left">Semester</th>
                  <th className="px-5 py-3 text-left">Wali Kelas</th>
                  <th className="px-5 py-3 text-left">Kurikulum</th>
                  <th className="px-5 py-3 text-left">Ruangan</th>
                  <th className="px-5 py-3 text-center">Kapasitas</th>
                  <th className="px-5 py-3 text-center">Siswa Aktif</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {kelasList.map((k) => (
                  <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-gray-800">
                      {k.nama_kelas}
                    </td>
                    <td className="px-5 py-3">
                      <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        Tingkat {k.tingkat}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      Semester {k.semester}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {k.nama_wali ?? (
                        <span className="text-gray-300 italic">Belum ditentukan</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-gray-600">
                        <BookOpen size={13} className="text-gray-400" />
                        {k.kurikulum}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {k.ruangan ? (
                        <span className="flex items-center gap-1 text-gray-600">
                          <MapPin size={12} className="text-gray-400" />
                          {k.ruangan}
                        </span>
                      ) : (
                        <span className="text-gray-300 italic">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center text-gray-600">
                      {k.kapasitas}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`font-semibold ${
                          k.total_siswa >= k.kapasitas
                            ? "text-red-600"
                            : k.total_siswa >= k.kapasitas * 0.8
                              ? "text-amber-600"
                              : "text-green-600"
                        }`}
                      >
                        {k.total_siswa}
                      </span>
                      <span className="text-gray-400 text-xs">/{k.kapasitas}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {k.is_active ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Aktif
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                          Non-aktif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Link
                        to={`/operator/master/kelas/${k.id}`}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
