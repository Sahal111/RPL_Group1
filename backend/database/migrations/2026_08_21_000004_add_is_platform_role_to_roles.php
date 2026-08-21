<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Masalah: role 'super_admin' (is_system=true) hidup di tabel `roles`
     * bersama tenant roles. Jika ada endpoint assign role yang tidak
     * memvalidasi is_system, ini adalah privilege escalation.
     *
     * Solusi:
     * 1. Tambah kolom `is_platform_role` untuk membedakan secara eksplisit
     *    role global platform vs role tenant.
     * 2. Tandai super_admin sebagai platform role.
     * 3. Tambah check constraint (MySQL 8.0.16+) / atau enforced di app layer.
     *
     * TIDAK menghapus role super_admin dari tabel karena:
     * - Mungkin ada user_roles yang relasi ke role ini
     * - Hapus dilakukan setelah audit kode dan migrasi data ke platform_admins
     *
     * Yang dilakukan sekarang: isolasi via flag, bukan delete.
     */
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->boolean('is_platform_role')->default(false)->after('is_system')
                ->comment('TRUE = role milik platform (super_admin, developer). Tidak boleh di-assign ke user tenant biasa. Divalidasi di RoleService dan Policy.');
        });

        // Tandai super_admin sebagai platform role
        DB::table('roles')
            ->where('is_system', true)
            ->whereIn('slug', ['super_admin', 'developer', 'superadmin'])
            ->update(['is_platform_role' => true]);
    }

    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn('is_platform_role');
        });
    }
};
