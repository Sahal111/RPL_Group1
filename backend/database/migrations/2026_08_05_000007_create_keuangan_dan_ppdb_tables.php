<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── JENIS_TAGIHANS ────────────────────────────────────────────
        Schema::create('jenis_tagihans', function (Blueprint $table) {
            $table->id();
            $table->string('nama_tagihan', 150)
                ->comment('SPP Bulanan, Dana Komite, Seragam, Buku LKS, Infaq');
            $table->enum('kategori', ['spp', 'bos', 'komite', 'ppdb', 'lainnya'])->default('spp')
                ->comment('spp=iuran rutin, bos=dana BOS, komite=sumbangan komite, ppdb=biaya pendaftaran');
            $table->decimal('nominal_default', 12, 2)->default(0)
                ->comment('Nominal standar. Bisa di-override per siswa di tagihans');
            $table->boolean('is_rutin')->default(false)
                ->comment('1=Tagihan bulanan otomatis, 0=Tagihan sekali bayar');
            $table->foreignId('tahun_ajaran_id')->nullable()
                ->comment('NULL=berlaku semua tahun, Terisi=hanya tahun ajaran ini')
                ->constrained('tahun_ajarans')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreignId('created_by')->nullable()
                ->comment('FK ke users.id. Bendahara yang membuat jenis tagihan ini')
                ->constrained('users')->nullOnDelete();

            $table->index('tahun_ajaran_id', 'idx_jenistagihan_ta');
        });

        // ── TAGIHANS ─────────────────────────────────────────────────
        Schema::create('tagihans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')
                ->comment('FK ke siswas.id. Tagihan ditujukan untuk siswa siapa')
                ->constrained('siswas')->cascadeOnDelete();
            $table->foreignId('jenis_tagihan_id')
                ->comment('FK ke jenis_tagihans.id. Tagihan ini jenis apa')
                ->constrained('jenis_tagihans')->restrict();
            $table->foreignId('tahun_ajaran_id')->nullable()
                ->comment('FK ke tahun_ajarans.id')
                ->constrained('tahun_ajarans')->nullOnDelete();
            $table->unsignedTinyInteger('bulan')->nullable()
                ->comment('Bulan tagihan 1-12. NULL untuk tagihan tidak rutin');
            $table->decimal('nominal_tagihan', 12, 2)
                ->comment('Nominal kotor tagihan sebelum diskon');
            $table->decimal('nominal_diskon', 12, 2)->default(0)
                ->comment('Besaran diskon/potongan: beasiswa, keringanan khusus, dll');
            $table->decimal('nominal_bersih', 12, 2)
                ->comment('Nominal yang harus dibayar = nominal_tagihan - nominal_diskon');
            $table->date('jatuh_tempo')->nullable()->comment('Batas pembayaran. Untuk laporan tunggakan');
            $table->enum('status', ['belum', 'lunas', 'cicil', 'bebas'])->default('belum')
                ->comment('belum=belum bayar, lunas=sudah lunas, cicil=bayar sebagian, bebas=dibebaskan');
            $table->text('keterangan')->nullable()->comment('Alasan diskon, keterangan cicilan, dll');
            $table->timestamps();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->index('siswa_id', 'idx_tagihan_siswa_id');
            $table->index('jenis_tagihan_id', 'idx_tagihan_jenis_id');
            $table->index(['tahun_ajaran_id', 'bulan'], 'idx_tagihan_ta_bulan');
            $table->index('status', 'idx_tagihan_status');
        });

        // ── PEMBAYARANS ──────────────────────────────────────────────
        Schema::create('pembayarans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tagihan_id')
                ->comment('FK ke tagihans.id. Pembayaran ini untuk tagihan mana')
                ->constrained('tagihans')->restrict();
            $table->foreignId('siswa_id')
                ->comment('FK ke siswas.id. Denormalisasi untuk query riwayat pembayaran per siswa')
                ->constrained('siswas')->cascadeOnDelete();
            $table->decimal('nominal_bayar', 12, 2)
                ->comment('Jumlah yang dibayarkan pada transaksi ini (bisa parsial/cicilan)');
            $table->date('tanggal_bayar')->comment('Tanggal uang diterima bendahara/kasir');
            $table->enum('metode_bayar', ['tunai', 'transfer', 'va', 'qris', 'lainnya'])->default('tunai')
                ->comment('tunai=cash di sekolah, va=virtual account bank, qris=QR Code');
            $table->string('no_bukti', 80)->nullable()
                ->comment('Nomor kwitansi (tunai) atau referensi transfer/VA/QRIS');
            $table->text('catatan')->nullable()->comment('Nama teller, keterangan khusus, dll');
            $table->enum('status', ['valid', 'pending', 'batal'])->default('valid')
                ->comment('valid=resmi diterima, pending=menunggu konfirmasi, batal=dibatalkan');
            $table->timestamps();
            $table->softDeletes()->comment('Soft delete untuk pembayaran yang dibatalkan (audit trail)');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->index('tagihan_id', 'idx_bayar_tagihan_id');
            $table->index('siswa_id', 'idx_bayar_siswa_id');
            $table->index('tanggal_bayar', 'idx_bayar_tanggal');
        });

        // ── CALON_SISWAS ─────────────────────────────────────────────
        Schema::create('calon_siswas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tahun_ajaran_id')
                ->comment('FK ke tahun_ajarans.id. PPDB untuk tahun ajaran mana')
                ->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->string('no_pendaftaran', 30)->unique('uq_calon_nopendaftaran')
                ->comment('Nomor urut pendaftaran. Contoh: PPDB-2027-001');
            $table->string('nama_lengkap', 150)->comment('Nama calon siswa');
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->string('tempat_lahir', 100)->nullable();
            $table->date('tanggal_lahir');
            $table->string('agama', 30)->nullable();
            $table->text('alamat')->nullable();
            $table->string('asal_sekolah', 200)->nullable()->comment('Nama TK/PAUD/RA asal sebelum masuk MI');
            $table->string('nama_orang_tua', 150)->nullable()->comment('Nama orang tua/wali untuk kontak');
            $table->string('no_hp', 20)->nullable()->comment('Nomor HP orang tua');
            $table->string('email', 150)->nullable()->comment('Email orang tua untuk pengiriman hasil seleksi');
            $table->string('jalur', 50)->nullable()
                ->comment('Zonasi|Prestasi|Afirmasi|Pindah Tugas|Regular');
            $table->enum('status', ['pending', 'verifikasi', 'lulus', 'tidak_lulus', 'cadangan', 'converted', 'dibatalkan'])
                ->default('pending')->comment('converted=sudah jadi siswa aktif di tabel siswas');
            $table->foreignId('siswa_id')->nullable()
                ->comment('FK ke siswas.id. Terisi saat calon dikonversi jadi siswa aktif')
                ->constrained('siswas')->nullOnDelete();
            $table->text('catatan_verifikasi')->nullable()->comment('Catatan panitia PPDB saat verifikasi berkas');
            $table->timestamps();

            $table->index('tahun_ajaran_id', 'idx_calon_ta_id');
            $table->index('status', 'idx_calon_status');
        });

        // ── BERKAS_PENDAFTARS ─────────────────────────────────────────
        Schema::create('berkas_pendaftars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calon_siswa_id')
                ->comment('FK ke calon_siswas.id')
                ->constrained('calon_siswas')->cascadeOnDelete();
            $table->string('jenis_berkas', 60)
                ->comment('akta_kelahiran, kartu_keluarga, surat_keterangan_sehat, pas_foto, dll');
            $table->string('file_path', 255)->comment('Path file yang diupload ke server');
            $table->unsignedInteger('ukuran_file')->nullable()->comment('Ukuran file dalam bytes');
            $table->enum('status_verifikasi', ['pending', 'approved', 'rejected'])->default('pending')
                ->comment('Hasil verifikasi berkas oleh panitia PPDB');
            $table->text('catatan')->nullable()->comment('Catatan dari panitia jika berkas rejected');
            $table->timestamps();

            $table->index('calon_siswa_id', 'idx_berkaspendaftar_calon');
        });

        // ── PEMBAYARAN_PPDB ───────────────────────────────────────────
        Schema::create('pembayaran_ppdb', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calon_siswa_id')
                ->comment('FK ke calon_siswas.id')
                ->constrained('calon_siswas')->cascadeOnDelete();
            $table->string('jenis', 80)
                ->comment('Biaya Pendaftaran, Seragam, Formulir, Uang Gedung, dll');
            $table->decimal('nominal', 12, 2)->comment('Jumlah yang dibayarkan');
            $table->enum('status', ['lunas', 'belum', 'cicil'])->default('belum');
            $table->date('tanggal_bayar')->nullable()->comment('NULL jika belum bayar');
            $table->string('no_bukti', 80)->nullable()->comment('Nomor kwitansi atau referensi pembayaran');
            $table->timestamps();

            $table->index('calon_siswa_id', 'idx_bayarppdb_calon');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pembayaran_ppdb');
        Schema::dropIfExists('berkas_pendaftars');
        Schema::dropIfExists('calon_siswas');
        Schema::dropIfExists('pembayarans');
        Schema::dropIfExists('tagihans');
        Schema::dropIfExists('jenis_tagihans');
    }
};
