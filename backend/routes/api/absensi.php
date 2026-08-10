<?php

use App\Http\Controllers\Absensi\AbsensiController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('absensi')->group(function () {

    // Input & edit absensi — guru atau operator dengan permission
    Route::middleware('permission:absensi.input,absensi.view_all')->group(function () {
        Route::get('/kelas/{id_kelas}', [AbsensiController::class, 'showKelas']);
    });

    Route::middleware('permission:absensi.input')->group(function () {
        Route::post('/', [AbsensiController::class, 'store']);
    });

    Route::middleware('permission:absensi.edit')->group(function () {
        Route::put('/{id}', [AbsensiController::class, 'update']);
    });

    // Rekap — guru, kepsek, atau operator
    Route::middleware('permission:absensi.rekap,absensi.view_all,absensi.view_kelas_sendiri')->group(function () {
        Route::get('/rekap/{id_kelas}', [AbsensiController::class, 'rekap']);
    });

    // Lihat absensi per siswa — guru, operator, dan ortu (dengan filter data sendiri)
    Route::middleware('permission:absensi.view_kelas_sendiri,absensi.view_all')->group(function () {
        Route::get('/siswa/{nisn}', [AbsensiController::class, 'bySiswa']);
    });
});