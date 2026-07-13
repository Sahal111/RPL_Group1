<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PengumumanSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil user operator sebagai penulis
        $penulisId = DB::table('users')->where('username', 'operator')->value('id') ?? 1;

        DB::table('pengumumans')->insertOrIgnore([
            [
                'judul'      => 'Libur Awal Ramadhan 1448 H',
                'konten'     => 'Diberitahukan kepada seluruh guru dan staf bahwa libur awal bulan suci Ramadhan akan dimulai pada tanggal 1 Maret 2027 hingga 3 Maret 2027. Kegiatan belajar mengajar akan aktif kembali pada tanggal 4 Maret 2027 dengan jadwal khusus Ramadhan.',
                'kategori'   => 'Libur',
                'target'     => 'semua',
                'penulis_id' => $penulisId,
                'publish_at' => Carbon::now()->subDays(2),
                'is_pinned'  => 0,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'judul'      => 'Rapat Evaluasi Pembelajaran Semester Ganjil',
                'konten'     => 'Diwajibkan kepada seluruh wali kelas dan guru mata pelajaran untuk menghadiri rapat evaluasi pada hari Sabtu pukul 13.00 WIB di ruang guru. Harap membawa dokumen rekap nilai sementara.',
                'kategori'   => 'Rapat',
                'target'     => 'guru',
                'penulis_id' => $penulisId,
                'publish_at' => Carbon::now()->subDays(5),
                'is_pinned'  => 0,
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
            ],
            [
                'judul'      => 'Jadwal Penilaian Tengah Semester (PTS)',
                'konten'     => 'Pelaksanaan PTS semester ini akan diselenggarakan secara serentak mulai tanggal 15 Oktober hingga 20 Oktober. Guru mapel diharap segera menyerahkan naskah soal paling lambat tanggal 10 Oktober ke bagian kurikulum.',
                'kategori'   => 'Jadwal Ujian',
                'target'     => 'semua',
                'penulis_id' => $penulisId,
                'publish_at' => Carbon::now()->subDays(10),
                'is_pinned'  => 0,
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subDays(10),
            ],
            [
                'judul'      => 'Peringatan Hari Guru Nasional',
                'konten'     => 'Akan diadakan upacara bendera khusus dan lomba antar kelas. Seluruh guru diharapkan memakai seragam PGRI pada hari Senin besok.',
                'kategori'   => 'Informasi',
                'target'     => 'semua',
                'penulis_id' => $penulisId,
                'publish_at' => Carbon::now()->subDays(20),
                'is_pinned'  => 0,
                'created_at' => Carbon::now()->subDays(20),
                'updated_at' => Carbon::now()->subDays(20),
            ],
        ]);

        $this->command->info('PengumumanSeeder selesai.');
    }
}
