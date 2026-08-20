<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

/**
 * Fix #5 — Encrypt existing PII data (NIK, No.KK, NISN, NIP, NUPTK)
 *
 * MASALAH:
 *   Data identitas nasional tersimpan plaintext di database.
 *   UU PDP No. 27/2022 mengklasifikasikan NIK, No.KK, NISN sebagai
 *   data pribadi yang bersifat khusus — wajib dilindungi.
 *
 * SOLUSI:
 *   Enkripsi semua data yang sudah ada menggunakan Laravel Crypt
 *   (AES-256-CBC dengan APP_KEY). Model sudah menggunakan cast
 *   EncryptedString/EncryptedJson, jadi data baru otomatis terenkripsi.
 *   Migration ini menangani data LAMA yang sudah ada di DB.
 *
 * STRATEGI:
 *   - Proses per-chunk (500 row) untuk menghindari memory exhaustion
 *   - Skip nilai yang sudah terlihat terenkripsi (mulai dengan "eyJ")
 *   - Log error per-row tapi tidak stop migration
 *   - Idempotent: row yang sudah terenkripsi di-skip
 *
 * ROLLBACK:
 *   Rollback tidak bisa mendekripsi karena kita tidak menyimpan backup.
 *   Untuk rollback, perlu restore DB snapshot. Ini INTENTIONAL —
 *   setelah data terenkripsi, tidak ada alasan untuk men-dekripsi ke plaintext.
 */
return new class extends Migration {
    /**
     * Konfigurasi field yang perlu dienkripsi.
     * Format: ['table' => [...kolom]]
     */
    private array $stringFields = [
        'siswas' => ['nik', 'no_kk', 'nisn'],
        'gurus' => ['nik', 'no_kk', 'nip', 'nuptk'],
        'orang_tuas' => ['nik', 'no_kk'],
    ];

    private array $jsonFields = [
        'siswas' => ['national_ids'],
        'gurus' => ['national_ids'],
        'global_users' => ['two_factor_recovery_codes'],
    ];

    public function up(): void
    {
        // Enkripsi string fields
        foreach ($this->stringFields as $table => $columns) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            foreach ($columns as $column) {
                if (!Schema::hasColumn($table, $column)) {
                    continue;
                }

                $this->encryptColumn($table, $column, 'string');
            }
        }

        // Enkripsi JSON fields
        foreach ($this->jsonFields as $table => $columns) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            foreach ($columns as $column) {
                if (!Schema::hasColumn($table, $column)) {
                    continue;
                }

                $this->encryptColumn($table, $column, 'json');
            }
        }
    }

    public function down(): void
    {
        // Rollback tidak didukung — lihat docblock di atas.
        // Untuk rollback: restore dari database snapshot sebelum migration ini.
        Log::warning('EncryptPiiFields: Rollback tidak didukung. Restore dari DB snapshot.');
    }

    private function encryptColumn(string $table, string $column, string $type): void
    {
        $processed = 0;
        $skipped = 0;
        $errors = 0;

        DB::table($table)
            ->whereNotNull($column)
            ->orderBy('id')
            ->chunk(500, function ($rows) use ($table, $column, $type, &$processed, &$skipped, &$errors) {
                foreach ($rows as $row) {
                    $value = $row->{$column};

                    // Skip nilai NULL
                    if ($value === null) {
                        continue;
                    }

                    // Skip jika sudah terenkripsi (Laravel ciphertext selalu base64)
                    // Format: "eyJ..." (base64 dari JSON envelope Crypt)
                    if ($this->isAlreadyEncrypted($value)) {
                        $skipped++;
                        continue;
                    }

                    try {
                        $encrypted = match ($type) {
                            'json' => $this->encryptJson($value),
                            default => Crypt::encryptString((string) $value),
                        };

                        DB::table($table)
                            ->where('id', $row->id)
                            ->update([$column => $encrypted]);

                        $processed++;
                    } catch (\Throwable $e) {
                        $errors++;
                        Log::error("EncryptPiiFields: Gagal enkripsi.", [
                            'table' => $table,
                            'column' => $column,
                            'id' => $row->id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            });

        Log::info("EncryptPiiFields: {$table}.{$column} selesai.", [
            'processed' => $processed,
            'skipped' => $skipped,
            'errors' => $errors,
        ]);
    }

    private function isAlreadyEncrypted(mixed $value): bool
    {
        if (!is_string($value) || strlen($value) < 50) {
            return false;
        }

        // Laravel Crypt menghasilkan base64-encoded JSON envelope
        // Coba decode dan verify strukturnya
        try {
            $decoded = json_decode(base64_decode($value), true);
            return isset($decoded['iv'], $decoded['value'], $decoded['mac']);
        } catch (\Throwable) {
            return false;
        }
    }

    private function encryptJson(mixed $value): string
    {
        // Nilai mungkin sudah berupa string JSON atau sudah array
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            $value = is_array($decoded) ? $decoded : $value;
        }

        $json = is_array($value)
            ? json_encode($value, JSON_UNESCAPED_UNICODE)
            : (string) $value;

        return Crypt::encryptString($json);
    }
};