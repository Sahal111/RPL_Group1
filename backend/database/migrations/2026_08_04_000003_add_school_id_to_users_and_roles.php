<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // ── USERS ────────────────────────────────────────────────────

        Schema::table('users', function (Blueprint $table) {
            // Tambah school_id setelah id
            $table->foreignId('school_id')
                ->nullable()               // nullable dulu — data lama belum punya school_id
                ->after('id')
                ->comment('Tenant owner. NULL hanya untuk platform_admins (dihandle terpisah).')
                ->constrained('schools')
                ->cascadeOnDelete();

            // Tambah ulid untuk public identifier
            $table->char('ulid', 26)->nullable()->after('school_id')->comment('Public identifier');
        });

        // Hapus unique key lama (email global) → ganti jadi composite per sekolah
        // Karena guru sekolah A dan guru sekolah B boleh punya email yang sama
        Schema::table('users', function (Blueprint $table) {
            // Drop index lama
            $table->dropUnique(['email']);

            // Unique per sekolah
            $table->unique(['school_id', 'email'], 'uq_users_email_school');
            $table->unique(['school_id', 'username'], 'uq_users_username_school');
            $table->unique('ulid', 'uq_users_ulid');
            $table->index('school_id', 'idx_users_school');
        });

        // ── ROLES ────────────────────────────────────────────────────

        // roles.id sekarang tinyint (max 255) — perlu diubah ke bigint
        // karena setiap sekolah bisa punya role sendiri dan jumlahnya bisa banyak
        DB::statement('ALTER TABLE roles MODIFY COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT');

        // Ubah role_id di user_roles juga (sebelum tambah FK baru)
        DB::statement('ALTER TABLE user_roles MODIFY COLUMN role_id BIGINT UNSIGNED NOT NULL');

        Schema::table('roles', function (Blueprint $table) {
            $table->foreignId('school_id')
                ->nullable()
                ->after('id')
                ->comment('Tenant owner. Role milik sekolah ini.')
                ->constrained('schools')
                ->cascadeOnDelete();

            $table->boolean('is_system')
                ->default(false)
                ->after('is_active')
                ->comment('true = role bawaan sistem, tidak bisa dihapus operator sekolah');

            // Slug unik per sekolah (bukan global)
            // Drop unique lama dulu
            $table->dropUnique(['slug']);
            $table->unique(['school_id', 'slug'], 'uq_roles_slug_school');
            $table->index('school_id', 'idx_roles_school');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('uq_users_email_school');
            $table->dropUnique('uq_users_username_school');
            $table->dropUnique('uq_users_ulid');
            $table->dropIndex('idx_users_school');
            $table->unique('email');  // kembalikan unique lama
            $table->dropForeign(['school_id']);
            $table->dropColumn(['school_id', 'ulid']);
        });

        Schema::table('roles', function (Blueprint $table) {
            $table->dropUnique('uq_roles_slug_school');
            $table->dropIndex('idx_roles_school');
            $table->dropForeign(['school_id']);
            $table->dropColumn(['school_id', 'is_system']);
            $table->unique('slug');
        });

        DB::statement('ALTER TABLE roles MODIFY COLUMN id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT');
        DB::statement('ALTER TABLE user_roles MODIFY COLUMN role_id TINYINT UNSIGNED NOT NULL');
    }
};