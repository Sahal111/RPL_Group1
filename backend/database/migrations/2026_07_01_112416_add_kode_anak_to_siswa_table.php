<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->string('kode_anak', 12)->nullable()->unique()->after('nisn');
        });

        // Backfill: setiap siswa yang sudah ada dikasih kode unik otomatis,
        // supaya operator tinggal buka Detail Siswa dan kasih tau ortu-nya.
        $existingCodes = [];
        DB::table('siswa')->orderBy('nisn')->select('nisn')->chunkById(200, function ($rows) use (&$existingCodes) {
            foreach ($rows as $row) {
                do {
                    $kode = strtoupper(Str::random(6));
                } while (in_array($kode, $existingCodes));
                $existingCodes[] = $kode;

                DB::table('siswa')->where('nisn', $row->nisn)->update(['kode_anak' => $kode]);
            }
        }, 'nisn');
    }

    public function down(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->dropColumn('kode_anak');
        });
    }
};