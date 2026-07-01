<?php

namespace App\Http\Controllers\Kepsek;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\Absensi;
use App\Models\Siswa;
use App\Models\User;
use App\Models\SiswaKelas;
use App\Models\MataPelajaran;
use App\Models\Pengumuman;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;
use Carbon\Carbon;

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
        $totalGuru  = User::where('role_id', 2)->where('is_active', 1)->count();
        $totalMapel = MataPelajaran::where('is_active', 1)->count();

        // Rekap absensi hari ini semua kelas
        $absensiHariIni = Absensi::where('tanggal', $today)->get();
        $kelasYangSudahAbsen = Absensi::where('tanggal', $today)
            ->distinct('id_kelas')
            ->pluck('id_kelas');

        // -------------------------------------------------------
        // GRAFIK KEHADIRAN 7 HARI TERAKHIR
        // -------------------------------------------------------
        $mulai = Carbon::today()->subDays(6);
        $absensi7Hari = Absensi::whereBetween('tanggal', [$mulai->toDateString(), $today])->get();

        $grafikKehadiran = [];
        for ($i = 0; $i < 7; $i++) {
            $tgl = $mulai->copy()->addDays($i)->toDateString();
            $dataHari = $absensi7Hari->filter(fn($a) => $a->tanggal->format('Y-m-d') === $tgl);

            $grafikKehadiran[] = [
                'tanggal' => $tgl,
                'label' => Carbon::parse($tgl)->translatedFormat('D, d M'),
                'hadir' => $dataHari->where('status', 'Hadir')->count(),
                'sakit' => $dataHari->where('status', 'Sakit')->count(),
                'izin' => $dataHari->where('status', 'Izin')->count(),
                'alpa' => $dataHari->where('status', 'Alpa')->count(),
            ];
        }

        // -------------------------------------------------------
        // PENGUMUMAN TERBARU (5 terakhir)
        // -------------------------------------------------------
        $pengumumanTerbaru = Pengumuman::with('penulis:id,nama_lengkap')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'judul' => $p->judul,
                'kategori' => $p->kategori,
                'ringkasan' => \Str::limit(strip_tags($p->konten), 100),
                'penulis' => $p->penulis?->nama_lengkap,
                'tanggal' => $p->created_at?->translatedFormat('d M Y'),
            ]);

        // -------------------------------------------------------
        // KALENDER AKADEMIK (dari tahun_ajaran aktif + pengumuman event)
        // -------------------------------------------------------
        $tahunAjaranAktif = TahunAjaran::where('is_active', 1)->first();

        $agendaDariPengumuman = Pengumuman::whereIn('kategori', ['Libur', 'Jadwal Ujian', 'Rapat'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'judul', 'kategori', 'created_at']);

        $kalenderAkademik = [
            'tahun_ajaran_aktif' => $tahunAjaranAktif ? [
                'nama' => $tahunAjaranAktif->nama,
                'mulai' => $tahunAjaranAktif->tanggal_mulai,
                'selesai' => $tahunAjaranAktif->tanggal_selesai,
            ] : null,
            'agenda' => $agendaDariPengumuman,
        ];

        // -------------------------------------------------------
        // NOTIFIKASI PENTING (di-generate otomatis)
        // -------------------------------------------------------
        $notifikasi = [];

        $kelasBelumAbsen = Kelas::where('is_active', 1)
            ->whereNotIn('id', $kelasYangSudahAbsen)
            ->pluck('nama_kelas');

        if ($kelasBelumAbsen->isNotEmpty()) {
            $notifikasi[] = [
                'tipe' => 'warning',
                'pesan' => 'Kelas belum mengisi absensi hari ini: ' . $kelasBelumAbsen->implode(', '),
            ];
        }

        $alpaMingguIni = Absensi::where('status', 'Alpa')
            ->whereBetween('tanggal', [$mulai->toDateString(), $today])
            ->select('nisn', \DB::raw('COUNT(*) as total'))
            ->groupBy('nisn')
            ->having('total', '>=', 3)
            ->with('siswa:nisn,nama_lengkap')
            ->get();

        foreach ($alpaMingguIni as $item) {
            $notifikasi[] = [
                'tipe' => 'danger',
                'pesan' => ($item->siswa?->nama_lengkap ?? $item->nisn) . " sudah alpa {$item->total}x dalam 7 hari terakhir.",
            ];
        }

        if (empty($notifikasi)) {
            $notifikasi[] = [
                'tipe' => 'info',
                'pesan' => 'Tidak ada hal mendesak yang perlu perhatian saat ini.',
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'total_siswa' => $totalSiswa,
                'total_kelas' => $totalKelas,
                'total_guru' => $totalGuru,
                'total_mapel' => $totalMapel,
                'hari_ini' => [
                    'tanggal' => $today,
                    'kelas_sudah_absen' => $kelasYangSudahAbsen->count(),
                    'kelas_belum_absen' => $totalKelas - $kelasYangSudahAbsen->count(),
                    'total_hadir' => $absensiHariIni->where('status', 'Hadir')->count(),
                    'total_sakit' => $absensiHariIni->where('status', 'Sakit')->count(),
                    'total_izin' => $absensiHariIni->where('status', 'Izin')->count(),
                    'total_alpa' => $absensiHariIni->where('status', 'Alpa')->count(),
                ],
                'grafik_kehadiran' => $grafikKehadiran,
                'pengumuman_terbaru' => $pengumumanTerbaru,
                'kalender_akademik' => $kalenderAkademik,
                'notifikasi' => $notifikasi,
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