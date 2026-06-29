<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class PengumumanSeeder extends Seeder
{
    public function run(): void
    {
        // Cari user admin/operator atau kepsek untuk dijadikan penulis
        $admin = User::whereHas('role', function($q) {
            $q->whereIn('slug', ['operator', 'kepsek']);
        })->first();

        $penulisId = $admin ? $admin->id : 1;

        DB::table('pengumuman')->insert([
            [
                'judul' => 'Libur Awal Ramadhan 1448 H',
                'konten' => 'Diberitahukan kepada seluruh guru dan staf bahwa libur awal bulan suci Ramadhan akan dimulai pada tanggal 1 Maret 2027 hingga 3 Maret 2027. Kegiatan belajar mengajar akan aktif kembali pada tanggal 4 Maret 2027 dengan jadwal khusus Ramadhan.',
                'kategori' => 'Libur',
                'penulis_id' => $penulisId,
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
            [
                'judul' => 'Rapat Evaluasi Pembelajaran Semester Ganjil',
                'konten' => 'Diwajibkan kepada seluruh wali kelas dan guru mata pelajaran untuk menghadiri rapat evaluasi pada hari Sabtu pukul 13.00 WIB di ruang guru. Harap membawa dokumen rekap nilai sementara.',
                'kategori' => 'Rapat',
                'penulis_id' => $penulisId,
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],
            [
                'judul' => 'Jadwal Penilaian Tengah Semester (PTS)',
                'konten' => 'Pelaksanaan PTS semester ini akan diselenggarakan secara serentak mulai tanggal 15 Oktober hingga 20 Oktober. Guru mapel diharap segera menyerahkan naskah soal paling lambat tanggal 10 Oktober ke bagian kurikulum.',
                'kategori' => 'Jadwal Ujian',
                'penulis_id' => $penulisId,
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
            [
                'judul' => 'Peringatan Hari Guru Nasional',
                'konten' => 'Akan diadakan upacara bendera khusus dan lomba antar kelas. Seluruh guru diharapkan memakai seragam PGRI pada hari Senin besok.',
                'kategori' => 'Informasi',
                'penulis_id' => $penulisId,
                'created_at' => now()->subDays(20),
                'updated_at' => now()->subDays(20),
            ]
        ]);
    }
}
