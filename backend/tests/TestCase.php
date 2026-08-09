<?php

namespace Tests;

use App\Models\Role;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Hash;

abstract class TestCase extends BaseTestCase
{
    /**
     * Buat sekolah dummy untuk testing.
     */
    protected function createSchool(array $overrides = []): School
    {
        return School::create(array_merge([
            'nama' => 'SDN Test',
            'npsn' => '12345678',
            'jenis' => 'SD',
            'status' => 'active',
        ], $overrides));
    }

    /**
     * Buat role untuk sebuah sekolah.
     */
    protected function createRole(int $schoolId, string $slug, string $nama): Role
    {
        return Role::withoutGlobalScopes()->create([
            'school_id' => $schoolId,
            'slug' => $slug,
            'nama' => $nama,
            'is_active' => true,
            'is_system' => true,
        ]);
    }

    /**
     * Buat user dengan role tertentu untuk sekolah tertentu.
     */
    protected function createUserWithRole(int $schoolId, string $roleSlug, array $overrides = []): User
    {
        $role = Role::withoutGlobalScopes()
            ->where('school_id', $schoolId)
            ->where('slug', $roleSlug)
            ->first()
            ?? $this->createRole($schoolId, $roleSlug, ucfirst(str_replace('_', ' ', $roleSlug)));

        $user = User::withoutGlobalScopes()->create(array_merge([
            'school_id' => $schoolId,
            'name' => 'User Test ' . $roleSlug,
            'username' => $roleSlug . '_' . $schoolId . '_' . rand(1000, 9999),
            'email' => $roleSlug . '_' . $schoolId . rand(100, 999) . '@test.com',
            'password' => Hash::make('password'),
            'is_active' => true,
        ], $overrides));

        $user->roles()->attach($role);

        return $user;
    }

    /**
     * Set tenant context (simulasi TenantMiddleware).
     */
    protected function setTenant(int $schoolId): void
    {
        app()->instance('current_school_id', $schoolId);
    }

    /**
     * Clear tenant context.
     */
    protected function clearTenant(): void
    {
        app()->instance('current_school_id', null);
    }

    /**
     * Buat request header untuk set tenant via header (bypass subdomain).
     */
    protected function withTenantHeader(int $schoolId): array
    {
        return ['X-School-ID' => $schoolId];
    }
}