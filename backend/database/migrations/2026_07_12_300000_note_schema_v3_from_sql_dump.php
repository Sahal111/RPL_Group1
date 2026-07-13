<?php

use Illuminate\Database\Migrations\Migration;

/**
 * CATATAN: Database sudah dibuat langsung dari minurulhuda3_v3.sql
 * Migration ini hanya penanda agar Laravel tidak mencoba re-create tabel.
 * Semua tabel sudah ada dengan nama baru (plural) sesuai standar Laravel Eloquent.
 *
 * Tabel yang sudah ada di DB (dari SQL dump):
 *   roles, users, user_roles, personal_access_tokens, activity_logs
 *   tahun_ajarans, semesters
 *   gurus, guru_jabatans, guru_pendidikans, guru_sertifikasis, guru_inpassings
 *   guru_diklats, guru_keluargas, guru_rekenings, guru_dokumens, guru_absensis
 *   wali_kelas, bendaharas, operator_profiles, admin_ppdb_profiles
 *   mapels, kelas, plot_guru_mapels, jadwals
 *   siswas, data_tambahan_siswas, perkembangan_siswas, program_kesejahteraan_siswas
 *   prestasis, beasiswas, berkas_siswas
 *   orang_tuas, orang_tua_siswa
 *   riwayat_kelas, mutasi_siswas
 *   absensis
 *   komponen_penilaians, nilais, nilai_akhirs, ekskuls, siswa_ekskuls, rapors, catatan_walis
 *   jenis_tagihans, tagihans, pembayarans
 *   calon_siswas, berkas_pendaftars, pembayaran_ppdb
 *   pengumumans, galeris, kalender_akademiks, pengaturans
 *   cache, cache_locks, jobs, failed_jobs, password_reset_tokens, sessions, migrations
 */
return new class extends Migration
{
    public function up(): void
    {
        // Tidak ada yang perlu dilakukan — DB sudah dibuat dari SQL dump v3
    }

    public function down(): void
    {
        // Tidak ada rollback — jangan drop tabel dari sini
    }
};
