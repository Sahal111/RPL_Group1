<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Operator\OperatorController;
use App\Http\Controllers\Absensi\AbsensiController;
use App\Http\Controllers\Guru\GuruController;
use App\Http\Controllers\Kepsek\KepsekController;
use App\Http\Controllers\MasterData\MasterDataGuruController;
use App\Http\Controllers\MasterData\MasterDataSiswaController;
use App\Http\Controllers\MasterData\MasterDataOrtuController;
use App\Http\Controllers\MasterData\MasterDataKelasController;
use App\Http\Controllers\MasterData\TahunAjaranController;
use App\Http\Controllers\MasterData\NaikKelasController;
use App\Http\Controllers\MasterData\MasterDataMapelController;
use App\Http\Controllers\MasterData\JadwalPelajaranController;

// -------------------------------------------------------
// PUBLIC — tidak perlu token
// -------------------------------------------------------
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register-ortu', [AuthController::class, 'registerOrtu']);
});

// -------------------------------------------------------
// PROTECTED — perlu token Sanctum
// -------------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });

    // Placeholder routes absensi — akan diisi di step berikutnya
    Route::prefix('absensi')->group(function () {

        Route::middleware('role:guru,operator')->group(function () {
            Route::get('/kelas/{id_kelas}', [AbsensiController::class, 'showKelas']);
            Route::post('/', [AbsensiController::class, 'store']);
            Route::put('/{id}', [AbsensiController::class, 'update']);
        });

        Route::middleware('role:guru,kepsek,operator')->group(function () {
            Route::get('/rekap/{id_kelas}', [AbsensiController::class, 'rekap']);
        });

        Route::middleware('role:guru,operator,ortu')->group(function () {
            Route::get('/siswa/{nisn}', [AbsensiController::class, 'bySiswa']);
        });

    });



    // Operator only
    Route::middleware('role:operator')->prefix('operator')->group(function () {
        Route::get('/pengaturan/kode-registrasi', [OperatorController::class, 'getKodeRegistrasi']);
        Route::post('/pengaturan/kode-registrasi', [OperatorController::class, 'updateKodeRegistrasi']);
        Route::get('/users', [OperatorController::class, 'index']);
        Route::post('/operator', [OperatorController::class, 'createOperator']);
        Route::post('/guru', [OperatorController::class, 'createGuru']);
        Route::post('/kepsek', [OperatorController::class, 'createKepsek']);
        Route::post('/ortu', [OperatorController::class, 'createOrtu']);
        Route::patch('/users/{id}/toggle-active', [OperatorController::class, 'toggleActive']);
        Route::patch('/users/{id}/approve-ortu', [OperatorController::class, 'approveOrtu']);
        Route::get('/ortu/pending', [OperatorController::class, 'pendingOrtu']);
        Route::get('/ortu', [OperatorController::class, 'listOrtu']);
        Route::get('/ortu/{id}', [OperatorController::class, 'detailOrtu']);
        Route::put('/ortu/{id}', [OperatorController::class, 'updateOrtu']);
        Route::post('/ortu/{id}/anak', [OperatorController::class, 'attachAnakOrtu']);
        Route::patch('/users/{id}/reset-password', [OperatorController::class, 'resetPassword']);
        Route::delete('/users/{id}', [OperatorController::class, 'destroy']);
        Route::prefix('master-data')->group(function () {
            // Guru
            Route::get('/guru', [MasterDataGuruController::class, 'index']);
            Route::post('/guru', [MasterDataGuruController::class, 'store']);
            Route::get('/guru/{nuptk}', [MasterDataGuruController::class, 'show']);
            Route::put('/guru/{nuptk}', [MasterDataGuruController::class, 'update']);
            Route::delete('/guru/{nuptk}', [MasterDataGuruController::class, 'destroy']);
            Route::post('/guru/{nuptk}/foto', [MasterDataGuruController::class, 'uploadFoto']);
            // Lookup akun yang terhubung ke NUPTK
            Route::get('/guru/{nuptk}/akun', function (\Illuminate\Http\Request $req, $nuptk) {
                $userGuru = \App\Models\UserGuru::where('nuptk', $nuptk)->with('user')->first();
                if (!$userGuru || !$userGuru->user) {
                    return response()->json(['success' => true, 'data' => null]);
                }
                $u = $userGuru->user;
                return response()->json([
                    'success' => true,
                    'data' => [
                        'id' => $u->id,
                        'username' => $u->username,
                        'email' => $u->email,
                        'is_active' => $u->is_active,
                    ]
                ]);
            });

            // Siswa
            Route::get('/siswa', [MasterDataSiswaController::class, 'index']);
            Route::post('/siswa', [MasterDataSiswaController::class, 'store']);
            Route::get('/siswa/orang-tua-options', [MasterDataSiswaController::class, 'orangTuaOptions']);
            Route::get('/siswa/{nisn}', [MasterDataSiswaController::class, 'show']);
            Route::put('/siswa/{nisn}', [MasterDataSiswaController::class, 'update']);
            Route::delete('/siswa/{nisn}', [MasterDataSiswaController::class, 'destroy']);
            Route::post('/siswa/{nisn}/assign-kelas', [MasterDataSiswaController::class, 'assignKelas']);
            Route::post('/siswa/{nisn}/foto', [MasterDataSiswaController::class, 'uploadFoto']);
            Route::post('/siswa/{nisn}/regenerate-kode-anak', [MasterDataSiswaController::class, 'regenerateKodeAnak']);

            // Orang Tua
            Route::get('/orang-tua', [MasterDataOrtuController::class, 'index']);
            Route::post('/orang-tua', [MasterDataOrtuController::class, 'store']);
            Route::get('/orang-tua/{id}', [MasterDataOrtuController::class, 'show']);
            Route::put('/orang-tua/{id}', [MasterDataOrtuController::class, 'update']);
            Route::delete('/orang-tua/{id}', [MasterDataOrtuController::class, 'destroy']);

            // Tahun Ajaran — HARUS SEBELUM /kelas/{id}
            Route::get('/kelas/tahun-ajaran', [MasterDataKelasController::class, 'tahunAjaranDropdown']);

            // Kelas
            // Route::get('/kelas', [MasterDataKelasController::class, 'index']);
            // Route::post('/kelas', [MasterDataKelasController::class, 'store']);
            // Route::get('/kelas/{id}', [MasterDataKelasController::class, 'show']);
            // Route::put('/kelas/{id}', [MasterDataKelasController::class, 'update']);
            // Route::delete('/kelas/{id}', [MasterDataKelasController::class, 'destroy']);
            Route::get('/kelas/tahun-ajaran', [MasterDataKelasController::class, 'tahunAjaranDropdown']);
            Route::get('/kelas', [MasterDataKelasController::class, 'index']);
            Route::post('/kelas', [MasterDataKelasController::class, 'store']);
            Route::get('/kelas/dropdown', [MasterDataKelasController::class, 'dropdown']);
            Route::get('/kelas/{id}', [MasterDataKelasController::class, 'show']);
            Route::put('/kelas/{id}', [MasterDataKelasController::class, 'update']);
            Route::delete('/kelas/{id}', [MasterDataKelasController::class, 'destroy']);
            Route::post('/kelas/{id}/siswa', [MasterDataKelasController::class, 'tambahSiswa']);
            Route::patch('/kelas/{id}/siswa/{siswaKelasId}/keluar', [MasterDataKelasController::class, 'keluarkanSiswa']);
            Route::patch('/kelas/{id}/siswa/{siswaKelasId}/batalkan-keluar', [MasterDataKelasController::class, 'batalkanKeluar']);

            // Tahun Ajaran
            Route::get('/tahun-ajaran', [TahunAjaranController::class, 'index']);
            Route::post('/tahun-ajaran', [TahunAjaranController::class, 'store']);
            Route::get('/tahun-ajaran/{id}', [TahunAjaranController::class, 'show']);
            Route::put('/tahun-ajaran/{id}', [TahunAjaranController::class, 'update']);
            Route::patch('/tahun-ajaran/{id}/aktif', [TahunAjaranController::class, 'setAktif']);
            Route::delete('/tahun-ajaran/{id}', [TahunAjaranController::class, 'destroy']);

            // Naik Kelas Massal
            Route::get('/naik-kelas/preview', [NaikKelasController::class, 'preview']);
            Route::post('/naik-kelas/proses', [NaikKelasController::class, 'proses']);

            // Mata Pelajaran
            Route::get('/mapel/dropdown', [MasterDataMapelController::class, 'dropdown']);
            Route::get('/mapel', [MasterDataMapelController::class, 'index']);
            Route::post('/mapel', [MasterDataMapelController::class, 'store']);
            Route::get('/mapel/{id}', [MasterDataMapelController::class, 'show']);
            Route::put('/mapel/{id}', [MasterDataMapelController::class, 'update']);
            Route::patch('/mapel/{id}/toggle-active', [MasterDataMapelController::class, 'toggleActive']);
            Route::delete('/mapel/{id}', [MasterDataMapelController::class, 'destroy']);

            // Jadwal Pelajaran
            Route::get('/jadwal-pelajaran', [JadwalPelajaranController::class, 'index']);
            Route::post('/jadwal-pelajaran', [JadwalPelajaranController::class, 'store']);
            Route::put('/jadwal-pelajaran/{id}', [JadwalPelajaranController::class, 'update']);
            Route::delete('/jadwal-pelajaran/{id}', [JadwalPelajaranController::class, 'destroy']);
        });

        // Pengumuman
        Route::post('/pengumuman', [\App\Http\Controllers\PengumumanController::class, 'store']);
        Route::put('/pengumuman/{id}', [\App\Http\Controllers\PengumumanController::class, 'update']);
        Route::delete('/pengumuman/{id}', [\App\Http\Controllers\PengumumanController::class, 'destroy']);
    });


    // dalam Route::middleware('auth:sanctum')

    // Pengumuman (Bisa dilihat semua user yang login)
    Route::get('/pengumuman', [\App\Http\Controllers\PengumumanController::class, 'index']);

    // Guru
    Route::middleware('role:guru')->prefix('guru')->group(function () {
        Route::get('/dashboard', [GuruController::class, 'dashboard']);
        Route::get('/siswa', [GuruController::class, 'siswaSaya']);
        Route::get('/siswa/{nisn}', [GuruController::class, 'detailSiswa']);
        Route::get('/kelas', [GuruController::class, 'kelasSaya']);
        Route::get('/kelas/{id_kelas}', [GuruController::class, 'detailKelas']);
        Route::get('/kelas/{id_kelas}/riwayat', [GuruController::class, 'riwayatAbsensi']);
        Route::get('/kelas/{id_kelas}/rekap', [AbsensiController::class, 'rekap']);
        Route::get('/kelas/{id_kelas}/jadwal-hari-ini', [AbsensiController::class, 'jadwalHariIni']);
        Route::get('/jadwal', [GuruController::class, 'jadwalMengajar']);

        // Profil
        Route::get('/profil', [GuruController::class, 'profil']);
        Route::post('/profil/update', [GuruController::class, 'updateProfil']);
    });

    // Kepsek
    Route::middleware('role:kepsek')->prefix('kepsek')->group(function () {
        Route::get('/dashboard', [KepsekController::class, 'dashboard']);
        Route::get('/rekap', [KepsekController::class, 'rekapSemuaKelas']);
        Route::get('/siswa-alpa', [KepsekController::class, 'siswaAlpaTerbanyak']);

        // Data Guru (read-only)
        Route::get('/guru', [KepsekController::class, 'daftarGuru']);
        Route::get('/guru/{nuptk}', [KepsekController::class, 'detailGuru']);

        // Data Siswa (read-only)
        Route::get('/siswa', [KepsekController::class, 'daftarSiswa']);
        Route::get('/siswa/{nisn}', [KepsekController::class, 'detailSiswa']);
        Route::get('/kelas-filter', [KepsekController::class, 'daftarKelasFilter']);
        Route::post('/pengumuman', [\App\Http\Controllers\PengumumanController::class, 'store']);
        Route::put('/pengumuman/{id}', [\App\Http\Controllers\PengumumanController::class, 'update']);
        Route::delete('/pengumuman/{id}', [\App\Http\Controllers\PengumumanController::class, 'destroy']);

        // Kalender Akademik
        Route::get('/kalender', [\App\Http\Controllers\Kepsek\KalenderAkademikController::class, 'index']);
        Route::post('/kalender', [\App\Http\Controllers\Kepsek\KalenderAkademikController::class, 'store']);
        Route::put('/kalender/{id}', [\App\Http\Controllers\Kepsek\KalenderAkademikController::class, 'update']);
        Route::delete('/kalender/{id}', [\App\Http\Controllers\Kepsek\KalenderAkademikController::class, 'destroy']);
    });

    // Ortu
    Route::middleware('role:ortu')->prefix('ortu')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Ortu\OrtuController::class, 'dashboard']);
        Route::get('/profil-anak', [\App\Http\Controllers\Ortu\OrtuController::class, 'profilAnak']);
        Route::get('/absensi', [\App\Http\Controllers\Ortu\OrtuController::class, 'riwayatAbsensi']);
        Route::get('/pengumuman', [\App\Http\Controllers\Ortu\OrtuController::class, 'pengumuman']);
        Route::get('/daftar-anak', [\App\Http\Controllers\Ortu\OrtuController::class, 'daftarAnak']);
        Route::post('/anak', [\App\Http\Controllers\Ortu\OrtuController::class, 'tambahAnak']);
        Route::put('/anak/{nisn}', [\App\Http\Controllers\Ortu\OrtuController::class, 'updateAnak']);
        Route::delete('/anak/{nisn}', [\App\Http\Controllers\Ortu\OrtuController::class, 'hapusAnak']);
        Route::get('/profil', [\App\Http\Controllers\Ortu\OrtuController::class, 'profil']);
        Route::post('/profil', [\App\Http\Controllers\Ortu\OrtuController::class, 'updateProfil']);
    });

});