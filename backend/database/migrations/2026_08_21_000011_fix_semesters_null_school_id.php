<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Fix: semester rows yang dibuat tanpa school_id (NULL) karena bug di
 * TahunAjaranController — Semester::create() tidak meng-include school_id.
 *
 * Logika fix: join semesters ke tahun_ajarans untuk mengambil school_id
 * yang benar, lalu update semua baris semester yang school_id-nya NULL.
 */
return new class extends Migration {
    public function up(): void
    {
        // Update school_id pada semesters yang NULL
        // berdasarkan school_id dari tahun_ajaran induknya
        DB::statement('
            UPDATE semesters s
            INNER JOIN tahun_ajarans ta ON ta.id = s.tahun_ajaran_id
            SET s.school_id = ta.school_id
            WHERE s.school_id IS NULL
              AND ta.school_id IS NOT NULL
        ');
    }

    public function down(): void
    {
        // Tidak bisa di-rollback dengan aman — data NULL sebelumnya tidak bisa
        // dibedakan dari data yang memang seharusnya NULL
    }
};