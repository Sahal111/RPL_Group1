<?php

namespace App\Http\Controllers\Absensi;

use App\Http\Controllers\Controller;
use App\Models\Absensi; // tabel: absensis
use App\Models\JadwalPelajaran; // tabel: jadwals
use App\Models\RiwayatKelas;
use App\Models\Kelas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AbsensiController extends Controller
{
    // -------------------------------------------------------
    // GET DAFTAR JADWAL PELAJARAN HARI INI untuk kelas
    // Guru membuka halaman absensi -> pilih jadwal pelajaran
    // -------------------------------------------------------
    public function jadwalHariIni(Request $request, $id_kelas)
    {
        $tanggal = $request->tanggal ?? now()->toDateString();
        $hari = \Carbon\Carbon::parse($tanggal)->locale('id')->isoFormat('dddd'); // Ambil hari dari tanggal yg dipilih

        $kelas = Kelas::findOrFail($id_kelas);

        // Ambil nama tahun ajaran dari DB berdasarkan id_tahun_ajaran di kelas
        $tahunAjaran = DB::table('tahun_ajarans')->find($kelas->tahun_ajaran_id);

        $query = JadwalPelajaran::with(['mataPelajaran', 'gurus'])
            ->where('kelas_id', $id_kelas)
            ->where('hari', $hari);

        if ($tahunAjaran) {
            $query->where('semester_id', $kelas->semester_id);
        }

        $rows = $query->orderBy('jam_mulai')->get();
        // ponytail: 1 query instead of N exists() di loop
        $sudahAbsenIds = Absensi::where('kelas_id', $id_kelas)
            ->where('tanggal', $tanggal)
            ->whereIn('jadwal_id', $rows->pluck('id'))
            ->distinct()
            ->pluck('jadwal_id')
            ->flip();

        $jadwal = $rows->map(function ($j) use ($sudahAbsenIds) {
            return [
                'id_jadwal' => $j->id,
                'nama_mapel' => $j->mataPelajaran->nama_mapel ?? '-',
                'kode_mapel' => $j->mataPelajaran->kode_mapel ?? '-',
                'gurus' => $j->guru->nama_lengkap ?? '-',
                'jam_mulai' => $j->jam_mulai,
                'jam_selesai' => $j->jam_selesai,
                'sudah_absen' => $sudahAbsenIds->has($j->id),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'kelas' => ['id' => $kelas->id, 'nama_kelas' => $kelas->nama_kelas],
                'hari' => $hari,
                'tanggal' => $tanggal,
                'jadwal' => $jadwal,
            ],
        ]);
    }

    // -------------------------------------------------------
    // GET DAFTAR SISWA + STATUS ABSENSI untuk jadwal tertentu
    // Guru memilih satu jadwal, lalu isi absensi
    // -------------------------------------------------------
    public function showKelas(Request $request, $id_kelas)
    {
        $tanggal = $request->tanggal ?? now()->toDateString();
        $id_jadwal = $request->id_jadwal; // bisa null (fallback mode harian)

        $kelas = Kelas::findOrFail($id_kelas);

        $siswaList = RiwayatKelas::with('siswa')
            ->where('kelas_id', $id_kelas)
            ->whereNull('tanggal_keluar')
            ->orderBy('no_absen')
            ->get();

        // Absensi yang sudah diisi untuk jadwal + tanggal ini
        $query = Absensi::where('kelas_id', $id_kelas)->where('tanggal', $tanggal);
        if ($id_jadwal) {
            $query->where('jadwal_id', $id_jadwal);
        } else {
            $query->whereNull('jadwal_id'); // fallback: data lama tanpa jadwal
        }
        $absensiHariIni = $query->get()->keyBy('siswa_id');

        $data = $siswaList->map(function ($sk) use ($absensiHariIni) {
            $absensi = $absensiHariIni->get($sk->siswa_id);
            return [
                'nisn' => $sk->siswa_id,
                'no_absen' => $sk->no_absen,
                'nama' => $sk->siswa->nama,
                'jenis_kelamin' => $sk->siswa->jenis_kelamin,
                'absensi_id' => $absensi?->id,
                'status' => $absensi?->status ?? null,
                'keterangan' => $absensi?->keterangan ?? null,
            ];
        });

        // Info jadwal yang dipilih
        $jadwalInfo = null;
        if ($id_jadwal) {
            $j = JadwalPelajaran::with('mataPelajaran')->find($id_jadwal);
            $jadwalInfo = $j ? [
                'id' => $j->id,
                'nama_mapel' => $j->mataPelajaran->nama_mapel ?? '-',
                'jam_mulai' => $j->jam_mulai,
                'jam_selesai' => $j->jam_selesai,
            ] : null;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'kelas' => ['id' => $kelas->id, 'nama_kelas' => $kelas->nama_kelas],
                'tanggal' => $tanggal,
                'jadwal' => $jadwalInfo,
                'sudah_diisi' => $absensiHariIni->count() > 0,
                'total_siswa' => $siswaList->count(),
                'siswas' => $data,
            ],
        ]);
    }

    // -------------------------------------------------------
    // SUBMIT ABSENSI per jadwal pelajaran
    // -------------------------------------------------------
    public function store(Request $request)
    {
        $request->validate([
            'kelas_id' => 'required|integer|exists:kelas,id',
            'jadwal_id' => 'nullable|integer|exists:jadwals,id',
            'tanggal' => 'required|date|before_or_equal:today',
            'absensi' => 'required|array|min:1',
            'absensi.*.siswa_id' => 'required|integer|exists:siswas,id',
            'absensi.*.status' => 'required|in:Hadir,Sakit,Izin,Alpa',
            'absensi.*.keterangan' => 'nullable|string|max:255',
        ]);

        $user = $request->user();

        // ponytail: guru hanya kelas/jadwal miliknya; operator bypass
        if ($user->hasRole('guru') && !$user->hasRole('operator')) {
            $nuptk = $user->guru?->nuptk;
            $guruId = $user->guru?->id;
            $ok = Kelas::where('id', $request->kelas_id)
                ->where(function ($q) use ($nuptk, $guruId) {
                    $q->where('nuptk_wali', $nuptk)->orWhere('guru_id', $guruId);
                })
                ->exists();
            if (!$ok && $request->jadwal_id) {
                $ok = JadwalPelajaran::where('id', $request->jadwal_id)
                    ->where(fn($q) => $q->where('nuptk', $nuptk)->orWhere('guru_id', $guruId))
                    ->exists();
            }
            if (!$ok) {
                return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
            }
        }

        DB::transaction(function () use ($request, $user) {
            foreach ($request->absensi as $item) {
                Absensi::updateOrCreate(
                    [
                        'siswa_id' => $item['siswa_id'],
                        'kelas_id' => $request->kelas_id,
                        'jadwal_id' => $request->jadwal_id, // null = harian (legacy)
                        'tanggal' => $request->tanggal,
                    ],
                    [
                        'status' => $item['status'],
                        'keterangan' => $item['keterangan'] ?? null,
                        'dicatat_oleh' => $user->id,
                    ]
                );
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Absensi berhasil disimpan.',
        ], 201);
    }

    // -------------------------------------------------------
    // EDIT ABSENSI SATU SISWA
    // -------------------------------------------------------
    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Hadir,Sakit,Izin,Alpa',
            'keterangan' => 'nullable|string|max:255',
        ]);

        $absensi = Absensi::findOrFail($id);
        $absensi->update([
            'status' => $request->status,
            'keterangan' => $request->keterangan,
            'dicatat_oleh' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Absensi berhasil diupdate.',
            'data' => $absensi,
        ]);
    }

    // -------------------------------------------------------
    // REKAP ABSENSI PER KELAS (summary per siswa)
    // -------------------------------------------------------
    public function rekap(Request $request, $id_kelas)
    {
        $request->validate([
            'dari' => 'required|date',
            'sampai' => 'required|date|after_or_equal:dari',
        ]);

        $kelas = Kelas::findOrFail($id_kelas);

        $siswaList = RiwayatKelas::with('siswa')
            ->where('kelas_id', $id_kelas)
            ->whereNull('tanggal_keluar')
            ->orderBy('no_absen')
            ->get();

        $absensi = Absensi::where('kelas_id', $id_kelas)
            ->whereBetween('tanggal', [$request->dari, $request->sampai])
            ->get()
            ->groupBy('siswa_id');

        $rekap = $siswaList->map(function ($sk) use ($absensi) {
            $data = $absensi->get($sk->siswa_id, collect());

            // 1. Rekap Per Mapel
            $rekapMapel = [
                'hadir' => $data->where('status', 'Hadir')->count(),
                'sakit' => $data->where('status', 'Sakit')->count(),
                'izin' => $data->where('status', 'Izin')->count(),
                'alpa' => $data->where('status', 'Alpa')->count(),
                'total_mapel' => $data->count(),
            ];

            // 2. Rekap Harian (Aturan 50%)
            $harian = [
                'hadir' => 0,
                'sakit' => 0,
                'izin' => 0,
                'alpa' => 0,
                'bolos_jam_pelajaran' => 0,
                'total_hari' => 0,
            ];

            $perTanggal = $data->groupBy(function ($item) {
                return $item->tanggal->format('Y-m-d');
            });

            foreach ($perTanggal as $tgl => $records) {
                $harian['total_hari']++;
                $totalMapel = $records->count();
                $jmlHadir = $records->where('status', 'Hadir')->count();
                $jmlAlpa = $records->where('status', 'Alpa')->count();

                if ($totalMapel > 0 && ($jmlHadir / $totalMapel) >= 0.5) {
                    $harian['hadir']++;
                    // Jika terhitung hadir tapi ada mapel yang alpa, tandai bolos jam pelajaran
                    if ($jmlAlpa > 0) {
                        $harian['bolos_jam_pelajaran']++;
                    }
                } else {
                    $jmlSakit = $records->where('status', 'Sakit')->count();
                    $jmlIzin = $records->where('status', 'Izin')->count();

                    if ($jmlAlpa >= $jmlSakit && $jmlAlpa >= $jmlIzin) {
                        $harian['alpa']++;
                    } elseif ($jmlSakit >= $jmlIzin) {
                        $harian['sakit']++;
                    } else {
                        $harian['izin']++;
                    }
                }
            }

            return [
                'nisn' => $sk->siswa_id,
                'no_absen' => $sk->no_absen,
                'nama' => $sk->siswa->nama,
                'rekap_mapel' => $rekapMapel,
                'rekap_harian' => $harian,
            ];
        });

        $hariEfektif = Absensi::where('kelas_id', $id_kelas)
            ->whereBetween('tanggal', [$request->dari, $request->sampai])
            ->distinct('tanggal')
            ->count('tanggal');

        return response()->json([
            'success' => true,
            'data' => [
                'kelas' => ['id' => $kelas->id, 'nama_kelas' => $kelas->nama_kelas],
                'periode' => ['dari' => $request->dari, 'sampai' => $request->sampai],
                'hari_efektif' => $hariEfektif,
                'rekap' => $rekap,
            ],
        ]);
    }

    // -------------------------------------------------------
    // RIWAYAT ABSENSI PER SISWA (digunakan oleh Ortu)
    // Menampilkan per hari dengan info mata pelajaran
    // -------------------------------------------------------
    public function bySiswa(Request $request, $nisn)
    {
        $user = $request->user();

        $request->validate([
            'dari' => 'nullable|date',
            'sampai' => 'nullable|date|after_or_equal:dari',
            'bulan' => 'nullable|integer|between:1,12',
            'tahun' => 'nullable|integer',
        ]);

        // ponytail: IDOR guard — ortu hanya anak sendiri
        if ($user->hasRole('ortu') && !$user->hasRole('guru') && !$user->hasRole('operator')) {
            $milik = \App\Models\OrangTua::where('user_id', $user->id)
                ->whereHas('siswa', fn($q) => $q->where('nisn', $nisn))
                ->exists();
            if (!$milik) {
                return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
            }
        }

        $siswa = \App\Models\Siswa::where('nisn', $nisn)->firstOrFail();

        $query = Absensi::with(['kelas', 'jadwal.mataPelajaran'])
            ->where('siswa_id', $siswa->id);

        if ($request->bulan && $request->tahun) {
            $query->whereMonth('tanggal', $request->bulan)
                ->whereYear('tanggal', $request->tahun);
        } elseif ($request->dari && $request->sampai) {
            $query->whereBetween('tanggal', [$request->dari, $request->sampai]);
        } else {
            $query->whereMonth('tanggal', now()->month)
                ->whereYear('tanggal', now()->year);
        }

        $absensi = $query->orderBy('tanggal', 'desc')->orderBy('id_jadwal')->get();

        $summary = [
            'hadir' => $absensi->where('status', 'Hadir')->count(),
            'sakit' => $absensi->where('status', 'Sakit')->count(),
            'izin' => $absensi->where('status', 'Izin')->count(),
            'alpa' => $absensi->where('status', 'Alpa')->count(),
        ];

        // Kelompokkan per tanggal
        $grouped = $absensi->groupBy(function ($item) {
            return $item->tanggal->format('Y-m-d');
        })->map(function ($rows, $tanggal) {
            return [
                'tanggal' => $tanggal,
                'mapel' => $rows->map(function ($a) {
                    return [
                        'id' => $a->id,
                        'id_jadwal' => $a->id_jadwal,
                        'nama_mapel' => $a->jadwal?->mataPelajaran?->nama_mapel ?? 'Umum',
                        'jam_mulai' => $a->jadwal?->jam_mulai,
                        'jam_selesai' => $a->jadwal?->jam_selesai,
                        'status' => $a->status,
                        'keterangan' => $a->keterangan,
                        'created_at' => $a->created_at,
                    ];
                })->values(),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'nisn' => $nisn,
                'summary' => $summary,
                'detail' => $grouped,
            ],
        ]);
    }
}