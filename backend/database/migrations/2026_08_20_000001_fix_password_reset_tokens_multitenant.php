<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fix #1 — password_reset_tokens: Cross-Tenant Ambiguity
 *
 * MASALAH:
 *   PK adalah `email` (string). Email HANYA unique per-school di tabel `users`
 *   (constraint uq_users_email_school). Artinya user@gmail.com bisa terdaftar
 *   di Sekolah A dan Sekolah B. Satu token akan menimpa yang lain secara silent.
 *
 * SOLUSI:
 *   Tambah `school_id` ke tabel dan ubah PK menjadi composite (school_id, email).
 *   Ini memastikan setiap (sekolah, email) memiliki token tersendiri.
 *
 *   Catatan: Global users (global_users.email) sudah unique secara global —
 *   mereka tidak perlu fix ini. Fix ini spesifik untuk local `users` per-school.
 */
return new class extends Migration {
    public function up(): void
    {
        // Truncate dahulu — token yang ada sudah tidak valid karena expired
        // (token valid 60 menit, tidak ada token yang perlu dipertahankan saat migrasi)
        DB::table('password_reset_tokens')->truncate();

        Schema::table('password_reset_tokens', function (Blueprint $table) {
            // Drop PK lama (email saja)
            $table->dropPrimary();

            // Tambah school_id — FK ke schools untuk isolasi tenant
            $table->unsignedBigInteger('school_id')->after('email')
                ->comment('Tenant isolasi. Reset password scoped per-sekolah.');

            $table->foreign('school_id', 'fk_prt_school')
                ->references('id')
                ->on('schools')
                ->cascadeOnDelete();

            $table->index('school_id', 'idx_prt_school');

            // PK baru: composite (school_id, email)
            $table->primary(['school_id', 'email'], 'pk_prt_school_email');
        });
    }

    public function down(): void
    {
        DB::table('password_reset_tokens')->truncate();

        Schema::table('password_reset_tokens', function (Blueprint $table) {
            $table->dropPrimary('pk_prt_school_email');
            $table->dropForeign('fk_prt_school');
            $table->dropIndex('idx_prt_school');
            $table->dropColumn('school_id');

            // Kembalikan PK lama
            $table->primary('email');
        });
    }
};