<?php

use App\Models\Role;
use App\Models\User;

$data = [
    ['slug' => 'wakasek', 'name' => 'Wakil Kepala Sekolah'],
    ['slug' => 'guru_bk', 'name' => 'Guru BK'],
    ['slug' => 'pustakawan', 'name' => 'Pustakawan'],
    ['slug' => 'tata_usaha', 'name' => 'Tata Usaha'],
    ['slug' => 'admin_keuangan', 'name' => 'Admin Keuangan'],
];

// Hapus user dummy yang terbuat tadi (username null)
User::withoutGlobalScopes()->whereNull('username')->delete();

foreach ($data as $item) {
    $slug = $item['slug'];
    $name = $item['name'];

    $role = Role::withoutGlobalScopes()
        ->where('slug', $slug)
        ->where('school_id', 1)
        ->first();

    if (!$role) {
        echo "❌ Role '$slug' tidak ditemukan di school_id=1\n";
        continue;
    }

    // Hapus kalau sudah ada sebelumnya
    User::withoutGlobalScopes()->where('username', $slug)->forceDelete();

    $user = User::create([
        'school_id' => 1,
        'name' => $name,
        'username' => $slug,
        'email' => "$slug@test.id",
        'password' => bcrypt("{$slug}123"),
        'is_active' => 1,
    ]);

    $user->roles()->syncWithoutDetaching([$role->id]);

    echo "✓ Created: username=$slug | password={$slug}123\n";
}

echo "\nDone!\n";