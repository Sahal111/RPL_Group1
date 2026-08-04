<?php

use App\Http\Controllers\GaleriController;
use App\Http\Controllers\PengumumanController;
use Illuminate\Support\Facades\Route;

// ── PUBLIC — tidak perlu token, bisa diakses siapapun ────────────────────────

Route::get('/galeri', [GaleriController::class, 'index']);
Route::get('/pengumuman', [PengumumanController::class, 'index']);