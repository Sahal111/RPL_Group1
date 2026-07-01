<?php

namespace App\Http\Controllers\Ortu;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserOrtu;
use App\Models\Siswa;
use App\Models\SiswaKelas;
use App\Models\Absensi;
use App\Models\Pengumuman;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class OrtuController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $nisn = $request->query('nisn');

        $query = UserOrtu::with('siswa')->where('user_id', $user->id);
        $userOrtu = $nisn ? $query->where('nisn', $nisn)->first() : $query->first();

        if (!$userOrtu || !$userOrtu->siswa) {
            return response()->json([
                'success' => false,
                'message' => 'Data anak belum tertaut ke akun ini.'
            ], 404);
        }

        $siswa = $userOrtu->siswa;

        // Ambil kelas aktif siswa
        $siswaKelas = SiswaKelas::with(['kelas.wali'])
            ->where('nisn', $siswa->nisn)
            ->where('status_keluar', 'Aktif')
            ->first();

        $kelas = $siswaKelas ? $siswaKelas->kelas : null;
        $waliKelas = $kelas ? $kelas->wali : null;

        // Hitung absensi bulan ini (count raw per mapel, sinkron dengan riwayat)
        $hariIni = Carbon::today()->format('Y-m-d');
        $bulanIni = Carbon::now()->month;
        $tahunIni = Carbon::now()->year;

        $absensiBulanIni = Absensi::where('nisn', $siswa->nisn)
            ->whereYear('tanggal', $tahunIni)
            ->whereMonth('tanggal', $bulanIni)
            ->get();

        // Count raw per mapel (sama dengan halaman riwayat absensi)
        $rekapBulan = [
            'hadir' => $absensiBulanIni->where('status', 'Hadir')->count(),
            'sakit' => $absensiBulanIni->where('status', 'Sakit')->count(),
            'izin' => $absensiBulanIni->where('status', 'Izin')->count(),
            'alfa' => $absensiBulanIni->where('status', 'Alpa')->count(),
        ];

        // Status hari ini berdasarkan aturan 50% untuk menentukan status harian
        $absensiHariIni = $absensiBulanIni->filter(function ($item) use ($hariIni) {
            return Carbon::parse($item->tanggal)->format('Y-m-d') == $hariIni;
        });

        $absensiHariIniStatus = 'Belum Ada';
        $bolosHariIni = false;

        if ($absensiHariIni->count() > 0) {
            $totalMapel = $absensiHariIni->count();
            $jmlHadir = $absensiHariIni->where('status', 'Hadir')->count();
            $jmlAlpa = $absensiHariIni->where('status', 'Alpa')->count();

            if ($totalMapel > 0 && ($jmlHadir / $totalMapel) >= 0.5) {
                $absensiHariIniStatus = 'Hadir';
                if ($jmlAlpa > 0) {
                    $bolosHariIni = true;
                }
            } else {
                $jmlSakit = $absensiHariIni->where('status', 'Sakit')->count();
                $jmlIzin = $absensiHariIni->where('status', 'Izin')->count();

                if ($jmlAlpa >= $jmlSakit && $jmlAlpa >= $jmlIzin) {
                    $absensiHariIniStatus = 'Alpa';
                } elseif ($jmlSakit >= $jmlIzin) {
                    $absensiHariIniStatus = 'Sakit';
                } else {
                    $absensiHariIniStatus = 'Izin';
                }
            }
        }

        // Pengumuman Terbaru
        $pengumuman = Pengumuman::orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'siswa' => [
                    'nama_lengkap' => $siswa->nama_lengkap,
                    'nisn' => $siswa->nisn,
                    'foto' => $siswa->foto
                ],
                'kelas' => $kelas ? [
                    'nama_kelas' => $kelas->nama_kelas,
                    'tingkat' => $kelas->tingkat,
                    'wali_kelas' => $waliKelas ? [
                        'nama_lengkap' => $waliKelas->nama_lengkap,
                        'no_hp' => $waliKelas->no_hp,
                    ] : null,
                ] : null,
                'absensi_hari_ini' => $absensiHariIniStatus,
                'bolos_hari_ini' => $bolosHariIni,
                'rekap_bulan_ini' => $rekapBulan,
                'pengumuman_terbaru' => $pengumuman
            ]
        ]);
    }

    public function profilAnak(Request $request)
    {
        $user = $request->user();
        $nisn = $request->query('nisn');

        $query = UserOrtu::with('siswa')->where('user_id', $user->id);
        $userOrtu = $nisn ? $query->where('nisn', $nisn)->first() : $query->first();

        if (!$userOrtu || !$userOrtu->siswa) {
            return response()->json([
                'success' => false,
                'message' => 'Data anak belum tertaut ke akun ini.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $userOrtu->siswa
        ]);
    }

    public function riwayatAbsensi(Request $request)
    {
        $user = $request->user();
        $nisn = $request->query('nisn');

        $query = UserOrtu::with('siswa')->where('user_id', $user->id);
        $userOrtu = $nisn ? $query->where('nisn', $nisn)->first() : $query->first();

        if (!$userOrtu || !$userOrtu->siswa) {
            return response()->json([
                'success' => false,
                'message' => 'Data anak belum tertaut ke akun ini.'
            ], 404);
        }

        $siswa = $userOrtu->siswa;

        $query = Absensi::with(['jadwal.mataPelajaran'])->where('nisn', $siswa->nisn);

        $filter = $request->query('filter', 'bulan'); // default bulan

        if ($filter === 'minggu') {
            $query->whereBetween('tanggal', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
        } elseif ($filter === 'bulan') {
            $query->whereMonth('tanggal', Carbon::now()->month)
                ->whereYear('tanggal', Carbon::now()->year);
        } elseif ($filter === 'semester') {
            // Ambil kelas aktif
            $siswaKelas = SiswaKelas::where('nisn', $siswa->nisn)
                ->where('status_keluar', 'Aktif')
                ->first();

            if ($siswaKelas) {
                $query->where('id_kelas', $siswaKelas->id_kelas);
            }
        }

        $absensi = $query->orderBy('tanggal', 'desc')->orderBy('id_jadwal')->get();

        // Summary: count raw per mapel (sama seperti halaman guru)
        $summary = [
            'hadir' => $absensi->where('status', 'Hadir')->count(),
            'sakit' => $absensi->where('status', 'Sakit')->count(),
            'izin' => $absensi->where('status', 'Izin')->count(),
            'alpa' => $absensi->where('status', 'Alpa')->count(),
        ];

        // Kelompokkan per tanggal agar orang tua bisa lihat harian
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
                'nisn' => $siswa->nisn,
                'summary' => $summary,
                'detail' => $grouped,
            ]
        ]);
    }

    public function daftarAnak(Request $request)
    {
        $user = $request->user();
        $anak = UserOrtu::with('siswa')
            ->where('user_id', $user->id)
            ->get()
            ->filter(fn($ua) => $ua->siswa);

        return response()->json([
            'success' => true,
            'data' => $anak->map(function ($ua) {
                return [
                    'nisn' => $ua->siswa->nisn,
                    'nama_lengkap' => $ua->siswa->nama_lengkap,
                    'foto' => $ua->siswa->foto,
                    'hubungan' => $ua->hubungan,
                ];
            })->values(),
        ]);
    }
    public function tambahAnak(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'nisn' => 'required|string|size:10|exists:siswa,nisn',
            'kode_anak' => 'required|string',
            'hubungan' => 'required|in:Ayah,Ibu,Wali',
        ]);

        // Kode HARUS cocok dengan NISN yang diinput — ini kode unik per siswa,
        // dikasih operator ke ortu yang memang benar orang tua/wali anak itu.
        // Bukan kode global, supaya ortu gak bisa asal klaim NISN anak orang lain.
        $siswa = Siswa::where('nisn', $request->nisn)->first();
        if (!$siswa || $siswa->kode_anak !== strtoupper($request->kode_anak)) {
            return response()->json([
                'success' => false,
                'message' => 'Kode tidak sesuai dengan NISN yang dimasukkan. Pastikan kode didapat dari operator sekolah untuk anak ini.',
            ], 422);
        }

        // NISN cuma boleh tertaut ke satu akun ortu di seluruh sistem
        $sudahAda = UserOrtu::where('nisn', $request->nisn)->exists();
        if ($sudahAda) {
            return response()->json([
                'success' => false,
                'message' => 'NISN ini sudah terdaftar di akun orang tua (akun ini atau akun lain).',
            ], 422);
        }

        UserOrtu::create([
            'user_id' => $user->id,
            'nisn' => $request->nisn,
            'hubungan' => $request->hubungan,
        ]);

        $anak = UserOrtu::with('siswa')
            ->where('user_id', $user->id)
            ->get()
            ->filter(fn($ua) => $ua->siswa)
            ->map(function ($ua) {
                return [
                    'nisn' => $ua->siswa->nisn,
                    'nama_lengkap' => $ua->siswa->nama_lengkap,
                    'foto' => $ua->siswa->foto,
                    'hubungan' => $ua->hubungan,
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'message' => 'Anak berhasil ditautkan ke akun kamu.',
            'data' => $anak,
        ], 201);
    }

    public function updateAnak(Request $request, $nisn)
    {
        $user = $request->user();

        $request->validate([
            'hubungan' => 'required|in:Ayah,Ibu,Wali',
        ]);

        $userOrtu = UserOrtu::where('user_id', $user->id)
            ->where('nisn', $nisn)
            ->first();

        if (!$userOrtu) {
            return response()->json([
                'success' => false,
                'message' => 'Data anak tidak ditemukan di akun ini.',
            ], 404);
        }

        $userOrtu->hubungan = $request->hubungan;
        $userOrtu->save();

        return response()->json([
            'success' => true,
            'message' => 'Status hubungan berhasil diperbarui.',
            'data' => $userOrtu,
        ]);
    }

    public function hapusAnak(Request $request, $nisn)
    {
        $user = $request->user();

        $userOrtu = UserOrtu::where('user_id', $user->id)
            ->where('nisn', $nisn)
            ->first();

        if (!$userOrtu) {
            return response()->json([
                'success' => false,
                'message' => 'Data anak tidak ditemukan di akun ini.',
            ], 404);
        }

        $userOrtu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Anak berhasil dihapus dari akun kamu.',
        ]);
    }

    public function pengumuman(Request $request)
    {
        $kategori = $request->query('kategori'); // filter by kategori

        $query = Pengumuman::orderBy('created_at', 'desc');

        if ($kategori && $kategori !== 'semua') {
            $query->where('kategori', $kategori);
        }

        $pengumuman = $query->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $pengumuman
        ]);
    }

    public function profil(Request $request)
    {
        $user = $request->user();
        $nisn = $request->query('nisn');

        $query = UserOrtu::with('siswa.orangTua')->where('user_id', $user->id);
        $userOrtu = $nisn ? $query->where('nisn', $nisn)->first() : $query->first();

        if (!$userOrtu || !$userOrtu->siswa) {
            return response()->json([
                'success' => false,
                'message' => 'Data anak belum tertaut ke akun ini.'
            ], 404);
        }

        $siswa = $userOrtu->siswa;

        // Biodata resmi keluarga anak yang SEDANG DIPILIH (bukan anak lain)
        $biodataOrtu = $siswa->orangTua->first();

        // Pekerjaan diambil sesuai hubungan akun INI ke anak INI
// (bukan fallback ayah->ibu->wali, karena kita udah tau persis akun ini "siapa")
        $pekerjaanOrtu = null;
        if ($biodataOrtu) {
            $pekerjaanOrtu = match ($userOrtu->hubungan) {
                'Ayah' => $biodataOrtu->pekerjaan_ayah,
                'Ibu' => $biodataOrtu->pekerjaan_ibu,
                'Wali' => $biodataOrtu->pekerjaan_wali,
                default => null,
            };
        }

        // Ambil kelas aktif siswa
        $siswaKelas = SiswaKelas::with(['kelas.wali'])
            ->where('nisn', $siswa->nisn)
            ->where('status_keluar', 'Aktif')
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'nama_lengkap' => $user->nama_lengkap,
                    'no_hp' => $user->no_hp,
                    'foto' => $user->foto,
                ],
                'ortu' => [
                    'hubungan' => $userOrtu->hubungan,
                    'pekerjaan' => $pekerjaanOrtu,
                ],
                'siswa' => [
                    'nisn' => $siswa->nisn,
                    'no_induk' => $siswa->no_induk,
                    'nama_lengkap' => $siswa->nama_lengkap,
                    'jenis_kelamin' => $siswa->jenis_kelamin,
                    'tempat_lahir' => $siswa->tempat_lahir,
                    'tanggal_lahir' => $siswa->tanggal_lahir,
                    'alamat' => $siswa->alamat_jalan,
                    'foto' => $siswa->foto,
                    'kelas' => $siswaKelas ? [
                        'nama_kelas' => $siswaKelas->kelas->nama_kelas,
                        'tingkat' => $siswaKelas->kelas->tingkat,
                        'wali_kelas' => $siswaKelas->kelas->wali ? [
                            'nama_lengkap' => $siswaKelas->kelas->wali->nama_lengkap,
                            'no_hp' => $siswaKelas->kelas->wali->no_hp,
                            'foto' => $siswaKelas->kelas->wali->foto,
                        ] : null,
                    ] : null,
                ],
            ]
        ]);
    }

    public function updateProfil(Request $request)
    {
        $user = User::find($request->user()->id);

        $request->validate([
            'email' => 'nullable|email|unique:users,email,' . $user->id,
            'no_hp' => 'nullable|string|max:20',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'password_lama' => 'nullable|string',
            'password_baru' => 'nullable|string|min:6|confirmed',
        ]);

        // Cek ganti password
        if ($request->filled('password_baru')) {
            if (!$request->filled('password_lama')) {
                return response()->json(['success' => false, 'message' => 'Password lama wajib diisi.'], 400);
            }
            if (!Hash::check($request->password_lama, $user->password)) {
                return response()->json(['success' => false, 'message' => 'Password lama tidak cocok.'], 400);
            }
            $user->password = Hash::make($request->password_baru);
        }

        if ($request->filled('email')) {
            $user->email = $request->email;
        }

        if ($request->filled('no_hp')) {
            $user->no_hp = $request->no_hp;
        }

        if ($request->hasFile('foto')) {
            if ($user->foto && Storage::disk('public')->exists($user->foto)) {
                Storage::disk('public')->delete($user->foto);
            }
            $path = $request->file('foto')->store('foto-ortu', 'public');
            $user->foto = $path;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data' => $user
        ]);
    }
}