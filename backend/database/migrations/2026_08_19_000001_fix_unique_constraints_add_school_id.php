<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fix Unique Constraints — Tambahkan school_id ke Semua Composite Unique Key
 *
 * RIWAYAT ERROR:
 *   v1: Gagal di rapors dengan error 1553 (tidak drop FK sebelum drop index).
 *       absensis, nilais, nilai_akhirs sudah sempat dapat constraint BARU.
 *   v2: Gagal di absensis dengan error 1061 (duplicate key — constraint baru sudah ada dari v1).
 *
 * STATE DB SAAT INI (hasil deduksi dari kedua error):
 *   CONSTRAINT BARU sudah ada   : absensis, nilais, nilai_akhirs
 *   CONSTRAINT LAMA masih ada   : rapors, data_tambahan_siswas,
 *                                  program_kesejahteraan_siswas, perkembangan_siswas,
 *                                  siswa_ekskuls, exam_answers, assignment_submissions,
 *                                  exam_student_sessions
 *   FK LAMA mungkin sudah drop  : absensis (siswa_id, kelas_id), nilais (siswa_id),
 *                                  nilai_akhirs (siswa_id) → perlu restore jika belum ada
 *
 * STRATEGI v3 — IDEMPOTENT PENUH:
 *   Setiap operasi dicek kondisinya dulu via INFORMATION_SCHEMA sebelum dieksekusi.
 *   Migration ini aman dijalankan berkali-kali di state apapun.
 *
 * POLA PER TABEL:
 *   1. Drop FK yang leading column-nya jadi backing index (cek dulu sebelum drop)
 *   2. Drop index lama jika masih ada
 *   3. Buat index baru jika belum ada
 *   4. Restore FK jika belum ada
 */
return new class extends Migration {
    public function up(): void
    {
        // ── 1. ABSENSIS ──────────────────────────────────────────────
        // State: constraint BARU sudah ada, FK mungkin sudah di-drop oleh v2
        $this->fixTable(
            table: 'absensis',
            fksToDrop: [
                ['column' => 'siswa_id', 'fkName' => 'absensis_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade'],
                ['column' => 'kelas_id', 'fkName' => 'absensis_kelas_id_foreign', 'ref_table' => 'kelas', 'onDelete' => 'cascade'],
            ],
            oldIndex: 'uq_absensi_siswa_jadwal_tgl',
            newIndex: 'uq_absensi_school_siswa_jadwal_tgl',
            newColumns: ['school_id', 'siswa_id', 'kelas_id', 'jadwal_id', 'tanggal'],
        );

        // ── 2. NILAIS ────────────────────────────────────────────────
        $this->fixTable(
            table: 'nilais',
            fksToDrop: [
                ['column' => 'siswa_id', 'fkName' => 'nilais_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade'],
            ],
            oldIndex: 'uq_nilai_siswa_plot_komponen_smt',
            newIndex: 'uq_nilai_school_siswa_plot_komponen_smt',
            newColumns: ['school_id', 'siswa_id', 'plot_id', 'komponen_id', 'semester_id'],
        );

        // ── 3. NILAI_AKHIRS ──────────────────────────────────────────
        $this->fixTable(
            table: 'nilai_akhirs',
            fksToDrop: [
                ['column' => 'siswa_id', 'fkName' => 'nilai_akhirs_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade'],
            ],
            oldIndex: 'uq_nilaiakhir_siswa_plot_smt',
            newIndex: 'uq_nilaiakhir_school_siswa_plot_smt',
            newColumns: ['school_id', 'siswa_id', 'plot_id', 'semester_id'],
        );

        // ── 4. RAPORS ────────────────────────────────────────────────
        $this->fixTable(
            table: 'rapors',
            fksToDrop: [
                ['column' => 'siswa_id', 'fkName' => 'rapors_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade'],
            ],
            oldIndex: 'uq_rapor_siswa_smt',
            newIndex: 'uq_rapor_school_siswa_smt',
            newColumns: ['school_id', 'siswa_id', 'semester_id'],
        );

        // ── 5. DATA_TAMBAHAN_SISWAS ──────────────────────────────────
        $this->fixTable(
            table: 'data_tambahan_siswas',
            fksToDrop: [
                ['column' => 'siswa_id', 'fkName' => 'data_tambahan_siswas_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade'],
            ],
            oldIndex: 'uq_dtambahan_siswa',
            newIndex: 'uq_dtambahan_school_siswa',
            newColumns: ['school_id', 'siswa_id'],
        );

        // ── 6. PROGRAM_KESEJAHTERAAN_SISWAS ─────────────────────────
        $this->fixTable(
            table: 'program_kesejahteraan_siswas',
            fksToDrop: [
                ['column' => 'siswa_id', 'fkName' => 'program_kesejahteraan_siswas_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade'],
            ],
            oldIndex: 'uq_prokesej_siswa',
            newIndex: 'uq_prokesej_school_siswa',
            newColumns: ['school_id', 'siswa_id'],
        );

        // ── 7. PERKEMBANGAN_SISWAS ───────────────────────────────────
        $this->fixTable(
            table: 'perkembangan_siswas',
            fksToDrop: [
                ['column' => 'siswa_id', 'fkName' => 'perkembangan_siswas_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade'],
            ],
            oldIndex: 'uq_perkemb_siswa_smt',
            newIndex: 'uq_perkemb_school_siswa_smt',
            newColumns: ['school_id', 'siswa_id', 'semester_id'],
        );

        // ── 8. SISWA_EKSKULS ─────────────────────────────────────────
        $this->fixTable(
            table: 'siswa_ekskuls',
            fksToDrop: [
                ['column' => 'siswa_id', 'fkName' => 'siswa_ekskuls_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade'],
                ['column' => 'ekskul_id', 'fkName' => 'siswa_ekskuls_ekskul_id_foreign', 'ref_table' => 'ekskuls', 'onDelete' => 'cascade'],
            ],
            oldIndex: 'uq_siswekskul',
            newIndex: 'uq_siswekskul_school',
            newColumns: ['school_id', 'siswa_id', 'ekskul_id', 'semester_id'],
        );

        // ── 9. EXAM_ANSWERS ──────────────────────────────────────────
        $this->fixTable(
            table: 'exam_answers',
            fksToDrop: [
                ['column' => 'session_id', 'fkName' => 'exam_answers_session_id_foreign', 'ref_table' => 'exam_student_sessions', 'onDelete' => 'cascade'],
                ['column' => 'question_id', 'fkName' => 'exam_answers_question_id_foreign', 'ref_table' => 'exam_questions', 'onDelete' => 'cascade'],
            ],
            oldIndex: 'uq_exam_answer_session_q',
            newIndex: 'uq_exam_answer_school_session_q',
            newColumns: ['school_id', 'session_id', 'question_id'],
        );

        // ── 10. ASSIGNMENT_SUBMISSIONS ───────────────────────────────
        $this->fixTable(
            table: 'assignment_submissions',
            fksToDrop: [
                ['column' => 'assignment_id', 'fkName' => 'assignment_submissions_assignment_id_foreign', 'ref_table' => 'assignments', 'onDelete' => 'cascade'],
                ['column' => 'siswa_id', 'fkName' => 'assignment_submissions_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade'],
            ],
            oldIndex: 'uq_submission_assign_siswa',
            newIndex: 'uq_submission_school_assign_siswa',
            newColumns: ['school_id', 'assignment_id', 'siswa_id'],
        );

        // ── 11. EXAM_STUDENT_SESSIONS ────────────────────────────────
        $this->fixTable(
            table: 'exam_student_sessions',
            fksToDrop: [
                ['column' => 'exam_id', 'fkName' => 'exam_student_sessions_exam_id_foreign', 'ref_table' => 'exams', 'onDelete' => 'cascade'],
                ['column' => 'siswa_id', 'fkName' => 'exam_student_sessions_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade'],
            ],
            oldIndex: 'uq_exam_session_exam_siswa',
            newIndex: 'uq_exam_session_school_exam_siswa',
            newColumns: ['school_id', 'exam_id', 'siswa_id'],
        );
    }

    public function down(): void
    {
        $rollbacks = [
            [
                'table' => 'absensis',
                'fksToDrop' => [
                    ['column' => 'siswa_id', 'fkName' => 'absensis_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade'],
                    ['column' => 'kelas_id', 'fkName' => 'absensis_kelas_id_foreign', 'ref_table' => 'kelas', 'onDelete' => 'cascade'],
                ],
                'oldIndex' => 'uq_absensi_school_siswa_jadwal_tgl',
                'newIndex' => 'uq_absensi_siswa_jadwal_tgl',
                'newColumns' => ['siswa_id', 'kelas_id', 'jadwal_id', 'tanggal'],
            ],
            [
                'table' => 'nilais',
                'fksToDrop' => [['column' => 'siswa_id', 'fkName' => 'nilais_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade']],
                'oldIndex' => 'uq_nilai_school_siswa_plot_komponen_smt',
                'newIndex' => 'uq_nilai_siswa_plot_komponen_smt',
                'newColumns' => ['siswa_id', 'plot_id', 'komponen_id', 'semester_id'],
            ],
            [
                'table' => 'nilai_akhirs',
                'fksToDrop' => [['column' => 'siswa_id', 'fkName' => 'nilai_akhirs_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade']],
                'oldIndex' => 'uq_nilaiakhir_school_siswa_plot_smt',
                'newIndex' => 'uq_nilaiakhir_siswa_plot_smt',
                'newColumns' => ['siswa_id', 'plot_id', 'semester_id'],
            ],
            [
                'table' => 'rapors',
                'fksToDrop' => [['column' => 'siswa_id', 'fkName' => 'rapors_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade']],
                'oldIndex' => 'uq_rapor_school_siswa_smt',
                'newIndex' => 'uq_rapor_siswa_smt',
                'newColumns' => ['siswa_id', 'semester_id'],
            ],
            [
                'table' => 'data_tambahan_siswas',
                'fksToDrop' => [['column' => 'siswa_id', 'fkName' => 'data_tambahan_siswas_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade']],
                'oldIndex' => 'uq_dtambahan_school_siswa',
                'newIndex' => 'uq_dtambahan_siswa',
                'newColumns' => ['siswa_id'],
            ],
            [
                'table' => 'program_kesejahteraan_siswas',
                'fksToDrop' => [['column' => 'siswa_id', 'fkName' => 'program_kesejahteraan_siswas_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade']],
                'oldIndex' => 'uq_prokesej_school_siswa',
                'newIndex' => 'uq_prokesej_siswa',
                'newColumns' => ['siswa_id'],
            ],
            [
                'table' => 'perkembangan_siswas',
                'fksToDrop' => [['column' => 'siswa_id', 'fkName' => 'perkembangan_siswas_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade']],
                'oldIndex' => 'uq_perkemb_school_siswa_smt',
                'newIndex' => 'uq_perkemb_siswa_smt',
                'newColumns' => ['siswa_id', 'semester_id'],
            ],
            [
                'table' => 'siswa_ekskuls',
                'fksToDrop' => [
                    ['column' => 'siswa_id', 'fkName' => 'siswa_ekskuls_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade'],
                    ['column' => 'ekskul_id', 'fkName' => 'siswa_ekskuls_ekskul_id_foreign', 'ref_table' => 'ekskuls', 'onDelete' => 'cascade'],
                ],
                'oldIndex' => 'uq_siswekskul_school',
                'newIndex' => 'uq_siswekskul',
                'newColumns' => ['siswa_id', 'ekskul_id', 'semester_id'],
            ],
            [
                'table' => 'exam_answers',
                'fksToDrop' => [
                    ['column' => 'session_id', 'fkName' => 'exam_answers_session_id_foreign', 'ref_table' => 'exam_student_sessions', 'onDelete' => 'cascade'],
                    ['column' => 'question_id', 'fkName' => 'exam_answers_question_id_foreign', 'ref_table' => 'exam_questions', 'onDelete' => 'cascade'],
                ],
                'oldIndex' => 'uq_exam_answer_school_session_q',
                'newIndex' => 'uq_exam_answer_session_q',
                'newColumns' => ['session_id', 'question_id'],
            ],
            [
                'table' => 'assignment_submissions',
                'fksToDrop' => [
                    ['column' => 'assignment_id', 'fkName' => 'assignment_submissions_assignment_id_foreign', 'ref_table' => 'assignments', 'onDelete' => 'cascade'],
                    ['column' => 'siswa_id', 'fkName' => 'assignment_submissions_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade'],
                ],
                'oldIndex' => 'uq_submission_school_assign_siswa',
                'newIndex' => 'uq_submission_assign_siswa',
                'newColumns' => ['assignment_id', 'siswa_id'],
            ],
            [
                'table' => 'exam_student_sessions',
                'fksToDrop' => [
                    ['column' => 'exam_id', 'fkName' => 'exam_student_sessions_exam_id_foreign', 'ref_table' => 'exams', 'onDelete' => 'cascade'],
                    ['column' => 'siswa_id', 'fkName' => 'exam_student_sessions_siswa_id_foreign', 'ref_table' => 'siswas', 'onDelete' => 'cascade'],
                ],
                'oldIndex' => 'uq_exam_session_school_exam_siswa',
                'newIndex' => 'uq_exam_session_exam_siswa',
                'newColumns' => ['exam_id', 'siswa_id'],
            ],
        ];

        foreach ($rollbacks as $rb) {
            $this->fixTable(
                table: $rb['table'],
                fksToDrop: $rb['fksToDrop'],
                oldIndex: $rb['oldIndex'],
                newIndex: $rb['newIndex'],
                newColumns: $rb['newColumns'],
            );
        }
    }

    // ─────────────────────────────────────────────────────────────────

    /**
     * Idempotent fix untuk satu tabel:
     *   1. Drop FK yang terdampak (hanya jika FK tersebut masih ada di DB)
     *   2. Drop index lama (hanya jika masih ada)
     *   3. Buat index baru (hanya jika belum ada)
     *   4. Restore FK (hanya jika belum ada)
     */
    private function fixTable(
        string $table,
        array $fksToDrop,
        string $oldIndex,
        string $newIndex,
        array $newColumns,
    ): void {
        if (!Schema::hasTable($table)) {
            return;
        }

        // Step 1 — Drop FK yang terdampak
        foreach ($fksToDrop as $fk) {
            if ($this->fkExists($table, $fk['fkName'])) {
                Schema::table($table, function (Blueprint $t) use ($fk) {
                    $t->dropForeign($fk['fkName']);
                });
            }
        }

        // Step 2 — Drop index lama (jika masih ada)
        if ($this->indexExists($table, $oldIndex)) {
            Schema::table($table, function (Blueprint $t) use ($oldIndex) {
                $t->dropUnique($oldIndex);
            });
        }

        // Step 3 — Buat index baru (jika belum ada)
        if (!$this->indexExists($table, $newIndex)) {
            Schema::table($table, function (Blueprint $t) use ($newColumns, $newIndex) {
                $t->unique($newColumns, $newIndex);
            });
        }

        // Step 4 — Restore FK (hanya yang belum ada)
        foreach ($fksToDrop as $fk) {
            if (!$this->fkExists($table, $fk['fkName'])) {
                Schema::table($table, function (Blueprint $t) use ($fk) {
                    $builder = $t->foreign($fk['column'])->references('id')->on($fk['ref_table']);
                    match ($fk['onDelete']) {
                        'cascade' => $builder->cascadeOnDelete(),
                        'set null' => $builder->nullOnDelete(),
                        default => $builder->restrictOnDelete(),
                    };
                });
            }
        }
    }

    /**
     * Cek apakah named index ada via INFORMATION_SCHEMA.
     */
    private function indexExists(string $table, string $indexName): bool
    {
        $db = config('database.connections.mysql.database');

        $result = DB::selectOne("
            SELECT COUNT(*) AS cnt
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = ?
              AND TABLE_NAME   = ?
              AND INDEX_NAME   = ?
        ", [$db, $table, $indexName]);

        return ($result->cnt ?? 0) > 0;
    }

    /**
     * Cek apakah named FK constraint ada via INFORMATION_SCHEMA.
     */
    private function fkExists(string $table, string $fkName): bool
    {
        $db = config('database.connections.mysql.database');

        $result = DB::selectOne("
            SELECT COUNT(*) AS cnt
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA          = ?
              AND TABLE_NAME            = ?
              AND CONSTRAINT_NAME       = ?
              AND REFERENCED_TABLE_NAME IS NOT NULL
        ", [$db, $table, $fkName]);

        return ($result->cnt ?? 0) > 0;
    }
};