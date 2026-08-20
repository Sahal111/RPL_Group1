<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fix — plot_guru_mapels: Unique constraint tidak include school_id
 *
 * MASALAH:
 *   Constraint: UNIQUE(guru_id, mapel_id, kelas_id, semester_id)
 *   Ini global — Guru A dari Sekolah 1 mengajar Matematika di Kelas 7A
 *   akan CONFLICT dengan Guru B dari Sekolah 2 yang juga mengajar hal sama.
 *   Dalam SaaS multi-tenant, uniqueness harus per-sekolah.
 *
 * FIX:
 *   MySQL tidak bisa drop index yang dipakai sebagai backing index untuk
 *   foreign key constraint. Urutan yang benar:
 *     1. Drop FK yang bergantung pada index tersebut
 *     2. Drop index lama
 *     3. Buat index baru dengan school_id
 *     4. Restore FK (pakai index baru sebagai backing)
 *
 * DAMPAK:
 *   - Data existing tidak berubah
 *   - Insert baru yang duplicate dalam sekolah yang sama tetap ditolak ✓
 *   - Insert dari sekolah berbeda dengan data sama tidak lagi conflict ✓
 */
return new class extends Migration {
    public function up(): void
    {
        // Cari semua FK yang menggunakan index 'uq_plot_guru_mapel_kelas' sebagai backing
        // Biasanya ini FK dari tabel lain yang referensi ke kombinasi kolom tersebut,
        // atau FK di tabel ini sendiri yang kebetulan backing-nya index itu.
        // Cara paling aman: drop FK yang berkaitan, lakukan perubahan index, restore FK.

        $fksToDrop = DB::select("
            SELECT kcu.CONSTRAINT_NAME, kcu.COLUMN_NAME, kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME,
                   rc.UPDATE_RULE, rc.DELETE_RULE
            FROM information_schema.KEY_COLUMN_USAGE kcu
            JOIN information_schema.REFERENTIAL_CONSTRAINTS rc
                ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
               AND kcu.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA
            WHERE kcu.TABLE_SCHEMA = DATABASE()
              AND kcu.TABLE_NAME = 'plot_guru_mapels'
              AND kcu.CONSTRAINT_NAME != 'PRIMARY'
              AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
        ");

        // Kumpulkan nama FK unik agar tidak double-drop
        $droppedFks = [];

        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        try {
            Schema::table('plot_guru_mapels', function (Blueprint $table) use ($fksToDrop, &$droppedFks) {

                // Step 1 — Drop semua FK di tabel ini agar index bebas di-drop
                foreach ($fksToDrop as $fk) {
                    $name = $fk->CONSTRAINT_NAME;
                    if (!in_array($name, $droppedFks)) {
                        $exists = DB::select("
                            SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
                            WHERE TABLE_SCHEMA = DATABASE()
                              AND TABLE_NAME = 'plot_guru_mapels'
                              AND CONSTRAINT_NAME = ?
                              AND CONSTRAINT_TYPE = 'FOREIGN KEY'
                        ", [$name]);

                        if (!empty($exists)) {
                            $table->dropForeign($name);
                            $droppedFks[] = $name;
                        }
                    }
                }

                // Step 2 — Drop index lama yang tidak include school_id
                $oldExists = DB::select("
                    SELECT 1 FROM information_schema.statistics
                    WHERE table_schema = DATABASE()
                      AND table_name = 'plot_guru_mapels'
                      AND index_name = 'uq_plot_guru_mapel_kelas'
                    LIMIT 1
                ");

                if (!empty($oldExists)) {
                    $table->dropUnique('uq_plot_guru_mapel_kelas');
                }

                // Step 3 — Buat unique index baru yang include school_id
                $newExists = DB::select("
                    SELECT 1 FROM information_schema.statistics
                    WHERE table_schema = DATABASE()
                      AND table_name = 'plot_guru_mapels'
                      AND index_name = 'uq_plot_guru_mapel_school_kelas'
                    LIMIT 1
                ");

                if (empty($newExists)) {
                    $table->unique(
                        ['school_id', 'guru_id', 'mapel_id', 'kelas_id', 'semester_id'],
                        'uq_plot_guru_mapel_school_kelas'
                    );
                }
            });

            // Step 4 — Restore semua FK yang tadi di-drop
            Schema::table('plot_guru_mapels', function (Blueprint $table) use ($fksToDrop, $droppedFks) {
                $restored = [];
                foreach ($fksToDrop as $fk) {
                    $name = $fk->CONSTRAINT_NAME;
                    if (in_array($name, $droppedFks) && !in_array($name, $restored)) {
                        $col = $fk->COLUMN_NAME;
                        $refTable = $fk->REFERENCED_TABLE_NAME;
                        $refCol = $fk->REFERENCED_COLUMN_NAME;

                        $table->foreign($col, $name)
                            ->references($refCol)
                            ->on($refTable)
                            ->onUpdate($fk->UPDATE_RULE)
                            ->onDelete($fk->DELETE_RULE);

                        $restored[] = $name;
                    }
                }
            });

        } finally {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        try {
            Schema::table('plot_guru_mapels', function (Blueprint $table) {
                $newExists = DB::select("
                    SELECT 1 FROM information_schema.statistics
                    WHERE table_schema = DATABASE()
                      AND table_name = 'plot_guru_mapels'
                      AND index_name = 'uq_plot_guru_mapel_school_kelas'
                    LIMIT 1
                ");

                if (!empty($newExists)) {
                    $table->dropUnique('uq_plot_guru_mapel_school_kelas');
                }

                $oldExists = DB::select("
                    SELECT 1 FROM information_schema.statistics
                    WHERE table_schema = DATABASE()
                      AND table_name = 'plot_guru_mapels'
                      AND index_name = 'uq_plot_guru_mapel_kelas'
                    LIMIT 1
                ");

                if (empty($oldExists)) {
                    $table->unique(
                        ['guru_id', 'mapel_id', 'kelas_id', 'semester_id'],
                        'uq_plot_guru_mapel_kelas'
                    );
                }
            });
        } finally {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }
    }
};