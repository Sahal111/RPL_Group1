<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * CARA PAKAI:
 *
 * 1. Dry run dulu (tidak ubah data):
 *    php artisan encrypt:sensitive-data --dry-run
 *
 * 2. Enkripsi per tabel:
 *    php artisan encrypt:sensitive-data --table=siswas
 *    php artisan encrypt:sensitive-data --table=gurus
 *    php artisan encrypt:sensitive-data --table=orang_tuas
 *
 * 3. Enkripsi semua:
 *    php artisan encrypt:sensitive-data
 *
 * PENTING:
 * - Jalankan di maintenance mode: php artisan down
 * - Backup database sebelum menjalankan
 * - Monitor memory usage
 * - Jangan interrupt proses di tengah jalan
 * - Setelah selesai: update Model casts ke 'encrypted'
 */
class EncryptSensitiveData extends Command
{
    protected $signature = 'encrypt:sensitive-data
                            {--table= : Tabel spesifik (siswas|gurus|orang_tuas). Kosong = semua}
                            {--chunk=100 : Jumlah record per batch}
                            {--dry-run : Simulasi tanpa mengubah data}';

    protected $description = 'Enkripsi kolom sensitif (NIK, NISN, NIP, no_kk) dengan Laravel Crypt';

    private array $config = [
        'siswas' => [
            'columns' => ['nik', 'nisn', 'no_kk'],
            'flag' => 'is_sensitive_encrypted',
            'label' => 'Siswa',
        ],
        'gurus' => [
            'columns' => ['nik', 'nip', 'no_kk', 'nuptk'],
            'flag' => 'is_sensitive_encrypted',
            'label' => 'Guru',
        ],
        'orang_tuas' => [
            'columns' => ['nik'],
            'flag' => 'is_sensitive_encrypted',
            'label' => 'Orang Tua',
        ],
    ];

    public function handle(): int
    {
        $targetTable = $this->option('table');
        $chunkSize = (int) $this->option('chunk');
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->warn('🔍 DRY RUN MODE — Tidak ada data yang diubah');
        }

        $tables = $targetTable
            ? [$targetTable => $this->config[$targetTable] ?? null]
            : $this->config;

        foreach ($tables as $table => $cfg) {
            if (!$cfg) {
                $this->error("Tabel {$table} tidak dikenali.");
                continue;
            }

            $this->encryptTable($table, $cfg, $chunkSize, $dryRun);
        }

        $this->info('✅ Selesai.');
        return self::SUCCESS;
    }

    private function encryptTable(string $table, array $cfg, int $chunkSize, bool $dryRun): void
    {
        $this->info("\n📋 {$cfg['label']} ({$table})");

        $total = DB::table($table)->where($cfg['flag'], false)->count();
        $this->line("  Record belum terenkripsi: {$total}");

        if ($total === 0) {
            $this->line("  ✓ Sudah terenkripsi semua. Skip.");
            return;
        }

        if ($dryRun) {
            $this->line("  [DRY RUN] Akan memproses {$total} record dalam chunks of {$chunkSize}");
            return;
        }

        $processed = 0;
        $errors = 0;

        DB::table($table)
            ->where($cfg['flag'], false)
            ->orderBy('id')
            ->chunk($chunkSize, function ($records) use ($table, $cfg, &$processed, &$errors) {
                foreach ($records as $record) {
                    try {
                        $updates = [];

                        foreach ($cfg['columns'] as $col) {
                            $value = $record->$col ?? null;

                            // Skip null atau sudah dienkripsi
                            if (empty($value)) {
                                continue;
                            }

                            // Cek apakah sudah dienkripsi (Laravel Crypt prefix)
                            if ($this->isAlreadyEncrypted($value)) {
                                continue;
                            }

                            $updates[$col] = Crypt::encryptString($value);
                        }

                        if (!empty($updates)) {
                            $updates[$cfg['flag']] = true;
                            DB::table($table)->where('id', $record->id)->update($updates);
                        } else {
                            // Semua kolom null/kosong, tandai sebagai "selesai" tetap
                            DB::table($table)->where('id', $record->id)->update([
                                $cfg['flag'] => true,
                            ]);
                        }

                        $processed++;
                    } catch (\Exception $e) {
                        $errors++;
                        Log::error("encrypt:sensitive-data error", [
                            'table' => $table,
                            'id' => $record->id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                $this->line("  Processed: {$processed} | Errors: {$errors}");
            });

        if ($errors > 0) {
            $this->warn("  ⚠️ Ada {$errors} error. Cek laravel.log.");
        } else {
            $this->info("  ✅ Berhasil enkripsi {$processed} record.");
        }
    }

    private function isAlreadyEncrypted(string $value): bool
    {
        // Laravel Crypt menghasilkan base64 string yang bisa di-decode jadi JSON
        // dengan key "iv", "value", "mac"
        try {
            $decoded = base64_decode($value, true);
            if ($decoded === false)
                return false;
            $payload = json_decode($decoded, true);
            return isset($payload['iv'], $payload['value'], $payload['mac']);
        } catch (\Exception $e) {
            return false;
        }
    }
}