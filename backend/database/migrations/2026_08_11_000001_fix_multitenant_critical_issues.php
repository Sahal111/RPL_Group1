<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

/**
 * Fix Multi-Tenant Critical Issues
 *
 * 1. school_id NULLABLE → NOT NULL pada 53 tabel operasional
 * 2. Tambah school_id ke 9 tabel yang belum punya
 * 3. Fix 7 UNIQUE constraint → composite (school_id, kolom)
 */
return new class extends Migration {
    public function up(): void
    {
        // ═══════════════════════════════════════════════════════════════
        // FIX #2: Tambah school_id ke 9 tabel yang belum punya
        // (Harus duluan sebelum fix #1 agar semua tabel punya school_id)
        // ═══════════════════════════════════════════════════════════════

        $tablesNeedSchoolId = [
            // child_table => [fk_column => parent_table]
            'galeris'               => ['uploaded_by' => 'users'],
            'guru_cuti'             => ['guru_id' => 'gurus'],
            'guru_dokumen_logs'     => ['guru_dokumen_id' => 'guru_dokumens'],
            'guru_dokumen_versions' => ['guru_dokumen_id' => 'guru_dokumens'],
            'guru_mutasi'           => ['guru_id' => 'gurus'],
            'guru_pkgs'             => ['guru_id' => 'gurus'],
            'kalender_akademiks'    => ['tahun_ajaran_id' => 'tahun_ajarans'],
            'orang_tua_siswa'       => ['siswa_id' => 'siswas'],
            'pengumumans'           => ['penulis_id' => 'users'],
        ];

        foreach ($tablesNeedSchoolId as $table => $relation) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'school_id')) {
                // Step 1: Add nullable school_id
                Schema::table($table, function (Blueprint $blueprint) {
                    $blueprint->unsignedBigInteger('school_id')->nullable()->after('id');
                });

                // Step 2: Populate from parent table
                $fkColumn = array_key_first($relation);
                $parentTable = $relation[$fkColumn];

                DB::statement("
                    UPDATE `{$table}` AS child
                    INNER JOIN `{$parentTable}` AS parent ON child.`{$fkColumn}` = parent.`id`
                    SET child.`school_id` = parent.`school_id`
                    WHERE child.`school_id` IS NULL
                ");

                // Step 3: Make NOT NULL, add FK and index
                Schema::table($table, function (Blueprint $blueprint) use ($table) {
                    $blueprint->unsignedBigInteger('school_id')->nullable(false)->change();
                    $blueprint->foreign('school_id', "fk_{$table}_school")
                        ->references('id')->on('schools')->cascadeOnDelete();
                    $blueprint->index('school_id', "idx_{$table}_school");
                });
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // FIX #1: school_id NULLABLE → NOT NULL pada 53 tabel operasional
        // ═══════════════════════════════════════════════════════════════

        $tablesNullableSchoolId = [
            'absensis',
            'activity_logs',
            'admin_ppdb_profiles',
            'beasiswas',
            'bendaharas',
            'berkas_pendaftars',
            'berkas_siswas',
            'calon_siswas',
            'catatan_walis',
            'data_retention_policies',
            'data_tambahan_siswas',
            'ekskuls',
            'guru_absensis',
            'guru_anaks',
            'guru_diklats',
            'guru_dokumens',
            'guru_import_logs',
            'guru_inpassings',
            'guru_jabatans',
            'guru_keluargas',
            'guru_kompetensi',
            'guru_kontak_darurat',
            'guru_pendidikans',
            'guru_rekenings',
            'guru_sertifikasis',
            'gurus',
            'jadwals',
            'jenis_tagihans',
            'kelas',
            'komponen_penilaians',
            'mapels',
            'mutasi_siswas',
            'nilai_akhirs',
            'nilais',
            'notification_templates',
            'operator_profiles',
            'orang_tuas',
            'pembayaran_ppdb',
            'pembayarans',
            'perkembangan_siswas',
            'plot_guru_mapels',
            'prestasis',
            'program_kesejahteraan_siswas',
            'rapors',
            'riwayat_kelas',
            'roles',
            'semesters',
            'siswa_ekskuls',
            'siswas',
            'tagihans',
            'tahun_ajarans',
            'users',
            'wali_kelas',
        ];

        foreach ($tablesNullableSchoolId as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'school_id')) {
                // Hapus data orphan yang school_id-nya NULL (seharusnya 0 berdasarkan audit)
                DB::statement("DELETE FROM `{$table}` WHERE `school_id` IS NULL");

                // Ubah ke NOT NULL
                DB::statement("ALTER TABLE `{$table}` MODIFY `school_id` BIGINT UNSIGNED NOT NULL");
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // FIX #3: UNIQUE constraint → composite (school_id, kolom)
        // ═══════════════════════════════════════════════════════════════

        $uniqueFixes = [
            // [table, old_index_name, new_index_name, [columns]]
            ['gurus',       'uq_gurus_email',           'uq_gurus_school_email',        ['school_id', 'email']],
            ['gurus',       'uq_gurus_nik',             'uq_gurus_school_nik',          ['school_id', 'nik']],
            ['gurus',       'uq_gurus_nip',             'uq_gurus_school_nip',          ['school_id', 'nip']],
            ['gurus',       'uq_gurus_nuptk',           'uq_gurus_school_nuptk',        ['school_id', 'nuptk']],
            ['mapels',      'uq_mapels_kode',           'uq_mapels_school_kode',        ['school_id', 'kode']],
            ['siswas',      'uq_siswas_kode',           'uq_siswas_school_kode',        ['school_id', 'kode_anak']],
            ['calon_siswas','uq_calon_nopendaftaran',   'uq_calon_school_nopendaftaran',['school_id', 'no_pendaftaran']],
            ['users',       'uq_users_username',        'uq_users_school_username',     ['school_id', 'username']],
        ];

        foreach ($uniqueFixes as [$table, $oldIndex, $newIndex, $columns]) {
            if (!Schema::hasTable($table)) continue;

            // Check if old index exists before attempting to drop
            $indexExists = DB::select("
                SELECT 1 FROM information_schema.statistics 
                WHERE table_schema = DATABASE() 
                  AND table_name = ? 
                  AND index_name = ?
                LIMIT 1
            ", [$table, $oldIndex]);

            if (!empty($indexExists)) {
                Schema::table($table, function (Blueprint $blueprint) use ($oldIndex) {
                    $blueprint->dropUnique($oldIndex);
                });
            }

            // Check if new index already exists
            $newIndexExists = DB::select("
                SELECT 1 FROM information_schema.statistics 
                WHERE table_schema = DATABASE() 
                  AND table_name = ? 
                  AND index_name = ?
                LIMIT 1
            ", [$table, $newIndex]);

            if (empty($newIndexExists)) {
                Schema::table($table, function (Blueprint $blueprint) use ($newIndex, $columns) {
                    $blueprint->unique($columns, $newIndex);
                });
            }
        }
    }

    public function down(): void
    {
        // ═══════════════════════════════════════════════════════════════
        // Revert FIX #3: composite → single UNIQUE
        // ═══════════════════════════════════════════════════════════════

        $uniqueReverts = [
            ['gurus',       'uq_gurus_school_email',        'uq_gurus_email',           'email'],
            ['gurus',       'uq_gurus_school_nik',          'uq_gurus_nik',             'nik'],
            ['gurus',       'uq_gurus_school_nip',          'uq_gurus_nip',             'nip'],
            ['gurus',       'uq_gurus_school_nuptk',        'uq_gurus_nuptk',           'nuptk'],
            ['mapels',      'uq_mapels_school_kode',        'uq_mapels_kode',           'kode'],
            ['siswas',      'uq_siswas_school_kode',        'uq_siswas_kode',           'kode_anak'],
            ['calon_siswas','uq_calon_school_nopendaftaran', 'uq_calon_nopendaftaran',  'no_pendaftaran'],
            ['users',       'uq_users_school_username',     'uq_users_username',        'username'],
        ];

        foreach ($uniqueReverts as [$table, $compositeIndex, $oldIndex, $column]) {
            if (!Schema::hasTable($table)) continue;

            $exists = DB::select("
                SELECT 1 FROM information_schema.statistics 
                WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ? LIMIT 1
            ", [$table, $compositeIndex]);

            if (!empty($exists)) {
                Schema::table($table, function (Blueprint $blueprint) use ($compositeIndex, $oldIndex, $column) {
                    $blueprint->dropUnique($compositeIndex);
                    $blueprint->unique($column, $oldIndex);
                });
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // Revert FIX #1: NOT NULL → NULLABLE
        // ═══════════════════════════════════════════════════════════════

        $tablesNullableSchoolId = [
            'absensis', 'activity_logs', 'admin_ppdb_profiles', 'beasiswas', 'bendaharas',
            'berkas_pendaftars', 'berkas_siswas', 'calon_siswas', 'catatan_walis',
            'data_retention_policies', 'data_tambahan_siswas', 'ekskuls', 'guru_absensis',
            'guru_anaks', 'guru_diklats', 'guru_dokumens', 'guru_import_logs', 'guru_inpassings',
            'guru_jabatans', 'guru_keluargas', 'guru_kompetensi', 'guru_kontak_darurat',
            'guru_pendidikans', 'guru_rekenings', 'guru_sertifikasis', 'gurus', 'jadwals',
            'jenis_tagihans', 'kelas', 'komponen_penilaians', 'mapels', 'mutasi_siswas',
            'nilai_akhirs', 'nilais', 'notification_templates', 'operator_profiles', 'orang_tuas',
            'pembayaran_ppdb', 'pembayarans', 'perkembangan_siswas', 'plot_guru_mapels',
            'prestasis', 'program_kesejahteraan_siswas', 'rapors', 'riwayat_kelas', 'roles',
            'semesters', 'siswa_ekskuls', 'siswas', 'tagihans', 'tahun_ajarans', 'users', 'wali_kelas',
        ];

        foreach ($tablesNullableSchoolId as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'school_id')) {
                DB::statement("ALTER TABLE `{$table}` MODIFY `school_id` BIGINT UNSIGNED NULL");
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // Revert FIX #2: Hapus school_id dari 9 tabel
        // ═══════════════════════════════════════════════════════════════

        $tablesAddedSchoolId = [
            'galeris', 'guru_cuti', 'guru_dokumen_logs', 'guru_dokumen_versions',
            'guru_mutasi', 'guru_pkgs', 'kalender_akademiks', 'orang_tua_siswa', 'pengumumans',
        ];

        foreach ($tablesAddedSchoolId as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'school_id')) {
                Schema::table($table, function (Blueprint $blueprint) use ($table) {
                    $blueprint->dropForeign("fk_{$table}_school");
                    $blueprint->dropIndex("idx_{$table}_school");
                    $blueprint->dropColumn('school_id');
                });
            }
        }
    }
};
