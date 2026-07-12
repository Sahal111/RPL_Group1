<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('absensi', function (Blueprint $table) {
            // MySQL butuh index untuk foreign key fk_abs_siswa, jika uq_absensi dihapus maka foreign key akan gagal.
            // Buat index terpisah untuk nisn dulu.
            $table->index('nisn', 'idx_abs_nisn');
            
            $table->dropUnique('uq_absensi');
            // Menambahkan id_jadwal ke dalam composite unique key karena sekarang siswa bisa absen beberapa kali dalam sehari (tiap jadwal beda)
            $table->unique(['nisn', 'id_kelas', 'id_jadwal', 'tanggal'], 'uq_absensi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('absensi', function (Blueprint $table) {
            $table->dropUnique('uq_absensi');
            $table->unique(['nisn', 'id_kelas', 'tanggal'], 'uq_absensi');
            $table->dropIndex('idx_abs_nisn');
        });
    }
};
