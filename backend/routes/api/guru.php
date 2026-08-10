<?php

use App\Http\Controllers\Absensi\AbsensiController;
use App\Http\Controllers\Guru\GuruController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:guru,wali_kelas'])->prefix('guru')->group(function () {

    // Dashboard & data kelas sendiri
    Route::get('/dashboard', [GuruController::class, 'dashboard']);
    Route::get('/jadwal', [GuruController::class, 'jadwalMengajar']);

    Route::middleware('permission:master_data.siswa.view')->group(function () {
        Route::get('/siswa', [GuruController::class, 'siswaSaya']);
        Route::get('/siswa/{nisn}', [GuruController::class, 'detailSiswa']);
        Route::get('/kelas', [GuruController::class, 'kelasSaya']);
        Route::get('/kelas/{id_kelas}', [GuruController::class, 'detailKelas']);
    });

    Route::middleware('permission:absensi.view_kelas_sendiri,absensi.view_all')->group(function () {
        Route::get('/kelas/{id_kelas}/riwayat', [GuruController::class, 'riwayatAbsensi']);
        Route::get('/kelas/{id_kelas}/rekap', [AbsensiController::class, 'rekap']);
        Route::get('/kelas/{id_kelas}/jadwal-hari-ini', [AbsensiController::class, 'jadwalHariIni']);
    });

    // Profil guru sendiri — tidak butuh permission khusus
    Route::get('/profil', [GuruController::class, 'profil']);
    Route::post('/profil/update', [GuruController::class, 'updateProfil']);
});