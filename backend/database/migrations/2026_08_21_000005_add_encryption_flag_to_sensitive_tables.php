<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * PENTING: Migration ini HANYA menambahkan kolom `*_encrypted` boolean
 * sebagai flag untuk membedakan data yang sudah dienkripsi vs belum.
 *
 * Enkripsi data existing TIDAK dilakukan di migration ini.
 * Enkripsi dilakukan via Artisan Command `php artisan encrypt:sensitive-data`
 * yang harus dijalankan setelah migration ini, dengan chunking aman.
 *
 * Alasan tidak enkripsi di migration:
 * - Migration tidak boleh melakukan heavy data processing
 * - Risk timeout di production
 * - Tidak bisa rollback enkripsi data dengan mudah
 * - Harus dilakukan dalam batch dengan monitoring
 *
 * Model Laravel menggunakan:
 * protected $casts = [
 *     'nik' => 'encrypted',
 *     'nisn' => 'encrypted',
 * ];
 *
 * Casts 'encrypted' otomatis enkripsi/dekripsi menggunakan APP_KEY.
 * Pastikan APP_KEY tidak pernah berubah setelah data dienkripsi.
 */
return new class extends Migration
{
    public function up(): void
    {
        // siswas: kolom sensitif yang wajib dienkripsi
        Schema::table('siswas', function (Blueprint $table) {
            $table->boolean('is_sensitive_encrypted')->default(false)->after('updated_at')
                ->comment('Flag: apakah kolom NIK, NISN, no_kk sudah dienkripsi. Set true setelah Command encrypt:sensitive-data selesai.');
        });

        // gurus: kolom sensitif yang wajib dienkripsi
        Schema::table('gurus', function (Blueprint $table) {
            $table->boolean('is_sensitive_encrypted')->default(false)->after('updated_at')
                ->comment('Flag: apakah kolom NIK, NIP, no_kk, NUPTK sudah dienkripsi. Set true setelah Command encrypt:sensitive-data selesai.');
        });

        // orang_tuas: NIK orang tua
        Schema::table('orang_tuas', function (Blueprint $table) {
            $table->boolean('is_sensitive_encrypted')->default(false)->after('updated_at')
                ->comment('Flag: apakah kolom NIK sudah dienkripsi.');
        });
    }

    public function down(): void
    {
        Schema::table('siswas', function (Blueprint $table) {
            $table->dropColumn('is_sensitive_encrypted');
        });
        Schema::table('gurus', function (Blueprint $table) {
            $table->dropColumn('is_sensitive_encrypted');
        });
        Schema::table('orang_tuas', function (Blueprint $table) {
            $table->dropColumn('is_sensitive_encrypted');
        });
    }
};
