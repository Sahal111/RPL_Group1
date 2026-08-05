<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── ROLES ────────────────────────────────────────────────────
        Schema::create('roles', function (Blueprint $table) {
            $table->unsignedTinyInteger('id')->autoIncrement();
            $table->string('slug', 30)->unique('uq_roles_slug')->comment('Identifier unik: kepsek|operator|guru|wali_kelas|bendahara|ortu|admin_ppdb');
            $table->string('nama', 60)->comment('Nama tampil role');
            $table->string('deskripsi', 255)->nullable()->comment('Penjelasan hak akses role ini');
            $table->boolean('is_active')->default(true)->comment('1=Aktif bisa diassign');
            $table->timestamps();
        });

        // ── USERS ────────────────────────────────────────────────────
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150)->comment('Nama lengkap pengguna');
            $table->string('username', 50)->nullable()->unique('uq_users_username')->comment('Username alternatif login');
            $table->string('email', 150)->unique('uq_users_email')->comment('Email utama login dan notifikasi');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password', 255)->comment('Hash bcrypt password');
            $table->string('foto', 255)->nullable()->comment('Path foto profil');
            $table->boolean('is_active')->default(true)->comment('1=Aktif bisa login');
            $table->rememberToken();
            $table->timestamp('last_login_at')->nullable()->comment('Waktu terakhir berhasil login');
            $table->string('last_login_ip', 45)->nullable()->comment('IP address terakhir login (IPv6 support)');
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active', 'idx_users_is_active');
            $table->index('deleted_at', 'idx_users_deleted_at');
        });

        // ── USER_ROLES ───────────────────────────────────────────────
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->comment('FK ke users.id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('role_id')->comment('FK ke roles.id');
            $table->timestamp('created_at')->nullable()->comment('Kapan role diberikan (audit)');

            $table->unique(['user_id', 'role_id'], 'uq_user_roles');
            $table->index('role_id', 'idx_user_roles_role_id');
            $table->foreign('role_id', 'fk_user_roles_role')->references('id')->on('roles')->cascadeOnDelete();
        });

        // ── PERSONAL_ACCESS_TOKENS ───────────────────────────────────
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('tokenable_type', 255)->comment('Nama class model pemilik token');
            $table->unsignedBigInteger('tokenable_id')->comment('ID record dari tokenable_type');
            $table->string('name', 255)->comment('Nama token: web, mobile-android, dll');
            $table->string('token', 64)->unique('uq_pat_token')->comment('Hash SHA-256 token');
            $table->text('abilities')->nullable()->comment('JSON array hak akses token');
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->comment('NULL = tidak expire');
            $table->timestamps();

            $table->index(['tokenable_type', 'tokenable_id'], 'idx_pat_tokenable');
            $table->index('expires_at', 'idx_pat_expires');
        });

        // ── PASSWORD_RESET_TOKENS ────────────────────────────────────
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email', 255)->primary()->comment('Email pengguna yang minta reset');
            $table->string('token', 255)->comment('Token reset yang di-hash');
            $table->timestamp('created_at')->nullable()->comment('Kapan token dibuat (untuk cek expired)');
        });

        // ── SESSIONS ─────────────────────────────────────────────────
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id', 255)->primary()->comment('ID unik session');
            $table->unsignedBigInteger('user_id')->nullable()->comment('NULL = guest belum login');
            $table->string('ip_address', 45)->nullable()->comment('IPv6 support');
            $table->text('user_agent')->nullable();
            $table->longText('payload')->comment('Data session di-serialize dan di-encrypt Laravel');
            $table->integer('last_activity')->comment('Unix timestamp aktivitas terakhir');

            $table->index('user_id', 'idx_sessions_user_id');
            $table->index('last_activity', 'idx_sessions_last_activity');
        });

        // ── CACHE ────────────────────────────────────────────────────
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key', 255)->primary()->comment('Identifier unik cache item');
            $table->mediumText('value')->comment('Data di-cache, sudah di-serialize PHP');
            $table->integer('expiration')->comment('Unix timestamp expired');

            $table->index('expiration', 'idx_cache_expiration');
        });

        // ── CACHE_LOCKS ──────────────────────────────────────────────
        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key', 255)->primary()->comment('Identifier lock');
            $table->string('owner', 255)->comment('Identifier proses yang memegang lock');
            $table->integer('expiration')->comment('Unix timestamp lock expired (prevent deadlock)');
        });

        // ── JOBS ─────────────────────────────────────────────────────
        // Schema::create('jobs', function (Blueprint $table) {
        //     $table->id();
        //     $table->string('queue', 255)->comment('Nama queue/antrian');
        //     $table->longText('payload')->comment('Job yang di-serialize');
        //     $table->unsignedTinyInteger('attempts')->comment('Berapa kali sudah dicoba diproses');
        //     $table->unsignedInteger('reserved_at')->nullable()->comment('Unix timestamp mulai diambil worker');
        //     $table->unsignedInteger('available_at')->comment('Unix timestamp job boleh diproses');
        //     $table->unsignedInteger('created_at')->comment('Unix timestamp job di-dispatch');

        //     $table->index('queue', 'idx_jobs_queue');
        // });

        // ── FAILED_JOBS ──────────────────────────────────────────────
        // Schema::create('failed_jobs', function (Blueprint $table) {
        //     $table->id();
        //     $table->string('uuid', 255)->unique('uq_failedjobs_uuid')->comment('UUID unik job');
        //     $table->text('connection')->comment('Driver queue yang dipakai');
        //     $table->text('queue')->comment('Nama antrian saat job gagal');
        //     $table->longText('payload')->comment('Data job lengkap untuk debugging');
        //     $table->longText('exception')->comment('Stack trace exception');
        //     $table->timestamp('failed_at')->useCurrent()->comment('Kapan job dinyatakan gagal');
        // });

        // ── ACTIVITY_LOGS ────────────────────────────────────────────
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()
                ->comment('NULL jika aksi sistem/cron')
                ->constrained('users')->nullOnDelete();
            $table->string('action', 50)->comment('Jenis aksi: create|update|delete|login|logout|...');
            $table->string('module', 60)->comment('Modul: siswa|guru|nilai|absensi|rapor|...');
            $table->unsignedBigInteger('subject_id')->nullable()->comment('ID record yang diubah/dilihat');
            $table->text('keterangan')->nullable()->comment('Deskripsi detail aksi, bisa JSON diff');
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->timestamp('created_at')->useCurrent()->comment('Waktu aksi (tidak ada updated_at)');

            $table->index('user_id', 'idx_actlog_user');
            $table->index('module', 'idx_actlog_module');
            $table->index('created_at', 'idx_actlog_created');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        // Schema::dropIfExists('failed_jobs');
        // Schema::dropIfExists('jobs');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('users');
        Schema::dropIfExists('roles');
    }
};
