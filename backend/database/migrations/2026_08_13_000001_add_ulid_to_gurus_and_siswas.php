<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        // Tambah kolom ulid ke tabel gurus jika belum ada
        if (Schema::hasTable('gurus') && !Schema::hasColumn('gurus', 'ulid')) {
            Schema::table('gurus', function (Blueprint $table) {
                $table->char('ulid', 26)->nullable()->unique('uq_gurus_ulid')
                    ->after('id')
                    ->comment('Public identifier — pakai ini di URL, bukan integer id');
            });
        }

        // Tambah kolom ulid ke tabel siswas jika belum ada
        if (Schema::hasTable('siswas') && !Schema::hasColumn('siswas', 'ulid')) {
            Schema::table('siswas', function (Blueprint $table) {
                $table->char('ulid', 26)->nullable()->unique('uq_siswas_ulid')
                    ->after('id')
                    ->comment('Public identifier — pakai ini di URL, bukan integer id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('gurus') && Schema::hasColumn('gurus', 'ulid')) {
            Schema::table('gurus', function (Blueprint $table) {
                $table->dropUnique('uq_gurus_ulid');
                $table->dropColumn('ulid');
            });
        }

        if (Schema::hasTable('siswas') && Schema::hasColumn('siswas', 'ulid')) {
            Schema::table('siswas', function (Blueprint $table) {
                $table->dropUnique('uq_siswas_ulid');
                $table->dropColumn('ulid');
            });
        }
    }
};