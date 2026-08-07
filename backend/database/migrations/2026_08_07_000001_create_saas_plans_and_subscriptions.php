<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * SaaS Engine — Monetisasi, Paket, & Lisensi
 *
 * Tabel ini bersifat GLOBAL (tidak pakai school_id).
 * Ini adalah tabel milik platform SaaS, bukan milik satu sekolah.
 *
 * Flow:
 *   plans        → paket yang tersedia (Free Trial, Basic, Pro, Enterprise)
 *   plan_features → fitur/limit per paket
 *   school_subscriptions → sekolah berlangganan paket tertentu
 *   saas_invoices → tagihan platform ke sekolah (beda dengan tagihans siswa)
 *   saas_payments → bukti pembayaran langganan
 */
return new class extends Migration {
    public function up(): void
    {
        // ── PLANS ────────────────────────────────────────────────────
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 30)->unique()
                ->comment('Identifier unik: free_trial, basic, pro, enterprise');
            $table->string('nama', 60)
                ->comment('Nama tampil: Free Trial, Basic, Pro, Enterprise');
            $table->text('deskripsi')->nullable();

            // Harga — multi-currency siap dari awal
            $table->decimal('harga_bulan', 12, 2)->default(0)
                ->comment('Harga berlangganan per bulan');
            $table->decimal('harga_tahun', 12, 2)->default(0)
                ->comment('Harga berlangganan per tahun (biasanya diskon)');
            $table->char('currency_code', 3)->default('IDR')
                ->comment('ISO 4217: IDR, USD, MYR, SGD, SAR');

            // Limit resource
            $table->unsignedSmallInteger('max_siswa')->nullable()
                ->comment('Maks jumlah siswa aktif. NULL = unlimited');
            $table->unsignedSmallInteger('max_guru')->nullable()
                ->comment('Maks jumlah guru aktif. NULL = unlimited');
            $table->unsignedSmallInteger('max_users')->nullable()
                ->comment('Maks total akun login. NULL = unlimited');
            $table->unsignedSmallInteger('max_storage_gb')->nullable()
                ->comment('Maks storage file upload (GB). NULL = unlimited');

            // Durasi trial (khusus plan trial)
            $table->unsignedSmallInteger('trial_days')->default(0)
                ->comment('0 = bukan plan trial. 30 = 30 hari masa coba gratis');

            $table->boolean('is_active')->default(true)
                ->comment('0 = plan tidak dijual lagi (existing subscriber tetap bisa pakai)');
            $table->unsignedTinyInteger('urutan')->default(0)
                ->comment('Urutan tampil di halaman pricing');

            $table->timestamps();

            $table->index('is_active', 'idx_plans_active');
        });

        // ── PLAN_FEATURES ────────────────────────────────────────────
        // Mendefinisikan modul/fitur apa saja yang aktif per paket
        // dan kuota masing-masing.
        Schema::create('plan_features', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')
                ->comment('FK ke plans.id')
                ->constrained('plans')->cascadeOnDelete();

            // Feature slug = modul yang dikontrol
            // Contoh: 'modul.keuangan', 'modul.ppdb', 'modul.lms',
            //         'limit.siswa', 'limit.storage_gb', 'fitur.export_pdf'
            $table->string('feature', 80)
                ->comment('Slug fitur/modul/limit. Format: {kategori}.{nama}');

            // Value bisa berupa:
            //   NULL  = fitur aktif tanpa batas
            //   angka = kuota (misal: '500' untuk limit siswa)
            //   'false' = fitur tidak tersedia di paket ini
            //   'true'  = fitur aktif (eksplisit)
            $table->string('value', 255)->nullable()
                ->comment('NULL=unlimited, angka=limit, false=tidak tersedia, true=aktif');

            $table->timestamps();

            $table->unique(['plan_id', 'feature'], 'uq_plan_features');
        });

        // ── SCHOOL_SUBSCRIPTIONS ─────────────────────────────────────
        Schema::create('school_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')
                ->comment('FK ke schools.id')
                ->constrained('schools')->cascadeOnDelete();
            $table->foreignId('plan_id')
                ->comment('FK ke plans.id. Paket yang sedang aktif')
                ->constrained('plans');

            $table->enum('siklus', ['bulanan', 'tahunan'])->default('bulanan')
                ->comment('Siklus penagihan: bulanan atau tahunan');

            // Periode aktif
            $table->timestamp('mulai_at')
                ->comment('Kapan berlangganan dimulai');
            $table->timestamp('berakhir_at')
                ->comment('Kapan berlangganan berakhir. Diperpanjang otomatis saat bayar');

            // Status langganan
            $table->enum('status', [
                'trialing',   // Masa coba gratis, belum bayar
                'active',     // Aktif dan sudah bayar
                'past_due',   // Jatuh tempo, tagihan belum dibayar (grace period)
                'suspended',  // Dibekukan karena past_due terlalu lama
                'cancelled',  // Dibatalkan oleh sekolah atau admin platform
                'expired',    // Masa langganan habis dan tidak diperpanjang
            ])->default('trialing');

            // Untuk keperluan audit dan grace period
            $table->timestamp('cancelled_at')->nullable()
                ->comment('Kapan subscription dibatalkan');
            $table->timestamp('trial_ends_at')->nullable()
                ->comment('Akhir masa trial (NULL jika bukan trialing)');
            $table->unsignedSmallInteger('grace_period_days')->default(7)
                ->comment('Hari toleransi setelah jatuh tempo sebelum suspended');

            // Harga aktual saat subscribe (bisa berbeda dari plan.harga karena diskon/promo)
            $table->decimal('harga_aktual', 12, 2)->default(0)
                ->comment('Harga yang benar-benar ditagih per siklus');
            $table->char('currency_code', 3)->default('IDR');

            $table->text('catatan')->nullable()
                ->comment('Catatan internal: alasan diskon, kode promo, dll');

            $table->timestamps();

            $table->index('school_id', 'idx_subscrip_school');
            $table->index('status', 'idx_subscrip_status');
            $table->index('berakhir_at', 'idx_subscrip_berakhir');
        });

        // ── SAAS_INVOICES ────────────────────────────────────────────
        // Tagihan platform ke sekolah — BERBEDA dengan tabel tagihans (tagihan siswa)
        Schema::create('saas_invoices', function (Blueprint $table) {
            $table->id();
            $table->char('invoice_number', 30)->unique()
                ->comment('Nomor invoice unik: INV-2026-08-0001');
            $table->foreignId('school_id')
                ->comment('Sekolah yang ditagih')
                ->constrained('schools');
            $table->foreignId('subscription_id')->nullable()
                ->comment('FK ke school_subscriptions.id')
                ->constrained('school_subscriptions')->nullOnDelete();

            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('diskon', 12, 2)->default(0);
            $table->decimal('pajak', 12, 2)->default(0)
                ->comment('PPN atau pajak lain yang berlaku');
            $table->decimal('total', 12, 2)->default(0)
                ->comment('subtotal - diskon + pajak');
            $table->char('currency_code', 3)->default('IDR');

            $table->timestamp('tanggal_invoice')
                ->comment('Kapan invoice dibuat/diterbitkan');
            $table->timestamp('jatuh_tempo')
                ->comment('Batas waktu pembayaran');
            $table->timestamp('dibayar_at')->nullable()
                ->comment('Kapan invoice ini lunas');

            $table->enum('status', ['draft', 'open', 'paid', 'void', 'uncollectible'])
                ->default('open');

            $table->string('payment_gateway', 30)->nullable()
                ->comment('Gateway yang dipakai: xendit, stripe, midtrans, manual');
            $table->string('payment_ref', 100)->nullable()
                ->comment('Reference ID dari payment gateway');

            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index('school_id', 'idx_saas_inv_school');
            $table->index('status', 'idx_saas_inv_status');
            $table->index('jatuh_tempo', 'idx_saas_inv_tempo');
        });

        // ── SAAS_PAYMENTS ─────────────────────────────────────────────
        // Bukti pembayaran per invoice (bisa cicil atau partial)
        Schema::create('saas_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')
                ->comment('FK ke saas_invoices.id')
                ->constrained('saas_invoices')->cascadeOnDelete();
            $table->foreignId('school_id')
                ->comment('Denormalisasi untuk query cepat riwayat bayar per sekolah')
                ->constrained('schools');

            $table->decimal('nominal', 12, 2)
                ->comment('Jumlah yang dibayarkan');
            $table->char('currency_code', 3)->default('IDR');

            $table->string('metode', 30)
                ->comment('transfer, va, qris, kartu_kredit, cash, lainnya');
            $table->string('gateway', 30)->nullable()
                ->comment('xendit, stripe, midtrans — NULL jika manual');
            $table->string('ref_gateway', 100)->nullable()
                ->comment('Transaction ID dari gateway');
            $table->string('ref_internal', 50)->nullable()
                ->comment('Reference internal platform, misal nomor bukti transfer');

            $table->timestamp('bayar_at')
                ->comment('Waktu pembayaran terkonfirmasi');
            $table->enum('status', ['pending', 'confirmed', 'refunded', 'failed'])
                ->default('confirmed');

            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index('invoice_id', 'idx_saas_pay_invoice');
            $table->index('school_id', 'idx_saas_pay_school');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saas_payments');
        Schema::dropIfExists('saas_invoices');
        Schema::dropIfExists('school_subscriptions');
        Schema::dropIfExists('plan_features');
        Schema::dropIfExists('plans');
    }
};