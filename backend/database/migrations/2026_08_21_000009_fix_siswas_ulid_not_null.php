<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * siswas.ulid saat ini nullable DEFAULT NULL.
 * ULID dipakai sebagai public identifier di URL (bukan expose ID integer).
 * Jika NULL, URL generation akan error/broken.
 *
 * Strategi:
 * 1. Backfill ulid untuk semua record yang NULL
 * 2. Ubah kolom menjadi NOT NULL
 */
return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Backfill
        $count = DB::table('siswas')->whereNull('ulid')->count();

        if ($count > 0) {
            $this->line("Backfilling {$count} null ULIDs di siswas...");

            DB::table('siswas')
                ->whereNull('ulid')
                ->orderBy('id')
                ->chunk(500, function ($records) {
                    foreach ($records as $record) {
                        DB::table('siswas')
                            ->where('id', $record->id)
                            ->update(['ulid' => Str::ulid()->toBase32()]);
                    }
                });
        }

        // Step 2: Jadikan NOT NULL setelah backfill selesai
        Schema::table('siswas', function (Blueprint $table) {
            $table->string('ulid', 26)->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('siswas', function (Blueprint $table) {
            $table->string('ulid', 26)->nullable()->change();
        });
    }
};
