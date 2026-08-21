<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * P2: Tambah index yang missing untuk query pattern multi-tenant.
 *
 * Setiap index hanya ditambah jika memang belum ada.
 * Tidak menambah index berlebihan — hanya kolom yang digunakan
 * di WHERE, JOIN, ORDER BY, GROUP BY dalam context multi-tenant.
 */
return new class extends Migration
{
    public function up(): void
    {
        // siswas: pencarian nama dalam sekolah (fitur pencarian siswa)
        // Pattern: WHERE school_id = ? AND nama LIKE '%?%'
        if (!$this->indexExists('siswas', 'idx_siswas_school_nama')) {
            Schema::table('siswas', function (Blueprint $table) {
                $table->index(['school_id', 'nama'], 'idx_siswas_school_nama');
            });
        }

        // siswas: filter by status aktif + soft delete dalam sekolah
        // Pattern: WHERE school_id = ? AND is_active = 1 AND deleted_at IS NULL
        if (!$this->indexExists('siswas', 'idx_siswas_school_active_deleted')) {
            Schema::table('siswas', function (Blueprint $table) {
                $table->index(['school_id', 'deleted_at'], 'idx_siswas_school_active_deleted');
            });
        }

        // gurus: filter aktif per sekolah
        // Pattern: WHERE school_id = ? AND status_aktif = 1 AND deleted_at IS NULL
        if (!$this->indexExists('gurus', 'idx_gurus_school_deleted')) {
            Schema::table('gurus', function (Blueprint $table) {
                $table->index(['school_id', 'deleted_at'], 'idx_gurus_school_deleted');
            });
        }

        // gurus: pencarian nama dalam sekolah
        if (!$this->indexExists('gurus', 'idx_gurus_school_nama')) {
            Schema::table('gurus', function (Blueprint $table) {
                $table->index(['school_id', 'nama'], 'idx_gurus_school_nama');
            });
        }

        // orang_tuas: pencarian by HP/email dalam sekolah (login wali murid)
        if (!$this->indexExists('orang_tuas', 'idx_ortu_school_hp')) {
            Schema::table('orang_tuas', function (Blueprint $table) {
                $table->index(['school_id', 'no_hp'], 'idx_ortu_school_hp');
            });
        }

        // roles: filter tenant roles (exclude platform roles)
        // Pattern: WHERE school_id = ? AND is_platform_role = false
        if (!$this->indexExists('roles', 'idx_roles_school_platform')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->index(['school_id', 'is_platform_role'], 'idx_roles_school_platform');
            });
        }

        // activity_logs_archive: query audit log lama per sekolah
        // Tabel archive sering di-query by date range
        if (Schema::hasTable('activity_logs_archive')) {
            if (!$this->indexExists('activity_logs_archive', 'idx_log_archive_school_created')) {
                Schema::table('activity_logs_archive', function (Blueprint $table) {
                    $table->index(['school_id', 'created_at'], 'idx_log_archive_school_created');
                });
            }
        }
    }

    public function down(): void
    {
        $drops = [
            'siswas' => ['idx_siswas_school_nama', 'idx_siswas_school_active_deleted'],
            'gurus' => ['idx_gurus_school_deleted', 'idx_gurus_school_nama'],
            'orang_tuas' => ['idx_ortu_school_hp'],
            'roles' => ['idx_roles_school_platform'],
        ];

        foreach ($drops as $table => $indexes) {
            Schema::table($table, function (Blueprint $t) use ($indexes) {
                foreach ($indexes as $index) {
                    try {
                        $t->dropIndex($index);
                    } catch (\Exception $e) {
                        // Index tidak ada, lanjut
                    }
                }
            });
        }

        if (Schema::hasTable('activity_logs_archive')) {
            Schema::table('activity_logs_archive', function (Blueprint $table) {
                try {
                    $table->dropIndex('idx_log_archive_school_created');
                } catch (\Exception $e) {}
            });
        }
    }

    private function indexExists(string $table, string $indexName): bool
    {
        $indexes = DB::select("SHOW INDEX FROM `{$table}` WHERE Key_name = ?", [$indexName]);
        return !empty($indexes);
    }
};
