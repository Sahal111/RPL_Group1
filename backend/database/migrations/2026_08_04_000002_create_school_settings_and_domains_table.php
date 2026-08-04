<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Menggantikan tabel pengaturans yang sudah ada.
        // Key-value per sekolah, dikelompokkan per grup.
        Schema::create('school_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('key', 80)->comment('Contoh: sekolah.nama_lengkap, smtp.host, tampilan.theme');
            $table->text('value')->nullable();
            $table->string('grup', 40)->nullable()->comment('sekolah|akademik|keuangan|notifikasi|tampilan|smtp');
            $table->string('deskripsi', 255)->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->unique(['school_id', 'key'], 'uq_school_settings');
            $table->index(['school_id', 'grup'], 'idx_school_settings_grup');
        });

        // Subdomain atau custom domain per sekolah.
        // Contoh: sdn1bogor.siakad.id, atau custom domain: siakad.sdn1bogor.sch.id
        Schema::create('school_domains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('domain', 100)->unique()->comment('Subdomain atau domain penuh tenant ini');
            $table->boolean('is_primary')->default(false)->comment('Domain utama sekolah ini');
            $table->timestamp('created_at')->nullable();

            $table->index('school_id', 'idx_domains_school');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_domains');
        Schema::dropIfExists('school_settings');
    }
};