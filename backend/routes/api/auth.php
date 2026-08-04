<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

// ── PUBLIC — tidak perlu token ────────────────────────────────────────────────

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/register-ortu', [AuthController::class, 'registerOrtu'])->middleware('throttle:10,1');
});

// ── PROTECTED — perlu token ───────────────────────────────────────────────────

Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});