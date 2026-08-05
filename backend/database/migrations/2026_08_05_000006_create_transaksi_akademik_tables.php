<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── ABSENSIS ─────────────────────────────────────────────────
        Schema::create('absensis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')
                ->comment('FK ke siswas.id')
                ->constrained('siswas')->cascadeOnDelete();
            $table->foreignId('kelas_id')
                ->comment('FK ke kelas.id. Kelas siswa saat absensi dicatat')
                ->constrained('kelas')->cascadeOnDelete();
            $table->foreignId('jadwal_id')->nullable()
                ->comment('FK ke jadwals.id. NULL jika absensi harian umum (bukan per mapel)')
                ->constrained('jadwals')->nullOnDelete();
            $table->foreignId('plot_id')->nullable()
                ->comment('FK ke plot_guru_mapels.id. Diisi untuk absensi per mapel')
                ->constrained('plot_guru_mapels')->nullOnDelete();
            $table->foreignId('tahun_ajaran_id')->nullable()
                ->comment('FK ke tahun_ajarans.id. Denormalisasi untuk query rekap per tahun')
                ->constrained('tahun_ajarans')->nullOnDelete();
            $table->foreignId('semester_id')->nullable()
                ->comment('FK ke semesters.id. Denormalisasi untuk query rekap per semester')
                ->constrained('semesters')->nullOnDelete();
            $table->date('tanggal')->comment('Tanggal absensi dicatat. Format: YYYY-MM-DD');
            $table->enum('status', ['Hadir', 'Sakit', 'Izin', 'Alpa'])->default('Hadir')
                ->comment('Hadir=masuk, Sakit=ada surat dokter, Izin=izin resmi, Alpa=tanpa keterangan');
            $table->text('keterangan')->nullable()->comment('Contoh: Sakit demam, Izin mengurus KK, dll');
            $table->foreignId('dicatat_oleh')->nullable()
                ->comment('FK ke users.id. Guru/wali kelas yang mencatat absensi')
                ->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();

            $table->unique(['siswa_id', 'kelas_id', 'jadwal_id', 'tanggal'], 'uq_absensi_siswa_jadwal_tgl');
            $table->index(['kelas_id', 'tanggal'], 'idx_abs_kelas_tgl');
            $table->index('tanggal', 'idx_abs_tanggal');
            $table->index('semester_id', 'idx_abs_semester');
            $table->index('status', 'idx_abs_status');
            $table->index(['siswa_id', 'semester_id', 'status'], 'idx_abs_siswa_smt');
        });

        // ── NILAIS ───────────────────────────────────────────────────
        Schema::create('nilais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->comment('FK ke siswas.id')->constrained('siswas')->cascadeOnDelete();
            $table->foreignId('plot_id')
                ->comment('FK ke plot_guru_mapels.id. Tau nilai dari guru siapa, mapel apa, kelas apa')
                ->constrained('plot_guru_mapels')->cascadeOnDelete();
            $table->foreignId('komponen_id')->nullable()
                ->comment('FK ke komponen_penilaians.id. Komponen apa (Formatif/Sumatif/PTS/Sikap/dll)')
                ->constrained('komponen_penilaians')->nullOnDelete();
            $table->foreignId('tahun_ajaran_id')
                ->comment('FK ke tahun_ajarans.id. Denormalisasi untuk query cepat')
                ->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->foreignId('semester_id')
                ->comment('FK ke semesters.id. Nilai semester berapa')
                ->constrained('semesters')->cascadeOnDelete();
            $table->decimal('nilai', 5, 2)->nullable()->comment('Nilai angka 0.00-100.00');
            $table->string('nilai_huruf', 5)->nullable()->comment('A, B, C, D atau SB, B, C, PB (Perlu Bimbingan)');
            $table->text('deskripsi')->nullable()->comment('Deskripsi kualitatif pencapaian (WAJIB Kurikulum Merdeka)');
            $table->timestamps();
            $table->softDeletes();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->unique(['siswa_id', 'plot_id', 'komponen_id', 'semester_id'], 'uq_nilai_siswa_plot_komponen_smt');
            $table->index('plot_id', 'idx_nilai_plot_id');
            $table->index('tahun_ajaran_id', 'idx_nilai_ta_id');
            $table->index('semester_id', 'idx_nilai_smt_id');
            $table->index(['siswa_id', 'semester_id'], 'idx_nilai_siswa_smt');
        });

        // ── NILAI_AKHIRS ─────────────────────────────────────────────
        Schema::create('nilai_akhirs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->comment('FK ke siswas.id')->constrained('siswas')->cascadeOnDelete();
            $table->foreignId('plot_id')
                ->comment('FK ke plot_guru_mapels.id. Tau ini nilai dari mapel apa')
                ->constrained('plot_guru_mapels')->cascadeOnDelete();
            $table->foreignId('tahun_ajaran_id')
                ->comment('FK ke tahun_ajarans.id')
                ->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->foreignId('semester_id')
                ->comment('FK ke semesters.id')
                ->constrained('semesters')->cascadeOnDelete();
            $table->decimal('nilai_angka', 5, 2)->nullable()->comment('Nilai akhir numerik 0-100. Rata-rata tertimbang dari semua komponen');
            $table->string('nilai_huruf', 5)->nullable()->comment('A(90-100), B(80-89), C(70-79), D(<70)');
            $table->enum('predikat', ['A', 'B', 'C', 'D'])->nullable()
                ->comment('A=Sangat Baik, B=Baik, C=Cukup, D=Perlu Bimbingan');
            $table->text('deskripsi')->nullable()->comment('Deskripsi pencapaian final untuk rapor (Kurikulum Merdeka)');
            $table->timestamps();

            $table->unique(['siswa_id', 'plot_id', 'semester_id'], 'uq_nilaiakhir_siswa_plot_smt');
            $table->index('tahun_ajaran_id', 'idx_nilaiakhir_ta');
            $table->index('semester_id', 'idx_nilaiakhir_smt');
            $table->index(['siswa_id', 'semester_id'], 'idx_nilaiakhir_siswa');
        });

        // ── RAPORS ───────────────────────────────────────────────────
        Schema::create('rapors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->comment('FK ke siswas.id')->constrained('siswas')->cascadeOnDelete();
            $table->foreignId('kelas_id')->nullable()
                ->comment('FK ke kelas.id. Snapshot kelas siswa saat rapor diterbitkan')
                ->constrained('kelas')->nullOnDelete();
            $table->foreignId('tahun_ajaran_id')
                ->comment('FK ke tahun_ajarans.id')
                ->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->foreignId('semester_id')
                ->comment('FK ke semesters.id. Rapor semester mana')
                ->constrained('semesters')->cascadeOnDelete();
            $table->foreignId('wali_kelas_id')->nullable()
                ->comment('FK ke gurus.id. Wali kelas yang finalisasi dan tanda tangan')
                ->constrained('gurus')->nullOnDelete();
            $table->unsignedSmallInteger('total_hadir')->nullable()->comment('Total hari hadir semester ini');
            $table->unsignedSmallInteger('total_sakit')->nullable()->comment('Total hari tidak masuk dengan keterangan sakit');
            $table->unsignedSmallInteger('total_izin')->nullable()->comment('Total hari tidak masuk dengan izin resmi');
            $table->unsignedSmallInteger('total_alpa')->nullable()->comment('Total hari tidak masuk tanpa keterangan');
            $table->text('catatan_wali')->nullable()->comment('Catatan wali kelas untuk orang tua');
            $table->text('deskripsi_sikap_spiritual')->nullable()->comment('Penilaian sikap spiritual (KI-1). Wajib K13 dan Merdeka');
            $table->text('deskripsi_sikap_sosial')->nullable()->comment('Penilaian sikap sosial (KI-2). Wajib K13 dan Merdeka');
            $table->enum('status', ['draft', 'final'])->default('draft')
                ->comment('draft=masih bisa diedit, final=sudah dikunci dan bisa dicetak');
            $table->enum('status_kenaikan', ['Naik Kelas', 'Tinggal Kelas', 'Lulus', 'Tidak Lulus'])->nullable()
                ->comment('Diisi saat rapor semester genap');
            $table->timestamp('finalisasi_at')->nullable()->comment('Kapan rapor difinalisasi');
            $table->foreignId('finalisasi_oleh')->nullable()
                ->comment('FK ke users.id. Siapa yang finalisasi (wali kelas atau kepsek)')
                ->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['siswa_id', 'semester_id'], 'uq_rapor_siswa_smt');
            $table->index('tahun_ajaran_id', 'idx_rapor_ta');
            $table->index('kelas_id', 'idx_rapor_kelas');
            $table->index('status', 'idx_rapor_status');
        });

        // ── CATATAN_WALIS ────────────────────────────────────────────
        Schema::create('catatan_walis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')
                ->comment('FK ke siswas.id. Siswa yang dicatat')
                ->constrained('siswas')->cascadeOnDelete();
            $table->foreignId('guru_id')
                ->comment('FK ke gurus.id. Wali kelas/guru yang membuat catatan')
                ->constrained('gurus')->cascadeOnDelete();
            $table->foreignId('tahun_ajaran_id')->nullable()
                ->comment('FK ke tahun_ajarans.id')
                ->constrained('tahun_ajarans')->nullOnDelete();
            $table->foreignId('semester_id')->nullable()
                ->comment('FK ke semesters.id')
                ->constrained('semesters')->nullOnDelete();
            $table->date('tanggal')->comment('Tanggal catatan dibuat');
            $table->enum('jenis', ['akademik', 'perilaku', 'kesehatan', 'kehadiran', 'prestasi', 'lainnya'])
                ->default('akademik')->comment('akademik=nilai/belajar, perilaku=sikap, kesehatan, dll');
            $table->text('isi')->comment('Isi catatan lengkap dari wali kelas');
            $table->timestamps();
            $table->softDeletes();

            $table->index('siswa_id', 'idx_catwali_siswa_id');
            $table->index('guru_id', 'idx_catwali_guru_id');
            $table->index('semester_id', 'idx_catwali_smt');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catatan_walis');
        Schema::dropIfExists('rapors');
        Schema::dropIfExists('nilai_akhirs');
        Schema::dropIfExists('nilais');
        Schema::dropIfExists('absensis');
    }
};
