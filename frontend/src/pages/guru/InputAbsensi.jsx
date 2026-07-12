import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import {
  Calendar, Save, Filter, CheckCircle2, BookOpen,
  Clock, ChevronRight, AlertTriangle, XCircle
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);
dayjs.locale("id");

const getToday = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
};

const isWeekend = (dateStr) => {
  const day = dayjs(dateStr).day(); // 0 = Minggu, 6 = Sabtu
  return day === 0; // hanya blokir Minggu
};

const STATUS_COLORS = {
  Hadir: "border-green-400 bg-green-50 text-green-700",
  Sakit: "border-orange-400 bg-orange-50 text-orange-700",
  Izin:  "border-blue-400 bg-blue-50 text-blue-700",
  Alpa:  "border-red-400 bg-red-50 text-red-700",
};

export default function InputAbsensi() {
  const [kelasId, setKelasId]         = useState("");
  const [tanggal, setTanggal]         = useState(getToday());
  const [selectedJadwal, setSelectedJadwal] = useState(null); // { id_jadwal, nama_mapel, jam_mulai, jam_selesai }
  const [absensiState, setAbsensiState]     = useState({});
  const [keteranganState, setKeteranganState] = useState({});

  const queryClient = useQueryClient();

  // Fetch daftar kelas guru
  const { data: kelasList } = useQuery({
    queryKey: ["guru-kelas-dropdown"],
    queryFn: () => api.get("/guru/kelas").then((r) => r.data.data),
  });

  // Auto-pilih kelas pertama
  useEffect(() => {
    if (kelasList?.length > 0 && !kelasId) setKelasId(kelasList[0].id);
  }, [kelasList, kelasId]);

  // Reset jadwal yang dipilih saat kelas / tanggal berubah
  useEffect(() => {
    setSelectedJadwal(null);
    setAbsensiState({});
    setKeteranganState({});
  }, [kelasId, tanggal]);

  // Fetch jadwal pelajaran HARI INI untuk kelas yang dipilih
  const {
    data: jadwalData,
    isLoading: isLoadingJadwal,
  } = useQuery({
    queryKey: ["guru-jadwal-hari-ini", kelasId, tanggal],
    queryFn: () =>
      api
        .get(`/guru/kelas/${kelasId}/jadwal-hari-ini`, { params: { tanggal } })
        .then((r) => r.data.data),
    enabled: !!kelasId && !!tanggal && !isWeekend(tanggal),
    keepPreviousData: true,
  });

  // Fetch siswa + status absensi untuk jadwal yang dipilih
  const {
    data: absensiData,
    isLoading: isLoadingSiswa,
    isFetching,
  } = useQuery({
    queryKey: ["guru-absensi-per-jadwal", kelasId, tanggal, selectedJadwal?.id_jadwal],
    queryFn: () =>
      api
        .get(`/absensi/kelas/${kelasId}`, {
          params: { tanggal, id_jadwal: selectedJadwal.id_jadwal },
        })
        .then((r) => r.data.data),
    enabled: !!kelasId && !!tanggal && !!selectedJadwal,
    keepPreviousData: true,
  });

  // Sync state absensi ke data yang difetch
  useEffect(() => {
    if (absensiData?.siswa) {
      const newAbs = {};
      const newKet = {};
      absensiData.siswa.forEach((s) => {
        newAbs[s.nisn] = s.status || "";
        newKet[s.nisn] = s.keterangan || "";
      });
      setAbsensiState(newAbs);
      setKeteranganState(newKet);
    }
  }, [absensiData]);

  // Mutation simpan absensi
  const saveMutation = useMutation({
    mutationFn: (payload) => api.post("/absensi", payload),
    onSuccess: (res) => {
      toast.success(res.data.message || "Absensi berhasil disimpan!");
      queryClient.invalidateQueries(["guru-absensi-per-jadwal"]);
      queryClient.invalidateQueries(["guru-jadwal-hari-ini"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal menyimpan absensi");
    },
  });

  const handleSave = () => {
    if (!absensiData?.siswa?.length) return toast.error("Tidak ada data siswa.");
    const missing = absensiData.siswa.find((s) => !absensiState[s.nisn]);
    if (missing) return toast.error(`Status absensi ${missing.nama_lengkap} belum diisi.`);

    saveMutation.mutate({
      id_kelas:  kelasId,
      id_jadwal: selectedJadwal.id_jadwal,
      tanggal,
      absensi: absensiData.siswa.map((s) => ({
        nisn:       s.nisn,
        status:     absensiState[s.nisn],
        keterangan: keteranganState[s.nisn] || null,
      })),
    });
  };

  const hari = dayjs(tanggal).format("dddd");
  const isHariLibur = isWeekend(tanggal);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Input Absensi</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Isi kehadiran siswa berdasarkan jadwal mata pelajaran hari ini.
        </p>
      </div>

      {/* Step 1: Pilih Kelas & Tanggal */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
          Langkah 1 — Pilih Kelas & Tanggal
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Kelas</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={kelasId}
                onChange={(e) => setKelasId(e.target.value)}
                className="input pl-9 w-full"
              >
                <option value="" disabled>-- Pilih Kelas --</option>
                {kelasList?.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">
              Tanggal — <span className="text-indigo-600 normal-case font-bold">{hari}</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                max={getToday()}
                className="input pl-9 w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Blokir hari Minggu */}
      {isHariLibur && (
        <div className="card bg-red-50 border border-red-200 flex items-start gap-3">
          <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800">Hari Minggu — Tidak Ada Pembelajaran</h4>
            <p className="text-sm text-red-600 mt-0.5">
              Absensi tidak dapat diinput pada hari Minggu. Pilih tanggal hari sekolah.
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Pilih Jadwal / Mata Pelajaran */}
      {!isHariLibur && kelasId && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
            Langkah 2 — Pilih Mata Pelajaran
          </h2>

          {isLoadingJadwal ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
            </div>
          ) : !jadwalData?.jadwal?.length ? (
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Tidak ada jadwal pelajaran yang ditetapkan oleh operator untuk hari <b>{hari}</b> di kelas ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {jadwalData.jadwal.map((j) => {
                const isSelected = selectedJadwal?.id_jadwal === j.id_jadwal;
                return (
                  <button
                    key={j.id_jadwal}
                    onClick={() =>
                      setSelectedJadwal({
                        id_jadwal: j.id_jadwal,
                        nama_mapel: j.nama_mapel,
                        jam_mulai: j.jam_mulai,
                        jam_selesai: j.jam_selesai,
                      })
                    }
                    className={`relative text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-indigo-200"
                    }`}
                  >
                    {j.sudah_absen && (
                      <span className="absolute top-2 right-2 text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Sudah diisi
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className={`w-5 h-5 ${isSelected ? "text-indigo-500" : "text-gray-400"}`} />
                      <span className={`font-bold ${isSelected ? "text-indigo-700" : "text-gray-800"}`}>
                        {j.nama_mapel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      {j.jam_mulai?.slice(0, 5)} – {j.jam_selesai?.slice(0, 5)}
                    </div>
                    {isSelected && (
                      <ChevronRight className="absolute right-4 bottom-4 w-4 h-4 text-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Form Absensi Siswa */}
      {selectedJadwal && (
        <div className="card p-0 overflow-hidden">
          {/* Sub-header */}
          <div className="px-5 py-4 bg-indigo-600 text-white flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">{selectedJadwal.nama_mapel}</h2>
              <p className="text-indigo-200 text-sm">
                {dayjs(tanggal).format("dddd, DD MMMM YYYY")} &middot; {selectedJadwal.jam_mulai?.slice(0,5)} – {selectedJadwal.jam_selesai?.slice(0,5)}
              </p>
            </div>
            {absensiData?.sudah_diisi && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg text-sm">
                <CheckCircle2 className="w-4 h-4" /> Sudah Diisi
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium w-10">No</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Nama Siswa</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Status Kehadiran</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoadingSiswa ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <div className="animate-spin w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full" />
                        Memuat data siswa...
                      </div>
                    </td>
                  </tr>
                ) : (
                  absensiData?.siswa?.map((s, idx) => (
                    <tr
                      key={s.nisn}
                      className={`hover:bg-gray-50 transition-colors ${isFetching ? "opacity-50" : ""}`}
                    >
                      <td className="px-4 py-3 text-gray-400 text-xs">{s.no_absen || idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{s.nama_lengkap}</p>
                        <p className="text-xs text-gray-400">NISN: {s.nisn}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {["Hadir", "Sakit", "Izin", "Alpa"].map((opt) => (
                            <label
                              key={opt}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 cursor-pointer transition-all text-xs font-semibold ${
                                absensiState[s.nisn] === opt
                                  ? STATUS_COLORS[opt]
                                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`status_${s.nisn}`}
                                value={opt}
                                checked={absensiState[s.nisn] === opt}
                                onChange={() =>
                                  setAbsensiState((p) => ({ ...p, [s.nisn]: opt }))
                                }
                                className="sr-only"
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Keterangan (opsional)"
                          value={keteranganState[s.nisn] || ""}
                          onChange={(e) =>
                            setKeteranganState((p) => ({ ...p, [s.nisn]: e.target.value }))
                          }
                          className="input text-xs py-1.5 w-full max-w-xs"
                          disabled={absensiState[s.nisn] === "Hadir" || !absensiState[s.nisn]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer — Simpan */}
          {absensiData?.siswa?.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <p className="text-xs text-gray-400">
                {Object.values(absensiState).filter(Boolean).length} / {absensiData.siswa.length} siswa sudah diisi
              </p>
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending || isFetching}
                className="btn-primary flex items-center gap-2"
              >
                {saveMutation.isPending ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {absensiData?.sudah_diisi ? "Perbarui Absensi" : "Simpan Absensi"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
