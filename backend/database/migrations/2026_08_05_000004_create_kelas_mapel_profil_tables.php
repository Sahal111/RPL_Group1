<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // ── MAPELS ───────────────────────────────────────────────────
        Schema::create('mapels', function (Blueprint $table) {

            $table->id();
            $table->foreignId('school_id')->nullable()
                ->comment('FK ke schools.id')
                ->constrained('schools')->cascadeOnDelete();

            $table->string('kode', 20)->nullable()->unique('uq_mapels_kode')->comment('Kode resmi Dapodik/EMIS: PAI001, MTK001');
            $table->string('nama_mapel', 150)->comment('Nama lengkap mata pelajaran sesuai kurikulum');
            $table->enum('kelompok', [
                'A - Wajib',
                'B - Wajib',
                'C - Muatan Lokal',
                'Pengembangan Diri',
                'Ekstrakurikuler',
                'Lainnya',
            ])->nullable();
            $table->string('tingkat', 20)->nullable()->comment('Tingkat yang pakai mapel ini. NULL=semua. Multi: "1,3,5"');
            $table->enum('kurikulum', ['Kurikulum 2013', 'Kurikulum Merdeka', 'Keduanya'])->default('Kurikulum 2013');
            $table->unsignedTinyInteger('jam_per_minggu')->nullable()->comment('JP per minggu untuk validasi jadwal');
            $table->boolean('is_active')->default(true)->comment('1=Aktif dipakai');
            $table->unsignedTinyInteger('urutan_rapor')->nullable()->comment('Nomor urut tampil di rapor');
            $table->timestamps();

            $table->index('tingkat', 'idx_mapels_tingkat');
            $table->index('is_active', 'idx_mapels_aktif');
        });

        // ── KELAS ────────────────────────────────────────────────────
        Schema::create('kelas', function (Blueprint $table) {

            $table->id();
            $table->foreignId('school_id')->nullable()
                ->comment('FK ke schools.id')
                ->constrained('schools')->cascadeOnDelete();

            $table->foreignId('tahun_ajaran_id')
                ->comment('FK ke tahun_ajarans.id')
                ->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->foreignId('semester_id')->nullable()
                ->comment('FK ke semesters.id')
                ->constrained('semesters')->nullOnDelete();
            $table->string('nama_kelas', 20)->comment('Nama kelas: 1-A, 2-B, 3-A, dst');
            $table->unsignedTinyInteger('tingkat')->comment('Tingkat kelas: 1-6 untuk MI/SD');
            $table->enum('kurikulum', ['K13', 'Merdeka', 'Lainnya'])->default('Merdeka');
            $table->foreignId('wali_kelas_id')->nullable()
                ->comment('FK ke gurus.id. Shortcut wali kelas aktif')
                ->constrained('gurus')->nullOnDelete();
            $table->unsignedTinyInteger('kapasitas')->default(32)->comment('Kapasitas maksimal siswa per kelas');
            $table->string('ruangan', 50)->nullable()->comment('Nama/kode ruang kelas');
            $table->boolean('is_active')->default(true)->comment('1=Kelas aktif semester ini');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tahun_ajaran_id', 'nama_kelas'], 'uq_kelas_ta_nama');
            $table->index('tahun_ajaran_id', 'idx_kelas_ta');
            $table->index('tingkat', 'idx_kelas_tingkat');
            $table->index('wali_kelas_id', 'idx_kelas_walikelas');
        });

        // ── WALI_KELAS ───────────────────────────────────────────────
        Schema::create('wali_kelas', function (Blueprint $table) {

            $table->id();
            $table->foreignId('school_id')->nullable()
                ->comment('FK ke schools.id')
                ->constrained('schools')->cascadeOnDelete();

            $table->foreignId('guru_id')
                ->comment('FK ke gurus.id. Guru ditugaskan sebagai wali kelas')
                ->constrained('gurus')->cascadeOnDelete();
            $table->foreignId('kelas_id')
                ->comment('FK ke kelas.id. Kelas yang dibina')
                ->constrained('kelas');
            $table->foreignId('tahun_ajaran_id')
                ->comment('FK ke tahun_ajarans.id')
                ->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->foreignId('semester_id')->nullable()
                ->comment('FK ke semesters.id. NULL=setahun penuh')
                ->constrained('semesters')->nullOnDelete();
            $table->string('no_sk', 80)->nullable()->comment('Nomor SK penugasan wali kelas dari kepsek');
            $table->date('tanggal_sk')->nullable();
            $table->date('tmt')->nullable()->comment('Tanggal Mulai Tugas wali kelas efektif');
            $table->boolean('is_active')->default(true)->comment('1=Penugasan masih aktif');
            $table->timestamps();

            $table->unique(['kelas_id', 'tahun_ajaran_id'], 'uq_walikelas_kelas_ta');
            $table->index('guru_id', 'idx_walikelas_guru_id');
        });

        // ── PLOT_GURU_MAPELS ─────────────────────────────────────────
        Schema::create('plot_guru_mapels', function (Blueprint $table) {

            $table->id();
            $table->foreignId('school_id')->nullable()
                ->comment('FK ke schools.id')
                ->constrained('schools')->cascadeOnDelete();

            $table->foreignId('guru_id')
                ->comment('FK ke gurus.id. Guru yang bertugas mengajar')
                ->constrained('gurus')->cascadeOnDelete();
            $table->foreignId('mapel_id')
                ->comment('FK ke mapels.id. Mata pelajaran yang diajar')
                ->constrained('mapels')->cascadeOnDelete();
            $table->foreignId('kelas_id')
                ->comment('FK ke kelas.id. Kelas tempat mengajar')
                ->constrained('kelas')->cascadeOnDelete();
            $table->foreignId('tahun_ajaran_id')
                ->comment('FK ke tahun_ajarans.id')
                ->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->foreignId('semester_id')
                ->comment('FK ke semesters.id')
                ->constrained('semesters')->cascadeOnDelete();
            $table->unsignedTinyInteger('beban_jam')->default(0)->comment('Beban mengajar dalam jam/minggu');
            $table->boolean('is_active')->default(true)->comment('1=Penugasan aktif');
            $table->timestamps();

            $table->unique(['guru_id', 'mapel_id', 'kelas_id', 'semester_id'], 'uq_plot_guru_mapel_kelas');
            $table->index('mapel_id', 'idx_plot_mapel_id');
            $table->index('kelas_id', 'idx_plot_kelas_id');
            $table->index('tahun_ajaran_id', 'idx_plot_ta_id');
            $table->index('semester_id', 'idx_plot_smt_id');
        });

        // ── JADWALS ──────────────────────────────────────────────────
        Schema::create('jadwals', function (Blueprint $table) {

            $table->id();
            $table->foreignId('school_id')->nullable()
                ->comment('FK ke schools.id')
                ->constrained('schools')->cascadeOnDelete();

            $table->foreignId('plot_id')
                ->comment('FK ke plot_guru_mapels.id')
                ->constrained('plot_guru_mapels')->cascadeOnDelete();
            $table->foreignId('kelas_id')
                ->comment('FK ke kelas.id. Redundan tapi mempercepat query')
                ->constrained('kelas')->cascadeOnDelete();
            $table->foreignId('guru_id')
                ->comment('FK ke gurus.id. Redundan tapi mempercepat query')
                ->constrained('gurus')->cascadeOnDelete();
            $table->foreignId('mapel_id')
                ->comment('FK ke mapels.id. Redundan tapi mempercepat query')
                ->constrained('mapels')->cascadeOnDelete();
            $table->foreignId('semester_id')
                ->comment('FK ke semesters.id')
                ->constrained('semesters')->cascadeOnDelete();
            $table->enum('hari', ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);
            $table->unsignedTinyInteger('jam_ke')->nullable()->comment('Jam pelajaran ke berapa (untuk validasi tabrakan)');
            $table->time('jam_mulai')->comment('Jam mulai pelajaran HH:MM');
            $table->time('jam_selesai')->comment('Jam selesai pelajaran HH:MM');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['kelas_id', 'hari'], 'idx_jadwal_kelas_hari');
            $table->index('guru_id', 'idx_jadwal_guru_id');
            $table->index('semester_id', 'idx_jadwal_semester');
        });

        // ── BENDAHARAS ───────────────────────────────────────────────
        Schema::create('bendaharas', function (Blueprint $table) {

            $table->id();
            $table->foreignId('school_id')->nullable()
                ->comment('FK ke schools.id')
                ->constrained('schools')->cascadeOnDelete();

            $table->foreignId('user_id')
                ->comment('FK ke users.id. Akun user sebagai bendahara')
                ->constrained('users')->cascadeOnDelete();
            $table->foreignId('guru_id')->nullable()
                ->comment('FK ke gurus.id. NULL jika bendahara bukan guru aktif')
                ->constrained('gurus')->nullOnDelete();
            $table->enum('jenis_bendahara', ['BOS', 'Rutin', 'Komite', 'Umum'])->nullable()
                ->comment('BOS=kelola dana BOS, Rutin=gaji/operasional, Komite=dana komite, Umum=semua');
            $table->string('no_sk', 80)->nullable()->comment('Nomor SK pengangkatan dari Kepsek');
            $table->date('tanggal_sk')->nullable();
            $table->date('tmt')->nullable()->comment('Tanggal Mulai Tugas sebagai bendahara');
            $table->boolean('is_active')->default(true)->comment('1=Bendahara aktif menjabat');
            $table->timestamps();

            $table->index('user_id', 'idx_benda_user_id');
            $table->index('guru_id', 'idx_benda_guru_id');
        });

        // ── OPERATOR_PROFILES ────────────────────────────────────────
        Schema::create('operator_profiles', function (Blueprint $table) {

            $table->id();
            $table->foreignId('school_id')->nullable()
                ->comment('FK ke schools.id')
                ->constrained('schools')->cascadeOnDelete();

            $table->foreignId('user_id')
                ->comment('FK ke users.id. Akun user sebagai operator')
                ->constrained('users')->cascadeOnDelete();
            $table->string('nip_operator', 18)->nullable()->comment('NIP jika operator adalah PNS');
            $table->string('jabatan', 100)->nullable()->comment('Jabatan resmi: Staf TU, Kepala TU, dll');
            $table->json('akses_modul')->nullable()
                ->comment('JSON array modul yang boleh diakses: ["siswa","guru","kelas","nilai","keuangan","laporan"]');
            $table->timestamps();

            $table->index('user_id', 'idx_opprof_user_id');
        });

        // ── ADMIN_PPDB_PROFILES ──────────────────────────────────────
        Schema::create('admin_ppdb_profiles', function (Blueprint $table) {

            $table->id();
            $table->foreignId('school_id')->nullable()
                ->comment('FK ke schools.id')
                ->constrained('schools')->cascadeOnDelete();

            $table->foreignId('user_id')
                ->comment('FK ke users.id. Akun user sebagai admin PPDB')
                ->constrained('users')->cascadeOnDelete();
            $table->string('tahun_ajaran', 9)->nullable()->comment('Tahun ajaran PPDB yang dikelola: 2026/2027');
            $table->timestamps();

            $table->index('user_id', 'idx_adminppdb_user');
        });

        // ── KOMPONEN_PENILAIANS ──────────────────────────────────────
        Schema::create('komponen_penilaians', function (Blueprint $table) {

            $table->id();
            $table->foreignId('school_id')->nullable()
                ->comment('FK ke schools.id')
                ->constrained('schools')->cascadeOnDelete();

            $table->string('nama_komponen', 100)->comment('Nilai Formatif, Nilai Sumatif, PTS, PAS, Sikap Spiritual, dll');
            $table->string('kode', 10)->nullable()->comment('Kode singkat: NF, NS, PTS, PAS, PSP, PSS');
            $table->enum('jenis', ['formatif', 'sumatif', 'sikap', 'ekstrakurikuler', 'lainnya'])->default('formatif')
                ->comment('Kategori besar komponen. Dipakai untuk pengelompokan di rapor');
            $table->decimal('bobot_persentase', 5, 2)->nullable()
                ->comment('Persentase bobot dalam nilai akhir. NULL untuk sikap');
            $table->enum('kurikulum', ['K13', 'Merdeka', 'Semua'])->default('Semua');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── EKSKULS ──────────────────────────────────────────────────
        Schema::create('ekskuls', function (Blueprint $table) {

            $table->id();
            $table->foreignId('school_id')->nullable()
                ->comment('FK ke schools.id')
                ->constrained('schools')->cascadeOnDelete();

            $table->string('nama', 100)->comment('Pramuka, Tahfidz Quran, Futsal, Qosidah');
            $table->text('deskripsi')->nullable()->comment('Tujuan, jadwal, dll');
            $table->foreignId('guru_id')->nullable()
                ->comment('FK ke gurus.id. Guru pembina/penanggung jawab')
                ->constrained('gurus')->nullOnDelete();
            $table->boolean('is_active')->default(true)->comment('1=Ekskul masih aktif');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ekskuls');
        Schema::dropIfExists('komponen_penilaians');
        Schema::dropIfExists('admin_ppdb_profiles');
        Schema::dropIfExists('operator_profiles');
        Schema::dropIfExists('bendaharas');
        Schema::dropIfExists('jadwals');
        Schema::dropIfExists('plot_guru_mapels');
        Schema::dropIfExists('wali_kelas');
        Schema::dropIfExists('kelas');
        Schema::dropIfExists('mapels');
    }
};