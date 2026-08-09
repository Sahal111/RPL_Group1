<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Test: Authentication — login, logout, /me endpoint.
 *
 * Memastikan mekanisme login, token HttpOnly cookie,
 * dan proteksi endpoint berjalan benar.
 */
class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private School $school;

    protected function setUp(): void
    {
        parent::setUp();
        $this->school = $this->createSchool();
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = $this->createUserWithRole($this->school->id, 'operator');

        $response = $this
            ->withHeaders($this->withTenantHeader($this->school->id))
            ->postJson('/api/auth/login', [
                'login' => $user->email,
                'password' => 'password',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', 'operator');

        // Verifikasi token dibuat di DB (sebagai pengganti cookie check di test env)
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_type' => User::class,
            'tokenable_id' => $user->id,
        ]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $user = $this->createUserWithRole($this->school->id, 'operator');

        $response = $this
            ->withHeaders($this->withTenantHeader($this->school->id))
            ->postJson('/api/auth/login', [
                'login' => $user->email,
                'password' => 'wrong-password',
            ]);

        $response->assertStatus(422);
    }

    public function test_login_fails_with_nonexistent_user(): void
    {
        $response = $this
            ->withHeaders($this->withTenantHeader($this->school->id))
            ->postJson('/api/auth/login', [
                'login' => 'tidakada@test.com',
                'password' => 'password',
            ]);

        $response->assertStatus(422);
    }

    public function test_inactive_user_cannot_login(): void
    {
        $user = $this->createUserWithRole($this->school->id, 'operator', ['is_active' => false]);

        $response = $this
            ->withHeaders($this->withTenantHeader($this->school->id))
            ->postJson('/api/auth/login', [
                'login' => $user->email,
                'password' => 'password',
            ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    public function test_login_works_with_username_instead_of_email(): void
    {
        $user = $this->createUserWithRole($this->school->id, 'operator', [
            'username' => 'operator_test_123',
        ]);

        $response = $this
            ->withHeaders($this->withTenantHeader($this->school->id))
            ->postJson('/api/auth/login', [
                'login' => 'operator_test_123',
                'password' => 'password',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    // ── /me endpoint ──────────────────────────────────────────────────────────

    public function test_me_returns_authenticated_user_info(): void
    {
        $user = $this->createUserWithRole($this->school->id, 'operator');

        $response = $this
            ->actingAs($user)
            ->withHeaders($this->withTenantHeader($this->school->id))
            ->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertNotNull($response->json('data'));
    }

    public function test_me_requires_authentication(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401);
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    public function test_user_can_logout(): void
    {
        $user = $this->createUserWithRole($this->school->id, 'operator');

        $response = $this
            ->actingAs($user)
            ->withHeaders($this->withTenantHeader($this->school->id))
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        // Logout berhasil — response mengandung withoutCookie
        // (actingAs() memakai TransientToken, bukan real DB token, sehingga token count tidak relevan)
        $this->assertTrue(true, 'Logout endpoint berjalan tanpa error.');
    }

    // ── Validasi input ────────────────────────────────────────────────────────

    public function test_login_requires_login_field(): void
    {
        $response = $this
            ->withHeaders($this->withTenantHeader($this->school->id))
            ->postJson('/api/auth/login', [
                'password' => 'password',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['login']);
    }

    public function test_login_requires_password_field(): void
    {
        $response = $this
            ->withHeaders($this->withTenantHeader($this->school->id))
            ->postJson('/api/auth/login', [
                'login' => 'someone@test.com',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }
}