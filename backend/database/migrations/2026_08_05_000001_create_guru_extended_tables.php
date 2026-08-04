<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Tabel-tabel guru yang baru ditambahkan di SQL dump 2026-08-02
 * Belum ada di migration sebelumnya (note: 2026_07_12_300000).
 *
 * Tabel yang dibuat:
 *   - guru_anaks           : data anak kandung guru
 *   - guru_kompetensi      : kompetensi bahasa/IT/keahlian guru
 *   - guru_kontak_darurat  : kontak darurat guru
 *   - guru_cuti            : riwayat cuti guru
 *   - guru_mutasi          : riwayat mutasi guru (nama baru, sebelumnya "guru_mutasis")
 *   - guru_pkgs            : penilaian kinerja guru (PKG) per semester
 *   - guru_dokumen_logs    : audit log aksi pada dokumen guru
 *   - guru_dokumen_versions: versi file dokumen guru
 *   - guru_import_logs     : log import data guru via Excel/ZIP
 */
return new class extends Migration {
    public function up(): void
    {
        // ── 1. GURU_ANAKS ────────────────────────────────────────────
        Schema::create('guru_anaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')
                ->comment('FK ke gurus.id')
                ->constrained('gurus')
                ->cascadeOnDelete();
            $table->string('nama', 150)->comment('Nama lengkap anak');
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->unsignedTinyInteger('urutan')->default(1)->comment('Anak ke-1, ke-2, dst');
            $table->string('keterangan', 255)->nullable();
            $table->timestamps();

            $table->index('guru_id', 'idx_guruanak_guru_id');
        });

        // ── 2. GURU_KOMPETENSI ───────────────────────────────────────
        Schema::create('guru_kompetensi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')
                ->comment('FK ke gurus.id')
                ->constrained('gurus')
                ->cascadeOnDelete();
            $table->enum('jenis', ['bahasa', 'it', 'bidang_keahlian', 'lainnya'])
                ->comment('Jenis kompetensi');
            $table->string('nama', 150)->comment('Nama kompetensi: Bahasa Inggris, Microsoft Excel, dll');
            $table->enum('tingkat', ['Dasar', 'Menengah', 'Mahir', 'Ahli'])->nullable()
                ->comment('Tingkat kemampuan');
            $table->string('keterangan', 255)->nullable();
            $table->timestamps();

            $table->index('guru_id', 'idx_gurukomp_guru_id');
        });

        // ── 3. GURU_KONTAK_DARURAT ───────────────────────────────────
        Schema::create('guru_kontak_darurat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')
                ->comment('FK ke gurus.id')
                ->constrained('gurus')
                ->cascadeOnDelete();
            $table->string('nama', 150)->comment('Nama kontak darurat');
            $table->string('hubungan', 50)->comment('Hubungan: Istri, Suami, Orang Tua, Saudara, dll');
            $table->string('no_hp', 20)->comment('Nomor HP yang bisa dihubungi');
            $table->string('alamat', 255)->nullable();
            $table->boolean('is_primary')->default(true)->comment('1=Kontak utama');
            $table->timestamps();

            $table->index('guru_id', 'idx_gurukontakdrt_guru_id');
        });

        // ── 4. GURU_CUTI ─────────────────────────────────────────────
        Schema::create('guru_cuti', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')
                ->constrained('gurus')
                ->cascadeOnDelete();
            $table->enum('jenis_cuti', [
                'Cuti Tahunan',
                'Cuti Sakit',
                'Cuti Bersalin',
                'Cuti Alasan Penting',
                'Cuti Besar',
                'Lainnya',
            ]);
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->unsignedTinyInteger('jumlah_hari')->default(1);
            $table->string('no_sk', 80)->nullable();
            $table->date('tanggal_sk')->nullable();
            $table->string('pejabat_pemberi', 150)->nullable();
            $table->text('alasan')->nullable();
            $table->string('file_sk', 255)->nullable();
            $table->enum('status', ['Disetujui', 'Selesai', 'Dibatalkan'])->default('Disetujui');
            $table->text('keterangan')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });

        // ── 5. GURU_MUTASI ───────────────────────────────────────────
        // Catatan: di SQL dump namanya "guru_mutasi" (bukan "guru_mutasis" seperti di note lama)
        Schema::create('guru_mutasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')
                ->comment('FK ke gurus.id')
                ->constrained('gurus')
                ->cascadeOnDelete();
            $table->enum('jenis_mutasi', [
                'Masuk',
                'Keluar',
                'Internal',
                'Penugasan Sementara',
                'Kembali Bertugas',
            ]);
            $table->enum('jenis_keluar', [
                'Pindah Sekolah',
                'Mengundurkan Diri',
                'Pensiun',
                'Kontrak Berakhir',
                'Meninggal Dunia',
                'PHK',
                'Lainnya',
            ])->nullable();
            $table->string('status_sebelum', 50)->nullable()->comment('Status guru sebelum mutasi diproses');
            $table->string('status_setelah', 50)->nullable()->comment('Status guru sesudah mutasi diproses');
            $table->string('sekolah_asal', 200)->nullable();
            $table->string('npsn_asal', 10)->nullable();
            $table->string('sekolah_tujuan', 200)->nullable();
            $table->string('npsn_tujuan', 10)->nullable();
            $table->date('tanggal_mutasi');
            $table->date('tmt_mutasi')->nullable();
            $table->date('tanggal_berakhir')->nullable();
            $table->string('jabatan_sebelum', 100)->nullable();
            $table->string('jabatan_sesudah', 100)->nullable();
            $table->enum('status_kepegawaian', ['PNS', 'PPPK', 'GTY', 'GTT'])->nullable();
            $table->string('no_sk', 80)->nullable()->comment('Nomor SK mutasi');
            $table->date('tanggal_sk')->nullable();
            $table->string('instansi_penerbit_sk', 200)->nullable();
            $table->string('alasan_mutasi', 200)->nullable();
            $table->string('file_sk', 255)->nullable()->comment('Path file SK mutasi yang diupload');
            $table->text('keterangan')->nullable();
            $table->boolean('is_locked')->default(false)
                ->comment('True jika mutasi sudah memengaruhi modul lain dan tidak boleh diedit bebas');
            $table->timestamps();
            $table->softDeletes();

            $table->index('guru_id', 'idx_gurumutasi_guru_id');
        });

        // ── 6. GURU_PKGS ─────────────────────────────────────────────
        Schema::create('guru_pkgs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')
                ->comment('FK ke gurus.id')
                ->constrained('gurus')
                ->cascadeOnDelete();
            $table->foreignId('tahun_ajaran_id')
                ->nullable()
                ->comment('FK ke tahun_ajarans.id')
                ->constrained('tahun_ajarans')
                ->nullOnDelete();
            $table->foreignId('semester_id')
                ->nullable()
                ->comment('FK ke semesters.id')
                ->constrained('semesters')
                ->nullOnDelete();
            $table->decimal('nilai', 5, 2)->nullable()->comment('Nilai PKG 0.00–100.00');
            $table->enum('predikat', ['Amat Baik', 'Baik', 'Cukup', 'Sedang', 'Kurang'])->nullable();
            $table->text('catatan')->nullable()->comment('Catatan dari kepala sekolah');
            $table->foreignId('dinilai_oleh')
                ->nullable()
                ->comment('FK ke users.id (kepala sekolah)')
                ->constrained('users')
                ->nullOnDelete();
            $table->date('tanggal_penilaian')->nullable();
            $table->timestamps();

            $table->unique(['guru_id', 'tahun_ajaran_id', 'semester_id'], 'uq_guru_pkg_ta_sem');
            $table->index('guru_id', 'idx_gurupkg_guru_id');
        });

        // ── 7. GURU_DOKUMEN_LOGS ─────────────────────────────────────
        Schema::create('guru_dokumen_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_dokumen_id')
                ->constrained('guru_dokumens')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->enum('aksi', [
                'upload',
                'replace',
                'download',
                'preview',
                'approve',
                'reject',
                'revisi',
                'delete',
                'restore',
            ]);
            $table->text('keterangan')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['guru_dokumen_id', 'aksi'], 'guru_dokumen_logs_guru_dokumen_id_aksi_index');
            $table->index('user_id', 'guru_dokumen_logs_user_id_index');
        });

        // ── 8. GURU_DOKUMEN_VERSIONS ─────────────────────────────────
        Schema::create('guru_dokumen_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_dokumen_id')
                ->constrained('guru_dokumens')
                ->cascadeOnDelete();
            $table->unsignedTinyInteger('versi');
            $table->string('file_path', 500);
            $table->string('file_type', 100)->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('file_hash', 64)->nullable();
            $table->string('original_filename', 255)->nullable();
            $table->foreignId('uploaded_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->unique(['guru_dokumen_id', 'versi'], 'guru_dokumen_versions_guru_dokumen_id_versi_unique');
            $table->index('guru_dokumen_id', 'guru_dokumen_versions_guru_dokumen_id_index');
        });

        // ── 9. GURU_IMPORT_LOGS ──────────────────────────────────────
        Schema::create('guru_import_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('batch_id', 36)->unique()->comment('UUID unik per sesi import');
            $table->enum('tipe', ['excel', 'zip', 'backup_restore'])->default('excel');
            $table->string('nama_file', 255)->nullable();
            $table->enum('status', ['pending', 'preview', 'processing', 'done', 'failed', 'rolled_back'])
                ->default('pending');
            $table->enum('mode_duplikat', ['skip', 'replace', 'merge'])->default('replace');
            $table->integer('total_baris')->default(0);
            $table->integer('jumlah_insert')->default(0);
            $table->integer('jumlah_update')->default(0);
            $table->integer('jumlah_skip')->default(0);
            $table->integer('jumlah_gagal')->default(0);
            $table->integer('progress_persen')->default(0);
            $table->json('error_detail')->nullable()->comment('Array error per baris');
            $table->json('statistik_relasi')->nullable()->comment('Jumlah per sheet/tabel');
            $table->json('preview_data')->nullable()->comment('Sample 5 baris untuk preview');
            $table->json('column_mapping')->nullable()->comment('Mapping header user → kolom DB');
            $table->string('ip_address', 45)->nullable();
            $table->float('durasi_detik')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();

            $table->index('batch_id', 'guru_import_logs_batch_id_index');
            $table->index('status', 'guru_import_logs_status_index');
            $table->index('user_id', 'guru_import_logs_user_id_index');
        });
    }

    public function down(): void
    {
        // Drop dalam urutan terbalik untuk menghindari constraint error
        Schema::dropIfExists('guru_import_logs');
        Schema::dropIfExists('guru_dokumen_versions');
        Schema::dropIfExists('guru_dokumen_logs');
        Schema::dropIfExists('guru_pkgs');
        Schema::dropIfExists('guru_mutasi');
        Schema::dropIfExists('guru_cuti');
        Schema::dropIfExists('guru_kontak_darurat');
        Schema::dropIfExists('guru_kompetensi');
        Schema::dropIfExists('guru_anaks');
    }
};