<?php

/**
 * API Routes — Entry Point
 *
 * File ini hanya berisi include ke sub-file per domain.
 * JANGAN tambahkan route langsung di sini.
 *
 * Struktur:
 *   routes/api/auth.php         → login, logout, register
 *   routes/api/public.php       → galeri, pengumuman (tanpa auth)
 *   routes/api/operator.php     → manajemen akun, pengaturan sekolah
 *   routes/api/master-data.php  → master data guru, siswa, kelas, mapel, tahun ajaran
 *   routes/api/absensi.php      → input & rekap absensi
 *   routes/api/guru.php         → portal guru
 *   routes/api/kepsek.php       → portal kepala sekolah
 *   routes/api/ortu.php         → portal orang tua
 */

require __DIR__ . '/api/auth.php';
require __DIR__ . '/api/public.php';
require __DIR__ . '/api/operator.php';
require __DIR__ . '/api/master-data.php';
require __DIR__ . '/api/absensi.php';
require __DIR__ . '/api/guru.php';
require __DIR__ . '/api/kepsek.php';
require __DIR__ . '/api/ortu.php';