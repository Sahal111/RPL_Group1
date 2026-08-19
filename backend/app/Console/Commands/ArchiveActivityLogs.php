<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * php artisan logs:archive-activity [--school=] [--months=] [--dry-run] [--batch=]
 *
 * Memindahkan baris lama dari `activity_logs` ke `activity_logs_archive`,
 * lalu menghapusnya dari tabel utama. Dijalankan via scheduler setiap malam.
 *
 * CATATAN SCHEMA:
 *   school_id di data_retention_policies adalah NOT NULL (migration 2026_08_11).
 *   Tidak ada platform-level NULL policy — semua policy berbasis school_id.
 *   Sekolah tanpa policy di tabel ini akan pakai DEFAULT_RETENTION_MONTHS.
 *
 * ALUR:
 *   1. Ambil semua school_id unik dari activity_logs
 *   2. Lookup retensi dari data_retention_policies per school_id
 *   3. Per sekolah: batch INSERT ke archive → DELETE dari tabel utama
 *   4. Update last_cleanup_at di data_retention_policies
 */
class ArchiveActivityLogs extends Command
{
    /** Fallback retensi jika sekolah belum punya policy */
    const DEFAULT_RETENTION_MONTHS = 6;

    protected $signature = 'logs:archive-activity
                            {--school= : Jalankan hanya untuk school_id tertentu}
                            {--months= : Override retensi (bulan) untuk semua sekolah}
                            {--batch=1000 : Jumlah baris per transaksi}
                            {--dry-run : Preview saja tanpa mengubah data}';

    protected $description = 'Arsipkan activity_logs lama ke activity_logs_archive dan hapus dari tabel utama';

    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');
        $batchSize = (int) ($this->option('batch') ?? 1000);
        $schoolOnly = $this->option('school') ? (int) $this->option('school') : null;
        $monthsOverride = $this->option('months') ? (int) $this->option('months') : null;

        if ($isDryRun) {
            $this->warn('⚠️  DRY RUN — tidak ada data yang diubah');
        }

        $this->info('=== logs:archive-activity — ' . now()->toDateTimeString() . ' ===');

        $policies = $this->buildPoliciesMap($schoolOnly, $monthsOverride);
        $totalArchived = 0;
        $totalDeleted = 0;

        foreach ($policies as $schoolId => $retentionMonths) {
            $cutoff = now()->subMonths($retentionMonths)->startOfDay();
            $this->line("  → school_id={$schoolId} | retensi {$retentionMonths} bulan | cutoff {$cutoff->toDateString()}");

            [$archived, $deleted] = $this->archiveSchool(
                schoolId: $schoolId,
                cutoff: $cutoff,
                batchSize: $batchSize,
                isDryRun: $isDryRun,
            );

            $totalArchived += $archived;
            $totalDeleted += $deleted;

            if (!$isDryRun && $archived > 0) {
                $this->updateLastCleanup($schoolId);
            }

            $this->line("    ✓ {$archived} diarsip, {$deleted} dihapus");
        }

        $this->info("=== Selesai: {$totalArchived} baris diarsip, {$totalDeleted} dihapus ===");

        Log::info('[ArchiveActivityLogs] Selesai', [
            'dry_run' => $isDryRun,
            'total_archived' => $totalArchived,
            'total_deleted' => $totalDeleted,
        ]);

        return self::SUCCESS;
    }

    // ─────────────────────────────────────────────────────────────────

    private function archiveSchool(
        int $schoolId,
        \Carbon\Carbon $cutoff,
        int $batchSize,
        bool $isDryRun,
    ): array {
        $totalArchived = 0;
        $totalDeleted = 0;

        do {
            $ids = DB::table('activity_logs')
                ->where('school_id', $schoolId)
                ->where('created_at', '<', $cutoff)
                ->whereNull('archived_at')
                ->orderBy('created_at')
                ->limit($batchSize)
                ->pluck('id')
                ->toArray();

            if (empty($ids)) {
                break;
            }

            if ($isDryRun) {
                $totalArchived += count($ids);
                $totalDeleted += count($ids);
                break;
            }

            DB::transaction(function () use ($ids, &$totalArchived, &$totalDeleted) {
                $idList = implode(',', $ids);

                DB::statement("
                    INSERT INTO activity_logs_archive
                        (id, school_id, user_id, action, module, subject_id,
                         keterangan, changes, ip_address, user_agent, created_at, archived_at)
                    SELECT
                        id, school_id, user_id, action, module, subject_id,
                        keterangan, changes, ip_address, user_agent, created_at, NOW()
                    FROM activity_logs
                    WHERE id IN ({$idList})
                    ON DUPLICATE KEY UPDATE archived_at = archived_at
                ");

                $deleted = DB::table('activity_logs')
                    ->whereIn('id', $ids)
                    ->delete();

                $totalArchived += count($ids);
                $totalDeleted += $deleted;
            });

        } while (count($ids) === $batchSize);

        return [$totalArchived, $totalDeleted];
    }

    /**
     * Bangun map [school_id => retention_months] dari activity_logs + data_retention_policies.
     */
    private function buildPoliciesMap(?int $schoolOnly, ?int $monthsOverride): array
    {
        // Ambil semua school_id yang punya data di activity_logs
        $schoolIds = DB::table('activity_logs')
            ->select('school_id')
            ->distinct()
            ->whereNotNull('school_id')
            ->when($schoolOnly, fn($q) => $q->where('school_id', $schoolOnly))
            ->pluck('school_id')
            ->toArray();

        if (empty($schoolIds)) {
            $this->line('  → Tidak ada data di activity_logs');
            return [];
        }

        // Jika ada override dari CLI, pakai langsung
        if ($monthsOverride !== null) {
            return array_fill_keys($schoolIds, $monthsOverride);
        }

        // Lookup policy per sekolah dari DB
        $dbPolicies = DB::table('data_retention_policies')
            ->where('table_name', 'activity_logs')
            ->whereIn('school_id', $schoolIds)
            ->pluck('retention_months', 'school_id')
            ->toArray();

        // Sekolah tanpa policy → pakai DEFAULT
        $map = [];
        foreach ($schoolIds as $sid) {
            $map[$sid] = $dbPolicies[$sid] ?? self::DEFAULT_RETENTION_MONTHS;
        }

        return $map;
    }

    private function updateLastCleanup(int $schoolId): void
    {
        DB::table('data_retention_policies')
            ->where('table_name', 'activity_logs')
            ->where('school_id', $schoolId)
            ->update(['last_cleanup_at' => now()]);
    }
}