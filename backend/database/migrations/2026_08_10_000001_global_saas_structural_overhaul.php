<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Global SaaS Structural Overhaul Migration
 * 
 * Covering:
 * 1. Multi-Tenancy & Global Auth Lookup
 * 2. Billing & Subscription Enhancements (Coupons, Tax Rate, EN naming)
 * 3. Internationalization (Reference Tables, Flexibilized JSON columns, ENUM removals)
 * 4. Scalability, Security, Data Isolation & Retention Policies
 */
return new class extends Migration {
    public function up(): void
    {
        // ═══════════════════════════════════════════════════════════════
        // AREA 1: MULTI-TENANCY & GLOBAL AUTH
        // ═══════════════════════════════════════════════════════════════

        // Fix potential duplicate platform_admins created by legacy migration
        if (Schema::hasTable('platform_admins')) {
            // Drop legacy FK/table if it was attached to local users table instead of global_users
            if (!Schema::hasColumn('platform_admins', 'global_user_id') && Schema::hasColumn('platform_admins', 'user_id')) {
                Schema::dropIfExists('platform_admins');
            }
        }

        if (!Schema::hasTable('platform_admins')) {
            Schema::create('platform_admins', function (Blueprint $table) {
                $table->id();
                $table->foreignId('global_user_id')
                    ->unique('uq_pa_global_user')
                    ->comment('FK to global_users.id')
                    ->constrained('global_users')->cascadeOnDelete();
                $table->string('level', 20)->default('support')
                    ->comment('super_admin | admin | support | billing | readonly');
                $table->foreignId('last_tenant_id')->nullable()
                    ->comment('FK to schools.id for tenant impersonation')
                    ->constrained('schools')->nullOnDelete();
                $table->timestamp('last_impersonate_at')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->index('level', 'idx_pa_level');
                $table->index('is_active', 'idx_pa_active');
            });
        }

        // Global User Schools lookup table
        if (!Schema::hasTable('global_user_schools')) {
            Schema::create('global_user_schools', function (Blueprint $table) {
                $table->id();
                $table->foreignId('global_user_id')->constrained('global_users')->cascadeOnDelete();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->boolean('is_default')->default(false);
                $table->timestamp('last_accessed_at')->nullable();
                $table->timestamps();

                $table->unique(['global_user_id', 'school_id'], 'uq_gus_user_school');
                $table->index('global_user_id', 'idx_gus_user');
            });
        }

        // ═══════════════════════════════════════════════════════════════
        // AREA 2: BILLING & SUBSCRIPTION ENHANCEMENTS
        // ═══════════════════════════════════════════════════════════════

        if (Schema::hasTable('school_subscriptions')) {
            Schema::table('school_subscriptions', function (Blueprint $table) {
                if (Schema::hasColumn('school_subscriptions', 'siklus')) {
                    DB::statement("ALTER TABLE `school_subscriptions` MODIFY `siklus` VARCHAR(30) NOT NULL DEFAULT 'monthly' COMMENT 'monthly|yearly|weekly|quarterly'");
                }
            });
        }

        if (Schema::hasTable('saas_invoices')) {
            Schema::table('saas_invoices', function (Blueprint $table) {
                if (!Schema::hasColumn('saas_invoices', 'tax_rate')) {
                    $table->decimal('tax_rate', 5, 4)->default(0.0000)->after('pajak')->comment('Tax percentage rate e.g. 0.1100 for 11%');
                }
            });
        }

        // Coupons
        if (!Schema::hasTable('saas_coupons')) {
            Schema::create('saas_coupons', function (Blueprint $table) {
                $table->id();
                $table->string('code', 30)->unique();
                $table->enum('type', ['percentage', 'fixed_amount'])->default('percentage');
                $table->decimal('value', 12, 2);
                $table->char('currency_code', 3)->default('USD');
                $table->unsignedInteger('max_uses')->nullable();
                $table->unsignedInteger('max_uses_per_school')->default(1);
                $table->timestamp('valid_from')->useCurrent();
                $table->timestamp('valid_until')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->index('code', 'idx_coupons_code');
                $table->index('is_active', 'idx_coupons_active');
            });
        }

        if (!Schema::hasTable('saas_coupon_usages')) {
            Schema::create('saas_coupon_usages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('coupon_id')->constrained('saas_coupons')->cascadeOnDelete();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->foreignId('subscription_id')->nullable()->constrained('school_subscriptions')->nullOnDelete();
                $table->decimal('discount_applied', 12, 2);
                $table->timestamp('used_at')->useCurrent();

                $table->index(['coupon_id', 'school_id'], 'idx_coupon_usage_coupon_school');
            });
        }

        // ═══════════════════════════════════════════════════════════════
        // AREA 3: INTERNATIONALIZATION & REFERENCE TABLES
        // ═══════════════════════════════════════════════════════════════

        // Master Religions
        if (!Schema::hasTable('master_religions')) {
            Schema::create('master_religions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->nullable()->constrained('schools')->cascadeOnDelete();
                $table->string('code', 30);
                $table->string('name', 100);
                $table->unsignedSmallInteger('display_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->unique(['school_id', 'code'], 'uq_religions_school_code');
            });
        }

        // Master Education Levels
        if (!Schema::hasTable('master_education_levels')) {
            Schema::create('master_education_levels', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->nullable()->constrained('schools')->cascadeOnDelete();
                $table->string('code', 30);
                $table->string('name', 100);
                $table->string('country_code', 10)->default('GLOBAL');
                $table->unsignedSmallInteger('display_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->unique(['school_id', 'code', 'country_code'], 'uq_edu_levels_school_code_country');
            });
        }

        // Master Employment Statuses
        if (!Schema::hasTable('master_status_kepegawaians')) {
            Schema::create('master_status_kepegawaians', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->nullable()->constrained('schools')->cascadeOnDelete();
                $table->string('kode', 30);
                $table->string('nama', 100);
                $table->text('deskripsi')->nullable();
                $table->string('country_code', 10)->default('ID');
                $table->unsignedSmallInteger('urutan')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->unique(['school_id', 'kode'], 'uq_status_kepegawaian_school_kode');
            });
        }

        // Master Leave Types (Jenis Cuti)
        if (!Schema::hasTable('master_jenis_cutis')) {
            Schema::create('master_jenis_cutis', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->nullable()->constrained('schools')->cascadeOnDelete();
                $table->string('kode', 30);
                $table->string('nama', 100);
                $table->unsignedSmallInteger('max_hari')->nullable();
                $table->boolean('butuh_dokumen')->default(false);
                $table->unsignedSmallInteger('urutan')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->unique(['school_id', 'kode'], 'uq_jenis_cuti_school_kode');
            });
        }

        // Master Marital Statuses
        if (!Schema::hasTable('master_marital_statuses')) {
            Schema::create('master_marital_statuses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->nullable()->constrained('schools')->cascadeOnDelete();
                $table->string('code', 30);
                $table->string('name', 100);
                $table->unsignedSmallInteger('display_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->unique(['school_id', 'code'], 'uq_marital_statuses_school_code');
            });
        }

        // Master School Types
        if (!Schema::hasTable('master_school_types')) {
            Schema::create('master_school_types', function (Blueprint $table) {
                $table->id();
                $table->string('code', 30)->unique();
                $table->string('name', 100);
                $table->string('country_code', 10)->default('ID');
                $table->string('education_level', 30)->nullable();
                $table->unsignedSmallInteger('display_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Master Blood Types
        if (!Schema::hasTable('master_blood_types')) {
            Schema::create('master_blood_types', function (Blueprint $table) {
                $table->id();
                $table->string('code', 10)->unique();
                $table->string('name', 30);
                $table->timestamps();
            });
        }

        // Akun Kas
        if (!Schema::hasTable('akun_kass')) {
            Schema::create('akun_kass', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->string('kode_akun', 30);
                $table->string('nama_akun', 100);
                $table->string('jenis', 30)->default('kas');
                $table->decimal('saldo_awal', 15, 2)->default(0);
                $table->decimal('saldo_saat_ini', 15, 2)->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->unique(['school_id', 'kode_akun'], 'uq_akunkas_school_kode');
            });
        }

        // Kategori Buku
        if (!Schema::hasTable('kategori_bukus')) {
            Schema::create('kategori_bukus', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->string('nama', 100);
                $table->string('kode_ddc', 20)->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->unique(['school_id', 'nama'], 'uq_katbuku_school_nama');
            });
        }

        // ── UPDATE SCHOOLS TABLE ───────────────────────────────────────
        if (Schema::hasTable('schools')) {
            Schema::table('schools', function (Blueprint $table) {
                if (!Schema::hasColumn('schools', 'school_type_id')) {
                    $table->foreignId('school_type_id')->nullable()->after('npsn')->constrained('master_school_types')->nullOnDelete();
                }
                if (!Schema::hasColumn('schools', 'education_level')) {
                    $table->string('education_level', 30)->nullable()->after('school_type_id');
                }
                if (!Schema::hasColumn('schools', 'country_code')) {
                    $table->char('country_code', 2)->default('ID')->after('education_level');
                }
                if (!Schema::hasColumn('schools', 'currency_code')) {
                    $table->char('currency_code', 3)->default('IDR')->after('country_code');
                }
                if (!Schema::hasColumn('schools', 'date_format')) {
                    $table->string('date_format', 20)->default('DD/MM/YYYY')->after('currency_code');
                }
                if (!Schema::hasColumn('schools', 'phone_country_code')) {
                    $table->string('phone_country_code', 5)->default('+62')->after('date_format');
                }
            });
        }

        // ── UPDATE GURUS TABLE FOR INTERNATIONALIZATION ─────────────
        if (Schema::hasTable('gurus')) {
            Schema::table('gurus', function (Blueprint $table) {
                if (!Schema::hasColumn('gurus', 'national_ids')) {
                    $table->json('national_ids')->nullable()->after('user_id')->comment('Flexible national IDs: {"nik":"...","nuptk":"...","ssn":"..."}');
                }
                if (!Schema::hasColumn('gurus', 'address_line1')) {
                    $table->string('address_line1', 255)->nullable()->after('alamat_jalan');
                    $table->string('address_line2', 255)->nullable()->after('address_line1');
                    $table->string('city', 100)->nullable()->after('address_line2');
                    $table->string('state_province', 100)->nullable()->after('city');
                    $table->string('postal_code', 20)->nullable()->after('state_province');
                    $table->char('country_code', 2)->default('ID')->after('postal_code');
                    $table->json('address_details')->nullable()->after('country_code')->comment('Country specific address breakdown e.g. {"rt":"01","rw":"02","dusun":"..."}');
                }
                if (!Schema::hasColumn('gurus', 'religion_id')) {
                    $table->foreignId('religion_id')->nullable()->after('golongan_darah')->constrained('master_religions')->nullOnDelete();
                }
                if (!Schema::hasColumn('gurus', 'nationality')) {
                    $table->string('nationality', 60)->nullable()->after('religion_id');
                    $table->string('citizenship_status', 30)->nullable()->after('nationality');
                }
                if (!Schema::hasColumn('gurus', 'employment_status_id')) {
                    $table->foreignId('employment_status_id')->nullable()->after('citizenship_status')->constrained('master_status_kepegawaians')->nullOnDelete();
                }
                if (!Schema::hasColumn('gurus', 'is_deceased')) {
                    $table->boolean('is_deceased')->default(false)->after('employment_status_id');
                }
                if (!Schema::hasColumn('gurus', 'teacher_type')) {
                    $table->string('teacher_type', 80)->nullable()->after('is_deceased');
                }
                if (!Schema::hasColumn('gurus', 'gender')) {
                    $table->string('gender', 15)->nullable()->after('teacher_type')->comment('male|female|other|prefer_not_to_say');
                }
            });
        }

        // ── UPDATE SISWAS TABLE FOR INTERNATIONALIZATION ─────────────
        if (Schema::hasTable('siswas')) {
            Schema::table('siswas', function (Blueprint $table) {
                if (!Schema::hasColumn('siswas', 'national_ids')) {
                    $table->json('national_ids')->nullable()->after('user_id')->comment('Flexible IDs e.g. {"nisn":"...","nik":"..."}');
                }
                if (!Schema::hasColumn('siswas', 'student_local_id')) {
                    $table->string('student_local_id', 30)->nullable()->after('national_ids')->comment('Local school ID / NIS');
                }
                if (!Schema::hasColumn('siswas', 'address_line1')) {
                    $table->string('address_line1', 255)->nullable()->after('alamat_jalan');
                    $table->string('address_line2', 255)->nullable()->after('address_line1');
                    $table->string('city', 100)->nullable()->after('address_line2');
                    $table->string('state_province', 100)->nullable()->after('city');
                    $table->string('postal_code', 20)->nullable()->after('state_province');
                    $table->char('country_code', 2)->default('ID')->after('postal_code');
                    $table->json('address_details')->nullable()->after('country_code');
                }
                if (!Schema::hasColumn('siswas', 'religion_id')) {
                    $table->foreignId('religion_id')->nullable()->after('golongan_darah')->constrained('master_religions')->nullOnDelete();
                }
                if (!Schema::hasColumn('siswas', 'nationality')) {
                    $table->string('nationality', 60)->nullable()->after('religion_id');
                    $table->string('citizenship_status', 30)->nullable()->after('nationality');
                }
                if (!Schema::hasColumn('siswas', 'gender')) {
                    $table->string('gender', 15)->nullable()->after('citizenship_status')->comment('male|female|other|prefer_not_to_say');
                }
                if (!Schema::hasColumn('siswas', 'special_needs')) {
                    $table->json('special_needs')->nullable()->after('gender');
                }
                if (!Schema::hasColumn('siswas', 'family_status')) {
                    $table->string('family_status', 30)->nullable()->after('special_needs');
                }
                if (!Schema::hasColumn('siswas', 'tuition_funder')) {
                    $table->string('tuition_funder', 60)->nullable()->after('family_status');
                }
            });
        }

        // ── UPDATE ORANG_TUAS TABLE ──────────────────────────────────
        if (Schema::hasTable('orang_tuas')) {
            Schema::table('orang_tuas', function (Blueprint $table) {
                if (!Schema::hasColumn('orang_tuas', 'religion_id')) {
                    $table->foreignId('religion_id')->nullable()->after('user_id')->constrained('master_religions')->nullOnDelete();
                }
                if (!Schema::hasColumn('orang_tuas', 'education_level_id')) {
                    $table->foreignId('education_level_id')->nullable()->after('religion_id')->constrained('master_education_levels')->nullOnDelete();
                }
                if (!Schema::hasColumn('orang_tuas', 'relationship')) {
                    $table->string('relationship', 30)->nullable()->after('education_level_id')->comment('father|mother|guardian|grandparent|uncle|aunt|sibling|other');
                }
                if (!Schema::hasColumn('orang_tuas', 'nationality')) {
                    $table->string('nationality', 60)->nullable()->after('relationship');
                }
            });
        }

        // ── UPDATE GURU_PENDIDIKANS ──────────────────────────────────
        if (Schema::hasTable('guru_pendidikans')) {
            Schema::table('guru_pendidikans', function (Blueprint $table) {
                if (!Schema::hasColumn('guru_pendidikans', 'education_level_id')) {
                    $table->foreignId('education_level_id')->nullable()->after('guru_id')->constrained('master_education_levels')->nullOnDelete();
                }
            });
        }

        // ── UPDATE GURU_SERTIFIKASIS ────────────────────────────────
        if (Schema::hasTable('guru_sertifikasis')) {
            Schema::table('guru_sertifikasis', function (Blueprint $table) {
                if (!Schema::hasColumn('guru_sertifikasis', 'certification_ids')) {
                    $table->json('certification_ids')->nullable()->after('guru_id');
                }
                if (!Schema::hasColumn('guru_sertifikasis', 'issuing_institution')) {
                    $table->string('issuing_institution', 200)->nullable()->after('certification_ids');
                }
            });
        }

        // ── UPDATE GURU_KELUARGAS ────────────────────────────────────
        if (Schema::hasTable('guru_keluargas')) {
            Schema::table('guru_keluargas', function (Blueprint $table) {
                if (!Schema::hasColumn('guru_keluargas', 'marital_status_id')) {
                    $table->foreignId('marital_status_id')->nullable()->after('guru_id')->constrained('master_marital_statuses')->nullOnDelete();
                }
            });
        }

        // ── UPDATE JADWALS ───────────────────────────────────────────
        if (Schema::hasTable('jadwals')) {
            Schema::table('jadwals', function (Blueprint $table) {
                if (!Schema::hasColumn('jadwals', 'day_of_week')) {
                    $table->unsignedTinyInteger('day_of_week')->default(1)->after('semester_id')->comment('ISO 8601: 1=Monday, 7=Sunday');
                }
            });
        }

        // ── UPDATE SEMESTERS ─────────────────────────────────────────
        if (Schema::hasTable('semesters')) {
            Schema::table('semesters', function (Blueprint $table) {
                DB::statement("ALTER TABLE `semesters` MODIFY `nama` VARCHAR(40) NOT NULL DEFAULT 'Semester 1' COMMENT 'Semester 1|Semester 2|Term 1|Quarter 1 etc'");
            });
        }

        // ═══════════════════════════════════════════════════════════════
        // AREA 4: SCALABILITY, SECURITY & DATA RETENTION
        // ═══════════════════════════════════════════════════════════════

        // Add school_id to child tables missing direct school scope
        $childTables = ['guru_anaks', 'guru_kompetensi', 'guru_kontak_darurat'];
        foreach ($childTables as $childTable) {
            if (Schema::hasTable($childTable) && !Schema::hasColumn($childTable, 'school_id')) {
                Schema::table($childTable, function (Blueprint $table) {
                    $table->foreignId('school_id')->nullable()->after('id')->constrained('schools')->cascadeOnDelete();
                    $table->index('school_id');
                });
            }
        }

        // Update Activity Logs
        if (Schema::hasTable('activity_logs')) {
            Schema::table('activity_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('activity_logs', 'changes')) {
                    $table->json('changes')->nullable()->after('keterangan')->comment('Structured diff: {"old":{...},"new":{...}}');
                }
            });
            // Ensure composite index exists for multi-tenant query performance
            $existingIndex = DB::select("SHOW INDEX FROM `activity_logs` WHERE Key_name = 'idx_actlog_school_module_created'");
            if (empty($existingIndex) && Schema::hasColumn('activity_logs', 'school_id')) {
                Schema::table('activity_logs', function (Blueprint $table) {
                    $table->index(['school_id', 'module', 'created_at'], 'idx_actlog_school_module_created');
                });
            }
        }

        // Data Retention Policies table
        if (!Schema::hasTable('data_retention_policies')) {
            Schema::create('data_retention_policies', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->nullable()->constrained('schools')->cascadeOnDelete();
                $table->string('table_name', 80);
                $table->unsignedInteger('retention_months')->default(24);
                $table->enum('archive_strategy', ['soft_delete', 'archive_table', 'export_delete'])->default('soft_delete');
                $table->timestamp('last_cleanup_at')->nullable();
                $table->timestamps();

                $table->unique(['school_id', 'table_name'], 'uq_retention_school_table');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('data_retention_policies');

        foreach (['guru_anaks', 'guru_kompetensi', 'guru_kontak_darurat'] as $childTable) {
            if (Schema::hasTable($childTable) && Schema::hasColumn($childTable, 'school_id')) {
                Schema::table($childTable, function (Blueprint $table) {
                    $table->dropForeign(['school_id']);
                    $table->dropColumn('school_id');
                });
            }
        }

        Schema::dropIfExists('kategori_bukus');
        Schema::dropIfExists('akun_kass');
        Schema::dropIfExists('master_blood_types');
        Schema::dropIfExists('master_school_types');
        Schema::dropIfExists('master_marital_statuses');
        Schema::dropIfExists('master_jenis_cutis');
        Schema::dropIfExists('master_status_kepegawaians');
        Schema::dropIfExists('master_education_levels');
        Schema::dropIfExists('master_religions');
        Schema::dropIfExists('saas_coupon_usages');
        Schema::dropIfExists('saas_coupons');
        Schema::dropIfExists('global_user_schools');
    }
};
