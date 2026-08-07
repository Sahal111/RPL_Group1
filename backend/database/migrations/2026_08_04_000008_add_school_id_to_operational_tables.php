<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tambah school_id ke semua tabel operasional.
 *
 * PENTING: Migration ini dijalankan di environment fresh (data dev).
 * Kolom dibuat nullable dulu untuk kompatibilitas,
 * lalu setelah SchoolSeeder dijalankan dan data lama di-assign ke school_id,
 * bisa dibuat NOT NULL via migration terpisah.
 *
 * Tabel yang TIDAK dapat school_id (global/sistem):
 *   schools, school_settings, school_domains, plans, plan_features,
 *   platform_admins, personal_access_tokens, password_reset_tokens,
 *   cache, cache_locks, sessions, jobs, failed_jobs, migrations
 */
return new class extends Migration {
    /**
     * Daftar tabel operasional yang perlu school_id.
     * Key = nama tabel, value = nama index yang dibuat
     */
    private array $tables = [
        'gurus' => 'idx_gurus_school',
        'guru_jabatans' => 'idx_guru_jabatans_school',
        'guru_pendidikans' => 'idx_guru_pendidikans_school',
        'guru_sertifikasis' => 'idx_guru_sertifikasis_school',
        'guru_inpassings' => 'idx_guru_inpassings_school',
        'guru_diklats' => 'idx_guru_diklats_school',
        'guru_mutasis' => 'idx_guru_mutasis_school',
        'guru_keluargas' => 'idx_guru_keluargas_school',
        'guru_rekenings' => 'idx_guru_rekenings_school',
        'guru_dokumens' => 'idx_guru_dokumens_school',
        'guru_absensis' => 'idx_guru_absensis_school',
        'guru_import_logs' => 'idx_guru_import_logs_school',
        'siswas' => 'idx_siswas_school',
        'data_tambahan_siswas' => 'idx_data_tambahan_siswas_school',
        'perkembangan_siswas' => 'idx_perkembangan_siswas_school',
        'program_kesejahteraan_siswas' => 'idx_prog_kesra_school',
        'prestasis' => 'idx_prestasis_school',
        'beasiswas' => 'idx_beasiswas_school',
        'berkas_siswas' => 'idx_berkas_siswas_school',
        'mutasi_siswas' => 'idx_mutasi_siswas_school',
        'orang_tuas' => 'idx_orang_tuas_school',
        'kelas' => 'idx_kelas_school',
        'tahun_ajarans' => 'idx_tahun_ajarans_school',
        'semesters' => 'idx_semesters_school',
        'mapels' => 'idx_mapels_school',
        'plot_guru_mapels' => 'idx_plot_guru_mapels_school',
        'jadwals' => 'idx_jadwals_school',
        'riwayat_kelas' => 'idx_riwayat_kelas_school',
        'absensis' => 'idx_absensis_school',
        'wali_kelas' => 'idx_wali_kelas_school',
        'bendaharas' => 'idx_bendaharas_school',
        'operator_profiles' => 'idx_operator_profiles_school',
        'admin_ppdb_profiles' => 'idx_admin_ppdb_profiles_school',
        'komponen_penilaians' => 'idx_komponen_penilaians_school',
        'nilais' => 'idx_nilais_school',
        'nilai_akhirs' => 'idx_nilai_akhirs_school',
        'ekskuls' => 'idx_ekskuls_school',
        'siswa_ekskuls' => 'idx_siswa_ekskuls_school',
        'rapors' => 'idx_rapors_school',
        'catatan_walis' => 'idx_catatan_walis_school',
        'jenis_tagihans' => 'idx_jenis_tagihans_school',
        'tagihans' => 'idx_tagihans_school',
        'pembayarans' => 'idx_pembayarans_school',
        'calon_siswas' => 'idx_calon_siswas_school',
        'berkas_pendaftars' => 'idx_berkas_pendaftars_school',
        'pembayaran_ppdb' => 'idx_pembayaran_ppdb_school',
        'pengumumans' => 'idx_pengumumans_school',
        'galeris' => 'idx_galeris_school',
        'kalender_akademiks' => 'idx_kalender_akademiks_school',
        'activity_logs' => 'idx_activity_logs_school',
    ];

    public function up(): void
    {
        foreach ($this->tables as $table => $indexName) {
            // Skip kalau tabel tidak ada (misal fitur belum dibuat)
            if (!Schema::hasTable($table)) {
                continue;
            }

            // Skip kalau school_id sudah ada
            if (Schema::hasColumn($table, 'school_id')) {
                continue;
            }

            Schema::table($table, function (Blueprint $t) use ($indexName) {
                $t->foreignId('school_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('schools')
                    ->cascadeOnDelete();

                $t->index('school_id', $indexName);
            });
        }

        // Khusus tahun_ajarans: ubah unique key tahun → composite (school_id, tahun)
        // Karena dua sekolah boleh punya tahun ajaran dengan nilai yang sama
        // Guard: skip jika uq_tahun_ajaran_school sudah ada (dibuat oleh 000002)
        if (Schema::hasTable('tahun_ajarans') && Schema::hasColumn('tahun_ajarans', 'school_id')) {
            $existingComposite = \Illuminate\Support\Facades\DB::select(
                "SHOW INDEX FROM `tahun_ajarans` WHERE Key_name = 'uq_tahun_ajaran_school'"
            );
            if (empty($existingComposite)) {
                Schema::table('tahun_ajarans', function (Blueprint $table) {
                    // Drop unique lama
                    try {
                        $table->dropUnique('uq_tahun_ajaran');
                    } catch (\Exception $e) {
                        // Mungkin nama indexnya beda — skip
                    }

                    // Unique baru per sekolah
                    $table->unique(['school_id', 'tahun'], 'uq_tahun_ajaran_school');
                });
            }
        }
    }

    public function down(): void
    {
        // Kembalikan unique key tahun_ajarans — hanya jika 000002 belum mengelolanya
        // (000002 membuat uq_tahun_ajaran_school, jadi kita skip di sini)
        // Tidak ada tindakan rollback unique key di sini.

        // Hapus school_id dari semua tabel
        foreach (array_reverse($this->tables) as $table => $indexName) {
            if (!Schema::hasTable($table) || !Schema::hasColumn($table, 'school_id')) {
                continue;
            }

            Schema::table($table, function (Blueprint $t) use ($indexName, $table) {
                $t->dropIndex($indexName);
                $t->dropForeign(['school_id']);
                $t->dropColumn('school_id');
            });
        }
    }
};