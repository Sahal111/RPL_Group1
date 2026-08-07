<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Fix Arsitektur Multi-Tenant & Internasionalisasi
 *
 * Masalah yang diperbaiki:
 *
 * 1. ENUM terlalu kaku — diganti string agar bisa dikustomisasi per sekolah
 *    - orang_tuas.penghasilan  : range rupiah hardcoded → string bebas
 *    - mapels.kurikulum        : K13/Merdeka → string bebas (IB, Cambridge, dll)
 *    - kelas.kurikulum         : sama
 *    - absensis.status         : Hadir/Sakit/Izin/Alpa → kode ISO + kolom master
 *    - guru_jabatans.golongan  : PNS-centric → string bebas
 *
 * 2. Multi-currency
 *    - Tambah currency_code (ISO 4217) ke tabel keuangan
 *    - pembayarans, tagihans, jenis_tagihans, beasiswas
 *
 * 3. Composite indexes diawali school_id
 *    - Setelah school_id ditambahkan (_000008), composite index lama
 *      belum di-update. Migration ini menambahkan composite yang benar.
 *
 * 4. Tambah kolom storage_path ke tabel file
 *    - Standarisasi path Object Storage per tenant:
 *      schools/{school_ulid}/guru/{id}/...
 */
return new class extends Migration {
    public function up(): void
    {
        // ── 1. FIX ENUM: orang_tuas.penghasilan ─────────────────────
        // Dari: ENUM('Rp 500.000 - Rp 999.999', ...) — rupiah hardcoded
        // Ke:   VARCHAR(50) — bebas diisi sesuai mata uang negara masing-masing
        //       Seeder/setting sekolah yang tentukan pilihan yang muncul di UI
        if (Schema::hasTable('orang_tuas') && Schema::hasColumn('orang_tuas', 'penghasilan')) {
            // MySQL tidak bisa langsung ALTER ENUM → string, harus via CHANGE
            DB::statement("ALTER TABLE `orang_tuas` MODIFY `penghasilan` VARCHAR(60) DEFAULT NULL COMMENT 'Range penghasilan bulanan. Format bebas, dikonfigurasi per sekolah'");
        }

        // ── 2. FIX ENUM: mapels.kurikulum ───────────────────────────
        // Dari: ENUM('Kurikulum 2013', 'Kurikulum Merdeka', 'Keduanya')
        // Ke:   VARCHAR(50) — bisa K13, Merdeka, IB, Cambridge, CBSE, dll
        if (Schema::hasTable('mapels') && Schema::hasColumn('mapels', 'kurikulum')) {
            DB::statement("ALTER TABLE `mapels` MODIFY `kurikulum` VARCHAR(50) DEFAULT 'Kurikulum Merdeka' COMMENT 'Kurikulum yang dipakai: Kurikulum Merdeka, K13, IB, Cambridge, dll'");
        }

        // ── 3. FIX ENUM: kelas.kurikulum ────────────────────────────
        if (Schema::hasTable('kelas') && Schema::hasColumn('kelas', 'kurikulum')) {
            DB::statement("ALTER TABLE `kelas` MODIFY `kurikulum` VARCHAR(50) DEFAULT 'Kurikulum Merdeka' COMMENT 'Kurikulum kelas ini: Kurikulum Merdeka, K13, IB, Cambridge, dll'");
        }

        // ── 4. FIX ENUM: absensis.status ────────────────────────────
        // Dari: ENUM('Hadir','Sakit','Izin','Alpa') — Bahasa Indonesia hardcoded
        // Ke:   VARCHAR(20) dengan kode ISO-friendly
        //       present | sick | excused | unexcused | late | permission
        //       UI bisa render label dalam bahasa apapun berdasarkan kode ini
        if (Schema::hasTable('absensis') && Schema::hasColumn('absensis', 'status')) {
            // Step 1: convert existing values ke kode baru dulu
            DB::statement("UPDATE `absensis` SET `status` = CASE
                WHEN `status` = 'Hadir' THEN 'present'
                WHEN `status` = 'Sakit' THEN 'sick'
                WHEN `status` = 'Izin'  THEN 'excused'
                WHEN `status` = 'Alpa'  THEN 'unexcused'
                ELSE 'present'
            END");

            // Step 2: ubah tipe kolom
            DB::statement("ALTER TABLE `absensis` MODIFY `status` VARCHAR(20) NOT NULL DEFAULT 'present' COMMENT 'Kode status: present|sick|excused|unexcused|late|permission'");
        }

        // ── 5. FIX ENUM: guru_jabatans.golongan ─────────────────────
        // Dari: ENUM hardcoded PNS Indonesia
        // Ke:   VARCHAR bebas — honor, yayasan, dll juga bisa pakai
        if (Schema::hasTable('guru_jabatans') && Schema::hasColumn('guru_jabatans', 'golongan')) {
            DB::statement("ALTER TABLE `guru_jabatans` MODIFY `golongan` VARCHAR(20) DEFAULT NULL COMMENT 'Golongan/grade kepegawaian. Bebas: I/A, II/B, Honor, Yayasan, Grade-A, dll'");
        }

        // ── 6. FIX ENUM: mapels.kelompok ────────────────────────────
        // Dari: ENUM('A - Wajib', 'B - Wajib', 'C - Muatan Lokal', ...)
        // Ke:   VARCHAR — sekolah IB punya kelompok berbeda
        if (Schema::hasTable('mapels') && Schema::hasColumn('mapels', 'kelompok')) {
            DB::statement("ALTER TABLE `mapels` MODIFY `kelompok` VARCHAR(80) DEFAULT NULL COMMENT 'Kelompok mata pelajaran. K13: A-Wajib/B-Wajib/C-Mulok. IB: Core/HL/SL. Bebas'");
        }

        // ── 7. MULTI-CURRENCY: tambah currency_code ─────────────────

        // jenis_tagihans — nominal_default
        if (Schema::hasTable('jenis_tagihans') && !Schema::hasColumn('jenis_tagihans', 'currency_code')) {
            Schema::table('jenis_tagihans', function (Blueprint $table) {
                $table->char('currency_code', 3)->default('IDR')
                    ->after('nominal_default')
                    ->comment('ISO 4217: IDR, USD, MYR, SGD. Sesuai setting sekolah');
            });
        }

        // tagihans — nominal dan denda
        if (Schema::hasTable('tagihans') && !Schema::hasColumn('tagihans', 'currency_code')) {
            Schema::table('tagihans', function (Blueprint $table) {
                $table->char('currency_code', 3)->default('IDR')
                    ->after('nominal')
                    ->comment('ISO 4217 — diambil dari school_settings saat tagihan dibuat');
            });
        }

        // pembayarans — nominal_bayar
        if (Schema::hasTable('pembayarans') && !Schema::hasColumn('pembayarans', 'currency_code')) {
            Schema::table('pembayarans', function (Blueprint $table) {
                $table->char('currency_code', 3)->default('IDR')
                    ->after('nominal_bayar')
                    ->comment('Harus sama dengan tagihans.currency_code');
                // Tambah kolom exchange_rate untuk audit jika ada konversi
                $table->decimal('exchange_rate', 16, 6)->default(1.000000)
                    ->after('currency_code')
                    ->comment('Kurs saat transaksi terjadi (vs IDR). 1 jika sudah IDR');
            });
        }

        // beasiswas — nilai_beasiswa
        if (Schema::hasTable('beasiswas') && !Schema::hasColumn('beasiswas', 'currency_code')) {
            Schema::table('beasiswas', function (Blueprint $table) {
                $table->char('currency_code', 3)->default('IDR')
                    ->comment('ISO 4217');
            });
        }

        // ── 8. COMPOSITE INDEXES diawali school_id ──────────────────
        // Migration _000008 hanya tambah index school_id tunggal.
        // Untuk query umum (list siswa per sekolah, absensi per kelas per sekolah, dll),
        // composite index (school_id, ...) jauh lebih efisien karena memangkas scan lebih awal.
        //
        // Panduan: setiap query WHERE school_id = ? AND <kolom_lain> = ?
        // butuh composite index (school_id, kolom_lain).

        $compositeIndexes = [
            // Format: [tabel, [kolom...], nama_index]

            // Siswa — query paling umum: list siswa aktif per sekolah
            ['siswas', ['school_id', 'status'], 'idx_siswas_school_status'],

            // Guru — list guru aktif per sekolah
            ['gurus', ['school_id', 'status_aktif'], 'idx_gurus_school_aktif'],
            ['gurus', ['school_id', 'deleted_at'], 'idx_gurus_school_soft'],

            // Kelas — list kelas per sekolah per tahun ajaran
            ['kelas', ['school_id', 'tahun_ajaran_id'], 'idx_kelas_school_ta'],
            ['kelas', ['school_id', 'tahun_ajaran_id', 'tingkat'], 'idx_kelas_school_ta_tkt'],

            // Absensi — THE most-queried table. Harus composite paling proper.
            // school_id → kelas_id → tanggal adalah pola paling umum
            ['absensis', ['school_id', 'kelas_id', 'tanggal'], 'idx_abs_school_kelas_tgl'],
            ['absensis', ['school_id', 'siswa_id', 'tanggal'], 'idx_abs_school_siswa_tgl'],
            ['absensis', ['school_id', 'semester_id', 'status'], 'idx_abs_school_smt_status'],

            // Mapel — list mapel aktif per sekolah
            ['mapels', ['school_id', 'is_active'], 'idx_mapels_school_aktif'],

            // Jadwal — jadwal per sekolah per kelas
            ['jadwals', ['school_id', 'kelas_id'], 'idx_jadwals_school_kelas'],
            ['jadwals', ['school_id', 'guru_id'], 'idx_jadwals_school_guru'],

            // Nilai — nilai per sekolah per siswa per semester
            ['nilais', ['school_id', 'siswa_id', 'semester_id'], 'idx_nilais_school_siswa_smt'],

            // Tagihan — tagihan per sekolah per status
            ['tagihans', ['school_id', 'status'], 'idx_tagihans_school_status'],
            ['tagihans', ['school_id', 'siswa_id'], 'idx_tagihans_school_siswa'],

            // Pembayaran — riwayat bayar per sekolah
            ['pembayarans', ['school_id', 'siswa_id'], 'idx_pembayarans_school_siswa'],

            // Pengumuman — per sekolah + tanggal
            ['pengumumans', ['school_id', 'published_at'], 'idx_pengumumans_school_date'],

            // Riwayat kelas — history per sekolah
            ['riwayat_kelas', ['school_id', 'siswa_id'], 'idx_riwayat_kelas_school_siswa'],

            // Tahun ajaran — per sekolah, query aktif
            ['tahun_ajarans', ['school_id', 'is_aktif'], 'idx_ta_school_aktif'],

            // Semester — per sekolah + aktif
            ['semesters', ['school_id', 'is_aktif'], 'idx_semesters_school_aktif'],
        ];

        foreach ($compositeIndexes as [$tableName, $columns, $indexName]) {
            if (!Schema::hasTable($tableName)) {
                continue;
            }

            // Cek semua kolom yang dibutuhkan ada
            $allColumnsExist = true;
            foreach ($columns as $col) {
                if (!Schema::hasColumn($tableName, $col)) {
                    $allColumnsExist = false;
                    break;
                }
            }
            if (!$allColumnsExist) {
                continue;
            }

            // Cek index belum ada (cegah duplicate)
            $existingIndexes = DB::select(
                "SHOW INDEX FROM `{$tableName}` WHERE Key_name = ?",
                [$indexName]
            );
            if (!empty($existingIndexes)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($columns, $indexName) {
                $table->index($columns, $indexName);
            });
        }

        // ── 9. Standarisasi storage_path di tabel file ──────────────
        // Sebelumnya path file disimpan di kolom 'foto', 'path', dll.
        // Untuk Object Storage (S3/R2/GCS), perlu kolom storage_path
        // yang menyimpan relative path: schools/{ulid}/guru/{id}/foto.jpg
        // Kolom existing ('foto', 'path') tetap ada untuk backward compat.

        $fileColumns = [
            // [tabel, kolom_baru, setelah_kolom]
            ['guru_dokumens', 'storage_path', 'path_file'],
            ['guru_dokumen_versions', 'storage_path', 'path_file'],
            ['berkas_siswas', 'storage_path', 'path_file'],
            ['berkas_pendaftars', 'storage_path', 'path_file'],
            ['galeris', 'storage_path', 'path_file'],
        ];

        foreach ($fileColumns as [$tableName, $colName, $afterCol]) {
            if (Schema::hasTable($tableName) && !Schema::hasColumn($tableName, $colName)) {
                Schema::table($tableName, function (Blueprint $table) use ($colName, $tableName, $afterCol) {
                    $afterExists = Schema::hasColumn($tableName, $afterCol);
                    $col = $table->string($colName, 500)->nullable()
                        ->comment('Relative path di Object Storage: schools/{ulid}/{module}/{id}/{filename}');
                    if ($afterExists) {
                        $col->after($afterCol);
                    }
                });
            }
        }
    }

    public function down(): void
    {
        // ── Rollback composite indexes ────────────────────────────────
        $compositeIndexes = [
            ['siswas', 'idx_siswas_school_status'],
            ['gurus', 'idx_gurus_school_aktif'],
            ['gurus', 'idx_gurus_school_soft'],
            ['kelas', 'idx_kelas_school_ta'],
            ['kelas', 'idx_kelas_school_ta_tkt'],
            ['absensis', 'idx_abs_school_kelas_tgl'],
            ['absensis', 'idx_abs_school_siswa_tgl'],
            ['absensis', 'idx_abs_school_smt_status'],
            ['mapels', 'idx_mapels_school_aktif'],
            ['jadwals', 'idx_jadwals_school_kelas'],
            ['jadwals', 'idx_jadwals_school_guru'],
            ['nilais', 'idx_nilais_school_siswa_smt'],
            ['tagihans', 'idx_tagihans_school_status'],
            ['tagihans', 'idx_tagihans_school_siswa'],
            ['pembayarans', 'idx_pembayarans_school_siswa'],
            ['pengumumans', 'idx_pengumumans_school_date'],
            ['riwayat_kelas', 'idx_riwayat_kelas_school_siswa'],
            ['tahun_ajarans', 'idx_ta_school_aktif'],
            ['semesters', 'idx_semesters_school_aktif'],
        ];

        foreach ($compositeIndexes as [$tableName, $indexName]) {
            if (!Schema::hasTable($tableName))
                continue;

            $exists = DB::select(
                "SHOW INDEX FROM `{$tableName}` WHERE Key_name = ?",
                [$indexName]
            );
            if (!empty($exists)) {
                Schema::table($tableName, fn(Blueprint $t) => $t->dropIndex($indexName));
            }
        }

        // ── Rollback currency_code ────────────────────────────────────
        $currencyTables = ['jenis_tagihans', 'tagihans', 'pembayarans', 'beasiswas'];
        foreach ($currencyTables as $tbl) {
            if (Schema::hasTable($tbl) && Schema::hasColumn($tbl, 'currency_code')) {
                Schema::table($tbl, fn(Blueprint $t) => $t->dropColumn('currency_code'));
            }
        }
        if (Schema::hasTable('pembayarans') && Schema::hasColumn('pembayarans', 'exchange_rate')) {
            Schema::table('pembayarans', fn(Blueprint $t) => $t->dropColumn('exchange_rate'));
        }

        // ── Rollback storage_path ────────────────────────────────────
        $fileTables = ['guru_dokumens', 'guru_dokumen_versions', 'berkas_siswas', 'berkas_pendaftars', 'galeris'];
        foreach ($fileTables as $tbl) {
            if (Schema::hasTable($tbl) && Schema::hasColumn($tbl, 'storage_path')) {
                Schema::table($tbl, fn(Blueprint $t) => $t->dropColumn('storage_path'));
            }
        }

        // ── Rollback ENUM fix (kembalikan ke ENUM lama) ──────────────
        // Catatan: data yang sudah dikonversi ke kode baru (present/sick/etc)
        // tidak bisa otomatis dikembalikan. Migration down ini hanya ubah tipe.
        if (Schema::hasTable('absensis') && Schema::hasColumn('absensis', 'status')) {
            DB::statement("ALTER TABLE `absensis` MODIFY `status` ENUM('Hadir','Sakit','Izin','Alpa') NOT NULL DEFAULT 'Hadir'");
        }
        if (Schema::hasTable('orang_tuas') && Schema::hasColumn('orang_tuas', 'penghasilan')) {
            DB::statement("ALTER TABLE `orang_tuas` MODIFY `penghasilan` ENUM(
                'Tidak Berpenghasilan','Kurang dari Rp 500.000',
                'Rp 500.000 - Rp 999.999','Rp 1.000.000 - Rp 1.999.999',
                'Rp 2.000.000 - Rp 4.999.999','Rp 5.000.000 - Rp 9.999.999',
                'Lebih dari Rp 10.000.000'
            ) DEFAULT NULL");
        }
        if (Schema::hasTable('mapels') && Schema::hasColumn('mapels', 'kurikulum')) {
            DB::statement("ALTER TABLE `mapels` MODIFY `kurikulum` ENUM('Kurikulum 2013','Kurikulum Merdeka','Keduanya') DEFAULT 'Kurikulum 2013'");
        }
        if (Schema::hasTable('kelas') && Schema::hasColumn('kelas', 'kurikulum')) {
            DB::statement("ALTER TABLE `kelas` MODIFY `kurikulum` ENUM('K13','Merdeka','Lainnya') DEFAULT 'Merdeka'");
        }
        if (Schema::hasTable('mapels') && Schema::hasColumn('mapels', 'kelompok')) {
            DB::statement("ALTER TABLE `mapels` MODIFY `kelompok` ENUM('A - Wajib','B - Wajib','C - Muatan Lokal','Pengembangan Diri','Ekstrakurikuler','Lainnya') DEFAULT NULL");
        }
    }
};