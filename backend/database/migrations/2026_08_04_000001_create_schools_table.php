<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->char('ulid', 26)->unique()->comment('Public identifier — jangan expose integer id ke luar');
            $table->string('nama', 150)->comment('Nama resmi sekolah');
            $table->string('npsn', 10)->nullable()->unique()->comment('Nomor Pokok Sekolah Nasional');
            // jenis: tipe kelembagaan (negeri/swasta/berbasis agama)
            $table->enum('jenis', [
                // Madrasah (Kemenag)
                'MI',
                'MTs',
                'MA',
                'MAK',
                // Umum (Kemdikbud)
                'SD',
                'SMP',
                'SMA',
                'SMK',
                // Lainnya
                'SDLB',
                'SMPLB',
                'SMALB',
                'SLB',
            ])->default('MI');

            // jenjang: level pendidikan — untuk filter fitur yang tersedia per jenjang
            // (SD/MI punya kelas 1-6, SMP/MTs 7-9, SMA/MA 10-12)
            $table->enum('jenjang', ['dasar', 'menengah_pertama', 'menengah_atas'])->default('dasar')
                ->comment('dasar=SD/MI, menengah_pertama=SMP/MTs, menengah_atas=SMA/MA/SMK');
            $table->enum('status', ['active', 'suspended', 'trial', 'cancelled'])->default('trial');
            $table->timestamp('trial_ends_at')->nullable()->comment('Kapan masa trial berakhir');
            $table->string('logo', 255)->nullable();
            $table->string('timezone', 50)->default('Asia/Jakarta');
            $table->string('locale', 10)->default('id');
            $table->timestamps();
            $table->softDeletes();

            $table->index('status', 'idx_schools_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};