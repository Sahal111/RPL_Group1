<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TahunAjaranSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // Tahun Ajaran
        DB::table('tahun_ajarans')->insertOrIgnore([
            ['tahun' => '2026/2027', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
        ]);

        $taId = DB::table('tahun_ajarans')->where('tahun', '2026/2027')->value('id');

        // Semester
        DB::table('semesters')->insertOrIgnore([
            [
                'tahun_ajaran_id' => $taId,
                'nama' => 'Ganjil',
                'tgl_mulai' => '2026-07-15',
                'tgl_selesai' => '2026-12-20',
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'tahun_ajaran_id' => $taId,
                'nama' => 'Genap',
                'tgl_mulai' => '2027-01-10',
                'tgl_selesai' => '2027-06-15',
                'is_active' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        $smtId = DB::table('semesters')->where('tahun_ajaran_id', $taId)->where('nama', 'Ganjil')->value('id');

        // Kelas
        DB::table('kelas')->insertOrIgnore([
            ['tahun_ajaran_id' => $taId, 'semester_id' => $smtId, 'nama_kelas' => '1-A', 'tingkat' => 1, 'kurikulum' => 'Merdeka', 'kapasitas' => 32, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['tahun_ajaran_id' => $taId, 'semester_id' => $smtId, 'nama_kelas' => '2-A', 'tingkat' => 2, 'kurikulum' => 'Merdeka', 'kapasitas' => 32, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Roles
        DB::table('roles')->insertOrIgnore([
            ['slug' => 'kepsek', 'nama' => 'Kepala Madrasah', 'deskripsi' => 'Akses penuh baca semua modul, approve rapor', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['slug' => 'operator', 'nama' => 'Operator', 'deskripsi' => 'Kelola master data, akun, dan konfigurasi sistem', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['slug' => 'guru', 'nama' => 'Guru Pengajar', 'deskripsi' => 'Input nilai, absensi kelas yang diajar', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['slug' => 'wali_kelas', 'nama' => 'Wali Kelas', 'deskripsi' => 'Kelola kelas, absensi, catatan, finalisasi rapor', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['slug' => 'bendahara', 'nama' => 'Bendahara', 'deskripsi' => 'Kelola tagihan, pembayaran, laporan keuangan', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['slug' => 'ortu', 'nama' => 'Orang Tua/Wali', 'deskripsi' => 'Pantau data anak, nilai, absensi, pembayaran', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['slug' => 'admin_ppdb', 'nama' => 'Admin PPDB', 'deskripsi' => 'Kelola penerimaan peserta didik baru', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Komponen Penilaian
        DB::table('komponen_penilaians')->insertOrIgnore([
            ['nama_komponen' => 'Nilai Formatif', 'kode' => 'NF', 'jenis' => 'formatif', 'bobot_persentase' => 40.00, 'kurikulum' => 'Merdeka', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['nama_komponen' => 'Nilai Sumatif', 'kode' => 'NS', 'jenis' => 'sumatif', 'bobot_persentase' => 60.00, 'kurikulum' => 'Merdeka', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['nama_komponen' => 'Pengetahuan (K13)', 'kode' => 'NPH', 'jenis' => 'formatif', 'bobot_persentase' => 30.00, 'kurikulum' => 'K13', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['nama_komponen' => 'Keterampilan (K13)', 'kode' => 'NPK', 'jenis' => 'formatif', 'bobot_persentase' => 30.00, 'kurikulum' => 'K13', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['nama_komponen' => 'PTS', 'kode' => 'PTS', 'jenis' => 'sumatif', 'bobot_persentase' => 20.00, 'kurikulum' => 'K13', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['nama_komponen' => 'PAS/PAT', 'kode' => 'PAS', 'jenis' => 'sumatif', 'bobot_persentase' => 20.00, 'kurikulum' => 'K13', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['nama_komponen' => 'Sikap (Spiritual)', 'kode' => 'PSP', 'jenis' => 'sikap', 'bobot_persentase' => null, 'kurikulum' => 'Semua', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['nama_komponen' => 'Sikap (Sosial)', 'kode' => 'PSS', 'jenis' => 'sikap', 'bobot_persentase' => null, 'kurikulum' => 'Semua', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Pengaturan Sistem
        DB::table('pengaturans')->insertOrIgnore([
            ['key' => 'nama_madrasah', 'value' => 'MI Nurul Huda 3', 'grup' => 'sekolah', 'deskripsi' => 'Nama resmi madrasah', 'updated_at' => $now],
            ['key' => 'npsn', 'value' => '', 'grup' => 'sekolah', 'deskripsi' => 'Nomor Pokok Sekolah Nasional', 'updated_at' => $now],
            ['key' => 'nsm', 'value' => '', 'grup' => 'sekolah', 'deskripsi' => 'Nomor Statistik Madrasah (EMIS)', 'updated_at' => $now],
            ['key' => 'alamat_madrasah', 'value' => '', 'grup' => 'sekolah', 'deskripsi' => 'Alamat lengkap madrasah', 'updated_at' => $now],
            ['key' => 'logo', 'value' => '', 'grup' => 'sekolah', 'deskripsi' => 'Path logo madrasah', 'updated_at' => $now],
            ['key' => 'kepala_madrasah', 'value' => '', 'grup' => 'sekolah', 'deskripsi' => 'Nama kepala madrasah aktif', 'updated_at' => $now],
            ['key' => 'kode_registrasi_ortu', 'value' => '', 'grup' => 'akademik', 'deskripsi' => 'Kode untuk registrasi akun ortu', 'updated_at' => $now],
            ['key' => 'kurikulum_aktif', 'value' => 'Merdeka', 'grup' => 'akademik', 'deskripsi' => 'K13 atau Merdeka', 'updated_at' => $now],
            ['key' => 'kkm_default', 'value' => '70', 'grup' => 'akademik', 'deskripsi' => 'KKM/KKTP default nilai', 'updated_at' => $now],
            ['key' => 'hari_efektif', 'value' => '["Senin","Selasa","Rabu","Kamis","Jumat"]', 'grup' => 'akademik', 'deskripsi' => 'Hari sekolah aktif', 'updated_at' => $now],
        ]);

        $this->command->info('TahunAjaranSeeder selesai.');
    }
}