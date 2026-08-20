<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Contracts\Encryption\DecryptException;

/**
 * Cast: EncryptedJson
 *
 * Enkripsi transparan untuk field JSON sensitif.
 * Digunakan untuk:
 *   - siswas.national_ids (JSON berisi NIK, NISN, No.KK)
 *   - gurus.national_ids  (JSON berisi NIK, NIP, NUPTK, No.KK)
 *   - global_users.two_factor_recovery_codes (JSON array kode recovery 2FA)
 *
 * Perbedaan dari EncryptedString:
 *   - Automatically encode/decode JSON
 *   - Return value adalah array/null, bukan string
 */
class EncryptedJson implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): ?array
    {
        if ($value === null) {
            return null;
        }

        try {
            $decrypted = Crypt::decryptString($value);
            return json_decode($decrypted, true) ?? [];
        } catch (DecryptException) {
            // Backward compat: mungkin data lama disimpan sebagai JSON biasa
            logger()->warning('EncryptedJson: Gagal dekripsi, mencoba parse JSON langsung.', [
                'model' => get_class($model),
                'key' => $key,
                'id' => $model->getKey(),
            ]);

            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : null;
        }
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value === null) {
            return null;
        }

        $json = is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : (string) $value;

        return Crypt::encryptString($json);
    }
}