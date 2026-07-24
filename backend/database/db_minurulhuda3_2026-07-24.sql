# ************************************************************
# Sequel Ace SQL dump
# Version 20096
#
# https://sequel-ace.com/
# https://github.com/Sequel-Ace/Sequel-Ace
#
# Host: 127.0.0.1 (MySQL 9.6.0)
# Database: db_minurulhuda3
# Generation Time: 2026-07-24 12:58:24 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE='NO_AUTO_VALUE_ON_ZERO', SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table absensis
# ------------------------------------------------------------

DROP TABLE IF EXISTS `absensis`;

CREATE TABLE `absensis` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke siswas.id',
  `kelas_id` bigint unsigned NOT NULL COMMENT 'FK ke kelas.id. Kelas siswa saat absensi dicatat',
  `jadwal_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke jadwals.id. NULL jika absensi harian umum (bukan per mapel)',
  `plot_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke plot_guru_mapels.id. Diisi untuk absensi per mata pelajaran',
  `tahun_ajaran_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke tahun_ajarans.id. Denormalisasi untuk mempercepat query rekap per tahun',
  `semester_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke semesters.id. Denormalisasi untuk query rekap per semester',
  `tanggal` date NOT NULL COMMENT 'Tanggal absensi dicatat. Format: YYYY-MM-DD',
  `status` enum('Hadir','Sakit','Izin','Alpa') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Hadir' COMMENT 'Status kehadiran: Hadir=masuk, Sakit=tidak masuk ada surat dokter, Izin=ijin resmi, Alpa=tanpa keterangan',
  `keterangan` text COLLATE utf8mb4_unicode_ci COMMENT 'Penjelasan tambahan, misalnya: Sakit demam, Izin mengurus KK, dll',
  `dicatat_oleh` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Guru/wali kelas yang mencatat absensi ini',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_absensi_siswa_jadwal_tgl` (`siswa_id`,`kelas_id`,`jadwal_id`,`tanggal`),
  KEY `idx_abs_kelas_tgl` (`kelas_id`,`tanggal`) COMMENT 'Query absensi harian per kelas (paling sering dipakai guru)',
  KEY `idx_abs_tanggal` (`tanggal`) COMMENT 'Filter absensi berdasarkan tanggal',
  KEY `idx_abs_semester` (`semester_id`) COMMENT 'Rekap per semester',
  KEY `idx_abs_status` (`status`) COMMENT 'Filter per status (hitung total Sakit/Izin/Alpa)',
  KEY `idx_abs_siswa_smt` (`siswa_id`,`semester_id`,`status`) COMMENT 'Composite untuk rekap absensi siswa di rapor',
  KEY `fk_abs_jadwal` (`jadwal_id`),
  KEY `fk_abs_plot` (`plot_id`),
  KEY `fk_abs_ta` (`tahun_ajaran_id`),
  KEY `fk_abs_oleh` (`dicatat_oleh`),
  CONSTRAINT `fk_abs_jadwal` FOREIGN KEY (`jadwal_id`) REFERENCES `jadwals` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_abs_kelas` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_abs_oleh` FOREIGN KEY (`dicatat_oleh`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_abs_plot` FOREIGN KEY (`plot_id`) REFERENCES `plot_guru_mapels` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_abs_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_abs_smt` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_abs_ta` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Kehadiran siswa harian. Tabel besar (~40rb baris/tahun untuk 200 siswa). Index dioptimasi untuk rekap';



# Dump of table activity_logs
# ------------------------------------------------------------

DROP TABLE IF EXISTS `activity_logs`;

CREATE TABLE `activity_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. NULL jika aksi dilakukan oleh sistem/cron otomatis',
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Jenis aksi: create|update|delete|login|logout|export|import|print|approve|reject',
  `module` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Modul yang diakses: siswa|guru|nilai|absensi|rapor|keuangan|ppdb|pengaturan|...',
  `subject_id` bigint unsigned DEFAULT NULL COMMENT 'ID record yang diubah/dilihat. NULL untuk aksi level modul (login, export semua)',
  `keterangan` text COLLATE utf8mb4_unicode_ci COMMENT 'Deskripsi detail aksi. Bisa berisi diff data sebelum vs sesudah perubahan (JSON)',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP address user saat aksi terjadi',
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Browser/device saat aksi terjadi',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu aksi terjadi (tidak ada updated_at karena log tidak boleh diubah)',
  PRIMARY KEY (`id`),
  KEY `idx_actlog_user` (`user_id`),
  KEY `idx_actlog_module` (`module`),
  KEY `idx_actlog_created` (`created_at`) COMMENT 'Untuk filter log berdasarkan periode waktu',
  CONSTRAINT `fk_actlog_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail seluruh aksi di sistem. Log tidak boleh diubah/dihapus kecuali purging rutin';

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `module`, `subject_id`, `keterangan`, `ip_address`, `user_agent`, `created_at`)
VALUES
	(1,1,'update','tahun_ajaran',1,'Memperbarui tahun ajaran 2026/2027.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15','2026-07-23 22:19:29');

/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table admin_ppdb_profiles
# ------------------------------------------------------------

DROP TABLE IF EXISTS `admin_ppdb_profiles`;

CREATE TABLE `admin_ppdb_profiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT 'FK ke users.id. Akun user yang bertugas sebagai admin PPDB',
  `tahun_ajaran` varchar(9) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tahun ajaran PPDB yang dikelola: 2026/2027, dll',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_adminppdb_user` (`user_id`),
  CONSTRAINT `fk_adminppdb_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Profil admin PPDB. Menyimpan tahun ajaran yang dikelola admin PPDB ini';



# Dump of table beasiswas
# ------------------------------------------------------------

DROP TABLE IF EXISTS `beasiswas`;

CREATE TABLE `beasiswas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke siswas.id',
  `nama` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama program beasiswa: PIP, BPIB, Beasiswa Hafidz, dll',
  `jenis` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kategori: PIP|BPIB|Swasta|Pemerintah Daerah|Yayasan|Lainnya',
  `penyelenggara` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Lembaga pemberi beasiswa: Kemdikbud, Kemenag, Yayasan X, dll',
  `tahun_mulai` year DEFAULT NULL COMMENT 'Tahun pertama menerima beasiswa ini',
  `tahun_selesai` year DEFAULT NULL COMMENT 'Tahun terakhir menerima. NULL jika masih aktif',
  `nominal` decimal(15,2) DEFAULT NULL COMMENT 'Jumlah nominal beasiswa per tahun dalam Rupiah',
  `keterangan` text COLLATE utf8mb4_unicode_ci COMMENT 'Catatan tambahan, syarat, atau status beasiswa',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_beasiswas_siswa_id` (`siswa_id`),
  CONSTRAINT `fk_beasiswas_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Riwayat beasiswa siswa (PIP, BPIB, yayasan, dll). Dipakai untuk laporan keuangan dan Dapodik';



# Dump of table bendaharas
# ------------------------------------------------------------

DROP TABLE IF EXISTS `bendaharas`;

CREATE TABLE `bendaharas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT 'FK ke users.id. Akun user yang bertugas sebagai bendahara',
  `guru_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke gurus.id. NULL jika bendahara bukan guru aktif di madrasah ini',
  `jenis_bendahara` enum('BOS','Rutin','Komite','Umum') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Jenis kewenangan: BOS=kelola dana BOS, Rutin=gaji/operasional, Komite=dana komite, Umum=semua',
  `no_sk` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor SK pengangkatan bendahara dari Kepala Madrasah',
  `tanggal_sk` date DEFAULT NULL COMMENT 'Tanggal penerbitan SK',
  `tmt` date DEFAULT NULL COMMENT 'Tanggal Mulai Tugas sebagai bendahara',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=Bendahara aktif menjabat. 0=Sudah tidak menjabat',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_benda_user_id` (`user_id`),
  KEY `idx_benda_guru_id` (`guru_id`),
  CONSTRAINT `fk_benda_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_benda_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Profil bendahara: jenis kewenangan (BOS/Rutin/Komite) dan SK pengangkatan';

LOCK TABLES `bendaharas` WRITE;
/*!40000 ALTER TABLE `bendaharas` DISABLE KEYS */;

INSERT INTO `bendaharas` (`id`, `user_id`, `guru_id`, `jenis_bendahara`, `no_sk`, `tanggal_sk`, `tmt`, `is_active`, `created_at`, `updated_at`)
VALUES
	(1,5,4,'','SK-BENDAHARA-01',NULL,NULL,1,'2026-07-20 21:44:26','2026-07-20 21:44:26');

/*!40000 ALTER TABLE `bendaharas` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table berkas_pendaftars
# ------------------------------------------------------------

DROP TABLE IF EXISTS `berkas_pendaftars`;

CREATE TABLE `berkas_pendaftars` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `calon_siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke calon_siswas.id',
  `jenis_berkas` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Kategori berkas: akta_kelahiran, kartu_keluarga, surat_keterangan_sehat, pas_foto, dll',
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Path file yang diupload ke server',
  `ukuran_file` int unsigned DEFAULT NULL COMMENT 'Ukuran file dalam bytes',
  `status_verifikasi` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'Hasil verifikasi berkas oleh panitia PPDB',
  `catatan` text COLLATE utf8mb4_unicode_ci COMMENT 'Catatan dari panitia jika berkas rejected (alasan penolakan)',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_berkaspendaftar_calon` (`calon_siswa_id`),
  CONSTRAINT `fk_berkaspendaftar_calon` FOREIGN KEY (`calon_siswa_id`) REFERENCES `calon_siswas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Berkas yang diupload saat PPDB (akta, KK, foto, dll). Status verifikasi oleh panitia';



# Dump of table berkas_siswas
# ------------------------------------------------------------

DROP TABLE IF EXISTS `berkas_siswas`;

CREATE TABLE `berkas_siswas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke siswas.id',
  `jenis_berkas` enum('kartu_keluarga','akte_kelahiran','ktp_orang_tua','pas_foto','ijazah_sebelumnya','rapor_sekolah_asal','surat_keterangan_sehat','kip_pkh_kks','surat_mutasi','lainnya') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Kategori berkas. Dipakai untuk memastikan kelengkapan dokumen siswa',
  `nama_file_asli` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama file asli saat diupload (untuk tampilan di UI)',
  `nama_file_sistem` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama file yang disimpan di server (UUID/hash untuk keamanan)',
  `path_file` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Path lengkap file di storage',
  `ekstensi` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ekstensi file: pdf, jpg, jpeg, png',
  `ukuran_file` int unsigned NOT NULL COMMENT 'Ukuran file dalam bytes. Dipakai untuk monitoring storage',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1=Berkas sudah diverifikasi keasliannya oleh operator',
  `verified_by` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Operator yang verifikasi berkas ini',
  `verified_at` timestamp NULL DEFAULT NULL COMMENT 'Kapan berkas diverifikasi',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Siapa yang upload berkas ini (bisa operator atau ortu via portal)',
  PRIMARY KEY (`id`),
  KEY `idx_berkas_siswa_jenis` (`siswa_id`,`jenis_berkas`) COMMENT 'Untuk cek kelengkapan dokumen per siswa',
  KEY `fk_berkas_created_by` (`created_by`),
  KEY `fk_berkas_verified_by` (`verified_by`),
  CONSTRAINT `fk_berkas_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_berkas_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_berkas_verified_by` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Berkas/dokumen resmi siswa yang diupload. Mencakup akta, KK, KIP, pas foto, ijazah asal, dll';



# Dump of table cache
# ------------------------------------------------------------

DROP TABLE IF EXISTS `cache`;

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Identifier unik cache item, contoh: siswa.total.aktif',
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Data yang dicache, sudah di-serialize PHP',
  `expiration` int NOT NULL COMMENT 'Unix timestamp kapan cache ini expired',
  PRIMARY KEY (`key`),
  KEY `idx_cache_expiration` (`expiration`) COMMENT 'Untuk prune (hapus) cache yang sudah expired'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cache database driver Laravel. Pertimbangkan Redis untuk produksi';

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;

INSERT INTO `cache` (`key`, `value`, `expiration`)
VALUES
	('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba','i:1;',1784558990),
	('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba:timer','i:1784558990;',1784558990);

/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table cache_locks
# ------------------------------------------------------------

DROP TABLE IF EXISTS `cache_locks`;

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Identifier lock, sama dengan cache key yang dikunci',
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Identifier proses yang memegang lock saat ini',
  `expiration` int NOT NULL COMMENT 'Unix timestamp lock ini expired otomatis (prevent deadlock)',
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Atomic lock cache Laravel untuk prevent race condition';



# Dump of table calon_siswas
# ------------------------------------------------------------

DROP TABLE IF EXISTS `calon_siswas`;

CREATE TABLE `calon_siswas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tahun_ajaran_id` bigint unsigned NOT NULL COMMENT 'FK ke tahun_ajarans.id. PPDB untuk tahun ajaran mana',
  `no_pendaftaran` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nomor urut pendaftaran yang digenerate otomatis. Contoh: PPDB-2027-001',
  `nama_lengkap` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama calon siswa',
  `jenis_kelamin` enum('L','P') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tempat_lahir` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tanggal_lahir` date NOT NULL,
  `agama` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alamat` text COLLATE utf8mb4_unicode_ci,
  `asal_sekolah` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama TK/PAUD/RA asal sebelum masuk MI',
  `nama_orang_tua` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama orang tua/wali untuk kontak',
  `no_hp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor HP orang tua yang bisa dihubungi',
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email orang tua untuk pengiriman hasil seleksi',
  `jalur` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Jalur pendaftaran: Zonasi|Prestasi|Afirmasi|Pindah Tugas|Regular',
  `status` enum('pending','verifikasi','lulus','tidak_lulus','cadangan','converted','dibatalkan') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'Status PPDB: converted=sudah jadi siswa aktif di tabel siswas',
  `siswa_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke siswas.id. Terisi saat calon berhasil dikonversi jadi siswa aktif',
  `catatan_verifikasi` text COLLATE utf8mb4_unicode_ci COMMENT 'Catatan dari panitia PPDB saat verifikasi berkas',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_calon_nopendaftaran` (`no_pendaftaran`),
  KEY `idx_calon_ta_id` (`tahun_ajaran_id`),
  KEY `idx_calon_status` (`status`),
  KEY `fk_calon_siswa` (`siswa_id`),
  CONSTRAINT `fk_calon_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_calon_ta` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Data pendaftar PPDB. Status converted artinya sudah resmi jadi siswa di tabel siswas';



# Dump of table catatan_walis
# ------------------------------------------------------------

DROP TABLE IF EXISTS `catatan_walis`;

CREATE TABLE `catatan_walis` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke siswas.id. Siswa yang dicatat',
  `guru_id` bigint unsigned NOT NULL COMMENT 'FK ke gurus.id. Wali kelas/guru yang membuat catatan',
  `tahun_ajaran_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke tahun_ajarans.id',
  `semester_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke semesters.id',
  `tanggal` date NOT NULL COMMENT 'Tanggal catatan dibuat',
  `jenis` enum('akademik','perilaku','kesehatan','kehadiran','prestasi','lainnya') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'akademik' COMMENT 'Kategori catatan: akademik=nilai/belajar, perilaku=sikap, kesehatan, dll',
  `isi` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Isi catatan lengkap dari wali kelas',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_catwali_siswa_id` (`siswa_id`),
  KEY `idx_catwali_guru_id` (`guru_id`),
  KEY `idx_catwali_smt` (`semester_id`),
  KEY `fk_catwali_ta` (`tahun_ajaran_id`),
  CONSTRAINT `fk_catwali_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_catwali_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_catwali_smt` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_catwali_ta` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catatan wali kelas per siswa per periode. Untuk monitoring perkembangan dan komunikasi dengan ortu';



# Dump of table data_tambahan_siswas
# ------------------------------------------------------------

DROP TABLE IF EXISTS `data_tambahan_siswas`;

CREATE TABLE `data_tambahan_siswas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke siswas.id. Relasi one-to-one (satu siswa satu baris)',
  `no_registrasi_akta_kelahiran` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor registrasi akta kelahiran dari Dukcapil',
  `no_kip` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor Kartu Indonesia Pintar (KIP). 16 digit atau lebih',
  `nama_tertera_kip` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama yang tertera di KIP (bisa berbeda jika salah ketik)',
  `lintang` decimal(10,8) DEFAULT NULL COMMENT 'Koordinat latitude rumah siswa. Dipakai untuk analisis spasial dan zonasi peta',
  `bujur` decimal(11,8) DEFAULT NULL COMMENT 'Koordinat longitude rumah siswa',
  `kebutuhan_khusus_ayah` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kondisi khusus ayah: Tidak Ada|Tuna Netra|Tuna Rungu|dll (kode Dapodik)',
  `kebutuhan_khusus_ibu` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kondisi khusus ibu: Tidak Ada|Tuna Netra|Tuna Rungu|dll',
  `hobi` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Hobi/minat siswa. Contoh: Membaca, Olahraga, Musik, Menggambar',
  `cita_cita` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Cita-cita siswa. Contoh: Dokter, Guru, Insinyur, Pilot',
  `no_telp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor telepon rumah (bukan HP)',
  `hp_siswa` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor HP pribadi siswa (jika sudah punya)',
  `email_siswa` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email pribadi siswa (jika sudah punya)',
  `tinggi_badan_awal` decimal(5,2) DEFAULT NULL COMMENT 'Tinggi badan saat pertama masuk madrasah dalam CM',
  `berat_badan_awal` decimal(5,2) DEFAULT NULL COMMENT 'Berat badan saat pertama masuk madrasah dalam KG',
  `lingkar_kepala` decimal(5,2) DEFAULT NULL COMMENT 'Lingkar kepala saat masuk dalam CM. Indikator perkembangan otak',
  `bahasa_sehari_hari` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Bahasa yang dipakai di rumah: Indonesia|Sunda|Jawa|Madura|Betawi|dll',
  `jenis_tinggal` enum('Bersama Orang Tua','Wali','Kos','Asrama','Panti','Lainnya') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Dengan siapa/di mana siswa tinggal sehari-hari',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_dtambahan_siswa` (`siswa_id`) COMMENT 'One-to-one: satu siswa hanya satu baris data tambahan',
  CONSTRAINT `fk_dtambahan_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Data tambahan siswa standar EMIS Kemenag (GPS, KIP, fisik awal, hobi, dll). One-to-one dengan siswas';



# Dump of table ekskuls
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ekskuls`;

CREATE TABLE `ekskuls` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama ekstrakurikuler. Contoh: Pramuka, Tahfidz Quran, Futsal, Qosidah',
  `deskripsi` text COLLATE utf8mb4_unicode_ci COMMENT 'Deskripsi singkat ekskul: tujuan, jadwal, dll',
  `guru_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke gurus.id. Guru pembina/penanggung jawab ekskul ini',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=Ekskul masih aktif berjalan. 0=Sudah dibubarkan/tidak aktif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ekskul_guru` (`guru_id`),
  CONSTRAINT `fk_ekskul_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master ekstrakurikuler madrasah. Nilai ekskul siswa ada di tabel siswa_ekskuls';



# Dump of table failed_jobs
# ------------------------------------------------------------

DROP TABLE IF EXISTS `failed_jobs`;

CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID unik job untuk identifikasi dan retry spesifik',
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Driver queue yang dipakai saat job gagal (database, redis, dll)',
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama antrian saat job gagal',
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Data job lengkap untuk keperluan debugging dan retry',
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Stack trace exception yang menyebabkan job gagal',
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Kapan job ini dinyatakan gagal',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_failedjobs_uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Job antrian yang gagal setelah semua retry habis. Bisa di-retry manual';



# Dump of table galeris
# ------------------------------------------------------------

DROP TABLE IF EXISTS `galeris`;

CREATE TABLE `galeris` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `judul` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Judul/nama foto atau album',
  `deskripsi` text COLLATE utf8mb4_unicode_ci COMMENT 'Keterangan foto',
  `kategori` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kategori foto: Kegiatan|Fasilitas|Prestasi|Pramuka|Olahraga|dll',
  `foto` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Path file foto yang diupload ke server',
  `uploaded_by` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Siapa yang upload foto ini',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_galeri_kategori` (`kategori`),
  KEY `fk_galeri_uploader` (`uploaded_by`),
  CONSTRAINT `fk_galeri_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Galeri foto kegiatan madrasah. Ditampilkan di portal/website publik';



# Dump of table guru_absensis
# ------------------------------------------------------------

DROP TABLE IF EXISTS `guru_absensis`;

CREATE TABLE `guru_absensis` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `guru_id` bigint unsigned NOT NULL COMMENT 'FK ke gurus.id',
  `tanggal` date NOT NULL COMMENT 'Tanggal absensi. Satu guru satu record per hari',
  `jam_masuk` time DEFAULT NULL COMMENT 'Jam datang/check-in. Untuk perhitungan keterlambatan',
  `jam_pulang` time DEFAULT NULL COMMENT 'Jam pulang/check-out. Untuk monitoring jam kerja',
  `status` enum('Hadir','Izin','Sakit','Alpa','Cuti','Dinas Luar') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Hadir' COMMENT 'Status: Cuti=izin cuti resmi, Dinas Luar=tugas ke luar sekolah',
  `keterangan` text COLLATE utf8mb4_unicode_ci COMMENT 'Penjelasan: nama kegiatan dinas luar, surat dokter, dll',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_guruabs_guru_tgl` (`guru_id`,`tanggal`) COMMENT 'Satu guru satu record absensi per hari',
  KEY `idx_guruabs_tanggal` (`tanggal`),
  CONSTRAINT `fk_guruabs_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Absensi harian guru. Untuk monitoring kepala madrasah dan laporan rekapitulasi ke Kemenag';



# Dump of table guru_diklats
# ------------------------------------------------------------

DROP TABLE IF EXISTS `guru_diklats`;

CREATE TABLE `guru_diklats` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `guru_id` bigint unsigned NOT NULL COMMENT 'FK ke gurus.id',
  `nama_diklat` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama lengkap pelatihan/diklat yang diikuti',
  `penyelenggara` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Instansi penyelenggara: Kemenag, Kemdikbud, P4TK, LPMP, Yayasan, dll',
  `jenis` enum('diklat','bimtek','workshop','seminar','pelatihan','kursus') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'diklat' COMMENT 'Jenis kegiatan peningkatan kompetensi',
  `tingkat` enum('Kecamatan','Kabupaten/Kota','Provinsi','Nasional','Internasional') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tingkat/skala penyelenggaraan. Berpengaruh pada poin PKB',
  `tanggal_mulai` date DEFAULT NULL COMMENT 'Tanggal hari pertama kegiatan',
  `tanggal_selesai` date DEFAULT NULL COMMENT 'Tanggal hari terakhir kegiatan',
  `jumlah_jam` smallint unsigned DEFAULT NULL COMMENT 'Total jam kegiatan (JP = Jam Pelajaran @45 menit). Dipakai untuk poin PKB',
  `no_sertifikat` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor sertifikat keikutsertaan',
  `peran` enum('peserta','narasumber','panitia','moderator') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'peserta' COMMENT 'Peran guru dalam kegiatan. Narasumber poinnya lebih tinggi dari peserta',
  `file_sertifikat` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Path scan sertifikat/piagam yang diupload',
  `keterangan` text COLLATE utf8mb4_unicode_ci COMMENT 'Catatan tambahan tentang kegiatan',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_gurudiklat_guru_id` (`guru_id`),
  CONSTRAINT `fk_gurudiklat_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Riwayat diklat/pelatihan guru untuk PKB. Dilaporkan ke Dapodik';



# Dump of table guru_dokumens
# ------------------------------------------------------------

DROP TABLE IF EXISTS `guru_dokumens`;

CREATE TABLE `guru_dokumens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `guru_id` bigint unsigned NOT NULL COMMENT 'FK ke gurus.id',
  `kategori` enum('identitas','kepegawaian','pendidikan','sertifikasi','penghargaan','lainnya') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Kategori dokumen untuk pengelompokan di UI',
  `nama_dokumen` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama dokumen yang deskriptif. Contoh: SK Pengangkatan GTY 2019, Ijazah S1 UIN 2010',
  `nomor_dokumen` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor surat/dokumen resmi',
  `tanggal_dokumen` date DEFAULT NULL COMMENT 'Tanggal terbit/pengesahan dokumen',
  `tanggal_berlaku` date DEFAULT NULL COMMENT 'Tanggal dokumen mulai berlaku (jika berbeda dengan tanggal terbit)',
  `tanggal_kadaluarsa` date DEFAULT NULL COMMENT 'Tanggal dokumen expired. NULL = berlaku selamanya',
  `penerbit` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Instansi penerbit dokumen: Kemenag, Kemdikbud, BKN, LPTK, dll',
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Path file dokumen yang diupload ke server',
  `file_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tipe MIME file: application/pdf, image/jpeg, dll',
  `file_size` int unsigned DEFAULT NULL COMMENT 'Ukuran file dalam bytes',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1=Dokumen sudah diverifikasi keasliannya oleh operator/kepsek',
  `keterangan` text COLLATE utf8mb4_unicode_ci COMMENT 'Catatan tambahan tentang dokumen ini',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_gurudok_guru_id` (`guru_id`),
  CONSTRAINT `fk_gurudok_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dokumen resmi guru yang diupload (KTP, SK, ijazah, sertifikat, dll)';



# Dump of table guru_inpassings
# ------------------------------------------------------------

DROP TABLE IF EXISTS `guru_inpassings`;

CREATE TABLE `guru_inpassings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `guru_id` bigint unsigned NOT NULL COMMENT 'FK ke gurus.id. Guru non-PNS yang mendapat inpassing',
  `no_sk` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nomor SK Inpassing yang diterbitkan Dirjen GTK Kemenag/Kemdikbud',
  `tanggal_sk` date NOT NULL COMMENT 'Tanggal SK inpassing diterbitkan',
  `tmt_inpassing` date NOT NULL COMMENT 'Tanggal Mulai Tugas inpassing berlaku efektif',
  `golongan_sesudah` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Golongan yang diperoleh setelah inpassing: III/A, III/B, dll',
  `jabatan_fungsional` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Guru Pertama' COMMENT 'Jenjang jabatan fungsional: Guru Pertama|Guru Muda|Guru Madya|Guru Utama',
  `angka_kredit` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Angka kredit yang ditetapkan dalam SK inpassing',
  `file_sk` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Path scan SK inpassing yang diupload',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_guruinp_guru_id` (`guru_id`),
  CONSTRAINT `fk_guruinp_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Data inpassing jabatan fungsional guru non-PNS. Diperlukan untuk klaim tunjangan profesi GTY';



# Dump of table guru_jabatans
# ------------------------------------------------------------

DROP TABLE IF EXISTS `guru_jabatans`;

CREATE TABLE `guru_jabatans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `guru_id` bigint unsigned NOT NULL COMMENT 'FK ke gurus.id. Jabatan ini milik guru siapa',
  `jabatan` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama jabatan: Guru Kelas|Wali Kelas|Kepala Sekolah|Bendahara BOS|Kepala Perpustakaan|dll',
  `golongan` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Golongan kepangkatan PNS: I/A, II/A, III/A, III/B, III/C, III/D, IV/A, IV/B, IV/C, IV/D, IV/E',
  `pangkat` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama pangkat: Pengatur, Penata Muda, Penata, Pembina, dll',
  `status_kepegawaian` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Status saat menjabat: PNS|PPPK|GTY|GTT (bisa berbeda dengan status sekarang)',
  `no_sk` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor SK pengangkatan jabatan dari Kemenag/Dinas Pendidikan',
  `tanggal_sk` date DEFAULT NULL COMMENT 'Tanggal penerbitan SK',
  `tmt_jabatan` date DEFAULT NULL COMMENT 'Tanggal Mulai Tugas jabatan ini berlaku efektif',
  `tanggal_selesai` date DEFAULT NULL COMMENT 'Tanggal jabatan ini berakhir. NULL jika masih menjabat',
  `is_current` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1=Jabatan yang sedang aktif sekarang. Hanya satu per guru. Diupdate saat ada jabatan baru',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete. Riwayat jabatan tidak boleh dihapus permanen',
  `created_by` bigint unsigned DEFAULT NULL,
  `updated_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_gurujab_guru_id` (`guru_id`),
  KEY `idx_gurujab_current` (`guru_id`,`is_current`) COMMENT 'Composite untuk query cepat jabatan aktif guru',
  KEY `fk_gurujab_cb` (`created_by`),
  KEY `fk_gurujab_ub` (`updated_by`),
  CONSTRAINT `fk_gurujab_cb` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_gurujab_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_gurujab_ub` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Riwayat jabatan dan golongan guru. is_current=1 menandai jabatan aktif';



# Dump of table guru_keluargas
# ------------------------------------------------------------

DROP TABLE IF EXISTS `guru_keluargas`;

CREATE TABLE `guru_keluargas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `guru_id` bigint unsigned NOT NULL COMMENT 'FK ke gurus.id. One-to-one: satu guru satu data keluarga',
  `status_perkawinan` enum('Belum Menikah','Menikah','Cerai Hidup','Cerai Mati') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama_pasangan` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama suami/istri. NULL jika belum/tidak menikah',
  `nik_pasangan` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'NIK suami/istri dari KTP',
  `pekerjaan_pasangan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Pekerjaan pasangan saat ini',
  `jumlah_anak` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'Jumlah anak kandung yang masih menjadi tanggungan',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_gurukel_guru_id` (`guru_id`),
  CONSTRAINT `fk_gurukel_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Data keluarga guru untuk kelengkapan Dapodik dan tunjangan keluarga';



# Dump of table guru_pendidikans
# ------------------------------------------------------------

DROP TABLE IF EXISTS `guru_pendidikans`;

CREATE TABLE `guru_pendidikans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `guru_id` bigint unsigned NOT NULL COMMENT 'FK ke gurus.id',
  `jenjang` enum('SD','SMP','SMA/SMK','D1','D2','D3','D4','S1','S2','S3','Lainnya') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Jenjang pendidikan formal sesuai kode Dapodik',
  `nama_sekolah` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama lengkap sekolah/universitas',
  `jurusan` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Jurusan/program studi (untuk SMA/SMK)',
  `prodi` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Program studi lengkap (untuk D1-S3). Contoh: Pendidikan Guru Madrasah Ibtidaiyah',
  `tahun_masuk` year DEFAULT NULL COMMENT 'Tahun masuk/mendaftar',
  `tahun_lulus` year NOT NULL COMMENT 'Tahun lulus. Dipakai untuk hitung masa kerja dan kualifikasi',
  `no_ijazah` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor ijazah asli. Dipakai untuk verifikasi kualifikasi',
  `file_ijazah` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Path scan ijazah yang diupload. Format: guru_dok/{guru_id}/ijazah_{jenjang}.pdf',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_gurupend_guru_id` (`guru_id`),
  CONSTRAINT `fk_gurupend_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Riwayat pendidikan formal guru. Minimal satu baris (pendidikan terakhir) untuk Dapodik';



# Dump of table guru_rekenings
# ------------------------------------------------------------

DROP TABLE IF EXISTS `guru_rekenings`;

CREATE TABLE `guru_rekenings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `guru_id` bigint unsigned NOT NULL COMMENT 'FK ke gurus.id',
  `nama_bank` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama bank: BRI, BNI, Mandiri, BSI, BTN, dll',
  `no_rekening` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nomor rekening bank tujuan transfer gaji',
  `atas_nama` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama pemilik rekening. Harus sesuai nama di buku tabungan',
  `cabang` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Cabang bank tempat rekening dibuka',
  `npwp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'NPWP guru untuk perhitungan dan pemotongan PPh 21',
  `gaji_pokok` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Gaji pokok sesuai golongan (PNS) atau SK yayasan (GTY)',
  `tunjangan_fungsional` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Tunjangan jabatan fungsional guru',
  `tunjangan_profesi` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Tunjangan sertifikasi/profesi per bulan',
  `is_primary` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=Rekening utama penerima gaji. Guru bisa punya beberapa rekening tapi hanya satu primary',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_guruerek_guru_id` (`guru_id`),
  CONSTRAINT `fk_guruerek_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Rekening dan komponen gaji guru. Dipakai bendahara untuk transfer dan laporan keuangan';



# Dump of table guru_sertifikasis
# ------------------------------------------------------------

DROP TABLE IF EXISTS `guru_sertifikasis`;

CREATE TABLE `guru_sertifikasis` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `guru_id` bigint unsigned NOT NULL COMMENT 'FK ke gurus.id',
  `jenis_sertifikasi` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Jalur sertifikasi: PPG|PLPG|Portofolio|PGSD|PPG Dalam Jabatan|PPG Prajabatan',
  `no_sertifikat` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nomor sertifikat pendidik yang diterbitkan LPTK',
  `nrg` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor Registrasi Guru dari Kemdikbud. Dipakai untuk klaim tunjangan profesi',
  `tahun_sertifikasi` year NOT NULL COMMENT 'Tahun lulus/mendapat sertifikasi',
  `bidang_studi` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Bidang studi yang tersertifikasi, sesuai mapel yang diajar',
  `file_sertifikat` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Path scan sertifikat yang diupload',
  `tanggal_terbit` date DEFAULT NULL COMMENT 'Tanggal sertifikat diterbitkan LPTK',
  `expired_at` date DEFAULT NULL COMMENT 'Tanggal kadaluarsa (jika ada). NULL = tidak expire',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_gurucert_guru_id` (`guru_id`),
  CONSTRAINT `fk_gurucert_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sertifikasi profesi guru. NRG dibutuhkan untuk klaim tunjangan profesi bulanan';



# Dump of table gurus
# ------------------------------------------------------------

DROP TABLE IF EXISTS `gurus`;

CREATE TABLE `gurus` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. NULL jika guru belum punya akun login di sistem',
  `nuptk` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor Unik PTK dari Kemdikbud. 16 digit. Kunci sinkronisasi Dapodik',
  `nip` varchar(18) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'NIP PNS 18 digit. NULL untuk GTY/GTT/Honor (non-PNS)',
  `nip_lama` varchar(9) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'NIP lama 9 digit untuk guru yang diangkat sebelum 2004',
  `no_karpeg` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor Kartu Pegawai PNS. NULL untuk non-PNS',
  `no_karis_karsu` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kartu Isteri/Suami PNS. Karis=Isteri PNS, Karsu=Suami PNS',
  `nik` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor Induk Kependudukan 16 digit dari KTP. Wajib Dapodik',
  `no_kk` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor Kartu Keluarga 16 digit',
  `nama` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama lengkap sesuai KTP/ijazah terakhir tanpa gelar',
  `gelar_depan` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Gelar pendidikan di depan nama: Prof., Dr., Drs., H., dll',
  `gelar_belakang` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Gelar di belakang nama: S.Pd., M.Pd., M.Ag., Ph.D., dll',
  `jenis_kelamin` enum('L','P') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'L=Laki-laki, P=Perempuan',
  `tempat_lahir` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kota/kabupaten tempat lahir sesuai KTP',
  `tanggal_lahir` date DEFAULT NULL COMMENT 'Tanggal lahir sesuai KTP',
  `golongan_darah` enum('A','B','AB','O','-') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '-' COMMENT '- = tidak diketahui',
  `agama` enum('Islam','Kristen Protestan','Kristen Katolik','Hindu','Buddha','Konghucu','Lainnya') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama_ibu_kandung` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama ibu kandung. Dipakai untuk verifikasi identitas',
  `alamat_jalan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama jalan, nomor rumah, RT/RW. Alamat sesuai KTP atau domisili',
  `rt` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor RT (Rukun Tetangga)',
  `rw` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor RW (Rukun Warga)',
  `desa_kelurahan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama desa atau kelurahan',
  `kecamatan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama kecamatan',
  `kota_kabupaten` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama kota atau kabupaten',
  `provinsi` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama provinsi',
  `kode_pos` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kode pos area tempat tinggal',
  `no_hp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor HP/WA aktif yang bisa dihubungi',
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email aktif guru. Dipakai untuk reset password dan notifikasi',
  `jenis_ptk` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Jenis PTK Dapodik: Guru Kelas|Guru Mapel|Kepala Sekolah|Tendik|Guru BK',
  `status_kepegawaian` enum('PNS','PPPK','GTY','GTT','Honor','Lainnya') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Status kepegawaian resmi: PNS|PPPK (CPNS)|GTY (Tetap Yayasan)|GTT (Tidak Tetap)|Honor',
  `status_aktif` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=Guru masih aktif mengajar. 0=Pensiun/resign/mutasi keluar',
  `tanggal_bergabung` date DEFAULT NULL COMMENT 'Tanggal pertama kali masuk mengajar di madrasah ini',
  `tmt_pns` date DEFAULT NULL COMMENT 'Tanggal Mulai Tugas sebagai PNS (dari SK pengangkatan PNS)',
  `tmt_gty` date DEFAULT NULL COMMENT 'Tanggal Mulai Tugas sebagai GTY (dari SK yayasan)',
  `foto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Path foto guru. Format: guru/NUPTK_timestamp.jpg atau guru/nik_timestamp.jpg',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1=Data sudah diverifikasi Operator/Kepsek, 0=Masih draft/belum diverifikasi',
  `verified_at` timestamp NULL DEFAULT NULL COMMENT 'Kapan data diverifikasi',
  `verified_by` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Siapa yang memverifikasi data guru ini',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete. Guru yang resign/pensiun jangan di-hard delete agar history mengajar tetap ada',
  `created_by` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Siapa yang pertama input data guru ini',
  `updated_by` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Siapa yang terakhir mengubah data guru ini',
  `deleted_by` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Siapa yang menghapus (soft delete) data guru ini',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_gurus_nuptk` (`nuptk`),
  UNIQUE KEY `uq_gurus_nip` (`nip`),
  UNIQUE KEY `uq_gurus_nik` (`nik`),
  UNIQUE KEY `uq_gurus_email` (`email`),
  KEY `idx_gurus_user_id` (`user_id`),
  KEY `idx_gurus_nama` (`nama`) COMMENT 'Untuk pencarian nama guru',
  KEY `idx_gurus_status` (`status_aktif`) COMMENT 'Filter guru aktif/nonaktif',
  KEY `idx_gurus_deleted` (`deleted_at`),
  KEY `fk_gurus_verified_by` (`verified_by`),
  KEY `fk_gurus_created_by` (`created_by`),
  KEY `fk_gurus_updated_by` (`updated_by`),
  KEY `fk_gurus_deleted_by` (`deleted_by`),
  CONSTRAINT `fk_gurus_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_gurus_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_gurus_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_gurus_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_gurus_verified_by` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Data induk guru/PTK standar Dapodik. Satu baris = satu individu guru/tendik';

LOCK TABLES `gurus` WRITE;
/*!40000 ALTER TABLE `gurus` DISABLE KEYS */;

INSERT INTO `gurus` (`id`, `user_id`, `nuptk`, `nip`, `nip_lama`, `no_karpeg`, `no_karis_karsu`, `nik`, `no_kk`, `nama`, `gelar_depan`, `gelar_belakang`, `jenis_kelamin`, `tempat_lahir`, `tanggal_lahir`, `golongan_darah`, `agama`, `nama_ibu_kandung`, `alamat_jalan`, `rt`, `rw`, `desa_kelurahan`, `kecamatan`, `kota_kabupaten`, `provinsi`, `kode_pos`, `no_hp`, `email`, `jenis_ptk`, `status_kepegawaian`, `status_aktif`, `tanggal_bergabung`, `tmt_pns`, `tmt_gty`, `foto`, `is_verified`, `verified_at`, `verified_by`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`)
VALUES
	(1,2,'1111111111111111',NULL,NULL,NULL,NULL,NULL,NULL,'Kepala Sekolah Test',NULL,NULL,'L',NULL,NULL,'-',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Kepala Sekolah',NULL,1,NULL,NULL,NULL,NULL,0,NULL,NULL,'2026-07-20 21:44:26','2026-07-20 21:44:26',NULL,NULL,NULL,NULL),
	(2,3,'2222222222222222',NULL,NULL,NULL,NULL,NULL,NULL,'Guru Pengajar Test',NULL,NULL,'P',NULL,NULL,'-',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Guru Kelas',NULL,1,NULL,NULL,NULL,NULL,0,NULL,NULL,'2026-07-20 21:44:26','2026-07-20 21:44:26',NULL,NULL,NULL,NULL),
	(3,4,'3333333333333333',NULL,NULL,NULL,NULL,NULL,NULL,'Wali Kelas Test',NULL,NULL,'L',NULL,NULL,'-',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Guru Kelas',NULL,1,NULL,NULL,NULL,NULL,0,NULL,NULL,'2026-07-20 21:44:26','2026-07-20 21:44:26',NULL,NULL,NULL,NULL),
	(4,5,'4444444444444444',NULL,NULL,NULL,NULL,NULL,NULL,'Bendahara Test',NULL,NULL,'P',NULL,NULL,'-',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Guru Kelas',NULL,1,NULL,NULL,NULL,NULL,0,NULL,NULL,'2026-07-20 21:44:26','2026-07-20 21:44:26',NULL,NULL,NULL,NULL);

/*!40000 ALTER TABLE `gurus` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table jadwals
# ------------------------------------------------------------

DROP TABLE IF EXISTS `jadwals`;

CREATE TABLE `jadwals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `plot_id` bigint unsigned NOT NULL COMMENT 'FK ke plot_guru_mapels.id. Dari plot mana jadwal ini dibuat',
  `kelas_id` bigint unsigned NOT NULL COMMENT 'FK ke kelas.id. Redundan dengan plot tapi mempercepat query',
  `guru_id` bigint unsigned NOT NULL COMMENT 'FK ke gurus.id. Redundan dengan plot tapi mempercepat query',
  `mapel_id` bigint unsigned NOT NULL COMMENT 'FK ke mapels.id. Redundan tapi mempercepat query',
  `semester_id` bigint unsigned NOT NULL COMMENT 'FK ke semesters.id',
  `hari` enum('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hari pelajaran berlangsung',
  `jam_ke` tinyint unsigned DEFAULT NULL COMMENT 'Jam pelajaran ke berapa (1,2,3,...). Untuk validasi tabrakan jadwal',
  `jam_mulai` time NOT NULL COMMENT 'Jam mulai pelajaran, format HH:MM',
  `jam_selesai` time NOT NULL COMMENT 'Jam selesai pelajaran, format HH:MM',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_jadwal_kelas_hari` (`kelas_id`,`hari`) COMMENT 'Query jadwal harian per kelas (paling sering dipakai)',
  KEY `idx_jadwal_guru_id` (`guru_id`),
  KEY `idx_jadwal_semester` (`semester_id`),
  KEY `fk_jadwal_plot` (`plot_id`),
  KEY `fk_jadwal_mapel` (`mapel_id`),
  CONSTRAINT `fk_jadwal_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jadwal_kelas` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jadwal_mapel` FOREIGN KEY (`mapel_id`) REFERENCES `mapels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jadwal_plot` FOREIGN KEY (`plot_id`) REFERENCES `plot_guru_mapels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jadwal_smt` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Jadwal pelajaran mingguan (hari dan jam) turunan dari plot mengajar guru';



# Dump of table jenis_tagihans
# ------------------------------------------------------------

DROP TABLE IF EXISTS `jenis_tagihans`;

CREATE TABLE `jenis_tagihans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nama_tagihan` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama tagihan. Contoh: SPP Bulanan, Dana Komite, Seragam, Buku LKS, Infaq',
  `kategori` enum('spp','bos','komite','ppdb','lainnya') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'spp' COMMENT 'Kategori: spp=iuran rutin, bos=dari dana BOS, komite=sumbangan komite sekolah, ppdb=biaya pendaftaran',
  `nominal_default` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Nominal standar untuk jenis tagihan ini. Bisa di-override per siswa di tagihans',
  `is_rutin` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1=Tagihan bulanan (muncul tiap bulan otomatis), 0=Tagihan sekali bayar',
  `tahun_ajaran_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke tahun_ajarans.id. NULL=berlaku semua tahun, Terisi=hanya tahun ajaran ini',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Bendahara yang membuat jenis tagihan ini',
  PRIMARY KEY (`id`),
  KEY `idx_jenistagihan_ta` (`tahun_ajaran_id`),
  KEY `fk_jenistagihan_cb` (`created_by`),
  CONSTRAINT `fk_jenistagihan_cb` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jenistagihan_ta` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master jenis tagihan (SPP, Komite, dll). Template untuk generate tagihans per siswa';



# Dump of table jobs
# ------------------------------------------------------------

DROP TABLE IF EXISTS `jobs`;

CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama queue/antrian, contoh: default, emails, reports. Bisa dipisah worker berbeda',
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Job yang di-serialize (class name + data). Di-encrypt jika QUEUE_ENCRYPT=true',
  `attempts` tinyint unsigned NOT NULL COMMENT 'Berapa kali sudah dicoba diproses. Jika >= max_tries, pindah ke failed_jobs',
  `reserved_at` int unsigned DEFAULT NULL COMMENT 'Unix timestamp kapan job ini mulai diambil worker. NULL = belum diproses',
  `available_at` int unsigned NOT NULL COMMENT 'Unix timestamp job boleh diproses. Untuk delayed job (dispatch()->delay())',
  `created_at` int unsigned NOT NULL COMMENT 'Unix timestamp kapan job di-dispatch',
  PRIMARY KEY (`id`),
  KEY `idx_jobs_queue` (`queue`) COMMENT 'Worker filter berdasarkan nama queue'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Antrian job background Laravel. Untuk proses berat seperti generate PDF, kirim email massal';



# Dump of table kalender_akademiks
# ------------------------------------------------------------

DROP TABLE IF EXISTS `kalender_akademiks`;

CREATE TABLE `kalender_akademiks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tahun_ajaran_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke tahun_ajarans.id. NULL untuk kalender nasional yang berlaku semua tahun',
  `judul` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama kegiatan/libur. Contoh: Libur Idul Fitri, Ujian Akhir Semester, Rapat Pleno',
  `deskripsi` text COLLATE utf8mb4_unicode_ci COMMENT 'Penjelasan lebih detail tentang kegiatan ini',
  `jenis` enum('libur','kegiatan','ujian','rapat','lainnya') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'kegiatan',
  `tanggal_mulai` date NOT NULL COMMENT 'Tanggal mulai kegiatan/libur',
  `tanggal_selesai` date DEFAULT NULL COMMENT 'Tanggal selesai. NULL jika hanya satu hari',
  `is_nasional` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1=Libur/kegiatan nasional (HUT RI, Lebaran, dll). 0=Kegiatan internal madrasah',
  `dibuat_oleh` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Admin/Kepsek yang input kalender ini',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_kalakad_ta` (`tahun_ajaran_id`),
  KEY `idx_kalakad_tanggal` (`tanggal_mulai`),
  KEY `fk_kalakad_dibuat` (`dibuat_oleh`),
  CONSTRAINT `fk_kalakad_dibuat` FOREIGN KEY (`dibuat_oleh`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_kalakad_ta` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Kalender akademik: libur, ujian, kegiatan, rapat. Tampil di dashboard semua pengguna';



# Dump of table kelas
# ------------------------------------------------------------

DROP TABLE IF EXISTS `kelas`;

CREATE TABLE `kelas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tahun_ajaran_id` bigint unsigned NOT NULL COMMENT 'FK ke tahun_ajarans.id. Kelas ini untuk tahun ajaran mana',
  `semester_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke semesters.id. Opsional, bisa diset per semester atau NULL untuk setahun',
  `nama_kelas` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama kelas: 1-A, 2-B, 3-A, dst. Format bebas sesuai kebijakan madrasah',
  `tingkat` tinyint unsigned NOT NULL COMMENT 'Tingkat kelas: 1-6 untuk MI/SD. Dipakai untuk filter mapel sesuai tingkat',
  `kurikulum` enum('K13','Merdeka','Lainnya') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Merdeka' COMMENT 'Kurikulum yang dipakai kelas ini',
  `wali_kelas_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke gurus.id. Shortcut wali kelas aktif. Juga ada di tabel wali_kelas (lebih detail)',
  `kapasitas` tinyint unsigned NOT NULL DEFAULT '32' COMMENT 'Kapasitas maksimal siswa per kelas. Dipakai untuk validasi saat input siswa baru',
  `ruangan` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama/kode ruang kelas. Contoh: Ruang 1A, Lab Komputer, Perpustakaan',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=Kelas aktif semester ini. 0=Sudah ditutup/tidak dipakai',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_kelas_ta_nama` (`tahun_ajaran_id`,`nama_kelas`),
  KEY `idx_kelas_ta` (`tahun_ajaran_id`),
  KEY `idx_kelas_tingkat` (`tingkat`),
  KEY `idx_kelas_walikelas` (`wali_kelas_id`),
  KEY `fk_kelas_smt` (`semester_id`),
  CONSTRAINT `fk_kelas_smt` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_kelas_ta` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_kelas_wali` FOREIGN KEY (`wali_kelas_id`) REFERENCES `gurus` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master kelas per tahun ajaran. Dibuat ulang setiap tahun ajaran baru. Kapasitas maks 32 siswa/kelas';

LOCK TABLES `kelas` WRITE;
/*!40000 ALTER TABLE `kelas` DISABLE KEYS */;

INSERT INTO `kelas` (`id`, `tahun_ajaran_id`, `semester_id`, `nama_kelas`, `tingkat`, `kurikulum`, `wali_kelas_id`, `kapasitas`, `ruangan`, `is_active`, `created_at`, `updated_at`, `deleted_at`)
VALUES
	(1,1,1,'1-A',1,'Merdeka',NULL,32,NULL,1,'2026-07-13 10:14:43','2026-07-13 10:14:43',NULL),
	(2,1,1,'2-A',2,'Merdeka',NULL,32,NULL,1,'2026-07-13 10:14:43','2026-07-13 10:14:43',NULL);

/*!40000 ALTER TABLE `kelas` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table komponen_penilaians
# ------------------------------------------------------------

DROP TABLE IF EXISTS `komponen_penilaians`;

CREATE TABLE `komponen_penilaians` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nama_komponen` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama komponen: Nilai Formatif, Nilai Sumatif, PTS, PAS, Sikap Spiritual, dll',
  `kode` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kode singkat untuk kode program: NF, NS, PTS, PAS, PSP, PSS',
  `jenis` enum('formatif','sumatif','sikap','ekstrakurikuler','lainnya') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'formatif' COMMENT 'Kategori besar komponen. Dipakai untuk pengelompokan di rapor',
  `bobot_persentase` decimal(5,2) DEFAULT NULL COMMENT 'Persentase bobot dalam nilai akhir. NULL untuk sikap (tidak dihitung rata-rata)',
  `kurikulum` enum('K13','Merdeka','Semua') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Semua' COMMENT 'Kurikulum yang menggunakan komponen ini. Semua=berlaku di K13 dan Merdeka',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master komponen penilaian dengan bobot. Dipakai untuk hitung nilai akhir tertimbang';

LOCK TABLES `komponen_penilaians` WRITE;
/*!40000 ALTER TABLE `komponen_penilaians` DISABLE KEYS */;

INSERT INTO `komponen_penilaians` (`id`, `nama_komponen`, `kode`, `jenis`, `bobot_persentase`, `kurikulum`, `is_active`, `created_at`, `updated_at`)
VALUES
	(1,'Nilai Formatif','NF','formatif',40.00,'Merdeka',1,'2026-07-13 10:14:43','2026-07-13 10:14:43'),
	(2,'Nilai Sumatif','NS','sumatif',60.00,'Merdeka',1,'2026-07-13 10:14:43','2026-07-13 10:14:43'),
	(3,'Pengetahuan (K13)','NPH','formatif',30.00,'K13',1,'2026-07-13 10:14:43','2026-07-13 10:14:43'),
	(4,'Keterampilan (K13)','NPK','formatif',30.00,'K13',1,'2026-07-13 10:14:43','2026-07-13 10:14:43'),
	(5,'PTS','PTS','sumatif',20.00,'K13',1,'2026-07-13 10:14:43','2026-07-13 10:14:43'),
	(6,'PAS/PAT','PAS','sumatif',20.00,'K13',1,'2026-07-13 10:14:43','2026-07-13 10:14:43'),
	(7,'Sikap (Spiritual)','PSP','sikap',NULL,'Semua',1,'2026-07-13 10:14:43','2026-07-13 10:14:43'),
	(8,'Sikap (Sosial)','PSS','sikap',NULL,'Semua',1,'2026-07-13 10:14:43','2026-07-13 10:14:43'),
	(9,'Nilai Formatif','NF','formatif',40.00,'Merdeka',1,'2026-07-23 14:33:11','2026-07-23 14:33:11'),
	(10,'Nilai Sumatif','NS','sumatif',60.00,'Merdeka',1,'2026-07-23 14:33:11','2026-07-23 14:33:11'),
	(11,'Pengetahuan (K13)','NPH','formatif',30.00,'K13',1,'2026-07-23 14:33:11','2026-07-23 14:33:11'),
	(12,'Keterampilan (K13)','NPK','formatif',30.00,'K13',1,'2026-07-23 14:33:11','2026-07-23 14:33:11'),
	(13,'PTS','PTS','sumatif',20.00,'K13',1,'2026-07-23 14:33:11','2026-07-23 14:33:11'),
	(14,'PAS/PAT','PAS','sumatif',20.00,'K13',1,'2026-07-23 14:33:11','2026-07-23 14:33:11'),
	(15,'Sikap (Spiritual)','PSP','sikap',NULL,'Semua',1,'2026-07-23 14:33:11','2026-07-23 14:33:11'),
	(16,'Sikap (Sosial)','PSS','sikap',NULL,'Semua',1,'2026-07-23 14:33:11','2026-07-23 14:33:11');

/*!40000 ALTER TABLE `komponen_penilaians` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table mapels
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mapels`;

CREATE TABLE `mapels` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kode resmi Dapodik/EMIS untuk sinkronisasi. Contoh: PAI001, MTK001',
  `nama_mapel` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama lengkap mata pelajaran sesuai kurikulum',
  `kelompok` enum('A','B','C','Muatan Lokal','Ekstra','Agama','Lainnya') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kelompok mapel: A=Umum, B=Peminatan, C=Kejuruan, Agama=PAI/Quran dll',
  `tingkat` tinyint unsigned DEFAULT NULL COMMENT 'Tingkat kelas yang pakai mapel ini (1-6 untuk MI). NULL = berlaku untuk semua tingkat',
  `kurikulum` enum('K13','Merdeka','Lainnya') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Merdeka' COMMENT 'Kurikulum yang menggunakan mapel ini',
  `jam_per_minggu` tinyint unsigned DEFAULT NULL COMMENT 'Jumlah jam pelajaran per minggu. Dipakai untuk validasi jadwal dan beban mengajar guru',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=Mapel aktif dipakai. 0=Sudah tidak dipakai (misalnya kurikulum lama)',
  `urutan_rapor` tinyint unsigned DEFAULT NULL COMMENT 'Nomor urut tampil di rapor. Contoh: 1=PAI, 2=PPKn, 3=Bahasa Indonesia, ...',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_mapels_kode` (`kode`),
  KEY `idx_mapels_tingkat` (`tingkat`),
  KEY `idx_mapels_aktif` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master mata pelajaran standar Dapodik. Dipakai untuk plot mengajar dan input nilai';



# Dump of table migrations
# ------------------------------------------------------------

DROP TABLE IF EXISTS `migrations`;

CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama file migrasi yang sudah dijalankan, contoh: 2024_01_01_create_users_table',
  `batch` int NOT NULL COMMENT 'Nomor batch migrasi. Semua file dalam satu "php artisan migrate" punya batch yang sama',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Riwayat migrasi database Laravel. Dikelola otomatis, jangan diubah manual';



# Dump of table mutasi_siswas
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mutasi_siswas`;

CREATE TABLE `mutasi_siswas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke siswas.id. Siswa yang mengalami mutasi',
  `jenis_mutasi` enum('masuk','keluar','lulus','nonaktif','meninggal') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Jenis mutasi: masuk=pindah masuk dari sekolah lain, keluar=pindah keluar, lulus=tamat',
  `tanggal` date NOT NULL COMMENT 'Tanggal efektif mutasi berlaku',
  `no_surat` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor surat keputusan/keterangan mutasi',
  `alasan` text COLLATE utf8mb4_unicode_ci COMMENT 'Alasan/latar belakang mutasi',
  `sekolah_asal_tujuan` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama sekolah asal (untuk mutasi masuk) atau sekolah tujuan (untuk mutasi keluar)',
  `diterima_di` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Khusus mutasi masuk: nama madrasah/sekolah sebelumnya yang menerbitkan surat pindah',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Operator yang input data mutasi ini',
  PRIMARY KEY (`id`),
  KEY `idx_mutasi_siswa_id` (`siswa_id`),
  KEY `idx_mutasi_tanggal` (`tanggal`),
  KEY `fk_mutasi_created_by` (`created_by`),
  CONSTRAINT `fk_mutasi_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mutasi_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Riwayat mutasi/perpindahan status siswa (masuk, keluar, lulus, nonaktif). Wajib Dapodik';



# Dump of table nilai_akhirs
# ------------------------------------------------------------

DROP TABLE IF EXISTS `nilai_akhirs`;

CREATE TABLE `nilai_akhirs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke siswas.id',
  `plot_id` bigint unsigned NOT NULL COMMENT 'FK ke plot_guru_mapels.id. Tau ini nilai dari mapel apa',
  `tahun_ajaran_id` bigint unsigned NOT NULL COMMENT 'FK ke tahun_ajarans.id',
  `semester_id` bigint unsigned NOT NULL COMMENT 'FK ke semesters.id',
  `nilai_angka` decimal(5,2) DEFAULT NULL COMMENT 'Nilai akhir numerik 0-100. Rata-rata tertimbang dari semua komponen',
  `nilai_huruf` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Konversi nilai angka ke huruf: A(90-100), B(80-89), C(70-79), D(<70)',
  `predikat` enum('A','B','C','D') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Predikat akhir: A=Sangat Baik, B=Baik, C=Cukup, D=Perlu Bimbingan',
  `deskripsi` text COLLATE utf8mb4_unicode_ci COMMENT 'Deskripsi pencapaian final untuk ditampilkan di rapor (Kurikulum Merdeka)',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_nilaiakhir_siswa_plot_smt` (`siswa_id`,`plot_id`,`semester_id`),
  KEY `idx_nilaiakhir_ta` (`tahun_ajaran_id`),
  KEY `idx_nilaiakhir_smt` (`semester_id`),
  KEY `idx_nilaiakhir_siswa` (`siswa_id`,`semester_id`) COMMENT 'Query semua nilai akhir satu siswa satu semester',
  KEY `fk_nilaiakhir_plot` (`plot_id`),
  CONSTRAINT `fk_nilaiakhir_plot` FOREIGN KEY (`plot_id`) REFERENCES `plot_guru_mapels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_nilaiakhir_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_nilaiakhir_smt` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_nilaiakhir_ta` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cache nilai akhir per mapel per semester. Di-generate otomatis saat finalisasi rapor. JANGAN input manual';



# Dump of table nilais
# ------------------------------------------------------------

DROP TABLE IF EXISTS `nilais`;

CREATE TABLE `nilais` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke siswas.id',
  `plot_id` bigint unsigned NOT NULL COMMENT 'FK ke plot_guru_mapels.id. Tau ini nilai dari guru siapa, mapel apa, kelas apa',
  `komponen_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke komponen_penilaians.id. Komponen apa (Formatif/Sumatif/PTS/Sikap/dll)',
  `tahun_ajaran_id` bigint unsigned NOT NULL COMMENT 'FK ke tahun_ajarans.id. Denormalisasi untuk query cepat',
  `semester_id` bigint unsigned NOT NULL COMMENT 'FK ke semesters.id. Nilai semester berapa',
  `nilai` decimal(5,2) DEFAULT NULL COMMENT 'Nilai angka 0.00-100.00. NULL jika baru diinput status/huruf',
  `nilai_huruf` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nilai huruf/predikat: A, B, C, D atau SB, B, C, PB (Perlu Bimbingan)',
  `deskripsi` text COLLATE utf8mb4_unicode_ci COMMENT 'Deskripsi kualitatif pencapaian (WAJIB Kurikulum Merdeka). Contoh: Ananda menunjukkan pemahaman yang sangat baik...',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Guru yang input nilai ini',
  `updated_by` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Siapa yang terakhir ubah nilai ini',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_nilai_siswa_plot_komponen_smt` (`siswa_id`,`plot_id`,`komponen_id`,`semester_id`),
  KEY `idx_nilai_plot_id` (`plot_id`),
  KEY `idx_nilai_ta_id` (`tahun_ajaran_id`),
  KEY `idx_nilai_smt_id` (`semester_id`),
  KEY `idx_nilai_siswa_smt` (`siswa_id`,`semester_id`) COMMENT 'Query nilai semua mapel satu siswa satu semester (untuk rapor)',
  KEY `fk_nilai_komponen` (`komponen_id`),
  KEY `fk_nilai_created_by` (`created_by`),
  KEY `fk_nilai_updated_by` (`updated_by`),
  CONSTRAINT `fk_nilai_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_nilai_komponen` FOREIGN KEY (`komponen_id`) REFERENCES `komponen_penilaians` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_nilai_plot` FOREIGN KEY (`plot_id`) REFERENCES `plot_guru_mapels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_nilai_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_nilai_smt` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_nilai_ta` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_nilai_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nilai per komponen per mapel per semester. Input guru. Index dioptimasi untuk query generate rapor massal';



# Dump of table operator_profiles
# ------------------------------------------------------------

DROP TABLE IF EXISTS `operator_profiles`;

CREATE TABLE `operator_profiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT 'FK ke users.id. Akun user yang bertugas sebagai operator',
  `nip_operator` varchar(18) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'NIP jika operator adalah PNS',
  `jabatan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Jabatan resmi operator: Staf TU, Kepala TU, dll',
  `akses_modul` json DEFAULT NULL COMMENT 'JSON array modul yang boleh diakses: ["siswa","guru","kelas","nilai","keuangan","laporan"]',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_opprof_user_id` (`user_id`),
  CONSTRAINT `fk_opprof_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Profil operator sekolah. akses_modul JSON menentukan modul yang bisa diakses operator ini';

LOCK TABLES `operator_profiles` WRITE;
/*!40000 ALTER TABLE `operator_profiles` DISABLE KEYS */;

INSERT INTO `operator_profiles` (`id`, `user_id`, `nip_operator`, `jabatan`, `akses_modul`, `created_at`, `updated_at`)
VALUES
	(1,1,NULL,'Operator Sekolah','[\"all\"]','2026-07-13 10:14:43','2026-07-13 10:14:43');

/*!40000 ALTER TABLE `operator_profiles` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table orang_tua_siswa
# ------------------------------------------------------------

DROP TABLE IF EXISTS `orang_tua_siswa`;

CREATE TABLE `orang_tua_siswa` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke siswas.id',
  `orang_tua_id` bigint unsigned NOT NULL COMMENT 'FK ke orang_tuas.id',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ortu_siswa` (`siswa_id`,`orang_tua_id`),
  KEY `idx_ortusiswa_ortu` (`orang_tua_id`),
  CONSTRAINT `fk_ortusiswa_ortu` FOREIGN KEY (`orang_tua_id`) REFERENCES `orang_tuas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ortusiswa_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pivot siswa ↔ orang tua. 1 siswa bisa Ayah+Ibu+Wali. 1 ortu bisa link ke banyak anak (kakak-adik)';



# Dump of table orang_tuas
# ------------------------------------------------------------

DROP TABLE IF EXISTS `orang_tuas`;

CREATE TABLE `orang_tuas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Akun login orang tua (opsional). Diisi saat ortu ingin monitor anak via portal',
  `nama` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama lengkap orang tua/wali',
  `nik` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'NIK orang tua dari KTP. Dipakai untuk verifikasi dan sinkronisasi Dapodik',
  `hubungan` enum('Ayah','Ibu','Wali','Kakek','Nenek','Paman','Bibi','Kakak','Lainnya') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hubungan individu ini dengan siswa',
  `status` enum('Kandung','Tiri','Angkat','Wali') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Kandung' COMMENT 'Status legal hubungan. Kandung=biologis, Wali=bukan orang tua biologis',
  `status_hidup` enum('Masih Hidup','Meninggal','Tidak Diketahui') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Masih Hidup',
  `tempat_lahir` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tahun_lahir` year DEFAULT NULL COMMENT 'Tahun lahir (bukan tanggal lengkap, sesuai standar Dapodik)',
  `jenis_kelamin` enum('L','P') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agama` enum('Islam','Kristen Protestan','Kristen Katolik','Hindu','Buddha','Konghucu','Lainnya') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kewarganegaraan` enum('WNI','WNA') COLLATE utf8mb4_unicode_ci DEFAULT 'WNI',
  `kebutuhan_khusus` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kondisi khusus orang tua (kode Dapodik)',
  `pendidikan` enum('Tidak Sekolah','SD','SMP','SMA/SMK','D1','D2','D3','D4','S1','S2','S3','Lainnya') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Pendidikan terakhir orang tua. Sesuai kode Dapodik',
  `pekerjaan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Pekerjaan orang tua saat ini. Contoh: Petani, Pedagang, PNS, Buruh, dll',
  `penghasilan` enum('Tidak Berpenghasilan','Kurang dari Rp 500.000','Rp 500.000 - Rp 999.999','Rp 1.000.000 - Rp 1.999.999','Rp 2.000.000 - Rp 4.999.999','Rp 5.000.000 - Rp 9.999.999','Lebih dari Rp 10.000.000') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Range penghasilan per bulan sesuai standar Dapodik. Dipakai untuk analisis kemiskinan dan BOS',
  `no_hp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor HP/WA orang tua. Dipakai untuk notifikasi dan komunikasi sekolah',
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email orang tua untuk akun portal dan notifikasi',
  `alamat` text COLLATE utf8mb4_unicode_ci COMMENT 'Alamat lengkap orang tua (bisa beda dengan alamat siswa jika tinggal terpisah)',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ortu_user_id` (`user_id`),
  KEY `idx_ortu_nik` (`nik`),
  KEY `idx_ortu_nama` (`nama`),
  CONSTRAINT `fk_ortu_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master orang tua/wali. Satu baris per individu. Satu ortu bisa linked ke banyak anak via orang_tua_siswa';

LOCK TABLES `orang_tuas` WRITE;
/*!40000 ALTER TABLE `orang_tuas` DISABLE KEYS */;

INSERT INTO `orang_tuas` (`id`, `user_id`, `nama`, `nik`, `hubungan`, `status`, `status_hidup`, `tempat_lahir`, `tahun_lahir`, `jenis_kelamin`, `agama`, `kewarganegaraan`, `kebutuhan_khusus`, `pendidikan`, `pekerjaan`, `penghasilan`, `no_hp`, `email`, `alamat`, `created_at`, `updated_at`, `deleted_at`)
VALUES
	(1,6,'Orang Tua Test',NULL,'Ayah','Kandung','Masih Hidup',NULL,NULL,NULL,NULL,'WNI',NULL,NULL,NULL,NULL,'081234567890',NULL,NULL,'2026-07-20 21:44:26','2026-07-20 21:44:26',NULL);

/*!40000 ALTER TABLE `orang_tuas` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table password_reset_tokens
# ------------------------------------------------------------

DROP TABLE IF EXISTS `password_reset_tokens`;

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Email pengguna yang minta reset password',
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Token reset yang dikirim ke email (sudah di-hash)',
  `created_at` timestamp NULL DEFAULT NULL COMMENT 'Kapan token dibuat. Dipakai untuk cek expired (biasanya 60 menit)',
  PRIMARY KEY (`email`) COMMENT 'Satu email hanya bisa punya satu token aktif sekaligus'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Token reset password sementara. Dihapus setelah dipakai atau expired';



# Dump of table pembayaran_ppdb
# ------------------------------------------------------------

DROP TABLE IF EXISTS `pembayaran_ppdb`;

CREATE TABLE `pembayaran_ppdb` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `calon_siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke calon_siswas.id',
  `jenis` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Jenis pembayaran: Biaya Pendaftaran, Seragam, Formulir, Uang Gedung, dll',
  `nominal` decimal(12,2) NOT NULL COMMENT 'Jumlah yang dibayarkan',
  `status` enum('lunas','belum','cicil') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'belum',
  `tanggal_bayar` date DEFAULT NULL COMMENT 'Tanggal pembayaran diterima. NULL jika belum bayar',
  `no_bukti` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor kwitansi atau referensi pembayaran',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_bayarppdb_calon` (`calon_siswa_id`),
  CONSTRAINT `fk_bayarppdb_calon` FOREIGN KEY (`calon_siswa_id`) REFERENCES `calon_siswas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pembayaran saat PPDB (biaya pendaftaran, seragam, dll). Terpisah dari tagihans siswa aktif';



# Dump of table pembayarans
# ------------------------------------------------------------

DROP TABLE IF EXISTS `pembayarans`;

CREATE TABLE `pembayarans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tagihan_id` bigint unsigned NOT NULL COMMENT 'FK ke tagihans.id. Pembayaran ini untuk tagihan mana',
  `siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke siswas.id. Denormalisasi untuk mempercepat query riwayat pembayaran per siswa',
  `nominal_bayar` decimal(12,2) NOT NULL COMMENT 'Jumlah yang dibayarkan pada transaksi ini (bisa parsial/cicilan)',
  `tanggal_bayar` date NOT NULL COMMENT 'Tanggal uang diterima bendahara/kasir',
  `metode_bayar` enum('tunai','transfer','va','qris','lainnya') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tunai' COMMENT 'Cara pembayaran: tunai=cash di sekolah, va=virtual account bank, qris=QR Code',
  `no_bukti` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor kwitansi (tunai) atau nomor referensi transfer/VA/QRIS',
  `catatan` text COLLATE utf8mb4_unicode_ci COMMENT 'Catatan transaksi: nama teller, keterangan khusus, dll',
  `status` enum('valid','pending','batal') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'valid' COMMENT 'Status transaksi: valid=resmi diterima, pending=menunggu konfirmasi, batal=dibatalkan',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete untuk pembayaran yang dibatalkan (audit trail)',
  `created_by` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Bendahara yang input transaksi ini',
  `updated_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_bayar_tagihan_id` (`tagihan_id`),
  KEY `idx_bayar_siswa_id` (`siswa_id`),
  KEY `idx_bayar_tanggal` (`tanggal_bayar`) COMMENT 'Laporan kas harian',
  KEY `fk_bayar_created_by` (`created_by`),
  KEY `fk_bayar_updated_by` (`updated_by`),
  CONSTRAINT `fk_bayar_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bayar_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bayar_tagihan` FOREIGN KEY (`tagihan_id`) REFERENCES `tagihans` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_bayar_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Riwayat pembayaran tagihan siswa. Mendukung cicilan (satu tagihan bisa banyak transaksi pembayaran)';



# Dump of table pengaturans
# ------------------------------------------------------------

DROP TABLE IF EXISTS `pengaturans`;

CREATE TABLE `pengaturans` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Identifier unik setting, pakai snake_case. Contoh: nama_madrasah, kkm_default',
  `value` text COLLATE utf8mb4_unicode_ci COMMENT 'Nilai setting. Bisa string, angka, JSON array, atau path file',
  `grup` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Pengelompokan di halaman pengaturan: sekolah|akademik|keuangan|notifikasi|tampilan',
  `deskripsi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Penjelasan setting ini untuk ditampilkan di UI admin',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT 'Kapan terakhir setting ini diubah',
  `updated_by` bigint unsigned DEFAULT NULL COMMENT 'User yang terakhir mengubah setting ini',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pengaturan_key` (`key`),
  KEY `idx_pengaturan_grup` (`grup`) COMMENT 'Untuk load semua setting dalam satu grup sekaligus'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Konfigurasi dinamis sistem. Admin bisa ubah tanpa edit kode';

LOCK TABLES `pengaturans` WRITE;
/*!40000 ALTER TABLE `pengaturans` DISABLE KEYS */;

INSERT INTO `pengaturans` (`id`, `key`, `value`, `grup`, `deskripsi`, `updated_at`, `updated_by`)
VALUES
	(1,'nama_madrasah','MI Nurul Huda 3','sekolah','Nama resmi madrasah','2026-07-13 10:14:43',NULL),
	(2,'npsn','','sekolah','Nomor Pokok Sekolah Nasional','2026-07-13 10:14:43',NULL),
	(3,'nsm','','sekolah','Nomor Statistik Madrasah (EMIS)','2026-07-13 10:14:43',NULL),
	(4,'alamat_madrasah','','sekolah','Alamat lengkap madrasah','2026-07-13 10:14:43',NULL),
	(5,'logo','','sekolah','Path logo madrasah','2026-07-13 10:14:43',NULL),
	(6,'kepala_madrasah','','sekolah','Nama kepala madrasah aktif','2026-07-13 10:14:43',NULL),
	(7,'kode_registrasi_ortu','','akademik','Kode untuk registrasi akun ortu','2026-07-13 10:14:43',NULL),
	(8,'kurikulum_aktif','Merdeka','akademik','K13 atau Merdeka','2026-07-13 10:14:43',NULL),
	(9,'kkm_default','70','akademik','KKM/KKTP default nilai','2026-07-13 10:14:43',NULL),
	(10,'hari_efektif','[\"Senin\",\"Selasa\",\"Rabu\",\"Kamis\",\"Jumat\",\"Sabtu\"]','akademik','Hari sekolah aktif','2026-07-13 10:17:49',NULL),
	(21,'nip_kepala_madrasah','','sekolah','NIP Kepala Madrasah aktif',NULL,NULL);

/*!40000 ALTER TABLE `pengaturans` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table pengumumans
# ------------------------------------------------------------

DROP TABLE IF EXISTS `pengumumans`;

CREATE TABLE `pengumumans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `judul` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Judul pengumuman yang tampil di daftar notifikasi',
  `konten` longtext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Isi lengkap pengumuman. Bisa HTML (rich text) atau plain text',
  `kategori` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kategori: Akademik|Keuangan|Kegiatan|Darurat|Umum',
  `target` set('semua','guru','siswa','ortu','kepsek','wali_kelas','bendahara') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'semua' COMMENT 'Target penerima pengumuman. Bisa multi-target dengan tipe SET',
  `penulis_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Admin/Kepsek yang membuat pengumuman',
  `publish_at` timestamp NULL DEFAULT NULL COMMENT 'Jadwal publish. NULL atau masa lalu = langsung tampil. Masa depan = pengumuman terjadwal',
  `expired_at` timestamp NULL DEFAULT NULL COMMENT 'Batas tampil pengumuman. NULL = tidak ada batas. Lewat tanggal ini, pengumuman otomatis tersembunyi',
  `is_pinned` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1=Pengumuman penting yang dipinned di atas daftar. 0=Urutan normal (by publish_at)',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pengumuman_publish` (`publish_at`) COMMENT 'Query pengumuman yang sudah publish dan belum expired',
  KEY `idx_pengumuman_target` (`target`),
  KEY `fk_pengumuman_penulis` (`penulis_id`),
  CONSTRAINT `fk_pengumuman_penulis` FOREIGN KEY (`penulis_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pengumuman madrasah ke target audiens. Mendukung penjadwalan (publish_at) dan expired otomatis';

LOCK TABLES `pengumumans` WRITE;
/*!40000 ALTER TABLE `pengumumans` DISABLE KEYS */;

INSERT INTO `pengumumans` (`id`, `judul`, `konten`, `kategori`, `target`, `penulis_id`, `publish_at`, `expired_at`, `is_pinned`, `created_at`, `updated_at`, `deleted_at`)
VALUES
	(1,'Libur Awal Ramadhan 1448 H','Diberitahukan kepada seluruh guru dan staf bahwa libur awal bulan suci Ramadhan akan dimulai pada tanggal 1 Maret 2027 hingga 3 Maret 2027. Kegiatan belajar mengajar akan aktif kembali pada tanggal 4 Maret 2027 dengan jadwal khusus Ramadhan.','Libur','semua',1,'2026-07-11 10:14:43',NULL,0,'2026-07-11 10:14:43','2026-07-11 10:14:43',NULL),
	(2,'Rapat Evaluasi Pembelajaran Semester Ganjil','Diwajibkan kepada seluruh wali kelas dan guru mata pelajaran untuk menghadiri rapat evaluasi pada hari Sabtu pukul 13.00 WIB di ruang guru. Harap membawa dokumen rekap nilai sementara.','Rapat','guru',1,'2026-07-08 10:14:43',NULL,0,'2026-07-08 10:14:43','2026-07-08 10:14:43',NULL),
	(3,'Jadwal Penilaian Tengah Semester (PTS)','Pelaksanaan PTS semester ini akan diselenggarakan secara serentak mulai tanggal 15 Oktober hingga 20 Oktober. Guru mapel diharap segera menyerahkan naskah soal paling lambat tanggal 10 Oktober ke bagian kurikulum.','Jadwal Ujian','semua',1,'2026-07-03 10:14:43',NULL,0,'2026-07-03 10:14:43','2026-07-03 10:14:43',NULL),
	(4,'Peringatan Hari Guru Nasional','Akan diadakan upacara bendera khusus dan lomba antar kelas. Seluruh guru diharapkan memakai seragam PGRI pada hari Senin besok.','Informasi','semua',1,'2026-06-23 10:14:43',NULL,0,'2026-06-23 10:14:43','2026-06-23 10:14:43',NULL);

/*!40000 ALTER TABLE `pengumumans` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table perkembangan_siswas
# ------------------------------------------------------------

DROP TABLE IF EXISTS `perkembangan_siswas`;

CREATE TABLE `perkembangan_siswas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke siswas.id',
  `tahun_ajaran_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke tahun_ajarans.id',
  `semester_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke semesters.id. Pengukuran dilakukan awal semester',
  `tinggi_badan` decimal(5,2) DEFAULT NULL COMMENT 'Tinggi badan saat ini dalam CM',
  `berat_badan` decimal(5,2) DEFAULT NULL COMMENT 'Berat badan saat ini dalam KG',
  `catatan_kesehatan` text COLLATE utf8mb4_unicode_ci COMMENT 'Catatan kondisi kesehatan siswa pada semester ini. Diisi dokter sekolah atau wali kelas',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_perkemb_siswa_smt` (`siswa_id`,`semester_id`) COMMENT 'Satu pengukuran per siswa per semester',
  KEY `idx_perkemb_ta` (`tahun_ajaran_id`),
  KEY `fk_perkemb_smt` (`semester_id`),
  CONSTRAINT `fk_perkemb_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_perkemb_smt` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_perkemb_ta` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Riwayat fisik siswa per semester (tinggi, berat, kesehatan). Ditampilkan di bagian bawah rapor';



# Dump of table personal_access_tokens
# ------------------------------------------------------------

DROP TABLE IF EXISTS `personal_access_tokens`;

CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama class model yang memiliki token ini (App\\Models\\User)',
  `tokenable_id` bigint unsigned NOT NULL COMMENT 'ID record dari tokenable_type',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama token untuk identifikasi, contoh: web, mobile-android',
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hash SHA-256 dari actual token. Actual token hanya ditampilkan sekali saat dibuat',
  `abilities` text COLLATE utf8mb4_unicode_ci COMMENT 'JSON array hak akses token, contoh: ["siswa:read","nilai:write"]',
  `last_used_at` timestamp NULL DEFAULT NULL COMMENT 'Kapan terakhir token ini dipakai untuk request',
  `expires_at` timestamp NULL DEFAULT NULL COMMENT 'Tanggal kadaluarsa token. NULL = tidak expire',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pat_token` (`token`),
  KEY `idx_pat_tokenable` (`tokenable_type`,`tokenable_id`),
  KEY `idx_pat_expires` (`expires_at`) COMMENT 'Untuk query dan cleanup token expired'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Token API Sanctum untuk autentikasi stateless React/mobile';

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`)
VALUES
	(13,'App\\Models\\User',1,'auth_token','819b58cf91da9c9773e0a4486dd2033dec3d948fcf5c79720e9344cba0b4e9e6','[\"*\"]','2026-07-24 19:55:02',NULL,'2026-07-20 21:48:50','2026-07-24 19:55:02');

/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table plot_guru_mapels
# ------------------------------------------------------------

DROP TABLE IF EXISTS `plot_guru_mapels`;

CREATE TABLE `plot_guru_mapels` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `guru_id` bigint unsigned NOT NULL COMMENT 'FK ke gurus.id. Guru yang bertugas mengajar',
  `mapel_id` bigint unsigned NOT NULL COMMENT 'FK ke mapels.id. Mata pelajaran yang diajar',
  `kelas_id` bigint unsigned NOT NULL COMMENT 'FK ke kelas.id. Kelas tempat mengajar',
  `tahun_ajaran_id` bigint unsigned NOT NULL COMMENT 'FK ke tahun_ajarans.id',
  `semester_id` bigint unsigned NOT NULL COMMENT 'FK ke semesters.id. Penugasan ini hanya berlaku semester ini',
  `beban_jam` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'Beban mengajar dalam jam/minggu untuk mapel ini di kelas ini. Dipakai untuk hitung total jam mengajar guru',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=Penugasan aktif. 0=Sudah tidak aktif (misal guru cuti atau diganti)',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_plot_guru_mapel_kelas` (`guru_id`,`mapel_id`,`kelas_id`,`semester_id`),
  KEY `idx_plot_mapel_id` (`mapel_id`),
  KEY `idx_plot_kelas_id` (`kelas_id`),
  KEY `idx_plot_ta_id` (`tahun_ajaran_id`),
  KEY `idx_plot_smt_id` (`semester_id`),
  CONSTRAINT `fk_plot_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_plot_kelas` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_plot_mapel` FOREIGN KEY (`mapel_id`) REFERENCES `mapels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_plot_smt` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_plot_ta` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Penugasan resmi guru mengajar mapel di kelas. Pusat referensi untuk input nilai dan absensi per mapel';



# Dump of table prestasis
# ------------------------------------------------------------

DROP TABLE IF EXISTS `prestasis`;

CREATE TABLE `prestasis` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke siswas.id. Siswa yang meraih prestasi',
  `nama` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama/judul kompetisi atau prestasi yang diraih',
  `jenis` enum('Akademik','Non-Akademik','Olahraga','Seni','Lainnya') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tingkat` enum('Sekolah','Kecamatan','Kabupaten/Kota','Provinsi','Nasional','Internasional') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tingkat/skala kompetisi. Semakin tinggi semakin bergengsi',
  `peringkat` tinyint unsigned DEFAULT NULL COMMENT 'Peringkat yang diraih: 1=Juara 1, 2=Juara 2, 3=Juara 3, dst',
  `tahun` year DEFAULT NULL COMMENT 'Tahun saat prestasi diraih',
  `penyelenggara` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Instansi/lembaga penyelenggara kompetisi',
  `file_bukti` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Path scan sertifikat/piagam prestasi yang diupload',
  `keterangan` text COLLATE utf8mb4_unicode_ci COMMENT 'Deskripsi tambahan tentang prestasi ini',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prestasi_siswa_id` (`siswa_id`),
  CONSTRAINT `fk_prestasi_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Riwayat prestasi siswa (akademik dan non-akademik). Dilaporkan ke Dapodik dan ditampilkan di rapor';



# Dump of table program_kesejahteraan_siswas
# ------------------------------------------------------------

DROP TABLE IF EXISTS `program_kesejahteraan_siswas`;

CREATE TABLE `program_kesejahteraan_siswas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke siswas.id. One-to-one',
  `penerima_kps_pkh` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1=Siswa/keluarga menerima KPS (Kartu Perlindungan Sosial) atau PKH (Program Keluarga Harapan)',
  `no_kps_pkh` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor KPS atau PKH yang diterima keluarga',
  `layak_pip` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1=Siswa layak mendapat PIP (Program Indonesia Pintar) berdasarkan kriteria kemiskinan',
  `alasan_layak_pip` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Alasan kelayakan PIP: Yatim|Piatu|Yatim Piatu|Miskin|dll',
  `penerima_kip` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1=Siswa sudah/sedang memegang KIP (Kartu Indonesia Pintar) aktif',
  `no_kip` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor KIP yang dipegang siswa',
  `nama_tertera_di_kip` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama yang tercetak di KIP (kadang berbeda dengan data siswa)',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT 'Terakhir diupdate (tidak ada created_at karena dibuat bersamaan dengan siswa)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_prokesej_siswa` (`siswa_id`),
  CONSTRAINT `fk_prokesej_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Status program kesejahteraan pemerintah per siswa (KPS/PKH, KIP, PIP). Untuk laporan BOS';



# Dump of table rapors
# ------------------------------------------------------------

DROP TABLE IF EXISTS `rapors`;

CREATE TABLE `rapors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke siswas.id',
  `kelas_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke kelas.id. Kelas siswa saat rapor diterbitkan (snapshot)',
  `tahun_ajaran_id` bigint unsigned NOT NULL COMMENT 'FK ke tahun_ajarans.id',
  `semester_id` bigint unsigned NOT NULL COMMENT 'FK ke semesters.id. Rapor semester mana',
  `wali_kelas_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke gurus.id. Wali kelas yang finalisasi dan tanda tangan rapor',
  `total_hadir` smallint unsigned DEFAULT NULL COMMENT 'Total hari hadir semester ini (dari tabel absensis)',
  `total_sakit` smallint unsigned DEFAULT NULL COMMENT 'Total hari tidak masuk dengan keterangan sakit',
  `total_izin` smallint unsigned DEFAULT NULL COMMENT 'Total hari tidak masuk dengan izin resmi',
  `total_alpa` smallint unsigned DEFAULT NULL COMMENT 'Total hari tidak masuk tanpa keterangan (alpa)',
  `catatan_wali` text COLLATE utf8mb4_unicode_ci COMMENT 'Catatan/pesan wali kelas untuk orang tua. Ditampilkan di halaman terakhir rapor',
  `deskripsi_sikap_spiritual` text COLLATE utf8mb4_unicode_ci COMMENT 'Deskripsi penilaian sikap spiritual (KI-1). Wajib Kurikulum K13 dan Merdeka',
  `deskripsi_sikap_sosial` text COLLATE utf8mb4_unicode_ci COMMENT 'Deskripsi penilaian sikap sosial (KI-2). Wajib Kurikulum K13 dan Merdeka',
  `status` enum('draft','final') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft' COMMENT 'draft=masih bisa diedit, final=sudah dikunci dan bisa dicetak',
  `status_kenaikan` enum('Naik Kelas','Tinggal Kelas','Lulus','Tidak Lulus') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Keputusan kenaikan kelas atau kelulusan. Diisi saat rapor semester genap',
  `finalisasi_at` timestamp NULL DEFAULT NULL COMMENT 'Kapan rapor difinalisasi (status berubah jadi final)',
  `finalisasi_oleh` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Siapa yang finalisasi (wali kelas atau kepala madrasah)',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rapor_siswa_smt` (`siswa_id`,`semester_id`) COMMENT 'Constraint kritis: satu rapor per siswa per semester',
  KEY `idx_rapor_ta` (`tahun_ajaran_id`),
  KEY `idx_rapor_kelas` (`kelas_id`),
  KEY `idx_rapor_status` (`status`) COMMENT 'Filter rapor yang belum final (masih draft)',
  KEY `fk_rapor_smt` (`semester_id`),
  KEY `fk_rapor_walikelas` (`wali_kelas_id`),
  KEY `fk_rapor_finalisasi` (`finalisasi_oleh`),
  CONSTRAINT `fk_rapor_finalisasi` FOREIGN KEY (`finalisasi_oleh`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rapor_kelas` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rapor_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rapor_smt` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rapor_ta` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rapor_walikelas` FOREIGN KEY (`wali_kelas_id`) REFERENCES `gurus` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Header rapor siswa per semester. Detail nilai ada di nilai_akhirs. Status final = bisa dicetak PDF';



# Dump of table riwayat_kelas
# ------------------------------------------------------------

DROP TABLE IF EXISTS `riwayat_kelas`;

CREATE TABLE `riwayat_kelas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke siswas.id',
  `kelas_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke kelas.id. NULL jika kelas sudah dihapus tapi history harus tetap ada',
  `nama_kelas_snapshot` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Snapshot nama kelas saat itu. Tetap tersimpan walau kelas dihapus',
  `tahun_ajaran_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke tahun_ajarans.id',
  `semester_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke semesters.id',
  `no_absen` tinyint unsigned DEFAULT NULL COMMENT 'Nomor absen siswa di kelas ini. Unik dalam satu kelas',
  `tanggal_masuk` date DEFAULT NULL COMMENT 'Tanggal siswa mulai belajar di kelas ini',
  `tanggal_keluar` date DEFAULT NULL COMMENT 'Tanggal siswa pindah keluar dari kelas ini. NULL jika masih di kelas ini',
  `jenis_perubahan` enum('masuk_baru','naik_kelas','turun_kelas','pindah_kelas','mutasi_masuk','mutasi_keluar','lulus','nonaktif','masuk_kembali','meninggal') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Alasan perubahan kelas/status. Penting untuk rekap kesiswaan',
  `catatan` text COLLATE utf8mb4_unicode_ci COMMENT 'Keterangan tambahan tentang perpindahan kelas ini',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_riwkel_siswa_id` (`siswa_id`),
  KEY `idx_riwkel_kelas_id` (`kelas_id`),
  KEY `idx_riwkel_ta_id` (`tahun_ajaran_id`),
  KEY `fk_riwkel_smt` (`semester_id`),
  CONSTRAINT `fk_riwkel_kelas` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_riwkel_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_riwkel_smt` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_riwkel_ta` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Histori penempatan siswa di kelas dari awal masuk sampai lulus. Rekam jejak lengkap kesiswaan';



# Dump of table roles
# ------------------------------------------------------------

DROP TABLE IF EXISTS `roles`;

CREATE TABLE `roles` (
  `id` tinyint unsigned NOT NULL AUTO_INCREMENT COMMENT 'Max 255 role, lebih dari cukup untuk sekolah',
  `slug` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Identifier unik dalam kode: kepsek|operator|guru|wali_kelas|bendahara|ortu|admin_ppdb',
  `nama` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama tampil role, contoh: Kepala Madrasah, Operator Sekolah',
  `deskripsi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Penjelasan singkat tentang hak akses role ini',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=Role aktif bisa diassign, 0=Nonaktif (soft disable)',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_slug` (`slug`) COMMENT 'Slug dipakai di kode PHP untuk cek role, harus unik'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master role akses sistem. Diisi via seeder, jarang berubah';

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;

INSERT INTO `roles` (`id`, `slug`, `nama`, `deskripsi`, `is_active`, `created_at`, `updated_at`)
VALUES
	(1,'kepsek','Kepala Madrasah','Akses penuh baca semua modul, approve rapor',1,'2026-07-13 10:14:43','2026-07-13 10:14:43'),
	(2,'operator','Operator','Kelola master data, akun, dan konfigurasi sistem',1,'2026-07-13 10:14:43','2026-07-13 10:14:43'),
	(3,'guru','Guru Pengajar','Input nilai, absensi kelas yang diajar',1,'2026-07-13 10:14:43','2026-07-13 10:14:43'),
	(4,'wali_kelas','Wali Kelas','Kelola kelas, absensi, catatan, finalisasi rapor',1,'2026-07-13 10:14:43','2026-07-13 10:14:43'),
	(5,'bendahara','Bendahara','Kelola tagihan, pembayaran, laporan keuangan',1,'2026-07-13 10:14:43','2026-07-13 10:14:43'),
	(6,'ortu','Orang Tua/Wali','Pantau data anak, nilai, absensi, pembayaran',1,'2026-07-13 10:14:43','2026-07-13 10:14:43'),
	(7,'admin_ppdb','Admin PPDB','Kelola penerimaan peserta didik baru',1,'2026-07-13 10:14:43','2026-07-13 10:14:43');

/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table semesters
# ------------------------------------------------------------

DROP TABLE IF EXISTS `semesters`;

CREATE TABLE `semesters` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tahun_ajaran_id` bigint unsigned NOT NULL COMMENT 'FK ke tahun_ajarans.id. Semester ini milik tahun ajaran mana',
  `nama` enum('Ganjil','Genap') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama semester sesuai standar Dapodik. Ganjil=Juli-Desember, Genap=Januari-Juni',
  `tgl_mulai` date DEFAULT NULL COMMENT 'Tanggal hari pertama efektif semester ini',
  `tgl_selesai` date DEFAULT NULL COMMENT 'Tanggal hari terakhir efektif semester (termasuk ujian)',
  `is_active` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1=Semester yang sedang berjalan. Dipakai untuk default di form input nilai/absensi',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_semester_ta_nama` (`tahun_ajaran_id`,`nama`),
  CONSTRAINT `fk_smt_ta` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Semester per tahun ajaran. Satu tahun ajaran = 2 semester (Ganjil + Genap)';

LOCK TABLES `semesters` WRITE;
/*!40000 ALTER TABLE `semesters` DISABLE KEYS */;

INSERT INTO `semesters` (`id`, `tahun_ajaran_id`, `nama`, `tgl_mulai`, `tgl_selesai`, `is_active`, `created_at`, `updated_at`, `deleted_at`)
VALUES
	(1,1,'Ganjil','2026-07-05','2026-12-31',0,'2026-07-13 10:14:43','2026-07-23 22:16:39',NULL),
	(4,1,'Genap','2027-01-02','2027-06-30',0,'2026-07-22 21:24:55','2026-07-23 22:16:39',NULL),
	(5,4,'Ganjil','2026-07-05','2026-12-31',1,'2026-07-22 21:28:31','2026-07-23 22:16:39',NULL),
	(6,4,'Genap','2027-01-02','2027-06-30',0,'2026-07-22 21:28:31','2026-07-23 22:16:39',NULL),
	(9,6,'Ganjil','2028-07-12','2028-12-31',0,'2026-07-23 14:36:02','2026-07-23 22:16:39',NULL),
	(10,6,'Genap','2029-01-02','2029-06-29',0,'2026-07-23 14:36:02','2026-07-23 22:16:39',NULL);

/*!40000 ALTER TABLE `semesters` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sessions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sessions`;

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID unik session (random string panjang)',
  `user_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. NULL jika session guest (belum login)',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP address saat session dibuat. varchar(45) untuk IPv6',
  `user_agent` text COLLATE utf8mb4_unicode_ci COMMENT 'Browser/device string. Dipakai untuk keamanan session hijacking',
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Data session yang di-serialize dan di-encrypt Laravel',
  `last_activity` int NOT NULL COMMENT 'Unix timestamp aktivitas terakhir. Dipakai untuk expire session idle',
  PRIMARY KEY (`id`),
  KEY `idx_sessions_user_id` (`user_id`),
  KEY `idx_sessions_last_activity` (`last_activity`) COMMENT 'Untuk cleanup session expired (php artisan session:clear)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Session database driver Laravel. Aktif jika SESSION_DRIVER=database';



# Dump of table siswa_ekskuls
# ------------------------------------------------------------

DROP TABLE IF EXISTS `siswa_ekskuls`;

CREATE TABLE `siswa_ekskuls` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke siswas.id',
  `ekskul_id` bigint unsigned NOT NULL COMMENT 'FK ke ekskuls.id',
  `tahun_ajaran_id` bigint unsigned NOT NULL COMMENT 'FK ke tahun_ajarans.id',
  `semester_id` bigint unsigned NOT NULL COMMENT 'FK ke semesters.id. Nilai ekskul dinilai per semester',
  `predikat` enum('A','B','C','D') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Predikat partisipasi: A=Sangat Baik, B=Baik, C=Cukup, D=Kurang. Tampil di rapor',
  `keterangan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Catatan singkat dari pembina ekskul',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_siswekskul` (`siswa_id`,`ekskul_id`,`semester_id`),
  KEY `fk_sewekskul_ekskul` (`ekskul_id`),
  KEY `fk_sewekskul_ta` (`tahun_ajaran_id`),
  KEY `fk_sewekskul_smt` (`semester_id`),
  CONSTRAINT `fk_sewekskul_ekskul` FOREIGN KEY (`ekskul_id`) REFERENCES `ekskuls` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sewekskul_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sewekskul_smt` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sewekskul_ta` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Keikutsertaan dan predikat siswa di ekskul per semester. Ditampilkan di rapor';



# Dump of table siswas
# ------------------------------------------------------------

DROP TABLE IF EXISTS `siswas`;

CREATE TABLE `siswas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Akun login siswa. Opsional, diisi saat siswa diberikan akses login',
  `nisn` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor Induk Siswa Nasional 10 digit dari Kemdikbud. Kunci sinkronisasi Dapodik',
  `nis` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor Induk Siswa lokal yang ditetapkan madrasah. Formatnya bebas sesuai kebijakan sekolah',
  `nik` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'NIK dari KTP/KK anak. Wajib Dapodik sejak 2022',
  `no_kk` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor Kartu Keluarga 16 digit. Dipakai untuk verifikasi data keluarga',
  `nama_kepala_keluarga` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama kepala keluarga di KK. Dipakai saat orang tua tidak ada di KK (wali)',
  `kode_anak` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kode unik 10 karakter untuk orang tua link akun ke anak. Digenerate otomatis sistem',
  `nama` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama lengkap siswa sesuai akta kelahiran/KK. Tanpa singkatan',
  `jenis_kelamin` enum('L','P') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'L=Laki-laki, P=Perempuan',
  `tempat_lahir` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kota/kabupaten tempat lahir sesuai akta kelahiran',
  `tanggal_lahir` date DEFAULT NULL COMMENT 'Tanggal lahir sesuai akta kelahiran',
  `agama` enum('Islam','Kristen Protestan','Kristen Katolik','Hindu','Buddha','Konghucu','Lainnya') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `golongan_darah` enum('A','B','AB','O','-') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '-' COMMENT '- = tidak diketahui',
  `kewarganegaraan` enum('WNI','WNA') COLLATE utf8mb4_unicode_ci DEFAULT 'WNI' COMMENT 'WNI=Warga Negara Indonesia, WNA=Asing',
  `nama_ibu_kandung` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama ibu kandung. WAJIB Dapodik. Dipakai untuk verifikasi identitas resmi',
  `anak_ke` tinyint unsigned DEFAULT NULL COMMENT 'Urutan anak ke berapa dalam keluarga. Dari akta atau KK',
  `jumlah_saudara` tinyint unsigned DEFAULT NULL COMMENT 'Total jumlah saudara kandung (tidak termasuk diri sendiri)',
  `status_dalam_keluarga` enum('Kandung','Tiri','Angkat') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Status siswa dalam keluarga',
  `pembiaya_sekolah` enum('Orang Tua','Sendiri','Pemerintah','Lembaga','Lainnya') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Sumber pembiayaan sekolah. Penting untuk data BOS dan beasiswa',
  `kebutuhan_khusus` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kode kebutuhan khusus Dapodik: Tidak Ada|A (Tuna Netra)|B (Tuna Rungu)|C (Tuna Grahita)|dll',
  `riwayat_penyakit` text COLLATE utf8mb4_unicode_ci COMMENT 'Penyakit yang pernah/sedang diderita. Penting untuk penanganan darurat di sekolah',
  `imunisasi` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Status imunisasi dasar: Lengkap|Tidak Lengkap|Tidak Diketahui',
  `alamat_jalan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama jalan, nomor rumah',
  `rt` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor RT',
  `rw` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor RW',
  `desa_kelurahan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama desa/kelurahan',
  `kecamatan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama kecamatan',
  `kota_kabupaten` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama kota/kabupaten',
  `provinsi` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama provinsi',
  `kode_pos` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kode pos area',
  `jarak_tempat_tinggal` decimal(5,1) DEFAULT NULL COMMENT 'Jarak rumah ke sekolah dalam KM. Untuk data BOS dan analisis zonasi',
  `waktu_tempuh` smallint unsigned DEFAULT NULL COMMENT 'Waktu tempuh dari rumah ke sekolah dalam menit',
  `moda_transportasi` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Alat transportasi ke sekolah: Jalan Kaki|Sepeda|Motor|Angkot|Mobil|dll',
  `asal_sekolah` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama sekolah asal sebelum masuk madrasah ini (TK/PAUD/RA untuk kelas 1)',
  `tanggal_masuk` date DEFAULT NULL COMMENT 'Tanggal resmi siswa diterima/masuk madrasah ini',
  `tingkat` tinyint unsigned NOT NULL DEFAULT '1' COMMENT 'Tingkat kelas saat ini: 1-6 untuk MI. Diupdate setiap naik kelas',
  `status` enum('aktif','nonaktif','mutasi_keluar','lulus','meninggal') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'aktif' COMMENT 'Status kesiswaan saat ini. aktif=masih bersekolah di sini',
  `foto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Path foto siswa. Format: siswa/{nisn atau id}/foto.jpg',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete. Siswa lulus/mutasi tidak dihapus agar history tetap ada',
  `created_by` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Siapa yang input data siswa ini',
  `updated_by` bigint unsigned DEFAULT NULL COMMENT 'FK ke users.id. Siapa yang terakhir ubah data siswa ini',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_siswas_nisn` (`nisn`),
  UNIQUE KEY `uq_siswas_nis` (`nis`),
  UNIQUE KEY `uq_siswas_nik` (`nik`),
  UNIQUE KEY `uq_siswas_kode` (`kode_anak`),
  KEY `idx_siswas_nama` (`nama`),
  KEY `idx_siswas_status` (`status`),
  KEY `idx_siswas_tingkat` (`tingkat`),
  KEY `idx_siswas_deleted` (`deleted_at`),
  KEY `idx_siswas_user_id` (`user_id`),
  KEY `fk_siswas_created_by` (`created_by`),
  KEY `fk_siswas_updated_by` (`updated_by`),
  CONSTRAINT `fk_siswas_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_siswas_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_siswas_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Data induk siswa standar Dapodik. Tabel pusat yang direferensi hampir semua tabel lain';

LOCK TABLES `siswas` WRITE;
/*!40000 ALTER TABLE `siswas` DISABLE KEYS */;

INSERT INTO `siswas` (`id`, `user_id`, `nisn`, `nis`, `nik`, `no_kk`, `nama_kepala_keluarga`, `kode_anak`, `nama`, `jenis_kelamin`, `tempat_lahir`, `tanggal_lahir`, `agama`, `golongan_darah`, `kewarganegaraan`, `nama_ibu_kandung`, `anak_ke`, `jumlah_saudara`, `status_dalam_keluarga`, `pembiaya_sekolah`, `kebutuhan_khusus`, `riwayat_penyakit`, `imunisasi`, `alamat_jalan`, `rt`, `rw`, `desa_kelurahan`, `kecamatan`, `kota_kabupaten`, `provinsi`, `kode_pos`, `jarak_tempat_tinggal`, `waktu_tempuh`, `moda_transportasi`, `asal_sekolah`, `tanggal_masuk`, `tingkat`, `status`, `foto`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`)
VALUES
	(1,NULL,'0987654321','234567890','2345678901567890','1234567890123456','hjggyugughjh','MFZCODXUI0','muhammad sahal anwar hadi','L','bogor','2006-11-25','Islam','A','WNI','hggyyygggjjgjh',1,10,'Kandung','Orang Tua',NULL,NULL,'Lengkap','trftyfghvvawesrdtfyguhlijknhbgvfdsqwertyugvfrertykuhmghfgndgesfc','001','002','kencana','tanah sareal','kota bogor','jawa barat','12345',3.5,10,'motor','Tk nurul huda','2026-07-05',1,'aktif','foto-siswa/YssUBq0D6ESG79iaHrrHKhiKA9w3YnbwAaelbtG3.png','2026-07-21 13:48:57','2026-07-22 14:30:38',NULL,NULL,NULL);

/*!40000 ALTER TABLE `siswas` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table tagihans
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tagihans`;

CREATE TABLE `tagihans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `siswa_id` bigint unsigned NOT NULL COMMENT 'FK ke siswas.id. Tagihan ini ditujukan untuk siswa siapa',
  `jenis_tagihan_id` bigint unsigned NOT NULL COMMENT 'FK ke jenis_tagihans.id. Tagihan ini jenis apa',
  `tahun_ajaran_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke tahun_ajarans.id',
  `bulan` tinyint unsigned DEFAULT NULL COMMENT 'Bulan tagihan 1-12. NULL untuk tagihan tidak rutin (sekali bayar)',
  `nominal_tagihan` decimal(12,2) NOT NULL COMMENT 'Nominal kotor tagihan sebelum diskon',
  `nominal_diskon` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Besaran diskon/potongan: beasiswa, keringanan khusus, dll',
  `nominal_bersih` decimal(12,2) NOT NULL COMMENT 'Nominal yang harus dibayar = nominal_tagihan - nominal_diskon. Harus selalu dihitung ulang saat ada perubahan',
  `jatuh_tempo` date DEFAULT NULL COMMENT 'Tanggal batas pembayaran. Dipakai untuk laporan tunggakan',
  `status` enum('belum','lunas','cicil','bebas') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'belum' COMMENT 'Status bayar: belum=belum bayar, lunas=sudah lunas, cicil=bayar sebagian, bebas=dibebaskan dari tagihan',
  `keterangan` text COLLATE utf8mb4_unicode_ci COMMENT 'Catatan: alasan diskon, keterangan cicilan, dll',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tagihan_siswa_id` (`siswa_id`),
  KEY `idx_tagihan_jenis_id` (`jenis_tagihan_id`),
  KEY `idx_tagihan_ta_bulan` (`tahun_ajaran_id`,`bulan`) COMMENT 'Filter tagihan per bulan tertentu',
  KEY `idx_tagihan_status` (`status`) COMMENT 'Hitung tunggakan (WHERE status=belum)',
  KEY `fk_tagihan_created_by` (`created_by`),
  CONSTRAINT `fk_tagihan_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tagihan_jenis` FOREIGN KEY (`jenis_tagihan_id`) REFERENCES `jenis_tagihans` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_tagihan_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tagihan_ta` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tagihan konkret per siswa per bulan. Dihasilkan dari jenis_tagihans. Dipakai untuk rekap keuangan';



# Dump of table tahun_ajarans
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tahun_ajarans`;

CREATE TABLE `tahun_ajarans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tahun` varchar(9) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: YYYY/YYYY. Contoh: 2025/2026, 2026/2027',
  `is_active` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1=Tahun ajaran yang sedang berjalan. HANYA SATU yang boleh aktif! Enforce via trigger atau aplikasi',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete. Tidak boleh hapus tahun ajaran yang sudah punya data',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tahun_ajaran` (`tahun`),
  KEY `idx_ta_is_active` (`is_active`) COMMENT 'Query cepat "SELECT * WHERE is_active=1" untuk get tahun ajaran aktif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master tahun ajaran. Semua data akademik terikat ke satu tahun ajaran';

LOCK TABLES `tahun_ajarans` WRITE;
/*!40000 ALTER TABLE `tahun_ajarans` DISABLE KEYS */;

INSERT INTO `tahun_ajarans` (`id`, `tahun`, `is_active`, `created_at`, `updated_at`, `deleted_at`)
VALUES
	(1,'2026/2027',0,'2026-07-13 10:14:43','2026-07-23 22:16:39',NULL),
	(4,'2027/2028',1,'2026-07-22 21:26:27','2026-07-23 22:16:39',NULL),
	(6,'2028/2029',0,'2026-07-23 14:36:02','2026-07-23 22:16:39',NULL);

/*!40000 ALTER TABLE `tahun_ajarans` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table user_roles
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user_roles`;

CREATE TABLE `user_roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT 'FK ke users.id. User yang mendapat role ini',
  `role_id` tinyint unsigned NOT NULL COMMENT 'FK ke roles.id. Role yang diberikan ke user',
  `created_at` timestamp NULL DEFAULT NULL COMMENT 'Kapan role ini diberikan ke user (audit)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_roles` (`user_id`,`role_id`),
  KEY `idx_user_roles_role_id` (`role_id`),
  CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pivot many-to-many user ↔ role. Satu user bisa multi-role';

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;

INSERT INTO `user_roles` (`id`, `user_id`, `role_id`, `created_at`)
VALUES
	(1,1,2,'2026-07-13 10:14:43'),
	(2,2,1,'2026-07-20 21:44:26'),
	(3,3,3,'2026-07-20 21:44:26'),
	(4,4,4,'2026-07-20 21:44:26'),
	(5,5,5,'2026-07-20 21:44:26'),
	(6,6,6,'2026-07-20 21:44:26'),
	(7,7,7,'2026-07-20 21:44:42');

/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama lengkap pengguna untuk ditampilkan di UI',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Username alternatif untuk login (selain email). Opsional, harus unik',
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Email utama untuk login dan notifikasi. Harus unik di seluruh sistem',
  `email_verified_at` timestamp NULL DEFAULT NULL COMMENT 'Waktu verifikasi email. NULL = belum diverifikasi (fitur email verification Laravel)',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hash bcrypt password. Jangan pernah simpan plain text',
  `foto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Path foto profil akun. Relatif terhadap storage/app/public',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=Aktif bisa login, 0=Dinonaktifkan (banned/resign). Lebih aman dari hard delete',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Token "ingat saya" Laravel untuk session persisten',
  `last_login_at` timestamp NULL DEFAULT NULL COMMENT 'Waktu terakhir berhasil login. Berguna untuk audit dan deteksi akun tidak aktif',
  `last_login_ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP address terakhir login. varchar(45) untuk mendukung IPv6',
  `created_at` timestamp NULL DEFAULT NULL COMMENT 'Waktu akun dibuat',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT 'Waktu terakhir data akun diubah',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete Laravel. Tidak NULL = akun sudah dihapus tapi data tetap tersimpan',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_username` (`username`),
  KEY `idx_users_is_active` (`is_active`),
  KEY `idx_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Akun autentikasi semua pengguna sistem. Satu akun bisa multi-role via tabel user_roles';

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;

INSERT INTO `users` (`id`, `name`, `username`, `email`, `email_verified_at`, `password`, `foto`, `is_active`, `remember_token`, `last_login_at`, `last_login_ip`, `created_at`, `updated_at`, `deleted_at`)
VALUES
	(1,'Operator Admin','operator','operator@minurulhuda3.sch.id',NULL,'$2y$12$Ka0fZdNKB9MTWq0Afutsr.UmNBzJEA231w5LNVK8gbB8MVlRu7Ucu',NULL,1,NULL,'2026-07-20 21:48:50',NULL,'2026-07-13 10:14:43','2026-07-20 21:48:50',NULL),
	(2,'Kepala Sekolah Test','kepsek','kepsek@minurulhuda3.sch.id',NULL,'$2y$12$Ilx/ZIGRjk3eopeHtT7R6uY.KDbxlIAEP42pwIGf6fyn4ESH1msmi',NULL,1,NULL,'2026-07-20 21:48:19',NULL,'2026-07-20 21:44:26','2026-07-20 21:48:19',NULL),
	(3,'Guru Pengajar Test','guru','guru@minurulhuda3.sch.id',NULL,'$2y$12$BncsGDUitGZP09NJHrpBreU3RUA143ClMgqC20afe4AodYwbDoJKW',NULL,1,NULL,'2026-07-20 21:47:56',NULL,'2026-07-20 21:44:26','2026-07-20 21:47:56',NULL),
	(4,'Wali Kelas Test','walikelas','walikelas@minurulhuda3.sch.id',NULL,'$2y$12$rUj4Ew3FBzqA/wbO1kJXhOb80gAA6b6BKlJJ2RFSXqvd4ldIW2ZoK',NULL,1,NULL,'2026-07-20 21:48:09',NULL,'2026-07-20 21:44:26','2026-07-20 21:48:09',NULL),
	(5,'Bendahara Test','bendahara','bendahara@minurulhuda3.sch.id',NULL,'$2y$12$GxYEfgJTZ7hX5LJBvPcrS.2BgX0qxVqKV70jMy8pjymx4eAqLO3Xi',NULL,1,NULL,'2026-07-20 21:47:32',NULL,'2026-07-20 21:44:26','2026-07-20 21:47:32',NULL),
	(6,'Orang Tua Test','ortu','ortu@minurulhuda3.sch.id',NULL,'$2y$12$Y0SfFgmE2QBkkLok9WkbbOhmPOhgnhOEnfrYgSDeQncl4u3MxIuhS',NULL,1,NULL,NULL,NULL,'2026-07-20 21:44:26','2026-07-20 21:44:26',NULL),
	(7,'Admin PPDB Test','adminppdb','adminppdb@minurulhuda3.sch.id',NULL,'$2y$12$Lr.CpCLqD/1Zq1om.SzUe.6PHVXx64SwiVcBd.i2cTf7hSuFfPxIi',NULL,1,NULL,'2026-07-20 21:47:46',NULL,'2026-07-20 21:44:42','2026-07-20 21:47:46',NULL);

/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table wali_kelas
# ------------------------------------------------------------

DROP TABLE IF EXISTS `wali_kelas`;

CREATE TABLE `wali_kelas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `guru_id` bigint unsigned NOT NULL COMMENT 'FK ke gurus.id. Guru yang ditugaskan sebagai wali kelas',
  `kelas_id` bigint unsigned NOT NULL COMMENT 'FK ke kelas.id. Kelas yang dibina',
  `tahun_ajaran_id` bigint unsigned NOT NULL COMMENT 'FK ke tahun_ajarans.id',
  `semester_id` bigint unsigned DEFAULT NULL COMMENT 'FK ke semesters.id. Bisa per semester atau setahun (NULL)',
  `no_sk` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor SK penugasan wali kelas dari kepala madrasah',
  `tanggal_sk` date DEFAULT NULL COMMENT 'Tanggal penerbitan SK wali kelas',
  `tmt` date DEFAULT NULL COMMENT 'Tanggal Mulai Tugas wali kelas efektif',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=Penugasan ini masih aktif. 0=Sudah digantikan wali kelas lain',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_walikelas_kelas_ta` (`kelas_id`,`tahun_ajaran_id`) COMMENT 'Constraint: satu kelas satu wali per tahun ajaran',
  KEY `idx_walikelas_guru_id` (`guru_id`),
  KEY `fk_walikelas_ta` (`tahun_ajaran_id`),
  CONSTRAINT `fk_walikelas_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_walikelas_ta` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Penugasan resmi wali kelas per kelas per tahun ajaran. Dilengkapi nomor SK untuk akuntabilitas';

LOCK TABLES `wali_kelas` WRITE;
/*!40000 ALTER TABLE `wali_kelas` DISABLE KEYS */;

INSERT INTO `wali_kelas` (`id`, `guru_id`, `kelas_id`, `tahun_ajaran_id`, `semester_id`, `no_sk`, `tanggal_sk`, `tmt`, `is_active`, `created_at`, `updated_at`)
VALUES
	(1,3,1,1,1,'SK-WALIKELAS-01',NULL,NULL,1,'2026-07-20 21:44:26','2026-07-20 21:44:26');

/*!40000 ALTER TABLE `wali_kelas` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
