<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\RiwayatKelas;
use App\Models\Absensi; // tabel: absensis
use App\Models\Siswa;
use App\Models\Guru;
use App\Models\User;
use App\Models\JadwalPelajaran; // tabel: jadwals
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class GuruController extends Controller
{
    // -------------------------------------------------------
    // DASHBOARD GURU
    // -------------------------------------------------------
    public function dashboard(Request $request)
    {
        $nuptk = $request->user()->guru?->nuptk;
        if (!$nuptk)
            return response()->json(['success' => false, 'message' => 'Profil guru tidak ditemukan.'], 404);

        $guru = Guru::where('nuptk', $nuptk)->first();

        // Kelas yang diwali
        $kelasWali = Kelas::where('nuptk_wali', $nuptk)->where('is_active', 1)->get();
        $idKelasWali = $kelasWali->pluck('id')->toArray();

        // Total siswa aktif di kelas wali
        $totalSiswa = SiswaKelas::whereIn('id_kelas', $idKelasWali)
            ->where('status_keluar', 'Aktif')->count();

        // Absensi hari ini semua kelas wali
        $today = now()->toDateString();
        $absensiHariIni = Absensi::whereIn('id_kelas', $idKelasWali)
            ->where('tanggal', $today)->get();

        // Absensi per kelas hari ini
        $kelasRingkasan = $kelasWali->map(function ($k) use ($today) {
            $totalSiswaKelas = SiswaKelas::where('id_kelas', $k->id)->where('status_keluar', 'Aktif')->count();
            $absen = Absensi::where('id_kelas', $k->id)->where('tanggal', $today)->get();
            return [
                'id' => $k->id,
                'nama_kelas' => $k->nama_kelas,
                'tingkat' => $k->tingkat,
                'total_siswa' => $totalSiswaKelas,
                'sudah_absen' => $absen->isNotEmpty(),
                'hadir' => $absen->where('status', 'Hadir')->count(),
                'sakit' => $absen->where('status', 'Sakit')->count(),
                'izin' => $absen->where('status', 'Izin')->count(),
                'alpa' => $absen->where('status', 'Alpa')->count(),
            ];
        });

        // Statistik bulan ini
        $absenBulanIni = Absensi::whereIn('id_kelas', $idKelasWali)
            ->whereMonth('tanggal', now()->month)
            ->whereYear('tanggal', now()->year)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'gurus' => [
                    'nama' => $guru?->nama_lengkap ?? $request->user()->nama_lengkap,
                    'nuptk' => $nuptk,
                    'foto' => $request->user()->foto,
                ],
                'total_kelas' => $kelasWali->count(),
                'total_siswa' => $totalSiswa,
                'absensi_hari_ini' => [
                    'hadir' => $absensiHariIni->where('status', 'Hadir')->count(),
                    'sakit' => $absensiHariIni->where('status', 'Sakit')->count(),
                    'izin' => $absensiHariIni->where('status', 'Izin')->count(),
                    'alpa' => $absensiHariIni->where('status', 'Alpa')->count(),
                ],
                'absensi_bulan_ini' => [
                    'hadir' => $absenBulanIni->where('status', 'Hadir')->count(),
                    'sakit' => $absenBulanIni->where('status', 'Sakit')->count(),
                    'izin' => $absenBulanIni->where('status', 'Izin')->count(),
                    'alpa' => $absenBulanIni->where('status', 'Alpa')->count(),
                ],
                'kelas' => $kelasRingkasan,
            ],
        ]);
    }

    // -------------------------------------------------------
    // DATA SISWA (yang diajar guru ini — kelas wali)
    // -------------------------------------------------------
    public function siswaSaya(Request $request)
    {
        $nuptk = $request->user()->guru?->nuptk;
        if (!$nuptk)
            return response()->json(['success' => false, 'message' => 'Profil guru tidak ditemukan.'], 404);

        $idKelas = Kelas::where('nuptk_wali', $nuptk)->where('is_active', 1)->pluck('id')->toArray();

        $search = $request->search;
        $idKelasFilter = $request->kelas_id;

        $query = SiswaKelas::with([
            'siswas',
            'kelas',
            'siswa.orangTua',
        ])
            ->whereIn('kelas_id', $idKelas)
            ->where('status_keluar', 'Aktif');

        if ($idKelasFilter) {
            $query->where('kelas_id', $idKelasFilter);
        }

        if ($search) {
            $query->whereHas('siswas', function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('nisn', 'like', "%{$search}%")
                    ->orWhere('no_induk', 'like', "%{$search}%");
            });
        }

        $data = $query->orderBy('id_kelas')->orderBy('no_absen')->get()->map(function ($sk) {
            $ortu = $sk->siswa->orangTua->first();

            $namaOrtu = null;
            $noHpOrtu = null;
            $hubunganOrtu = null;

            if ($ortu) {
                if ($ortu->nama_ayah) {
                    $namaOrtu = $ortu->nama_ayah;
                    $noHpOrtu = $ortu->no_hp_ayah;
                    $hubunganOrtu = 'Ayah';
                } elseif ($ortu->nama_ibu) {
                    $namaOrtu = $ortu->nama_ibu;
                    $noHpOrtu = $ortu->no_hp_ibu;
                    $hubunganOrtu = 'Ibu';
                } elseif ($ortu->nama_wali) {
                    $namaOrtu = $ortu->nama_wali;
                    $noHpOrtu = $ortu->no_hp_wali;
                    $hubunganOrtu = $ortu->hubungan_wali ?? 'Wali';
                }
            }

            return [
                'nisn' => $sk->siswa_id,
                'no_induk' => $sk->siswa->no_induk,
                'no_absen' => $sk->no_absen,
                'nama' => $sk->siswa->nama,
                'jenis_kelamin' => $sk->siswa->jenis_kelamin,
                'kelas_id' => $sk->kelas_id,
                'nama_kelas' => $sk->kelas?->nama_kelas,
                'foto' => $sk->siswa->foto,
                'nama_ortu' => $namaOrtu,
                'no_hp_ortu' => $noHpOrtu,
                'hubungan_ortu' => $hubunganOrtu,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    // -------------------------------------------------------
    // DETAIL SISWA (read-only untuk guru)
    // -------------------------------------------------------
    public function detailSiswa(Request $request, $nisn)
    {
        $nuptk = $request->user()->guru?->nuptk;
        if (!$nuptk)
            return response()->json(['success' => false, 'message' => 'Profil guru tidak ditemukan.'], 404);

        // Pastikan siswa ini ada di kelas yang diwali oleh guru ini
        $idKelasWali = Kelas::where('nuptk_wali', $nuptk)->where('is_active', 1)->pluck('id')->toArray();
        $isSiswaWali = SiswaKelas::where('nisn', $nisn)
            ->whereIn('kelas_id', $idKelasWali)
            ->where('status_keluar', 'Aktif')
            ->exists();

        if (!$isSiswaWali) {
            return response()->json(['success' => false, 'message' => 'Siswa tidak ditemukan atau bukan bagian dari kelas perwalian Anda.'], 404);
        }

        // Load siswa + akun ortu langsung + data keluarga (orang_tua) beserta
// saudara kandung dan akun ortu mereka (untuk kasus 1 ortu punya 2 anak)
        $siswa = Siswa::with([
            'userOrtu.user',
            'orangTua.siswa.userOrtu.user',
        ])->where('siswa_id', $nisn)->first();

        $akunMap = [];

        foreach ($siswa->userOrtu as $rel) {
            if (!$rel->user || isset($akunMap[$rel->user_id]))
                continue;
            $akunMap[$rel->user_id] = [
                'user_id' => $rel->user_id,
                'hubungan' => $rel->hubungan,
                'user' => $rel->user,
            ];
        }

        foreach ($siswa->orangTua as $family) {
            foreach ($family->siswa as $sibling) {
                if ($sibling->nisn === $nisn)
                    continue;
                foreach ($sibling->userOrtu as $rel) {
                    if (!$rel->user || isset($akunMap[$rel->user_id]))
                        continue;
                    $akunMap[$rel->user_id] = [
                        'user_id' => $rel->user_id,
                        'hubungan' => $rel->hubungan,
                        'user' => $rel->user,
                    ];
                }
            }
        }

        // Untuk setiap akun ortu, cari anak lain yang terhubung ke akun tsb (via orang_tua_siswa)
        $enrichedUserOrtu = collect($akunMap)->map(function ($item) use ($siswa) {
            $anakLain = \App\Models\OrangTua::where('user_id', $item['user_id'])
                ->with(['siswa' => fn($q) => $q->where('id', '!=', $siswa->id)])
                ->get()
                ->flatMap(fn($o) => $o->siswa->map(fn($s) => [
                    'nisn' => $s->nisn,
                    'nama' => $s->nama,
                    'jenis_kelamin' => $s->jenis_kelamin,
                    'hubungan' => $o->hubungan,
                ]));
            return array_merge($item, ['anak_lain' => $anakLain->values()]);
        })->values();

        // Kumpulkan saudara kandung dari data keluarga (orang_tua → siswa_orang_tua)
        $saudara = collect();
        foreach ($siswa->orangTua as $family) {
            foreach ($family->siswa as $sibling) {
                if ($sibling->nisn === $nisn)
                    continue;
                $saudara->push([
                    'nisn' => $sibling->nisn,
                    'nama' => $sibling->nama_lengkap,
                    'jenis_kelamin' => $sibling->jenis_kelamin,
                ]);
            }
        }

        $biodataOrtu = $siswa->orangTua->first();

        return response()->json([
            'success' => true,
            'data' => array_merge($siswa->toArray(), [
                'user_roles' => $enrichedUserOrtu,
                'saudara' => $saudara->unique('nisn')->values(),
                'biodata_ortu' => $biodataOrtu ? [
                    'nama_ayah' => $biodataOrtu->nama_ayah,
                    'pekerjaan_ayah' => $biodataOrtu->pekerjaan_ayah,
                    'penghasilan_ayah' => $biodataOrtu->penghasilan_ayah,
                    'no_hp_ayah' => $biodataOrtu->no_hp_ayah,
                    'nama_ibu' => $biodataOrtu->nama_ibu,
                    'pekerjaan_ibu' => $biodataOrtu->pekerjaan_ibu,
                    'penghasilan_ibu' => $biodataOrtu->penghasilan_ibu,
                    'no_hp_ibu' => $biodataOrtu->no_hp_ibu,
                    'nama_wali' => $biodataOrtu->nama_wali,
                    'hubungan_wali' => $biodataOrtu->hubungan_wali,
                    'pekerjaan_wali' => $biodataOrtu->pekerjaan_wali,
                    'penghasilan_wali' => $biodataOrtu->penghasilan_wali,
                    'no_hp_wali' => $biodataOrtu->no_hp_wali,
                    'email' => $biodataOrtu->email,
                    'alamat' => $biodataOrtu->alamat,
                ] : null,
            ]),
        ]);
    }

    // -------------------------------------------------------
    // DAFTAR KELAS YANG DIWALI GURU INI
    // -------------------------------------------------------
    public function kelasSaya(Request $request)
    {
        $user = $request->user();
        $nuptk = $user->guru?->nuptk;

        if (!$nuptk) {
            return response()->json([
                'success' => false,
                'message' => 'Profil guru tidak ditemukan.',
            ], 404);
        }

        $kelas = Kelas::where('nuptk_wali', $nuptk)
            ->where('is_active', 1)
            ->get()
            ->map(function ($k) {
                $totalSiswa = SiswaKelas::where('id_kelas', $k->id)
                    ->where('status_keluar', 'Aktif')
                    ->count();

                // Cek apakah absensi hari ini sudah diisi
                $sudahAbsen = Absensi::where('id_kelas', $k->id)
                    ->where('tanggal', now()->toDateString())
                    ->exists();

                return [
                    'id' => $k->id,
                    'nama_kelas' => $k->nama_kelas,
                    'tingkat' => $k->tingkat,
                    'semester' => $k->semester,
                    'ruangan' => $k->ruangan,
                    'total_siswa' => $totalSiswa,
                    'sudah_absen_hari_ini' => $sudahAbsen,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $kelas,
        ]);
    }

    // -------------------------------------------------------
    // DETAIL SATU KELAS + STATISTIK ABSENSI BULAN INI
    // -------------------------------------------------------
    public function detailKelas(Request $request, $id_kelas)
    {
        $user = $request->user();
        $nuptk = $user->guru?->nuptk;

        $kelas = Kelas::where('id', $id_kelas)
            ->where('nuptk_wali', $nuptk)
            ->firstOrFail();

        $siswaList = SiswaKelas::with('siswas')
            ->where('kelas_id', $id_kelas)
            ->where('status_keluar', 'Aktif')
            ->orderBy('no_absen')
            ->get();

        // Statistik absensi bulan ini per siswa
        $absenBulanIni = Absensi::where('id_kelas', $id_kelas)
            ->whereMonth('tanggal', now()->month)
            ->whereYear('tanggal', now()->year)
            ->get()
            ->groupBy('siswa_id');

        $siswa = $siswaList->map(function ($sk) use ($absenBulanIni) {
            $data = $absenBulanIni->get($sk->siswa_id, collect());
            return [
                'nisn' => $sk->siswa_id,
                'no_absen' => $sk->no_absen,
                'nama' => $sk->siswa->nama,
                'jenis_kelamin' => $sk->siswa->jenis_kelamin,
                'bulan_ini' => [
                    'hadir' => $data->where('status', 'Hadir')->count(),
                    'sakit' => $data->where('status', 'Sakit')->count(),
                    'izin' => $data->where('status', 'Izin')->count(),
                    'alpa' => $data->where('status', 'Alpa')->count(),
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'kelas' => [
                    'id' => $kelas->id,
                    'nama_kelas' => $kelas->nama_kelas,
                    'tingkat' => $kelas->tingkat,
                    'semester' => $kelas->semester,
                    'ruangan' => $kelas->ruangan,
                ],
                'siswas' => $siswa,
            ],
        ]);
    }

    // -------------------------------------------------------
    // RIWAYAT ABSENSI KELAS (per tanggal)
    // -------------------------------------------------------
    public function riwayatAbsensi(Request $request, $id_kelas)
    {
        $request->validate([
            'bulan' => 'required|integer|between:1,12',
            'tahun' => 'required|integer',
        ]);

        $user = $request->user();
        $nuptk = $user->guru?->nuptk;

        // Pastikan kelas ini milik guru ybs
        Kelas::where('id', $id_kelas)
            ->where('nuptk_wali', $nuptk)
            ->firstOrFail();

        // Ambil semua tanggal yang ada absensinya di bulan tsb
        $tanggalList = Absensi::where('id_kelas', $id_kelas)
            ->whereMonth('tanggal', $request->bulan)
            ->whereYear('tanggal', $request->tahun)
            ->distinct('tanggal')
            ->pluck('tanggal')
            ->sort()
            ->values();

        // Summary per tanggal
        $riwayat = $tanggalList->map(function ($tanggal) use ($id_kelas) {
            $absensi = Absensi::where('id_kelas', $id_kelas)
                ->where('tanggal', $tanggal)
                ->get();

            return [
                'tanggal' => $tanggal,
                'hadir' => $absensi->where('status', 'Hadir')->count(),
                'sakit' => $absensi->where('status', 'Sakit')->count(),
                'izin' => $absensi->where('status', 'Izin')->count(),
                'alpa' => $absensi->where('status', 'Alpa')->count(),
                'total' => $absensi->count(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'kelas_id' => $id_kelas,
                'bulan' => $request->bulan,
                'tahun' => $request->tahun,
                'riwayat' => $riwayat,
            ],
        ]);
    }

    // -------------------------------------------------------
    // JADWAL MENGAJAR GURU
    // -------------------------------------------------------
    public function jadwalMengajar(Request $request)
    {
        $user = $request->user();
        $nuptk = $user->guru?->nuptk;

        if (!$nuptk) {
            return response()->json(['success' => false, 'message' => 'Profil guru tidak ditemukan.'], 404);
        }

        $jadwal = JadwalPelajaran::with(['kelas', 'mataPelajaran'])
            ->where('nuptk', $nuptk)
            ->orderByRaw("FIELD(hari, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu')")
            ->orderBy('jam_mulai')
            ->get();

        // Group by hari
        $grouped = $jadwal->groupBy('hari')->map(function ($items) {
            return $items->map(function ($j) {
                return [
                    'id' => $j->id,
                    'hari' => $j->hari,
                    'jam_mulai' => $j->jam_mulai,
                    'jam_selesai' => $j->jam_selesai,
                    'mapels' => $j->mataPelajaran?->nama_mapel,
                    'kode_mapel' => $j->mataPelajaran?->kode_mapel,
                    'nama_kelas' => $j->kelas?->nama_kelas,
                    'tingkat' => $j->kelas?->tingkat,
                    'semester' => $j->semester,
                    'tahun_ajarans' => $j->tahun_ajaran,
                ];
            })->values();
        });

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $jadwal->count(),
                'jadwal' => $grouped,
            ],
        ]);
    }

    // -------------------------------------------------------
    // PROFIL GURU
    // -------------------------------------------------------
    public function profil(Request $request)
    {
        $user = $request->user();

        $nuptk = $user->guru?->nuptk;

        // Ambil data master guru jika ada
        $masterGuru = null;
        if ($nuptk) {
            $masterGuru = Guru::where('nuptk', $nuptk)->first();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'nama' => $user->name,
                    'no_hp' => $user->guru->no_hp,
                    'foto' => $user->foto,
                ],
                'master' => $masterGuru
            ],
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
            $user->guru->no_hp = $request->no_hp;
        }

        if ($request->hasFile('foto')) {
            if ($user->foto && Storage::disk('public')->exists($user->foto)) {
                Storage::disk('public')->delete($user->foto);
            }
            $path = $request->file('foto')->store('foto-guru', 'public');
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