<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // 1. SaaS Global master data & subscriptions
            GlobalSaaSSeeder::class,

            // 2. Buat sekolah pertama + role + permission + super_operator
            //    Harus jalan paling pertama karena semua tabel lain FK ke schools
            SchoolSeeder::class,

            // 3. Data akademik dev
            TahunAjaranSeeder::class,

            // 4. Data master (menggantikan ENUM): status kepegawaian, jenis cuti,
            //    akun kas default, kategori buku, agama, jenjang pendidikan, dll
            MasterDataSeeder::class,

            // 5. Akun testing semua role (hanya untuk development)
            TestingUserSeeder::class,
        ]);
    }
}