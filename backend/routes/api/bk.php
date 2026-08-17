<?php

use App\Http\Controllers\Bk\CatatanController;
use App\Http\Controllers\Bk\KonselingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| BK Routes — Guru BK, Kepsek, Wakasek
|--------------------------------------------------------------------------
|
| Semua route di sini membutuhkan auth:sanctum.
| Akses nilai akademik sengaja diblokir untuk guru_bk.
|
*/

Route::middleware(['auth:sanctum', 'role:guru_bk,kepsek,wakasek,operator'])
    ->prefix('bk')
    ->group(function () {

        // ── KONSELING ────────────────────────────────────────────────────────
        Route::prefix('konseling')->group(function () {
            Route::get('/', [KonselingController::class, 'index']);
            Route::post('/', [KonselingController::class, 'store']);
            Route::get('/stats', [KonselingController::class, 'stats']);
            Route::get('/{id}', [KonselingController::class, 'show']);
            Route::put('/{id}', [KonselingController::class, 'update']);
            Route::delete('/{id}', [KonselingController::class, 'destroy']);
        });

        // ── CATATAN BK ───────────────────────────────────────────────────────
        Route::prefix('catatan')->group(function () {
            Route::get('/', [CatatanController::class, 'index']);
            Route::post('/', [CatatanController::class, 'store']);
            Route::get('/siswa/{siswaId}', [CatatanController::class, 'bySiswa']);
            Route::get('/{id}', [CatatanController::class, 'show']);
            Route::put('/{id}', [CatatanController::class, 'update']);
            Route::delete('/{id}', [CatatanController::class, 'destroy']);
        });
    });