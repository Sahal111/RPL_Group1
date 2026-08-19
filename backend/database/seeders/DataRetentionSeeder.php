<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seed default retention policy untuk activity_logs.
 *
 * Karena school_id NOT NULL (migration 2026_08_11 mengubah nullable → NOT NULL),
 * policy dibuat per sekolah yang sudah ada di tabel `schools`.
 *
 * Command `logs:archive-activity` akan pakai DEFAULT_RETENTION_MONTHS (6 bulan)
 * sebagai fallback jika sekolah belum punya policy di tabel ini.
 */
class DataRetentionSeeder extends Seeder
{
    public function run(): void
    {
        $schoolIds = DB::table('schools')->pluck('id');

        if ($schoolIds->isEmpty()) {
            $this->command->warn('⚠ Tidak ada sekolah di tabel schools — skip DataRetentionSeeder');
            return;
        }

        $now = now();
        $inserted = 0;
        $skipped = 0;

        foreach ($schoolIds as $schoolId) {
            $exists = DB::table('data_retention_policies')
                ->where('school_id', $schoolId)
                ->where('table_name', 'activity_logs')
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            DB::table('data_retention_policies')->insert([
                'school_id' => $schoolId,
                'table_name' => 'activity_logs',
                'retention_months' => 6,
                'archive_strategy' => 'archive_table',
                'last_cleanup_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $inserted++;
        }

        $this->command->info("✓ DataRetentionSeeder: {$inserted} policy ditambahkan, {$skipped} sudah ada");
    }
}