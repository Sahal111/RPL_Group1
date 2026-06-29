<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengaturan', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
        });

        // Insert default kode registrasi
        DB::table('pengaturan')->insert([
            'key' => 'kode_registrasi',
            'value' => 'MINH3-2025'
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('pengaturan');
    }
};
