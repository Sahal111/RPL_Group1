<?php

use App\Http\Controllers\Ortu\OrtuController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:ortu'])->prefix('ortu')->group(function () {
    Route::get('/dashboard', [OrtuController::class, 'dashboard']);
    Route::get('/profil-anak', [OrtuController::class, 'profilAnak']);
    Route::get('/absensi', [OrtuController::class, 'riwayatAbsensi']);
    Route::get('/pengumuman', [OrtuController::class, 'pengumuman']);
    Route::get('/daftar-anak', [OrtuController::class, 'daftarAnak']);
    Route::post('/anak', [OrtuController::class, 'tambahAnak']);
    Route::put('/anak/{nisn}', [OrtuController::class, 'updateAnak']);
    Route::delete('/anak/{nisn}', [OrtuController::class, 'hapusAnak']);
    Route::get('/profil', [OrtuController::class, 'profil']);
    Route::post('/profil', [OrtuController::class, 'updateProfil']);
});