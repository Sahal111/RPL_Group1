<?php

namespace App\Http\Controllers\Kepsek;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\Absensi;
use App\Models\Siswa;
use App\Models\User;
use App\Models\SiswaKelas;
use Illuminate\Http\Request;

class KepsekController extends Controller
{
    // -------------------------------------------------------
    // DASHBOARD SUMMARY
    // -------------------------------------------------------
    public function dashboard()
    {
        $today = now()->toDateString();

        $totalSiswa = Siswa::where('status_pd', 'Aktif')->count();
        $totalKelas = Kelas::where('is_active', 1)->count();
        $totalGuru = User::where('role_id', 2)->where('is_active', 1)->count();

        // Rekap absensi hari ini semua kelas
        $absensiHariIni = Absensi::where('tanggal', $today)->get();
        $kelasYangSudahAbsen = Absensi::where('tanggal', $today)
            ->distinct('id_kelas')
            ->count('id_kelas');

        return response()->json([
            'success' => true,
            'data' => [
                'total_siswa' => $totalSiswa,
                'total_kelas' => $totalKelas,
                'total_guru' => $totalGuru,
                'hari_ini' => [
                    'tanggal' => $today,
                    'kelas_sudah_absen' => $kelasYangSudahAbsen,
                    'kelas_belum_absen' => $totalKelas - $kelasYangSudahAbsen,
                    'total_hadir' => $absensiHariIni->where('status', 'Hadir')->count(),
                    'total_sakit' => $absensiHariIni->where('status', 'Sakit')->count(),
                    'total_izin' => $absensiHariIni->where('status', 'Izin')->count(),
                    'total_alpa' => $absensiHariIni->where('status', 'Alpa')->count(),
                ],
            ],
        ]);
    }

    // -------------------------------------------------------
    // REKAP SEMUA KELAS (untuk kepsek monitoring)
    // -------------------------------------------------------
    public function rekapSemuaKelas(Request $request)
    {
        $request->validate([
            'dari' => 'required|date',
            'sampai' => 'required|date|after_or_equal:dari',
        ]);

        $kelasList = Kelas::where('is_active', 1)->get();

        $rekap = $kelasList->map(function ($kelas) use ($request) {
            $totalSiswa = SiswaKelas::where('id_kelas', $kelas->id)
                ->whereNull('status_keluar')
                ->count();

            $absensi = Absensi::where('id_kelas', $kelas->id)
                ->whereBetween('tanggal', [$request->dari, $request->sampai])
                ->get();

            $hariEfektif = $absensi->unique('tanggal')->count();

            return [
                'id_kelas' => $kelas->id,
                'nama_kelas' => $kelas->nama_kelas,
                'tingkat' => $kelas->tingkat,
                'total_siswa' => $totalSiswa,
                'hari_efektif' => $hariEfektif,
                'total_hadir' => $absensi->where('status', 'Hadir')->count(),
                'total_sakit' => $absensi->where('status', 'Sakit')->count(),
                'total_izin' => $absensi->where('status', 'Izin')->count(),
                'total_alpa' => $absensi->where('status', 'Alpa')->count(),
                'persentase_kehadiran' => $absensi->count() > 0
                    ? round($absensi->where('status', 'Hadir')->count() / $absensi->count() * 100, 1)
                    : 0,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'periode' => [
                    'dari' => $request->dari,
                    'sampai' => $request->sampai,
                ],
                'rekap' => $rekap,
            ],
        ]);
    }

    // -------------------------------------------------------
    // SISWA DENGAN ALPA TERBANYAK (monitoring)
    // -------------------------------------------------------
    public function siswaAlpaTerbanyak(Request $request)
    {
        $request->validate([
            'dari' => 'required|date',
            'sampai' => 'required|date|after_or_equal:dari',
            'limit' => 'nullable|integer|between:5,50',
        ]);

        $limit = $request->limit ?? 10;

        $data = Absensi::with('siswa')
            ->where('status', 'Alpa')
            ->whereBetween('tanggal', [$request->dari, $request->sampai])
            ->select('nisn', \DB::raw('COUNT(*) as total_alpa'))
            ->groupBy('nisn')
            ->orderByDesc('total_alpa')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'nisn' => $item->nisn,
                    'nama_lengkap' => $item->siswa?->nama_lengkap,
                    'total_alpa' => $item->total_alpa,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}