<?php

use App\Http\Controllers\Perpustakaan\BukuController;
use App\Http\Controllers\Perpustakaan\PeminjamanController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Perpustakaan Routes — Pustakawan, Operator
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:pustakawan,operator,super_operator'])
    ->prefix('perpustakaan')
    ->group(function () {

        // ── BUKU ─────────────────────────────────────────────────────────────
        Route::prefix('buku')->group(function () {
            Route::get('/', [BukuController::class, 'index']);
            Route::post('/', [BukuController::class, 'store']);
            Route::get('/stats', [BukuController::class, 'stats']);
            Route::get('/dropdown', [BukuController::class, 'dropdown']);
            Route::get('/{id}', [BukuController::class, 'show']);
            Route::put('/{id}', [BukuController::class, 'update']);
            Route::delete('/{id}', [BukuController::class, 'destroy']);
        });

        // ── PEMINJAMAN ────────────────────────────────────────────────────────
        Route::prefix('peminjaman')->group(function () {
            Route::get('/', [PeminjamanController::class, 'index']);
            Route::post('/', [PeminjamanController::class, 'store']);
            Route::get('/laporan', [PeminjamanController::class, 'laporan']);
            Route::get('/{id}', [PeminjamanController::class, 'show']);
            Route::patch('/{id}/kembalikan', [PeminjamanController::class, 'kembalikan']);
        });
    });