<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Command lama bawaan Laravel
Artisan::command('inspire', function () {
    $this->comment(\Illuminate\Foundation\Inspiring::quote());
})->purpose('Display an inspiring quote');

// Jalankan setiap hari jam 07.00 pagi
Schedule::command('dokumen:check-expired')->dailyAt('07:00');