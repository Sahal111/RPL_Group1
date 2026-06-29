<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\SiswaKelas;
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
            'id_kelas_asal' => 'required|string|exists:kelas,id',
        ]);

        $kelasAsal = Kelas::findOrFail($request->id_kelas_asal);

        $siswaList = SiswaKelas::with('siswa')
            ->where('id_kelas', $request->id_kelas_asal)
            ->where('status_keluar', 'Aktif')
            ->orderBy('no_absen')
            ->get()
            ->map(fn($sk) => [
                'id'           => $sk->id,
                'nisn'         => $sk->nisn,
                'no_absen'     => $sk->no_absen,
                'nama_lengkap' => $sk->siswa?->nama_lengkap,
                'jenis_kelamin'=> $sk->siswa?->jenis_kelamin,
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
            'id_kelas_asal'   => 'required|string|exists:kelas,id',
            'id_kelas_tujuan' => 'required|string|exists:kelas,id|different:id_kelas_asal',
        ]);

        $idAsal   = $request->id_kelas_asal;
        $idTujuan = $request->id_kelas_tujuan;

        $kelasTujuan = Kelas::findOrFail($idTujuan);

        // Ambil semua siswa aktif di kelas asal
        $siswaAktif = SiswaKelas::where('id_kelas', $idAsal)
            ->where('status_keluar', 'Aktif')
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

            foreach ($siswaAktif as $sk) {
                // Cek apakah siswa sudah ada di kelas tujuan (aktif)
                $sudahAda = SiswaKelas::where('id_kelas', $idTujuan)
                    ->where('nisn', $sk->nisn)
                    ->where('status_keluar', 'Aktif')
                    ->exists();

                if ($sudahAda) {
                    $dilewati++;
                    continue;
                }

                // 1. Tandai record lama sebagai keluar dengan status 'Naik Kelas'
                $sk->update([
                    'status_keluar'  => 'Naik Kelas',
                    'tanggal_keluar' => $tanggalProses,
                    'alasan_keluar'  => 'Naik kelas massal ke ' . $kelasTujuan->nama_kelas,
                ]);

                // 2. Buat record baru di kelas tujuan
                // Ambil tahun ajaran & semester dari kelas tujuan
                $taTujuan = DB::table('tahun_ajaran')
                    ->find($kelasTujuan->id_tahun_ajaran);

                SiswaKelas::create([
                    'nisn'          => $sk->nisn,
                    'id_kelas'      => $idTujuan,
                    'no_absen'      => $noAbsenUrut,
                    'semester'      => $kelasTujuan->semester,
                    'tahun_ajaran'  => $taTujuan?->nama ?? $kelasTujuan->id_tahun_ajaran,
                    'status_masuk'  => 'Naik Kelas',
                    'tanggal_masuk' => $tanggalProses,
                    'status_keluar' => 'Aktif',
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
