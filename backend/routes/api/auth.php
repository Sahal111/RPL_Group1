<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use Illuminate\Support\Facades\Route;

// ── PUBLIC — tidak perlu token ────────────────────────────────────────────────

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/register-ortu', [AuthController::class, 'registerOrtu'])->middleware('throttle:10,1');

    // Password Reset (throttle ketat: 3 request/10 menit anti-abuse)
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])
        ->middleware('throttle:3,10')
        ->name('password.email');

    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])
        ->middleware('throttle:5,10')
        ->name('password.reset');

    // Verifikasi token (untuk UX frontend — cek sebelum tampil form)
    Route::get('/verify-reset-token', function (\Illuminate\Http\Request $req) {
        $controller = new PasswordResetController();
        return $controller->verifyToken($req->query('token', ''), $req->query('email', ''));
    })->middleware('throttle:10,1');
});

// ── PROTECTED — perlu token ───────────────────────────────────────────────────

Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});