<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel bantu untuk mencatat warning selama migration.
 * Dipakai oleh migration orang_tuas unique constraint untuk log duplicate.
 * Harus dijalankan SEBELUM migration yang membutuhkannya.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('migration_audit_logs')) {
            Schema::create('migration_audit_logs', function (Blueprint $table) {
                $table->id();
                $table->string('migration');
                $table->string('issue');
                $table->json('context')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->index('migration');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('migration_audit_logs');
    }
};
