<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fix #4 — tagihans + pembayarans: ON DELETE CASCADE → RESTRICT
 *
 * MASALAH:
 *   tagihans.siswa_id  REFERENCES siswas(id) ON DELETE CASCADE
 *   pembayarans.siswa_id REFERENCES siswas(id) ON DELETE CASCADE
 *
 *   Ketika siswa dihapus (hard delete atau soft delete yang bypass),
 *   SEMUA data tagihan dan pembayaran ikut terhapus secara permanen.
 *   Data keuangan tidak boleh pernah hilang — ini masalah audit dan hukum.
 *
 * SOLUSI:
 *   Ubah ke ON DELETE RESTRICT. Siswa yang memiliki tagihan/pembayaran
 *   tidak boleh dihapus. DB akan menolak hard delete secara otomatis.
 *   Penghapusan siswa harus melalui soft delete (deleted_at).
 *
 * STRATEGI:
 *   MySQL tidak bisa ALTER FK langsung. Harus DROP FK lama → CREATE FK baru.
 *   Nama FK diperiksa via INFORMATION_SCHEMA agar idempotent.
 */
return new class extends Migration {
    private array $fixes = [
        [
            'table' => 'tagihans',
            'column' => 'siswa_id',
            'old_fk' => 'tagihans_siswa_id_foreign',
            'new_fk' => 'fk_tagihans_siswa_restrict',
            'ref_table' => 'siswas',
            'ref_column' => 'id',
        ],
        [
            'table' => 'pembayarans',
            'column' => 'siswa_id',
            'old_fk' => 'pembayarans_siswa_id_foreign',
            'new_fk' => 'fk_pembayarans_siswa_restrict',
            'ref_table' => 'siswas',
            'ref_column' => 'id',
        ],
    ];

    public function up(): void
    {
        foreach ($this->fixes as $fix) {
            if (!Schema::hasTable($fix['table'])) {
                continue;
            }

            // Drop FK lama jika ada (CASCADE)
            $this->dropFkIfExists($fix['table'], $fix['old_fk']);

            // Juga drop versi nama baru kalau sudah ada (idempotent)
            $this->dropFkIfExists($fix['table'], $fix['new_fk']);

            // Tambah FK baru dengan RESTRICT
            Schema::table($fix['table'], function (Blueprint $table) use ($fix) {
                $table->foreign($fix['column'], $fix['new_fk'])
                    ->references($fix['ref_column'])
                    ->on($fix['ref_table'])
                    ->restrictOnDelete(); // ← kunci perubahan
            });
        }
    }

    public function down(): void
    {
        foreach ($this->fixes as $fix) {
            if (!Schema::hasTable($fix['table'])) {
                continue;
            }

            $this->dropFkIfExists($fix['table'], $fix['new_fk']);

            // Kembalikan FK dengan CASCADE
            Schema::table($fix['table'], function (Blueprint $table) use ($fix) {
                $table->foreign($fix['column'], $fix['old_fk'])
                    ->references($fix['ref_column'])
                    ->on($fix['ref_table'])
                    ->cascadeOnDelete();
            });
        }
    }

    private function dropFkIfExists(string $table, string $fkName): void
    {
        $exists = DB::select("
            SELECT 1
            FROM information_schema.table_constraints
            WHERE table_schema = DATABASE()
              AND table_name = ?
              AND constraint_name = ?
              AND constraint_type = 'FOREIGN KEY'
            LIMIT 1
        ", [$table, $fkName]);

        if (!empty($exists)) {
            Schema::table($table, function (Blueprint $blueprint) use ($fkName) {
                $blueprint->dropForeign($fkName);
            });
        }
    }
};