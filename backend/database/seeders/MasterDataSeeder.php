<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Seed data master yang menggantikan ENUM hardcoded.
 * Harus dijalankan SETELAH SchoolSeeder.
 *
 * Reviewer note: "Ubah ENUM yang berpotensi berubah menjadi tabel master tersendiri,
 * sehingga penambahan nilai cukup via CMS tanpa ALTER TABLE."
 */
class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // school_id = NULL berarti nilai ini berlaku global (default sistem)
        // Sekolah bisa tambah nilai custom dengan mengisi school_id mereka

        // ── Master Status Kepegawaian ─────────────────────────────────
        // Menggantikan: ENUM('PNS','PPPK','GTY','GTT','Honorer','Lainnya') di gurus
        DB::table('master_status_kepegawaians')->insertOrIgnore([
            ['school_id' => null, 'kode' => 'PNS',    'nama' => 'Pegawai Negeri Sipil',             'deskripsi' => 'Diangkat berdasarkan SK BKN/Kemenag',              'urutan' => 1, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'kode' => 'PPPK',   'nama' => 'Pegawai Pemerintah dengan Perjanjian Kerja', 'deskripsi' => 'ASN non-PNS, kontrak berbasis kinerja', 'urutan' => 2, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'kode' => 'GTY',    'nama' => 'Guru Tetap Yayasan',               'deskripsi' => 'Diangkat yayasan sebagai pegawai tetap',           'urutan' => 3, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'kode' => 'GTT',    'nama' => 'Guru Tidak Tetap',                 'deskripsi' => 'Kontrak tahunan oleh yayasan/sekolah',             'urutan' => 4, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'kode' => 'Honor',  'nama' => 'Guru Honorer',                     'deskripsi' => 'Dibayar per jam/bulan, belum ada SK tetap',        'urutan' => 5, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'kode' => 'DPK',    'nama' => 'Guru Dipekerjakan (DPK)',          'deskripsi' => 'PNS Kemenag yang diperbantukan ke madrasah swasta','urutan' => 6, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'kode' => 'Lainnya','nama' => 'Lainnya',                          'deskripsi' => 'Status kepegawaian di luar kategori di atas',      'urutan' => 7, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // ── Master Jenis Cuti ─────────────────────────────────────────
        // Menggantikan: ENUM('Cuti Tahunan','Cuti Sakit','Cuti Bersalin',...) di guru_cutis
        // Sumber: PP No. 11 Tahun 2017 tentang Manajemen PNS
        DB::table('master_jenis_cutis')->insertOrIgnore([
            ['school_id' => null, 'kode' => 'tahunan',        'nama' => 'Cuti Tahunan',             'max_hari' => 12,  'butuh_dokumen' => 0, 'urutan' => 1, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'kode' => 'sakit',          'nama' => 'Cuti Sakit',               'max_hari' => null,'butuh_dokumen' => 1, 'urutan' => 2, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'kode' => 'bersalin',       'nama' => 'Cuti Bersalin',            'max_hari' => 90,  'butuh_dokumen' => 1, 'urutan' => 3, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'kode' => 'alasan_penting', 'nama' => 'Cuti Alasan Penting',      'max_hari' => 30,  'butuh_dokumen' => 0, 'urutan' => 4, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'kode' => 'besar',          'nama' => 'Cuti Besar',               'max_hari' => 90,  'butuh_dokumen' => 0, 'urutan' => 5, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'kode' => 'di_luar_tanggungan', 'nama' => 'Cuti Di Luar Tanggungan Negara', 'max_hari' => null, 'butuh_dokumen' => 1, 'urutan' => 6, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'kode' => 'lainnya',        'nama' => 'Lainnya',                  'max_hari' => null,'butuh_dokumen' => 0, 'urutan' => 7, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // ── Akun Kas Default ─────────────────────────────────────────
        // Struktur dasar Chart of Accounts untuk 1 sekolah
        $schoolId = DB::table('schools')->value('id');
        if ($schoolId) {
            DB::table('akun_kass')->insertOrIgnore([
                ['school_id' => $schoolId, 'kode_akun' => '1-001', 'nama_akun' => 'Kas Tunai',        'jenis' => 'kas',        'saldo_awal' => 0, 'saldo_saat_ini' => 0, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
                ['school_id' => $schoolId, 'kode_akun' => '1-002', 'nama_akun' => 'Bank BRI',          'jenis' => 'bank',       'saldo_awal' => 0, 'saldo_saat_ini' => 0, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
                ['school_id' => $schoolId, 'kode_akun' => '4-001', 'nama_akun' => 'Pendapatan SPP',    'jenis' => 'pendapatan', 'saldo_awal' => 0, 'saldo_saat_ini' => 0, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
                ['school_id' => $schoolId, 'kode_akun' => '4-002', 'nama_akun' => 'Dana BOS',          'jenis' => 'bos',        'saldo_awal' => 0, 'saldo_saat_ini' => 0, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
                ['school_id' => $schoolId, 'kode_akun' => '4-003', 'nama_akun' => 'Dana Komite',       'jenis' => 'komite',     'saldo_awal' => 0, 'saldo_saat_ini' => 0, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
                ['school_id' => $schoolId, 'kode_akun' => '5-001', 'nama_akun' => 'Biaya Gaji Guru',   'jenis' => 'gaji',       'saldo_awal' => 0, 'saldo_saat_ini' => 0, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
                ['school_id' => $schoolId, 'kode_akun' => '5-002', 'nama_akun' => 'Biaya Operasional', 'jenis' => 'pengeluaran','saldo_awal' => 0, 'saldo_saat_ini' => 0, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ]);
        }

        // ── Kategori Buku Default ─────────────────────────────────────
        if ($schoolId) {
            DB::table('kategori_bukus')->insertOrIgnore([
                ['school_id' => $schoolId, 'nama' => 'Buku Paket / Pelajaran', 'kode_ddc' => null,  'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
                ['school_id' => $schoolId, 'nama' => 'Fiksi',                  'kode_ddc' => '800', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
                ['school_id' => $schoolId, 'nama' => 'Non-Fiksi',              'kode_ddc' => null,  'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
                ['school_id' => $schoolId, 'nama' => 'Referensi',              'kode_ddc' => '000', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
                ['school_id' => $schoolId, 'nama' => 'Agama & Moral',          'kode_ddc' => '200', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
                ['school_id' => $schoolId, 'nama' => 'Sains & Teknologi',      'kode_ddc' => '500', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ]);
        }

        // ── Master Religions ─────────────────────────────────────────
        DB::table('master_religions')->insertOrIgnore([
            ['school_id' => null, 'code' => 'islam', 'name' => 'Islam', 'display_order' => 1, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'code' => 'christianity', 'name' => 'Christianity (Protestant)', 'display_order' => 2, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'code' => 'catholicism', 'name' => 'Catholicism', 'display_order' => 3, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'code' => 'hinduism', 'name' => 'Hinduism', 'display_order' => 4, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'code' => 'buddhism', 'name' => 'Buddhism', 'display_order' => 5, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'code' => 'confucianism', 'name' => 'Confucianism', 'display_order' => 6, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'code' => 'judaism', 'name' => 'Judaism', 'display_order' => 7, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'code' => 'other', 'name' => 'Other / Unspecified', 'display_order' => 99, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // ── Master Education Levels ──────────────────────────────────
        DB::table('master_education_levels')->insertOrIgnore([
            ['school_id' => null, 'code' => 'primary', 'name' => 'Primary / Elementary School', 'country_code' => 'GLOBAL', 'display_order' => 1, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'code' => 'junior_high', 'name' => 'Junior High / Middle School', 'country_code' => 'GLOBAL', 'display_order' => 2, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'code' => 'senior_high', 'name' => 'Senior High / High School', 'country_code' => 'GLOBAL', 'display_order' => 3, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'code' => 'vocational', 'name' => 'Vocational High School', 'country_code' => 'GLOBAL', 'display_order' => 4, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'code' => 'associate', 'name' => 'Associate Degree / Diploma', 'country_code' => 'GLOBAL', 'display_order' => 5, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'code' => 'bachelor', 'name' => "Bachelor's Degree (S1)", 'country_code' => 'GLOBAL', 'display_order' => 6, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'code' => 'master', 'name' => "Master's Degree (S2)", 'country_code' => 'GLOBAL', 'display_order' => 7, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'code' => 'doctorate', 'name' => 'Doctorate / PhD (S3)', 'country_code' => 'GLOBAL', 'display_order' => 8, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // ── Master Marital Statuses ──────────────────────────────────
        DB::table('master_marital_statuses')->insertOrIgnore([
            ['school_id' => null, 'code' => 'single', 'name' => 'Single / Unmarried', 'display_order' => 1, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'code' => 'married', 'name' => 'Married', 'display_order' => 2, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'code' => 'divorced', 'name' => 'Divorced', 'display_order' => 3, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => null, 'code' => 'widowed', 'name' => 'Widowed', 'display_order' => 4, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // ── Master School Types ─────────────────────────────────────
        DB::table('master_school_types')->insertOrIgnore([
            ['code' => 'SD', 'name' => 'Sekolah Dasar (SD)', 'country_code' => 'ID', 'education_level' => 'primary', 'display_order' => 1, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'MI', 'name' => 'Madrasah Ibtidaiyah (MI)', 'country_code' => 'ID', 'education_level' => 'primary', 'display_order' => 2, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'SMP', 'name' => 'Sekolah Menengah Pertama (SMP)', 'country_code' => 'ID', 'education_level' => 'junior_high', 'display_order' => 3, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'MTS', 'name' => 'Madrasah Tsanawiyah (MTs)', 'country_code' => 'ID', 'education_level' => 'junior_high', 'display_order' => 4, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'SMA', 'name' => 'Sekolah Menengah Atas (SMA)', 'country_code' => 'ID', 'education_level' => 'senior_high', 'display_order' => 5, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'MA', 'name' => 'Madrasah Aliyah (MA)', 'country_code' => 'ID', 'education_level' => 'senior_high', 'display_order' => 6, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'SMK', 'name' => 'Sekolah Menengah Kejuruan (SMK)', 'country_code' => 'ID', 'education_level' => 'vocational', 'display_order' => 7, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'K12_INT', 'name' => 'International K-12 Academy', 'country_code' => 'GLOBAL', 'education_level' => 'k12', 'display_order' => 8, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // ── Master Blood Types ──────────────────────────────────────
        DB::table('master_blood_types')->insertOrIgnore([
            ['code' => 'A+', 'name' => 'A Positive', 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'A-', 'name' => 'A Negative', 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'B+', 'name' => 'B Positive', 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'B-', 'name' => 'B Negative', 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'AB+', 'name' => 'AB Positive', 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'AB-', 'name' => 'AB Negative', 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'O+', 'name' => 'O Positive', 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'O-', 'name' => 'O Negative', 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'UNKNOWN', 'name' => 'Unknown', 'created_at' => $now, 'updated_at' => $now],
        ]);

        $this->command->info('✅ MasterDataSeeder: status kepegawaian, jenis cuti, akun kas, kategori buku, agama, jenjang pendidikan, status pernikahan, jenis sekolah, & golongan darah berhasil di-seed.');
    }
}

