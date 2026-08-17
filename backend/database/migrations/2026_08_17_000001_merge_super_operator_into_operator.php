<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // 1. Untuk setiap sekolah, assign semua permission ke role operator
        $operatorRoles = DB::table('roles')->where('slug', 'operator')->get();

        foreach ($operatorRoles as $opRole) {
            // Ambil semua permission milik sekolah ini
            $allPermIds = DB::table('permissions')
                ->where('school_id', $opRole->school_id)
                ->pluck('id');

            // Assign ke operator (insertOrIgnore agar tidak duplikat)
            $pivotData = $allPermIds->map(fn($permId) => [
                'role_id' => $opRole->id,
                'permission_id' => $permId,
            ])->toArray();

            DB::table('role_permissions')->insertOrIgnore($pivotData);
        }

        // 2. Pindahkan user ber-role super_operator ke operator
        $superOpRoles = DB::table('roles')->where('slug', 'super_operator')->get();

        foreach ($superOpRoles as $superOp) {
            // Cari role operator di sekolah yang sama
            $opRole = DB::table('roles')
                ->where('school_id', $superOp->school_id)
                ->where('slug', 'operator')
                ->first();

            if (!$opRole)
                continue;

            // Ambil semua user yang punya role super_operator ini
            $userIds = DB::table('user_roles')
                ->where('role_id', $superOp->id)
                ->pluck('user_id');

            foreach ($userIds as $userId) {
                // Assign ke operator jika belum punya
                DB::table('user_roles')->insertOrIgnore([
                    'user_id' => $userId,
                    'role_id' => $opRole->id,
                ]);
            }

            // Cabut role super_operator dari semua user
            DB::table('user_roles')->where('role_id', $superOp->id)->delete();
        }

        // 3. Hapus role super_operator dari semua sekolah
        DB::table('role_permissions')
            ->whereIn('role_id', DB::table('roles')->where('slug', 'super_operator')->pluck('id'))
            ->delete();

        DB::table('roles')->where('slug', 'super_operator')->delete();
    }

    public function down(): void
    {
        // Tidak bisa di-rollback secara aman — data sudah di-merge
        // Jika perlu rollback, restore dari backup DB
    }
};