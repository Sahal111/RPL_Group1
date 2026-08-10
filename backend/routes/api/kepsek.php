<?php

use App\Http\Controllers\Kepsek\KalenderAkademikController;
use App\Http\Controllers\Kepsek\KepsekController;
use App\Http\Controllers\PengumumanController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:kepsek,super_operator'])->prefix('kepsek')->group(function () {

    // Dashboard & laporan — butuh minimal view guru atau siswa
    Route::middleware('permission:laporan.absensi.view,laporan.guru.view,laporan.siswa.view')->group(function () {
        Route::get('/dashboard', [KepsekController::class, 'dashboard']);
        Route::get('/rekap', [KepsekController::class, 'rekapSemuaKelas']);
        Route::get('/siswa-alpa', [KepsekController::class, 'siswaAlpaTerbanyak']);
    });

    Route::middleware('permission:master_data.guru.view,laporan.guru.view')->group(function () {
        Route::get('/guru', [KepsekController::class, 'daftarGuru']);
        Route::get('/guru/{nuptk}', [KepsekController::class, 'detailGuru']);
    });

    Route::middleware('permission:master_data.siswa.view,laporan.siswa.view')->group(function () {
        Route::get('/siswa', [KepsekController::class, 'daftarSiswa']);
        Route::get('/siswa/{nisn}', [KepsekController::class, 'detailSiswa']);
    });

    Route::middleware('permission:master_data.kelas.view')->group(function () {
        Route::get('/kelas-filter', [KepsekController::class, 'daftarKelasFilter']);
    });

    // Pengumuman
    Route::middleware('permission:pengumuman.create')->group(function () {
        Route::post('/pengumuman', [PengumumanController::class, 'store']);
    });
    Route::middleware('permission:pengumuman.update')->group(function () {
        Route::put('/pengumuman/{id}', [PengumumanController::class, 'update']);
    });
    Route::middleware('permission:pengumuman.delete')->group(function () {
        Route::delete('/pengumuman/{id}', [PengumumanController::class, 'destroy']);
    });

    // Kalender
    Route::middleware('permission:akademik.kalender.manage')->group(function () {
        Route::get('/kalender', [KalenderAkademikController::class, 'index']);
        Route::post('/kalender', [KalenderAkademikController::class, 'store']);
        Route::put('/kalender/{id}', [KalenderAkademikController::class, 'update']);
        Route::delete('/kalender/{id}', [KalenderAkademikController::class, 'destroy']);
    });

    // Profil kepsek sendiri — tidak butuh permission khusus, hanya auth
    Route::get('/profil', [KepsekController::class, 'profil']);
    Route::post('/profil/update', [KepsekController::class, 'updateProfil']);
});