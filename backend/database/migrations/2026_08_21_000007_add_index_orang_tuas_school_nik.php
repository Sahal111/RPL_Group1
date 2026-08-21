<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Masalah: orang_tuas tidak punya UNIQUE KEY (school_id, nik).
 * NIK orang tua bisa duplikat dalam sekolah yang sama.
 *
 * PERHATIAN: Sebelum menambah unique constraint, WAJIB cek duplicate dulu.
 * Jika ada duplicate, constraint akan gagal.
 *
 * Strategi:
 * 1. Cek apakah ada NIK duplikat per school_id
 * 2. Jika ada, log ke tabel audit dan SKIP constraint (beri warning)
 * 3. Jika tidak ada, tambah constraint
 *
 * Catatan: Setelah enkripsi NIK (P0), UNIQUE KEY pada kolom terenkripsi
 * tidak berguna lagi karena nilai enkripsi berbeda tiap enkripsi (jika pakai AES-GCM).
 * Maka constraint ini hanya berlaku SEBELUM enkripsi diaktifkan,
 * atau jika menggunakan enkripsi deterministik.
 *
 * NEED VERIFICATION: Konfirmasi strategi enkripsi sebelum enforce unique constraint ini.
 * Jika enkripsi menggunakan Laravel Crypt (non-deterministik), unique constraint
 * pada kolom nik tidak akan berfungsi dan harus di-enforce di application layer.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Cek duplicate sebelum menambah constraint
        $duplicates = DB::table('orang_tuas')
            ->select('school_id', 'nik', DB::raw('COUNT(*) as count'))
            ->whereNotNull('nik')
            ->where('nik', '!=', '')
            ->groupBy('school_id', 'nik')
            ->having('count', '>', 1)
            ->get();

        if ($duplicates->isNotEmpty()) {
            // Log duplicate ke tabel untuk review manual
            foreach ($duplicates as $dup) {
                DB::table('migration_audit_logs')->insertOrIgnore([
                    'migration' => '2026_add_unique_orang_tuas_school_nik',
                    'issue' => 'duplicate_nik',
                    'context' => json_encode([
                        'school_id' => $dup->school_id,
                        'nik' => substr($dup->nik, 0, 4) . '****', // masked
                        'count' => $dup->count,
                    ]),
                    'created_at' => now(),
                ]);
            }

            // SKIP constraint - jangan gagalkan migration, tapi catat warning
            // Developer harus resolve duplicate secara manual lalu run migration fix
            return;
        }

        Schema::table('orang_tuas', function (Blueprint $table) {
            // Partial unique: hanya jika nik tidak null dan tidak kosong
            // MySQL tidak support partial unique index secara native,
            // jadi kita tambah index biasa + enforce di application layer via Rule::unique
            $table->index(['school_id', 'nik'], 'idx_orang_tuas_school_nik');
        });
    }

    public function down(): void
    {
        Schema::table('orang_tuas', function (Blueprint $table) {
            // Gunakan try-catch karena index mungkin tidak dibuat (ada duplicate)
            try {
                $table->dropIndex('idx_orang_tuas_school_nik');
            } catch (\Exception $e) {
                // Index tidak ada, lanjut
            }
        });
    }
};
