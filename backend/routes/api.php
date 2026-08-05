<?php

/**
 * API Routes — Entry Point
 *
 * File ini hanya berisi include ke sub-file per domain.
 * JANGAN tambahkan route langsung di sini.
 */

require __DIR__ . '/api/auth.php';
require __DIR__ . '/api/public.php';
require __DIR__ . '/api/operator.php';
require __DIR__ . '/api/master-data.php';
require __DIR__ . '/api/absensi.php';
require __DIR__ . '/api/guru.php';
require __DIR__ . '/api/kepsek.php';
require __DIR__ . '/api/ortu.php';