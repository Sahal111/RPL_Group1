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
        Schema::table('orang_tua', function (Blueprint $table) {
            $table->dropForeign('fk_ortu_siswa');
            $table->dropUnique('nisn');
            $table->dropIndex('idx_ortu_nisn');
            $table->dropColumn('nisn');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orang_tua', function (Blueprint $table) {
            $table->string('nisn', 10)->after('id');
            $table->unique('nisn', 'nisn');
            $table->index('nisn', 'idx_ortu_nisn');
            $table->foreign('nisn', 'fk_ortu_siswa')
                ->references('nisn')
                ->on('siswa')
                ->cascadeOnDelete();
        });
    }
};
