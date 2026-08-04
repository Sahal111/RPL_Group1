<?php

use App\Http\Controllers\GaleriController;
use App\Http\Controllers\Operator\OperatorController;
use App\Http\Controllers\PengumumanController;
use Illuminate\Support\Facades\Route;

// ── OPERATOR — manajemen akun & pengaturan ────────────────────────────────────

Route::middleware(['auth:sanctum', 'role:operator'])->prefix('operator')->group(function () {

    // Manajemen akun
    Route::get('/users', [OperatorController::class, 'index']);
    Route::post('/operator', [OperatorController::class, 'createOperator']);
    Route::post('/guru', [OperatorController::class, 'createGuru']);
    Route::post('/kepsek', [OperatorController::class, 'createKepsek']);
    Route::post('/ortu', [OperatorController::class, 'createOrtu']);
    Route::post('/bendahara', [OperatorController::class, 'createBendahara']);
    Route::post('/walikelas', [OperatorController::class, 'createWaliKelas']);
    Route::patch('/users/{id}/toggle-active', [OperatorController::class, 'toggleActive']);
    Route::patch('/users/{id}/approve-ortu', [OperatorController::class, 'approveOrtu']);
    Route::patch('/users/{id}/reset-password', [OperatorController::class, 'resetPassword']);
    Route::delete('/users/{id}', [OperatorController::class, 'destroy']);

    // Orang tua
    Route::get('/ortu/pending', [OperatorController::class, 'pendingOrtu']);
    Route::get('/ortu', [OperatorController::class, 'listOrtu']);
    Route::get('/ortu/{id}', [OperatorController::class, 'detailOrtu']);
    Route::put('/ortu/{id}', [OperatorController::class, 'updateOrtu']);
    Route::post('/ortu/{id}/anak', [OperatorController::class, 'attachAnakOrtu']);

    // Pengaturan sekolah
    Route::get('/pengaturan/kode-registrasi', [OperatorController::class, 'getKodeRegistrasi']);
    Route::post('/pengaturan/kode-registrasi', [OperatorController::class, 'updateKodeRegistrasi']);

    // Pengumuman & Galeri
    Route::post('/pengumuman', [PengumumanController::class, 'store']);
    Route::put('/pengumuman/{id}', [PengumumanController::class, 'update']);
    Route::delete('/pengumuman/{id}', [PengumumanController::class, 'destroy']);

    Route::post('/galeri', [GaleriController::class, 'store']);
    Route::delete('/galeri/{id}', [GaleriController::class, 'destroy']);
});