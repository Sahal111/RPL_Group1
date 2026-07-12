-- =============================================================================
--  MI NURUL HUDA 3 — SIAKAD DATABASE SCHEMA v2.0
--  Standar: Dapodik 2025 + EMIS Kemenag
--  MySQL 8.0+ / InnoDB / utf8mb4_unicode_ci
--  Dioptimasi untuk data jutaan baris
-- =============================================================================

/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE='NO_AUTO_VALUE_ON_ZERO', SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
SET NAMES utf8mb4;

-- =============================================================================
-- BLOK 1: PONDASI — USERS, ROLES, AUTH
-- =============================================================================

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
    `id`          TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `slug`        VARCHAR(30)      NOT NULL COMMENT 'kepsek|operator|guru|wali_kelas|bendahara|ortu|admin_ppdb',
    `nama`        VARCHAR(60)      NOT NULL,
    `deskripsi`   VARCHAR(255)         NULL,
    `is_active`   TINYINT(1)       NOT NULL DEFAULT 1,
    `created_at`  TIMESTAMP            NULL,
    `updated_at`  TIMESTAMP            NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_roles_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Master role akses sistem';

INSERT INTO `roles` (`slug`, `nama`, `deskripsi`, `is_active`, `created_at`, `updated_at`) VALUES
('kepsek',     'Kepala Madrasah', 'Akses penuh baca semua modul, approve rapor',          1, NOW(), NOW()),
('operator',   'Operator',        'Kelola master data, akun, dan konfigurasi sistem',      1, NOW(), NOW()),
('guru',       'Guru Pengajar',   'Input nilai, absensi kelas yang diajar',                1, NOW(), NOW()),
('wali_kelas', 'Wali Kelas',      'Kelola kelas, absensi, catatan, finalisasi rapor',      1, NOW(), NOW()),
('bendahara',  'Bendahara',       'Kelola tagihan, pembayaran, laporan keuangan',          1, NOW(), NOW()),
('ortu',       'Orang Tua/Wali',  'Pantau data anak, nilai, absensi, pembayaran',          1, NOW(), NOW()),
('admin_ppdb', 'Admin PPDB',      'Kelola penerimaan peserta didik baru',                  1, NOW(), NOW());


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id`                BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `name`              VARCHAR(150)     NOT NULL,
    `username`          VARCHAR(50)          NULL COMMENT 'Opsional, untuk login alternatif',
    `email`             VARCHAR(150)     NOT NULL,
    `email_verified_at` TIMESTAMP            NULL,
    `password`          VARCHAR(255)     NOT NULL,
    `foto`              VARCHAR(255)         NULL,
    `is_active`         TINYINT(1)       NOT NULL DEFAULT 1,
    `remember_token`    VARCHAR(100)         NULL,
    `last_login_at`     TIMESTAMP            NULL,
    `last_login_ip`     VARCHAR(45)          NULL,
    `created_at`        TIMESTAMP            NULL,
    `updated_at`        TIMESTAMP            NULL,
    `deleted_at`        TIMESTAMP            NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_users_email`    (`email`),
    UNIQUE KEY `uq_users_username` (`username`),
    KEY `idx_users_is_active`      (`is_active`),
    KEY `idx_users_deleted_at`     (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Akun autentikasi semua pengguna sistem';


-- Pivot user <-> role (many-to-many — satu user bisa punya role ganda, misal guru sekaligus wali_kelas)
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
    `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`    BIGINT UNSIGNED NOT NULL,
    `role_id`    TINYINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_user_roles` (`user_id`, `role_id`),
    KEY `idx_user_roles_role_id` (`role_id`),
    CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
    `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tokenable_type` VARCHAR(255)    NOT NULL,
    `tokenable_id`   BIGINT UNSIGNED NOT NULL,
    `name`           VARCHAR(255)    NOT NULL,
    `token`          VARCHAR(64)     NOT NULL,
    `abilities`      TEXT                NULL,
    `last_used_at`   TIMESTAMP           NULL,
    `expires_at`     TIMESTAMP           NULL,
    `created_at`     TIMESTAMP           NULL,
    `updated_at`     TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_pat_token` (`token`),
    KEY `idx_pat_tokenable` (`tokenable_type`, `tokenable_id`),
    KEY `idx_pat_expires`   (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`     BIGINT UNSIGNED     NULL,
    `action`      VARCHAR(50)     NOT NULL COMMENT 'create|update|delete|login|logout|export',
    `module`      VARCHAR(60)     NOT NULL COMMENT 'siswa|guru|nilai|absensi|...',
    `subject_id`  BIGINT UNSIGNED     NULL COMMENT 'ID record yang diubah',
    `keterangan`  TEXT                NULL,
    `ip_address`  VARCHAR(45)         NULL,
    `user_agent`  VARCHAR(255)        NULL,
    `created_at`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_actlog_user`    (`user_id`),
    KEY `idx_actlog_module`  (`module`),
    KEY `idx_actlog_created` (`created_at`),
    CONSTRAINT `fk_actlog_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit trail seluruh aksi di sistem';


-- =============================================================================
-- BLOK 2: TAHUN AJARAN & SEMESTER
-- =============================================================================

DROP TABLE IF EXISTS `tahun_ajarans`;
CREATE TABLE `tahun_ajarans` (
    `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tahun`      VARCHAR(9)      NOT NULL COMMENT 'Format: 2025/2026',
    `is_active`  TINYINT(1)      NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP           NULL,
    `updated_at` TIMESTAMP           NULL,
    `deleted_at` TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_tahun_ajaran` (`tahun`),
    KEY `idx_ta_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tahun ajaran akademik';

INSERT INTO `tahun_ajarans` (`tahun`, `is_active`, `created_at`, `updated_at`) VALUES
('2026/2027', 1, NOW(), NOW());


DROP TABLE IF EXISTS `semesters`;
CREATE TABLE `semesters` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tahun_ajaran_id` BIGINT UNSIGNED NOT NULL,
    `nama`            ENUM('Ganjil','Genap') NOT NULL,
    `tgl_mulai`       DATE                NULL,
    `tgl_selesai`     DATE                NULL,
    `is_active`       TINYINT(1)      NOT NULL DEFAULT 0,
    `created_at`      TIMESTAMP           NULL,
    `updated_at`      TIMESTAMP           NULL,
    `deleted_at`      TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_semester_ta_nama` (`tahun_ajaran_id`, `nama`),
    CONSTRAINT `fk_smt_ta` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `semesters` (`tahun_ajaran_id`, `nama`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Ganjil', 1, NOW(), NOW());


-- =============================================================================
-- BLOK 3: MASTER GURU (Terpisah per aspek, standar Dapodik)
-- =============================================================================

DROP TABLE IF EXISTS `gurus`;
CREATE TABLE `gurus` (
    `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`            BIGINT UNSIGNED     NULL COMMENT 'Akun login, nullable karena guru mungkin belum punya akun',
    -- Identitas Utama (Dapodik)
    `nuptk`              VARCHAR(16)         NULL COMMENT 'Nomor Unik PTK',
    `nip`                VARCHAR(18)         NULL COMMENT 'NIP PNS, nullable untuk non-PNS',
    `nip_lama`           VARCHAR(9)          NULL,
    `no_karpeg`          VARCHAR(20)         NULL,
    `no_karis_karsu`     VARCHAR(20)         NULL,
    `nik`                VARCHAR(16)         NULL,
    `no_kk`              VARCHAR(16)         NULL,
    -- Data Pribadi
    `nama`               VARCHAR(150)    NOT NULL,
    `gelar_depan`        VARCHAR(30)         NULL,
    `gelar_belakang`     VARCHAR(30)         NULL,
    `jenis_kelamin`      ENUM('L','P')       NULL,
    `tempat_lahir`       VARCHAR(100)        NULL,
    `tanggal_lahir`      DATE                NULL,
    `golongan_darah`     ENUM('A','B','AB','O','-') NOT NULL DEFAULT '-',
    `agama`              ENUM('Islam','Kristen Protestan','Kristen Katolik','Hindu','Buddha','Konghucu','Lainnya') NULL,
    `nama_ibu_kandung`   VARCHAR(150)        NULL,
    -- Kontak & Alamat
    `alamat_jalan`       VARCHAR(255)        NULL,
    `rt`                 VARCHAR(4)          NULL,
    `rw`                 VARCHAR(4)          NULL,
    `desa_kelurahan`     VARCHAR(100)        NULL,
    `kecamatan`          VARCHAR(100)        NULL,
    `kota_kabupaten`     VARCHAR(100)        NULL,
    `provinsi`           VARCHAR(100)        NULL,
    `kode_pos`           VARCHAR(10)         NULL,
    `no_hp`              VARCHAR(20)         NULL,
    `email`              VARCHAR(150)        NULL,
    -- Kepegawaian
    `jenis_ptk`          VARCHAR(50)         NULL COMMENT 'Guru Kelas|Guru Mapel|Kepala Sekolah|Tendik|dll',
    `status_kepegawaian` ENUM('PNS','PPPK','GTY','GTT','Honor','Lainnya') NULL,
    `status_aktif`       TINYINT(1)      NOT NULL DEFAULT 1,
    `tanggal_bergabung`  DATE                NULL,
    `tmt_pns`            DATE                NULL,
    `tmt_gty`            DATE                NULL,
    -- Foto & Verifikasi
    `foto`               VARCHAR(255)        NULL,
    `is_verified`        TINYINT(1)      NOT NULL DEFAULT 0,
    `verified_at`        TIMESTAMP           NULL,
    `verified_by`        BIGINT UNSIGNED     NULL,
    -- Audit
    `created_at`         TIMESTAMP           NULL,
    `updated_at`         TIMESTAMP           NULL,
    `deleted_at`         TIMESTAMP           NULL,
    `created_by`         BIGINT UNSIGNED     NULL,
    `updated_by`         BIGINT UNSIGNED     NULL,
    `deleted_by`         BIGINT UNSIGNED     NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_gurus_nuptk` (`nuptk`),
    UNIQUE KEY `uq_gurus_nip`   (`nip`),
    UNIQUE KEY `uq_gurus_nik`   (`nik`),
    UNIQUE KEY `uq_gurus_email` (`email`),
    KEY `idx_gurus_user_id`     (`user_id`),
    KEY `idx_gurus_nama`        (`nama`),
    KEY `idx_gurus_status`      (`status_aktif`),
    KEY `idx_gurus_deleted`     (`deleted_at`),
    CONSTRAINT `fk_gurus_user`        FOREIGN KEY (`user_id`)     REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_gurus_verified_by` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_gurus_created_by`  FOREIGN KEY (`created_by`)  REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_gurus_updated_by`  FOREIGN KEY (`updated_by`)  REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_gurus_deleted_by`  FOREIGN KEY (`deleted_by`)  REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Data induk guru/PTK standar Dapodik';


-- Kepegawaian & jabatan struktural (riwayat)
DROP TABLE IF EXISTS `guru_jabatans`;
CREATE TABLE `guru_jabatans` (
    `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `guru_id`            BIGINT UNSIGNED NOT NULL,
    `jabatan`            VARCHAR(100)    NOT NULL COMMENT 'Guru Kelas|Wali Kelas|Kepala Sekolah|Bendahara|dll',
    `golongan`           VARCHAR(10)         NULL COMMENT 'I/A .. IV/E',
    `pangkat`            VARCHAR(60)         NULL,
    `status_kepegawaian` VARCHAR(50)         NULL,
    `no_sk`              VARCHAR(80)         NULL,
    `tanggal_sk`         DATE                NULL,
    `tmt_jabatan`        DATE                NULL,
    `tanggal_selesai`    DATE                NULL,
    `is_current`         TINYINT(1)      NOT NULL DEFAULT 0,
    `created_at`         TIMESTAMP           NULL,
    `updated_at`         TIMESTAMP           NULL,
    `deleted_at`         TIMESTAMP           NULL,
    `created_by`         BIGINT UNSIGNED     NULL,
    `updated_by`         BIGINT UNSIGNED     NULL,
    PRIMARY KEY (`id`),
    KEY `idx_gurujab_guru_id`  (`guru_id`),
    KEY `idx_gurujab_current`  (`guru_id`, `is_current`),
    CONSTRAINT `fk_gurujab_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_gurujab_cb`   FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_gurujab_ub`   FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `guru_pendidikans`;
CREATE TABLE `guru_pendidikans` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `guru_id`      BIGINT UNSIGNED NOT NULL,
    `jenjang`      ENUM('SD','SMP','SMA/SMK','D1','D2','D3','D4','S1','S2','S3','Lainnya') NOT NULL,
    `nama_sekolah` VARCHAR(200)    NOT NULL,
    `jurusan`      VARCHAR(150)        NULL,
    `prodi`        VARCHAR(150)        NULL,
    `tahun_masuk`  YEAR                NULL,
    `tahun_lulus`  YEAR            NOT NULL,
    `no_ijazah`    VARCHAR(60)         NULL,
    `file_ijazah`  VARCHAR(255)        NULL,
    `created_at`   TIMESTAMP           NULL,
    `updated_at`   TIMESTAMP           NULL,
    `deleted_at`   TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_gurupend_guru_id` (`guru_id`),
    CONSTRAINT `fk_gurupend_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `guru_sertifikasis`;
CREATE TABLE `guru_sertifikasis` (
    `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `guru_id`            BIGINT UNSIGNED NOT NULL,
    `jenis_sertifikasi`  VARCHAR(80)     NOT NULL COMMENT 'PPG|PLPG|Portofolio|PGSD|dll',
    `no_sertifikat`      VARCHAR(60)     NOT NULL,
    `nrg`                VARCHAR(20)         NULL COMMENT 'Nomor Registrasi Guru',
    `tahun_sertifikasi`  YEAR            NOT NULL,
    `bidang_studi`       VARCHAR(150)        NULL,
    `file_sertifikat`    VARCHAR(255)        NULL,
    `tanggal_terbit`     DATE                NULL,
    `expired_at`         DATE                NULL,
    `created_at`         TIMESTAMP           NULL,
    `updated_at`         TIMESTAMP           NULL,
    `deleted_at`         TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_gurucert_guru_id` (`guru_id`),
    CONSTRAINT `fk_gurucert_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `guru_inpassings`;
CREATE TABLE `guru_inpassings` (
    `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `guru_id`            BIGINT UNSIGNED NOT NULL,
    `no_sk`              VARCHAR(100)    NOT NULL,
    `tanggal_sk`         DATE            NOT NULL,
    `tmt_inpassing`      DATE            NOT NULL,
    `golongan_sesudah`   VARCHAR(10)     NOT NULL,
    `jabatan_fungsional` VARCHAR(80)     NOT NULL DEFAULT 'Guru Pertama',
    `angka_kredit`       VARCHAR(20)         NULL,
    `file_sk`            VARCHAR(255)        NULL,
    `created_at`         TIMESTAMP           NULL,
    `updated_at`         TIMESTAMP           NULL,
    `deleted_at`         TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_guruinp_guru_id` (`guru_id`),
    CONSTRAINT `fk_guruinp_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `guru_diklats`;
CREATE TABLE `guru_diklats` (
    `id`              BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `guru_id`         BIGINT UNSIGNED  NOT NULL,
    `nama_diklat`     VARCHAR(200)     NOT NULL,
    `penyelenggara`   VARCHAR(150)         NULL,
    `jenis`           ENUM('diklat','bimtek','workshop','seminar','pelatihan','kursus') NOT NULL DEFAULT 'diklat',
    `tingkat`         ENUM('Kecamatan','Kabupaten/Kota','Provinsi','Nasional','Internasional') NULL,
    `tanggal_mulai`   DATE                 NULL,
    `tanggal_selesai` DATE                 NULL,
    `jumlah_jam`      SMALLINT UNSIGNED    NULL,
    `no_sertifikat`   VARCHAR(100)         NULL,
    `peran`           ENUM('peserta','narasumber','panitia','moderator') NOT NULL DEFAULT 'peserta',
    `file_sertifikat` VARCHAR(255)         NULL,
    `keterangan`      TEXT                 NULL,
    `created_at`      TIMESTAMP            NULL,
    `updated_at`      TIMESTAMP            NULL,
    `deleted_at`      TIMESTAMP            NULL,
    PRIMARY KEY (`id`),
    KEY `idx_gurudiklat_guru_id` (`guru_id`),
    CONSTRAINT `fk_gurudiklat_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `guru_keluargas`;
CREATE TABLE `guru_keluargas` (
    `id`                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `guru_id`             BIGINT UNSIGNED NOT NULL,
    `status_perkawinan`   ENUM('Belum Menikah','Menikah','Cerai Hidup','Cerai Mati') NULL,
    `nama_pasangan`       VARCHAR(150)        NULL,
    `nik_pasangan`        VARCHAR(16)         NULL,
    `pekerjaan_pasangan`  VARCHAR(100)        NULL,
    `jumlah_anak`         TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at`          TIMESTAMP           NULL,
    `updated_at`          TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_gurukel_guru_id` (`guru_id`),
    CONSTRAINT `fk_gurukel_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `guru_rekenings`;
CREATE TABLE `guru_rekenings` (
    `id`                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `guru_id`               BIGINT UNSIGNED NOT NULL,
    `nama_bank`             VARCHAR(60)     NOT NULL,
    `no_rekening`           VARCHAR(30)     NOT NULL,
    `atas_nama`             VARCHAR(150)        NULL,
    `cabang`                VARCHAR(100)        NULL,
    `npwp`                  VARCHAR(20)         NULL,
    `gaji_pokok`            DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    `tunjangan_fungsional`  DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    `tunjangan_profesi`     DECIMAL(15,2)   NOT NULL DEFAULT 0.00 COMMENT 'Tunjangan sertifikasi',
    `is_primary`            TINYINT(1)      NOT NULL DEFAULT 1,
    `created_at`            TIMESTAMP           NULL,
    `updated_at`            TIMESTAMP           NULL,
    `deleted_at`            TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_guruerek_guru_id` (`guru_id`),
    CONSTRAINT `fk_guruerek_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Dokumen guru (SK, KTP scan, ijazah upload, dll)
DROP TABLE IF EXISTS `guru_dokumens`;
CREATE TABLE `guru_dokumens` (
    `id`                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `guru_id`             BIGINT UNSIGNED NOT NULL,
    `kategori`            ENUM('identitas','kepegawaian','pendidikan','sertifikasi','penghargaan','lainnya') NOT NULL,
    `nama_dokumen`        VARCHAR(200)    NOT NULL,
    `nomor_dokumen`       VARCHAR(100)        NULL,
    `tanggal_dokumen`     DATE                NULL,
    `tanggal_berlaku`     DATE                NULL,
    `tanggal_kadaluarsa`  DATE                NULL,
    `penerbit`            VARCHAR(150)        NULL,
    `file_path`           VARCHAR(255)    NOT NULL,
    `file_type`           VARCHAR(20)         NULL,
    `file_size`           INT UNSIGNED        NULL COMMENT 'Bytes',
    `is_verified`         TINYINT(1)      NOT NULL DEFAULT 0,
    `keterangan`          TEXT                NULL,
    `created_at`          TIMESTAMP           NULL,
    `updated_at`          TIMESTAMP           NULL,
    `deleted_at`          TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_gurudok_guru_id` (`guru_id`),
    CONSTRAINT `fk_gurudok_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Absensi kehadiran guru (bukan absensi siswa)
DROP TABLE IF EXISTS `guru_absensis`;
CREATE TABLE `guru_absensis` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `guru_id`     BIGINT UNSIGNED NOT NULL,
    `tanggal`     DATE            NOT NULL,
    `jam_masuk`   TIME                NULL,
    `jam_pulang`  TIME                NULL,
    `status`      ENUM('Hadir','Izin','Sakit','Alpa','Cuti','Dinas Luar') NOT NULL DEFAULT 'Hadir',
    `keterangan`  TEXT                NULL,
    `created_at`  TIMESTAMP           NULL,
    `updated_at`  TIMESTAMP           NULL,
    `deleted_at`  TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_guruabs_guru_tgl` (`guru_id`, `tanggal`),
    KEY `idx_guruabs_tanggal` (`tanggal`),
    CONSTRAINT `fk_guruabs_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- BLOK 4: PROFIL ROLE KHUSUS (wali_kelas, bendahara, operator, admin_ppdb)
-- =============================================================================

-- Wali kelas (guru yang ditugaskan menjadi wali kelas — per tahun ajaran & kelas)
-- Relasi detail ada di tabel `kelas` (wali_kelas_id FK ke gurus.id)
-- Tabel ini untuk riwayat penugasan wali kelas
DROP TABLE IF EXISTS `wali_kelas`;
CREATE TABLE `wali_kelas` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `guru_id`         BIGINT UNSIGNED NOT NULL,
    `kelas_id`        BIGINT UNSIGNED NOT NULL,
    `tahun_ajaran_id` BIGINT UNSIGNED NOT NULL,
    `semester_id`     BIGINT UNSIGNED     NULL,
    `no_sk`           VARCHAR(80)         NULL,
    `tanggal_sk`      DATE                NULL,
    `tmt`             DATE                NULL,
    `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
    `created_at`      TIMESTAMP           NULL,
    `updated_at`      TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_walikelas_kelas_ta` (`kelas_id`, `tahun_ajaran_id`) COMMENT 'Satu kelas satu wali per tahun ajaran',
    KEY `idx_walikelas_guru_id` (`guru_id`),
    CONSTRAINT `fk_walikelas_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_walikelas_ta`   FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Penugasan wali kelas per tahun ajaran';


DROP TABLE IF EXISTS `bendaharas`;
CREATE TABLE `bendaharas` (
    `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`          BIGINT UNSIGNED NOT NULL,
    `guru_id`          BIGINT UNSIGNED     NULL COMMENT 'Jika bendahara adalah guru aktif',
    `jenis_bendahara`  ENUM('BOS','Rutin','Komite','Umum') NULL COMMENT 'Jenis kewenangan bendahara',
    `no_sk`            VARCHAR(80)         NULL,
    `tanggal_sk`       DATE                NULL,
    `tmt`              DATE                NULL,
    `is_active`        TINYINT(1)      NOT NULL DEFAULT 1,
    `created_at`       TIMESTAMP           NULL,
    `updated_at`       TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_benda_user_id` (`user_id`),
    KEY `idx_benda_guru_id` (`guru_id`),
    CONSTRAINT `fk_benda_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_benda_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `operator_profiles`;
CREATE TABLE `operator_profiles` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`      BIGINT UNSIGNED NOT NULL,
    `nip_operator` VARCHAR(18)         NULL,
    `jabatan`      VARCHAR(100)        NULL,
    `akses_modul`  JSON                NULL COMMENT '["siswa","guru","kelas",...]',
    `created_at`   TIMESTAMP           NULL,
    `updated_at`   TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_opprof_user_id` (`user_id`),
    CONSTRAINT `fk_opprof_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `admin_ppdb_profiles`;
CREATE TABLE `admin_ppdb_profiles` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`      BIGINT UNSIGNED NOT NULL,
    `tahun_ajaran` VARCHAR(9)          NULL,
    `created_at`   TIMESTAMP           NULL,
    `updated_at`   TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_adminppdb_user` (`user_id`),
    CONSTRAINT `fk_adminppdb_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- BLOK 5: MASTER KELAS & MATA PELAJARAN
-- =============================================================================

DROP TABLE IF EXISTS `mapels`;
CREATE TABLE `mapels` (
    `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `kode`              VARCHAR(20)         NULL COMMENT 'Kode Dapodik',
    `nama_mapel`        VARCHAR(150)    NOT NULL,
    `kelompok`          ENUM('A','B','C','Muatan Lokal','Ekstra','Agama','Lainnya') NULL,
    `tingkat`           TINYINT UNSIGNED    NULL COMMENT '1-6 untuk MI, atau NULL untuk semua tingkat',
    `kurikulum`         ENUM('K13','Merdeka','Lainnya') NOT NULL DEFAULT 'Merdeka',
    `jam_per_minggu`    TINYINT UNSIGNED    NULL,
    `is_active`         TINYINT(1)      NOT NULL DEFAULT 1,
    `urutan_rapor`      TINYINT UNSIGNED    NULL COMMENT 'Urutan tampil di rapor',
    `created_at`        TIMESTAMP           NULL,
    `updated_at`        TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_mapels_kode` (`kode`),
    KEY `idx_mapels_tingkat` (`tingkat`),
    KEY `idx_mapels_aktif`   (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Master mata pelajaran standar Dapodik';


DROP TABLE IF EXISTS `kelas`;
CREATE TABLE `kelas` (
    `id`              BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `tahun_ajaran_id` BIGINT UNSIGNED  NOT NULL,
    `semester_id`     BIGINT UNSIGNED      NULL,
    `nama_kelas`      VARCHAR(20)      NOT NULL COMMENT '1-A, 2-B, dst',
    `tingkat`         TINYINT UNSIGNED NOT NULL COMMENT '1-6',
    `kurikulum`       ENUM('K13','Merdeka','Lainnya') NOT NULL DEFAULT 'Merdeka',
    `wali_kelas_id`   BIGINT UNSIGNED      NULL COMMENT 'FK ke gurus.id (shortcut cepat)',
    `kapasitas`       TINYINT UNSIGNED NOT NULL DEFAULT 32,
    `ruangan`         VARCHAR(50)          NULL,
    `is_active`       TINYINT(1)       NOT NULL DEFAULT 1,
    `created_at`      TIMESTAMP            NULL,
    `updated_at`      TIMESTAMP            NULL,
    `deleted_at`      TIMESTAMP            NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_kelas_ta_nama` (`tahun_ajaran_id`, `nama_kelas`),
    KEY `idx_kelas_ta`         (`tahun_ajaran_id`),
    KEY `idx_kelas_tingkat`    (`tingkat`),
    KEY `idx_kelas_walikelas`  (`wali_kelas_id`),
    CONSTRAINT `fk_kelas_ta`   FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_kelas_smt`  FOREIGN KEY (`semester_id`)     REFERENCES `semesters` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_kelas_wali` FOREIGN KEY (`wali_kelas_id`)   REFERENCES `gurus` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `kelas` (`tahun_ajaran_id`, `semester_id`, `nama_kelas`, `tingkat`, `kapasitas`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, '1-A', 1, 32, 1, NOW(), NOW()),
(1, 1, '2-A', 2, 32, 1, NOW(), NOW());


-- Plot guru mengajar mapel di kelas tertentu (penugasan resmi)
DROP TABLE IF EXISTS `plot_guru_mapels`;
CREATE TABLE `plot_guru_mapels` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `guru_id`         BIGINT UNSIGNED NOT NULL,
    `mapel_id`        BIGINT UNSIGNED NOT NULL,
    `kelas_id`        BIGINT UNSIGNED NOT NULL,
    `tahun_ajaran_id` BIGINT UNSIGNED NOT NULL,
    `semester_id`     BIGINT UNSIGNED NOT NULL,
    `beban_jam`       TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
    `created_at`      TIMESTAMP           NULL,
    `updated_at`      TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_plot_guru_mapel_kelas` (`guru_id`, `mapel_id`, `kelas_id`, `semester_id`),
    KEY `idx_plot_mapel_id`  (`mapel_id`),
    KEY `idx_plot_kelas_id`  (`kelas_id`),
    KEY `idx_plot_ta_id`     (`tahun_ajaran_id`),
    KEY `idx_plot_smt_id`    (`semester_id`),
    CONSTRAINT `fk_plot_guru`  FOREIGN KEY (`guru_id`)         REFERENCES `gurus` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_plot_mapel` FOREIGN KEY (`mapel_id`)        REFERENCES `mapels` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_plot_kelas` FOREIGN KEY (`kelas_id`)        REFERENCES `kelas` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_plot_ta`    FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_plot_smt`   FOREIGN KEY (`semester_id`)     REFERENCES `semesters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Penugasan resmi guru mengajar mapel di kelas';


-- Jadwal pelajaran harian
DROP TABLE IF EXISTS `jadwals`;
CREATE TABLE `jadwals` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `plot_id`         BIGINT UNSIGNED NOT NULL COMMENT 'Dari plot_guru_mapels',
    `kelas_id`        BIGINT UNSIGNED NOT NULL,
    `guru_id`         BIGINT UNSIGNED NOT NULL,
    `mapel_id`        BIGINT UNSIGNED NOT NULL,
    `semester_id`     BIGINT UNSIGNED NOT NULL,
    `hari`            ENUM('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu') NOT NULL,
    `jam_ke`          TINYINT UNSIGNED    NULL COMMENT 'Jam pelajaran ke-',
    `jam_mulai`       TIME            NOT NULL,
    `jam_selesai`     TIME            NOT NULL,
    `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
    `created_at`      TIMESTAMP           NULL,
    `updated_at`      TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_jadwal_kelas_hari` (`kelas_id`, `hari`),
    KEY `idx_jadwal_guru_id`    (`guru_id`),
    KEY `idx_jadwal_semester`   (`semester_id`),
    CONSTRAINT `fk_jadwal_plot`  FOREIGN KEY (`plot_id`)    REFERENCES `plot_guru_mapels` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_jadwal_kelas` FOREIGN KEY (`kelas_id`)  REFERENCES `kelas` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_jadwal_guru`  FOREIGN KEY (`guru_id`)   REFERENCES `gurus` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_jadwal_mapel` FOREIGN KEY (`mapel_id`)  REFERENCES `mapels` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_jadwal_smt`   FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- BLOK 6: MASTER SISWA (Terpisah per aspek, standar Dapodik)
-- =============================================================================

DROP TABLE IF EXISTS `siswas`;
CREATE TABLE `siswas` (
    `id`                  BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `user_id`             BIGINT UNSIGNED      NULL COMMENT 'Akun login siswa (opsional)',
    -- Identitas Utama (Dapodik)
    `nisn`                VARCHAR(10)          NULL COMMENT '10 digit NISN Kemdikbud',
    `nis`                 VARCHAR(20)          NULL COMMENT 'Nomor Induk Siswa lokal madrasah',
    `nik`                 VARCHAR(16)          NULL,
    `no_kk`               VARCHAR(16)          NULL,
    `nama_kepala_keluarga` VARCHAR(150)        NULL,
    `kode_anak`           VARCHAR(10)          NULL COMMENT 'Kode unik untuk link akun ortu',
    -- Data Pribadi
    `nama`                VARCHAR(150)     NOT NULL,
    `jenis_kelamin`       ENUM('L','P')        NULL,
    `tempat_lahir`        VARCHAR(100)         NULL,
    `tanggal_lahir`       DATE                 NULL,
    `agama`               ENUM('Islam','Kristen Protestan','Kristen Katolik','Hindu','Buddha','Konghucu','Lainnya') NULL,
    `golongan_darah`      ENUM('A','B','AB','O','-') NOT NULL DEFAULT '-',
    `kewarganegaraan`     ENUM('WNI','WNA')    NULL DEFAULT 'WNI',
    -- Keluarga
    `nama_ibu_kandung`    VARCHAR(150)         NULL COMMENT 'Wajib Dapodik',
    `anak_ke`             TINYINT UNSIGNED     NULL,
    `jumlah_saudara`      TINYINT UNSIGNED     NULL,
    `status_dalam_keluarga` ENUM('Kandung','Tiri','Angkat') NULL,
    `pembiaya_sekolah`    ENUM('Orang Tua','Sendiri','Pemerintah','Lembaga','Lainnya') NULL,
    -- Kesehatan
    `kebutuhan_khusus`    VARCHAR(100)         NULL COMMENT 'Tidak Ada|A|B|C|D|dst (kode Dapodik)',
    `riwayat_penyakit`    TEXT                 NULL,
    `imunisasi`           VARCHAR(50)          NULL,
    -- Alamat
    `alamat_jalan`        VARCHAR(255)         NULL,
    `rt`                  VARCHAR(4)           NULL,
    `rw`                  VARCHAR(4)           NULL,
    `desa_kelurahan`      VARCHAR(100)         NULL,
    `kecamatan`           VARCHAR(100)         NULL,
    `kota_kabupaten`      VARCHAR(100)         NULL,
    `provinsi`            VARCHAR(100)         NULL,
    `kode_pos`            VARCHAR(10)          NULL,
    -- Transportasi (Dapodik)
    `jarak_tempat_tinggal` DECIMAL(5,1)        NULL COMMENT 'KM',
    `waktu_tempuh`        SMALLINT UNSIGNED    NULL COMMENT 'Menit',
    `moda_transportasi`   VARCHAR(50)          NULL,
    -- Pendaftaran & Status
    `asal_sekolah`        VARCHAR(200)         NULL,
    `tanggal_masuk`       DATE                 NULL,
    `tingkat`             TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Tingkat kelas saat ini (1-6)',
    `status`              ENUM('aktif','nonaktif','mutasi_keluar','lulus','meninggal') NOT NULL DEFAULT 'aktif',
    -- Foto
    `foto`                VARCHAR(255)         NULL,
    -- Audit
    `created_at`          TIMESTAMP            NULL,
    `updated_at`          TIMESTAMP            NULL,
    `deleted_at`          TIMESTAMP            NULL,
    `created_by`          BIGINT UNSIGNED      NULL,
    `updated_by`          BIGINT UNSIGNED      NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_siswas_nisn` (`nisn`),
    UNIQUE KEY `uq_siswas_nis`  (`nis`),
    UNIQUE KEY `uq_siswas_nik`  (`nik`),
    UNIQUE KEY `uq_siswas_kode` (`kode_anak`),
    KEY `idx_siswas_nama`       (`nama`),
    KEY `idx_siswas_status`     (`status`),
    KEY `idx_siswas_tingkat`    (`tingkat`),
    KEY `idx_siswas_deleted`    (`deleted_at`),
    KEY `idx_siswas_user_id`    (`user_id`),
    CONSTRAINT `fk_siswas_user`       FOREIGN KEY (`user_id`)    REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_siswas_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_siswas_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Data induk siswa standar Dapodik';


-- Data tambahan siswa (Dapodik & EMIS)
DROP TABLE IF EXISTS `data_tambahan_siswas`;
CREATE TABLE `data_tambahan_siswas` (
    `id`                             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `siswa_id`                       BIGINT UNSIGNED NOT NULL,
    `no_registrasi_akta_kelahiran`   VARCHAR(60)         NULL,
    `no_kip`                         VARCHAR(20)         NULL COMMENT 'Kartu Indonesia Pintar',
    `nama_tertera_kip`               VARCHAR(150)        NULL,
    `lintang`                        DECIMAL(10,8)       NULL COMMENT 'GPS koordinat rumah',
    `bujur`                          DECIMAL(11,8)       NULL,
    `kebutuhan_khusus_ayah`          VARCHAR(50)         NULL,
    `kebutuhan_khusus_ibu`           VARCHAR(50)         NULL,
    `hobi`                           VARCHAR(100)        NULL,
    `cita_cita`                      VARCHAR(100)        NULL,
    `no_telp`                        VARCHAR(20)         NULL,
    `hp_siswa`                       VARCHAR(20)         NULL,
    `email_siswa`                    VARCHAR(150)        NULL,
    `tinggi_badan_awal`              DECIMAL(5,2)        NULL COMMENT 'CM saat masuk',
    `berat_badan_awal`               DECIMAL(5,2)        NULL COMMENT 'KG saat masuk',
    `lingkar_kepala`                 DECIMAL(5,2)        NULL,
    `bahasa_sehari_hari`             VARCHAR(50)         NULL,
    `jenis_tinggal`                  ENUM('Bersama Orang Tua','Wali','Kos','Asrama','Panti','Lainnya') NULL,
    `created_at`                     TIMESTAMP           NULL,
    `updated_at`                     TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_dtambahan_siswa` (`siswa_id`),
    CONSTRAINT `fk_dtambahan_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Data tambahan siswa standar EMIS';


-- Perkembangan fisik siswa per semester
DROP TABLE IF EXISTS `perkembangan_siswas`;
CREATE TABLE `perkembangan_siswas` (
    `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `siswa_id`         BIGINT UNSIGNED NOT NULL,
    `tahun_ajaran_id`  BIGINT UNSIGNED     NULL,
    `semester_id`      BIGINT UNSIGNED     NULL,
    `tinggi_badan`     DECIMAL(5,2)        NULL COMMENT 'CM',
    `berat_badan`      DECIMAL(5,2)        NULL COMMENT 'KG',
    `catatan_kesehatan` TEXT               NULL,
    `created_at`       TIMESTAMP           NULL,
    `updated_at`       TIMESTAMP           NULL,
    `deleted_at`       TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_perkemb_siswa_smt` (`siswa_id`, `semester_id`),
    KEY `idx_perkemb_ta` (`tahun_ajaran_id`),
    CONSTRAINT `fk_perkemb_siswa` FOREIGN KEY (`siswa_id`)        REFERENCES `siswas` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_perkemb_ta`    FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_perkemb_smt`   FOREIGN KEY (`semester_id`)     REFERENCES `semesters` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Program kesejahteraan (PIP, KIP, PKH)
DROP TABLE IF EXISTS `program_kesejahteraan_siswas`;
CREATE TABLE `program_kesejahteraan_siswas` (
    `id`                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `siswa_id`            BIGINT UNSIGNED NOT NULL,
    `penerima_kps_pkh`    TINYINT(1)      NOT NULL DEFAULT 0,
    `no_kps_pkh`          VARCHAR(30)         NULL,
    `layak_pip`           TINYINT(1)      NOT NULL DEFAULT 0,
    `alasan_layak_pip`    VARCHAR(100)        NULL,
    `penerima_kip`        TINYINT(1)      NOT NULL DEFAULT 0,
    `no_kip`              VARCHAR(20)         NULL,
    `nama_tertera_di_kip` VARCHAR(150)        NULL,
    `updated_at`          TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_prokesej_siswa` (`siswa_id`),
    CONSTRAINT `fk_prokesej_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Prestasi siswa
DROP TABLE IF EXISTS `prestasis`;
CREATE TABLE `prestasis` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `siswa_id`     BIGINT UNSIGNED NOT NULL,
    `nama`         VARCHAR(200)    NOT NULL,
    `jenis`        ENUM('Akademik','Non-Akademik','Olahraga','Seni','Lainnya') NULL,
    `tingkat`      ENUM('Sekolah','Kecamatan','Kabupaten/Kota','Provinsi','Nasional','Internasional') NULL,
    `peringkat`    TINYINT UNSIGNED    NULL,
    `tahun`        YEAR                NULL,
    `penyelenggara` VARCHAR(150)       NULL,
    `file_bukti`   VARCHAR(255)        NULL,
    `keterangan`   TEXT                NULL,
    `created_at`   TIMESTAMP           NULL,
    `updated_at`   TIMESTAMP           NULL,
    `deleted_at`   TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_prestasi_siswa_id` (`siswa_id`),
    CONSTRAINT `fk_prestasi_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Beasiswa
DROP TABLE IF EXISTS `beasiswas`;
CREATE TABLE `beasiswas` (
    `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `siswa_id`       BIGINT UNSIGNED NOT NULL,
    `nama`           VARCHAR(150)    NOT NULL,
    `jenis`          VARCHAR(60)         NULL COMMENT 'PIP|BPIB|Swasta|dll',
    `penyelenggara`  VARCHAR(100)        NULL,
    `tahun_mulai`    YEAR                NULL,
    `tahun_selesai`  YEAR                NULL,
    `nominal`        DECIMAL(15,2)       NULL,
    `keterangan`     TEXT                NULL,
    `created_at`     TIMESTAMP           NULL,
    `updated_at`     TIMESTAMP           NULL,
    `deleted_at`     TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_beasiswas_siswa_id` (`siswa_id`),
    CONSTRAINT `fk_beasiswas_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Berkas/dokumen siswa
DROP TABLE IF EXISTS `berkas_siswas`;
CREATE TABLE `berkas_siswas` (
    `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `siswa_id`         BIGINT UNSIGNED NOT NULL,
    `jenis_berkas`     ENUM(
                         'kartu_keluarga',
                         'akte_kelahiran',
                         'ktp_orang_tua',
                         'pas_foto',
                         'ijazah_sebelumnya',
                         'rapor_sekolah_asal',
                         'surat_keterangan_sehat',
                         'kip_pkh_kks',
                         'surat_mutasi',
                         'lainnya'
                       ) NOT NULL,
    `nama_file_asli`   VARCHAR(255)    NOT NULL,
    `nama_file_sistem` VARCHAR(255)    NOT NULL,
    `path_file`        VARCHAR(255)    NOT NULL,
    `ekstensi`         VARCHAR(10)     NOT NULL,
    `ukuran_file`      INT UNSIGNED    NOT NULL COMMENT 'Bytes',
    `is_verified`      TINYINT(1)      NOT NULL DEFAULT 0,
    `verified_by`      BIGINT UNSIGNED     NULL,
    `verified_at`      TIMESTAMP           NULL,
    `created_at`       TIMESTAMP           NULL,
    `updated_at`       TIMESTAMP           NULL,
    `created_by`       BIGINT UNSIGNED     NULL,
    PRIMARY KEY (`id`),
    KEY `idx_berkas_siswa_jenis` (`siswa_id`, `jenis_berkas`),
    CONSTRAINT `fk_berkas_siswa`       FOREIGN KEY (`siswa_id`)    REFERENCES `siswas` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_berkas_created_by`  FOREIGN KEY (`created_by`)  REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_berkas_verified_by` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- BLOK 7: ORANG TUA / WALI (Dipisah per individu, bukan per keluarga)
-- =============================================================================

DROP TABLE IF EXISTS `orang_tuas`;
CREATE TABLE `orang_tuas` (
    `id`              BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `user_id`         BIGINT UNSIGNED      NULL COMMENT 'Akun login ortu jika ada',
    -- Identitas
    `nama`            VARCHAR(150)     NOT NULL,
    `nik`             VARCHAR(16)          NULL,
    `hubungan`        ENUM('Ayah','Ibu','Wali','Kakek','Nenek','Paman','Bibi','Kakak','Lainnya') NOT NULL,
    `status`          ENUM('Kandung','Tiri','Angkat','Wali') NOT NULL DEFAULT 'Kandung',
    `status_hidup`    ENUM('Masih Hidup','Meninggal','Tidak Diketahui') NOT NULL DEFAULT 'Masih Hidup',
    -- Data Pribadi
    `tempat_lahir`    VARCHAR(100)         NULL,
    `tahun_lahir`     YEAR                 NULL,
    `jenis_kelamin`   ENUM('L','P')        NULL,
    `agama`           ENUM('Islam','Kristen Protestan','Kristen Katolik','Hindu','Buddha','Konghucu','Lainnya') NULL,
    `kewarganegaraan` ENUM('WNI','WNA')    NULL DEFAULT 'WNI',
    `kebutuhan_khusus` VARCHAR(50)         NULL,
    -- Ekonomi
    `pendidikan`      ENUM('Tidak Sekolah','SD','SMP','SMA/SMK','D1','D2','D3','D4','S1','S2','S3','Lainnya') NULL,
    `pekerjaan`       VARCHAR(100)         NULL,
    `penghasilan`     ENUM(
                        'Tidak Berpenghasilan',
                        'Kurang dari Rp 500.000',
                        'Rp 500.000 - Rp 999.999',
                        'Rp 1.000.000 - Rp 1.999.999',
                        'Rp 2.000.000 - Rp 4.999.999',
                        'Rp 5.000.000 - Rp 9.999.999',
                        'Lebih dari Rp 10.000.000'
                      ) NULL,
    -- Kontak
    `no_hp`           VARCHAR(20)          NULL,
    `email`           VARCHAR(150)         NULL,
    `alamat`          TEXT                 NULL,
    -- Audit
    `created_at`      TIMESTAMP            NULL,
    `updated_at`      TIMESTAMP            NULL,
    `deleted_at`      TIMESTAMP            NULL,
    PRIMARY KEY (`id`),
    KEY `idx_ortu_user_id` (`user_id`),
    KEY `idx_ortu_nik`     (`nik`),
    KEY `idx_ortu_nama`    (`nama`),
    CONSTRAINT `fk_ortu_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Master orang tua/wali — 1 baris per individu. Satu siswa bisa 1 ortu (hanya ibu) sampai 3+ (ayah, ibu, wali)';


-- Pivot siswa <-> orang_tua (banyak ke banyak: 1 ortu bisa punya banyak anak, 1 anak bisa punya banyak wali)
DROP TABLE IF EXISTS `orang_tua_siswa`;
CREATE TABLE `orang_tua_siswa` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `siswa_id`        BIGINT UNSIGNED NOT NULL,
    `orang_tua_id`    BIGINT UNSIGNED NOT NULL,
    `created_at`      TIMESTAMP           NULL,
    `updated_at`      TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_ortu_siswa` (`siswa_id`, `orang_tua_id`),
    KEY `idx_ortusiswa_ortu` (`orang_tua_id`),
    CONSTRAINT `fk_ortusiswa_siswa` FOREIGN KEY (`siswa_id`)     REFERENCES `siswas` (`id`)     ON DELETE CASCADE,
    CONSTRAINT `fk_ortusiswa_ortu`  FOREIGN KEY (`orang_tua_id`) REFERENCES `orang_tuas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Relasi siswa dengan semua ortu/wali. 1 siswa bisa punya Ayah + Ibu + Wali (3 baris) atau lebih';


-- =============================================================================
-- BLOK 8: RIWAYAT KELAS & MUTASI SISWA
-- =============================================================================

-- Riwayat siswa per kelas per tahun ajaran
DROP TABLE IF EXISTS `riwayat_kelas`;
CREATE TABLE `riwayat_kelas` (
    `id`                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `siswa_id`             BIGINT UNSIGNED NOT NULL,
    `kelas_id`             BIGINT UNSIGNED     NULL,
    `nama_kelas_snapshot`  VARCHAR(30)         NULL COMMENT 'Nama kelas saat itu (untuk history)',
    `tahun_ajaran_id`      BIGINT UNSIGNED     NULL,
    `semester_id`          BIGINT UNSIGNED     NULL,
    `no_absen`             TINYINT UNSIGNED    NULL,
    `tanggal_masuk`        DATE                NULL,
    `tanggal_keluar`       DATE                NULL,
    `jenis_perubahan`      ENUM('masuk_baru','naik_kelas','turun_kelas','pindah_kelas',
                                'mutasi_masuk','mutasi_keluar','lulus','nonaktif',
                                'masuk_kembali','meninggal') NULL,
    `catatan`              TEXT                NULL,
    `created_at`           TIMESTAMP           NULL,
    `updated_at`           TIMESTAMP           NULL,
    `deleted_at`           TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_riwkel_siswa_id` (`siswa_id`),
    KEY `idx_riwkel_kelas_id` (`kelas_id`),
    KEY `idx_riwkel_ta_id`    (`tahun_ajaran_id`),
    CONSTRAINT `fk_riwkel_siswa` FOREIGN KEY (`siswa_id`)        REFERENCES `siswas` (`id`)        ON DELETE CASCADE,
    CONSTRAINT `fk_riwkel_kelas` FOREIGN KEY (`kelas_id`)        REFERENCES `kelas` (`id`)         ON DELETE SET NULL,
    CONSTRAINT `fk_riwkel_ta`    FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_riwkel_smt`   FOREIGN KEY (`semester_id`)     REFERENCES `semesters` (`id`)     ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `mutasi_siswas`;
CREATE TABLE `mutasi_siswas` (
    `id`                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `siswa_id`             BIGINT UNSIGNED NOT NULL,
    `jenis_mutasi`         ENUM('masuk','keluar','lulus','nonaktif','meninggal') NOT NULL,
    `tanggal`              DATE            NOT NULL,
    `no_surat`             VARCHAR(80)         NULL,
    `alasan`               TEXT                NULL,
    `sekolah_asal_tujuan`  VARCHAR(200)        NULL,
    `diterima_di`          VARCHAR(200)        NULL COMMENT 'Untuk mutasi masuk',
    `created_at`           TIMESTAMP           NULL,
    `updated_at`           TIMESTAMP           NULL,
    `created_by`           BIGINT UNSIGNED     NULL,
    PRIMARY KEY (`id`),
    KEY `idx_mutasi_siswa_id` (`siswa_id`),
    KEY `idx_mutasi_tanggal`  (`tanggal`),
    CONSTRAINT `fk_mutasi_siswa`      FOREIGN KEY (`siswa_id`)   REFERENCES `siswas` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_mutasi_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- BLOK 9: ABSENSI SISWA (Dioptimasi untuk volume tinggi)
-- =============================================================================

DROP TABLE IF EXISTS `absensis`;
CREATE TABLE `absensis` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `siswa_id`        BIGINT UNSIGNED NOT NULL,
    `kelas_id`        BIGINT UNSIGNED NOT NULL,
    `jadwal_id`       BIGINT UNSIGNED     NULL COMMENT 'NULL = absensi harian tanpa jadwal spesifik',
    `plot_id`         BIGINT UNSIGNED     NULL COMMENT 'FK ke plot_guru_mapels',
    `tahun_ajaran_id` BIGINT UNSIGNED     NULL,
    `semester_id`     BIGINT UNSIGNED     NULL,
    `tanggal`         DATE            NOT NULL,
    `status`          ENUM('Hadir','Sakit','Izin','Alpa') NOT NULL DEFAULT 'Hadir',
    `keterangan`      TEXT                NULL,
    `dicatat_oleh`    BIGINT UNSIGNED     NULL COMMENT 'FK ke users.id (guru/wali kelas)',
    `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      TIMESTAMP           NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    -- UNIK: satu siswa satu absensi per jadwal per hari (jika ada jadwal)
    -- atau satu per hari per kelas (jika absensi harian)
    UNIQUE KEY `uq_absensi_siswa_jadwal_tgl` (`siswa_id`, `kelas_id`, `jadwal_id`, `tanggal`),
    KEY `idx_abs_kelas_tgl`    (`kelas_id`, `tanggal`),
    KEY `idx_abs_tanggal`      (`tanggal`),
    KEY `idx_abs_semester`     (`semester_id`),
    KEY `idx_abs_status`       (`status`),
    -- Composite index untuk rekap per siswa per semester (laporan sering)
    KEY `idx_abs_siswa_smt`    (`siswa_id`, `semester_id`, `status`),
    CONSTRAINT `fk_abs_siswa`  FOREIGN KEY (`siswa_id`)        REFERENCES `siswas` (`id`)             ON DELETE CASCADE,
    CONSTRAINT `fk_abs_kelas`  FOREIGN KEY (`kelas_id`)        REFERENCES `kelas` (`id`)              ON DELETE CASCADE,
    CONSTRAINT `fk_abs_jadwal` FOREIGN KEY (`jadwal_id`)       REFERENCES `jadwals` (`id`)            ON DELETE SET NULL,
    CONSTRAINT `fk_abs_plot`   FOREIGN KEY (`plot_id`)         REFERENCES `plot_guru_mapels` (`id`)   ON DELETE SET NULL,
    CONSTRAINT `fk_abs_ta`     FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`)      ON DELETE SET NULL,
    CONSTRAINT `fk_abs_smt`    FOREIGN KEY (`semester_id`)     REFERENCES `semesters` (`id`)          ON DELETE SET NULL,
    CONSTRAINT `fk_abs_oleh`   FOREIGN KEY (`dicatat_oleh`)    REFERENCES `users` (`id`)              ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Absensi harian siswa. Index dioptimasi untuk rekap dan laporan';
-- CATATAN: Partisi dinonaktifkan karena MySQL tidak support FOREIGN KEY + PARTITION bersamaan


-- =============================================================================
-- BLOK 10: NILAI & RAPOR (Standar Dapodik Kurikulum Merdeka + K13)
-- =============================================================================

-- Komponen penilaian (bisa dikonfigurasi per mapel/kelas)
DROP TABLE IF EXISTS `komponen_penilaians`;
CREATE TABLE `komponen_penilaians` (
    `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nama_komponen`      VARCHAR(100)    NOT NULL COMMENT 'Formatif|Sumatif|PTS|PAS|Pengetahuan|Keterampilan|Sikap|Proyek|dll',
    `kode`               VARCHAR(10)         NULL,
    `jenis`              ENUM('formatif','sumatif','sikap','ekstrakurikuler','lainnya') NOT NULL DEFAULT 'formatif',
    `bobot_persentase`   DECIMAL(5,2)        NULL,
    `kurikulum`          ENUM('K13','Merdeka','Semua') NOT NULL DEFAULT 'Semua',
    `is_active`          TINYINT(1)      NOT NULL DEFAULT 1,
    `created_at`         TIMESTAMP           NULL,
    `updated_at`         TIMESTAMP           NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `komponen_penilaians` (`nama_komponen`, `kode`, `jenis`, `bobot_persentase`, `kurikulum`, `created_at`, `updated_at`) VALUES
('Nilai Formatif',     'NF',  'formatif',  40.00, 'Merdeka', NOW(), NOW()),
('Nilai Sumatif',      'NS',  'sumatif',   60.00, 'Merdeka', NOW(), NOW()),
('Pengetahuan (K13)',  'NPH', 'formatif',  30.00, 'K13',     NOW(), NOW()),
('Keterampilan (K13)', 'NPK', 'formatif',  30.00, 'K13',     NOW(), NOW()),
('PTS',                'PTS', 'sumatif',   20.00, 'K13',     NOW(), NOW()),
('PAS/PAT',            'PAS', 'sumatif',   20.00, 'K13',     NOW(), NOW()),
('Sikap (Spiritual)',  'PSP', 'sikap',     NULL,  'Semua',   NOW(), NOW()),
('Sikap (Sosial)',     'PSS', 'sikap',     NULL,  'Semua',   NOW(), NOW());


-- Nilai per komponen (granular — satu baris per siswa per komponen per mapel per semester)
DROP TABLE IF EXISTS `nilais`;
CREATE TABLE `nilais` (
    `id`                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `siswa_id`             BIGINT UNSIGNED NOT NULL,
    `plot_id`              BIGINT UNSIGNED NOT NULL COMMENT 'Dari plot_guru_mapels (guru+mapel+kelas)',
    `komponen_id`          BIGINT UNSIGNED     NULL,
    `tahun_ajaran_id`      BIGINT UNSIGNED NOT NULL,
    `semester_id`          BIGINT UNSIGNED NOT NULL,
    `nilai`                DECIMAL(5,2)        NULL COMMENT 'Nilai angka 0-100',
    `nilai_huruf`          VARCHAR(5)          NULL COMMENT 'A/B/C/D atau Sangat Baik/Baik/Cukup/Perlu Bimbingan',
    `deskripsi`            TEXT                NULL COMMENT 'Deskripsi kualitatif (Merdeka)',
    `created_at`           TIMESTAMP           NULL,
    `updated_at`           TIMESTAMP           NULL,
    `deleted_at`           TIMESTAMP           NULL,
    `created_by`           BIGINT UNSIGNED     NULL,
    `updated_by`           BIGINT UNSIGNED     NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_nilai_siswa_plot_komponen_smt` (`siswa_id`, `plot_id`, `komponen_id`, `semester_id`),
    KEY `idx_nilai_plot_id`    (`plot_id`),
    KEY `idx_nilai_ta_id`      (`tahun_ajaran_id`),
    KEY `idx_nilai_smt_id`     (`semester_id`),
    KEY `idx_nilai_siswa_smt`  (`siswa_id`, `semester_id`),
    CONSTRAINT `fk_nilai_siswa`     FOREIGN KEY (`siswa_id`)        REFERENCES `siswas` (`id`)             ON DELETE CASCADE,
    CONSTRAINT `fk_nilai_plot`      FOREIGN KEY (`plot_id`)         REFERENCES `plot_guru_mapels` (`id`)   ON DELETE CASCADE,
    CONSTRAINT `fk_nilai_komponen`  FOREIGN KEY (`komponen_id`)     REFERENCES `komponen_penilaians` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_nilai_ta`        FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`)      ON DELETE CASCADE,
    CONSTRAINT `fk_nilai_smt`       FOREIGN KEY (`semester_id`)     REFERENCES `semesters` (`id`)          ON DELETE CASCADE,
    CONSTRAINT `fk_nilai_created_by` FOREIGN KEY (`created_by`)     REFERENCES `users` (`id`)              ON DELETE SET NULL,
    CONSTRAINT `fk_nilai_updated_by` FOREIGN KEY (`updated_by`)     REFERENCES `users` (`id`)              ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Nilai per komponen per mapel per semester. Dioptimasi index untuk query rapor';


-- Nilai akhir mapel per semester (hasil kalkulasi dari nilais — disimpan untuk kecepatan rapor)
DROP TABLE IF EXISTS `nilai_akhirs`;
CREATE TABLE `nilai_akhirs` (
    `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `siswa_id`         BIGINT UNSIGNED NOT NULL,
    `plot_id`          BIGINT UNSIGNED NOT NULL,
    `tahun_ajaran_id`  BIGINT UNSIGNED NOT NULL,
    `semester_id`      BIGINT UNSIGNED NOT NULL,
    `nilai_angka`      DECIMAL(5,2)        NULL COMMENT 'Rata-rata tertimbang dari komponen',
    `nilai_huruf`      VARCHAR(5)          NULL,
    `predikat`         ENUM('A','B','C','D') NULL,
    `deskripsi`        TEXT                NULL COMMENT 'Deskripsi pencapaian Kurikulum Merdeka',
    `created_at`       TIMESTAMP           NULL,
    `updated_at`       TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_nilaiakhir_siswa_plot_smt` (`siswa_id`, `plot_id`, `semester_id`),
    KEY `idx_nilaiakhir_ta`      (`tahun_ajaran_id`),
    KEY `idx_nilaiakhir_smt`     (`semester_id`),
    KEY `idx_nilaiakhir_siswa`   (`siswa_id`, `semester_id`),
    CONSTRAINT `fk_nilaiakhir_siswa` FOREIGN KEY (`siswa_id`)        REFERENCES `siswas` (`id`)           ON DELETE CASCADE,
    CONSTRAINT `fk_nilaiakhir_plot`  FOREIGN KEY (`plot_id`)         REFERENCES `plot_guru_mapels` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_nilaiakhir_ta`    FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`)    ON DELETE CASCADE,
    CONSTRAINT `fk_nilaiakhir_smt`   FOREIGN KEY (`semester_id`)     REFERENCES `semesters` (`id`)        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cache nilai akhir per mapel per semester — di-generate otomatis saat rapor difinalisasi';


-- Ekstrakurikuler siswa (nilai ekskul masuk rapor)
DROP TABLE IF EXISTS `ekskuls`;
CREATE TABLE `ekskuls` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nama`        VARCHAR(100)    NOT NULL,
    `deskripsi`   TEXT                NULL,
    `guru_id`     BIGINT UNSIGNED     NULL COMMENT 'Pembina ekskul',
    `is_active`   TINYINT(1)      NOT NULL DEFAULT 1,
    `created_at`  TIMESTAMP           NULL,
    `updated_at`  TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_ekskul_guru` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `siswa_ekskuls`;
CREATE TABLE `siswa_ekskuls` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `siswa_id`        BIGINT UNSIGNED NOT NULL,
    `ekskul_id`       BIGINT UNSIGNED NOT NULL,
    `tahun_ajaran_id` BIGINT UNSIGNED NOT NULL,
    `semester_id`     BIGINT UNSIGNED NOT NULL,
    `predikat`        ENUM('A','B','C','D')   NULL COMMENT 'SB|B|C|K → A|B|C|D',
    `keterangan`      VARCHAR(255)            NULL,
    `created_at`      TIMESTAMP               NULL,
    `updated_at`      TIMESTAMP               NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_siswekskul` (`siswa_id`, `ekskul_id`, `semester_id`),
    CONSTRAINT `fk_sewekskul_siswa`  FOREIGN KEY (`siswa_id`)        REFERENCES `siswas` (`id`)        ON DELETE CASCADE,
    CONSTRAINT `fk_sewekskul_ekskul` FOREIGN KEY (`ekskul_id`)       REFERENCES `ekskuls` (`id`)       ON DELETE CASCADE,
    CONSTRAINT `fk_sewekskul_ta`     FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_sewekskul_smt`    FOREIGN KEY (`semester_id`)     REFERENCES `semesters` (`id`)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Rapor (header per siswa per semester)
DROP TABLE IF EXISTS `rapors`;
CREATE TABLE `rapors` (
    `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `siswa_id`          BIGINT UNSIGNED NOT NULL,
    `kelas_id`          BIGINT UNSIGNED     NULL COMMENT 'Kelas saat rapor diterbitkan',
    `tahun_ajaran_id`   BIGINT UNSIGNED NOT NULL,
    `semester_id`       BIGINT UNSIGNED NOT NULL,
    `wali_kelas_id`     BIGINT UNSIGNED     NULL COMMENT 'Wali kelas yang finalisasi (FK ke gurus)',
    -- Rekap absensi (snapshot saat finalisasi)
    `total_hadir`       SMALLINT UNSIGNED   NULL,
    `total_sakit`       SMALLINT UNSIGNED   NULL,
    `total_izin`        SMALLINT UNSIGNED   NULL,
    `total_alpa`        SMALLINT UNSIGNED   NULL,
    -- Catatan wali kelas
    `catatan_wali`      TEXT                NULL,
    -- Sikap (narasi kualitatif standar Merdeka)
    `deskripsi_sikap_spiritual` TEXT        NULL,
    `deskripsi_sikap_sosial`    TEXT        NULL,
    -- Status & kenaikan
    `status`            ENUM('draft','final') NOT NULL DEFAULT 'draft',
    `status_kenaikan`   ENUM('Naik Kelas','Tinggal Kelas','Lulus','Tidak Lulus') NULL,
    `finalisasi_at`     TIMESTAMP               NULL,
    `finalisasi_oleh`   BIGINT UNSIGNED         NULL,
    -- Audit
    `created_at`        TIMESTAMP               NULL,
    `updated_at`        TIMESTAMP               NULL,
    `deleted_at`        TIMESTAMP               NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_rapor_siswa_smt` (`siswa_id`, `semester_id`) COMMENT 'Satu rapor per siswa per semester',
    KEY `idx_rapor_ta`       (`tahun_ajaran_id`),
    KEY `idx_rapor_kelas`    (`kelas_id`),
    KEY `idx_rapor_status`   (`status`),
    CONSTRAINT `fk_rapor_siswa`        FOREIGN KEY (`siswa_id`)        REFERENCES `siswas` (`id`)        ON DELETE CASCADE,
    CONSTRAINT `fk_rapor_kelas`        FOREIGN KEY (`kelas_id`)        REFERENCES `kelas` (`id`)         ON DELETE SET NULL,
    CONSTRAINT `fk_rapor_ta`           FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_rapor_smt`          FOREIGN KEY (`semester_id`)     REFERENCES `semesters` (`id`)     ON DELETE CASCADE,
    CONSTRAINT `fk_rapor_walikelas`    FOREIGN KEY (`wali_kelas_id`)   REFERENCES `gurus` (`id`)         ON DELETE SET NULL,
    CONSTRAINT `fk_rapor_finalisasi`   FOREIGN KEY (`finalisasi_oleh`) REFERENCES `users` (`id`)         ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Header rapor siswa per semester';


-- Catatan wali kelas per siswa (fleksibel, bisa banyak per semester)
DROP TABLE IF EXISTS `catatan_walis`;
CREATE TABLE `catatan_walis` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `siswa_id`        BIGINT UNSIGNED NOT NULL,
    `guru_id`         BIGINT UNSIGNED NOT NULL,
    `tahun_ajaran_id` BIGINT UNSIGNED     NULL,
    `semester_id`     BIGINT UNSIGNED     NULL,
    `tanggal`         DATE            NOT NULL,
    `jenis`           ENUM('akademik','perilaku','kesehatan','kehadiran','prestasi','lainnya') NOT NULL DEFAULT 'akademik',
    `isi`             TEXT            NOT NULL,
    `created_at`      TIMESTAMP           NULL,
    `updated_at`      TIMESTAMP           NULL,
    `deleted_at`      TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_catwali_siswa_id`  (`siswa_id`),
    KEY `idx_catwali_guru_id`   (`guru_id`),
    KEY `idx_catwali_smt`       (`semester_id`),
    CONSTRAINT `fk_catwali_siswa`  FOREIGN KEY (`siswa_id`)        REFERENCES `siswas` (`id`)        ON DELETE CASCADE,
    CONSTRAINT `fk_catwali_guru`   FOREIGN KEY (`guru_id`)         REFERENCES `gurus` (`id`)         ON DELETE CASCADE,
    CONSTRAINT `fk_catwali_ta`     FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_catwali_smt`    FOREIGN KEY (`semester_id`)     REFERENCES `semesters` (`id`)     ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- BLOK 11: KEUANGAN (Bendahara)
-- =============================================================================

DROP TABLE IF EXISTS `jenis_tagihans`;
CREATE TABLE `jenis_tagihans` (
    `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nama_tagihan`     VARCHAR(150)    NOT NULL,
    `kategori`         ENUM('spp','bos','komite','ppdb','lainnya') NOT NULL DEFAULT 'spp',
    `nominal_default`  DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    `is_rutin`         TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '1=bulanan, 0=sekali bayar',
    `tahun_ajaran_id`  BIGINT UNSIGNED     NULL,
    `is_active`        TINYINT(1)      NOT NULL DEFAULT 1,
    `created_at`       TIMESTAMP           NULL,
    `updated_at`       TIMESTAMP           NULL,
    `created_by`       BIGINT UNSIGNED     NULL,
    PRIMARY KEY (`id`),
    KEY `idx_jenistagihan_ta` (`tahun_ajaran_id`),
    CONSTRAINT `fk_jenistagihan_ta` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_jenistagihan_cb` FOREIGN KEY (`created_by`)      REFERENCES `users` (`id`)         ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Master jenis tagihan (SPP, BOS, Komite, dll)';


DROP TABLE IF EXISTS `tagihans`;
CREATE TABLE `tagihans` (
    `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `siswa_id`           BIGINT UNSIGNED NOT NULL,
    `jenis_tagihan_id`   BIGINT UNSIGNED NOT NULL,
    `tahun_ajaran_id`    BIGINT UNSIGNED     NULL,
    `bulan`              TINYINT UNSIGNED    NULL COMMENT '1-12, NULL untuk non-rutin',
    `nominal_tagihan`    DECIMAL(12,2)   NOT NULL,
    `nominal_diskon`     DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    `nominal_bersih`     DECIMAL(12,2)   NOT NULL COMMENT 'nominal_tagihan - nominal_diskon',
    `jatuh_tempo`        DATE                NULL,
    `status`             ENUM('belum','lunas','cicil','bebas') NOT NULL DEFAULT 'belum',
    `keterangan`         TEXT                NULL,
    `created_at`         TIMESTAMP           NULL,
    `updated_at`         TIMESTAMP           NULL,
    `created_by`         BIGINT UNSIGNED     NULL,
    PRIMARY KEY (`id`),
    KEY `idx_tagihan_siswa_id`      (`siswa_id`),
    KEY `idx_tagihan_jenis_id`      (`jenis_tagihan_id`),
    KEY `idx_tagihan_ta_bulan`      (`tahun_ajaran_id`, `bulan`),
    KEY `idx_tagihan_status`        (`status`),
    CONSTRAINT `fk_tagihan_siswa`       FOREIGN KEY (`siswa_id`)          REFERENCES `siswas` (`id`)          ON DELETE CASCADE,
    CONSTRAINT `fk_tagihan_jenis`       FOREIGN KEY (`jenis_tagihan_id`)  REFERENCES `jenis_tagihans` (`id`)  ON DELETE RESTRICT,
    CONSTRAINT `fk_tagihan_ta`          FOREIGN KEY (`tahun_ajaran_id`)   REFERENCES `tahun_ajarans` (`id`)   ON DELETE SET NULL,
    CONSTRAINT `fk_tagihan_created_by`  FOREIGN KEY (`created_by`)        REFERENCES `users` (`id`)           ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tagihan per siswa';


DROP TABLE IF EXISTS `pembayarans`;
CREATE TABLE `pembayarans` (
    `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tagihan_id`     BIGINT UNSIGNED NOT NULL,
    `siswa_id`       BIGINT UNSIGNED NOT NULL,
    `nominal_bayar`  DECIMAL(12,2)   NOT NULL,
    `tanggal_bayar`  DATE            NOT NULL,
    `metode_bayar`   ENUM('tunai','transfer','va','qris','lainnya') NOT NULL DEFAULT 'tunai',
    `no_bukti`       VARCHAR(80)         NULL COMMENT 'No. kwitansi atau referensi transfer',
    `catatan`        TEXT                NULL,
    `status`         ENUM('valid','pending','batal') NOT NULL DEFAULT 'valid',
    `created_at`     TIMESTAMP           NULL,
    `updated_at`     TIMESTAMP           NULL,
    `deleted_at`     TIMESTAMP           NULL,
    `created_by`     BIGINT UNSIGNED     NULL,
    `updated_by`     BIGINT UNSIGNED     NULL,
    PRIMARY KEY (`id`),
    KEY `idx_bayar_tagihan_id`  (`tagihan_id`),
    KEY `idx_bayar_siswa_id`    (`siswa_id`),
    KEY `idx_bayar_tanggal`     (`tanggal_bayar`),
    CONSTRAINT `fk_bayar_tagihan`    FOREIGN KEY (`tagihan_id`) REFERENCES `tagihans` (`id`)  ON DELETE RESTRICT,
    CONSTRAINT `fk_bayar_siswa`      FOREIGN KEY (`siswa_id`)   REFERENCES `siswas` (`id`)    ON DELETE CASCADE,
    CONSTRAINT `fk_bayar_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)     ON DELETE SET NULL,
    CONSTRAINT `fk_bayar_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)     ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Riwayat pembayaran tagihan siswa';


-- =============================================================================
-- BLOK 12: PPDB (Penerimaan Peserta Didik Baru)
-- =============================================================================

DROP TABLE IF EXISTS `calon_siswas`;
CREATE TABLE `calon_siswas` (
    `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tahun_ajaran_id`  BIGINT UNSIGNED NOT NULL,
    `no_pendaftaran`   VARCHAR(30)     NOT NULL,
    `nama_lengkap`     VARCHAR(150)    NOT NULL,
    `jenis_kelamin`    ENUM('L','P')   NOT NULL,
    `tempat_lahir`     VARCHAR(100)        NULL,
    `tanggal_lahir`    DATE            NOT NULL,
    `agama`            VARCHAR(30)         NULL,
    `alamat`           TEXT                NULL,
    `asal_sekolah`     VARCHAR(200)        NULL,
    `nama_orang_tua`   VARCHAR(150)        NULL,
    `no_hp`            VARCHAR(20)         NULL,
    `email`            VARCHAR(150)        NULL,
    `jalur`            VARCHAR(50)         NULL COMMENT 'Zonasi|Prestasi|Afirmasi|dll',
    `status`           ENUM('pending','verifikasi','lulus','tidak_lulus','cadangan','converted','dibatalkan') NOT NULL DEFAULT 'pending',
    `siswa_id`         BIGINT UNSIGNED     NULL COMMENT 'Terisi saat calon dikonversi ke siswa aktif',
    `catatan_verifikasi` TEXT              NULL,
    `created_at`       TIMESTAMP           NULL,
    `updated_at`       TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_calon_nopendaftaran` (`no_pendaftaran`),
    KEY `idx_calon_ta_id`   (`tahun_ajaran_id`),
    KEY `idx_calon_status`  (`status`),
    CONSTRAINT `fk_calon_ta`     FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_calon_siswa`  FOREIGN KEY (`siswa_id`)        REFERENCES `siswas` (`id`)        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `berkas_pendaftars`;
CREATE TABLE `berkas_pendaftars` (
    `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `calon_siswa_id`     BIGINT UNSIGNED NOT NULL,
    `jenis_berkas`       VARCHAR(60)     NOT NULL,
    `file_path`          VARCHAR(255)    NOT NULL,
    `ukuran_file`        INT UNSIGNED        NULL,
    `status_verifikasi`  ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    `catatan`            TEXT                NULL,
    `created_at`         TIMESTAMP           NULL,
    `updated_at`         TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_berkaspendaftar_calon` (`calon_siswa_id`),
    CONSTRAINT `fk_berkaspendaftar_calon` FOREIGN KEY (`calon_siswa_id`) REFERENCES `calon_siswas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `pembayaran_ppdb`;
CREATE TABLE `pembayaran_ppdb` (
    `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `calon_siswa_id` BIGINT UNSIGNED NOT NULL,
    `jenis`          VARCHAR(80)     NOT NULL,
    `nominal`        DECIMAL(12,2)   NOT NULL,
    `status`         ENUM('lunas','belum','cicil') NOT NULL DEFAULT 'belum',
    `tanggal_bayar`  DATE                NULL,
    `no_bukti`       VARCHAR(80)         NULL,
    `created_at`     TIMESTAMP           NULL,
    `updated_at`     TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_bayarppdb_calon` (`calon_siswa_id`),
    CONSTRAINT `fk_bayarppdb_calon` FOREIGN KEY (`calon_siswa_id`) REFERENCES `calon_siswas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- BLOK 13: INFORMASI & KONTEN
-- =============================================================================

DROP TABLE IF EXISTS `pengumumans`;
CREATE TABLE `pengumumans` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `judul`       VARCHAR(200)    NOT NULL,
    `konten`      LONGTEXT        NOT NULL,
    `kategori`    VARCHAR(50)         NULL,
    `target`      SET('semua','guru','siswa','ortu','kepsek','wali_kelas','bendahara') NOT NULL DEFAULT 'semua',
    `penulis_id`  BIGINT UNSIGNED     NULL,
    `publish_at`  TIMESTAMP           NULL,
    `expired_at`  TIMESTAMP           NULL,
    `is_pinned`   TINYINT(1)      NOT NULL DEFAULT 0,
    `created_at`  TIMESTAMP           NULL,
    `updated_at`  TIMESTAMP           NULL,
    `deleted_at`  TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_pengumuman_publish` (`publish_at`),
    KEY `idx_pengumuman_target`  (`target`),
    CONSTRAINT `fk_pengumuman_penulis` FOREIGN KEY (`penulis_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `galeris`;
CREATE TABLE `galeris` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `judul`        VARCHAR(200)    NOT NULL,
    `deskripsi`    TEXT                NULL,
    `kategori`     VARCHAR(60)         NULL COMMENT 'Kegiatan|Fasilitas|Prestasi|dll',
    `foto`         VARCHAR(255)    NOT NULL,
    `uploaded_by`  BIGINT UNSIGNED     NULL,
    `created_at`   TIMESTAMP           NULL,
    `updated_at`   TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_galeri_kategori` (`kategori`),
    CONSTRAINT `fk_galeri_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `kalender_akademiks`;
CREATE TABLE `kalender_akademiks` (
    `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tahun_ajaran_id`  BIGINT UNSIGNED     NULL,
    `judul`            VARCHAR(200)    NOT NULL,
    `deskripsi`        TEXT                NULL,
    `jenis`            ENUM('libur','kegiatan','ujian','rapat','lainnya') NOT NULL DEFAULT 'kegiatan',
    `tanggal_mulai`    DATE            NOT NULL,
    `tanggal_selesai`  DATE                NULL,
    `is_nasional`      TINYINT(1)      NOT NULL DEFAULT 0,
    `dibuat_oleh`      BIGINT UNSIGNED     NULL,
    `created_at`       TIMESTAMP           NULL,
    `updated_at`       TIMESTAMP           NULL,
    PRIMARY KEY (`id`),
    KEY `idx_kalakad_ta`     (`tahun_ajaran_id`),
    KEY `idx_kalakad_tanggal` (`tanggal_mulai`),
    CONSTRAINT `fk_kalakad_ta`    FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajarans` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_kalakad_dibuat` FOREIGN KEY (`dibuat_oleh`)    REFERENCES `users` (`id`)         ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `pengaturans`;
CREATE TABLE `pengaturans` (
    `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `key`         VARCHAR(80)     NOT NULL,
    `value`       TEXT                NULL,
    `grup`        VARCHAR(40)         NULL COMMENT 'Kelompokkan: sekolah|akademik|keuangan|notifikasi',
    `deskripsi`   VARCHAR(255)        NULL,
    `updated_at`  TIMESTAMP           NULL,
    `updated_by`  BIGINT UNSIGNED     NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_pengaturan_key` (`key`),
    KEY `idx_pengaturan_grup` (`grup`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Konfigurasi sistem';

INSERT INTO `pengaturans` (`key`, `value`, `grup`, `deskripsi`, `updated_at`) VALUES
('nama_madrasah',      'MI Nurul Huda 3',         'sekolah',   'Nama resmi madrasah',             NOW()),
('npsn',               '',                         'sekolah',   'Nomor Pokok Sekolah Nasional',    NOW()),
('nsm',                '',                         'sekolah',   'Nomor Statistik Madrasah (EMIS)', NOW()),
('alamat_madrasah',    '',                         'sekolah',   'Alamat lengkap madrasah',         NOW()),
('logo',               '',                         'sekolah',   'Path logo madrasah',              NOW()),
('kepala_madrasah',    '',                         'sekolah',   'Nama kepala madrasah aktif',      NOW()),
('kode_registrasi_ortu','',                        'akademik',  'Kode untuk registrasi akun ortu', NOW()),
('kurikulum_aktif',    'Merdeka',                  'akademik',  'K13 atau Merdeka',                NOW()),
('kkm_default',        '70',                       'akademik',  'KKM/KKTP default nilai',          NOW()),
('hari_efektif',       '["Senin","Selasa","Rabu","Kamis","Jumat"]', 'akademik', 'Hari sekolah aktif', NOW());


-- =============================================================================
-- BLOK 14: TABEL PENDUKUNG LARAVEL
-- =============================================================================

DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache` (
    `key`        VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `value`      MEDIUMTEXT   COLLATE utf8mb4_unicode_ci NOT NULL,
    `expiration` INT          NOT NULL,
    PRIMARY KEY (`key`),
    KEY `idx_cache_expiration` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE `cache_locks` (
    `key`        VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `owner`      VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `expiration` INT          NOT NULL,
    PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `queue`        VARCHAR(255)    NOT NULL,
    `payload`      LONGTEXT        NOT NULL,
    `attempts`     TINYINT UNSIGNED NOT NULL,
    `reserved_at`  INT UNSIGNED        NULL,
    `available_at` INT UNSIGNED    NOT NULL,
    `created_at`   INT UNSIGNED    NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_jobs_queue` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE `failed_jobs` (
    `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid`       VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `connection` TEXT         COLLATE utf8mb4_unicode_ci NOT NULL,
    `queue`      TEXT         COLLATE utf8mb4_unicode_ci NOT NULL,
    `payload`    LONGTEXT     COLLATE utf8mb4_unicode_ci NOT NULL,
    `exception`  LONGTEXT     COLLATE utf8mb4_unicode_ci NOT NULL,
    `failed_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_failedjobs_uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
    `email`      VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `token`      VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `created_at` TIMESTAMP        NULL,
    PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
    `id`            VARCHAR(255)    COLLATE utf8mb4_unicode_ci NOT NULL,
    `user_id`       BIGINT UNSIGNED     NULL,
    `ip_address`    VARCHAR(45)         NULL,
    `user_agent`    TEXT                NULL,
    `payload`       LONGTEXT        NOT NULL,
    `last_activity` INT             NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_sessions_user_id`      (`user_id`),
    KEY `idx_sessions_last_activity` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
    `id`        INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `migration` VARCHAR(255)    COLLATE utf8mb4_unicode_ci NOT NULL,
    `batch`     INT             NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;