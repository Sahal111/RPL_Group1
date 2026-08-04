<?php

use App\Http\Controllers\Absensi\AbsensiController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('absensi')->group(function () {

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

