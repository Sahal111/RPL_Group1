<?php

use App\Http\Controllers\Ppdb\BerkasPendaftarController;
use App\Http\Controllers\Ppdb\CalonSiswaController;
use App\Http\Controllers\Ppdb\PembayaranPpdbController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| PPDB Routes — Admin PPDB & Operator
|--------------------------------------------------------------------------
|
| Semua route di sini membutuhkan:
|   - auth:sanctum
|   - role: admin_ppdb atau operator
|   - prefix: /ppdb
|
*/

Route::middleware(['auth:sanctum', 'role:admin_ppdb,operator'])

    ->prefix('ppdb')
    ->group(function () {

        // ── DASHBOARD STATS ───────────────────────────────────────────
        Route::get('/dashboard-stats', [CalonSiswaController::class, 'dashboardStats']);

        // ── CALON SISWA ───────────────────────────────────────────────
        Route::prefix('calon-siswa')->group(function () {
            Route::get('/', [CalonSiswaController::class, 'index']);
            Route::post('/', [CalonSiswaController::class, 'store']);
            Route::get('/{id}', [CalonSiswaController::class, 'show']);
            Route::put('/{id}', [CalonSiswaController::class, 'update']);
            Route::delete('/{id}', [CalonSiswaController::class, 'destroy']);

            // Verifikasi status (lulus, tidak_lulus, cadangan, dll)
            Route::patch('/{id}/verifikasi', [CalonSiswaController::class, 'verifikasi']);

            // Konversi calon siswa lulus → siswa aktif
            Route::post('/{id}/konversi', [CalonSiswaController::class, 'konversi']);

            // ── BERKAS PENDAFTAR (nested) ─────────────────────────────
            Route::prefix('/{calonSiswaId}/berkas')->group(function () {
                Route::get('/', [BerkasPendaftarController::class, 'index']);
                Route::post('/', [BerkasPendaftarController::class, 'store']);
                Route::delete('/{berkasId}', [BerkasPendaftarController::class, 'destroy']);
                Route::patch('/{berkasId}/verifikasi', [BerkasPendaftarController::class, 'verifikasi']);
            });

            // ── PEMBAYARAN PPDB (nested) ──────────────────────────────
            Route::prefix('/{calonSiswaId}/pembayaran')->group(function () {
                Route::get('/', [PembayaranPpdbController::class, 'index']);
                Route::post('/', [PembayaranPpdbController::class, 'store']);
                Route::put('/{bayarId}', [PembayaranPpdbController::class, 'update']);
                Route::delete('/{bayarId}', [PembayaranPpdbController::class, 'destroy']);
            });
        });
    });