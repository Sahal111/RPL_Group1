<?php

namespace Tests\Feature;

use App\Models\Guru;
use App\Models\School;
use App\Models\Scopes\SchoolScope;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * TenantIsolationTest
 *
 * Memastikan SchoolScope (Fail-Closed Multi-Tenancy) bekerja benar:
 *   1. Model hanya mengembalikan data milik tenant aktif.
 *   2. Tanpa tenant → query mengembalikan 0 baris (fail-closed via 1=0).
 *   3. Satu tenant tidak bisa baca/hapus data tenant lain via API.
 *   4. withoutGlobalScope bypass tetap berfungsi (untuk admin platform).
 *   5. TenantMiddleware bisa resolve school dari header X-School-ID.
 */
class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    // ─────────────────────────────────────────────────────────────────
    // 1. SchoolScope — data isolation di level model
    // ─────────────────────────────────────────────────────────────────

    /** Guru school A tidak muncul di query school B. */
    public function test_guru_query_hanya_muncul_untuk_tenant_yang_benar(): void
    {
        $schoolA = $this->createSchool(['nama' => 'Sekolah A']);
        $schoolB = $this->createSchool(['nama' => 'Sekolah B']);

        // Insert guru ke masing-masing school langsung lewat DB supaya bypass scope
        $guruAId = \Illuminate\Support\Facades\DB::table('gurus')->insertGetId([
            'school_id' => $schoolA->id,
            'nuptk' => '1111111111111111',
            'nama' => 'Guru Sekolah A',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        \Illuminate\Support\Facades\DB::table('gurus')->insertGetId([
            'school_id' => $schoolB->id,
            'nuptk' => '2222222222222222',
            'nama' => 'Guru Sekolah B',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Set tenant ke school A → hanya guru A yang muncul
        $this->setTenant($schoolA->id);
        $gurus = Guru::all();

        $this->assertCount(1, $gurus);
        $this->assertEquals('Guru Sekolah A', $gurus->first()->nama);
    }

    /** Tanpa tenant → Guru::all() harus mengembalikan 0 baris (fail-closed). */
    public function test_tanpa_tenant_guru_query_mengembalikan_nol_baris(): void
    {
        $school = $this->createSchool();

        \Illuminate\Support\Facades\DB::table('gurus')->insert([
            'school_id' => $school->id,
            'nuptk' => '9999999999999999',
            'nama' => 'Guru Apapun',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Hapus tenant dari container → simulasi request tanpa tenant
        $this->clearTenant();

        $gurus = Guru::all();

        $this->assertCount(0, $gurus, 'Tanpa tenant, SchoolScope harus memblokir semua query (fail-closed).');
    }

    /** withoutGlobalScope harus tetap bisa membaca semua data lintas tenant. */
    public function test_without_global_scope_membaca_lintas_tenant(): void
    {
        $schoolA = $this->createSchool(['nama' => 'Sekolah A']);
        $schoolB = $this->createSchool(['nama' => 'Sekolah B']);

        \Illuminate\Support\Facades\DB::table('gurus')->insert([
            ['school_id' => $schoolA->id, 'nuptk' => '1111111111111111', 'nama' => 'Guru A', 'created_at' => now(), 'updated_at' => now()],
            ['school_id' => $schoolB->id, 'nuptk' => '2222222222222222', 'nama' => 'Guru B', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Tanpa tenant pun, withoutGlobalScope harus bisa baca semua
        $this->clearTenant();

        $allGurus = Guru::withoutGlobalScope(SchoolScope::class)->get();

        $this->assertCount(2, $allGurus, 'withoutGlobalScope harus bisa bypass tenant dan baca semua data.');
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. API — cross-tenant access via endpoint
    // ─────────────────────────────────────────────────────────────────

    /** Operator school A tidak bisa mengakses data guru school B via API. */
    public function test_operator_tidak_bisa_akses_data_guru_tenant_lain(): void
    {
        // Setup school A + operator A
        $schoolA = $this->createSchool(['nama' => 'Sekolah A']);
        $operatorA = $this->createUserForSchool($schoolA, 'operator');

        // Setup school B + guru di school B
        $schoolB = $this->createSchool(['nama' => 'Sekolah B']);
        $nuptkB = '9876543210123456';
        \Illuminate\Support\Facades\DB::table('gurus')->insert([
            'school_id' => $schoolB->id,
            'nuptk' => $nuptkB,
            'nama' => 'Guru Rahasia Sekolah B',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Login sebagai operator A, request data guru school A (X-School-ID = schoolA)
        $this->actingAs($operatorA, 'sanctum');
        $this->setTenant($schoolA->id);

        $response = $this->jsonWithTenant('GET', "/api/operator/master-data/guru/{$nuptkB}", [], $schoolA->id);

        // Harus 404 karena guru itu bukan milik school A
        $response->assertStatus(404);
    }

    /** Request tanpa X-School-ID dan tanpa subdomain → API harus 401 atau data kosong. */
    public function test_request_tanpa_tenant_header_diblokir(): void
    {
        $school = $this->createSchool();
        $operator = $this->createUserForSchool($school, 'operator');

        // Hapus tenant dari app container
        $this->clearTenant();

        // Minta daftar guru TANPA X-School-ID header
        $response = $this->actingAs($operator, 'sanctum')
            ->getJson('/api/operator/master-data/guru');

        // Tanpa tenant → controller harus melempar 401/403 atau data kosong
        // SchoolScope memblokir query → hasilnya bisa 200 dengan data=[] atau 401/403
        $status = $response->status();
        $this->assertContains(
            $status,
            [200, 401, 403],
            "Request tanpa tenant harus diblokir atau mengembalikan data kosong."
        );

        if ($status === 200) {
            $data = $response->json('data');
            // Kalau 200, datanya harus array kosong
            $this->assertEmpty($data, 'Response 200 tanpa tenant harus berisi data kosong.');
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. TenantMiddleware — resolve dari header X-School-ID
    // ─────────────────────────────────────────────────────────────────

    /** X-School-ID yang valid harus diset ke app container oleh TenantMiddleware. */
    public function test_tenant_middleware_resolve_school_dari_header(): void
    {
        $school = $this->createSchool();
        $operator = $this->createUserForSchool($school, 'operator');

        $this->actingAs($operator, 'sanctum');

        // Kirim dengan X-School-ID
        $response = $this->getJson(
            '/api/operator/master-data/guru',
            ['X-School-ID' => $school->id]
        );

        // Harus bisa diakses (200) karena tenant ter-resolve
        $response->assertStatus(200);
    }

    // ─────────────────────────────────────────────────────────────────
    // 4. User hanya membaca user milik tenant sendiri
    // ─────────────────────────────────────────────────────────────────

    /** User::all() di school A tidak boleh mengembalikan user school B. */
    public function test_user_query_terisolasi_per_tenant(): void
    {
        $schoolA = $this->createSchool(['nama' => 'Sekolah A']);
        $this->createUserForSchool($schoolA, 'operator');

        $schoolB = $this->createSchool(['nama' => 'Sekolah B']);
        $this->createUserForSchool($schoolB, 'guru');

        // Set tenant ke school A
        $this->setTenant($schoolA->id);

        // User::all() pakai HasSchoolScope → hanya user school A
        $users = User::all();

        // Semua user yang dikembalikan harus milik school A
        $this->assertTrue(
            $users->every(fn($u) => $u->school_id === $schoolA->id),
            'User query harus terisolasi hanya untuk tenant aktif.'
        );
    }

    // ─────────────────────────────────────────────────────────────────
    // 5. School dengan status suspended tidak bisa diakses
    // ─────────────────────────────────────────────────────────────────

    /** School dengan status suspended → API harus return 403 SCHOOL_SUSPENDED. */
    public function test_school_suspended_diblokir_oleh_middleware(): void
    {
        $school = $this->createSchool(['status' => 'suspended']);
        $operator = $this->createUserForSchool($school, 'operator');

        $response = $this->actingAs($operator, 'sanctum')
            ->getJson(
                '/api/operator/master-data/guru',
                ['X-School-ID' => $school->id]
            );

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'code' => 'SCHOOL_SUSPENDED',
            ]);
    }
}