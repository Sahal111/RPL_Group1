<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── SISWAS ───────────────────────────────────────────────────
        Schema::create('siswas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()
                ->comment('Akun login siswa. Opsional')
                ->constrained('users')->nullOnDelete();
            $table->string('nisn', 10)->nullable()->unique('uq_siswas_nisn')->comment('Nomor Induk Siswa Nasional 10 digit');
            $table->string('nis', 20)->nullable()->unique('uq_siswas_nis')->comment('Nomor Induk Siswa lokal madrasah');
            $table->string('nik', 16)->nullable()->unique('uq_siswas_nik')->comment('NIK dari KTP/KK anak. Wajib Dapodik sejak 2022');
            $table->string('no_kk', 16)->nullable()->comment('Nomor Kartu Keluarga 16 digit');
            $table->string('nama_kepala_keluarga', 150)->nullable()->comment('Nama kepala keluarga di KK');
            $table->string('kode_anak', 10)->nullable()->unique('uq_siswas_kode')
                ->comment('Kode unik 10 karakter untuk link akun ortu. Digenerate otomatis');
            $table->string('nama', 150)->comment('Nama lengkap sesuai akta kelahiran/KK tanpa singkatan');
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable();
            $table->string('tempat_lahir', 100)->nullable()->comment('Kota/kabupaten tempat lahir sesuai akta');
            $table->date('tanggal_lahir')->nullable();
            $table->enum('agama', ['Islam', 'Kristen Protestan', 'Kristen Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'])->nullable();
            $table->enum('golongan_darah', ['A', 'B', 'AB', 'O', '-'])->default('-');
            $table->enum('kewarganegaraan', ['WNI', 'WNA'])->default('WNI');
            $table->string('nama_ibu_kandung', 150)->nullable()->comment('WAJIB Dapodik. Untuk verifikasi identitas resmi');
            $table->unsignedTinyInteger('anak_ke')->nullable()->comment('Urutan anak ke berapa dalam keluarga');
            $table->unsignedTinyInteger('jumlah_saudara')->nullable()->comment('Total saudara kandung (tidak termasuk diri sendiri)');
            $table->enum('status_dalam_keluarga', ['Kandung', 'Tiri', 'Angkat'])->nullable();
            $table->enum('pembiaya_sekolah', ['Orang Tua', 'Sendiri', 'Pemerintah', 'Lembaga', 'Lainnya'])->nullable()
                ->comment('Sumber pembiayaan sekolah. Penting untuk data BOS dan beasiswa');
            $table->string('kebutuhan_khusus', 100)->nullable()
                ->comment('Kode Dapodik: Tidak Ada|A (Tuna Netra)|B (Tuna Rungu)|C (Tuna Grahita)|dll');
            $table->text('riwayat_penyakit')->nullable()->comment('Untuk penanganan darurat di sekolah');
            $table->string('imunisasi', 50)->nullable()->comment('Lengkap|Tidak Lengkap|Tidak Diketahui');
            $table->string('alamat_jalan', 255)->nullable();
            $table->string('rt', 4)->nullable();
            $table->string('rw', 4)->nullable();
            $table->string('desa_kelurahan', 100)->nullable();
            $table->string('kecamatan', 100)->nullable();
            $table->string('kota_kabupaten', 100)->nullable();
            $table->string('provinsi', 100)->nullable();
            $table->string('kode_pos', 10)->nullable();
            $table->decimal('jarak_tempat_tinggal', 5, 1)->nullable()->comment('Jarak rumah ke sekolah dalam KM');
            $table->unsignedSmallInteger('waktu_tempuh')->nullable()->comment('Waktu tempuh dari rumah ke sekolah dalam menit');
            $table->string('moda_transportasi', 50)->nullable()->comment('Jalan Kaki|Sepeda|Motor|Angkot|Mobil|dll');
            $table->string('asal_sekolah', 200)->nullable()->comment('Nama sekolah asal (TK/PAUD/RA untuk kelas 1)');
            $table->date('tanggal_masuk')->nullable()->comment('Tanggal resmi siswa diterima/masuk madrasah');
            $table->unsignedTinyInteger('tingkat')->default(1)->comment('Tingkat kelas saat ini: 1-6 untuk MI');
            $table->enum('status', ['aktif', 'nonaktif', 'mutasi_keluar', 'lulus', 'meninggal'])->default('aktif');
            $table->string('foto', 255)->nullable()->comment('Path foto siswa');
            $table->timestamps();
            $table->softDeletes()->comment('Siswa lulus/mutasi tidak dihapus agar history tetap ada');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->index('nama', 'idx_siswas_nama');
            $table->index('status', 'idx_siswas_status');
            $table->index('tingkat', 'idx_siswas_tingkat');
            $table->index('deleted_at', 'idx_siswas_deleted');
            $table->index('user_id', 'idx_siswas_user_id');
        });

        // ── DATA_TAMBAHAN_SISWAS ─────────────────────────────────────
        Schema::create('data_tambahan_siswas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')
                ->comment('FK ke siswas.id. One-to-one')
                ->constrained('siswas')->cascadeOnDelete();
            $table->string('no_registrasi_akta_kelahiran', 60)->nullable()->comment('Nomor registrasi akta kelahiran dari Dukcapil');
            $table->string('no_kip', 20)->nullable()->comment('Nomor Kartu Indonesia Pintar (KIP) 16+ digit');
            $table->string('nama_tertera_kip', 150)->nullable()->comment('Nama yang tertera di KIP');
            $table->decimal('lintang', 10, 8)->nullable()->comment('Koordinat latitude rumah siswa');
            $table->decimal('bujur', 11, 8)->nullable()->comment('Koordinat longitude rumah siswa');
            $table->string('kebutuhan_khusus_ayah', 50)->nullable()->comment('Kondisi khusus ayah (kode Dapodik)');
            $table->string('kebutuhan_khusus_ibu', 50)->nullable()->comment('Kondisi khusus ibu (kode Dapodik)');
            $table->string('hobi', 100)->nullable()->comment('Membaca, Olahraga, Musik, Menggambar');
            $table->string('cita_cita', 100)->nullable()->comment('Dokter, Guru, Insinyur, Pilot');
            $table->string('no_telp', 20)->nullable()->comment('Nomor telepon rumah (bukan HP)');
            $table->string('hp_siswa', 20)->nullable()->comment('Nomor HP pribadi siswa');
            $table->string('email_siswa', 150)->nullable()->comment('Email pribadi siswa');
            $table->decimal('tinggi_badan_awal', 5, 2)->nullable()->comment('Tinggi badan saat pertama masuk dalam CM');
            $table->decimal('berat_badan_awal', 5, 2)->nullable()->comment('Berat badan saat pertama masuk dalam KG');
            $table->decimal('lingkar_kepala', 5, 2)->nullable()->comment('Lingkar kepala saat masuk dalam CM');
            $table->string('bahasa_sehari_hari', 50)->nullable()->comment('Indonesia|Sunda|Jawa|Madura|Betawi|dll');
            $table->enum('jenis_tinggal', ['Bersama Orang Tua', 'Wali', 'Kos', 'Asrama', 'Panti', 'Lainnya'])->nullable();
            $table->timestamps();

            $table->unique('siswa_id', 'uq_dtambahan_siswa');
        });

        // ── PROGRAM_KESEJAHTERAAN_SISWAS ─────────────────────────────
        Schema::create('program_kesejahteraan_siswas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')
                ->comment('FK ke siswas.id. One-to-one')
                ->constrained('siswas')->cascadeOnDelete();
            $table->boolean('penerima_kps_pkh')->default(false)->comment('1=Menerima KPS/PKH');
            $table->string('no_kps_pkh', 30)->nullable()->comment('Nomor KPS atau PKH yang diterima keluarga');
            $table->boolean('layak_pip')->default(false)->comment('1=Layak mendapat PIP');
            $table->string('alasan_layak_pip', 100)->nullable()->comment('Yatim|Piatu|Yatim Piatu|Miskin|dll');
            $table->boolean('penerima_kip')->default(false)->comment('1=Siswa sudah/sedang memegang KIP aktif');
            $table->string('no_kip', 20)->nullable()->comment('Nomor KIP yang dipegang siswa');
            $table->string('nama_tertera_di_kip', 150)->nullable()->comment('Nama yang tercetak di KIP');
            $table->timestamp('updated_at')->nullable();

            $table->unique('siswa_id', 'uq_prokesej_siswa');
        });

        // ── ORANG_TUAS ───────────────────────────────────────────────
        Schema::create('orang_tuas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()
                ->comment('Akun login orang tua (opsional). Diisi saat ortu ingin monitor via portal')
                ->constrained('users')->nullOnDelete();
            $table->string('nama', 150)->comment('Nama lengkap orang tua/wali');
            $table->string('nik', 16)->nullable()->comment('NIK orang tua dari KTP. Untuk verifikasi dan sinkronisasi Dapodik');
            $table->enum('hubungan', ['Ayah', 'Ibu', 'Wali', 'Kakek', 'Nenek', 'Paman', 'Bibi', 'Kakak', 'Lainnya'])
                ->comment('Hubungan individu ini dengan siswa');
            $table->enum('status', ['Kandung', 'Tiri', 'Angkat', 'Wali'])->default('Kandung')
                ->comment('Status legal hubungan');
            $table->enum('status_hidup', ['Masih Hidup', 'Meninggal', 'Tidak Diketahui'])->default('Masih Hidup');
            $table->string('tempat_lahir', 100)->nullable();
            $table->year('tahun_lahir')->nullable()->comment('Tahun lahir sesuai standar Dapodik');
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable();
            $table->enum('agama', ['Islam', 'Kristen Protestan', 'Kristen Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'])->nullable();
            $table->enum('kewarganegaraan', ['WNI', 'WNA'])->default('WNI');
            $table->string('kebutuhan_khusus', 50)->nullable()->comment('Kondisi khusus orang tua (kode Dapodik)');
            $table->enum('pendidikan', [
                'Tidak Sekolah', 'SD', 'SMP', 'SMA/SMK',
                'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3', 'Lainnya',
            ])->nullable()->comment('Pendidikan terakhir sesuai kode Dapodik');
            $table->string('pekerjaan', 100)->nullable()->comment('Petani, Pedagang, PNS, Buruh, dll');
            $table->enum('penghasilan', [
                'Tidak Berpenghasilan',
                'Kurang dari Rp 500.000',
                'Rp 500.000 - Rp 999.999',
                'Rp 1.000.000 - Rp 1.999.999',
                'Rp 2.000.000 - Rp 4.999.999',
                'Rp 5.000.000 - Rp 9.999.999',
                'Lebih dari Rp 10.000.000',
            ])->nullable()->comment('Range penghasilan per bulan sesuai standar Dapodik');
            $table->string('no_hp', 20)->nullable()->comment('Nomor HP/WA untuk notifikasi dan komunikasi');
            $table->string('email', 150)->nullable()->comment('Email untuk akun portal dan notifikasi');
            $table->text('alamat')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id', 'idx_ortu_user_id');
            $table->index('nik', 'idx_ortu_nik');
            $table->index('nama', 'idx_ortu_nama');
        });

        // ── ORANG_TUA_SISWA ──────────────────────────────────────────
        Schema::create('orang_tua_siswa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->comment('FK ke siswas.id')->constrained('siswas')->cascadeOnDelete();
            $table->foreignId('orang_tua_id')->comment('FK ke orang_tuas.id')->constrained('orang_tuas')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['siswa_id', 'orang_tua_id'], 'uq_ortu_siswa');
            $table->index('orang_tua_id', 'idx_ortusiswa_ortu');
        });

        // ── PERKEMBANGAN_SISWAS ──────────────────────────────────────
        Schema::create('perkembangan_siswas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->comment('FK ke siswas.id')->constrained('siswas')->cascadeOnDelete();
            $table->foreignId('tahun_ajaran_id')->nullable()
                ->comment('FK ke tahun_ajarans.id')
                ->constrained('tahun_ajarans')->nullOnDelete();
            $table->foreignId('semester_id')->nullable()
                ->comment('FK ke semesters.id')
                ->constrained('semesters')->nullOnDelete();
            $table->decimal('tinggi_badan', 5, 2)->nullable()->comment('Tinggi badan saat ini dalam CM');
            $table->decimal('berat_badan', 5, 2)->nullable()->comment('Berat badan saat ini dalam KG');
            $table->text('catatan_kesehatan')->nullable()->comment('Diisi dokter sekolah atau wali kelas');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['siswa_id', 'semester_id'], 'uq_perkemb_siswa_smt');
            $table->index('tahun_ajaran_id', 'idx_perkemb_ta');
        });

        // ── RIWAYAT_KELAS ────────────────────────────────────────────
        Schema::create('riwayat_kelas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->comment('FK ke siswas.id')->constrained('siswas')->cascadeOnDelete();
            $table->foreignId('kelas_id')->nullable()
                ->comment('FK ke kelas.id. NULL jika kelas sudah dihapus')
                ->constrained('kelas')->nullOnDelete();
            $table->string('nama_kelas_snapshot', 30)->nullable()->comment('Snapshot nama kelas. Tetap ada walau kelas dihapus');
            $table->foreignId('tahun_ajaran_id')->nullable()
                ->comment('FK ke tahun_ajarans.id')
                ->constrained('tahun_ajarans')->nullOnDelete();
            $table->foreignId('semester_id')->nullable()
                ->comment('FK ke semesters.id')
                ->constrained('semesters')->nullOnDelete();
            $table->unsignedTinyInteger('no_absen')->nullable()->comment('Nomor absen siswa di kelas ini');
            $table->date('tanggal_masuk')->nullable();
            $table->date('tanggal_keluar')->nullable()->comment('NULL jika masih di kelas ini');
            $table->enum('jenis_perubahan', [
                'masuk_baru', 'naik_kelas', 'turun_kelas', 'pindah_kelas',
                'mutasi_masuk', 'mutasi_keluar', 'lulus', 'nonaktif',
                'masuk_kembali', 'meninggal',
            ])->nullable()->comment('Alasan perubahan kelas/status. Penting untuk rekap kesiswaan');
            $table->text('catatan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('siswa_id', 'idx_riwkel_siswa_id');
            $table->index('kelas_id', 'idx_riwkel_kelas_id');
            $table->index('tahun_ajaran_id', 'idx_riwkel_ta_id');
        });

        // ── MUTASI_SISWAS ────────────────────────────────────────────
        Schema::create('mutasi_siswas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->comment('FK ke siswas.id. Siswa yang mengalami mutasi')->constrained('siswas')->cascadeOnDelete();
            $table->enum('jenis_mutasi', ['masuk', 'keluar', 'lulus', 'nonaktif', 'meninggal'])
                ->comment('masuk=pindah dari sekolah lain, keluar=pindah keluar, lulus=tamat');
            $table->date('tanggal')->comment('Tanggal efektif mutasi berlaku');
            $table->string('no_surat', 80)->nullable()->comment('Nomor surat keputusan/keterangan mutasi');
            $table->text('alasan')->nullable();
            $table->string('sekolah_asal_tujuan', 200)->nullable()
                ->comment('Nama sekolah asal (mutasi masuk) atau tujuan (mutasi keluar)');
            $table->string('diterima_di', 200)->nullable()
                ->comment('Khusus mutasi masuk: nama sekolah sebelumnya');
            $table->timestamps();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->index('siswa_id', 'idx_mutasi_siswa_id');
            $table->index('tanggal', 'idx_mutasi_tanggal');
        });

        // ── BERKAS_SISWAS ────────────────────────────────────────────
        Schema::create('berkas_siswas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->comment('FK ke siswas.id')->constrained('siswas')->cascadeOnDelete();
            $table->enum('jenis_berkas', [
                'kartu_keluarga', 'akte_kelahiran', 'ktp_orang_tua', 'pas_foto',
                'ijazah_sebelumnya', 'rapor_sekolah_asal', 'surat_keterangan_sehat',
                'kip_pkh_kks', 'surat_mutasi', 'lainnya',
            ])->comment('Kategori berkas untuk memastikan kelengkapan dokumen');
            $table->string('nama_file_asli', 255)->comment('Nama file asli saat diupload (untuk tampilan UI)');
            $table->string('nama_file_sistem', 255)->comment('Nama file di server (UUID/hash untuk keamanan)');
            $table->string('path_file', 255)->comment('Path lengkap file di storage');
            $table->string('ekstensi', 10)->comment('pdf, jpg, jpeg, png');
            $table->unsignedInteger('ukuran_file')->comment('Ukuran file dalam bytes');
            $table->boolean('is_verified')->default(false)->comment('1=Sudah diverifikasi keasliannya oleh operator');
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->index(['siswa_id', 'jenis_berkas'], 'idx_berkas_siswa_jenis');
        });

        // ── PRESTASIS ────────────────────────────────────────────────
        Schema::create('prestasis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->comment('FK ke siswas.id')->constrained('siswas')->cascadeOnDelete();
            $table->string('nama', 200)->comment('Nama/judul kompetisi atau prestasi yang diraih');
            $table->enum('jenis', ['Akademik', 'Non-Akademik', 'Olahraga', 'Seni', 'Lainnya'])->nullable();
            $table->enum('tingkat', ['Sekolah', 'Kecamatan', 'Kabupaten/Kota', 'Provinsi', 'Nasional', 'Internasional'])->nullable();
            $table->unsignedTinyInteger('peringkat')->nullable()->comment('1=Juara 1, 2=Juara 2, 3=Juara 3, dst');
            $table->year('tahun')->nullable()->comment('Tahun saat prestasi diraih');
            $table->string('penyelenggara', 150)->nullable()->comment('Instansi/lembaga penyelenggara');
            $table->string('file_bukti', 255)->nullable()->comment('Path scan sertifikat/piagam prestasi');
            $table->text('keterangan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('siswa_id', 'idx_prestasi_siswa_id');
        });

        // ── BEASISWAS ────────────────────────────────────────────────
        Schema::create('beasiswas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->comment('FK ke siswas.id')->constrained('siswas')->cascadeOnDelete();
            $table->string('nama', 150)->comment('Nama program beasiswa: PIP, BPIB, Beasiswa Hafidz, dll');
            $table->string('jenis', 60)->nullable()->comment('PIP|BPIB|Swasta|Pemerintah Daerah|Yayasan|Lainnya');
            $table->string('penyelenggara', 100)->nullable()->comment('Kemdikbud, Kemenag, Yayasan X, dll');
            $table->year('tahun_mulai')->nullable()->comment('Tahun pertama menerima beasiswa');
            $table->year('tahun_selesai')->nullable()->comment('Tahun terakhir menerima. NULL jika masih aktif');
            $table->decimal('nominal', 15, 2)->nullable()->comment('Jumlah nominal beasiswa per tahun dalam Rupiah');
            $table->text('keterangan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('siswa_id', 'idx_beasiswas_siswa_id');
        });

        // ── SISWA_EKSKULS ────────────────────────────────────────────
        Schema::create('siswa_ekskuls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->comment('FK ke siswas.id')->constrained('siswas')->cascadeOnDelete();
            $table->foreignId('ekskul_id')->comment('FK ke ekskuls.id')->constrained('ekskuls')->cascadeOnDelete();
            $table->foreignId('tahun_ajaran_id')->comment('FK ke tahun_ajarans.id')->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->foreignId('semester_id')->comment('FK ke semesters.id')->constrained('semesters')->cascadeOnDelete();
            $table->enum('predikat', ['A', 'B', 'C', 'D'])->nullable()
                ->comment('A=Sangat Baik, B=Baik, C=Cukup, D=Kurang. Tampil di rapor');
            $table->string('keterangan', 255)->nullable()->comment('Catatan singkat dari pembina ekskul');
            $table->timestamps();

            $table->unique(['siswa_id', 'ekskul_id', 'semester_id'], 'uq_siswekskul');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('siswa_ekskuls');
        Schema::dropIfExists('beasiswas');
        Schema::dropIfExists('prestasis');
        Schema::dropIfExists('berkas_siswas');
        Schema::dropIfExists('mutasi_siswas');
        Schema::dropIfExists('riwayat_kelas');
        Schema::dropIfExists('perkembangan_siswas');
        Schema::dropIfExists('orang_tua_siswa');
        Schema::dropIfExists('orang_tuas');
        Schema::dropIfExists('program_kesejahteraan_siswas');
        Schema::dropIfExists('data_tambahan_siswas');
        Schema::dropIfExists('siswas');
    }
};
