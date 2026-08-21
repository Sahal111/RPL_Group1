<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * pembayaran_ppdb tidak punya:
 * - created_by: tidak tahu siapa yang input
 * - updated_by: tidak tahu siapa yang update
 * - deleted_at: tidak bisa soft delete (transaksi keuangan TIDAK boleh hard delete)
 * - deleted_by: tidak tahu siapa yang hapus
 *
 * Transaksi keuangan adalah data audit-critical.
 * Hard delete = kehilangan jejak keuangan = masalah hukum/akuntansi.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pembayaran_ppdb', function (Blueprint $table) {
            // Audit trail columns
            $table->unsignedBigInteger('created_by')->nullable()->after('created_at')
                ->comment('user_id yang membuat record ini. Nullable untuk data legacy.');
            $table->unsignedBigInteger('updated_by')->nullable()->after('updated_at')
                ->comment('user_id yang terakhir update record ini.');
            $table->unsignedBigInteger('deleted_by')->nullable()->after('updated_by')
                ->comment('user_id yang menghapus (soft delete) record ini.');

            // Soft delete - transaksi keuangan TIDAK BOLEH hard delete
            $table->softDeletes()->comment('Soft delete untuk transaksi keuangan. Hard delete tidak diperbolehkan.');

            // Index untuk query by creator dan deleted status
            $table->index(['school_id', 'deleted_at'], 'idx_ppdb_payment_school_deleted');
        });
    }

    public function down(): void
    {
        Schema::table('pembayaran_ppdb', function (Blueprint $table) {
            $table->dropIndex('idx_ppdb_payment_school_deleted');
            $table->dropSoftDeletes();
            $table->dropColumn(['created_by', 'updated_by', 'deleted_by']);
        });
    }
};
