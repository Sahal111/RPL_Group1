<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Optimasi activity_logs untuk Skala Ribuan Sekolah
 *
 * MASALAH SAAT INI:
 *   - Kolom `changes` (JSON diff) belum masuk $fillable model — data struktural hilang
 *   - Kolom `school_id` sudah ada (ditambah migration 2026_08_04_000008) tapi
 *     belum masuk composite index yang optimal
 *   - Tidak ada mekanisme archiving — tabel akan tumbuh tak terbatas
 *
 * YANG DILAKUKAN MIGRATION INI:
 *   1. Pastikan kolom `school_id` ada (idempotent)
 *   2. Pastikan kolom `changes` (JSON) ada (idempotent)
 *   3. Tambah kolom `archived_at` untuk flag data yang sudah diarsip
 *   4. Buat composite index (school_id, created_at) untuk range-delete archiver
 *   5. Buat composite index (school_id, module, action, created_at) untuk query audit
 *
 * TIDAK menggunakan MySQL PARTITION BY RANGE karena:
 *   - Memerlukan `created_at` masuk ke PRIMARY KEY (breaking change)
 *   - Tidak kompatibel dengan FK ke `users.id` yang sudah ada
 *   - Archiving via cron + archive table lebih portable dan reversible
 *
 * STRATEGI ARCHIVING (dieksekusi oleh command `logs:archive-activity`):
 *   Data > N bulan → di-INSERT ke `activity_logs_archive` → DELETE dari tabel utama
 *   Tabel archive identik strukturnya, tidak ada FK constraint (lebih ringan).
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Pastikan school_id ada ────────────────────────────────
        if (!Schema::hasColumn('activity_logs', 'school_id')) {
            Schema::table('activity_logs', function (Blueprint $table) {
                $table->foreignId('school_id')
                    ->nullable()
                    ->after('id')
                    ->comment('FK ke schools.id. NULL untuk aksi platform-level')
                    ->constrained('schools')
                    ->nullOnDelete();
            });
        }

        // ── 2. Pastikan kolom changes ada ───────────────────────────
        if (!Schema::hasColumn('activity_logs', 'changes')) {
            Schema::table('activity_logs', function (Blueprint $table) {
                $table->json('changes')
                    ->nullable()
                    ->after('keterangan')
                    ->comment('Structured diff: {"old":{...},"new":{...}}');
            });
        }

        // ── 3. Tambah kolom archived_at ──────────────────────────────
        if (!Schema::hasColumn('activity_logs', 'archived_at')) {
            Schema::table('activity_logs', function (Blueprint $table) {
                $table->timestamp('archived_at')
                    ->nullable()
                    ->after('created_at')
                    ->comment('Diset saat baris dipindah ke activity_logs_archive. NULL = masih aktif');
            });
        }

        // ── 4. Index composite untuk archiver (range delete per tenant) ──
        if (!$this->indexExists('activity_logs', 'idx_actlog_school_created')) {
            Schema::table('activity_logs', function (Blueprint $table) {
                $table->index(['school_id', 'created_at'], 'idx_actlog_school_created');
            });
        }

        // ── 5. Index composite untuk query audit UI ──────────────────
        // Pola query paling umum: WHERE school_id = ? AND module = ? ORDER BY created_at DESC
        if (!$this->indexExists('activity_logs', 'idx_actlog_school_module_action_created')) {
            Schema::table('activity_logs', function (Blueprint $table) {
                $table->index(
                    ['school_id', 'module', 'action', 'created_at'],
                    'idx_actlog_school_module_action_created'
                );
            });
        }

        // ── 6. Buat tabel activity_logs_archive ──────────────────────
        // Struktur identik dengan activity_logs TANPA foreign key constraint
        // supaya data lama bisa diarsip meski user/school sudah dihapus
        if (!Schema::hasTable('activity_logs_archive')) {
            Schema::create('activity_logs_archive', function (Blueprint $table) {
                $table->unsignedBigInteger('id')->primary()
                    ->comment('ID asli dari activity_logs — dipertahankan untuk audit trail');
                $table->unsignedBigInteger('school_id')->nullable()
                    ->comment('Salinan school_id. Tanpa FK agar data tetap ada walau school dihapus');
                $table->unsignedBigInteger('user_id')->nullable()
                    ->comment('Salinan user_id. Tanpa FK agar data tetap ada walau user dihapus');
                $table->string('action', 50);
                $table->string('module', 60);
                $table->unsignedBigInteger('subject_id')->nullable();
                $table->text('keterangan')->nullable();
                $table->json('changes')->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->string('user_agent', 255)->nullable();
                $table->timestamp('created_at')->nullable()
                    ->comment('Waktu aksi original');
                $table->timestamp('archived_at')->useCurrent()
                    ->comment('Waktu baris ini dipindahkan ke archive');

                // Index untuk query di tabel archive (audit historis)
                $table->index(['school_id', 'created_at'], 'idx_archive_school_created');
                $table->index(['school_id', 'module'], 'idx_archive_school_module');
                $table->index('archived_at', 'idx_archive_archived_at');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs_archive');

        Schema::table('activity_logs', function (Blueprint $table) {
            if ($this->indexExists('activity_logs', 'idx_actlog_school_module_action_created')) {
                $table->dropIndex('idx_actlog_school_module_action_created');
            }
            if ($this->indexExists('activity_logs', 'idx_actlog_school_created')) {
                $table->dropIndex('idx_actlog_school_created');
            }
            if (Schema::hasColumn('activity_logs', 'archived_at')) {
                $table->dropColumn('archived_at');
            }
        });
    }

    private function indexExists(string $table, string $indexName): bool
    {
        $db = config('database.connections.mysql.database');

        $result = DB::selectOne("
            SELECT COUNT(*) AS cnt
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = ?
              AND TABLE_NAME   = ?
              AND INDEX_NAME   = ?
        ", [$db, $table, $indexName]);

        return ($result->cnt ?? 0) > 0;
    }
};
