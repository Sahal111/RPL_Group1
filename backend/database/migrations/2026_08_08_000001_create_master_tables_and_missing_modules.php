<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Revisi Multi-Tenancy: Pemisahan Autentikasi Global vs. Akses Per-Tenant
 *
 * ── Masalah yang diperbaiki ──────────────────────────────────────────────
 *
 * Kondisi saat ini:
 *   - Tabel `users` punya kolom `school_id` → satu akun terikat ke satu sekolah
 *   - Unique key: (school_id, email) → email yang sama bisa ada di dua sekolah
 *     sebagai dua baris berbeda → duplikasi data & konflik kredensial
 *
 * Skenario yang GAGAL dengan skema lama:
 *   Pak Budi guru matematika mengajar di SD Maju (pagi) dan MI Nurul Huda (siang).
 *   Dengan skema lama, Pak Budi harus punya 2 akun berbeda dengan 2 password,
 *   2 email mungkin, dan tidak bisa login single-sign-on ke kedua sekolah.
 *
 * ── Solusi: 3-Layer Auth Architecture ───────────────────────────────────
 *
 *   Layer 1 — global_users
 *     Identitas tunggal di seluruh platform. Email unik secara global.
 *     Dipakai untuk autentikasi (login, password reset, 2FA).
 *
 *   Layer 2 — schools (sudah ada)
 *     Tenant. Setiap sekolah adalah tenant terisolasi.
 *
 *   Layer 3 — tenant_user_roles (PIVOT BARU)
 *     Memetakan global_user ↔ school ↔ role.
 *     Satu baris = "User X punya role Y di Sekolah Z".
 *     Pak Budi bisa: guru di Sekolah A + kepsek di Sekolah B.
 *
 * ── Strategi Migrasi Data ────────────────────────────────────────────────
 *
 *   Tabel `users` yang lama TIDAK dihapus — tetap jalan sebagai "local user"
 *   per sekolah untuk backward compat. Global users adalah lapisan baru di atas.
 *   Kolom `global_user_id` ditambahkan ke `users` sebagai FK opsional.
 *   Ke depan, users baru bisa langsung dibuat via global_users + tenant_user_roles.
 */
return new class extends Migration {
    public function up(): void
    {
        // ═══════════════════════════════════════════════════════════════
        // 1. GLOBAL_USERS — Identitas tunggal lintas tenant
        // ═══════════════════════════════════════════════════════════════
        Schema::create('global_users', function (Blueprint $table) {
            $table->id();
            $table->char('ulid', 26)->unique('uq_gu_ulid')
                ->comment('Public identifier. Gunakan ini di URL, bukan integer id');

            // Identitas & Autentikasi
            $table->string('email', 150)->unique('uq_gu_email')
                ->comment('Email UNIK secara global. Dipakai untuk login & notifikasi platform');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password', 255)->comment('Hash bcrypt. SATU password untuk semua tenant');
            $table->rememberToken();

            // Profil dasar (hanya data yang benar-benar global)
            $table->string('name', 150)->comment('Nama lengkap');
            $table->string('foto', 255)->nullable()->comment('Foto profil di level platform');
            $table->string('phone', 20)->nullable()->unique('uq_gu_phone')
                ->comment('Nomor HP untuk 2FA / notifikasi WhatsApp');

            // Keamanan
            $table->string('two_factor_secret')->nullable()->comment('TOTP secret untuk 2FA');
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();

            // Status
            $table->boolean('is_active')->default(true)
                ->comment('false = banned dari seluruh platform');
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active', 'idx_gu_active');
        });

        // ═══════════════════════════════════════════════════════════════
        // 2. TENANT_USER_ROLES — Pivot: siapa punya role apa di sekolah mana
        // ═══════════════════════════════════════════════════════════════
        Schema::create('tenant_user_roles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('global_user_id')
                ->comment('FK ke global_users.id')
                ->constrained('global_users')->cascadeOnDelete();

            $table->foreignId('school_id')
                ->comment('FK ke schools.id — tenant mana')
                ->constrained('schools')->cascadeOnDelete();

            $table->foreignId('role_id')
                ->comment('FK ke roles.id — role di tenant ini')
                ->constrained('roles')->cascadeOnDelete();

            // Konteks opsional: role ini berlaku untuk entitas tertentu
            // Contoh: wali_kelas berlaku hanya untuk kelas_id = 5
            //         guru berlaku untuk guru_id = 12 (terhubung ke profil guru)
            $table->string('konteks_type', 100)->nullable()
                ->comment('Polymorphic type: App\Models\Kelas, App\Models\Guru, dll');
            $table->unsignedBigInteger('konteks_id')->nullable()
                ->comment('ID entitas konteks. NULL = role berlaku untuk seluruh sekolah');

            // Manajemen akses
            $table->boolean('is_active')->default(true)
                ->comment('false = akses dibekukan sementara tanpa hapus record');
            $table->timestamp('aktif_dari')->nullable()
                ->comment('NULL = langsung aktif. Bisa jadwalkan aktivasi di masa depan');
            $table->timestamp('aktif_sampai')->nullable()
                ->comment('NULL = tidak ada kadaluarsa. Bisa set kontrak temporal');

            // Audit
            $table->foreignId('diberikan_oleh')->nullable()
                ->comment('FK ke global_users.id — siapa yang assign role ini')
                ->constrained('global_users')->nullOnDelete();
            $table->timestamp('diberikan_at')->nullable();
            $table->foreignId('dicabut_oleh')->nullable()
                ->comment('FK ke global_users.id — siapa yang revoke role ini')
                ->constrained('global_users')->nullOnDelete();
            $table->timestamp('dicabut_at')->nullable();

            $table->timestamps();

            // Satu user hanya boleh punya SATU role per sekolah
            // (bisa punya beberapa baris jika multi-role diizinkan: hapus unique ini)
            $table->unique(
                ['global_user_id', 'school_id', 'role_id'],
                'uq_tur_user_school_role'
            );

            $table->index(['school_id', 'role_id'], 'idx_tur_school_role');
            $table->index(['global_user_id', 'school_id'], 'idx_tur_user_school');
            $table->index(['global_user_id', 'is_active'], 'idx_tur_user_active');
            $table->index(['konteks_type', 'konteks_id'], 'idx_tur_konteks');
        });

        // ═══════════════════════════════════════════════════════════════
        // 3. Link tabel users lama ke global_users (backward compat)
        //    users.global_user_id = NULL → akun lama, belum di-migrasi
        //    users.global_user_id = X   → sudah terhubung ke identitas global
        // ═══════════════════════════════════════════════════════════════
        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'global_user_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreignId('global_user_id')
                    ->nullable()
                    ->after('id')
                    ->comment('FK ke global_users.id. NULL = akun lama belum di-upgrade ke global auth')
                    ->constrained('global_users')->nullOnDelete();

                $table->index('global_user_id', 'idx_users_global_user');
            });
        }

        // ═══════════════════════════════════════════════════════════════
        // 4. PLATFORM_ADMINS — Admin level SaaS (bukan admin sekolah)
        //    Mereka bisa masuk ke semua tenant untuk support/maintenance
        // ═══════════════════════════════════════════════════════════════
        Schema::create('platform_admins', function (Blueprint $table) {
            $table->id();

            $table->foreignId('global_user_id')
                ->unique('uq_pa_global_user')
                ->comment('FK ke global_users.id. 1 admin = 1 baris')
                ->constrained('global_users')->cascadeOnDelete();

            $table->string('level', 20)->default('support')
                ->comment('super_admin | admin | support | billing | readonly');

            // Impersonation audit: siapa terakhir masuk ke tenant mana
            $table->foreignId('last_tenant_id')->nullable()
                ->comment('FK ke schools.id — tenant terakhir yang di-impersonate')
                ->constrained('schools')->nullOnDelete();
            $table->timestamp('last_impersonate_at')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('level', 'idx_pa_level');
            $table->index('is_active', 'idx_pa_active');
        });
    }

    public function down(): void
    {
        // Lepas FK dulu
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'global_user_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropForeign(['global_user_id']);
                $table->dropIndex('idx_users_global_user');
                $table->dropColumn('global_user_id');
            });
        }

        Schema::dropIfExists('platform_admins');
        Schema::dropIfExists('tenant_user_roles');
        Schema::dropIfExists('global_users');
    }
};