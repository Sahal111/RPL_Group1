<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class TestingUserSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // 1. Get TA, Semester, and Kelas IDs
        $taId = DB::table('tahun_ajarans')->where('tahun', '2026/2027')->value('id');
        if (!$taId) {
            $taId = DB::table('tahun_ajarans')->insertGetId([
                'tahun' => '2026/2027',
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now
            ]);
        }

        $smtId = DB::table('semesters')->where('tahun_ajaran_id', $taId)->where('nama', 'Ganjil')->value('id');
        if (!$smtId) {
            $smtId = DB::table('semesters')->insertGetId([
                'tahun_ajaran_id' => $taId,
                'nama' => 'Ganjil',
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now
            ]);
        }

        $kelasId = DB::table('kelas')->where('tahun_ajaran_id', $taId)->value('id');
        if (!$kelasId) {
            $kelasId = DB::table('kelas')->insertGetId([
                'tahun_ajaran_id' => $taId,
                'semester_id' => $smtId,
                'nama_kelas' => '1-A',
                'tingkat' => 1,
                'kurikulum' => 'Merdeka',
                'kapasitas' => 32,
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now
            ]);
        }

        // Helper untuk assign role
        $assignRole = function ($userId, $roleSlug) use ($now) {
            $roleId = DB::table('roles')->where('slug', $roleSlug)->value('id');
            if ($roleId) {
                DB::table('user_roles')->insertOrIgnore([
                    'user_id' => $userId,
                    'role_id' => $roleId,
                    'created_at' => $now
                ]);
            }
        };

        // 2. SEED KEPSEK
        $kepsekUserExists = DB::table('users')->where('username', 'kepsek')->exists();
        if (!$kepsekUserExists) {
            $userId = DB::table('users')->insertGetId([
                'name' => 'Kepala Sekolah Test',
                'username' => 'kepsek',
                'email' => 'kepsek@minurulhuda3.sch.id',
                'password' => Hash::make('kepsek123'),
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
            $assignRole($userId, 'kepsek');

            // Guru record for Kepsek
            $guruId = DB::table('gurus')->insertGetId([
                'user_id' => $userId,
                'nuptk' => '1111111111111111',
                'nama' => 'Kepala Sekolah Test',
                'jenis_kelamin' => 'L',
                'jenis_ptk' => 'Kepala Sekolah',
                'status_aktif' => 1,
                'created_at' => $now,
                'updated_at' => $now
            ]);
        }

        // 3. SEED GURU
        $guruUserExists = DB::table('users')->where('username', 'guru')->exists();
        if (!$guruUserExists) {
            $userId = DB::table('users')->insertGetId([
                'name' => 'Guru Pengajar Test',
                'username' => 'guru',
                'email' => 'guru@minurulhuda3.sch.id',
                'password' => Hash::make('guru123'),
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
            $assignRole($userId, 'guru');

            // Guru record
            $guruId = DB::table('gurus')->insertGetId([
                'user_id' => $userId,
                'nuptk' => '2222222222222222',
                'nama' => 'Guru Pengajar Test',
                'jenis_kelamin' => 'P',
                'jenis_ptk' => 'Guru Kelas',
                'status_aktif' => 1,
                'created_at' => $now,
                'updated_at' => $now
            ]);
        }

        // 4. SEED WALI KELAS
        $walikelasUserExists = DB::table('users')->where('username', 'walikelas')->exists();
        if (!$walikelasUserExists) {
            $userId = DB::table('users')->insertGetId([
                'name' => 'Wali Kelas Test',
                'username' => 'walikelas',
                'email' => 'walikelas@minurulhuda3.sch.id',
                'password' => Hash::make('walikelas123'),
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
            $assignRole($userId, 'wali_kelas');

            // Guru record
            $guruId = DB::table('gurus')->insertGetId([
                'user_id' => $userId,
                'nuptk' => '3333333333333333',
                'nama' => 'Wali Kelas Test',
                'jenis_kelamin' => 'L',
                'jenis_ptk' => 'Guru Kelas',
                'status_aktif' => 1,
                'created_at' => $now,
                'updated_at' => $now
            ]);

            // Assign wali kelas
            DB::table('wali_kelas')->insertOrIgnore([
                'guru_id' => $guruId,
                'kelas_id' => $kelasId,
                'tahun_ajaran_id' => $taId,
                'semester_id' => $smtId,
                'no_sk' => 'SK-WALIKELAS-01',
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now
            ]);
        }

        // 5. SEED BENDAHARA
        $bendaharaUserExists = DB::table('users')->where('username', 'bendahara')->exists();
        if (!$bendaharaUserExists) {
            $userId = DB::table('users')->insertGetId([
                'name' => 'Bendahara Test',
                'username' => 'bendahara',
                'email' => 'bendahara@minurulhuda3.sch.id',
                'password' => Hash::make('bendahara123'),
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
            $assignRole($userId, 'bendahara');

            // Guru record for bendahara
            $guruId = DB::table('gurus')->insertGetId([
                'user_id' => $userId,
                'nuptk' => '4444444444444444',
                'nama' => 'Bendahara Test',
                'jenis_kelamin' => 'P',
                'jenis_ptk' => 'Guru Kelas',
                'status_aktif' => 1,
                'created_at' => $now,
                'updated_at' => $now
            ]);

            // Bendahara record
            DB::table('bendaharas')->insertOrIgnore([
                'user_id' => $userId,
                'guru_id' => $guruId,
                'jenis_bendahara' => 'SPP',
                'no_sk' => 'SK-BENDAHARA-01',
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now
            ]);
        }

        // 6. SEED ORANG TUA
        $ortuUserExists = DB::table('users')->where('username', 'ortu')->exists();
        if (!$ortuUserExists) {
            $userId = DB::table('users')->insertGetId([
                'name' => 'Orang Tua Test',
                'username' => 'ortu',
                'email' => 'ortu@minurulhuda3.sch.id',
                'password' => Hash::make('ortu123'),
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
            $assignRole($userId, 'ortu');

            // Ortu record
            $ortuId = DB::table('orang_tuas')->insertGetId([
                'user_id' => $userId,
                'nama' => 'Orang Tua Test',
                'hubungan' => 'Ayah',
                'status' => 'Kandung',
                'no_hp' => '081234567890',
                'created_at' => $now,
                'updated_at' => $now
            ]);

            // Also seed a student child if none exists
            $siswaId = DB::table('siswas')->where('nisn', '1234567890')->value('id');
            if (!$siswaId) {
                $siswaId = DB::table('siswas')->insertGetId([
                    'nisn' => '1234567890',
                    'nama' => 'Siswa Test Anak Ortu',
                    'jenis_kelamin' => 'L',
                    'status' => 'aktif',
                    'created_at' => $now,
                    'updated_at' => $now
                ]);

                // Assign student to class
                DB::table('riwayat_kelas')->insertOrIgnore([
                    'siswa_id' => $siswaId,
                    'kelas_id' => $kelasId,
                    'jenis_perubahan' => 'masuk',
                    'created_at' => $now,
                    'updated_at' => $now
                ]);
            }

            // Bind child to parent
            DB::table('orang_tua_siswa')->insertOrIgnore([
                'orang_tua_id' => $ortuId,
                'siswa_id' => $siswaId,
                'created_at' => $now,
                'updated_at' => $now
            ]);
        }

        // 7. SEED ADMIN PPDB
        $adminppdbUserExists = DB::table('users')->where('username', 'adminppdb')->exists();
        if (!$adminppdbUserExists) {
            $userId = DB::table('users')->insertGetId([
                'name' => 'Admin PPDB Test',
                'username' => 'adminppdb',
                'email' => 'adminppdb@minurulhuda3.sch.id',
                'password' => Hash::make('adminppdb123'),
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
            $assignRole($userId, 'admin_ppdb');
        }

        echo "Testing accounts seeded successfully!\n";
    }
}
