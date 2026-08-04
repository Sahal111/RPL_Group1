<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
                // 1. Buat sekolah pertama + role + permission + super_operator
                //    Harus jalan paling pertama karena semua tabel lain FK ke schools
            SchoolSeeder::class,

            // 2. Data akademik dev (hanya untuk development)
            // TahunAjaranSeeder::class,

            // 3. Data user dev lainnya (sudah ada super_operator dari SchoolSeeder)
            // OperatorSeeder::class,

            // 4. Data dummy lain
            // PengumumanSeeder::class,
        ]);
    }
}