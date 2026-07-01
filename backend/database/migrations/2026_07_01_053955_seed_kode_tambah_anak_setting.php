<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Insert default kode tambah anak (dipakai saat ortu link anak ke-2, dst)
        // Sengaja dibedakan dari 'kode_registrasi' yang dipakai saat daftar akun pertama kali.
        DB::table('pengaturan')->insertOrIgnore([
            'key' => 'kode_tambah_anak',
            'value' => 'ANAK-2025',
        ]);
    }

    public function down(): void
    {
        DB::table('pengaturan')->where('key', 'kode_tambah_anak')->delete();
    }
};