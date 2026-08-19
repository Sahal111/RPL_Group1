<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Command lama bawaan Laravel
Artisan::command('inspire', function () {
    $this->comment(\Illuminate\Foundation\Inspiring::quote());
})->purpose('Display an inspiring quote');

// Jalankan setiap hari jam 07.00 pagi
Schedule::command('dokumen:check-expired')->dailyAt('07:00');

// Arsipkan activity_logs lama setiap malam jam 02.00
// Data lebih dari N bulan (per policy di data_retention_policies) dipindah ke activity_logs_archive
Schedule::command('logs:archive-activity')->dailyAt('02:00');