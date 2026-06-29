import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../../lib/axios";
import toast from "react-hot-toast";
import {
  ArrowRight,
  ArrowUpCircle,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Loader2,
} from "lucide-react";

/* ─── Modal Konfirmasi ─────────────────────────────────────────── */
function ModalKonfirmasi({ open, onClose, onConfirm, kelasAsal, kelasTujuan, total, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <ArrowUpCircle className="text-white" size={24} />
            <h2 className="text-white font-bold text-lg">Konfirmasi Naik Kelas</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-sm">
            Anda akan memindahkan <strong>{total} siswa</strong> secara massal:
          </p>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-500 mb-1">Kelas Asal</p>
              <p className="font-bold text-gray-800">{kelasAsal}</p>
            </div>
            <ArrowRight className="text-blue-500 shrink-0" size={20} />
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-500 mb-1">Kelas Tujuan</p>
              <p className="font-bold text-blue-700">{kelasTujuan}</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-700 text-xs">
              Tindakan ini tidak dapat dibatalkan. Pastikan kelas tujuan sudah benar.
            </p>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Memproses...</>
            ) : (
              <><ArrowUpCircle size={16} /> Proses Sekarang</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal Hasil ──────────────────────────────────────────────── */
function ModalHasil({ open, onClose, hasil }) {
  if (!open || !hasil) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 flex flex-col items-center">
          <CheckCircle2 className="text-white mb-2" size={40} />
          <h2 className="text-white font-bold text-lg">Berhasil!</h2>
        </div>
        <div className="p-6 space-y-3 text-center">
          <p className="text-gray-600 text-sm">{hasil.message}</p>
          <div className="flex justify-center gap-6 pt-2">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{hasil.berhasil}</p>
              <p className="text-xs text-gray-500">Dipindah</p>
            </div>
            {hasil.dilewati > 0 && (
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-500">{hasil.dilewati}</p>
                <p className="text-xs text-gray-500">Dilewati</p>
              </div>
            )}
          </div>
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Halaman Utama ────────────────────────────────────────────── */
export default function NaikKelas() {
  const [kelasAsal, setKelasAsal] = useState("");
  const [kelasTujuan, setKelasTujuan] = useState("");
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [hasilProses, setHasilProses] = useState(null);
  const [showHasil, setShowHasil] = useState(false);

  /* Dropdown semua kelas aktif */
  const { data: kelasList = [] } = useQuery({
    queryKey: ["kelas-dropdown"],
    queryFn: () =>
      api.get("/operator/master-data/kelas/dropdown").then((r) => r.data.data),
  });

  /* Preview siswa di kelas asal */
  const {
    data: preview,
    isFetching: loadingPreview,
    refetch: fetchPreview,
  } = useQuery({
    queryKey: ["naik-kelas-preview", kelasAsal],
    queryFn: () =>
      api
        .get("/operator/master-data/naik-kelas/preview", {
          params: { id_kelas_asal: kelasAsal },
        })
        .then((r) => r.data),
    enabled: !!kelasAsal,
    retry: false,
  });

  /* Mutasi proses */
  const prosesMutation = useMutation({
    mutationFn: () =>
      api.post("/operator/master-data/naik-kelas/proses", {
        id_kelas_asal: kelasAsal,
        id_kelas_tujuan: kelasTujuan,
      }),
    onSuccess: (res) => {
      setShowKonfirmasi(false);
      setHasilProses(res.data);
      setShowHasil(true);
      // Reset state
      setKelasAsal("");
      setKelasTujuan("");
    },
    onError: (err) => {
      setShowKonfirmasi(false);
      toast.error(err.response?.data?.message ?? "Gagal memproses naik kelas.");
    },
  });

  const namaKelasAsal =
    kelasList.find((k) => k.id === kelasAsal)?.nama_kelas ?? "-";
  const namaKelasTujuan =
    kelasList.find((k) => k.id === kelasTujuan)?.nama_kelas ?? "-";

  const siswaTampil = preview?.data ?? [];
  const totalSiswa = preview?.total ?? 0;
  const bisaProses =
    kelasAsal && kelasTujuan && kelasAsal !== kelasTujuan && totalSiswa > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ArrowUpCircle className="text-blue-600" size={28} />
          Naik Kelas Massal
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Pindahkan seluruh siswa dari kelas asal ke kelas tujuan secara massal.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-colors ${kelasAsal ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
          Pilih Kelas Asal
        </div>
        <ChevronRight size={16} className="text-gray-400" />
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-colors ${kelasTujuan ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
          <span className={`w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold ${kelasTujuan ? "bg-blue-600" : "bg-gray-400"}`}>2</span>
          Pilih Kelas Tujuan
        </div>
        <ChevronRight size={16} className="text-gray-400" />
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-colors ${bisaProses ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
          <span className={`w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold ${bisaProses ? "bg-blue-600" : "bg-gray-400"}`}>3</span>
          Proses
        </div>
      </div>

      {/* Panel Utama */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Kelas Asal */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Kelas Asal <span className="text-red-500">*</span>
            </label>
            <select
              value={kelasAsal}
              onChange={(e) => {
                setKelasAsal(e.target.value);
                setKelasTujuan("");
              }}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">-- Pilih kelas asal --</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_kelas} (Tingkat {k.tingkat})
                </option>
              ))}
            </select>
          </div>

          {/* Kelas Tujuan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Kelas Tujuan <span className="text-red-500">*</span>
            </label>
            <select
              value={kelasTujuan}
              onChange={(e) => setKelasTujuan(e.target.value)}
              disabled={!kelasAsal}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">-- Pilih kelas tujuan --</option>
              {kelasList
                .filter((k) => k.id !== kelasAsal)
                .map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kelas} (Tingkat {k.tingkat})
                  </option>
                ))}
            </select>
            {!kelasAsal && (
              <p className="text-xs text-gray-400 mt-1">Pilih kelas asal terlebih dahulu</p>
            )}
          </div>
        </div>

        {/* Tombol Proses */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowKonfirmasi(true)}
            disabled={!bisaProses}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <ArrowUpCircle size={18} />
            Proses Naik Kelas
          </button>
        </div>
      </div>

      {/* Preview Siswa */}
      {kelasAsal && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              <h2 className="font-semibold text-gray-800">
                Preview Siswa — {namaKelasAsal}
              </h2>
            </div>
            {!loadingPreview && (
              <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                {totalSiswa} siswa
              </span>
            )}
          </div>

          {loadingPreview ? (
            <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              <span>Memuat data siswa...</span>
            </div>
          ) : siswaTampil.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Users size={40} className="mb-3 opacity-30" />
              <p className="font-medium">Tidak ada siswa aktif di kelas ini</p>
              <p className="text-sm mt-1">Pilih kelas lain atau tambah siswa ke kelas ini terlebih dahulu.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">No. Absen</th>
                    <th className="px-4 py-3 text-left">NISN</th>
                    <th className="px-4 py-3 text-left">Nama Lengkap</th>
                    <th className="px-4 py-3 text-left">Jenis Kelamin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {siswaTampil.map((s, i) => (
                    <tr key={s.nisn} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-center font-medium text-gray-500">
                        {s.no_absen}
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-600">{s.nisn}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{s.nama_lengkap}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.jenis_kelamin === "L"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-pink-50 text-pink-700"
                        }`}>
                          {s.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ModalKonfirmasi
        open={showKonfirmasi}
        onClose={() => setShowKonfirmasi(false)}
        onConfirm={() => prosesMutation.mutate()}
        kelasAsal={namaKelasAsal}
        kelasTujuan={namaKelasTujuan}
        total={totalSiswa}
        loading={prosesMutation.isPending}
      />
      <ModalHasil
        open={showHasil}
        onClose={() => setShowHasil(false)}
        hasil={hasilProses}
      />
    </div>
  );
}
