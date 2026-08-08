<?php

use App\Http\Controllers\MasterData\Guru\GuruAdministrasiController;
use App\Http\Controllers\MasterData\Guru\GuruController as MasterGuruController;
use App\Http\Controllers\MasterData\Guru\GuruDokumenController as MasterGuruDokumenController;
use App\Http\Controllers\MasterData\Guru\GuruExportController;
use App\Http\Controllers\MasterData\Guru\GuruImportController;
use App\Http\Controllers\MasterData\Guru\GuruKeluargaController;
use App\Http\Controllers\MasterData\Guru\GuruKepegawaianController as MasterGuruKepegawaianController;
use App\Http\Controllers\MasterData\Guru\GuruKompetensiController;
use App\Http\Controllers\MasterData\Guru\GuruMutasiController;
use App\Http\Controllers\MasterData\GuruCutiController;
use App\Http\Controllers\MasterData\JadwalPelajaranController;
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
    Route::get('/guru', [MasterGuruController::class, 'index']);
    Route::get('/guru/stats', [MasterGuruController::class, 'stats']);
    Route::get('/guru/dropdown', [MasterGuruController::class, 'dropdown']);
    Route::get('/guru/perhatian-detail', [MasterGuruController::class, 'perhatianDetail']);
    Route::get('/guru/tanpa-penugasan', [MasterGuruController::class, 'tanpaPenugasan']);
    Route::get('/guru/aktivitas-terkini', [MasterGuruController::class, 'aktivitasTerkini']);

    // Recycle Bin
    Route::get('/guru/trash', [MasterGuruController::class, 'trash']);
    Route::patch('/guru/{nuptk}/restore', [MasterGuruController::class, 'restore']);
    Route::delete('/guru/{nuptk}/force-delete', [MasterGuruController::class, 'forceDelete']);

    // Import
    Route::get('/guru/template', [GuruImportController::class, 'downloadTemplate']);
    Route::post('/guru/import', [GuruImportController::class, 'import']);
    Route::post('/guru/import-preview', [GuruImportController::class, 'importPreview']);
    Route::post('/guru/import-execute', [GuruImportController::class, 'importExecute']);
    Route::post('/guru/import-zip', [GuruImportController::class, 'importZip']);
    Route::post('/guru/import-foto', [GuruImportController::class, 'importFoto']);
    Route::get('/guru/import-status/{batchId}', [GuruImportController::class, 'importStatus']);
    Route::get('/guru/import-history', [GuruImportController::class, 'importHistory']);
    Route::get('/guru/import-error-report/{batchId}', [GuruImportController::class, 'importErrorReport']);

    // Export & Backup
    Route::get('/guru/export', [GuruExportController::class, 'export']);
    Route::get('/guru/backup', [GuruExportController::class, 'exportBackup']);
    Route::post('/guru/restore', [GuruImportController::class, 'restoreBackup']);

    // CRUD utama
    Route::post('/guru', [MasterGuruController::class, 'store']);
    Route::get('/guru/{nuptk}', [MasterGuruController::class, 'show']);
    Route::put('/guru/{nuptk}', [MasterGuruController::class, 'update']);
    Route::delete('/guru/{nuptk}', [MasterGuruController::class, 'destroy']);
    Route::post('/guru/{nuptk}/foto', [MasterGuruController::class, 'uploadFoto']);

    // Verifikasi data
    Route::patch('/guru/{nuptk}/verifikasi', [MasterGuruController::class, 'verifikasi']);
    Route::patch('/guru/{nuptk}/batal-verifikasi', [MasterGuruController::class, 'batalVerifikasi']);
    Route::patch('/guru/{nuptk}/koreksi-nuptk', [MasterGuruController::class, 'koreksiNuptk']);

    // Keluarga
    Route::get('/guru/{nuptk}/keluarga', [GuruKeluargaController::class, 'getKeluarga']);
    Route::put('/guru/{nuptk}/keluarga', [GuruKeluargaController::class, 'updateKeluarga']);

    // Kontak darurat
    Route::get('/guru/{nuptk}/kontak-darurat', [GuruKeluargaController::class, 'getKontakDarurat']);
    Route::post('/guru/{nuptk}/kontak-darurat', [GuruKeluargaController::class, 'storeKontakDarurat']);
    Route::put('/guru/{nuptk}/kontak-darurat/{id}', [GuruKeluargaController::class, 'updateKontakDarurat']);
    Route::delete('/guru/{nuptk}/kontak-darurat/{id}', [GuruKeluargaController::class, 'destroyKontakDarurat']);

    // Pendidikan
    Route::get('/guru/{nuptk}/pendidikan', [MasterGuruKepegawaianController::class, 'getPendidikan']);
    Route::post('/guru/{nuptk}/pendidikan', [MasterGuruKepegawaianController::class, 'storePendidikan']);
    Route::put('/guru/{nuptk}/pendidikan/{id}', [MasterGuruKepegawaianController::class, 'updatePendidikan']);
    Route::delete('/guru/{nuptk}/pendidikan/{id}', [MasterGuruKepegawaianController::class, 'destroyPendidikan']);

    // Sertifikasi
    Route::get('/guru/{nuptk}/sertifikasi', [MasterGuruKepegawaianController::class, 'getSertifikasi']);
    Route::post('/guru/{nuptk}/sertifikasi', [MasterGuruKepegawaianController::class, 'storeSertifikasi']);
    Route::put('/guru/{nuptk}/sertifikasi/{id}', [MasterGuruKepegawaianController::class, 'updateSertifikasi']);
    Route::delete('/guru/{nuptk}/sertifikasi/{id}', [MasterGuruKepegawaianController::class, 'destroySertifikasi']);

    // Inpassing
    Route::get('/guru/{nuptk}/inpassing', [MasterGuruKepegawaianController::class, 'getInpassing']);
    Route::post('/guru/{nuptk}/inpassing', [MasterGuruKepegawaianController::class, 'storeInpassing']);
    Route::put('/guru/{nuptk}/inpassing/{id}', [MasterGuruKepegawaianController::class, 'updateInpassing']);
    Route::delete('/guru/{nuptk}/inpassing/{id}', [MasterGuruKepegawaianController::class, 'destroyInpassing']);

    // Jabatan
    Route::get('/guru/{nuptk}/jabatan', [MasterGuruKepegawaianController::class, 'getJabatan']);
    Route::post('/guru/{nuptk}/jabatan', [MasterGuruKepegawaianController::class, 'storeJabatan']);
    Route::put('/guru/{nuptk}/jabatan/{id}', [MasterGuruKepegawaianController::class, 'updateJabatan']);
    Route::delete('/guru/{nuptk}/jabatan/{id}', [MasterGuruKepegawaianController::class, 'destroyJabatan']);

    // Dokumen (DMS)
    Route::get('/guru/{nuptk}/dokumen', [MasterGuruDokumenController::class, 'getDokumen']);
    Route::post('/guru/{nuptk}/dokumen', [MasterGuruDokumenController::class, 'uploadDokumen']);
    Route::post('/guru/{nuptk}/dokumen/{id}', [MasterGuruDokumenController::class, 'updateDokumen']);
    Route::delete('/guru/{nuptk}/dokumen/{id}', [MasterGuruDokumenController::class, 'destroyDokumen']);
    Route::patch('/guru/{nuptk}/dokumen/{id}/approve', [MasterGuruDokumenController::class, 'approveDokumen']);
    Route::patch('/guru/{nuptk}/dokumen/{id}/reject', [MasterGuruDokumenController::class, 'rejectDokumen']);
    Route::get('/guru/{nuptk}/dokumen/{id}/versions', [MasterGuruDokumenController::class, 'getDokumenVersions']);
    Route::get('/guru/{nuptk}/dokumen/{id}/logs', [MasterGuruDokumenController::class, 'getDokumenLogs']);
    Route::get('/guru/{nuptk}/dokumen/{id}/download', [MasterGuruDokumenController::class, 'downloadDokumen']);
    Route::get('/guru/{nuptk}/dokumen-bulk-download', [MasterGuruDokumenController::class, 'bulkDownload']);
    Route::get('/guru/{nuptk}/file-download', [MasterGuruDokumenController::class, 'downloadFile']);

    // Administrasi (Rekening, BPJS, Tunjangan)
    Route::get('/guru/{nuptk}/administrasi', [GuruAdministrasiController::class, 'getAdministrasi']);
    Route::put('/guru/{nuptk}/administrasi', [GuruAdministrasiController::class, 'updateAdministrasi']);

    // Penugasan
    Route::get('/guru/{nuptk}/penugasan', [GuruAdministrasiController::class, 'getPenugasan']);
    Route::post('/guru/{nuptk}/penugasan', [GuruAdministrasiController::class, 'storePenugasan']);
    Route::delete('/guru/{nuptk}/penugasan/{id}', [GuruAdministrasiController::class, 'destroyPenugasan']);

    // Kompetensi
    Route::get('/guru/{nuptk}/kompetensi', [GuruKompetensiController::class, 'index']);
    Route::post('/guru/{nuptk}/kompetensi', [GuruKompetensiController::class, 'store']);
    Route::put('/guru/{nuptk}/kompetensi/{id}', [GuruKompetensiController::class, 'update']);
    Route::delete('/guru/{nuptk}/kompetensi/{id}', [GuruKompetensiController::class, 'destroy']);

    // Diklat
    Route::get('/guru/{nuptk}/diklat', [MasterGuruKepegawaianController::class, 'getDiklat']);
    Route::post('/guru/{nuptk}/diklat', [MasterGuruKepegawaianController::class, 'storeDiklat']);
    Route::put('/guru/{nuptk}/diklat/{id}', [MasterGuruKepegawaianController::class, 'updateDiklat']);
    Route::delete('/guru/{nuptk}/diklat/{id}', [MasterGuruKepegawaianController::class, 'destroyDiklat']);

    // Cuti
    Route::get('/guru/{nuptk}/cuti', [GuruCutiController::class, 'index']);
    Route::post('/guru/{nuptk}/cuti', [GuruCutiController::class, 'store']);
    Route::put('/guru/{nuptk}/cuti/{id}', [GuruCutiController::class, 'update']);
    Route::post('/guru/{nuptk}/cuti/{id}', [GuruCutiController::class, 'update']); // fallback FormData
    Route::patch('/guru/{nuptk}/cuti/{id}/selesai', [GuruCutiController::class, 'selesai']);
    Route::delete('/guru/{nuptk}/cuti/{id}', [GuruCutiController::class, 'destroy']);

    // Mutasi
    Route::get('/guru/{nuptk}/mutasi', [GuruMutasiController::class, 'index']);
    Route::get('/guru/{nuptk}/mutasi/allowed-transitions', [GuruMutasiController::class, 'allowedTransitions']);
    Route::post('/guru/{nuptk}/mutasi/analyze', [GuruMutasiController::class, 'analyze']);
    Route::post('/guru/{nuptk}/mutasi', [GuruMutasiController::class, 'store']);
    Route::put('/guru/{nuptk}/mutasi/{id}', [GuruMutasiController::class, 'update']);
    Route::post('/guru/{nuptk}/mutasi/{id}', [GuruMutasiController::class, 'update']); // fallback FormData
    Route::delete('/guru/{nuptk}/mutasi/{id}', [GuruMutasiController::class, 'destroy']);

    // PKG
    Route::get('/guru/{nuptk}/pkg', [MasterGuruKepegawaianController::class, 'getPkg']);
    Route::post('/guru/{nuptk}/pkg', [MasterGuruKepegawaianController::class, 'storePkg']);

    // Akun guru
    Route::get('/guru/{nuptk}/akun', function (\Illuminate\Http\Request $req, $nuptk) {
        $guru = \App\Models\Guru::where('nuptk', $nuptk)->with('user.roles')->first();
        if (!$guru || !$guru->user) {
            return response()->json(['success' => true, 'data' => null, 'message' => 'Guru belum memiliki akun.']);
        }
        $u = $guru->user;
        return response()->json([
            'success' => true,
            'data' => [
                'id'           => $u->id,
                'username'     => $u->username ?? $u->email,
                'email'        => $u->email,
                'role'         => $u->roles->pluck('nama'),
                'is_active'    => $u->is_active,
                'last_login_at' => $u->last_login_at,
            ],
        ]);
    });

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
