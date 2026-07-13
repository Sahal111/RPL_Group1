<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\RiwayatKelas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NaikKelasController extends Controller
{
    /**
     * Preview: ambil daftar siswa aktif di kelas asal.
     */
    public function preview(Request $request)
    {
        $request->validate([
            'kelas_id_asal' => 'required|string|exists:kelas,id',
        ]);

        $kelasAsal = Kelas::findOrFail($request->kelas_id_asal);

        $siswaList = RiwayatKelas::with('siswa')
            ->where('kelas_id', $request->kelas_id_asal)
            ->aktif()
            ->orderBy('no_absen')
            ->get()
            ->map(fn($rk) => [
                'id'            => $rk->id,
                'siswa_id'      => $rk->siswa_id,
                'nisn'          => $rk->siswa?->nisn,
                'no_absen'      => $rk->no_absen,
                'nama'          => $rk->siswa?->nama,
                'jenis_kelamin' => $rk->siswa?->jenis_kelamin,
            ]);

        return response()->json([
            'success'    => true,
            'kelas_asal' => $kelasAsal,
            'total'      => $siswaList->count(),
            'data'       => $siswaList,
        ]);
    }

    /**
     * Proses naik kelas massal dalam satu transaksi.
     */
    public function proses(Request $request)
    {
        $request->validate([
            'kelas_id_asal'   => 'required|string|exists:kelas,id',
            'kelas_id_tujuan' => 'required|string|exists:kelas,id|different:kelas_id_asal',
        ]);

        $idAsal      = $request->kelas_id_asal;
        $idTujuan    = $request->kelas_id_tujuan;
        $kelasTujuan = Kelas::findOrFail($idTujuan);

        // Ambil semua siswa aktif di kelas asal
        $siswaAktif = RiwayatKelas::where('kelas_id', $idAsal)
            ->aktif()
            ->orderBy('no_absen')
            ->get();

        if ($siswaAktif->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada siswa aktif di kelas asal.',
            ], 422);
        }

        $tanggalProses = now()->toDateString();
        $berhasil      = 0;
        $dilewati      = 0;

        DB::transaction(function () use (
            $siswaAktif, $idAsal, $idTujuan, $kelasTujuan,
            $tanggalProses, &$berhasil, &$dilewati
        ) {
            $noAbsenUrut = 1;

            foreach ($siswaAktif as $rk) {
                // Cek apakah siswa sudah ada di kelas tujuan (aktif)
                $sudahAda = RiwayatKelas::where('kelas_id', $idTujuan)
                    ->where('siswa_id', $rk->siswa_id)
                    ->aktif()
                    ->exists();

                if ($sudahAda) {
                    $dilewati++;
                    continue;
                }

                // 1. Tutup record lama (tandai tanggal_keluar + jenis_perubahan)
                $rk->update([
                    'tanggal_keluar'  => $tanggalProses,
                    'jenis_perubahan' => 'naik_kelas',
                    'catatan'         => 'Naik kelas massal ke ' . $kelasTujuan->nama_kelas,
                ]);

                // 2. Buat record baru di kelas tujuan
                RiwayatKelas::create([
                    'siswa_id'        => $rk->siswa_id,
                    'kelas_id'        => $idTujuan,
                    'tahun_ajaran_id' => $kelasTujuan->tahun_ajaran_id,
                    'no_absen'        => $noAbsenUrut,
                    'tanggal_masuk'   => $tanggalProses,
                    'jenis_perubahan' => 'naik_kelas',
                ]);

                $noAbsenUrut++;
                $berhasil++;
            }
        });

        return response()->json([
            'success'  => true,
            'message'  => "Proses naik kelas selesai. {$berhasil} siswa berhasil dipindah" .
                          ($dilewati > 0 ? ", {$dilewati} siswa dilewati (sudah ada di kelas tujuan)." : "."),
            'berhasil' => $berhasil,
            'dilewati' => $dilewati,
        ]);
    }
}
