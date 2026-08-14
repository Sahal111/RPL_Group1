<?php

use App\Http\Controllers\TataUsaha\LegalisirController;
use App\Http\Controllers\TataUsaha\SuratController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Tata Usaha Routes — Tata Usaha, Operator, Kepsek, Wakasek
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:tata_usaha,operator,super_operator,kepsek,wakasek'])
    ->prefix('tata-usaha')
    ->group(function () {

        // ── SURAT ─────────────────────────────────────────────────────────────
        Route::prefix('surat')->group(function () {
            Route::get('/', [SuratController::class, 'index']);
            Route::post('/', [SuratController::class, 'store']);
            Route::get('/stats', [SuratController::class, 'stats']);
            Route::get('/{id}', [SuratController::class, 'show']);
            Route::put('/{id}', [SuratController::class, 'update']);
            Route::delete('/{id}', [SuratController::class, 'destroy']);
            Route::patch('/{id}/arsip', [SuratController::class, 'arsip']);
        });

        // ── LEGALISIR ─────────────────────────────────────────────────────────
        Route::prefix('legalisir')->group(function () {
            Route::get('/', [LegalisirController::class, 'index']);
            Route::post('/', [LegalisirController::class, 'store']);
            Route::get('/stats', [LegalisirController::class, 'stats']);
            Route::get('/{id}', [LegalisirController::class, 'show']);
            Route::patch('/{id}/proses', [LegalisirController::class, 'proses']);
        });
    });