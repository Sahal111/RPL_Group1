<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║         FIX SAAS CRITICAL ISSUES — 11 Revisi Wajib                 ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  FIX 1  (KRITIS) — pengaturans: tambah school_id                   ║
 * ║  FIX 2  (KRITIS) — notification_templates: fix UNIQUE key          ║
 * ║  FIX 3  (SERIUS) — siswas: UNIQUE(nisn/nik) → scoped ke school_id  ║
 * ║  FIX 4           — gurus: tambah softDeletes + deleted_by          ║
 * ║  FIX 5           — mapels: tambah softDeletes                      ║
 * ║  FIX 6           — jadwals: tambah softDeletes                     ║
 * ║  FIX 7           — roles: tambah softDeletes                       ║
 * ║  FIX 8           — Tambah tabel platform_admins                    ║
 * ║  FIX 9           — Tambah tabel tenant_usage_snapshots             ║
 * ║  FIX 10          — Tambah tabel api_keys                           ║
 * ║  FIX 11          — Tambah kolom disk ke tabel file                 ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
return new class extends Migration {

    public function up(): void
    {
        // ═══════════════════════════════════════════════════════════════
        // FIX 1 (KRITIS): pengaturans — tambah school_id
        //
        // Masalah: semua sekolah berbagi 1 setting global.
        // Sekolah A ganti nama madrasah → nama sekolah B ikut berubah.
        // ═══════════════════════════════════════════════════════════════
        Schema::table('pengaturans', function (Blueprint $table) {
            $table->foreignId('school_id')
                ->after('id')
                ->comment('FK ke schools.id. Setiap sekolah punya setting sendiri.')
                ->constrained('schools')
                ->cascadeOnDelete();
        });

        Schema::table('pengaturans', function (Blueprint $table) {
            $table->dropUnique('uq_pengaturan_key');
            $table->unique(['school_id', 'key'], 'uq_pengaturan_school_key');
            $table->index('school_id', 'idx_pengaturan_school');
        });


        // ═══════════════════════════════════════════════════════════════
        // FIX 2 (KRITIS): notification_templates — fix UNIQUE key
        //
        // Masalah: UNIQUE(event_slug) hanya boleh ada 1 template per
        // event di seluruh platform. Sekolah A kustomisasi template
        // → template sekolah B tertimpa.
        // ═══════════════════════════════════════════════════════════════
        Schema::table('notification_templates', function (Blueprint $table) {
            $table->dropUnique('notification_templates_event_slug_unique');
            $table->unique(['school_id', 'event_slug'], 'uq_notif_template_school_event');
            $table->index(['school_id', 'event_slug'], 'idx_notif_tmpl_school_event');
        });


        // ═══════════════════════════════════════════════════════════════
        // FIX 3 (SERIUS): siswas — UNIQUE nisn/nik/nis scoped ke school_id
        //
        // Masalah: UNIQUE global crash jika siswa yang sama ada
        // di 2 sekolah (pindah, atau data ganda lintas sekolah).
        // kode_anak tetap global karena dipakai untuk link ortu lintas sekolah.
        // ═══════════════════════════════════════════════════════════════
        Schema::table('siswas', function (Blueprint $table) {
            $table->dropUnique('uq_siswas_nisn');
            $table->dropUnique('uq_siswas_nis');
            $table->dropUnique('uq_siswas_nik');

            $table->unique(['school_id', 'nisn'], 'uq_siswas_school_nisn');
            $table->unique(['school_id', 'nis'], 'uq_siswas_school_nis');
            $table->unique(['school_id', 'nik'], 'uq_siswas_school_nik');
        });


        // ═══════════════════════════════════════════════════════════════
        // FIX 4: gurus — tambah softDeletes + deleted_by
        //
        // Masalah: hard-delete guru menghapus semua nilai & absensi terkait.
        // Guard dengan hasColumn agar aman jika sudah ada di migration lain.
        // ═══════════════════════════════════════════════════════════════
        if (!Schema::hasColumn('gurus', 'deleted_at')) {
            Schema::table('gurus', function (Blueprint $table) {
                $table->softDeletes()->comment('Guru resign tidak di-hard delete agar history nilai & absensi tetap ada');
                $table->index('deleted_at', 'idx_gurus_deleted');
            });
        }

        if (!Schema::hasColumn('gurus', 'deleted_by')) {
            Schema::table('gurus', function (Blueprint $table) {
                $table->foreignId('deleted_by')->nullable()
                    ->after('deleted_at')
                    ->comment('FK ke users.id. Siapa yang menonaktifkan guru ini')
                    ->constrained('users')
                    ->nullOnDelete();
            });
        }


        // ═══════════════════════════════════════════════════════════════
        // FIX 5: mapels — tambah softDeletes
        //
        // Masalah: hard-delete mapel merusak data nilai, jadwal, dan rapor.
        // ═══════════════════════════════════════════════════════════════
        if (!Schema::hasColumn('mapels', 'deleted_at')) {
            Schema::table('mapels', function (Blueprint $table) {
                $table->softDeletes()->comment('Mapel tidak dihapus permanen agar history nilai & rapor tetap valid');
                $table->index('deleted_at', 'idx_mapels_deleted');
            });
        }


        // ═══════════════════════════════════════════════════════════════
        // FIX 6: jadwals — tambah softDeletes
        //
        // Masalah: hard-delete jadwal merusak FK di absensis.jadwal_id.
        // ═══════════════════════════════════════════════════════════════
        if (!Schema::hasColumn('jadwals', 'deleted_at')) {
            Schema::table('jadwals', function (Blueprint $table) {
                $table->softDeletes()->comment('Jadwal yang dihapus tetap dipertahankan untuk rekap absensi historis');
                $table->index('deleted_at', 'idx_jadwals_deleted');
            });
        }


        // ═══════════════════════════════════════════════════════════════
        // FIX 7: roles — tambah softDeletes
        //
        // Masalah: hard-delete role menghapus semua user_roles (CASCADE),
        // user kehilangan akses tiba-tiba tanpa audit trail.
        // ═══════════════════════════════════════════════════════════════
        if (!Schema::hasColumn('roles', 'deleted_at')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->softDeletes()->comment('Role system tidak boleh di-hard delete. Soft delete untuk audit trail.');
                $table->index('deleted_at', 'idx_roles_deleted');
            });
        }


        // ═══════════════════════════════════════════════════════════════
        // FIX 8: platform_admins — super admin SaaS
        //
        // Masalah: tidak ada tabel untuk admin yang manage semua sekolah.
        // Komentar di users menyebut "NULL hanya untuk platform_admins
        // (dihandle terpisah)" tapi tabelnya belum ada.
        // ═══════════════════════════════════════════════════════════════
        Schema::create('platform_admins', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->unique()
                ->comment('FK ke users.id. Akun login platform admin (school_id = NULL di users)')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('nama', 150)
                ->comment('Nama lengkap admin platform');

            $table->string('jabatan', 100)->nullable()
                ->comment('Jabatan: Super Admin, Support Engineer, Billing Admin, dll');

            $table->enum('level', ['super', 'support', 'billing', 'readonly'])
                ->default('support')
                ->comment('super=akses penuh, support=lihat data sekolah, billing=kelola invoice, readonly=dashboard saja');

            $table->json('akses_modul')->nullable()
                ->comment('Array modul jika level bukan super: ["schools","billing","notifications"]');

            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();

            $table->foreignId('dibuat_oleh')->nullable()
                ->comment('FK ke platform_admins.id. Siapa yang menambahkan admin ini')
                ->constrained('platform_admins')
                ->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('level', 'idx_padmin_level');
            $table->index('is_active', 'idx_padmin_active');
        });


        // ═══════════════════════════════════════════════════════════════
        // FIX 9: tenant_usage_snapshots — monitoring kapasitas per sekolah
        //
        // Masalah: plans punya max_siswa/max_guru/max_storage_gb, tapi
        // tidak ada tabel untuk mencatat pemakaian aktual per sekolah.
        // Tanpa ini: tidak bisa enforce limit, tidak bisa kirim peringatan
        // "hampir limit", tidak bisa generate laporan untuk sales.
        // ═══════════════════════════════════════════════════════════════
        Schema::create('tenant_usage_snapshots', function (Blueprint $table) {
            $table->id();

            $table->foreignId('school_id')
                ->constrained('schools')
                ->cascadeOnDelete();

            $table->date('tanggal_snapshot')
                ->comment('Tanggal snapshot diambil. 1 baris per sekolah per hari.');

            // Pemakaian aktual
            $table->unsignedSmallInteger('jumlah_siswa_aktif')->default(0);
            $table->unsignedSmallInteger('jumlah_guru_aktif')->default(0);
            $table->unsignedSmallInteger('jumlah_user_aktif')->default(0);
            $table->decimal('storage_used_gb', 8, 3)->default(0);

            // Limit dari plan saat snapshot (denormalisasi untuk history)
            $table->unsignedSmallInteger('plan_max_siswa')->nullable()
                ->comment('NULL = unlimited');
            $table->unsignedSmallInteger('plan_max_guru')->nullable()
                ->comment('NULL = unlimited');
            $table->unsignedSmallInteger('plan_max_storage_gb')->nullable()
                ->comment('NULL = unlimited');

            // Flag peringatan jika pemakaian > 80% limit
            $table->boolean('warning_siswa')->default(false);
            $table->boolean('warning_guru')->default(false);
            $table->boolean('warning_storage')->default(false);

            $table->timestamps();

            $table->unique(['school_id', 'tanggal_snapshot'], 'uq_usage_school_tgl');
            $table->index(['tanggal_snapshot', 'warning_siswa'], 'idx_usage_warn_siswa');
            $table->index(['tanggal_snapshot', 'warning_storage'], 'idx_usage_warn_storage');
            $table->index('school_id', 'idx_usage_school');
        });


        // ═══════════════════════════════════════════════════════════════
        // FIX 10: api_keys — REST API key per sekolah
        //
        // Masalah: tidak ada mekanisme integrasi B2B (sistem dinas,
        // yayasan, rapor online). Sekolah besar butuh API key.
        // ═══════════════════════════════════════════════════════════════
        Schema::create('api_keys', function (Blueprint $table) {
            $table->id();

            $table->foreignId('school_id')
                ->comment('FK ke schools.id. API key milik sekolah ini.')
                ->constrained('schools')
                ->cascadeOnDelete();

            $table->foreignId('dibuat_oleh')
                ->comment('FK ke users.id. Operator yang membuat API key.')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('nama', 100)
                ->comment('Label: "Sistem Dinas Pendidikan", "App Rapor Ortu", dll');

            // Key disimpan sebagai hash SHA-256. Plain text hanya muncul sekali saat generate.
            $table->string('key_hash', 64)->unique()
                ->comment('SHA-256 hash dari API key. Plain text tidak pernah disimpan.');

            $table->string('key_prefix', 10)
                ->comment('8 karakter pertama key untuk identifikasi di UI (contoh: sk_live_ab)');

            $table->json('izin_scope')->nullable()
                ->comment('Endpoint yang boleh diakses. NULL=semua. Contoh: ["siswa.read","nilai.read"]');

            $table->string('ip_whitelist', 500)->nullable()
                ->comment('Comma-separated IP/CIDR. NULL=semua IP. Contoh: "103.45.12.0/24"');

            $table->unsignedSmallInteger('rate_limit_per_menit')->default(60)
                ->comment('Maksimal request per menit.');

            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable()
                ->comment('NULL = tidak pernah kadaluarsa.');
            $table->timestamp('last_used_at')->nullable();
            $table->string('last_used_ip', 45)->nullable();
            $table->unsignedBigInteger('total_requests')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['school_id', 'is_active'], 'idx_apikey_school_active');
            $table->index('expires_at', 'idx_apikey_expires');
        });


        // ═══════════════════════════════════════════════════════════════
        // FIX 11: tambah kolom disk ke tabel file
        //
        // Masalah: hanya tabel 'media' yang punya kolom disk (local/s3/r2/gcs).
        // Tabel file lain tidak bisa pindah ke cloud storage.
        //
        // Nama kolom & posisi disesuaikan dengan struktur aktual tiap tabel:
        //   course_materials      → setelah storage_path
        //   berkas_siswas         → setelah path_file   (bukan file_path!)
        //   guru_dokumens         → setelah file_path
        //   guru_dokumen_versions → setelah file_path
        //   assignment_submissions→ setelah storage_path
        //   galeris               → setelah foto        (bukan file_path!)
        // ═══════════════════════════════════════════════════════════════

        if (Schema::hasTable('course_materials') && !Schema::hasColumn('course_materials', 'disk')) {
            Schema::table('course_materials', function (Blueprint $table) {
                $table->string('disk', 30)->default('local')
                    ->after('storage_path')
                    ->comment('Laravel disk: local | s3 | r2 | gcs');
            });
        }

        // kolom file di berkas_siswas bernama path_file (bukan file_path)
        if (Schema::hasTable('berkas_siswas') && !Schema::hasColumn('berkas_siswas', 'disk')) {
            Schema::table('berkas_siswas', function (Blueprint $table) {
                $table->string('disk', 30)->default('local')
                    ->after('path_file')
                    ->comment('Laravel disk: local | s3 | r2 | gcs');
            });
        }

        if (Schema::hasTable('guru_dokumens') && !Schema::hasColumn('guru_dokumens', 'disk')) {
            Schema::table('guru_dokumens', function (Blueprint $table) {
                $table->string('disk', 30)->default('local')
                    ->after('file_path')
                    ->comment('Laravel disk: local | s3 | r2 | gcs');
            });
        }

        if (Schema::hasTable('guru_dokumen_versions') && !Schema::hasColumn('guru_dokumen_versions', 'disk')) {
            Schema::table('guru_dokumen_versions', function (Blueprint $table) {
                $table->string('disk', 30)->default('local')
                    ->after('file_path')
                    ->comment('Laravel disk: local | s3 | r2 | gcs');
            });
        }

        if (Schema::hasTable('assignment_submissions') && !Schema::hasColumn('assignment_submissions', 'disk')) {
            Schema::table('assignment_submissions', function (Blueprint $table) {
                $table->string('disk', 30)->default('local')
                    ->after('storage_path')
                    ->comment('Laravel disk: local | s3 | r2 | gcs');
            });
        }

        // kolom file di galeris bernama foto (bukan file_path)
        if (Schema::hasTable('galeris') && !Schema::hasColumn('galeris', 'disk')) {
            Schema::table('galeris', function (Blueprint $table) {
                $table->string('disk', 30)->default('local')
                    ->after('foto')
                    ->comment('Laravel disk: local | s3 | r2 | gcs');
            });
        }
    }


    // ════════════════════════════════════════════════════════════════════
    // DOWN — rollback semua perubahan
    // ════════════════════════════════════════════════════════════════════
    public function down(): void
    {
        // FIX 11 — hapus kolom disk
        $fileColumns = [
            'course_materials' => 'storage_path',
            'berkas_siswas' => 'path_file',
            'guru_dokumens' => 'file_path',
            'guru_dokumen_versions' => 'file_path',
            'assignment_submissions' => 'storage_path',
            'galeris' => 'foto',
        ];
        foreach (array_keys($fileColumns) as $tbl) {
            if (Schema::hasTable($tbl) && Schema::hasColumn($tbl, 'disk')) {
                Schema::table($tbl, fn(Blueprint $t) => $t->dropColumn('disk'));
            }
        }

        // FIX 10
        Schema::dropIfExists('api_keys');

        // FIX 9
        Schema::dropIfExists('tenant_usage_snapshots');

        // FIX 8
        Schema::dropIfExists('platform_admins');

        // FIX 7
        if (Schema::hasColumn('roles', 'deleted_at')) {
            Schema::table('roles', fn(Blueprint $t) => $t->dropSoftDeletes());
        }

        // FIX 6
        if (Schema::hasColumn('jadwals', 'deleted_at')) {
            Schema::table('jadwals', fn(Blueprint $t) => $t->dropSoftDeletes());
        }

        // FIX 5
        if (Schema::hasColumn('mapels', 'deleted_at')) {
            Schema::table('mapels', fn(Blueprint $t) => $t->dropSoftDeletes());
        }

        // FIX 4
        if (Schema::hasColumn('gurus', 'deleted_by')) {
            Schema::table('gurus', function (Blueprint $table) {
                $table->dropForeign(['deleted_by']);
                $table->dropColumn('deleted_by');
            });
        }
        if (Schema::hasColumn('gurus', 'deleted_at')) {
            Schema::table('gurus', fn(Blueprint $t) => $t->dropSoftDeletes());
        }

        // FIX 3
        Schema::table('siswas', function (Blueprint $table) {
            try {
                $table->dropUnique('uq_siswas_school_nisn');
            } catch (\Exception $e) {
            }
            try {
                $table->dropUnique('uq_siswas_school_nis');
            } catch (\Exception $e) {
            }
            try {
                $table->dropUnique('uq_siswas_school_nik');
            } catch (\Exception $e) {
            }
            $table->unique('nisn', 'uq_siswas_nisn');
            $table->unique('nis', 'uq_siswas_nis');
            $table->unique('nik', 'uq_siswas_nik');
        });

        // FIX 2
        Schema::table('notification_templates', function (Blueprint $table) {
            try {
                $table->dropUnique('uq_notif_template_school_event');
            } catch (\Exception $e) {
            }
            try {
                $table->dropIndex('idx_notif_tmpl_school_event');
            } catch (\Exception $e) {
            }
            $table->unique('event_slug', 'notification_templates_event_slug_unique');
        });

        // FIX 1
        Schema::table('pengaturans', function (Blueprint $table) {
            try {
                $table->dropUnique('uq_pengaturan_school_key');
            } catch (\Exception $e) {
            }
            try {
                $table->dropIndex('idx_pengaturan_school');
            } catch (\Exception $e) {
            }
            $table->dropForeign(['school_id']);
            $table->dropColumn('school_id');
            $table->unique('key', 'uq_pengaturan_key');
        });
    }
};