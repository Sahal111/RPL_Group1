<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Revisi berdasarkan review database:
 *
 * POIN 2 — ENUM → Tabel Master
 *   - master_status_kepegawaians  (ganti ENUM status_kepegawaian di gurus & guru_cuitis)
 *   - master_jenis_cutis          (ganti ENUM jenis_cuti di guru_cuitis)
 *
 * POIN 3 — Modul yang Belum Ada
 *   - Perpustakaan : bukus, kategori_bukus, peminjaman_bukus
 *   - Keuangan Kas : akun_kass, transaksi_kass (kas masuk/keluar, BOS, penggajian)
 *
 * POIN 4 — Sentralisasi Media (Polymorphic)
 *   - media (polymorphic — gantikan duplikasi file_path di berbagai tabel)
 *
 * POIN 1 — Naming Convention
 *   Tidak diubah di level migration (sudah terlanjur dipakai FK di mana-mana).
 *   Catatan: nama tabel di-override di level Model Laravel ($table = 'nama_tepat').
 *   Ini adalah best practice untuk proyek yang sudah berjalan.
 */
return new class extends Migration {
    public function up(): void
    {
        // ═══════════════════════════════════════════════════════════════
        // POIN 2A: Master Status Kepegawaian
        // Reviewer: "Ubah ENUM yang berpotensi berubah menjadi tabel master"
        // ═══════════════════════════════════════════════════════════════
        Schema::create('master_status_kepegawaians', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()
                ->comment('NULL = nilai default sistem, berlaku semua sekolah')
                ->constrained('schools')->cascadeOnDelete();
            $table->string('kode', 20)->comment('Kode singkat: PNS, PPPK, GTY, GTT, Honor, dll');
            $table->string('nama', 100)->comment('Nama lengkap: Pegawai Negeri Sipil, dst');
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedTinyInteger('urutan')->default(0)->comment('Urutan tampil di dropdown');
            $table->timestamps();

            $table->unique(['school_id', 'kode'], 'uq_master_kepeg_school_kode');
            $table->index('school_id', 'idx_master_kepeg_school');
        });

        // ═══════════════════════════════════════════════════════════════
        // POIN 2B: Master Jenis Cuti
        // Reviewer: "jenis_cuti ENUM sangat mudah berubah (kebijakan pemerintah)"
        // ═══════════════════════════════════════════════════════════════
        Schema::create('master_jenis_cutis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()
                ->comment('NULL = berlaku semua sekolah / default sistem')
                ->constrained('schools')->cascadeOnDelete();
            $table->string('kode', 30)->comment('Kode: cuti_tahunan, cuti_sakit, cuti_bersalin, dst');
            $table->string('nama', 100)->comment('Label tampil: Cuti Tahunan, Cuti Sakit, dst');
            $table->unsignedTinyInteger('max_hari')->nullable()->comment('Batas hari per pengajuan. NULL = tidak terbatas');
            $table->boolean('butuh_dokumen')->default(false)->comment('1 = wajib upload surat keterangan');
            $table->boolean('is_active')->default(true);
            $table->unsignedTinyInteger('urutan')->default(0);
            $table->timestamps();

            $table->unique(['school_id', 'kode'], 'uq_master_cuti_school_kode');
            $table->index('school_id', 'idx_master_cuti_school');
        });

        // Tambah FK kolom ke tabel yang pakai ENUM lama
        // (kolom ENUM lama dibiarkan untuk backward compat — dihapus di migration berikutnya setelah data dimigrasi)
        if (Schema::hasTable('guru_cutis') && !Schema::hasColumn('guru_cutis', 'master_jenis_cuti_id')) {
            Schema::table('guru_cutis', function (Blueprint $table) {
                $table->foreignId('master_jenis_cuti_id')->nullable()
                    ->after('guru_id')
                    ->comment('FK ke master_jenis_cutis. Menggantikan kolom jenis_cuti ENUM')
                    ->constrained('master_jenis_cutis')->nullOnDelete();
            });
        }

        if (Schema::hasTable('gurus') && !Schema::hasColumn('gurus', 'master_status_kepeg_id')) {
            Schema::table('gurus', function (Blueprint $table) {
                $table->foreignId('master_status_kepeg_id')->nullable()
                    ->after('status_kepegawaian')
                    ->comment('FK ke master_status_kepegawaians. Menggantikan kolom status_kepegawaian ENUM')
                    ->constrained('master_status_kepegawaians')->nullOnDelete();
            });
        }

        // ═══════════════════════════════════════════════════════════════
        // POIN 3A: Modul Perpustakaan
        // Reviewer: "Katalog dan Peminjaman Perpustakaan belum terakomodasi"
        // ═══════════════════════════════════════════════════════════════

        // Kategori / Klasifikasi Buku
        Schema::create('kategori_bukus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()
                ->constrained('schools')->cascadeOnDelete();
            $table->string('nama', 100)->comment('Nama kategori: Fiksi, Non-Fiksi, Referensi, Paket, dll');
            $table->string('kode_ddc', 10)->nullable()->comment('Kode Dewey Decimal Classification. Opsional');
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('school_id', 'idx_kat_buku_school');
        });

        // Katalog Buku (Master)
        Schema::create('bukus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()
                ->constrained('schools')->cascadeOnDelete();
            $table->foreignId('kategori_id')->nullable()
                ->comment('FK ke kategori_bukus.id')
                ->constrained('kategori_bukus')->nullOnDelete();
            $table->string('judul', 255);
            $table->string('pengarang', 255)->nullable();
            $table->string('penerbit', 150)->nullable();
            $table->year('tahun_terbit')->nullable();
            $table->string('isbn', 20)->nullable()->unique('uq_buku_isbn');
            $table->string('no_panggil', 30)->nullable()->comment('Nomor panggil DDC: 813.6 ROW h');
            $table->string('bahasa', 30)->default('Indonesia');
            $table->unsignedSmallInteger('jumlah_eksemplar')->default(1)->comment('Total fisik buku yang dimiliki');
            $table->unsignedSmallInteger('jumlah_tersedia')->default(1)->comment('Stok yang bisa dipinjam sekarang');
            $table->string('lokasi_rak', 50)->nullable()->comment('Contoh: Rak A-3, Lantai 1');
            $table->string('sampul', 255)->nullable()->comment('Path gambar sampul buku');
            $table->text('sinopsis')->nullable();
            $table->boolean('bisa_dipinjam')->default(true)->comment('0 = koleksi referensi, tidak boleh dibawa pulang');
            $table->timestamps();
            $table->softDeletes();

            $table->index('school_id', 'idx_buku_school');
            $table->index(['school_id', 'kategori_id'], 'idx_buku_school_kat');
            $table->index('judul', 'idx_buku_judul');
        });

        // Transaksi Peminjaman
        Schema::create('peminjaman_bukus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()
                ->constrained('schools')->cascadeOnDelete();
            $table->foreignId('buku_id')
                ->comment('FK ke bukus.id')
                ->constrained('bukus')->restrict();
            $table->morphs('peminjam');
            // peminjam_type: App\Models\Siswa | App\Models\Guru
            // peminjam_id  : id siswa atau guru
            $table->foreignId('petugas_id')->nullable()
                ->comment('FK ke users.id. Petugas yang memproses')
                ->constrained('users')->nullOnDelete();
            $table->date('tanggal_pinjam');
            $table->date('batas_kembali');
            $table->date('tanggal_kembali')->nullable()->comment('NULL = belum dikembalikan');
            $table->unsignedTinyInteger('jumlah')->default(1);
            $table->string('status', 20)->default('dipinjam')
                ->comment('dipinjam | dikembalikan | terlambat | hilang');
            $table->decimal('denda', 10, 2)->default(0)->comment('Akumulasi denda keterlambatan');
            $table->boolean('denda_lunas')->default(false);
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index(['school_id', 'status'], 'idx_pinjam_school_status');
            $table->index(['school_id', 'buku_id'], 'idx_pinjam_school_buku');
            $table->index(['peminjam_type', 'peminjam_id'], 'idx_pinjam_morphs');
            $table->index('batas_kembali', 'idx_pinjam_batas');
        });

        // ═══════════════════════════════════════════════════════════════
        // POIN 3B: Modul Keuangan Kas
        // Reviewer: "belum ada tabel dinamis untuk kas masuk/keluar, BOS, penggajian"
        // ═══════════════════════════════════════════════════════════════

        // Chart of Accounts — Akun Kas
        Schema::create('akun_kass', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()
                ->constrained('schools')->cascadeOnDelete();
            $table->string('kode_akun', 20)->comment('Kode akun: 1-001 Kas Tunai, 1-002 Bank BRI, dst');
            $table->string('nama_akun', 150);
            $table->string('jenis', 30)
                ->default('kas')
                ->comment('kas | bank | pendapatan | pengeluaran | bos | komite | gaji');
            $table->decimal('saldo_awal', 15, 2)->default(0);
            $table->decimal('saldo_saat_ini', 15, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['school_id', 'kode_akun'], 'uq_akun_kas_school_kode');
            $table->index('school_id', 'idx_akun_kas_school');
        });

        // Transaksi Kas (Jurnal Umum)
        Schema::create('transaksi_kass', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()
                ->constrained('schools')->cascadeOnDelete();
            $table->foreignId('akun_kas_id')
                ->comment('FK ke akun_kass.id')
                ->constrained('akun_kass')->restrict();
            $table->foreignId('tahun_ajaran_id')->nullable()
                ->constrained('tahun_ajarans')->nullOnDelete();
            $table->string('no_bukti', 50)->nullable()->comment('Nomor bukti/kwitansi/BKU');
            $table->date('tanggal_transaksi');
            $table->string('jenis', 10)->comment('masuk | keluar');
            $table->string('kategori', 50)
                ->comment('spp | bos | komite | gaji | operasional | inventaris | lainnya');
            $table->string('uraian', 255)->comment('Keterangan transaksi');
            $table->decimal('nominal', 15, 2);
            $table->decimal('saldo_sesudah', 15, 2)->comment('Saldo akun setelah transaksi ini');
            $table->foreignId('siswa_id')->nullable()
                ->comment('Diisi jika transaksi terkait pembayaran siswa')
                ->constrained('siswas')->nullOnDelete();
            $table->foreignId('guru_id')->nullable()
                ->comment('Diisi jika transaksi adalah penggajian guru')
                ->constrained('gurus')->nullOnDelete();
            $table->string('metode', 30)->default('tunai')
                ->comment('tunai | transfer | va | qris | giro');
            $table->string('referensi_eksternal', 100)->nullable()->comment('No. transfer, no. cek, dll');
            $table->foreignId('dibuat_oleh')
                ->comment('FK ke users.id')
                ->constrained('users')->restrict();
            $table->foreignId('diverifikasi_oleh')->nullable()
                ->comment('FK ke users.id. Kepala sekolah/bendahara yang approval')
                ->constrained('users')->nullOnDelete();
            $table->timestamp('diverifikasi_at')->nullable();
            $table->string('status', 20)->default('draft')
                ->comment('draft | posted | void');
            $table->text('catatan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['school_id', 'tanggal_transaksi'], 'idx_trxkas_school_tgl');
            $table->index(['school_id', 'jenis', 'kategori'], 'idx_trxkas_school_jenis_kat');
            $table->index(['school_id', 'tahun_ajaran_id'], 'idx_trxkas_school_ta');
            $table->index('siswa_id', 'idx_trxkas_siswa');
            $table->index('guru_id', 'idx_trxkas_guru');
        });

        // ═══════════════════════════════════════════════════════════════
        // POIN 4: Sentralisasi Media — Polymorphic File Table
        // Reviewer: "Duplikasi kolom file_path, storage_path di banyak tabel"
        // ═══════════════════════════════════════════════════════════════
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()
                ->constrained('schools')->cascadeOnDelete();

            // Polymorphic: mediable_type = 'App\Models\Guru', mediable_id = 5
            $table->morphs('mediable');

            $table->foreignId('uploaded_by')->nullable()
                ->comment('FK ke users.id')
                ->constrained('users')->nullOnDelete();

            $table->string('koleksi', 60)->default('default')
                ->comment('Nama koleksi: foto_profil | dokumen | berkas | sampul_buku | tugas | dll');
            $table->string('nama_file_asli', 255)->comment('Nama file saat diupload oleh user');
            $table->string('nama_file_disk', 255)->comment('Nama unik di storage (UUID + ext)');
            $table->string('storage_path', 500)
                ->comment('Relative path: schools/{ulid}/{module}/{id}/{filename}');
            $table->string('disk', 30)->default('local')
                ->comment('Laravel disk: local | s3 | r2 | gcs');
            $table->string('mime_type', 100)->nullable();
            $table->string('ekstensi', 10)->nullable();
            $table->unsignedBigInteger('ukuran_bytes')->nullable()->comment('Ukuran file dalam bytes');
            $table->unsignedSmallInteger('lebar_px')->nullable()->comment('Lebar gambar dalam pixel');
            $table->unsignedSmallInteger('tinggi_px')->nullable()->comment('Tinggi gambar dalam pixel');
            $table->json('metadata')->nullable()->comment('Exif, durasi video, jumlah halaman PDF, dll');
            $table->boolean('is_public')->default(false)->comment('1 = bisa diakses tanpa auth');
            $table->unsignedTinyInteger('urutan')->default(0)->comment('Untuk galeri multi-file');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['mediable_type', 'mediable_id', 'koleksi'], 'idx_media_morphs_koleksi');
            $table->index(['school_id', 'koleksi'], 'idx_media_school_koleksi');
            $table->index('disk', 'idx_media_disk');
        });
    }

    public function down(): void
    {
        // Lepas FK tambahan dulu sebelum drop
        if (Schema::hasTable('gurus') && Schema::hasColumn('gurus', 'master_status_kepeg_id')) {
            Schema::table('gurus', function (Blueprint $table) {
                $table->dropForeign(['master_status_kepeg_id']);
                $table->dropColumn('master_status_kepeg_id');
            });
        }
        if (Schema::hasTable('guru_cutis') && Schema::hasColumn('guru_cutis', 'master_jenis_cuti_id')) {
            Schema::table('guru_cutis', function (Blueprint $table) {
                $table->dropForeign(['master_jenis_cuti_id']);
                $table->dropColumn('master_jenis_cuti_id');
            });
        }

        Schema::dropIfExists('media');
        Schema::dropIfExists('transaksi_kass');
        Schema::dropIfExists('akun_kass');
        Schema::dropIfExists('peminjaman_bukus');
        Schema::dropIfExists('bukus');
        Schema::dropIfExists('kategori_bukus');
        Schema::dropIfExists('master_jenis_cutis');
        Schema::dropIfExists('master_status_kepegawaians');
    }
};