<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class OperatorSeeder extends Seeder
{
    public function run(): void
    {
        // Cek dulu, kalau sudah ada skip
        $sudahAda = DB::table('users')->where('username', 'operator')->exists();
        if ($sudahAda) {
            $this->command->info('Operator sudah ada, skip seeding.');
            return;
        }

        $userId = DB::table('users')->insertGetId([
            'role_id' => 1,
            'username' => 'operator',
            'email' => 'operator@minurulhuda3.sch.id',
            'password' => Hash::make('operator123'),
            'nama_lengkap' => 'Operator Admin',
            'is_active' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('user_operator')->insert([
            'user_id' => $userId,
            'nip_operator' => null,
            'jabatan' => 'Operator Sekolah',
            'akses_modul' => json_encode(['all']),
        ]);
    }
}