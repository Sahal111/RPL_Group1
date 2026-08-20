<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Contracts\Encryption\DecryptException;

/**
 * Cast: EncryptedString
 *
 * Enkripsi transparan untuk field sensitif PII yang dilindungi UU PDP No. 27/2022.
 *
 * Cara kerja:
 *   - Saat SAVE: nilai plain-text di-enkripsi dengan AES-256-CBC (Laravel Crypt)
 *     sebelum ditulis ke database.
 *   - Saat READ: nilai terenkripsi di-dekripsi secara otomatis saat diakses.
 *   - NULL: dibiarkan NULL, tidak di-enkripsi.
 *
 * Keamanan:
 *   - Menggunakan APP_KEY sebagai kunci enkripsi — pastikan APP_KEY kuat dan aman.
 *   - Setiap enkripsi menghasilkan ciphertext berbeda (random IV) — aman dari
 *     pattern analysis (frequency attack).
 *   - Jika dekripsi gagal (data corrupt / key berubah), mengembalikan NULL dan
 *     log warning — tidak throw exception ke user.
 *
 * Keterbatasan:
 *   - Field yang menggunakan cast ini TIDAK BISA di-WHERE/filter langsung di DB.
 *     Untuk search, gunakan hash terpisah (lihat HasSearchableNik trait).
 *   - Tidak cocok untuk field yang perlu range query atau LIKE.
 *
 * Penggunaan di model:
 *
 *   protected $casts = [
 *       'nik'   => \App\Casts\EncryptedString::class,
 *       'no_kk' => \App\Casts\EncryptedString::class,
 *       'nisn'  => \App\Casts\EncryptedString::class,
 *       'nip'   => \App\Casts\EncryptedString::class,
 *   ];
 *
 * Field yang wajib menggunakan cast ini (UU PDP):
 *   - siswas: nik, no_kk, nisn, national_ids (JSON)
 *   - gurus: nik, no_kk, nip, nuptk, national_ids (JSON)
 *   - orang_tuas: nik, no_kk
 *   - global_users: two_factor_recovery_codes
 */
class EncryptedString implements CastsAttributes
{
    /**
     * Dekripsi nilai dari database ke plain-text saat diakses model.
     *
     * @param  Model  $model
     * @param  string  $key   Nama kolom
     * @param  mixed   $value Nilai terenkripsi dari DB
     * @param  array   $attributes Semua attribute model
     * @return string|null
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value === null) {
            return null;
        }

        try {
            return Crypt::decryptString($value);
        } catch (DecryptException) {
            // Log warning tapi jangan expose ke user — mungkin data lama belum terenkripsi
            logger()->warning('EncryptedString: Gagal dekripsi kolom.', [
                'model' => get_class($model),
                'key' => $key,
                'id' => $model->getKey(),
            ]);

            // Return nilai asli kalau bukan ciphertext (backward compat data lama)
            // Setelah migration data selesai, ini bisa diubah jadi return null
            return $value;
        }
    }

    /**
     * Enkripsi plain-text sebelum disimpan ke database.
     *
     * @param  Model  $model
     * @param  string  $key
     * @param  mixed   $value
     * @param  array   $attributes
     * @return string|null
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value === null) {
            return null;
        }

        return Crypt::encryptString((string) $value);
    }
}