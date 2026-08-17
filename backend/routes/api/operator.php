<?php

use App\Http\Controllers\GaleriController;
use App\Http\Controllers\Operator\OperatorController;
use App\Http\Controllers\PengumumanController;
use Illuminate\Support\Facades\Route;

// ── OPERATOR — manajemen akun & pengaturan ────────────────────────────────────

Route::middleware(['auth:sanctum', 'role:operator'])
    ->prefix('operator')->group(function () {

        // Manajemen akun — butuh permission spesifik
        Route::middleware('permission:akun.view')->group(function () {
            Route::get('/users', [OperatorController::class, 'index']);
        });

        Route::middleware('permission:akun.create')->group(function () {
            Route::post('/operator', [OperatorController::class, 'createOperator']);
            Route::post('/guru', [OperatorController::class, 'createGuru']);
            Route::post('/kepsek', [OperatorController::class, 'createKepsek']);
            Route::post('/ortu', [OperatorController::class, 'createOrtu']);
            Route::post('/bendahara', [OperatorController::class, 'createBendahara']);
            Route::post('/walikelas', [OperatorController::class, 'createWaliKelas']);
        });

        Route::middleware('permission:akun.toggle_active')->group(function () {
            Route::patch('/users/{id}/toggle-active', [OperatorController::class, 'toggleActive']);
        });

        Route::middleware('permission:akun.approve_ortu')->group(function () {
            Route::patch('/users/{id}/approve-ortu', [OperatorController::class, 'approveOrtu']);
        });

        Route::middleware('permission:akun.reset_password')->group(function () {
            Route::patch('/users/{id}/reset-password', [OperatorController::class, 'resetPassword']);
        });

        Route::middleware('permission:akun.delete')->group(function () {
            Route::delete('/users/{id}', [OperatorController::class, 'destroy']);
        });

        // Orang tua
        Route::middleware('permission:akun.approve_ortu,master_data.orang_tua.view')->group(function () {
            Route::get('/ortu/pending', [OperatorController::class, 'pendingOrtu']);
            Route::get('/ortu', [OperatorController::class, 'listOrtu']);
            Route::get('/ortu/{id}', [OperatorController::class, 'detailOrtu']);
        });

        Route::middleware('permission:master_data.orang_tua.manage')->group(function () {
            Route::put('/ortu/{id}', [OperatorController::class, 'updateOrtu']);
            Route::post('/ortu/{id}/anak', [OperatorController::class, 'attachAnakOrtu']);
        });

        // Pengaturan sekolah
        Route::middleware('permission:pengaturan.view')->group(function () {
            Route::get('/pengaturan/kode-registrasi', [OperatorController::class, 'getKodeRegistrasi']);
        });

        Route::middleware('permission:pengaturan.view')->group(function () {
            Route::post('/pengaturan/kode-registrasi', [OperatorController::class, 'updateKodeRegistrasi']);
        });

        // Pengumuman & Galeri
        Route::middleware('permission:pengumuman.create')->group(function () {
            Route::post('/pengumuman', [PengumumanController::class, 'store']);
            Route::post('/galeri', [GaleriController::class, 'store']);
        });

        Route::middleware('permission:pengumuman.update')->group(function () {
            Route::put('/pengumuman/{id}', [PengumumanController::class, 'update']);
        });

        Route::middleware('permission:pengumuman.delete')->group(function () {
            Route::delete('/pengumuman/{id}', [PengumumanController::class, 'destroy']);
            Route::delete('/galeri/{id}', [GaleriController::class, 'destroy']);
        });
    });