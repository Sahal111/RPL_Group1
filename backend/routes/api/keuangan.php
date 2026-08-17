<?php

use App\Http\Controllers\Keuangan\JenisTagihanController;
use App\Http\Controllers\Keuangan\PembayaranController;
use App\Http\Controllers\Keuangan\TagihanController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Keuangan Routes — Bendahara & Operator
|--------------------------------------------------------------------------
|
| Semua route di sini membutuhkan:
|   - auth:sanctum
|   - role: bendahara atau operator
|   - prefix: /keuangan
|
*/

Route::middleware(['auth:sanctum', 'role:bendahara,operator'])

    ->prefix('keuangan')
    ->group(function () {

        // ── DASHBOARD ─────────────────────────────────────────────────────────
        Route::get('/dashboard-stats', [PembayaranController::class, 'dashboardStats']);

        // ── JENIS TAGIHAN ─────────────────────────────────────────────────────
        Route::prefix('jenis-tagihan')->group(function () {
            Route::get('/', [JenisTagihanController::class, 'index']);
            Route::post('/', [JenisTagihanController::class, 'store']);
            Route::get('/{id}', [JenisTagihanController::class, 'show']);
            Route::put('/{id}', [JenisTagihanController::class, 'update']);
            Route::delete('/{id}', [JenisTagihanController::class, 'destroy']);
            Route::patch('/{id}/toggle-active', [JenisTagihanController::class, 'toggleActive']);
        });

        // ── TAGIHAN ───────────────────────────────────────────────────────────
        Route::prefix('tagihan')->group(function () {
            Route::get('/', [TagihanController::class, 'index']);
            Route::post('/', [TagihanController::class, 'store']);
            Route::post('/generate', [TagihanController::class, 'generate']);
            Route::get('/tunggakan', [TagihanController::class, 'tunggakan']);
            Route::get('/rekap-siswa/{siswaId}', [TagihanController::class, 'rekapSiswa']);
            Route::get('/{id}', [TagihanController::class, 'show']);
            Route::put('/{id}', [TagihanController::class, 'update']);
            Route::delete('/{id}', [TagihanController::class, 'destroy']);
        });

        // ── PEMBAYARAN ────────────────────────────────────────────────────────
        Route::prefix('pembayaran')->group(function () {
            Route::get('/', [PembayaranController::class, 'index']);
            Route::post('/', [PembayaranController::class, 'store']);
            Route::get('/laporan', [PembayaranController::class, 'laporan']);
            Route::get('/{id}', [PembayaranController::class, 'show']);
            Route::patch('/{id}/batalkan', [PembayaranController::class, 'batalkan']);
        });
    });