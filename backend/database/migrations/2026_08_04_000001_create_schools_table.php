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
            $table->enum('jenis', ['MI', 'MTs', 'MA', 'SD', 'SMP', 'SMA', 'SMK'])->default('MI');
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