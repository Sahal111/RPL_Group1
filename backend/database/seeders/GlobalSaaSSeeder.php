<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GlobalSaaSSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // ── Seed SaaS Subscription Plans ─────────────────────────────
        DB::table('plans')->insertOrIgnore([
            [
                'id' => 1,
                'slug' => 'free_trial',
                'nama' => 'Free Trial',
                'deskripsi' => '30 days full feature trial for new schools',
                'harga_bulan' => 0,
                'harga_tahun' => 0,
                'currency_code' => 'USD',
                'max_siswa' => 50,
                'max_guru' => 10,
                'max_users' => 60,
                'max_storage_gb' => 5,
                'trial_days' => 30,
                'is_active' => 1,
                'urutan' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'slug' => 'basic',
                'nama' => 'Starter Plan',
                'deskripsi' => 'For small schools up to 250 students',
                'harga_bulan' => 49.00,
                'harga_tahun' => 490.00,
                'currency_code' => 'USD',
                'max_siswa' => 250,
                'max_guru' => 25,
                'max_users' => 300,
                'max_storage_gb' => 20,
                'trial_days' => 0,
                'is_active' => 1,
                'urutan' => 2,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'slug' => 'pro',
                'nama' => 'Professional Plan',
                'deskripsi' => 'For growing schools up to 1000 students with full LMS & Finance',
                'harga_bulan' => 149.00,
                'harga_tahun' => 1490.00,
                'currency_code' => 'USD',
                'max_siswa' => 1000,
                'max_guru' => 100,
                'max_users' => 1200,
                'max_storage_gb' => 100,
                'trial_days' => 0,
                'is_active' => 1,
                'urutan' => 3,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 4,
                'slug' => 'enterprise',
                'nama' => 'Enterprise Plan',
                'deskripsi' => 'Unlimited capacity, custom domain, priority support & SLA',
                'harga_bulan' => 399.00,
                'harga_tahun' => 3990.00,
                'currency_code' => 'USD',
                'max_siswa' => null,
                'max_guru' => null,
                'max_users' => null,
                'max_storage_gb' => 1000,
                'trial_days' => 0,
                'is_active' => 1,
                'urutan' => 4,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // ── Seed Plan Features ───────────────────────────────────────
        $features = [
            // Plan 1: Free Trial
            ['plan_id' => 1, 'feature' => 'modul.akademik', 'value' => 'true'],
            ['plan_id' => 1, 'feature' => 'modul.keuangan', 'value' => 'true'],
            ['plan_id' => 1, 'feature' => 'modul.lms', 'value' => 'true'],
            ['plan_id' => 1, 'feature' => 'fitur.custom_domain', 'value' => 'false'],

            // Plan 2: Basic
            ['plan_id' => 2, 'feature' => 'modul.akademik', 'value' => 'true'],
            ['plan_id' => 2, 'feature' => 'modul.keuangan', 'value' => 'true'],
            ['plan_id' => 2, 'feature' => 'modul.lms', 'value' => 'false'],
            ['plan_id' => 2, 'feature' => 'fitur.custom_domain', 'value' => 'false'],

            // Plan 3: Pro
            ['plan_id' => 3, 'feature' => 'modul.akademik', 'value' => 'true'],
            ['plan_id' => 3, 'feature' => 'modul.keuangan', 'value' => 'true'],
            ['plan_id' => 3, 'feature' => 'modul.lms', 'value' => 'true'],
            ['plan_id' => 3, 'feature' => 'modul.ppdb', 'value' => 'true'],
            ['plan_id' => 3, 'feature' => 'fitur.custom_domain', 'value' => 'true'],

            // Plan 4: Enterprise
            ['plan_id' => 4, 'feature' => 'modul.akademik', 'value' => 'true'],
            ['plan_id' => 4, 'feature' => 'modul.keuangan', 'value' => 'true'],
            ['plan_id' => 4, 'feature' => 'modul.lms', 'value' => 'true'],
            ['plan_id' => 4, 'feature' => 'modul.ppdb', 'value' => 'true'],
            ['plan_id' => 4, 'feature' => 'fitur.custom_domain', 'value' => 'true'],
            ['plan_id' => 4, 'feature' => 'fitur.api_access', 'value' => 'true'],
            ['plan_id' => 4, 'feature' => 'fitur.priority_support', 'value' => 'true'],
        ];

        foreach ($features as $feat) {
            DB::table('plan_features')->insertOrIgnore([
                'plan_id' => $feat['plan_id'],
                'feature' => $feat['feature'],
                'value' => $feat['value'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // ── Seed Default Global Coupons ─────────────────────────────
        DB::table('saas_coupons')->insertOrIgnore([
            [
                'code' => 'WELCOME2026',
                'type' => 'percentage',
                'value' => 20.00,
                'currency_code' => 'USD',
                'max_uses' => 100,
                'max_uses_per_school' => 1,
                'valid_from' => $now,
                'valid_until' => null,
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        $this->command->info('✅ GlobalSaaSSeeder: Plans, Plan Features, & Coupons seeded successfully.');
    }
}
