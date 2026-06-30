<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('siswa_orang_tua')) {
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
        }

        $this->syncNisnColumnDefinition();

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

            return;
        }

        if (DB::table('siswa_orang_tua')->count() === 0
            && DB::table('siswa')->count() === 1
            && DB::table('orang_tua')->count() === 1) {
            DB::table('siswa_orang_tua')->insert([
                'nisn' => DB::table('siswa')->value('nisn'),
                'id_ortu' => DB::table('orang_tua')->value('id'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('siswa_orang_tua');
    }

    private function syncNisnColumnDefinition(): void
    {
        $columns = DB::select("SHOW FULL COLUMNS FROM siswa WHERE Field = 'nisn'");
        $column = $columns[0] ?? null;

        if (!$column) {
            return;
        }

        $type = $column->Type;
        $collation = $column->Collation;
        $charset = $collation ? explode('_', $collation)[0] : 'utf8mb4';

        DB::statement("ALTER TABLE siswa_orang_tua MODIFY nisn {$type} CHARACTER SET {$charset} COLLATE {$collation} NOT NULL");
    }
};
