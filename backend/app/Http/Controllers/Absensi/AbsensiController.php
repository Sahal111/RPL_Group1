<?php

namespace App\Http\Controllers\Absensi;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\JadwalPelajaran;
use App\Models\SiswaKelas;
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
        $tahunAjaran = DB::table('tahun_ajaran')->find($kelas->id_tahun_ajaran);

        $query = JadwalPelajaran::with(['mataPelajaran', 'guru'])
            ->where('id_kelas', $id_kelas)
            ->where('hari', $hari);

        if ($tahunAjaran) {
            $query->where('tahun_ajaran', $tahunAjaran->nama)
                  ->where('semester', $kelas->semester);
        }

        $jadwal = $query->orderBy('jam_mulai')
            ->get()
            ->map(function ($j) use ($id_kelas, $tanggal) {
                // Cek apakah absensi untuk jadwal ini sudah diisi
                $sudahAbsen = Absensi::where('id_kelas', $id_kelas)
                    ->where('id_jadwal', $j->id)
                    ->where('tanggal', $tanggal)
                    ->exists();

                return [
                    'id_jadwal'    => $j->id,
                    'nama_mapel'   => $j->mataPelajaran->nama_mapel ?? '-',
                    'kode_mapel'   => $j->mataPelajaran->kode_mapel ?? '-',
                    'guru'         => $j->guru->nama_lengkap ?? '-',
                    'jam_mulai'    => $j->jam_mulai,
                    'jam_selesai'  => $j->jam_selesai,
                    'sudah_absen'  => $sudahAbsen,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'kelas'  => ['id' => $kelas->id, 'nama_kelas' => $kelas->nama_kelas],
                'hari'   => $hari,
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
        $tanggal   = $request->tanggal ?? now()->toDateString();
        $id_jadwal = $request->id_jadwal; // bisa null (fallback mode harian)

        $kelas = Kelas::findOrFail($id_kelas);

        $siswaList = SiswaKelas::with('siswa')
            ->where('id_kelas', $id_kelas)
            ->where('status_keluar', 'Aktif')
            ->orderBy('no_absen')
            ->get();

        // Absensi yang sudah diisi untuk jadwal + tanggal ini
        $query = Absensi::where('id_kelas', $id_kelas)->where('tanggal', $tanggal);
        if ($id_jadwal) {
            $query->where('id_jadwal', $id_jadwal);
        } else {
            $query->whereNull('id_jadwal'); // fallback: data lama tanpa jadwal
        }
        $absensiHariIni = $query->get()->keyBy('nisn');

        $data = $siswaList->map(function ($sk) use ($absensiHariIni) {
            $absensi = $absensiHariIni->get($sk->nisn);
            return [
                'nisn'         => $sk->nisn,
                'no_absen'     => $sk->no_absen,
                'nama_lengkap' => $sk->siswa->nama_lengkap,
                'jenis_kelamin' => $sk->siswa->jenis_kelamin,
                'absensi_id'   => $absensi?->id,
                'status'       => $absensi?->status ?? null,
                'keterangan'   => $absensi?->keterangan ?? null,
            ];
        });

        // Info jadwal yang dipilih
        $jadwalInfo = null;
        if ($id_jadwal) {
            $j = JadwalPelajaran::with('mataPelajaran')->find($id_jadwal);
            $jadwalInfo = $j ? [
                'id'         => $j->id,
                'nama_mapel' => $j->mataPelajaran->nama_mapel ?? '-',
                'jam_mulai'  => $j->jam_mulai,
                'jam_selesai' => $j->jam_selesai,
            ] : null;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'kelas'       => ['id' => $kelas->id, 'nama_kelas' => $kelas->nama_kelas],
                'tanggal'     => $tanggal,
                'jadwal'      => $jadwalInfo,
                'sudah_diisi' => $absensiHariIni->count() > 0,
                'total_siswa' => $siswaList->count(),
                'siswa'       => $data,
            ],
        ]);
    }

    // -------------------------------------------------------
    // SUBMIT ABSENSI per jadwal pelajaran
    // -------------------------------------------------------
    public function store(Request $request)
    {
        $request->validate([
            'id_kelas'          => 'required|string|exists:kelas,id',
            'id_jadwal'         => 'nullable|integer|exists:jadwal_pelajaran,id',
            'tanggal'           => 'required|date|before_or_equal:today',
            'absensi'           => 'required|array|min:1',
            'absensi.*.nisn'    => 'required|string|exists:siswa,nisn',
            'absensi.*.status'  => 'required|in:Hadir,Sakit,Izin,Alpa',
            'absensi.*.keterangan' => 'nullable|string|max:255',
        ]);

        $user = $request->user();

        DB::transaction(function () use ($request, $user) {
            foreach ($request->absensi as $item) {
                Absensi::updateOrCreate(
                    [
                        'nisn'      => $item['nisn'],
                        'id_kelas'  => $request->id_kelas,
                        'id_jadwal' => $request->id_jadwal, // null = harian (legacy)
                        'tanggal'   => $request->tanggal,
                    ],
                    [
                        'status'       => $item['status'],
                        'keterangan'   => $item['keterangan'] ?? null,
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
            'status'     => 'required|in:Hadir,Sakit,Izin,Alpa',
            'keterangan' => 'nullable|string|max:255',
        ]);

        $absensi = Absensi::findOrFail($id);
        $absensi->update([
            'status'       => $request->status,
            'keterangan'   => $request->keterangan,
            'dicatat_oleh' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Absensi berhasil diupdate.',
            'data'    => $absensi,
        ]);
    }

    // -------------------------------------------------------
    // REKAP ABSENSI PER KELAS (summary per siswa)
    // -------------------------------------------------------
    public function rekap(Request $request, $id_kelas)
    {
        $request->validate([
            'dari'   => 'required|date',
            'sampai' => 'required|date|after_or_equal:dari',
        ]);

        $kelas = Kelas::findOrFail($id_kelas);

        $siswaList = SiswaKelas::with('siswa')
            ->where('id_kelas', $id_kelas)
            ->where('status_keluar', 'Aktif')
            ->orderBy('no_absen')
            ->get();

        $absensi = Absensi::where('id_kelas', $id_kelas)
            ->whereBetween('tanggal', [$request->dari, $request->sampai])
            ->get()
            ->groupBy('nisn');

        $rekap = $siswaList->map(function ($sk) use ($absensi) {
            $data = $absensi->get($sk->nisn, collect());
            
            // 1. Rekap Per Mapel
            $rekapMapel = [
                'hadir' => $data->where('status', 'Hadir')->count(),
                'sakit' => $data->where('status', 'Sakit')->count(),
                'izin'  => $data->where('status', 'Izin')->count(),
                'alpa'  => $data->where('status', 'Alpa')->count(),
                'total_mapel' => $data->count(),
            ];

            // 2. Rekap Harian (Aturan 50%)
            $harian = [
                'hadir' => 0,
                'sakit' => 0,
                'izin'  => 0,
                'alpa'  => 0,
                'bolos_jam_pelajaran' => 0,
                'total_hari' => 0,
            ];

            $perTanggal = $data->groupBy(function($item) {
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
                'nisn'         => $sk->nisn,
                'no_absen'     => $sk->no_absen,
                'nama_lengkap' => $sk->siswa->nama_lengkap,
                'rekap_mapel'  => $rekapMapel,
                'rekap_harian' => $harian,
            ];
        });

        $hariEfektif = Absensi::where('id_kelas', $id_kelas)
            ->whereBetween('tanggal', [$request->dari, $request->sampai])
            ->distinct('tanggal')
            ->count('tanggal');

        return response()->json([
            'success' => true,
            'data' => [
                'kelas'       => ['id' => $kelas->id, 'nama_kelas' => $kelas->nama_kelas],
                'periode'     => ['dari' => $request->dari, 'sampai' => $request->sampai],
                'hari_efektif' => $hariEfektif,
                'rekap'       => $rekap,
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
            'dari'   => 'nullable|date',
            'sampai' => 'nullable|date|after_or_equal:dari',
            'bulan'  => 'nullable|integer|between:1,12',
            'tahun'  => 'nullable|integer',
        ]);

        $query = Absensi::with(['kelas', 'jadwal.mataPelajaran'])
            ->where('nisn', $nisn);

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
            'izin'  => $absensi->where('status', 'Izin')->count(),
            'alpa'  => $absensi->where('status', 'Alpa')->count(),
        ];

        // Kelompokkan per tanggal
        $grouped = $absensi->groupBy(function ($item) {
            return $item->tanggal->format('Y-m-d');
        })->map(function ($rows, $tanggal) {
            return [
                'tanggal' => $tanggal,
                'mapel'   => $rows->map(function ($a) {
                    return [
                        'id'         => $a->id,
                        'id_jadwal'  => $a->id_jadwal,
                        'nama_mapel' => $a->jadwal?->mataPelajaran?->nama_mapel ?? 'Umum',
                        'jam_mulai'  => $a->jadwal?->jam_mulai,
                        'jam_selesai' => $a->jadwal?->jam_selesai,
                        'status'     => $a->status,
                        'keterangan' => $a->keterangan,
                        'created_at' => $a->created_at,
                    ];
                })->values(),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'nisn'    => $nisn,
                'summary' => $summary,
                'detail'  => $grouped,
            ],
        ]);
    }
}