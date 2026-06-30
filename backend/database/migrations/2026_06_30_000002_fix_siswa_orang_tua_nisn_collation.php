<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('siswa_orang_tua')) {
            return;
        }

        $columns = DB::select("SHOW FULL COLUMNS FROM siswa WHERE Field = 'nisn'");
        $column = $columns[0] ?? null;

        if (!$column || !$column->Collation) {
            return;
        }

        $type = $column->Type;
        $collation = $column->Collation;
        $charset = explode('_', $collation)[0];

        DB::statement("ALTER TABLE siswa_orang_tua MODIFY nisn {$type} CHARACTER SET {$charset} COLLATE {$collation} NOT NULL");
    }

    public function down(): void
    {
        //
    }
};
