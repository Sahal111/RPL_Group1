<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TahunAjaranSeeder extends Seeder
{
    public function run(): void
    {
        $sudahAda = DB::table('tahun_ajaran')->exists();
        if ($sudahAda) {
            $this->command->info('Tahun ajaran sudah ada, skip.');
            return;
        }

        DB::table('tahun_ajaran')->insert([
            [
                'nama' => '2024/2025 - Smt 1',
                'tanggal_mulai' => '2024-07-15',
                'tanggal_selesai' => '2024-12-20',
                'is_active' => 0,
            ],
            [
                'nama' => '2024/2025 - Smt 2',
                'tanggal_mulai' => '2025-01-06',
                'tanggal_selesai' => '2025-06-20',
                'is_active' => 0,
            ],
            [
                'nama' => '2025/2026 - Smt 1',
                'tanggal_mulai' => '2025-07-14',
                'tanggal_selesai' => '2025-12-19',
                'is_active' => 0,
            ],
            [
                'nama' => '2025/2026 - Smt 2',
                'tanggal_mulai' => '2026-01-05',
                'tanggal_selesai' => '2026-06-19',
                'is_active' => 1,
            ],
        ]);
    }
}