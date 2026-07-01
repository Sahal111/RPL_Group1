<?php

namespace App\Http\Controllers\Kepsek;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\Absensi;
use App\Models\Siswa;
use App\Models\Guru;
use App\Models\JadwalPelajaran;
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
        $totalGuru = User::where('role_id', 2)->where('is_active', 1)->count();
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

    // -------------------------------------------------------
    // DAFTAR GURU (read-only, khusus kepsek)
    // -------------------------------------------------------
    public function daftarGuru(Request $request)
    {
        $query = Guru::query()
            ->when($request->search, function ($q) use ($request) {
                $q->where('nama_lengkap', 'like', "%{$request->search}%")
                    ->orWhere('nuptk', 'like', "%{$request->search}%")
                    ->orWhere('nip', 'like', "%{$request->search}%");
            })
            ->when($request->jenis_ptk, function ($q) use ($request) {
                $q->where('jenis_ptk', $request->jenis_ptk);
            })
            ->when($request->status_aktif !== null && $request->status_aktif !== '', function ($q) use ($request) {
                $q->where('is_active', $request->status_aktif);
            })
            ->orderBy('nama_lengkap')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $query,
        ]);
    }

    // -------------------------------------------------------
    // DETAIL GURU (read-only, khusus kepsek) + mapel yang diampu
    // -------------------------------------------------------
    public function detailGuru($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $mapelDiampu = JadwalPelajaran::with(['mataPelajaran', 'kelas'])
            ->where('nuptk', $nuptk)
            ->get()
            ->groupBy('id_mapel')
            ->map(function ($items) {
                $first = $items->first();
                return [
                    'id_mapel' => $first->id_mapel,
                    'nama_mapel' => $first->mataPelajaran?->nama_mapel,
                    'kode_mapel' => $first->mataPelajaran?->kode_mapel,
                    'kelas_diampu' => $items->pluck('kelas.nama_kelas')->filter()->unique()->values(),
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'guru' => $guru,
                'mata_pelajaran_diampu' => $mapelDiampu,
            ],
        ]);
    }

    // -------------------------------------------------------
    // DAFTAR SISWA (read-only, khusus kepsek)
    // -------------------------------------------------------
    public function daftarSiswa(Request $request)
    {
        $query = Siswa::query()
            ->when($request->search, function ($q) use ($request) {
                $q->where('nama_lengkap', 'like', "%{$request->search}%")
                    ->orWhere('nisn', 'like', "%{$request->search}%")
                    ->orWhere('nik', 'like', "%{$request->search}%");
            })
            ->when($request->id_kelas, function ($q) use ($request) {
                $q->whereHas('kelasAktif', function ($subQ) use ($request) {
                    $subQ->where('siswa_kelas.id_kelas', $request->id_kelas)
                        ->whereNull('siswa_kelas.status_keluar')
                        ->where('kelas.is_active', 1);
                });
            })
            ->when($request->status_pd, function ($q) use ($request) {
                $q->where('status_pd', $request->status_pd);
            })
            ->when($request->jenis_kelamin, function ($q) use ($request) {
                $q->where('jenis_kelamin', $request->jenis_kelamin);
            })
            ->with(['kelasAktif' => function ($q) {
                $q->where('kelas.is_active', 1)
                  ->whereNull('siswa_kelas.status_keluar');
            }])
            ->orderBy('nama_lengkap')
            ->paginate($request->per_page ?? 15);

        // Transform data untuk menambahkan informasi kelas aktif
        $query->getCollection()->transform(function ($siswa) {
            $kelasAktif = $siswa->kelasAktif->first();
            
            $siswa->kelas_aktif = $kelasAktif ? [
                'id_kelas' => $kelasAktif->id,
                'nama_kelas' => $kelasAktif->nama_kelas,
                'tingkat' => $kelasAktif->tingkat,
            ] : null;
            
            unset($siswa->kelasAktif);
            
            return $siswa;
        });

        return response()->json([
            'success' => true,
            'data' => $query,
        ]);
    }

    // -------------------------------------------------------
    // DETAIL SISWA (read-only, khusus kepsek)
    // -------------------------------------------------------
    public function detailSiswa($nisn)
    {
        $siswa = Siswa::with([
            'orangTua' => function ($q) {
                $q->select('orang_tua.*');
            },
            'kelasAktif' => function ($q) {
                $q->with(['tahunAjaran', 'wali']);
            }
        ])->where('nisn', $nisn)->firstOrFail();

        // Ambil kelas aktif dari relasi
        $kelasAktif = $siswa->kelasAktif->first();
        
        $siswa->kelas_aktif = $kelasAktif ? [
            'id_kelas' => $kelasAktif->id,
            'nama_kelas' => $kelasAktif->nama_kelas,
            'tingkat' => $kelasAktif->tingkat,
            'semester' => $kelasAktif->semester,
            'no_absen' => $kelasAktif->pivot->no_absen,
            'tahun_ajaran' => $kelasAktif->pivot->tahun_ajaran ?? $kelasAktif->tahunAjaran?->nama,
            'wali_kelas' => $kelasAktif->wali ? [
                'nuptk' => $kelasAktif->wali->nuptk,
                'nama' => $kelasAktif->wali->nama_lengkap,
            ] : null,
        ] : null;

        // Riwayat kelas (termasuk yang sudah keluar)
        $riwayatKelas = SiswaKelas::with(['kelas.tahunAjaran'])
            ->where('nisn', $nisn)
            ->orderBy('tanggal_masuk', 'desc')
            ->get()
            ->map(function ($sk) {
                return [
                    'id_kelas' => $sk->id_kelas,
                    'nama_kelas' => $sk->kelas?->nama_kelas,
                    'tingkat' => $sk->kelas?->tingkat,
                    'tahun_ajaran' => $sk->tahun_ajaran ?? $sk->kelas?->tahunAjaran?->nama,
                    'semester' => $sk->semester,
                    'no_absen' => $sk->no_absen,
                    'status_masuk' => $sk->status_masuk,
                    'tanggal_masuk' => $sk->tanggal_masuk,
                    'status_keluar' => $sk->status_keluar,
                    'tanggal_keluar' => $sk->tanggal_keluar,
                ];
            });

        // Statistik absensi (periode aktif)
        $tanggalMasuk = $kelasAktif?->pivot->tanggal_masuk ?? now()->startOfYear();
        $absensiStats = Absensi::where('nisn', $nisn)
            ->where('tanggal', '>=', $tanggalMasuk)
            ->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN status = "Hadir" THEN 1 ELSE 0 END) as hadir,
                SUM(CASE WHEN status = "Sakit" THEN 1 ELSE 0 END) as sakit,
                SUM(CASE WHEN status = "Izin" THEN 1 ELSE 0 END) as izin,
                SUM(CASE WHEN status = "Alpa" THEN 1 ELSE 0 END) as alpa
            ')
            ->first();

        $persentaseKehadiran = $absensiStats && $absensiStats->total > 0
            ? round(($absensiStats->hadir / $absensiStats->total) * 100, 1)
            : 0;

        // Data orang tua - kompilasi dari data ayah, ibu, dan wali
        $dataOrangTua = $siswa->orangTua->flatMap(function ($ortu) {
            $result = [];
            
            // Data Ayah
            if ($ortu->nama_ayah) {
                $result[] = [
                    'id_ortu' => $ortu->id,
                    'nik' => $ortu->nik_ayah,
                    'nama_lengkap' => $ortu->nama_ayah,
                    'hubungan' => 'Ayah',
                    'no_hp' => $ortu->no_hp_ayah,
                    'pekerjaan' => $ortu->pekerjaan_ayah,
                    'pendidikan' => $ortu->pendidikan_ayah,
                    'penghasilan' => $ortu->penghasilan_ayah,
                ];
            }
            
            // Data Ibu
            if ($ortu->nama_ibu) {
                $result[] = [
                    'id_ortu' => $ortu->id,
                    'nik' => $ortu->nik_ibu,
                    'nama_lengkap' => $ortu->nama_ibu,
                    'hubungan' => 'Ibu',
                    'no_hp' => $ortu->no_hp_ibu,
                    'pekerjaan' => $ortu->pekerjaan_ibu,
                    'pendidikan' => $ortu->pendidikan_ibu,
                    'penghasilan' => $ortu->penghasilan_ibu,
                ];
            }
            
            // Data Wali
            if ($ortu->nama_wali) {
                $result[] = [
                    'id_ortu' => $ortu->id,
                    'nik' => $ortu->nik_wali,
                    'nama_lengkap' => $ortu->nama_wali,
                    'hubungan' => $ortu->hubungan_wali ?? 'Wali',
                    'no_hp' => $ortu->no_hp_wali,
                    'pekerjaan' => $ortu->pekerjaan_wali,
                    'pendidikan' => null,
                    'penghasilan' => $ortu->penghasilan_wali,
                ];
            }
            
            return $result;
        });

        unset($siswa->orangTua);
        unset($siswa->kelasAktif);

        return response()->json([
            'success' => true,
            'data' => [
                'siswa' => $siswa,
                'orang_tua' => $dataOrangTua,
                'riwayat_kelas' => $riwayatKelas,
                'statistik_absensi' => [
                    'total' => $absensiStats?->total ?? 0,
                    'hadir' => $absensiStats?->hadir ?? 0,
                    'sakit' => $absensiStats?->sakit ?? 0,
                    'izin' => $absensiStats?->izin ?? 0,
                    'alpa' => $absensiStats?->alpa ?? 0,
                    'persentase_kehadiran' => $persentaseKehadiran,
                ],
            ],
        ]);
    }

    // -------------------------------------------------------
    // DAFTAR KELAS (untuk filter)
    // -------------------------------------------------------
    public function daftarKelasFilter()
    {
        $kelas = Kelas::where('is_active', 1)
            ->orderBy('tingkat')
            ->orderBy('nama_kelas')
            ->get(['id', 'nama_kelas', 'tingkat']);

        return response()->json([
            'success' => true,
            'data' => $kelas,
        ]);
    }
}