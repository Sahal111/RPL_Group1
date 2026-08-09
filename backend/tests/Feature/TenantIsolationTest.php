<?php

namespace Tests\Feature;

use App\Models\Guru;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Test: SchoolScope multi-tenancy isolation.
 *
 * Memastikan data satu sekolah tidak bocor ke sekolah lain,
 * dan fail-closed design bekerja ketika tenant tidak ter-resolve.
 */
class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    private School $schoolA;
    private School $schoolB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->schoolA = $this->createSchool(['nama' => 'SDN A', 'npsn' => '11111111']);
        $this->schoolB = $this->createSchool(['nama' => 'SDN B', 'npsn' => '22222222']);
    }

    // ── SchoolScope — Fail-Closed ─────────────────────────────────────────────

    /**
     * Tanpa tenant context → query harus mengembalikan 0 record (1=0).
     */
    public function test_school_scope_returns_empty_when_no_tenant_resolved(): void
    {
        $this->clearTenant();

        // Buat guru untuk schoolA
        Guru::withoutGlobalScopes()->create($this->dummyGuruData($this->schoolA->id, 'G001'));

        // Tanpa tenant — harus 0
        $count = Guru::count();

        $this->assertEquals(0, $count, 'SchoolScope harus fail-closed (0 record) ketika tenant tidak ter-resolve.');
    }

    /**
     * Dengan tenant context → hanya data milik tenant yang muncul.
     */
    public function test_school_scope_only_returns_data_for_current_tenant(): void
    {
        Guru::withoutGlobalScopes()->create($this->dummyGuruData($this->schoolA->id, 'G001'));
        Guru::withoutGlobalScopes()->create($this->dummyGuruData($this->schoolB->id, 'G002'));

        $this->setTenant($this->schoolA->id);
        $guruA = Guru::all();

        $this->assertCount(1, $guruA);
        $this->assertEquals('G001', $guruA->first()->nuptk);
    }

    /**
     * Tenant A tidak boleh lihat data Tenant B, dan sebaliknya.
     */
    public function test_tenant_a_cannot_see_tenant_b_data(): void
    {
        Guru::withoutGlobalScopes()->create($this->dummyGuruData($this->schoolA->id, 'NUPTK_A'));
        Guru::withoutGlobalScopes()->create($this->dummyGuruData($this->schoolB->id, 'NUPTK_B'));

        // Set ke schoolB — harus hanya dapat data B
        $this->setTenant($this->schoolB->id);
        $guruVisible = Guru::pluck('nuptk');

        $this->assertContains('NUPTK_B', $guruVisible->toArray());
        $this->assertNotContains('NUPTK_A', $guruVisible->toArray());
    }

    /**
     * withoutGlobalScope memungkinkan bypass untuk admin.
     */
    public function test_without_global_scope_bypasses_tenant_filter(): void
    {
        Guru::withoutGlobalScopes()->create($this->dummyGuruData($this->schoolA->id, 'NUPTK_A'));
        Guru::withoutGlobalScopes()->create($this->dummyGuruData($this->schoolB->id, 'NUPTK_B'));

        // Bahkan tanpa tenant — bypass scope → dapat semua
        $this->clearTenant();
        $allGuru = Guru::withoutGlobalScope(\App\Models\Scopes\SchoolScope::class)->get();

        $this->assertCount(2, $allGuru);
    }

    // ── API — Cross-Tenant via Header ─────────────────────────────────────────

    /**
     * Operator schoolA hanya dapat data gurunyaa lewat API.
     */
    public function test_api_operator_only_sees_own_school_guru(): void
    {
        // Guru di masing-masing sekolah
        Guru::withoutGlobalScopes()->create($this->dummyGuruData($this->schoolA->id, 'NUPTK_A'));
        Guru::withoutGlobalScopes()->create($this->dummyGuruData($this->schoolB->id, 'NUPTK_B'));

        // Operator schoolA login
        $operator = $this->createUserWithRole($this->schoolA->id, 'operator');

        $response = $this
            ->actingAs($operator)
            ->withHeaders($this->withTenantHeader($this->schoolA->id))
            ->getJson('/api/operator/master-data/guru');

        $response->assertStatus(200);

        $nuptkList = collect($response->json('data.data') ?? $response->json('data') ?? [])->pluck('nuptk');
        $this->assertContains('NUPTK_A', $nuptkList->toArray());
        $this->assertNotContains('NUPTK_B', $nuptkList->toArray());
    }

    /**
     * Operator tidak bisa akses endpoint tanpa login (unauthenticated).
     */
    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/operator/master-data/guru');

        $response->assertStatus(401);
    }

    /**
     * User dengan role 'guru' tidak bisa akses endpoint operator.
     */
    public function test_guru_role_cannot_access_operator_master_data(): void
    {
        $guruUser = $this->createUserWithRole($this->schoolA->id, 'guru');

        $response = $this
            ->actingAs($guruUser)
            ->withHeaders($this->withTenantHeader($this->schoolA->id))
            ->getJson('/api/operator/master-data/guru');

        $response->assertStatus(403);
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private function dummyGuruData(int $schoolId, string $nuptk): array
    {
        return [
            'school_id' => $schoolId,
            'nuptk' => $nuptk,
            'nama' => 'Guru ' . $nuptk,
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => '1990-01-01',
            'jenis_ptk' => 'Guru Tetap',
            'status_kepegawaian' => 'PNS',
        ];
    }
}