import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../../lib/axios";
import toast from "react-hot-toast";

/* ─── Modal Konfirmasi ─────────────────────────────────────────── */
function ModalKonfirmasi({
  open,
  onClose,
  onConfirm,
  kelasAsal,
  kelasTujuan,
  total,
  loading,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-[#bfc9c4]/30 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#00342b] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[22px]">
                upgrade
              </span>
            </div>
            <div>
              <h2 className="text-white font-extrabold text-[17px] font-headline-card">
                Konfirmasi Naik Kelas
              </h2>
              <p className="text-[#afefdd] text-[11px]">
                Proses ini tidak dapat dibatalkan
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-[#3f4945] text-sm">
            Anda akan memindahkan{" "}
            <strong className="text-[#00342b]">{total} siswa</strong> secara
            massal:
          </p>
          <div className="flex items-center gap-3 bg-[#f8faf9] rounded-2xl p-4 border border-[#bfc9c4]/30">
            <div className="flex-1 text-center">
              <p className="text-[10px] font-bold text-[#3f4945]/60 uppercase tracking-wider mb-1">
                Kelas Asal
              </p>
              <p className="font-extrabold text-[#00342b] text-[15px]">
                {kelasAsal}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#006e2a]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#006e2a] text-[18px]">
                arrow_forward
              </span>
            </div>
            <div className="flex-1 text-center">
              <p className="text-[10px] font-bold text-[#3f4945]/60 uppercase tracking-wider mb-1">
                Kelas Tujuan
              </p>
              <p className="font-extrabold text-[#006e2a] text-[15px]">
                {kelasTujuan}
              </p>
            </div>
          </div>
          <div className="bg-[#fff8f0] border border-[#f59e0b]/30 rounded-2xl p-3 flex gap-2.5">
            <span className="material-symbols-outlined text-[#f59e0b] text-[18px] shrink-0 mt-0.5">
              warning
            </span>
            <p className="text-[#92400e] text-xs leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Pastikan kelas tujuan sudah
              benar sebelum melanjutkan.
            </p>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-full border border-[#bfc9c4]/50 text-[#3f4945] font-bold text-xs uppercase tracking-wider hover:bg-[#eceeed] transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-full bg-[#006e2a] hover:bg-[#00531e] text-white font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-[#006e2a]/30 disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
                Memproses...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">
                  upgrade
                </span>
                Proses Sekarang
              </>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm mx-4 overflow-hidden border border-[#bfc9c4]/30 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#006e2a] px-6 py-7 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <span
              className="material-symbols-outlined text-white text-[36px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <h2 className="text-white font-extrabold text-[20px] font-headline-card">
            Berhasil!
          </h2>
        </div>
        <div className="p-6 space-y-4 text-center">
          <p className="text-[#3f4945] text-sm">{hasil.message}</p>
          <div className="flex justify-center gap-8 pt-2">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-[#006e2a] font-headline-card">
                {hasil.berhasil}
              </p>
              <p className="text-xs font-bold text-[#3f4945]/60 uppercase tracking-wider mt-1">
                Dipindah
              </p>
            </div>
            {hasil.dilewati > 0 && (
              <div className="text-center">
                <p className="text-4xl font-extrabold text-[#f59e0b] font-headline-card">
                  {hasil.dilewati}
                </p>
                <p className="text-xs font-bold text-[#3f4945]/60 uppercase tracking-wider mt-1">
                  Dilewati
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-[#00342b] hover:bg-[#004d40] text-white font-black text-xs uppercase tracking-wider transition shadow-md"
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

  const { data: kelasList = [] } = useQuery({
    queryKey: ["kelas-dropdown"],
    queryFn: () =>
      api.get("/operator/master-data/kelas/dropdown").then((r) => r.data.data),
  });

  const { data: preview, isFetching: loadingPreview } = useQuery({
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

  const inputCls =
    "w-full px-4 py-2.5 bg-[#f8faf9] border border-[#bfc9c4]/40 rounded-xl text-sm text-[#111827] focus:ring-2 focus:ring-[#006e2a]/20 focus:border-[#006e2a] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  const stepCls = (active) =>
    `flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
      active
        ? "bg-[#006e2a]/10 text-[#006e2a] border border-[#006e2a]/20"
        : "bg-[#eceeed] text-[#3f4945]/60"
    }`;

  return (
    <div className="min-h-screen space-y-8 animate-fade-up">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#94d3c1]/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-[#caead6]/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center gap-2">
            <div className="px-4 py-1.5 rounded-full bg-[#006e2a]/10 border border-[#006e2a]/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#006e2a]" />
              <span className="font-label-badge text-[10px] text-[#006e2a] tracking-[0.2em] uppercase font-black">
                MODUL AKADEMIK
              </span>
            </div>
          </div>
          <h1 className="font-headline-section text-3xl sm:text-4xl text-[#00342b] font-extrabold leading-tight tracking-tight">
            Naik Kelas{" "}
            <span className="font-serif-accent italic text-[#006e2a] font-normal">
              Massal
            </span>
          </h1>
          <p className="text-sm text-[#3f4945]/80 max-w-xl leading-relaxed">
            Pindahkan seluruh siswa dari kelas asal ke kelas tujuan secara
            massal dalam satu langkah.
          </p>
        </div>

        {/* ── Step Indicator ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={stepCls(!!kelasAsal)}>
            <span
              className={`w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-black ${kelasAsal ? "bg-[#006e2a]" : "bg-[#bfc9c4]"}`}
            >
              1
            </span>
            Pilih Kelas Asal
          </div>
          <span className="material-symbols-outlined text-[#bfc9c4] text-[18px]">
            chevron_right
          </span>
          <div className={stepCls(!!kelasTujuan)}>
            <span
              className={`w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-black ${kelasTujuan ? "bg-[#006e2a]" : "bg-[#bfc9c4]"}`}
            >
              2
            </span>
            Pilih Kelas Tujuan
          </div>
          <span className="material-symbols-outlined text-[#bfc9c4] text-[18px]">
            chevron_right
          </span>
          <div className={stepCls(bisaProses)}>
            <span
              className={`w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-black ${bisaProses ? "bg-[#006e2a]" : "bg-[#bfc9c4]"}`}
            >
              3
            </span>
            Proses
          </div>
        </div>

        {/* ── Form Panel ── */}
        <div className="bg-white/85 backdrop-blur-md border border-white/60 rounded-[2.5rem] shadow-xl p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kelas Asal */}
            <div>
              <label className="block text-xs font-bold text-[#00342b] uppercase tracking-wider mb-1.5">
                Kelas Asal <span className="text-[#ba1a1a]">*</span>
              </label>
              <select
                value={kelasAsal}
                onChange={(e) => {
                  setKelasAsal(e.target.value);
                  setKelasTujuan("");
                }}
                className={inputCls}
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
              <label className="block text-xs font-bold text-[#00342b] uppercase tracking-wider mb-1.5">
                Kelas Tujuan <span className="text-[#ba1a1a]">*</span>
              </label>
              <select
                value={kelasTujuan}
                onChange={(e) => setKelasTujuan(e.target.value)}
                disabled={!kelasAsal}
                className={inputCls}
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
                <p className="text-[11px] text-[#3f4945]/50 mt-1">
                  Pilih kelas asal terlebih dahulu
                </p>
              )}
            </div>
          </div>

          {/* Tombol Proses */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowKonfirmasi(true)}
              disabled={!bisaProses}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#006e2a] hover:bg-[#00531e] text-white font-black text-xs uppercase tracking-widest transition shadow-xl shadow-[#006e2a]/30 hover:shadow-[#006e2a]/50 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
            >
              <span className="material-symbols-outlined text-[18px]">
                upgrade
              </span>
              Proses Naik Kelas
            </button>
          </div>
        </div>

        {/* ── Preview Siswa ── */}
        {kelasAsal && (
          <div className="bg-white/85 backdrop-blur-md border border-white/60 rounded-[2.5rem] shadow-xl overflow-hidden">
            <div className="px-6 sm:px-8 py-5 border-b border-[#bfc9c4]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#006e2a]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#006e2a] text-[18px]">
                    groups
                  </span>
                </div>
                <div>
                  <h2 className="font-headline-card text-[16px] font-extrabold text-[#00342b]">
                    Preview Siswa — {namaKelasAsal}
                  </h2>
                  <p className="text-[11px] text-[#3f4945]/60">
                    Siswa yang akan dipindahkan
                  </p>
                </div>
              </div>
              {!loadingPreview && totalSiswa > 0 && (
                <span className="px-4 py-1.5 rounded-full bg-[#006e2a]/10 text-[#006e2a] text-xs font-extrabold border border-[#006e2a]/20">
                  {totalSiswa} siswa
                </span>
              )}
            </div>

            {loadingPreview ? (
              <div className="flex items-center justify-center py-16 gap-3 text-[#3f4945]/50">
                <span className="material-symbols-outlined text-[22px] animate-spin">
                  progress_activity
                </span>
                <span className="text-sm">Memuat data siswa...</span>
              </div>
            ) : siswaTampil.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#3f4945]/50 gap-3">
                <span className="material-symbols-outlined text-5xl text-[#bfc9c4]">
                  group_off
                </span>
                <p className="font-semibold text-sm">
                  Tidak ada siswa aktif di kelas ini
                </p>
                <p className="text-xs">
                  Pilih kelas lain atau tambah siswa terlebih dahulu.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#bfc9c4]/20 bg-[#f8faf9]">
                      <th className="py-3.5 px-6 text-[11px] font-extrabold text-[#3f4945]/60 uppercase tracking-widest w-16 text-center">
                        No.
                      </th>
                      <th className="py-3.5 px-4 text-[11px] font-extrabold text-[#3f4945]/60 uppercase tracking-widest">
                        NISN
                      </th>
                      <th className="py-3.5 px-4 text-[11px] font-extrabold text-[#3f4945]/60 uppercase tracking-widest">
                        Nama Lengkap
                      </th>
                      <th className="py-3.5 px-4 text-[11px] font-extrabold text-[#3f4945]/60 uppercase tracking-widest">
                        Jenis Kelamin
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#bfc9c4]/15">
                    {siswaTampil.map((s) => (
                      <tr
                        key={s.nisn}
                        className="hover:bg-[#006e2a]/4 transition-colors"
                      >
                        <td className="py-4 px-6 text-center">
                          <span className="text-sm font-bold text-[#3f4945]/60">
                            {s.no_absen}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-mono text-[13px] text-[#3f4945]/80">
                            {s.nisn}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-[#00342b] text-sm">
                            {s.nama_lengkap}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                              s.jenis_kelamin === "L"
                                ? "bg-[#006e2a]/10 text-[#006e2a] border border-[#006e2a]/20"
                                : "bg-[#f472b6]/10 text-[#9d174d] border border-[#f472b6]/20"
                            }`}
                          >
                            {s.jenis_kelamin === "L"
                              ? "Laki-laki"
                              : "Perempuan"}
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
      </div>

      {/* ── Modals ── */}
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
