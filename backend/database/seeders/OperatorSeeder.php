<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class OperatorSeeder extends Seeder
{
    public function run(): void
    {
        $sudahAda = DB::table('users')->where('username', 'operator')->exists();
        if ($sudahAda) {
            $this->command->info('Operator sudah ada, skip.');
            return;
        }

        $now = Carbon::now();

        // Buat user operator
        $userId = DB::table('users')->insertGetId([
            'name'       => 'Operator Admin',
            'username'   => 'operator',
            'email'      => 'operator@minurulhuda3.sch.id',
            'password'   => Hash::make('operator123'),
            'is_active'  => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Assign role operator (slug = 'operator')
        $roleId = DB::table('roles')->where('slug', 'operator')->value('id');
        DB::table('user_roles')->insertOrIgnore([
            ['user_id' => $userId, 'role_id' => $roleId, 'created_at' => $now],
        ]);

        // Buat profil operator
        DB::table('operator_profiles')->insertOrIgnore([
            ['user_id' => $userId, 'jabatan' => 'Operator Sekolah', 'akses_modul' => json_encode(['all']), 'created_at' => $now, 'updated_at' => $now],
        ]);

        $this->command->info('OperatorSeeder selesai. Login: operator / operator123');
    }
}
