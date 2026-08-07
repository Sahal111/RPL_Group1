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

        $this->command->info('✅ MasterDataSeeder: status kepegawaian, jenis cuti, akun kas, dan kategori buku berhasil di-seed.');
    }
}
