<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Fix #6 — schools: Tambah soft delete (deleted_at)
 *
 * MASALAH:
 *   Model School sudah `use SoftDeletes` tapi kolom `deleted_at` tidak ada
 *   di database. Hard delete sekolah = data jutaan siswa, guru, nilai,
 *   pembayaran hilang secara cascading dan permanen.
 *
 * SOLUSI:
 *   Tambah `deleted_at` ke tabel `schools`. Model sudah benar, hanya
 *   kolom DB yang kurang. Setelah ini, hard delete di-block di
 *   application layer — hanya soft delete yang diperbolehkan.
 *
 * KONSEKUENSI:
 *   - School::find() tidak akan return sekolah yang sudah soft-deleted ✓
 *   - School::withTrashed()->find() untuk admin recovery ✓
 *   - SchoolProvisioningService harus gunakan $school->delete() bukan
 *     DB::table('schools')->delete() untuk menghormati soft delete ✓
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            if (!Schema::hasColumn('schools', 'deleted_at')) {
                $table->softDeletes()->after('updated_at')
                    ->comment('Soft delete. Hard delete sekolah DILARANG — gunakan ini.');
            }
        });
    }

    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            if (Schema::hasColumn('schools', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};