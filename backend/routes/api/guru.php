<?php

use App\Http\Controllers\Absensi\AbsensiController;
use App\Http\Controllers\Guru\GuruController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:guru'])->prefix('guru')->group(function () {
    Route::get('/dashboard', [GuruController::class, 'dashboard']);
    Route::get('/siswa', [GuruController::class, 'siswaSaya']);
    Route::get('/siswa/{nisn}', [GuruController::class, 'detailSiswa']);
    Route::get('/kelas', [GuruController::class, 'kelasSaya']);
    Route::get('/kelas/{id_kelas}', [GuruController::class, 'detailKelas']);
    Route::get('/kelas/{id_kelas}/riwayat', [GuruController::class, 'riwayatAbsensi']);
    Route::get('/kelas/{id_kelas}/rekap', [AbsensiController::class, 'rekap']);
    Route::get('/kelas/{id_kelas}/jadwal-hari-ini', [AbsensiController::class, 'jadwalHariIni']);
    Route::get('/jadwal', [GuruController::class, 'jadwalMengajar']);
    Route::get('/profil', [GuruController::class, 'profil']);
    Route::post('/profil/update', [GuruController::class, 'updateProfil']);
});