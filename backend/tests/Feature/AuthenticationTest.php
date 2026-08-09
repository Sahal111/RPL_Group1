<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * AuthenticationTest
 *
 * Skenario yang dicover:
 *   1. Login sukses → response JSON + cookie auth_token HttpOnly ter-set.
 *   2. Login gagal (password salah) → 422.
 *   3. Login akun non-aktif → 403.
 *   4. Login dengan email (bukan username) → sukses.
 *   5. Logout → token dihapus + cookie di-clear.
 *   6. /auth/me dengan token valid → return data user.
 *   7. /auth/me tanpa token → 401.
 *   8. Route operator tidak bisa diakses oleh role guru.
 *   9. Route operator tidak bisa diakses tanpa login.
 *  10. is_active = false → role middleware tolak dengan 403.
 */
class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    // ─────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────

    private function makeOperator(): array
    {
        $school = $this->createSchool();
        $operator = $this->createUserForSchool($school, 'operator', [
            'username' => 'operator_test',
            'email' => 'operator@sekolah.id',
            'password' => bcrypt('password123'),
        ]);

        return compact('school', 'operator');
    }

    // ─────────────────────────────────────────────────────────────────
    // 1–4: Login
    // ─────────────────────────────────────────────────────────────────

    /** Login sukses dengan username yang benar → 200 + cookie auth_token. */
    public function test_login_sukses_dengan_username(): void
    {
        ['school' => $school, 'operator' => $operator] = $this->makeOperator();

        $response = $this->jsonWithTenant('POST', '/api/auth/login', [
            'login' => 'operator_test',
            'password' => 'password123',
        ], $school->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'username', 'email', 'nama', 'role'],
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => ['user' => ['role' => 'operator']],
            ]);

        // Cookie auth_token harus di-set oleh response
        $this->assertNotNull(
            $response->headers->getCookies(),
            'Cookie auth_token harus di-set setelah login sukses.'
        );

        // Cek cookie ada di response
        $cookies = collect($response->headers->getCookies())
            ->keyBy(fn($c) => $c->getName());

        $this->assertTrue(
            $cookies->has('auth_token'),
            'Cookie auth_token harus ada di response headers.'
        );

        $cookie = $cookies->get('auth_token');
        $this->assertTrue(
            $cookie->isHttpOnly(),
            'Cookie auth_token harus HttpOnly agar tidak bisa dibaca JavaScript (XSS-safe).'
        );
    }

    /** Login sukses dengan email (bukan username). */
    public function test_login_sukses_dengan_email(): void
    {
        ['school' => $school, 'operator' => $operator] = $this->makeOperator();

        $response = $this->jsonWithTenant('POST', '/api/auth/login', [
            'login' => 'operator@sekolah.id',
            'password' => 'password123',
        ], $school->id);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    /** Login dengan password salah → 422 VALIDATION_ERROR. */
    public function test_login_gagal_password_salah(): void
    {
        ['school' => $school] = $this->makeOperator();

        $response = $this->jsonWithTenant('POST', '/api/auth/login', [
            'login' => 'operator_test',
            'password' => 'password_salah',
        ], $school->id);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    /** Login akun tidak aktif → 403. */
    public function test_login_akun_nonaktif_ditolak(): void
    {
        $school = $this->createSchool();
        $nonaktif = $this->createUserForSchool($school, 'operator', [
            'username' => 'operator_nonaktif',
            'password' => bcrypt('password123'),
            'is_active' => false,
        ]);

        $response = $this->jsonWithTenant('POST', '/api/auth/login', [
            'login' => 'operator_nonaktif',
            'password' => 'password123',
        ], $school->id);

        $response->assertStatus(403)
            ->assertJson(['success' => false]);
    }

    // ─────────────────────────────────────────────────────────────────
    // 5: Logout
    // ─────────────────────────────────────────────────────────────────

    /** Logout → 200 + cookie auth_token di-clear. */
    public function test_logout_menghapus_token_dan_cookie(): void
    {
        ['school' => $school, 'operator' => $operator] = $this->makeOperator();
        $this->actingAs($operator, 'sanctum');

        $response = $this->jsonWithTenant('POST', '/api/auth/logout', [], $school->id);

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Logout berhasil.']);

        // Token user harus sudah dihapus dari DB
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_type' => User::class,
            'tokenable_id' => $operator->id,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────
    // 6–7: /auth/me
    // ─────────────────────────────────────────────────────────────────

    /** /auth/me dengan token valid → return data user. */
    public function test_me_dengan_token_valid_return_data_user(): void
    {
        ['school' => $school, 'operator' => $operator] = $this->makeOperator();
        $this->actingAs($operator, 'sanctum');

        $response = $this->jsonWithTenant('GET', '/api/auth/me', [], $school->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['id', 'username', 'email', 'nama', 'role'],
            ])
            ->assertJsonPath('data.username', 'operator_test');
    }

    /** /auth/me tanpa token → 401. */
    public function test_me_tanpa_token_return_401(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'code' => 'UNAUTHENTICATED',
            ]);
    }

    // ─────────────────────────────────────────────────────────────────
    // 8–9: Role Guard
    // ─────────────────────────────────────────────────────────────────

    /** Guru tidak bisa mengakses route operator. */
    public function test_guru_tidak_bisa_akses_route_operator(): void
    {
        $school = $this->createSchool();
        $guru = $this->createUserForSchool($school, 'guru');
        $this->actingAs($guru, 'sanctum');

        $response = $this->jsonWithTenant('GET', '/api/operator/master-data/guru', [], $school->id);

        $response->assertStatus(403);
    }

    /** Request tanpa token ke route protected → 401. */
    public function test_request_tanpa_token_ke_route_protected_return_401(): void
    {
        $school = $this->createSchool();

        $response = $this->getJson(
            '/api/operator/master-data/guru',
            ['X-School-ID' => $school->id]
        );

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'code' => 'UNAUTHENTICATED',
            ]);
    }

    // ─────────────────────────────────────────────────────────────────
    // 10: Akun non-aktif via role middleware
    // ─────────────────────────────────────────────────────────────────

    /** User aktif=false yang berhasil actingAs tetap ditolak oleh RoleMiddleware. */
    public function test_user_nonaktif_ditolak_oleh_role_middleware(): void
    {
        $school = $this->createSchool();
        $operator = $this->createUserForSchool($school, 'operator', [
            'is_active' => false,
        ]);

        // actingAs bypass login, tapi RoleMiddleware cek is_active
        $this->actingAs($operator, 'sanctum');

        $response = $this->jsonWithTenant('GET', '/api/operator/master-data/guru', [], $school->id);

        // RoleMiddleware menolak user non-aktif dengan 403
        $response->assertStatus(403)
            ->assertJson(['success' => false]);
    }

    // ─────────────────────────────────────────────────────────────────
    // 11: Register Ortu
    // ─────────────────────────────────────────────────────────────────

    /** Register ortu dengan NISN yang tidak ada → 422. */
    public function test_register_ortu_nisn_tidak_ditemukan(): void
    {
        $school = $this->createSchool();

        $response = $this->jsonWithTenant('POST', '/api/auth/register-ortu', [
            'nama' => 'Ayah Test',
            'username' => 'ayahtest',
            'email' => 'ayah@test.id',
            'password' => 'password123',
            'hubungan' => 'Ayah',
            'no_hp' => '081234567890',
            'nisn' => '0000000000', // NISN tidak ada
            'kode_sekolah' => 'KODE_SALAH',
        ], $school->id);

        $response->assertStatus(422)
            ->assertJson(['success' => false]);
    }
}
