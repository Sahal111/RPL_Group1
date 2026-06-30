import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { User, CalendarCheck, UserCheck, Megaphone, School, AlertCircle, AlertTriangle, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import dayjs from "dayjs";
import 'dayjs/locale/id';
import useSelectedAnak from "../../hooks/useSelectedAnak";

dayjs.locale('id');

export default function AbsensiAnak() {
  const { selectedNisn } = useSelectedAnak();
  const { data: dashboard, isLoading, isError } = useQuery({
    queryKey: ["ortu-dashboard", selectedNisn],
    queryFn: () =>
      api
        .get("/ortu/dashboard", { params: selectedNisn ? { nisn: selectedNisn } : {} })
        .then((res) => res.data.data),
    retry: false
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Data Anak Tidak Ditemukan</h2>
        <p className="text-gray-500 max-w-md">
          Akun Anda belum ditautkan dengan data siswa manapun. Silakan hubungi pihak sekolah/operator untuk menautkan akun Anda dengan data anak Anda.
        </p>
      </div>
    );
  }

  const { siswa, kelas, absensi_hari_ini, bolos_hari_ini, rekap_bulan_ini, pengumuman_terbaru } = dashboard;
  const fotoUrl = siswa?.foto ? `http://127.0.0.1:8001/storage/${siswa.foto}` : null;

  // Data untuk grafik pie
  const chartData = [
    { name: 'Hadir', value: rekap_bulan_ini?.hadir || 0, color: '#10b981' },
    { name: 'Izin', value: rekap_bulan_ini?.izin || 0, color: '#3b82f6' },
    { name: 'Sakit', value: rekap_bulan_ini?.sakit || 0, color: '#f97316' },
    { name: 'Alfa', value: rekap_bulan_ini?.alfa || 0, color: '#ef4444' },
  ].filter(item => item.value > 0); // Hanya tampilkan yang ada nilainya

  const totalAbsensi = (rekap_bulan_ini?.hadir || 0) + (rekap_bulan_ini?.izin || 0) + 
                       (rekap_bulan_ini?.sakit || 0) + (rekap_bulan_ini?.alfa || 0);

  // Custom label untuk pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Orang Tua</h1>
          <p className="text-sm text-gray-500">Pantau kehadiran dan informasi anak Anda</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-500">Hari ini</p>
          <p className="text-lg font-bold text-indigo-700">{dayjs().format('dddd, D MMMM YYYY')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kiri: Profil Anak & Status Hari Ini */}
        <div className="space-y-6">
          <div className="card text-center p-8 border-t-4 border-indigo-500">
            <div className="w-24 h-24 mx-auto bg-indigo-100 rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg">
              {fotoUrl ? (
                <img src={fotoUrl} alt={siswa.nama_lengkap} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-indigo-400 mt-5 mx-auto" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{siswa.nama_lengkap}</h2>
            <p className="text-indigo-600 font-medium text-sm mb-4">NISN: {siswa.nisn}</p>

            <div className="flex flex-col gap-2 mt-4 text-left bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-3 text-gray-700">
                <School className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Kelas</p>
                  <p className="text-sm font-bold">{kelas?.nama_kelas || "Belum ada kelas"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700 mt-2">
                <UserCheck className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Wali Kelas</p>
                  <p className="text-sm font-bold">{kelas?.wali_kelas || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg">
            <h3 className="text-indigo-100 text-sm font-medium mb-1">Status Kehadiran Hari Ini</h3>
            <div className="flex items-end justify-between mt-2">
              <p className="text-4xl font-extrabold">{absensi_hari_ini}</p>
              <CalendarCheck className="w-12 h-12 text-white/30" />
            </div>
            {absensi_hari_ini === 'Alfa' || absensi_hari_ini === 'Alpa' ? (
              <div className="mt-4 bg-red-500/20 px-3 py-2 rounded-lg flex items-start gap-2 text-sm text-red-100 border border-red-500/30">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p>Anak Anda terdata <b>Alfa (tanpa keterangan)</b> hari ini. Harap konfirmasi ke wali kelas.</p>
              </div>
            ) : null}
            {absensi_hari_ini === 'Hadir' && bolos_hari_ini && (
              <div className="mt-4 bg-orange-500/20 px-3 py-2 rounded-lg flex items-start gap-2 text-sm text-orange-100 border border-orange-500/30">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p>Anak Anda terhitung <b>Hadir</b> hari ini, namun terindikasi <b>bolos/alfa di beberapa jam pelajaran</b>. Mohon cek Riwayat Absensi.</p>
              </div>
            )}
            {absensi_hari_ini === 'Sakit' && (
              <div className="mt-4 bg-orange-500/20 px-3 py-2 rounded-lg flex items-start gap-2 text-sm text-orange-100 border border-orange-500/30">
                <p>Semoga lekas sembuh!</p>
              </div>
            )}
          </div>
        </div>

        {/* Tengah: Rekap Bulan Ini */}
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-500" />
              Kehadiran Bulan Ini ({dayjs().format('MMMM')})
            </h2>
            
            {/* Grid Cards & Grafik */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-2xl p-4 border border-green-100 text-center">
                  <p className="text-sm text-green-600 font-semibold mb-1">Hadir</p>
                  <p className="text-3xl font-bold text-green-700">{rekap_bulan_ini?.hadir || 0}</p>
                  <p className="text-xs text-green-600/70 mt-1">Mata Pelajaran</p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-center">
                  <p className="text-sm text-blue-600 font-semibold mb-1">Izin</p>
                  <p className="text-3xl font-bold text-blue-700">{rekap_bulan_ini?.izin || 0}</p>
                  <p className="text-xs text-blue-600/70 mt-1">Mata Pelajaran</p>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 text-center">
                  <p className="text-sm text-orange-600 font-semibold mb-1">Sakit</p>
                  <p className="text-3xl font-bold text-orange-700">{rekap_bulan_ini?.sakit || 0}</p>
                  <p className="text-xs text-orange-600/70 mt-1">Mata Pelajaran</p>
                </div>
                <div className="bg-red-50 rounded-2xl p-4 border border-red-100 text-center">
                  <p className="text-sm text-red-600 font-semibold mb-1">Alfa</p>
                  <p className="text-3xl font-bold text-red-700">{rekap_bulan_ini?.alfa || 0}</p>
                  <p className="text-xs text-red-600/70 mt-1">Mata Pelajaran</p>
                </div>
              </div>

              {/* Grafik Pie */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <PieChartIcon className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-gray-800">Visualisasi Kehadiran</h3>
                </div>
                {totalAbsensi > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          borderRadius: '8px', 
                          border: '1px solid #e5e7eb',
                          fontSize: '12px'
                        }}
                        formatter={(value) => [`${value} Mapel`, '']}
                      />
                      <Legend 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-sm text-gray-400">Belum ada data absensi</p>
                  </div>
                )}
              </div>
            </div>
            
            {(rekap_bulan_ini?.alfa > 2) && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-800">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Peringatan Kehadiran</h4>
                  <p className="text-sm mt-1">
                    Anak Anda telah memiliki lebih dari 2 hari Alfa di bulan ini. Kehadiran yang buruk dapat mempengaruhi kelulusan.
                  </p>
                </div>
              </div>
            )}

            {(rekap_bulan_ini?.bolos_jam_pelajaran > 0) && (
              <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3 text-orange-800">
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Peringatan Bolos Jam Pelajaran</h4>
                  <p className="text-sm mt-1">
                    Terdapat <b>{rekap_bulan_ini.bolos_jam_pelajaran} hari</b> di bulan ini di mana anak Anda hadir di sekolah namun <b>membolos pada beberapa jam pelajaran tertentu</b>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pengumuman Terbaru */}
          <div className="card bg-indigo-50/50 border-none shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-500" />
                Pengumuman Terbaru
              </h2>
            </div>
            
            {pengumuman_terbaru?.length > 0 ? (
              <div className="space-y-3">
                {pengumuman_terbaru.map((p) => (
                  <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex gap-2 items-center mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                        p.kategori === "Penting" ? "bg-red-100 text-red-700" :
                        p.kategori === "Libur" ? "bg-green-100 text-green-700" :
                        p.kategori === "Rapat" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {p.kategori}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {dayjs(p.created_at).format('DD MMM YYYY')}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800">{p.judul}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.konten}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-xl border border-gray-100">
                <Megaphone className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Belum ada pengumuman.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
