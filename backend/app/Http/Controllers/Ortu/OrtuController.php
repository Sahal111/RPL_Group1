<?php

namespace App\Http\Controllers\Ortu;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\OrangTua;
use App\Models\Siswa;
use App\Models\RiwayatKelas;
use App\Models\Absensi;
use App\Models\Pengumuman;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class OrtuController extends Controller
{
    // -------------------------------------------------------
    // Helper: ambil OrangTua (profil ortu) milik user login
    // Skema baru: orang_tuas.user_id → link ke user login
    // -------------------------------------------------------
    private function getOrtuAnak(User $user, ?string $nisnFilter = null)
    {
        // Ambil semua OrangTua records milik user ini
        $query = OrangTua::with(['siswa'])
            ->where('user_id', $user->id);

        if ($nisnFilter) {
            $query->whereHas('siswa', fn($q) => $q->where('nisn', $nisnFilter));
        }

        return $query->first();
    }

    // -------------------------------------------------------
    // DASHBOARD ORTU
    // -------------------------------------------------------
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $nisn = $request->query('nisn');

        $ortu = $this->getOrtuAnak($user, $nisn);

        if (!$ortu || $ortu->siswa->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Data anak belum tertaut ke akun ini.'
            ], 404);
        }

        // Ambil siswa pertama (atau yang sesuai filter NISN)
        $siswa = $nisn
            ? $ortu->siswa->firstWhere('nisn', $nisn)
            : $ortu->siswa->first();

        if (!$siswa) {
            return response()->json(['success' => false, 'message' => 'Siswa tidak ditemukan.'], 404);
        }

        // Kelas aktif siswa
        $riwayat = RiwayatKelas::with(['kelas.wali'])
            ->where('siswa_id', $siswa->id)
            ->aktif()
            ->first();

        $kelas = $riwayat?->kelas;
        $waliKelas = $kelas?->wali;

        // Absensi bulan ini
        $bulanIni = Carbon::now()->month;
        $tahunIni = Carbon::now()->year;
        $hariIni = Carbon::today()->format('Y-m-d');

        $absensiBulanIni = Absensi::where('siswa_id', $siswa->id)
            ->whereYear('tanggal', $tahunIni)
            ->whereMonth('tanggal', $bulanIni)
            ->get();

        $rekapBulan = [
            'hadir' => $absensiBulanIni->where('status', 'hadir')->count(),
            'sakit' => $absensiBulanIni->where('status', 'sakit')->count(),
            'izin' => $absensiBulanIni->where('status', 'izin')->count(),
            'alpha' => $absensiBulanIni->where('status', 'alpha')->count(),
        ];

        // Status hari ini (rule: >= 50% hadir = Hadir)
        $absensiHariIni = $absensiBulanIni->filter(fn($a) => Carbon::parse($a->tanggal)->format('Y-m-d') === $hariIni);
        $absensiHariIniStatus = 'Belum Ada';

        if ($absensiHariIni->count() > 0) {
            $total = $absensiHariIni->count();
            $jmlHadir = $absensiHariIni->where('status', 'hadir')->count();
            $jmlAlpha = $absensiHariIni->where('status', 'alpha')->count();
            $jmlSakit = $absensiHariIni->where('status', 'sakit')->count();
            $jmlIzin = $absensiHariIni->where('status', 'izin')->count();

            if ($total > 0 && ($jmlHadir / $total) >= 0.5) {
                $absensiHariIniStatus = 'Hadir';
            } elseif ($jmlAlpha >= $jmlSakit && $jmlAlpha >= $jmlIzin) {
                $absensiHariIniStatus = 'Alpha';
            } elseif ($jmlSakit >= $jmlIzin) {
                $absensiHariIniStatus = 'Sakit';
            } else {
                $absensiHariIniStatus = 'Izin';
            }
        }

        $pengumuman = Pengumuman::whereIn('target', ['semua', 'ortu'])
            ->where(fn($q) => $q->whereNull('publish_at')->orWhere('publish_at', '<=', now()))
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'siswa' => [
                    'nama' => $siswa->nama,
                    'nisn' => $siswa->nisn,
                    'foto' => $siswa->foto,
                ],
                'kelas' => $kelas ? [
                    'nama_kelas' => $kelas->nama_kelas,
                    'tingkat' => $kelas->tingkat,
                    'wali_kelas' => $waliKelas ? [
                        'nama' => $waliKelas->nama,
                        'no_hp' => $waliKelas->no_hp,
                    ] : null,
                ] : null,
                'absensi_hari_ini' => $absensiHariIniStatus,
                'rekap_bulan_ini' => $rekapBulan,
                'pengumuman_terbaru' => $pengumuman,
            ]
        ]);
    }

    // -------------------------------------------------------
    // PROFIL ANAK
    // -------------------------------------------------------
    public function profilAnak(Request $request)
    {
        $user = $request->user();
        $nisn = $request->query('nisn');
        $ortu = $this->getOrtuAnak($user, $nisn);

        if (!$ortu || $ortu->siswa->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Data anak belum tertaut.'], 404);
        }

        $siswa = $nisn ? $ortu->siswa->firstWhere('nisn', $nisn) : $ortu->siswa->first();

        return response()->json(['success' => true, 'data' => $siswa]);
    }

    // -------------------------------------------------------
    // RIWAYAT ABSENSI ANAK
    // -------------------------------------------------------
    public function riwayatAbsensi(Request $request)
    {
        $user = $request->user();
        $nisn = $request->query('nisn');
        $ortu = $this->getOrtuAnak($user, $nisn);

        if (!$ortu || $ortu->siswa->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Data anak belum tertaut.'], 404);
        }

        $siswa = $nisn ? $ortu->siswa->firstWhere('nisn', $nisn) : $ortu->siswa->first();
        $query = Absensi::with(['jadwal.mataPelajaran'])->where('siswa_id', $siswa->id);

        $filter = $request->query('filter', 'bulan');
        if ($filter === 'minggu') {
            $query->whereBetween('tanggal', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
        } elseif ($filter === 'bulan') {
            $query->whereMonth('tanggal', Carbon::now()->month)
                ->whereYear('tanggal', Carbon::now()->year);
        } elseif ($filter === 'semester') {
            $riwayat = RiwayatKelas::where('siswa_id', $siswa->id)->aktif()->first();
            if ($riwayat) {
                $query->where('kelas_id', $riwayat->kelas_id);
            }
        }

        $absensi = $query->orderBy('tanggal', 'desc')->get();

        $summary = [
            'hadir' => $absensi->where('status', 'hadir')->count(),
            'sakit' => $absensi->where('status', 'sakit')->count(),
            'izin' => $absensi->where('status', 'izin')->count(),
            'alpha' => $absensi->where('status', 'alpha')->count(),
        ];

        $grouped = $absensi->groupBy(fn($a) => $a->tanggal->format('Y-m-d'))
            ->map(fn($rows, $tanggal) => [
                'tanggal' => $tanggal,
                'mapel' => $rows->map(fn($a) => [
                    'id' => $a->id,
                    'nama_mapel' => $a->jadwal?->mataPelajaran?->nama_mapel ?? 'Umum',
                    'jam_mulai' => $a->jadwal?->jam_mulai,
                    'jam_selesai' => $a->jadwal?->jam_selesai,
                    'status' => $a->status,
                    'keterangan' => $a->keterangan,
                ])->values(),
            ])->values();

        return response()->json([
            'success' => true,
            'data' => ['nisn' => $siswa->nisn, 'summary' => $summary, 'detail' => $grouped]
        ]);
    }

    // -------------------------------------------------------
    // DAFTAR ANAK YANG TERHUBUNG KE AKUN INI
    // -------------------------------------------------------
    public function daftarAnak(Request $request)
    {
        $user = $request->user();

        $anak = OrangTua::with('siswa')
            ->where('user_id', $user->id)
            ->get()
            ->flatMap(fn($ortu) => $ortu->siswa->map(fn($siswa) => [
                'siswa_id' => $siswa->id,
                'nisn' => $siswa->nisn,
                'nama' => $siswa->nama,
                'foto' => $siswa->foto,
                'hubungan' => $ortu->hubungan,
            ]))
            ->values();

        return response()->json(['success' => true, 'data' => $anak]);
    }

    // -------------------------------------------------------
    // TAMBAH ANAK (link siswa ke akun ortu)
    // -------------------------------------------------------
    public function tambahAnak(Request $request)
    {
        $request->validate([
            'nisn' => 'required|string|size:10|exists:siswas,nisn',
            'kode_anak' => 'required|string|size:10', // ponytail: cegah claim anak sembarangan
            'hubungan' => 'required|in:Ayah,Ibu,Wali',
        ]);

        $user = $request->user();
        $siswa = Siswa::where('nisn', $request->nisn)
            ->where('kode_anak', $request->kode_anak)
            ->first();

        if (!$siswa) {
            return response()->json(['success' => false, 'message' => 'NISN atau kode anak tidak valid.'], 422);
        }

        // Cek apakah sudah terhubung
        $sudahAda = OrangTua::where('user_id', $user->id)
            ->whereHas('siswa', fn($q) => $q->where('siswas.id', $siswa->id))
            ->exists();

        if ($sudahAda) {
            return response()->json(['success' => false, 'message' => 'NISN ini sudah terdaftar di akun kamu.'], 422);
        }

        DB::transaction(function () use ($user, $siswa, $request) {
            // Cari atau buat record orang_tua untuk user ini
            $ortu = OrangTua::firstOrCreate(
                ['user_id' => $user->id, 'hubungan' => $request->hubungan],
                ['nama' => $user->name, 'no_hp' => null]
            );

            // Link ke siswa via pivot
            DB::table('orang_tua_siswa')->insertOrIgnore([
                'siswa_id' => $siswa->id,
                'orang_tua_id' => $ortu->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Anak berhasil ditautkan ke akun kamu.',
        ], 201);
    }

    // -------------------------------------------------------
    // UPDATE HUBUNGAN ANAK
    // -------------------------------------------------------
    public function updateAnak(Request $request, string $nisn)
    {
        $request->validate(['hubungan' => 'required|in:Ayah,Ibu,Wali']);

        $user = $request->user();
        $siswa = Siswa::where('nisn', $nisn)->firstOrFail();

        $ortu = OrangTua::where('user_id', $user->id)
            ->whereHas('siswa', fn($q) => $q->where('id', $siswa->id))
            ->first();

        if (!$ortu) {
            return response()->json(['success' => false, 'message' => 'Data anak tidak ditemukan di akun ini.'], 404);
        }

        $ortu->hubungan = $request->hubungan;
        $ortu->save();

        return response()->json(['success' => true, 'message' => 'Status hubungan berhasil diperbarui.', 'data' => $ortu]);
    }

    // -------------------------------------------------------
    // HAPUS ANAK dari akun ini
    // -------------------------------------------------------
    public function hapusAnak(Request $request, string $nisn)
    {
        $user = $request->user();
        $siswa = Siswa::where('nisn', $nisn)->firstOrFail();

        $ortu = OrangTua::where('user_id', $user->id)
            ->whereHas('siswa', fn($q) => $q->where('id', $siswa->id))
            ->first();

        if (!$ortu) {
            return response()->json(['success' => false, 'message' => 'Data anak tidak ditemukan.'], 404);
        }

        // Hapus dari pivot, bukan hapus ortu itu sendiri
        DB::table('orang_tua_siswa')
            ->where('orang_tua_id', $ortu->id)
            ->where('siswa_id', $siswa->id)
            ->delete();

        return response()->json(['success' => true, 'message' => 'Anak berhasil dihapus dari akun kamu.']);
    }

    // -------------------------------------------------------
    // PENGUMUMAN
    // -------------------------------------------------------
    public function pengumuman(Request $request)
    {
        $kategori = $request->query('kategori');
        $query = Pengumuman::orderBy('created_at', 'desc')
            ->whereIn('target', ['semua', 'ortu'])
            ->where(fn($q) => $q->whereNull('publish_at')->orWhere('publish_at', '<=', now()));

        if ($kategori && $kategori !== 'semua') {
            $query->where('kategori', $kategori);
        }

        return response()->json(['success' => true, 'data' => $query->paginate(10)]);
    }

    // -------------------------------------------------------
    // PROFIL ORTU (user + data anak)
    // -------------------------------------------------------
    public function profil(Request $request)
    {
        $user = $request->user();
        $nisn = $request->query('nisn');
        $ortu = $this->getOrtuAnak($user, $nisn);

        if (!$ortu || $ortu->siswa->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Data anak belum tertaut.'], 404);
        }

        $siswa = $nisn ? $ortu->siswa->firstWhere('nisn', $nisn) : $ortu->siswa->first();
        $riwayat = RiwayatKelas::with(['kelas.wali'])->where('siswa_id', $siswa->id)->aktif()->first();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'nama' => $user->name,
                    'foto' => $user->foto,
                ],
                'ortu' => [
                    'hubungan' => $ortu->hubungan,
                    'no_hp' => $ortu->no_hp,
                    'pekerjaan' => $ortu->pekerjaan,
                ],
                'siswa' => [
                    'nisn' => $siswa->nisn,
                    'no_induk' => $siswa->no_induk,
                    'nama' => $siswa->nama,
                    'jenis_kelamin' => $siswa->jenis_kelamin,
                    'tempat_lahir' => $siswa->tempat_lahir,
                    'tanggal_lahir' => $siswa->tanggal_lahir,
                    'alamat' => $siswa->alamat_jalan,
                    'foto' => $siswa->foto,
                    'kelas' => $riwayat ? [
                        'nama_kelas' => $riwayat->kelas->nama_kelas,
                        'tingkat' => $riwayat->kelas->tingkat,
                        'wali_kelas' => $riwayat->kelas->wali ? [
                            'nama' => $riwayat->kelas->wali->nama,
                            'no_hp' => $riwayat->kelas->wali->no_hp,
                            'foto' => $riwayat->kelas->wali->foto,
                        ] : null,
                    ] : null,
                ],
            ]
        ]);
    }

    // -------------------------------------------------------
    // UPDATE PROFIL USER ORTU
    // -------------------------------------------------------
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

        if ($request->filled('password_baru')) {
            if (!$request->filled('password_lama')) {
                return response()->json(['success' => false, 'message' => 'Password lama wajib diisi.'], 400);
            }
            if (!Hash::check($request->password_lama, $user->password)) {
                return response()->json(['success' => false, 'message' => 'Password lama tidak cocok.'], 400);
            }
            $user->password = Hash::make($request->password_baru);
        }

        if ($request->filled('email'))
            $user->email = $request->email;
        if ($request->hasFile('foto')) {
            if ($user->foto && Storage::disk('public')->exists($user->foto)) {
                Storage::disk('public')->delete($user->foto);
            }
            $user->foto = $request->file('foto')->store('foto-ortu', 'public');
        }

        $user->save();

        // Update no_hp di tabel orang_tuas jika diisi
        if ($request->filled('no_hp')) {
            OrangTua::where('user_id', $user->id)->update(['no_hp' => $request->no_hp]);
        }

        return response()->json(['success' => true, 'message' => 'Profil berhasil diperbarui.', 'data' => $user]);
    }
}