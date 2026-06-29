<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('absensi', function (Blueprint $table) {
            // Tambah kolom id_jadwal setelah id_kelas (nullable agar data lama tetap valid)
            $table->unsignedBigInteger('id_jadwal')->nullable()->after('id_kelas');

            $table->foreign('id_jadwal')
                ->references('id')
                ->on('jadwal_pelajaran')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('absensi', function (Blueprint $table) {
            $table->dropForeign(['id_jadwal']);
            $table->dropColumn('id_jadwal');
        });
    }
};
