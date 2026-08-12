<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Menambahkan index yang belum ada pada tabel keuangan.
 *
 * Alasan:
 * - tagihans.jatuh_tempo dipakai di scopeTunggakan() → WHERE jatuh_tempo < now()
 *   tanpa index = full-table scan setiap laporan tunggakan.
 * - pembayarans.status dipakai di scopeValid() dan laporan harian bendahara.
 *
 * Index yang SUDAH ada (dari migration sebelumnya) tidak disentuh:
 * - idx_tagihans_school_status  (school_id, status)
 * - idx_tagihans_school_siswa   (school_id, siswa_id)
 * - idx_pembayarans_school_siswa (school_id, siswa_id)
 * - idx_bayar_tanggal           (tanggal_bayar)
 */
return new class extends Migration {
    public function up(): void
    {
        // tagihans — composite untuk scopeTunggakan():
        // WHERE school_id = ? AND status IN ('belum','cicil') AND jatuh_tempo < now()
        if (Schema::hasTable('tagihans') && !$this->indexExists('tagihans', 'idx_tagihans_school_jtempo_status')) {
            Schema::table('tagihans', function (Blueprint $table) {
                $table->index(
                    ['school_id', 'jatuh_tempo', 'status'],
                    'idx_tagihans_school_jtempo_status'
                );
            });
        }

        // pembayarans — composite untuk laporan harian + scopeValid():
        // WHERE school_id = ? AND status = 'valid' AND tanggal_bayar BETWEEN ? AND ?
        if (Schema::hasTable('pembayarans') && !$this->indexExists('pembayarans', 'idx_pembayarans_school_status_tgl')) {
            Schema::table('pembayarans', function (Blueprint $table) {
                $table->index(
                    ['school_id', 'status', 'tanggal_bayar'],
                    'idx_pembayarans_school_status_tgl'
                );
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('tagihans') && $this->indexExists('tagihans', 'idx_tagihans_school_jtempo_status')) {
            Schema::table('tagihans', function (Blueprint $table) {
                $table->dropIndex('idx_tagihans_school_jtempo_status');
            });
        }

        if (Schema::hasTable('pembayarans') && $this->indexExists('pembayarans', 'idx_pembayarans_school_status_tgl')) {
            Schema::table('pembayarans', function (Blueprint $table) {
                $table->dropIndex('idx_pembayarans_school_status_tgl');
            });
        }
    }

    /**
     * Cek apakah index sudah ada — cegah error duplicate key pada re-run.
     */
    private function indexExists(string $table, string $indexName): bool
    {
        $indexes = collect(\DB::select("SHOW INDEX FROM `{$table}`"))
            ->pluck('Key_name')
            ->unique()
            ->toArray();

        return in_array($indexName, $indexes);
    }
};