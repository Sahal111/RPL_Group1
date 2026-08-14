<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // =============================================
        // MODUL BK (Bimbingan Konseling)
        // =============================================

        Schema::create('bk_konseling', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('guru_bk_id')->constrained('users')->cascadeOnDelete(); // user dengan role guru_bk
            $table->foreignId('siswa_id')->constrained('siswas')->cascadeOnDelete();
            $table->enum('jenis', ['individual', 'kelompok', 'klasikal'])->default('individual');
            $table->enum('kategori', [
                'pribadi',      // masalah pribadi siswa
                'sosial',       // masalah sosial/pertemanan
                'belajar',      // masalah akademik (lihat nilai diblokir)
                'karir',        // perencanaan karir
                'keluarga',     // masalah keluarga
                'lainnya',
            ])->default('lainnya');
            $table->date('tanggal');
            $table->time('jam_mulai')->nullable();
            $table->time('jam_selesai')->nullable();
            $table->text('keluhan')->nullable();         // masalah yang dibawa siswa
            $table->text('hasil_konseling')->nullable(); // hasil/kesimpulan sesi
            $table->text('rencana_tindak_lanjut')->nullable();
            $table->enum('status', ['berlangsung', 'selesai', 'perlu_tindak_lanjut'])->default('berlangsung');
            $table->boolean('rahasia')->default(true);  // hanya guru BK & kepsek yang bisa lihat
            $table->timestamps();
            $table->softDeletes();

            $table->index(['school_id', 'siswa_id']);
            $table->index(['school_id', 'guru_bk_id']);
            $table->index(['school_id', 'tanggal']);
        });

        Schema::create('bk_catatan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('konseling_id')->nullable()->constrained('bk_konseling')->nullOnDelete();
            $table->foreignId('siswa_id')->constrained('siswas')->cascadeOnDelete();
            $table->foreignId('dibuat_oleh')->constrained('users')->cascadeOnDelete();
            $table->enum('tipe', ['pelanggaran', 'prestasi', 'observasi', 'rekomendasi'])->default('observasi');
            $table->string('judul', 200);
            $table->text('isi');
            $table->enum('tingkat', ['rendah', 'sedang', 'tinggi'])->nullable(); // untuk pelanggaran
            $table->timestamps();
            $table->softDeletes();

            $table->index(['school_id', 'siswa_id']);
            $table->index(['school_id', 'tipe']);
        });

        // =============================================
        // MODUL PERPUSTAKAAN
        // =============================================

        Schema::create('perpustakaan_buku', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('kode_buku', 50)->nullable();
            $table->string('isbn', 20)->nullable();
            $table->string('judul', 300);
            $table->string('pengarang', 200)->nullable();
            $table->string('penerbit', 200)->nullable();
            $table->year('tahun_terbit')->nullable();
            $table->string('kategori', 100)->nullable(); // fiksi, nonfiksi, pelajaran, referensi, dll
            $table->string('lokasi_rak', 50)->nullable();
            $table->integer('stok_total')->default(1);
            $table->integer('stok_tersedia')->default(1);
            $table->string('cover')->nullable(); // path foto cover
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['school_id', 'kode_buku']);
            $table->index(['school_id', 'kategori']);
            $table->index(['school_id', 'is_active']);
        });

        Schema::create('perpustakaan_peminjaman', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('buku_id')->constrained('perpustakaan_buku')->cascadeOnDelete();
            $table->foreignId('peminjam_id')->constrained('users')->cascadeOnDelete(); // bisa siswa atau guru
            $table->string('peminjam_tipe', 20)->default('siswa'); // siswa | guru | staff
            $table->foreignId('petugas_id')->constrained('users')->cascadeOnDelete(); // pustakawan yang proses
            $table->date('tanggal_pinjam');
            $table->date('tanggal_kembali_rencana');
            $table->date('tanggal_kembali_aktual')->nullable();
            $table->enum('status', ['dipinjam', 'dikembalikan', 'terlambat', 'hilang'])->default('dipinjam');
            $table->integer('denda')->default(0); // dalam rupiah
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index(['school_id', 'status']);
            $table->index(['school_id', 'peminjam_id']);
            $table->index(['school_id', 'tanggal_kembali_rencana']);
        });

        // =============================================
        // MODUL SURAT & TATA USAHA
        // =============================================

        Schema::create('surat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('nomor_surat', 100)->nullable();
            $table->enum('jenis', ['masuk', 'keluar', 'internal', 'legalisir'])->default('internal');
            $table->string('perihal', 300);
            $table->string('pengirim', 200)->nullable();   // untuk surat masuk
            $table->string('penerima', 200)->nullable();   // untuk surat keluar
            $table->date('tanggal_surat');
            $table->date('tanggal_terima')->nullable();    // untuk surat masuk
            $table->string('file_path')->nullable();       // scan/upload file surat
            $table->text('keterangan')->nullable();
            $table->enum('status', ['draft', 'aktif', 'diarsip'])->default('aktif');
            $table->foreignId('dibuat_oleh')->constrained('users')->cascadeOnDelete();
            $table->foreignId('diarsip_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('diarsip_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['school_id', 'jenis']);
            $table->index(['school_id', 'status']);
            $table->index(['school_id', 'tanggal_surat']);
        });

        Schema::create('legalisir', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('siswa_id')->constrained('siswas')->cascadeOnDelete();
            $table->foreignId('diproses_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('jenis_dokumen', [
                'ijazah',
                'rapor',
                'skhun',           // Surat Keterangan Hasil Ujian Nasional
                'surat_keterangan',
                'piagam',
                'lainnya',
            ])->default('lainnya');
            $table->integer('jumlah_lembar')->default(1);
            $table->date('tanggal_pengajuan');
            $table->date('tanggal_selesai')->nullable();
            $table->enum('status', ['menunggu', 'diproses', 'selesai', 'ditolak'])->default('menunggu');
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index(['school_id', 'status']);
            $table->index(['school_id', 'siswa_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legalisir');
        Schema::dropIfExists('surat');
        Schema::dropIfExists('perpustakaan_peminjaman');
        Schema::dropIfExists('perpustakaan_buku');
        Schema::dropIfExists('bk_catatan');
        Schema::dropIfExists('bk_konseling');
    }
};