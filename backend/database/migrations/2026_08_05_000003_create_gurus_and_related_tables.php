<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── GURUS ────────────────────────────────────────────────────
        Schema::create('gurus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()
                ->comment('NULL jika guru belum punya akun login')
                ->constrained('users')->nullOnDelete();
            $table->string('nuptk', 16)->nullable()->unique('uq_gurus_nuptk')->comment('Nomor Unik PTK Kemdikbud 16 digit');
            $table->string('nip', 18)->nullable()->unique('uq_gurus_nip')->comment('NIP PNS 18 digit. NULL untuk GTY/GTT/Honor');
            $table->string('nip_lama', 9)->nullable()->comment('NIP lama 9 digit (sebelum 2004)');
            $table->string('no_karpeg', 20)->nullable()->comment('Nomor Kartu Pegawai PNS');
            $table->string('no_karis_karsu', 20)->nullable()->comment('Kartu Isteri/Suami PNS');
            $table->string('nik', 16)->nullable()->unique('uq_gurus_nik')->comment('NIK 16 digit dari KTP. Wajib Dapodik');
            $table->string('no_kk', 16)->nullable()->comment('Nomor Kartu Keluarga 16 digit');
            $table->string('nama', 150)->comment('Nama lengkap sesuai KTP/ijazah tanpa gelar');
            $table->string('gelar_depan', 30)->nullable()->comment('Gelar depan nama: Prof., Dr., Drs., H., dll');
            $table->string('gelar_belakang', 30)->nullable()->comment('Gelar belakang: S.Pd., M.Pd., Ph.D., dll');
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable()->comment('L=Laki-laki, P=Perempuan');
            $table->string('tempat_lahir', 100)->nullable()->comment('Kota/kabupaten tempat lahir sesuai KTP');
            $table->date('tanggal_lahir')->nullable();
            $table->enum('golongan_darah', ['A', 'B', 'AB', 'O', '-'])->default('-')->comment('- = tidak diketahui');
            $table->enum('agama', ['Islam', 'Kristen Protestan', 'Kristen Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'])->nullable();
            $table->string('nama_ibu_kandung', 150)->nullable()->comment('Dipakai untuk verifikasi identitas');
            $table->string('alamat_jalan', 255)->nullable()->comment('Nama jalan, nomor rumah, RT/RW');
            $table->string('rt', 4)->nullable();
            $table->string('rw', 4)->nullable();
            $table->string('dusun', 100)->nullable()->comment('Nama dusun/kampung');
            $table->string('desa_kelurahan', 100)->nullable();
            $table->string('kecamatan', 100)->nullable();
            $table->string('kota_kabupaten', 100)->nullable();
            $table->string('provinsi', 100)->nullable();
            $table->string('kode_pos', 10)->nullable();
            $table->string('no_hp', 20)->nullable()->comment('Nomor HP/WA aktif');
            $table->string('no_wa', 20)->nullable()->comment('Nomor WhatsApp (bisa beda dengan no_hp)');
            $table->string('email', 150)->nullable()->unique('uq_gurus_email')->comment('Email aktif guru');
            $table->string('kewarganegaraan', 30)->default('WNI')->comment('WNI atau WNA');
            $table->enum('status_hidup', ['Aktif', 'Meninggal'])->default('Aktif');
            $table->string('jenis_ptk', 50)->nullable()->comment('Jenis PTK Dapodik: Guru Kelas|Guru Mapel|Kepsek|Tendik|Guru BK');
            $table->enum('status_kepegawaian', ['PNS', 'PPPK', 'GTY', 'GTT', 'Honorer', 'Lainnya'])->nullable();
            $table->boolean('status_aktif')->default(true)->comment('1=Masih aktif mengajar');
            $table->enum('status_keaktifan', ['Aktif', 'Cuti', 'Pensiun', 'Mutasi', 'Keluar'])->default('Aktif');
            $table->date('tanggal_bergabung')->nullable()->comment('Tanggal pertama masuk mengajar');
            $table->date('tmt_pns')->nullable()->comment('Tanggal Mulai Tugas sebagai PNS');
            $table->date('tmt_gty')->nullable()->comment('Tanggal Mulai Tugas sebagai GTY');
            $table->string('no_sk_pengangkatan', 80)->nullable()->comment('Nomor SK pengangkatan pertama');
            $table->date('tgl_sk_pengangkatan')->nullable();
            $table->string('instansi_pengangkat', 150)->nullable()->comment('Kemenag, Yayasan, dll');
            $table->unsignedTinyInteger('masa_kerja_tahun')->nullable()->comment('Masa kerja dalam tahun (diupdate berkala)');
            $table->string('foto', 255)->nullable()->comment('Path foto guru');
            $table->boolean('is_verified')->default(false)->comment('1=Data sudah diverifikasi Operator/Kepsek');
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes()->comment('Guru resign/pensiun tidak di-hard delete');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

            $table->index('user_id', 'idx_gurus_user_id');
            $table->index('nama', 'idx_gurus_nama');
            $table->index('status_aktif', 'idx_gurus_status');
            $table->index('deleted_at', 'idx_gurus_deleted');
        });

        // ── GURU_JABATANS ────────────────────────────────────────────
        Schema::create('guru_jabatans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->comment('FK ke gurus.id')->constrained('gurus')->cascadeOnDelete();
            $table->string('jenis_jabatan', 20)->nullable();
            $table->string('jenis_pengangkatan', 50)->nullable();
            $table->string('jabatan', 100)->comment('Guru Kelas|Wali Kelas|Kepala Sekolah|Bendahara BOS|...');
            $table->string('unit_kerja', 150)->nullable();
            $table->string('instansi_pengangkat', 150)->nullable();
            $table->string('golongan', 10)->nullable()->comment('I/A, II/A, III/A, III/B, IV/A, dll');
            $table->string('pangkat', 60)->nullable()->comment('Pengatur, Penata Muda, Pembina, dll');
            $table->string('status_kepegawaian', 20)->nullable();
            $table->string('no_sk', 80)->nullable()->comment('Nomor SK pengangkatan jabatan');
            $table->string('pejabat_penandatangan', 100)->nullable();
            $table->date('tanggal_sk')->nullable();
            $table->date('tmt_jabatan')->nullable()->comment('Tanggal Mulai Tugas efektif');
            $table->date('tanggal_selesai')->nullable()->comment('NULL jika masih menjabat');
            $table->string('alasan_berakhir', 50)->nullable();
            $table->text('uraian_tugas')->nullable();
            $table->date('masa_berlaku')->nullable();
            $table->boolean('is_current')->default(false)->comment('1=Jabatan aktif sekarang');
            $table->string('status_jabatan', 30)->nullable();
            $table->timestamps();
            $table->softDeletes()->comment('Riwayat jabatan tidak boleh dihapus permanen');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->index('guru_id', 'idx_gurujab_guru_id');
            $table->index(['guru_id', 'is_current'], 'idx_gurujab_current');
        });

        // ── GURU_PENDIDIKANS ─────────────────────────────────────────
        Schema::create('guru_pendidikans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->comment('FK ke gurus.id')->constrained('gurus')->cascadeOnDelete();
            $table->enum('jenjang', ['SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3', 'Lainnya'])
                ->comment('Jenjang pendidikan formal sesuai kode Dapodik');
            $table->string('nama_sekolah', 200)->comment('Nama lengkap sekolah/universitas');
            $table->string('jurusan', 150)->nullable()->comment('Jurusan/program studi (untuk SMA/SMK)');
            $table->string('prodi', 150)->nullable()->comment('Program studi lengkap (D1-S3)');
            $table->year('tahun_masuk')->nullable();
            $table->year('tahun_lulus')->comment('Dipakai untuk hitung masa kerja dan kualifikasi');
            $table->string('no_ijazah', 60)->nullable()->comment('Nomor ijazah asli');
            $table->string('file_ijazah', 255)->nullable()->comment('Path scan ijazah yang diupload');
            $table->timestamps();
            $table->softDeletes();

            $table->index('guru_id', 'idx_gurupend_guru_id');
        });

        // ── GURU_SERTIFIKASIS ────────────────────────────────────────
        Schema::create('guru_sertifikasis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->comment('FK ke gurus.id')->constrained('gurus')->cascadeOnDelete();
            $table->string('jenis_sertifikasi', 80)->comment('Jalur: PPG|PLPG|Portofolio|PPG Dalam Jabatan|PPG Prajabatan');
            $table->string('no_sertifikat', 60)->comment('Nomor sertifikat pendidik dari LPTK');
            $table->string('nrg', 20)->nullable()->comment('Nomor Registrasi Guru Kemdikbud untuk klaim tunjangan');
            $table->year('tahun_sertifikasi')->comment('Tahun lulus/mendapat sertifikasi');
            $table->string('lptk', 200)->nullable()->comment('Nama LPTK penyelenggara');
            $table->string('bidang_studi', 150)->nullable()->comment('Bidang studi yang tersertifikasi');
            $table->string('file_sertifikat', 255)->nullable()->comment('Path scan sertifikat yang diupload');
            $table->date('tanggal_terbit')->nullable();
            $table->date('expired_at')->nullable()->comment('NULL = tidak expire');
            $table->timestamps();
            $table->softDeletes();

            $table->index('guru_id', 'idx_gurucert_guru_id');
        });

        // ── GURU_INPASSINGS ──────────────────────────────────────────
        Schema::create('guru_inpassings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')
                ->comment('FK ke gurus.id. Guru non-PNS yang mendapat inpassing')
                ->constrained('gurus')->cascadeOnDelete();
            $table->string('no_sk', 100)->comment('Nomor SK Inpassing dari Dirjen GTK Kemenag/Kemdikbud');
            $table->date('tanggal_sk')->comment('Tanggal SK inpassing diterbitkan');
            $table->date('tmt_inpassing')->comment('Tanggal Mulai Tugas berlaku efektif');
            $table->string('golongan_sesudah', 10)->comment('Golongan setelah inpassing: III/A, III/B, dll');
            $table->string('jabatan_fungsional', 80)->default('Guru Pertama')
                ->comment('Guru Pertama|Guru Muda|Guru Madya|Guru Utama');
            $table->string('angka_kredit', 20)->nullable()->comment('Angka kredit ditetapkan dalam SK');
            $table->string('file_sk', 255)->nullable()->comment('Path scan SK inpassing yang diupload');
            $table->timestamps();
            $table->softDeletes();

            $table->index('guru_id', 'idx_guruinp_guru_id');
        });

        // ── GURU_DIKLATS ─────────────────────────────────────────────
        Schema::create('guru_diklats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->comment('FK ke gurus.id')->constrained('gurus')->cascadeOnDelete();
            $table->string('nama_diklat', 200)->comment('Nama lengkap pelatihan/diklat yang diikuti');
            $table->string('penyelenggara', 150)->nullable()->comment('Kemenag, Kemdikbud, P4TK, LPMP, Yayasan, dll');
            $table->enum('jenis', ['diklat', 'bimtek', 'workshop', 'seminar', 'pelatihan', 'kursus'])->default('diklat');
            $table->enum('tingkat', ['Kecamatan', 'Kabupaten/Kota', 'Provinsi', 'Nasional', 'Internasional'])->nullable();
            $table->date('tanggal_mulai')->nullable();
            $table->date('tanggal_selesai')->nullable();
            $table->unsignedSmallInteger('jumlah_jam')->nullable()->comment('Total jam kegiatan (JP @45 menit)');
            $table->string('no_sertifikat', 100)->nullable()->comment('Nomor sertifikat keikutsertaan');
            $table->enum('peran', ['peserta', 'narasumber', 'panitia', 'moderator'])->default('peserta');
            $table->string('file_sertifikat', 255)->nullable()->comment('Path scan sertifikat/piagam');
            $table->text('keterangan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('guru_id', 'idx_gurudiklat_guru_id');
        });

        // ── GURU_KELUARGAS ───────────────────────────────────────────
        Schema::create('guru_keluargas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')
                ->comment('FK ke gurus.id. One-to-one')
                ->constrained('gurus')->cascadeOnDelete();
            $table->enum('status_perkawinan', ['Belum Menikah', 'Menikah', 'Cerai Hidup', 'Cerai Mati'])->nullable();
            $table->string('nama_pasangan', 150)->nullable()->comment('NULL jika belum/tidak menikah');
            $table->string('nik_pasangan', 16)->nullable()->comment('NIK suami/istri dari KTP');
            $table->string('pekerjaan_pasangan', 100)->nullable();
            $table->unsignedTinyInteger('jumlah_anak')->default(0)->comment('Jumlah anak kandung yang masih tanggungan');
            $table->timestamps();

            $table->index('guru_id', 'idx_gurukel_guru_id');
        });

        // ── GURU_ANAKS ───────────────────────────────────────────────
        Schema::create('guru_anaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->comment('FK ke gurus.id')->constrained('gurus')->cascadeOnDelete();
            $table->string('nama', 150)->comment('Nama lengkap anak');
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->unsignedTinyInteger('urutan')->default(1)->comment('Anak ke-1, ke-2, dst');
            $table->string('keterangan', 255)->nullable();
            $table->timestamps();

            $table->index('guru_id', 'idx_guruanak_guru_id');
        });

        // ── GURU_KOMPETENSI ──────────────────────────────────────────
        Schema::create('guru_kompetensi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->comment('FK ke gurus.id')->constrained('gurus')->cascadeOnDelete();
            $table->enum('jenis', ['bahasa', 'it', 'bidang_keahlian', 'lainnya'])->comment('Jenis kompetensi');
            $table->string('nama', 150)->comment('Nama kompetensi: Bahasa Inggris, Microsoft Excel, dll');
            $table->enum('tingkat', ['Dasar', 'Menengah', 'Mahir', 'Ahli'])->nullable()->comment('Tingkat kemampuan');
            $table->string('keterangan', 255)->nullable();
            $table->timestamps();

            $table->index('guru_id', 'idx_gurukomp_guru_id');
        });

        // ── GURU_KONTAK_DARURAT ──────────────────────────────────────
        Schema::create('guru_kontak_darurat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->comment('FK ke gurus.id')->constrained('gurus')->cascadeOnDelete();
            $table->string('nama', 150)->comment('Nama kontak darurat');
            $table->string('hubungan', 50)->comment('Istri, Suami, Orang Tua, Saudara, dll');
            $table->string('no_hp', 20)->comment('Nomor HP yang bisa dihubungi');
            $table->string('alamat', 255)->nullable();
            $table->boolean('is_primary')->default(true)->comment('1=Kontak utama');
            $table->timestamps();

            $table->index('guru_id', 'idx_gurukontakdrt_guru_id');
        });

        // ── GURU_REKENINGS ───────────────────────────────────────────
        Schema::create('guru_rekenings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->comment('FK ke gurus.id')->constrained('gurus')->cascadeOnDelete();
            $table->string('nama_bank', 60)->comment('BRI, BNI, Mandiri, BSI, BTN, dll');
            $table->string('no_rekening', 30)->comment('Nomor rekening tujuan transfer gaji');
            $table->string('atas_nama', 150)->nullable()->comment('Nama pemilik rekening sesuai buku tabungan');
            $table->string('cabang', 100)->nullable()->comment('Cabang bank tempat rekening dibuka');
            $table->string('npwp', 20)->nullable()->comment('NPWP untuk PPh 21');
            $table->string('no_bpjs_kesehatan', 30)->nullable()->comment('Nomor BPJS Kesehatan 13 digit');
            $table->string('no_bpjs_ketenagakerjaan', 30)->nullable()->comment('Nomor BPJS Ketenagakerjaan');
            $table->decimal('gaji_pokok', 15, 2)->default(0)->comment('Gaji pokok sesuai golongan/SK yayasan');
            $table->decimal('tunjangan_fungsional', 15, 2)->default(0)->comment('Tunjangan jabatan fungsional guru');
            $table->decimal('tunjangan_profesi', 15, 2)->default(0)->comment('Tunjangan sertifikasi/profesi per bulan');
            $table->boolean('is_primary')->default(true)->comment('1=Rekening utama penerima gaji');
            $table->timestamps();
            $table->softDeletes();

            $table->index('guru_id', 'idx_guruerek_guru_id');
        });

        // ── GURU_MUTASI ──────────────────────────────────────────────
        Schema::create('guru_mutasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->comment('FK ke gurus.id')->constrained('gurus')->cascadeOnDelete();
            $table->enum('jenis_mutasi', ['Masuk', 'Keluar', 'Internal', 'Penugasan Sementara', 'Kembali Bertugas']);
            $table->enum('jenis_keluar', [
                'Pindah Sekolah', 'Mengundurkan Diri', 'Pensiun',
                'Kontrak Berakhir', 'Meninggal Dunia', 'PHK', 'Lainnya',
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
                ->comment('True jika mutasi sudah memengaruhi modul lain');
            $table->timestamps();
            $table->softDeletes();

            $table->index('guru_id', 'idx_gurumutasi_guru_id');
        });

        // ── GURU_CUTI ────────────────────────────────────────────────
        Schema::create('guru_cuti', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->constrained('gurus')->cascadeOnDelete();
            $table->enum('jenis_cuti', [
                'Cuti Tahunan', 'Cuti Sakit', 'Cuti Bersalin',
                'Cuti Alasan Penting', 'Cuti Besar', 'Lainnya',
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

        // ── GURU_ABSENSIS ────────────────────────────────────────────
        Schema::create('guru_absensis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->comment('FK ke gurus.id')->constrained('gurus')->cascadeOnDelete();
            $table->date('tanggal')->comment('Satu guru satu record per hari');
            $table->time('jam_masuk')->nullable()->comment('Jam datang/check-in');
            $table->time('jam_pulang')->nullable()->comment('Jam pulang/check-out');
            $table->enum('status', ['Hadir', 'Izin', 'Sakit', 'Alpa', 'Cuti', 'Dinas Luar'])->default('Hadir');
            $table->text('keterangan')->nullable()->comment('Nama kegiatan dinas luar, surat dokter, dll');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['guru_id', 'tanggal'], 'uq_guruabs_guru_tgl');
            $table->index('tanggal', 'idx_guruabs_tanggal');
        });

        // ── GURU_PKGS ────────────────────────────────────────────────
        Schema::create('guru_pkgs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->comment('FK ke gurus.id')->constrained('gurus')->cascadeOnDelete();
            $table->foreignId('tahun_ajaran_id')->nullable()
                ->comment('FK ke tahun_ajarans.id')
                ->constrained('tahun_ajarans')->nullOnDelete();
            $table->foreignId('semester_id')->nullable()
                ->comment('FK ke semesters.id')
                ->constrained('semesters')->nullOnDelete();
            $table->decimal('nilai', 5, 2)->nullable()->comment('Nilai PKG 0.00–100.00');
            $table->enum('predikat', ['Amat Baik', 'Baik', 'Cukup', 'Sedang', 'Kurang'])->nullable();
            $table->text('catatan')->nullable()->comment('Catatan dari kepala sekolah');
            $table->foreignId('dinilai_oleh')->nullable()
                ->comment('FK ke users.id (kepala sekolah)')
                ->constrained('users')->nullOnDelete();
            $table->date('tanggal_penilaian')->nullable();
            $table->timestamps();

            $table->unique(['guru_id', 'tahun_ajaran_id', 'semester_id'], 'uq_guru_pkg_ta_sem');
            $table->index('guru_id', 'idx_gurupkg_guru_id');
        });

        // ── GURU_DOKUMENS ────────────────────────────────────────────
        Schema::create('guru_dokumens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->comment('FK ke gurus.id')->constrained('gurus')->cascadeOnDelete();
            $table->enum('kategori', ['identitas', 'kepegawaian', 'pendidikan', 'sertifikasi', 'penghargaan', 'lainnya'])
                ->comment('Kategori dokumen untuk pengelompokan di UI');
            $table->string('nama_dokumen', 200)->comment('Nama deskriptif: SK Pengangkatan GTY 2019, Ijazah S1 UIN 2010');
            $table->string('nomor_dokumen', 100)->nullable()->comment('Nomor surat/dokumen resmi');
            $table->date('tanggal_dokumen')->nullable()->comment('Tanggal terbit/pengesahan');
            $table->date('tanggal_berlaku')->nullable()->comment('NULL = berlaku dari tanggal terbit');
            $table->date('tanggal_kadaluarsa')->nullable()->comment('NULL = berlaku selamanya');
            $table->string('penerbit', 150)->nullable()->comment('Kemenag, Kemdikbud, BKN, LPTK, dll');
            $table->string('file_path', 255)->comment('Path file dokumen yang diupload');
            $table->string('file_type', 20)->nullable()->comment('MIME type: application/pdf, image/jpeg, dll');
            $table->unsignedInteger('file_size')->nullable()->comment('Ukuran file dalam bytes');
            $table->string('file_hash', 64)->nullable();
            $table->string('original_filename', 255)->nullable();
            $table->boolean('is_verified')->default(false)->comment('1=Sudah diverifikasi operator/kepsek');
            $table->enum('status', [
                'belum_upload', 'menunggu_review', 'disetujui',
                'ditolak', 'perlu_revisi', 'kadaluarsa',
            ])->default('menunggu_review');
            $table->string('jenis_dokumen', 80)->nullable();
            $table->unsignedTinyInteger('versi')->default(1);
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('guru_id', 'idx_gurudok_guru_id');
            $table->index(['guru_id', 'status'], 'guru_dokumens_guru_id_status_index');
            $table->index(['guru_id', 'kategori', 'jenis_dokumen'], 'guru_dokumens_guru_id_kategori_jenis_dokumen_index');
            $table->index('tanggal_kadaluarsa', 'guru_dokumens_tanggal_kadaluarsa_index');
        });

        // ── GURU_DOKUMEN_LOGS ────────────────────────────────────────
        Schema::create('guru_dokumen_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_dokumen_id')->constrained('guru_dokumens')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('aksi', [
                'upload', 'replace', 'download', 'preview',
                'approve', 'reject', 'revisi', 'delete', 'restore',
            ]);
            $table->text('keterangan')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['guru_dokumen_id', 'aksi'], 'guru_dokumen_logs_guru_dokumen_id_aksi_index');
            $table->index('user_id', 'guru_dokumen_logs_user_id_index');
        });

        // ── GURU_DOKUMEN_VERSIONS ────────────────────────────────────
        Schema::create('guru_dokumen_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_dokumen_id')->constrained('guru_dokumens')->cascadeOnDelete();
            $table->unsignedTinyInteger('versi');
            $table->string('file_path', 500);
            $table->string('file_type', 100)->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('file_hash', 64)->nullable();
            $table->string('original_filename', 255)->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->unique(['guru_dokumen_id', 'versi'], 'guru_dokumen_versions_guru_dokumen_id_versi_unique');
            $table->index('guru_dokumen_id', 'guru_dokumen_versions_guru_dokumen_id_index');
        });

        // ── GURU_IMPORT_LOGS ─────────────────────────────────────────
        Schema::create('guru_import_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('batch_id', 36)->unique('guru_import_logs_batch_id_unique')->comment('UUID unik per sesi import');
            $table->enum('tipe', ['excel', 'zip', 'backup_restore'])->default('excel');
            $table->string('nama_file', 255)->nullable();
            $table->enum('status', ['pending', 'preview', 'processing', 'done', 'failed', 'rolled_back'])->default('pending');
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
        Schema::dropIfExists('guru_import_logs');
        Schema::dropIfExists('guru_dokumen_versions');
        Schema::dropIfExists('guru_dokumen_logs');
        Schema::dropIfExists('guru_dokumens');
        Schema::dropIfExists('guru_pkgs');
        Schema::dropIfExists('guru_absensis');
        Schema::dropIfExists('guru_cuti');
        Schema::dropIfExists('guru_mutasi');
        Schema::dropIfExists('guru_rekenings');
        Schema::dropIfExists('guru_kontak_darurat');
        Schema::dropIfExists('guru_kompetensi');
        Schema::dropIfExists('guru_anaks');
        Schema::dropIfExists('guru_keluargas');
        Schema::dropIfExists('guru_diklats');
        Schema::dropIfExists('guru_inpassings');
        Schema::dropIfExists('guru_sertifikasis');
        Schema::dropIfExists('guru_pendidikans');
        Schema::dropIfExists('guru_jabatans');
        Schema::dropIfExists('gurus');
    }
};
