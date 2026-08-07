<?php

use App\Http\Controllers\Guru\GuruDokumenController;
use App\Http\Controllers\Guru\GuruKepegawaianController;
use App\Http\Controllers\Guru\GuruProfileController;
use App\Http\Controllers\MasterData\GuruCutiController;
use App\Http\Controllers\MasterData\JadwalPelajaranController;
use App\Http\Controllers\MasterData\MasterDataGuruController;
use App\Http\Controllers\MasterData\MasterDataKelasController;
use App\Http\Controllers\MasterData\MasterDataMapelController;
use App\Http\Controllers\MasterData\MasterDataOrtuController;
use App\Http\Controllers\MasterData\MasterDataSiswaController;
use App\Http\Controllers\MasterData\NaikKelasController;
use App\Http\Controllers\MasterData\TahunAjaranController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:operator'])->prefix('operator/master-data')->group(function () {

    // ── GURU ──────────────────────────────────────────────────────────────────

    // List, stats, utility
    Route::get('/guru', [GuruProfileController::class, 'index']);
    Route::get('/guru/stats', [MasterDataGuruController::class, 'stats']);
    Route::get('/guru/dropdown', [MasterDataGuruController::class, 'dropdown']);
    Route::get('/guru/perhatian-detail', [MasterDataGuruController::class, 'perhatianDetail']);
    Route::get('/guru/tanpa-penugasan', [MasterDataGuruController::class, 'tanpaPenugasan']);
    Route::get('/guru/aktivitas-terkini', [MasterDataGuruController::class, 'aktivitasTerkini']);

    // Recycle Bin
    Route::get('/guru/trash', [MasterDataGuruController::class, 'trash']);
    Route::patch('/guru/{nuptk}/restore', [MasterDataGuruController::class, 'restore']);
    Route::delete('/guru/{nuptk}/force-delete', [MasterDataGuruController::class, 'forceDelete']);

    // Import
    Route::get('/guru/template', [MasterDataGuruController::class, 'downloadTemplate']);
    Route::post('/guru/import', [MasterDataGuruController::class, 'import']);
    Route::post('/guru/import-preview', [MasterDataGuruController::class, 'importPreview']);
    Route::post('/guru/import-execute', [MasterDataGuruController::class, 'importExecute']);
    Route::post('/guru/import-zip', [MasterDataGuruController::class, 'importZip']);
    Route::post('/guru/import-foto', [MasterDataGuruController::class, 'importFoto']);
    Route::get('/guru/import-status/{batchId}', [MasterDataGuruController::class, 'importStatus']);
    Route::get('/guru/import-history', [MasterDataGuruController::class, 'importHistory']);
    Route::get('/guru/import-error-report/{batchId}', [MasterDataGuruController::class, 'importErrorReport']);

    // Export & Backup
    Route::get('/guru/export', [MasterDataGuruController::class, 'export']);
    Route::get('/guru/backup', [MasterDataGuruController::class, 'exportBackup']);
    Route::post('/guru/restore', [MasterDataGuruController::class, 'restoreBackup']);

    // CRUD utama (GuruProfileController)
    Route::post('/guru', [GuruProfileController::class, 'store']);
    Route::get('/guru/{id}', [GuruProfileController::class, 'show']);
    Route::put('/guru/{id}', [GuruProfileController::class, 'update']);
    Route::delete('/guru/{id}', [GuruProfileController::class, 'destroy']);
    Route::post('/guru/{nuptk}/foto', [MasterDataGuruController::class, 'uploadFoto']);

    // DMS Dokumen (GuruDokumenController)
    Route::get('/guru/{guruId}/dokumen-dms', [GuruDokumenController::class, 'index']);
    Route::post('/guru/{guruId}/dokumen-dms', [GuruDokumenController::class, 'store']);
    Route::patch('/guru/dokumen-dms/{dokumenId}/verify', [GuruDokumenController::class, 'verify']);
    Route::delete('/guru/dokumen-dms/{dokumenId}', [GuruDokumenController::class, 'destroy']);

    // Kepegawaian (GuruKepegawaianController)
    Route::put('/guru/{guruId}/kepegawaian-detail', [GuruKepegawaianController::class, 'updateKepegawaian']);

    // Keluarga
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

    // Dokumen (DMS)
    Route::get('/guru/{nuptk}/dokumen', [MasterDataGuruController::class, 'getDokumen']);
    Route::post('/guru/{nuptk}/dokumen', [MasterDataGuruController::class, 'uploadDokumen']);
    Route::post('/guru/{nuptk}/dokumen/{id}', [MasterDataGuruController::class, 'updateDokumen']);
    Route::delete('/guru/{nuptk}/dokumen/{id}', [MasterDataGuruController::class, 'destroyDokumen']);
    Route::patch('/guru/{nuptk}/dokumen/{id}/approve', [MasterDataGuruController::class, 'approveDokumen']);
    Route::patch('/guru/{nuptk}/dokumen/{id}/reject', [MasterDataGuruController::class, 'rejectDokumen']);
    Route::get('/guru/{nuptk}/dokumen/{id}/versions', [MasterDataGuruController::class, 'getDokumenVersions']);
    Route::get('/guru/{nuptk}/dokumen/{id}/logs', [MasterDataGuruController::class, 'getDokumenLogs']);
    Route::get('/guru/{nuptk}/dokumen/{id}/download', [MasterDataGuruController::class, 'downloadDokumen']);
    Route::get('/guru/{nuptk}/dokumen-bulk-download', [MasterDataGuruController::class, 'bulkDownload']);
    Route::get('/guru/{nuptk}/file-download', [MasterDataGuruController::class, 'downloadFile']);

    // Administrasi
    Route::get('/guru/{nuptk}/administrasi', [MasterDataGuruController::class, 'getAdministrasi']);
    Route::put('/guru/{nuptk}/administrasi', [MasterDataGuruController::class, 'updateAdministrasi']);

    // Kompetensi
    Route::get('/guru/{nuptk}/kompetensi', [MasterDataGuruController::class, 'getKompetensi']);
    Route::post('/guru/{nuptk}/kompetensi', [MasterDataGuruController::class, 'storeKompetensi']);
    Route::put('/guru/{nuptk}/kompetensi/{id}', [MasterDataGuruController::class, 'updateKompetensi']);
    Route::delete('/guru/{nuptk}/kompetensi/{id}', [MasterDataGuruController::class, 'destroyKompetensi']);

    // Penugasan
    Route::get('/guru/{nuptk}/penugasan', [MasterDataGuruController::class, 'getPenugasan']);
    Route::post('/guru/{nuptk}/penugasan', [MasterDataGuruController::class, 'storePenugasan']);
    Route::delete('/guru/{nuptk}/penugasan/{id}', [MasterDataGuruController::class, 'destroyPenugasan']);

    // Diklat
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
    Route::post('/guru/{nuptk}/mutasi/{id}', [MasterDataGuruController::class, 'updateMutasi']); // fallback FormData
    Route::delete('/guru/{nuptk}/mutasi/{id}', [MasterDataGuruController::class, 'destroyMutasi']);

    // Jabatan
    Route::get('/guru/{nuptk}/jabatan', [MasterDataGuruController::class, 'getJabatan']);
    Route::post('/guru/{nuptk}/jabatan', [MasterDataGuruController::class, 'storeJabatan']);
    Route::put('/guru/{nuptk}/jabatan/{id}', [MasterDataGuruController::class, 'updateJabatan']);
    Route::delete('/guru/{nuptk}/jabatan/{id}', [MasterDataGuruController::class, 'destroyJabatan']);

    // PKG
    Route::get('/guru/{nuptk}/pkg', [MasterDataGuruController::class, 'getPkg']);
    Route::post('/guru/{nuptk}/pkg', [MasterDataGuruController::class, 'storePkg']);

    // Akun guru
    Route::get('/guru/{nuptk}/akun', function (\Illuminate\Http\Request $req, $nuptk) {
        $guru = \App\Models\Guru::where('nuptk', $nuptk)->with('user.roles')->first();
        if (!$guru || !$guru->user) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Guru belum memiliki akun.'
            ]);
        }
        $u = $guru->user;
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $u->id,
                'username' => $u->username ?? $u->email,
                'email' => $u->email,
                'role' => $u->roles->pluck('nama'),
                'is_active' => $u->is_active,
                'last_login_at' => $u->last_login_at,
            ]
        ]);
    });

    // Verifikasi data
    Route::patch('/guru/{nuptk}/verifikasi', [MasterDataGuruController::class, 'verifikasi']);
    Route::patch('/guru/{nuptk}/batal-verifikasi', [MasterDataGuruController::class, 'batalVerifikasi']);
    Route::patch('/guru/{nuptk}/koreksi-nuptk', [MasterDataGuruController::class, 'koreksiNuptk']);

    // ── SISWA ─────────────────────────────────────────────────────────────────

    Route::get('/siswa', [MasterDataSiswaController::class, 'index']);
    Route::post('/siswa', [MasterDataSiswaController::class, 'store']);
    Route::get('/siswa/orang-tua-options', [MasterDataSiswaController::class, 'orangTuaOptions']);
    Route::get('/siswa/{nisn}', [MasterDataSiswaController::class, 'show']);
    Route::put('/siswa/{nisn}', [MasterDataSiswaController::class, 'update']);
    Route::delete('/siswa/{nisn}', [MasterDataSiswaController::class, 'destroy']);
    Route::post('/siswa/{nisn}/assign-kelas', [MasterDataSiswaController::class, 'assignKelas']);
    Route::post('/siswa/{nisn}/foto', [MasterDataSiswaController::class, 'uploadFoto']);
    Route::post('/siswa/{nisn}/regenerate-kode-anak', [MasterDataSiswaController::class, 'regenerateKodeAnak']);

    // ── ORANG TUA ─────────────────────────────────────────────────────────────

    Route::get('/orang-tua', [MasterDataOrtuController::class, 'index']);
    Route::post('/orang-tua', [MasterDataOrtuController::class, 'store']);
    Route::get('/orang-tua/{id}', [MasterDataOrtuController::class, 'show']);
    Route::put('/orang-tua/{id}', [MasterDataOrtuController::class, 'update']);
    Route::delete('/orang-tua/{id}', [MasterDataOrtuController::class, 'destroy']);

    // ── KELAS ─────────────────────────────────────────────────────────────────

    Route::get('/kelas/dropdown', [MasterDataKelasController::class, 'dropdown']);
    Route::get('/kelas/tahun-ajaran', [MasterDataKelasController::class, 'tahunAjaranDropdown']);
    Route::get('/kelas', [MasterDataKelasController::class, 'index']);
    Route::post('/kelas', [MasterDataKelasController::class, 'store']);
    Route::get('/kelas/{id}', [MasterDataKelasController::class, 'show']);
    Route::get('/kelas/{id}/riwayat', [MasterDataKelasController::class, 'riwayatAkademik']);
    Route::get('/kelas/{kelasId}/periode/{tahunAjaranId}', [MasterDataKelasController::class, 'showPeriode']);
    Route::put('/kelas/{id}', [MasterDataKelasController::class, 'update']);
    Route::delete('/kelas/{id}', [MasterDataKelasController::class, 'destroy']);
    Route::post('/kelas/{id}/siswa', [MasterDataKelasController::class, 'tambahSiswa']);
    Route::patch('/kelas/{id}/siswa/{siswaKelasId}/keluar', [MasterDataKelasController::class, 'keluarkanSiswa']);
    Route::patch('/kelas/{id}/siswa/{siswaKelasId}/batalkan-keluar', [MasterDataKelasController::class, 'batalkanKeluar']);

    // ── TAHUN AJARAN ──────────────────────────────────────────────────────────

    Route::get('/tahun-ajaran', [TahunAjaranController::class, 'index']);
    Route::post('/tahun-ajaran', [TahunAjaranController::class, 'store']);
    Route::get('/tahun-ajaran/{id}', [TahunAjaranController::class, 'show']);
    Route::put('/tahun-ajaran/{id}', [TahunAjaranController::class, 'update']);
    Route::patch('/tahun-ajaran/{id}/aktif', [TahunAjaranController::class, 'setAktif']);
    Route::patch('/tahun-ajaran/{id}/semester-aktif', [TahunAjaranController::class, 'setSemesterAktif']);
    Route::delete('/tahun-ajaran/{id}', [TahunAjaranController::class, 'destroy']);

    // ── NAIK KELAS ────────────────────────────────────────────────────────────

    Route::get('/naik-kelas/preview', [NaikKelasController::class, 'preview']);
    Route::post('/naik-kelas/proses', [NaikKelasController::class, 'proses']);

    // ── MATA PELAJARAN ────────────────────────────────────────────────────────

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

    // ── JADWAL PELAJARAN ──────────────────────────────────────────────────────

    Route::get('/jadwal-pelajaran', [JadwalPelajaranController::class, 'index']);
    Route::post('/jadwal-pelajaran', [JadwalPelajaranController::class, 'store']);
    Route::put('/jadwal-pelajaran/{id}', [JadwalPelajaranController::class, 'update']);
    Route::delete('/jadwal-pelajaran/{id}', [JadwalPelajaranController::class, 'destroy']);
});