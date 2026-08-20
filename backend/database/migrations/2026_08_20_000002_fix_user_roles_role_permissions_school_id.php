<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fix #2 & #3 — user_roles + role_permissions: IDOR + Cross-Tenant Risk
 *
 * Migration ini IDEMPOTENT — aman dijalankan ulang dari kondisi apapun.
 *
 * CATATAN MYSQL error 1553:
 *   MySQL melarang DROP INDEX / DROP PRIMARY KEY jika masih digunakan FK.
 *   Urutan wajib: drop FK → drop index/PK → buat index/PK baru → recreate FK.
 */
return new class extends Migration {

    private function fkExists(string $table, string $constraint): bool
    {
        return !empty(DB::select("
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_schema = DATABASE()
              AND table_name   = ?
              AND constraint_name = ?
              AND constraint_type = 'FOREIGN KEY'
            LIMIT 1
        ", [$table, $constraint]));
    }

    private function indexExists(string $table, string $index): bool
    {
        return !empty(DB::select("
            SELECT 1 FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name  = ?
              AND index_name  = ?
            LIMIT 1
        ", [$table, $index]));
    }

    private function pkColumns(string $table): array
    {
        $rows = DB::select("
            SELECT column_name FROM information_schema.key_column_usage
            WHERE table_schema   = DATABASE()
              AND table_name     = ?
              AND constraint_name = 'PRIMARY'
            ORDER BY ordinal_position
        ", [$table]);
        return array_column($rows, 'column_name');
    }

    public function up(): void
    {
        // ══════════════════════════════════════════════════════════════════════
        // FIX user_roles
        // ══════════════════════════════════════════════════════════════════════

        // Step 1: Tambah school_id (skip jika sudah ada)
        if (!Schema::hasColumn('user_roles', 'school_id')) {
            Schema::table('user_roles', function (Blueprint $table) {
                $table->unsignedBigInteger('school_id')->nullable()->after('id')
                    ->comment('Tenant isolasi. Role assignment scoped per-sekolah.');
            });
        }

        // Step 2: Populate dari roles.school_id
        DB::statement("
            UPDATE user_roles ur
            INNER JOIN roles r ON ur.role_id = r.id
            SET ur.school_id = r.school_id
            WHERE ur.school_id IS NULL
        ");

        // Step 3: Hapus orphan
        DB::table('user_roles')->whereNull('school_id')->delete();

        // Step 4: NOT NULL
        DB::statement('ALTER TABLE `user_roles` MODIFY `school_id` BIGINT UNSIGNED NOT NULL');

        // Step 5: Drop FK yang menempel pada index uq_user_roles sebelum drop index
        foreach (['fk_user_roles_role', 'user_roles_user_id_foreign'] as $fk) {
            if ($this->fkExists('user_roles', $fk)) {
                Schema::table('user_roles', fn(Blueprint $t) => $t->dropForeign($fk));
            }
        }

        // Step 6: Drop index lama
        if ($this->indexExists('user_roles', 'uq_user_roles')) {
            Schema::table('user_roles', fn(Blueprint $t) => $t->dropUnique('uq_user_roles'));
        }

        // Step 7: Buat unique composite baru
        if (!$this->indexExists('user_roles', 'uq_user_roles_school_user_role')) {
            Schema::table('user_roles', function (Blueprint $table) {
                $table->unique(['school_id', 'user_id', 'role_id'], 'uq_user_roles_school_user_role');
            });
        }

        // Step 8: Recreate FK user_id, role_id + tambah FK school_id
        Schema::table('user_roles', function (Blueprint $table) {
            if (!$this->fkExists('user_roles', 'user_roles_user_id_foreign')) {
                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            }
            if (!$this->fkExists('user_roles', 'fk_user_roles_role')) {
                $table->foreign('role_id', 'fk_user_roles_role')
                    ->references('id')->on('roles')->cascadeOnDelete();
            }
            if (!$this->fkExists('user_roles', 'fk_user_roles_school')) {
                $table->foreign('school_id', 'fk_user_roles_school')
                    ->references('id')->on('schools')->cascadeOnDelete();
            }
            if (!$this->indexExists('user_roles', 'idx_user_roles_school')) {
                $table->index('school_id', 'idx_user_roles_school');
            }
        });

        // ══════════════════════════════════════════════════════════════════════
        // FIX role_permissions
        // ══════════════════════════════════════════════════════════════════════

        // Step 1: Tambah school_id (skip jika sudah ada)
        if (!Schema::hasColumn('role_permissions', 'school_id')) {
            Schema::table('role_permissions', function (Blueprint $table) {
                $table->unsignedBigInteger('school_id')->nullable()->after('permission_id')
                    ->comment('Tenant isolasi. Permission assignment scoped per-sekolah.');
            });
        }

        // Step 2: Populate
        DB::statement("
            UPDATE role_permissions rp
            INNER JOIN roles r ON rp.role_id = r.id
            SET rp.school_id = r.school_id
            WHERE rp.school_id IS NULL
        ");

        // Step 3: Hapus orphan
        DB::table('role_permissions')->whereNull('school_id')->delete();

        // Step 4: NOT NULL
        DB::statement('ALTER TABLE `role_permissions` MODIFY `school_id` BIGINT UNSIGNED NOT NULL');

        // Step 5: Cek apakah PK sudah include school_id
        $pkCols = $this->pkColumns('role_permissions');
        if (!in_array('school_id', $pkCols)) {
            // WAJIB drop semua FK di role_permissions dulu sebelum DROP PRIMARY KEY
            // MySQL error 1553: cannot drop PRIMARY KEY needed in a FK constraint.
            // FK yang ada: role_permissions_role_id_foreign, role_permissions_permission_id_foreign
            foreach ([
                'role_permissions_role_id_foreign',
                'role_permissions_permission_id_foreign',
                'fk_role_permissions_school',
            ] as $fk) {
                if ($this->fkExists('role_permissions', $fk)) {
                    Schema::table('role_permissions', fn(Blueprint $t) => $t->dropForeign($fk));
                }
            }

            // Sekarang aman drop PRIMARY KEY dan buat yang baru
            Schema::table('role_permissions', function (Blueprint $table) {
                $table->dropPrimary();
                $table->primary(['school_id', 'role_id', 'permission_id'], 'pk_rp_school_role_perm');
            });

            // Recreate FK role_id, permission_id + tambah FK school_id
            Schema::table('role_permissions', function (Blueprint $table) {
                if (!$this->fkExists('role_permissions', 'role_permissions_role_id_foreign')) {
                    $table->foreign('role_id')->references('id')->on('roles')->cascadeOnDelete();
                }
                if (!$this->fkExists('role_permissions', 'role_permissions_permission_id_foreign')) {
                    $table->foreign('permission_id')->references('id')->on('permissions')->cascadeOnDelete();
                }
                if (!$this->fkExists('role_permissions', 'fk_role_permissions_school')) {
                    $table->foreign('school_id', 'fk_role_permissions_school')
                        ->references('id')->on('schools')->cascadeOnDelete();
                }
                if (!$this->indexExists('role_permissions', 'idx_role_permissions_school')) {
                    $table->index('school_id', 'idx_role_permissions_school');
                }
            });
        }
    }

    public function down(): void
    {
        // ── Revert role_permissions ───────────────────────────────────────────
        foreach ([
            'fk_role_permissions_school',
            'role_permissions_role_id_foreign',
            'role_permissions_permission_id_foreign',
        ] as $fk) {
            if ($this->fkExists('role_permissions', $fk)) {
                Schema::table('role_permissions', fn(Blueprint $t) => $t->dropForeign($fk));
            }
        }

        $pkCols = $this->pkColumns('role_permissions');
        if (in_array('school_id', $pkCols)) {
            Schema::table('role_permissions', function (Blueprint $table) {
                $table->dropPrimary('pk_rp_school_role_perm');
                $table->primary(['role_id', 'permission_id']);
            });
            // Recreate FK setelah PK baru
            Schema::table('role_permissions', function (Blueprint $table) {
                if (!$this->fkExists('role_permissions', 'role_permissions_role_id_foreign')) {
                    $table->foreign('role_id')->references('id')->on('roles')->cascadeOnDelete();
                }
                if (!$this->fkExists('role_permissions', 'role_permissions_permission_id_foreign')) {
                    $table->foreign('permission_id')->references('id')->on('permissions')->cascadeOnDelete();
                }
            });
        }

        if ($this->indexExists('role_permissions', 'idx_role_permissions_school')) {
            Schema::table('role_permissions', fn(Blueprint $t) => $t->dropIndex('idx_role_permissions_school'));
        }
        if (Schema::hasColumn('role_permissions', 'school_id')) {
            Schema::table('role_permissions', fn(Blueprint $t) => $t->dropColumn('school_id'));
        }

        // ── Revert user_roles ─────────────────────────────────────────────────
        foreach (['fk_user_roles_school', 'fk_user_roles_role', 'user_roles_user_id_foreign'] as $fk) {
            if ($this->fkExists('user_roles', $fk)) {
                Schema::table('user_roles', fn(Blueprint $t) => $t->dropForeign($fk));
            }
        }
        if ($this->indexExists('user_roles', 'uq_user_roles_school_user_role')) {
            Schema::table('user_roles', fn(Blueprint $t) => $t->dropUnique('uq_user_roles_school_user_role'));
        }
        if ($this->indexExists('user_roles', 'idx_user_roles_school')) {
            Schema::table('user_roles', fn(Blueprint $t) => $t->dropIndex('idx_user_roles_school'));
        }
        Schema::table('user_roles', function (Blueprint $table) {
            if (Schema::hasColumn('user_roles', 'school_id')) {
                $table->dropColumn('school_id');
            }
            if (!$this->fkExists('user_roles', 'user_roles_user_id_foreign')) {
                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            }
            if (!$this->fkExists('user_roles', 'fk_user_roles_role')) {
                $table->foreign('role_id', 'fk_user_roles_role')
                    ->references('id')->on('roles')->cascadeOnDelete();
            }
            if (!$this->indexExists('user_roles', 'uq_user_roles')) {
                $table->unique(['user_id', 'role_id'], 'uq_user_roles');
            }
        });
    }
};