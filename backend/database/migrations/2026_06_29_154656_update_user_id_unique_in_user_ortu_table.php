<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('user_ortu', function (Blueprint $table) {
            // MySQL butuh index lain dulu untuk menopang FK fk_uo_user
            // sebelum index 'user_id' (unique) bisa di-drop
            $table->index('user_id', 'idx_uo_user_id');

            $table->dropUnique('user_id');

            $table->unique(['user_id', 'nisn'], 'uq_user_ortu_user_siswa');
        });
    }

    public function down(): void
    {
        Schema::table('user_ortu', function (Blueprint $table) {
            $table->dropUnique('uq_user_ortu_user_siswa');
            $table->unique('user_id', 'user_id');
            $table->dropIndex('idx_uo_user_id');
        });
    }
};