<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // ── TAHUN_AJARANS ────────────────────────────────────────────
        Schema::create('tahun_ajarans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()
                ->comment('FK ke schools.id. NULL = global (legacy)')
                ->constrained('schools')->cascadeOnDelete();
            $table->string('tahun', 9)->comment('Format: YYYY/YYYY. Contoh: 2025/2026');
            $table->boolean('is_active')->default(false)->comment('1=Tahun ajaran berjalan. HANYA SATU yang aktif');
            $table->timestamps();
            $table->softDeletes()->comment('Tidak boleh hapus tahun ajaran yang sudah punya data');

            $table->unique(['school_id', 'tahun'], 'uq_tahun_ajaran_school');
            $table->index('school_id', 'idx_tahun_ajarans_school');
            $table->index('is_active', 'idx_ta_is_active');
        });

        // ── SEMESTERS ────────────────────────────────────────────────
        Schema::create('semesters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()
                ->comment('FK ke schools.id. NULL = global (legacy)')
                ->constrained('schools')->cascadeOnDelete();
            $table->foreignId('tahun_ajaran_id')
                ->comment('FK ke tahun_ajarans.id')
                ->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->enum('nama', ['Ganjil', 'Genap'])->comment('Ganjil=Juli-Des, Genap=Jan-Juni');
            $table->date('tgl_mulai')->nullable()->comment('Tanggal hari pertama efektif');
            $table->date('tgl_selesai')->nullable()->comment('Tanggal hari terakhir efektif');
            $table->boolean('is_active')->default(false)->comment('1=Semester yang sedang berjalan');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tahun_ajaran_id', 'nama'], 'uq_semester_ta_nama');
            $table->index('school_id', 'idx_semesters_school');
        });

        // ── PENGATURANS ──────────────────────────────────────────────
        Schema::create('pengaturans', function (Blueprint $table) {
            $table->unsignedInteger('id')->autoIncrement();
            $table->string('key', 80)->unique('uq_pengaturan_key')->comment('Identifier setting, snake_case: nama_madrasah, kkm_default');
            $table->text('value')->nullable()->comment('Nilai setting: string, angka, JSON, atau path file');
            $table->string('grup', 40)->nullable()->comment('Grup: sekolah|akademik|keuangan|notifikasi|tampilan');
            $table->string('deskripsi', 255)->nullable()->comment('Penjelasan setting untuk UI admin');
            $table->timestamp('updated_at')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->index('grup', 'idx_pengaturan_grup');
        });

        // ── KALENDER_AKADEMIKS ───────────────────────────────────────
        Schema::create('kalender_akademiks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tahun_ajaran_id')->nullable()
                ->comment('NULL = kalender nasional berlaku semua tahun')
                ->constrained('tahun_ajarans')->nullOnDelete();
            $table->string('judul', 200)->comment('Nama kegiatan/libur');
            $table->text('deskripsi')->nullable();
            $table->enum('jenis', ['libur', 'kegiatan', 'ujian', 'rapat', 'lainnya'])->default('kegiatan');
            $table->date('tanggal_mulai')->comment('Tanggal mulai kegiatan/libur');
            $table->date('tanggal_selesai')->nullable()->comment('NULL jika satu hari saja');
            $table->boolean('is_nasional')->default(false)->comment('1=Libur/kegiatan nasional');
            $table->foreignId('dibuat_oleh')->nullable()
                ->comment('FK ke users.id')
                ->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('tahun_ajaran_id', 'idx_kalakad_ta');
            $table->index('tanggal_mulai', 'idx_kalakad_tanggal');
        });

        // ── PENGUMUMANS ──────────────────────────────────────────────
        Schema::create('pengumumans', function (Blueprint $table) {
            $table->id();
            $table->string('judul', 200)->comment('Judul pengumuman');
            $table->longText('konten')->comment('Isi lengkap, bisa HTML atau plain text');
            $table->string('kategori', 50)->nullable()->comment('Akademik|Keuangan|Kegiatan|Darurat|Umum');
            // SET type — tidak ada native di Blueprint, pakai string
            $table->string('target', 100)->default('semua')
                ->comment('Target penerima: semua|guru|siswa|ortu|kepsek|wali_kelas|bendahara');
            $table->foreignId('penulis_id')->nullable()
                ->comment('FK ke users.id')
                ->constrained('users')->nullOnDelete();
            $table->timestamp('publish_at')->nullable()->comment('NULL/lalu = langsung tampil. Masa depan = terjadwal');
            $table->timestamp('expired_at')->nullable()->comment('NULL = tidak ada batas');
            $table->boolean('is_pinned')->default(false)->comment('1=Dipinned di atas daftar');
            $table->timestamps();
            $table->softDeletes();

            $table->index('publish_at', 'idx_pengumuman_publish');
            $table->index('target', 'idx_pengumuman_target');
        });

        // ── GALERIS ──────────────────────────────────────────────────
        Schema::create('galeris', function (Blueprint $table) {
            $table->id();
            $table->string('judul', 200)->comment('Judul/nama foto atau album');
            $table->text('deskripsi')->nullable();
            $table->string('kategori', 60)->nullable()->comment('Kegiatan|Fasilitas|Prestasi|Pramuka|Olahraga|...');
            $table->string('foto', 255)->comment('Path file foto');
            $table->foreignId('uploaded_by')->nullable()
                ->comment('FK ke users.id')
                ->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('kategori', 'idx_galeri_kategori');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('galeris');
        Schema::dropIfExists('pengumumans');
        Schema::dropIfExists('kalender_akademiks');
        Schema::dropIfExists('pengaturans');
        Schema::dropIfExists('semesters');
        Schema::dropIfExists('tahun_ajarans');
    }
};