<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('slug', 80)->comment('Format: {modul}.{resource}.{aksi} — contoh: master_data.guru.view');
            $table->string('nama', 100);
            $table->string('modul', 40)->comment('Grup permission: master_data|dms|absensi|keuangan|ppdb|akademik|pengaturan');
            $table->string('deskripsi', 255)->nullable();
            $table->timestamps();

            $table->unique(['school_id', 'slug'], 'uq_permissions_slug_school');
            $table->index(['school_id', 'modul'], 'idx_permissions_school_modul');
        });

        Schema::create('role_permissions', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();

            $table->primary(['role_id', 'permission_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
    }
};