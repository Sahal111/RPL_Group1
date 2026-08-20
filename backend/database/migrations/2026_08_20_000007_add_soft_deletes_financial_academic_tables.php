<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tambah soft delete ke tabel keuangan dan akademik kritis
 *
 * TABEL YANG DI-COVER:
 *
 *   tagihans       — Data tagihan biaya sekolah. Tidak boleh pernah hard-delete.
 *                    Wajib audit trail. Kebutuhan: RESTRICT FK dari siswa + soft delete ini.
 *
 *   pembayarans    — Riwayat transaksi pembayaran. Data keuangan adalah rekam jejak legal.
 *                    Hard delete melanggar prinsip akuntansi dan berpotensi fraud.
 *
 *   nilai_akhirs   — Nilai rapor siswa. Data akademik yang di-hard-delete bisa membuat
 *                    siswa kehilangan bukti prestasi akademiknya.
 *
 *   absensis       — Riwayat kehadiran. Digunakan untuk laporan dan evaluasi periodik.
 *                    Hard delete bisa memanipulasi kehadiran.
 *
 *   jadwal_pelajarans — Jadwal yang sudah lewat masih dibutuhkan untuk rekonstruksi histori.
 *
 * Semua menggunakan `Schema::hasColumn` check agar idempotent.
 */
return new class extends Migration {
    private array $tables = [
        'tagihans',
        'pembayarans',
        'nilai_akhirs',
        'absensis',
        'jadwal_pelajarans',
    ];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            if (Schema::hasColumn($table, 'deleted_at')) {
                continue; // sudah ada, skip
            }

            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->softDeletes()->after('updated_at');
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            if (!Schema::hasColumn($table, 'deleted_at')) {
                continue;
            }

            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->dropSoftDeletes();
            });
        }
    }
};