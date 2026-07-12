<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('siswa_orang_tua', function (Blueprint $table) {
            $table->id();
            $table->string('nisn', 10);
            $table->unsignedBigInteger('id_ortu');
            $table->timestamps();

            $table->unique(['nisn', 'id_ortu'], 'uq_siswa_orang_tua');
            $table->index('nisn', 'idx_siswa_orang_tua_nisn');
            $table->foreign('id_ortu')
                ->references('id')
                ->on('orang_tua')
                ->cascadeOnDelete();
        });

        if (Schema::hasColumn('orang_tua', 'nisn')) {
            DB::table('orang_tua')
                ->whereNotNull('nisn')
                ->orderBy('id')
                ->get()
                ->each(function ($ortu) {
                    DB::table('siswa_orang_tua')->insertOrIgnore([
                        'nisn' => $ortu->nisn,
                        'id_ortu' => $ortu->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('siswa_orang_tua');
    }
};
