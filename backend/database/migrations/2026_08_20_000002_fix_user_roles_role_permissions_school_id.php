<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fix #2 & #3 — user_roles + role_permissions: IDOR + Cross-Tenant Risk
 *
 * MASALAH user_roles:
 *   Pivot `user_id ↔ role_id` tidak memiliki `school_id`. Attacker bisa POST
 *   dengan role_id dari sekolah lain dan DB tidak akan menolak (tidak ada FK
 *   yang memvalidasi "role ini milik sekolah yang sama dengan user").
 *   IDOR risk: privilege escalation lintas sekolah.
 *
 * MASALAH role_permissions:
 *   Pivot `role_id ↔ permission_id` tidak ada `school_id`. Meskipun kedua
 *   parent table sudah punya school_id, pivotnya tidak enforce konsistensi.
 *   Attacker bisa assign permission sekolah B ke role sekolah A.
 *
 * SOLUSI:
 *   - Tambah school_id NOT NULL ke kedua tabel pivot
 *   - Populate dari parent table (roles.school_id)
 *   - Tambah unique constraint composite yang include school_id
 *   - Tambah FK ke schools untuk DB-level enforcement
 */
return new class extends Migration {
    public function up(): void
    {
        // ── FIX user_roles ────────────────────────────────────────────────────

        Schema::table('user_roles', function (Blueprint $table) {
            // Step 1: Tambah nullable dulu untuk populate
            $table->unsignedBigInteger('school_id')->nullable()->after('id')
                ->comment('Tenant isolasi. Role assignment scoped per-sekolah. FK ke schools.');
        });

        // Step 2: Populate school_id dari roles.school_id
        DB::statement("
            UPDATE user_roles ur
            INNER JOIN roles r ON ur.role_id = r.id
            SET ur.school_id = r.school_id
            WHERE ur.school_id IS NULL
        ");

        // Step 3: Hapus baris orphan (role tanpa school_id — seharusnya 0)
        DB::table('user_roles')->whereNull('school_id')->delete();

        Schema::table('user_roles', function (Blueprint $table) {
            // Step 4: NOT NULL setelah populate
            DB::statement('ALTER TABLE `user_roles` MODIFY `school_id` BIGINT UNSIGNED NOT NULL');

            // Step 5: Drop unique lama, buat composite yang include school_id
            $indexExists = DB::select("
                SELECT 1 FROM information_schema.statistics
                WHERE table_schema = DATABASE() AND table_name = 'user_roles' AND index_name = 'uq_user_roles'
                LIMIT 1
            ");
            if (!empty($indexExists)) {
                $table->dropUnique('uq_user_roles');
            }

            $newExists = DB::select("
                SELECT 1 FROM information_schema.statistics
                WHERE table_schema = DATABASE() AND table_name = 'user_roles' AND index_name = 'uq_user_roles_school_user_role'
                LIMIT 1
            ");
            if (empty($newExists)) {
                $table->unique(['school_id', 'user_id', 'role_id'], 'uq_user_roles_school_user_role');
            }

            // Step 6: FK ke schools
            $fkExists = DB::select("
                SELECT 1 FROM information_schema.key_column_usage
                WHERE table_schema = DATABASE() AND table_name = 'user_roles' AND constraint_name = 'fk_user_roles_school'
                LIMIT 1
            ");
            if (empty($fkExists)) {
                $table->foreign('school_id', 'fk_user_roles_school')
                    ->references('id')
                    ->on('schools')
                    ->cascadeOnDelete();
            }

            $table->index('school_id', 'idx_user_roles_school');
        });

        // ── FIX role_permissions ──────────────────────────────────────────────

        Schema::table('role_permissions', function (Blueprint $table) {
            // Tambah school_id nullable dulu
            $table->unsignedBigInteger('school_id')->nullable()->after('permission_id')
                ->comment('Tenant isolasi. Permission assignment scoped per-sekolah.');
        });

        // Populate dari roles.school_id (melalui role_id)
        DB::statement("
            UPDATE role_permissions rp
            INNER JOIN roles r ON rp.role_id = r.id
            SET rp.school_id = r.school_id
            WHERE rp.school_id IS NULL
        ");

        // Hapus orphan
        DB::table('role_permissions')->whereNull('school_id')->delete();

        Schema::table('role_permissions', function (Blueprint $table) {
            DB::statement('ALTER TABLE `role_permissions` MODIFY `school_id` BIGINT UNSIGNED NOT NULL');

            // role_permissions pakai composite PK (role_id, permission_id) — drop dulu
            $table->dropPrimary();

            // PK baru include school_id
            $table->primary(['school_id', 'role_id', 'permission_id'], 'pk_rp_school_role_perm');

            // FK ke schools
            $table->foreign('school_id', 'fk_role_permissions_school')
                ->references('id')
                ->on('schools')
                ->cascadeOnDelete();

            $table->index('school_id', 'idx_role_permissions_school');
        });
    }

    public function down(): void
    {
        // Revert role_permissions
        Schema::table('role_permissions', function (Blueprint $table) {
            $table->dropPrimary('pk_rp_school_role_perm');
            $table->dropForeign('fk_role_permissions_school');
            $table->dropIndex('idx_role_permissions_school');
            $table->dropColumn('school_id');
            $table->primary(['role_id', 'permission_id']);
        });

        // Revert user_roles
        Schema::table('user_roles', function (Blueprint $table) {
            $newExists = DB::select("
                SELECT 1 FROM information_schema.statistics
                WHERE table_schema = DATABASE() AND table_name = 'user_roles' AND index_name = 'uq_user_roles_school_user_role'
                LIMIT 1
            ");
            if (!empty($newExists)) {
                $table->dropUnique('uq_user_roles_school_user_role');
            }
            $table->dropForeign('fk_user_roles_school');
            $table->dropIndex('idx_user_roles_school');
            $table->dropColumn('school_id');
            $table->unique(['user_id', 'role_id'], 'uq_user_roles');
        });
    }
};