<?php

use App\Http\Controllers\Kepsek\KalenderAkademikController;
use App\Http\Controllers\Kepsek\KepsekController;
use App\Http\Controllers\PengumumanController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:kepsek'])->prefix('kepsek')->group(function () {
    Route::get('/dashboard', [KepsekController::class, 'dashboard']);
    Route::get('/rekap', [KepsekController::class, 'rekapSemuaKelas']);
    Route::get('/siswa-alpa', [KepsekController::class, 'siswaAlpaTerbanyak']);
    Route::get('/guru', [KepsekController::class, 'daftarGuru']);
    Route::get('/guru/{nuptk}', [KepsekController::class, 'detailGuru']);
    Route::get('/siswa', [KepsekController::class, 'daftarSiswa']);
    Route::get('/siswa/{nisn}', [KepsekController::class, 'detailSiswa']);
    Route::get('/kelas-filter', [KepsekController::class, 'daftarKelasFilter']);
    Route::post('/pengumuman', [PengumumanController::class, 'store']);
    Route::put('/pengumuman/{id}', [PengumumanController::class, 'update']);
    Route::delete('/pengumuman/{id}', [PengumumanController::class, 'destroy']);
    Route::get('/kalender', [KalenderAkademikController::class, 'index']);
    Route::post('/kalender', [KalenderAkademikController::class, 'store']);
    Route::put('/kalender/{id}', [KalenderAkademikController::class, 'update']);
    Route::delete('/kalender/{id}', [KalenderAkademikController::class, 'destroy']);
    Route::get('/profil', [KepsekController::class, 'profil']);
    Route::post('/profil/update', [KepsekController::class, 'updateProfil']);
});