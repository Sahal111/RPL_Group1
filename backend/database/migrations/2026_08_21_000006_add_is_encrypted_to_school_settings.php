<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * school_settings menyimpan konfigurasi sensitif (SMTP host/password, API key, dll)
 * di kolom `value` plaintext.
 *
 * Solusi: tambah kolom `is_encrypted` boolean per baris.
 * Ini memungkinkan:
 * 1. Enkripsi bertahap - baris lama bisa dikenali belum terenkripsi
 * 2. Selektif - tidak semua setting perlu enkripsi (misal: nama sekolah)
 * 3. Enkripsi dilakukan via Command, bukan di migration ini
 *
 * Key yang wajib dienkripsi (ditentukan di SchoolSettingService):
 * - smtp_password, smtp_host, smtp_username
 * - whatsapp_api_key, payment_gateway_key
 * - midtrans_server_key, midtrans_client_key
 * - dan semua key yang berakhiran _key, _secret, _password, _token
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            $table->boolean('is_encrypted')->default(false)->after('value')
                ->comment('TRUE jika kolom value sudah dienkripsi via Laravel Crypt. Ditentukan per baris karena tidak semua setting sensitif.');
        });
    }

    public function down(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            $table->dropColumn('is_encrypted');
        });
    }
};
