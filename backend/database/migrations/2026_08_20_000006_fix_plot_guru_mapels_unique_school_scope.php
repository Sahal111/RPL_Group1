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
 * SOLUSI:
 *   Drop constraint lama → buat UNIQUE(school_id, guru_id, mapel_id, kelas_id, semester_id)
 *
 * DAMPAK:
 *   - Data existing tidak berubah
 *   - Insert baru yang duplicate dalam sekolah yang sama tetap ditolak ✓
 *   - Insert dari sekolah berbeda dengan data sama tidak lagi conflict ✓
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('plot_guru_mapels', function (Blueprint $table) {
            // Drop constraint lama yang tidak include school_id
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

            // Buat constraint baru yang include school_id
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
    }

    public function down(): void
    {
        Schema::table('plot_guru_mapels', function (Blueprint $table) {
            $table->dropUnique('uq_plot_guru_mapel_school_kelas');
            $table->unique(
                ['guru_id', 'mapel_id', 'kelas_id', 'semester_id'],
                'uq_plot_guru_mapel_kelas'
            );
        });
    }
};