<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Seed data akademik dev: tahun ajaran, semester, kelas, komponen penilaian.
 * Harus dijalankan SETELAH SchoolSeeder (butuh school_id dari schools).
 */
class TahunAjaranSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        $schoolId = DB::table('schools')->value('id');

        if (!$schoolId) {
            $this->command->warn('TahunAjaranSeeder: tidak ada school — jalankan SchoolSeeder dulu.');
            return;
        }

        // Tahun Ajaran
        DB::table('tahun_ajarans')->insertOrIgnore([
            ['school_id' => $schoolId, 'tahun' => '2026/2027', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
        ]);

        $taId = DB::table('tahun_ajarans')
            ->where('school_id', $schoolId)
            ->where('tahun', '2026/2027')
            ->value('id');

        // Semester
        DB::table('semesters')->insertOrIgnore([
            [
                'school_id' => $schoolId,
                'tahun_ajaran_id' => $taId,
                'nama' => 'Ganjil',
                'tgl_mulai' => '2026-07-15',
                'tgl_selesai' => '2026-12-20',
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'school_id' => $schoolId,
                'tahun_ajaran_id' => $taId,
                'nama' => 'Genap',
                'tgl_mulai' => '2027-01-10',
                'tgl_selesai' => '2027-06-15',
                'is_active' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        $smtId = DB::table('semesters')
            ->where('school_id', $schoolId)
            ->where('tahun_ajaran_id', $taId)
            ->where('nama', 'Ganjil')
            ->value('id');

        // Kelas
        DB::table('kelas')->insertOrIgnore([
            ['school_id' => $schoolId, 'tahun_ajaran_id' => $taId, 'semester_id' => $smtId, 'nama_kelas' => '1-A', 'tingkat' => 1, 'kurikulum' => 'Merdeka', 'kapasitas' => 32, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => $schoolId, 'tahun_ajaran_id' => $taId, 'semester_id' => $smtId, 'nama_kelas' => '2-A', 'tingkat' => 2, 'kurikulum' => 'Merdeka', 'kapasitas' => 32, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Komponen Penilaian
        DB::table('komponen_penilaians')->insertOrIgnore([
            ['school_id' => $schoolId, 'nama_komponen' => 'Nilai Formatif', 'kode' => 'NF', 'jenis' => 'formatif', 'bobot_persentase' => 40.00, 'kurikulum' => 'Merdeka', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => $schoolId, 'nama_komponen' => 'Nilai Sumatif', 'kode' => 'NS', 'jenis' => 'sumatif', 'bobot_persentase' => 60.00, 'kurikulum' => 'Merdeka', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => $schoolId, 'nama_komponen' => 'PTS', 'kode' => 'PTS', 'jenis' => 'sumatif', 'bobot_persentase' => 20.00, 'kurikulum' => 'K13', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => $schoolId, 'nama_komponen' => 'PAS/PAT', 'kode' => 'PAS', 'jenis' => 'sumatif', 'bobot_persentase' => 20.00, 'kurikulum' => 'K13', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
        ]);

        $this->command->info('TahunAjaranSeeder selesai.');
    }
}