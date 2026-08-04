# 15 · Testing Standard

---

## Filosofi

Test bukan untuk kejar angka coverage.
Test untuk memastikan **behavior yang penting tidak rusak** saat ada perubahan.

Prioritas test:
1. Service Layer — logic utama ada di sini
2. API Endpoint (Feature Test) — pastikan response sesuai kontrak
3. Import/Export — prone to bug
4. Auth & Permission — security critical

---

## Setup

```bash
# Backend — PHPUnit (sudah include di Laravel)
php artisan test

# Run test spesifik
php artisan test --filter GuruServiceTest
php artisan test tests/Feature/Guru/

# Database testing — pakai SQLite in-memory atau MySQL test database
# Di phpunit.xml:
# <env name="DB_CONNECTION" value="sqlite"/>
# <env name="DB_DATABASE" value=":memory:"/>
```

---

## Feature Test — API Endpoint

Feature test adalah test yang paling valuable di project ini.
Test bahwa endpoint berjalan dari ujung ke ujung.

```php
<?php

namespace Tests\Feature\Guru;

use App\Models\Guru;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuruControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $operator;
    private School $school;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup tenant
        $this->school   = School::factory()->create();
        $this->operator = User::factory()->create(['school_id' => $this->school->id]);
        $this->operator->roles()->attach(
            Role::where('slug', 'operator')->where('school_id', $this->school->id)->first()
        );
    }

    /** @test */
    public function operator_dapat_melihat_list_guru(): void
    {
        Guru::factory(5)->create(['school_id' => $this->school->id]);

        $response = $this->actingAs($this->operator)
            ->getJson('/api/v1/guru');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'nama', 'nuptk', 'status_keaktifan'],
                ],
                'meta' => ['current_page', 'total'],
            ])
            ->assertJson(['success' => true]);

        $this->assertCount(5, $response->json('data'));
    }

    /** @test */
    public function operator_tidak_dapat_lihat_guru_sekolah_lain(): void
    {
        $sekolahLain = School::factory()->create();
        Guru::factory(3)->create(['school_id' => $sekolahLain->id]);

        $response = $this->actingAs($this->operator)
            ->getJson('/api/v1/guru');

        $response->assertOk();
        // SchoolScope harus filter — tidak boleh ada data sekolah lain
        $this->assertCount(0, $response->json('data'));
    }

    /** @test */
    public function operator_dapat_tambah_guru(): void
    {
        $payload = [
            'nama'          => 'Ahmad Fauzi',
            'jenis_kelamin' => 'Laki-laki',
            'jenis_ptk'     => 'Guru Kelas',
            'tanggal_lahir' => '1990-05-15',
        ];

        $response = $this->actingAs($this->operator)
            ->postJson('/api/v1/guru', $payload);

        $response->assertCreated()
            ->assertJson([
                'success' => true,
                'data'    => ['nama' => 'Ahmad Fauzi'],
            ]);

        $this->assertDatabaseHas('gurus', [
            'nama'      => 'Ahmad Fauzi',
            'school_id' => $this->school->id,
        ]);
    }

    /** @test */
    public function validasi_gagal_jika_nama_kosong(): void
    {
        $response = $this->actingAs($this->operator)
            ->postJson('/api/v1/guru', ['nama' => '']);

        $response->assertUnprocessable()
            ->assertJson([
                'success' => false,
                'code'    => 'VALIDATION_ERROR',
            ])
            ->assertJsonValidationErrors(['nama']);
    }

    /** @test */
    public function guest_tidak_dapat_akses_endpoint_guru(): void
    {
        $this->getJson('/api/v1/guru')
            ->assertUnauthorized()
            ->assertJson([
                'success' => false,
                'code'    => 'UNAUTHENTICATED',
            ]);
    }

    /** @test */
    public function guru_tidak_dapat_hapus_data_guru_lain(): void
    {
        $guru      = Guru::factory()->create(['school_id' => $this->school->id]);
        $userGuru  = User::factory()->create(['school_id' => $this->school->id]);
        $userGuru->roles()->attach(
            Role::where('slug', 'guru')->where('school_id', $this->school->id)->first()
        );

        $this->actingAs($userGuru)
            ->deleteJson("/api/v1/guru/{$guru->ulid}")
            ->assertForbidden();
    }
}
```

---

## Unit Test — Service

```php
<?php

namespace Tests\Unit\Services;

use App\Models\Guru;
use App\Services\Guru\GuruService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuruServiceTest extends TestCase
{
    use RefreshDatabase;

    private GuruService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(GuruService::class);
    }

    /** @test */
    public function dapat_membuat_guru_baru(): void
    {
        $school = School::factory()->create();

        // Set tenant context
        app()->instance('current_school_id', $school->id);

        $guru = $this->service->create([
            'school_id'     => $school->id,
            'nama'          => 'Test Guru',
            'jenis_kelamin' => 'Perempuan',
            'jenis_ptk'     => 'Guru Mata Pelajaran',
            'tanggal_lahir' => '1985-03-20',
        ]);

        $this->assertInstanceOf(Guru::class, $guru);
        $this->assertEquals('Test Guru', $guru->nama);
        $this->assertNotNull($guru->ulid);
    }

    /** @test */
    public function soft_delete_guru_tidak_dihapus_permanen(): void
    {
        $guru = Guru::factory()->create();

        $this->service->delete($guru->ulid);

        $this->assertSoftDeleted('gurus', ['id' => $guru->id]);
        $this->assertDatabaseHas('gurus', ['id' => $guru->id]);
    }
}
```

---

## Test untuk Import

```php
/** @test */
public function import_guru_dispatch_job_dan_return_import_log_id(): void
{
    Queue::fake();

    $file = UploadedFile::fake()->create('guru.xlsx', 100, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    $response = $this->actingAs($this->operator)
        ->postJson('/api/v1/guru/import', ['file' => $file]);

    $response->assertOk()
        ->assertJsonStructure(['data' => ['import_log_id']]);

    Queue::assertPushed(ProcessGuruImport::class);
    $this->assertDatabaseHas('guru_import_logs', ['status' => 'pending']);
}
```

---

## Aturan Testing

```
✅ Wajib test untuk:
- Semua endpoint API (happy path + error path)
- Service method yang punya logic kondisional
- Import dan export
- Permission check (guru tidak bisa akses endpoint operator)
- Cross-tenant isolation (data sekolah lain tidak bocor)

⚠️  Tidak perlu test:
- Eloquent relationship yang sudah proven
- Laravel helper method
- Config dan env loading

❌ Jangan:
- Test database production
- Commit test yang gagal (kecuali WIP branch)
- Skip RefreshDatabase — bisa saling interferensi antar test
```

---

## Menjalankan Test di CI

```bash
# Sebelum push, jalankan:
php artisan test --parallel   # lebih cepat dengan parallel

# Target coverage (saran, bukan wajib):
# Feature test coverage: >80%
# Service coverage: >90%
```
