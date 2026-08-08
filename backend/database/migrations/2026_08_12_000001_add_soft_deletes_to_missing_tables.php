<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Menambahkan kolom deleted_at (SoftDeletes) ke tabel-tabel yang
 * modelnya sudah menggunakan trait SoftDeletes tetapi tabelnya belum
 * memiliki kolom deleted_at.
 *
 * Tabel yang diperbaiki:
 *  - guru_anaks
 *  - guru_keluargas
 *  - guru_kompetensi
 *  - guru_kontak_darurat
 *  - galeris
 */
return new class extends Migration {
    public function up(): void
    {
        $tables = [
            'guru_anaks' => 'Anak guru bisa dihapus lunak jika data salah input',
            'guru_keluargas' => 'Data keluarga guru tidak boleh hilang permanen',
            'guru_kompetensi' => 'Riwayat kompetensi guru perlu dipertahankan untuk audit',
            'guru_kontak_darurat' => 'Kontak darurat yang dihapus tetap tersimpan untuk keamanan',
            'galeris' => 'Foto galeri yang dihapus bisa di-restore oleh operator',
        ];

        foreach ($tables as $table => $comment) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'deleted_at')) {
                Schema::table($table, function (Blueprint $t) use ($comment) {
                    $t->softDeletes()->comment($comment);
                });
            }
        }
    }

    public function down(): void
    {
        $tables = [
            'guru_anaks',
            'guru_keluargas',
            'guru_kompetensi',
            'guru_kontak_darurat',
            'galeris',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'deleted_at')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->dropSoftDeletes();
                });
            }
        }
    }
};