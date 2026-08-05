<?php 

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Operator\OperatorController;
use App\Http\Controllers\Absensi\AbsensiController;
use App\Http\Controllers\Guru\GuruController;
use App\Http\Controllers\Kepsek\KepsekController;
use App\Http\Controllers\MasterData\MasterDataGuruController;
use App\Http\Controllers\MasterData\GuruCutiController;
use App\Http\Controllers\MasterData\MasterDataSiswaController;
use App\Http\Controllers\MasterData\MasterDataOrtuController;
use App\Http\Controllers\MasterData\MasterDataKelasController;
use App\Http\Controllers\MasterData\TahunAjaranController;
use App\Http\Controllers\MasterData\NaikKelasController;
use App\Http\Controllers\MasterData\MasterDataMapelController;
use App\Http\Controllers\MasterData\JadwalPelajaranController; -->

// -------------------------------------------------------
// PUBLIC — tidak perlu token
// -------------------------------------------------------
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/register-ortu', [AuthController::class, 'registerOrtu'])->middleware('throttle:10,1');
});

//Galeri publik (tidak perlu login)
Route::get('/galeri', [\App\Http\Controllers\GaleriController::class, 'index']);

// -------------------------------------------------------
// PROTECTED — perlu token Sanctum
// -------------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {

    //Auth
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
        Route::post('/bendahara', [OperatorController::class, 'createBendahara']);
        Route::post('/walikelas', [OperatorController::class, 'createWaliKelas']);
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
            // ── Master Data Guru ──────────────────────────────────────
            Route::get('/guru', [MasterDataGuruController::class, 'index']);
            Route::get('/guru/stats', [MasterDataGuruController::class, 'stats']);
            Route::get('/guru/perhatian-detail', [MasterDataGuruController::class, 'perhatianDetail']);
            Route::get('/guru/tanpa-penugasan', [MasterDataGuruController::class, 'tanpaPenugasan']);
            Route::get('/guru/aktivitas-terkini', [MasterDataGuruController::class, 'aktivitasTerkini']);
            Route::get('/guru/dropdown', [MasterDataGuruController::class, 'dropdown']);

            // ── Recycle Bin ──
            Route::get('/guru/trash', [MasterDataGuruController::class, 'trash']);
            Route::patch('/guru/{nuptk}/restore', [MasterDataGuruController::class, 'restore']);
            Route::delete('/guru/{nuptk}/force-delete', [MasterDataGuruController::class, 'forceDelete']);
            // Import / Export / Backup (harus sebelum /{nuptk})
            Route::get('/guru/template', [MasterDataGuruController::class, 'downloadTemplate']);
            // Import enterprise
            Route::post('/guru/import', [MasterDataGuruController::class, 'import']);           // legacy — tetap ada
            Route::post('/guru/import-preview', [MasterDataGuruController::class, 'importPreview']);
            Route::post('/guru/import-execute', [MasterDataGuruController::class, 'importExecute']);
            Route::post('/guru/import-zip', [MasterDataGuruController::class, 'importZip']);
            Route::post('/guru/import-foto', [MasterDataGuruController::class, 'importFoto']);
            Route::get('/guru/import-status/{batchId}', [MasterDataGuruController::class, 'importStatus']);
            Route::get('/guru/import-history', [MasterDataGuruController::class, 'importHistory']);
            Route::get('/guru/import-error-report/{batchId}', [MasterDataGuruController::class, 'importErrorReport']);
            Route::post('/guru/restore', [MasterDataGuruController::class, 'restoreBackup']);
            // Export
            Route::get('/guru/export', [MasterDataGuruController::class, 'export']);
            Route::get('/guru/backup', [MasterDataGuruController::class, 'exportBackup']);
            // CRUD utama
            Route::post('/guru', [MasterDataGuruController::class, 'store']);
            Route::get('/guru/{nuptk}', [MasterDataGuruController::class, 'show']);
            Route::put('/guru/{nuptk}', [MasterDataGuruController::class, 'update']);
            Route::delete('/guru/{nuptk}', [MasterDataGuruController::class, 'destroy']);
            Route::post('/guru/{nuptk}/foto', [MasterDataGuruController::class, 'uploadFoto']);

            // Keluarga & anak
            Route::get('/guru/{nuptk}/keluarga', [MasterDataGuruController::class, 'getKeluarga']);
            Route::put('/guru/{nuptk}/keluarga', [MasterDataGuruController::class, 'updateKeluarga']);

            // Kontak darurat
            Route::get('/guru/{nuptk}/kontak-darurat', [MasterDataGuruController::class, 'getKontakDarurat']);
            Route::post('/guru/{nuptk}/kontak-darurat', [MasterDataGuruController::class, 'storeKontakDarurat']);
            Route::put('/guru/{nuptk}/kontak-darurat/{id}', [MasterDataGuruController::class, 'updateKontakDarurat']);
            Route::delete('/guru/{nuptk}/kontak-darurat/{id}', [MasterDataGuruController::class, 'destroyKontakDarurat']);

            // Pendidikan
            Route::get('/guru/{nuptk}/pendidikan', [MasterDataGuruController::class, 'getPendidikan']);
            Route::post('/guru/{nuptk}/pendidikan', [MasterDataGuruController::class, 'storePendidikan']);
            Route::put('/guru/{nuptk}/pendidikan/{id}', [MasterDataGuruController::class, 'updatePendidikan']);
            Route::delete('/guru/{nuptk}/pendidikan/{id}', [MasterDataGuruController::class, 'destroyPendidikan']);

            // Sertifikasi
            Route::get('/guru/{nuptk}/sertifikasi', [MasterDataGuruController::class, 'getSertifikasi']);
            Route::post('/guru/{nuptk}/sertifikasi', [MasterDataGuruController::class, 'storeSertifikasi']);
            Route::put('/guru/{nuptk}/sertifikasi/{id}', [MasterDataGuruController::class, 'updateSertifikasi']);
            Route::delete('/guru/{nuptk}/sertifikasi/{id}', [MasterDataGuruController::class, 'destroySertifikasi']);

            // Inpassing
            Route::get('/guru/{nuptk}/inpassing', [MasterDataGuruController::class, 'getInpassing']);
            Route::post('/guru/{nuptk}/inpassing', [MasterDataGuruController::class, 'storeInpassing']);
            Route::put('/guru/{nuptk}/inpassing/{id}', [MasterDataGuruController::class, 'updateInpassing']);
            Route::delete('/guru/{nuptk}/inpassing/{id}', [MasterDataGuruController::class, 'destroyInpassing']);

            // Dokumen upload
            Route::get('/guru/{nuptk}/dokumen', [MasterDataGuruController::class, 'getDokumen']);
            Route::post('/guru/{nuptk}/dokumen', [MasterDataGuruController::class, 'uploadDokumen']);
            Route::post('/guru/{nuptk}/dokumen/{id}', [MasterDataGuruController::class, 'updateDokumen']);
            Route::delete('/guru/{nuptk}/dokumen/{id}', [MasterDataGuruController::class, 'destroyDokumen']);
            // DMS — tambahan
            Route::patch('/guru/{nuptk}/dokumen/{id}/approve', [MasterDataGuruController::class, 'approveDokumen']);
            Route::patch('/guru/{nuptk}/dokumen/{id}/reject', [MasterDataGuruController::class, 'rejectDokumen']);
            Route::get('/guru/{nuptk}/dokumen/{id}/versions', [MasterDataGuruController::class, 'getDokumenVersions']);
            Route::get('/guru/{nuptk}/dokumen/{id}/logs', [MasterDataGuruController::class, 'getDokumenLogs']);
            Route::get('/guru/{nuptk}/dokumen-bulk-download', [MasterDataGuruController::class, 'bulkDownload']);

            // Administrasi (rekening, BPJS, NPWP)
            Route::get('/guru/{nuptk}/administrasi', [MasterDataGuruController::class, 'getAdministrasi']);
            Route::put('/guru/{nuptk}/administrasi', [MasterDataGuruController::class, 'updateAdministrasi']);

            // Kompetensi
            Route::get('/guru/{nuptk}/kompetensi', [MasterDataGuruController::class, 'getKompetensi']);
            Route::post('/guru/{nuptk}/kompetensi', [MasterDataGuruController::class, 'storeKompetensi']);
            Route::put('/guru/{nuptk}/kompetensi/{id}', [MasterDataGuruController::class, 'updateKompetensi']);
            Route::delete('/guru/{nuptk}/kompetensi/{id}', [MasterDataGuruController::class, 'destroyKompetensi']);

            // Penugasan (Plot Guru Mapel)
            Route::get('/guru/{nuptk}/penugasan', [MasterDataGuruController::class, 'getPenugasan']);
            Route::post('/guru/{nuptk}/penugasan', [MasterDataGuruController::class, 'storePenugasan']);
            Route::delete('/guru/{nuptk}/penugasan/{id}', [MasterDataGuruController::class, 'destroyPenugasan']);
            // Diklat / pelatihan
            Route::get('/guru/{nuptk}/diklat', [MasterDataGuruController::class, 'getDiklat']);
            Route::post('/guru/{nuptk}/diklat', [MasterDataGuruController::class, 'storeDiklat']);
            Route::put('/guru/{nuptk}/diklat/{id}', [MasterDataGuruController::class, 'updateDiklat']);
            Route::delete('/guru/{nuptk}/diklat/{id}', [MasterDataGuruController::class, 'destroyDiklat']);

            // Cuti
            Route::get('/guru/{nuptk}/cuti', [GuruCutiController::class, 'index']);
            Route::post('/guru/{nuptk}/cuti', [GuruCutiController::class, 'store']);
            Route::put('/guru/{nuptk}/cuti/{id}', [GuruCutiController::class, 'update']);
            Route::post('/guru/{nuptk}/cuti/{id}', [GuruCutiController::class, 'update']); // fallback FormData
            Route::patch('/guru/{nuptk}/cuti/{id}/selesai', [GuruCutiController::class, 'selesai']);
            Route::delete('/guru/{nuptk}/cuti/{id}', [GuruCutiController::class, 'destroy']);

            // Mutasi
            Route::get('/guru/{nuptk}/mutasi', [MasterDataGuruController::class, 'getMutasi']);
            Route::get('/guru/{nuptk}/mutasi/allowed-transitions', [MasterDataGuruController::class, 'allowedTransitions']);
            Route::post('/guru/{nuptk}/mutasi/analyze', [MasterDataGuruController::class, 'analyzeMutasi']);
            Route::post('/guru/{nuptk}/mutasi', [MasterDataGuruController::class, 'storeMutasi']);
            Route::put('/guru/{nuptk}/mutasi/{id}', [MasterDataGuruController::class, 'updateMutasi']);
            Route::post('/guru/{nuptk}/mutasi/{id}', [MasterDataGuruController::class, 'updateMutasi']); // ← tambah ini untuk _method=PUT dari FormData
            Route::delete('/guru/{nuptk}/mutasi/{id}', [MasterDataGuruController::class, 'destroyMutasi']);

            // Jabatan
            Route::get('/guru/{nuptk}/jabatan', [MasterDataGuruController::class, 'getJabatan']);
            Route::post('/guru/{nuptk}/jabatan', [MasterDataGuruController::class, 'storeJabatan']);
            Route::put('/guru/{nuptk}/jabatan/{id}', [MasterDataGuruController::class, 'updateJabatan']);
            Route::delete('/guru/{nuptk}/jabatan/{id}', [MasterDataGuruController::class, 'destroyJabatan']);

            Route::patch('/guru/{nuptk}/verifikasi', [MasterDataGuruController::class, 'verifikasi']);
            Route::patch('/guru/{nuptk}/batal-verifikasi', [MasterDataGuruController::class, 'batalVerifikasi']);
            Route::patch('/guru/{nuptk}/koreksi-nuptk', [MasterDataGuruController::class, 'koreksiNuptk']);

            // PKG
            Route::get('/guru/{nuptk}/pkg', [MasterDataGuruController::class, 'getPkg']);
            Route::post('/guru/{nuptk}/pkg', [MasterDataGuruController::class, 'storePkg']);

            // Akun (sudah ada, tidak berubah)
            Route::get('/guru/{nuptk}/akun', function (\Illuminate\Http\Request $req, $nuptk) {
                $guru = \App\Models\Guru::where('nuptk', $nuptk)->with('user')->first();
                if (!$guru || !$guru->user) {
                    return response()->json(['success' => true, 'data' => null, 'message' => 'Guru belum memiliki akun.'], 200);
                }
                $u = $guru->user;
                return response()->json(['success' => true, 'data' => ['id' => $u->id, 'username' => $u->username ?? $u->email, 'email' => $u->email, 'role' => $u->roles->pluck('name'), 'is_active' => $u->is_active, 'last_login_at' => $u->last_login_at]]);
            });

            Route::get('/guru/{nuptk}/dokumen/{id}/download', [MasterDataGuruController::class, 'downloadDokumen']);
            Route::get('/guru/{nuptk}/dokumen-bulk-download', [MasterDataGuruController::class, 'bulkDownload']);
            Route::get('/guru/{nuptk}/file-download', [MasterDataGuruController::class, 'downloadFile']);

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

            // Kelas
            Route::get('/kelas', [MasterDataKelasController::class, 'index']);
            Route::post('/kelas', [MasterDataKelasController::class, 'store']);
            Route::get('/kelas/dropdown', [MasterDataKelasController::class, 'dropdown']);
            Route::get('/kelas/tahun-ajaran', [MasterDataKelasController::class, 'tahunAjaranDropdown']);
            Route::get('/kelas/{id}', [MasterDataKelasController::class, 'show']);
            Route::get('/kelas/{id}/riwayat', [MasterDataKelasController::class, 'riwayatAkademik']);
            Route::get('/kelas/{kelasId}/periode/{tahunAjaranId}', [MasterDataKelasController::class, 'showPeriode']);
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
            Route::patch('/tahun-ajaran/{id}/semester-aktif', [TahunAjaranController::class, 'setSemesterAktif']);
            Route::delete('/tahun-ajaran/{id}', [TahunAjaranController::class, 'destroy']);

            // Naik Kelas Massal
            Route::get('/naik-kelas/preview', [NaikKelasController::class, 'preview']);
            Route::post('/naik-kelas/proses', [NaikKelasController::class, 'proses']);

            // Mata Pelajaran
            Route::get('/mapel/dropdown', [MasterDataMapelController::class, 'dropdown']);
            Route::get('/mapel/export', [MasterDataMapelController::class, 'export']);
            Route::get('/mapel/template', [MasterDataMapelController::class, 'downloadTemplate']);
            Route::post('/mapel/import', [MasterDataMapelController::class, 'import']);
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

        // Galeri Foto
        Route::post('/galeri', [\App\Http\Controllers\GaleriController::class, 'store']);
        Route::delete('/galeri/{id}', [\App\Http\Controllers\GaleriController::class, 'destroy']);
    });


    // dalam Route::middleware('auth:sanctum')

    // Pengumuman (Bisa dilihat semua user yang login)
    Route::get('/pengumuman', [\App\Http\Controllers\PengumumanController::class, 'index']);

    //Guru
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

    //Kepsek
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
        Route::get('/profil', [\App\Http\Controllers\Kepsek\KepsekController::class, 'profil']);
        Route::post('/profil/update', [\App\Http\Controllers\Kepsek\KepsekController::class, 'updateProfil']);
    });

    //Ortu
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