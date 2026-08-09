<?php

namespace Tests;

use App\Models\Role;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

abstract class TestCase extends BaseTestCase
{
    // ─────────────────────────────────────────────────────────────────
    // TENANT HELPERS
    // ─────────────────────────────────────────────────────────────────

    /**
     * Buat school testing dan bind ke app container.
     * Otomatis dipakai oleh createUserForSchool().
     */
    protected function createSchool(array $overrides = []): School
    {
        $school = School::create(array_merge([
            'nama' => 'SD Test ' . Str::random(5),
            'npsn' => (string) random_int(10000000, 99999999),
            'jenis' => 'SD',
            'status' => 'active',
        ], $overrides));

        $this->setTenant($school->id);

        return $school;
    }

    /**
     * Set current_school_id di app container (simulasi TenantMiddleware).
     */
    protected function setTenant(?int $schoolId): void
    {
        app()->instance('current_school_id', $schoolId);
    }

    /**
     * Hapus tenant dari container (simulasi request tanpa tenant).
     */
    protected function clearTenant(): void
    {
        app()->instance('current_school_id', null);
    }

    // ─────────────────────────────────────────────────────────────────
    // USER / ROLE HELPERS
    // ─────────────────────────────────────────────────────────────────

    /**
     * Buat user dengan role tertentu untuk school yang diberikan.
     *
     * @param  School  $school
     * @param  string  $roleSlug  'operator' | 'guru' | 'kepsek' | 'ortu' | ...
     */
    protected function createUserForSchool(School $school, string $roleSlug, array $userOverrides = []): User
    {
        // Pastikan role ada untuk school ini
        $role = Role::firstOrCreate(
            ['school_id' => $school->id, 'slug' => $roleSlug],
            ['nama' => ucfirst($roleSlug), 'school_id' => $school->id]
        );

        $user = User::create(array_merge([
            'school_id' => $school->id,
            'name' => ucfirst($roleSlug) . ' Test',
            'username' => $roleSlug . '_' . Str::random(4),
            'email' => $roleSlug . '_' . Str::random(4) . '@test.id',
            'password' => bcrypt('password123'),
            'is_active' => true,
        ], $userOverrides));

        DB::table('user_roles')->insert([
            'user_id' => $user->id,
            'role_id' => $role->id,
            'created_at' => now(),
        ]);

        return $user->load('roles');
    }

    /**
     * Shorthand: buat school + user operator, lakukan actingAs, dan
     * set X-School-ID header di setiap request.
     *
     * Return: ['school' => School, 'user' => User]
     */
    protected function loginAsOperator(): array
    {
        $school = $this->createSchool();
        $user = $this->createUserForSchool($school, 'operator');

        $this->actingAs($user, 'sanctum');

        return compact('school', 'user');
    }

    /**
     * Override withHeaders agar X-School-ID selalu ikut sesuai tenant aktif.
     */
    protected function jsonWithTenant(
        string $method,
        string $uri,
        array $data = [],
        ?int $schoolId = null
    ) {
        $sid = $schoolId ?? app()->bound('current_school_id')
            ? app('current_school_id')
            : null;

        $headers = $sid ? ['X-School-ID' => $sid] : [];

        return $this->json($method, $uri, $data, $headers);
    }
}