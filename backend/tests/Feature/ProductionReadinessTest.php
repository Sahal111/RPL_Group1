<?php

namespace Tests\Feature;

use App\Casts\EncryptedJson;
use App\Casts\EncryptedString;
use App\Models\GlobalUser;
use App\Models\Guru;
use App\Models\OrangTua;
use App\Models\School;
use App\Models\Siswa;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * Test: Production Readiness — 7 Critical Fixes
 *
 * Mencakup semua fix dari db_audit_report.md:
 *   #1 — password_reset_tokens: school_id sebagai composite PK
 *   #2 — user_roles: school_id isolasi privilege
 *   #3 — role_permissions: school_id isolasi permission
 *   #4 — Financial CASCADE → RESTRICT
 *   #5 — PII Encryption (NIK, No.KK, NISN, NIP)
 *   #6 — schools: soft delete
 *   #7 — two_factor_recovery_codes: encrypted
 */
class ProductionReadinessTest extends TestCase
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

    // ══════════════════════════════════════════════════════════════════════════
    // Fix #1 — password_reset_tokens: Composite PK (school_id, email)
    // ══════════════════════════════════════════════════════════════════════════

    /** @test */
    public function password_reset_tokens_table_has_school_id_column(): void
    {
        $this->assertTrue(
            Schema::hasColumn('password_reset_tokens', 'school_id'),
            'Kolom school_id harus ada di password_reset_tokens'
        );
    }

    /** @test */
    public function same_email_different_schools_can_have_separate_reset_tokens(): void
    {
        $email = 'guru@example.com';

        // Insert token untuk Sekolah A
        DB::table('password_reset_tokens')->insert([
            'school_id' => $this->schoolA->id,
            'email' => $email,
            'token' => Hash::make('token_a'),
            'created_at' => now(),
        ]);

        // Insert token untuk Sekolah B — harus TIDAK conflict
        DB::table('password_reset_tokens')->insert([
            'school_id' => $this->schoolB->id,
            'email' => $email,
            'token' => Hash::make('token_b'),
            'created_at' => now(),
        ]);

        $count = DB::table('password_reset_tokens')->where('email', $email)->count();

        $this->assertEquals(2, $count, 'Email yang sama di dua sekolah berbeda harus bisa punya token masing-masing');
    }

    /** @test */
    public function duplicate_token_for_same_school_and_email_is_rejected(): void
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        $email = 'user@example.com';

        DB::table('password_reset_tokens')->insert([
            'school_id' => $this->schoolA->id,
            'email' => $email,
            'token' => Hash::make('token_1'),
            'created_at' => now(),
        ]);

        // Duplicate di sekolah yang sama — harus DITOLAK oleh PK constraint
        DB::table('password_reset_tokens')->insert([
            'school_id' => $this->schoolA->id,
            'email' => $email,
            'token' => Hash::make('token_2'),
            'created_at' => now(),
        ]);
    }

    /** @test */
    public function forgot_password_api_scopes_token_to_current_school(): void
    {
        $user = User::factory()->create([
            'school_id' => $this->schoolA->id,
            'email' => 'test@example.com',
        ]);

        $this->setTenant($this->schoolA->id);

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200)->assertJson(['success' => true]);

        // Token harus disimpan dengan school_id Sekolah A
        $token = DB::table('password_reset_tokens')
            ->where('school_id', $this->schoolA->id)
            ->where('email', 'test@example.com')
            ->first();

        $this->assertNotNull($token, 'Token harus ada dan di-scope ke school_id yang benar');
    }

    /** @test */
    public function reset_password_cannot_use_token_from_different_school(): void
    {
        $email = 'shared@example.com';

        // Buat token untuk Sekolah A
        DB::table('password_reset_tokens')->insert([
            'school_id' => $this->schoolA->id,
            'email' => $email,
            'token' => Hash::make('valid_token'),
            'created_at' => now(),
        ]);

        // Coba reset dari konteks Sekolah B — harus gagal
        $this->setTenant($this->schoolB->id);

        $response = $this->postJson('/api/auth/reset-password', [
            'email' => $email,
            'token' => 'valid_token',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertStatus(422);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Fix #2 & #3 — user_roles + role_permissions: school_id
    // ══════════════════════════════════════════════════════════════════════════

    /** @test */
    public function user_roles_table_has_school_id_column(): void
    {
        $this->assertTrue(
            Schema::hasColumn('user_roles', 'school_id'),
            'Kolom school_id harus ada di user_roles'
        );
    }

    /** @test */
    public function role_permissions_table_has_school_id_column(): void
    {
        $this->assertTrue(
            Schema::hasColumn('role_permissions', 'school_id'),
            'Kolom school_id harus ada di role_permissions'
        );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Fix #4 — Financial CASCADE → RESTRICT
    // ══════════════════════════════════════════════════════════════════════════

    /** @test */
    public function deleting_siswa_with_tagihan_is_rejected_by_database(): void
    {
        if (!Schema::hasTable('siswas') || !Schema::hasTable('tagihans')) {
            $this->markTestSkipped('Tabel siswas/tagihans tidak ada');
        }

        $this->setTenant($this->schoolA->id);

        // Buat siswa
        $siswa = DB::table('siswas')->insertGetId([
            'school_id' => $this->schoolA->id,
            'nama' => 'Siswa Test',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Buat tagihan yang referensi siswa
        DB::table('tagihans')->insert([
            'school_id' => $this->schoolA->id,
            'siswa_id' => $siswa,
            'jumlah' => 500000,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Hard delete siswa harus DITOLAK (RESTRICT FK)
        $this->expectException(\Illuminate\Database\QueryException::class);

        DB::table('siswas')->where('id', $siswa)->delete();
    }

    /** @test */
    public function tagihans_fk_action_is_restrict_not_cascade(): void
    {
        if (!Schema::hasTable('tagihans')) {
            $this->markTestSkipped('Tabel tagihans tidak ada');
        }

        $fk = DB::selectOne("
            SELECT rc.DELETE_RULE
            FROM information_schema.REFERENTIAL_CONSTRAINTS rc
            JOIN information_schema.KEY_COLUMN_USAGE kcu
                ON rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
                AND rc.CONSTRAINT_SCHEMA = kcu.TABLE_SCHEMA
            WHERE kcu.TABLE_NAME = 'tagihans'
              AND kcu.COLUMN_NAME = 'siswa_id'
              AND kcu.TABLE_SCHEMA = DATABASE()
            LIMIT 1
        ");

        $this->assertNotNull($fk, 'FK tagihans.siswa_id harus ada');
        $this->assertEquals(
            'RESTRICT',
            $fk->DELETE_RULE,
            'tagihans.siswa_id FK harus RESTRICT — bukan CASCADE'
        );
    }

    /** @test */
    public function pembayarans_fk_action_is_restrict_not_cascade(): void
    {
        if (!Schema::hasTable('pembayarans')) {
            $this->markTestSkipped('Tabel pembayarans tidak ada');
        }

        $fk = DB::selectOne("
            SELECT rc.DELETE_RULE
            FROM information_schema.REFERENTIAL_CONSTRAINTS rc
            JOIN information_schema.KEY_COLUMN_USAGE kcu
                ON rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
                AND rc.CONSTRAINT_SCHEMA = kcu.TABLE_SCHEMA
            WHERE kcu.TABLE_NAME = 'pembayarans'
              AND kcu.COLUMN_NAME = 'siswa_id'
              AND kcu.TABLE_SCHEMA = DATABASE()
            LIMIT 1
        ");

        $this->assertNotNull($fk, 'FK pembayarans.siswa_id harus ada');
        $this->assertEquals(
            'RESTRICT',
            $fk->DELETE_RULE,
            'pembayarans.siswa_id FK harus RESTRICT — bukan CASCADE'
        );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Fix #5 — PII Encryption: NIK, No.KK, NISN, NIP, NUPTK
    // ══════════════════════════════════════════════════════════════════════════

    /** @test */
    public function siswa_nik_is_stored_encrypted_in_database(): void
    {
        if (!Schema::hasTable('siswas')) {
            $this->markTestSkipped('Tabel siswas tidak ada');
        }

        $this->setTenant($this->schoolA->id);

        $siswa = Siswa::create([
            'school_id' => $this->schoolA->id,
            'nama' => 'Budi Test',
            'nik' => '3201010101010001',
        ]);

        // Nilai di DB harus BUKAN plaintext
        $raw = DB::table('siswas')->where('id', $siswa->id)->value('nik');

        $this->assertNotEquals(
            '3201010101010001',
            $raw,
            'NIK harus tersimpan terenkripsi — bukan plaintext'
        );

        // Tapi akses melalui model harus transparan (plaintext)
        $this->assertEquals(
            '3201010101010001',
            $siswa->fresh()->nik,
            'Model harus mendekripsi NIK secara transparan'
        );
    }

    /** @test */
    public function guru_nip_is_stored_encrypted_in_database(): void
    {
        if (!Schema::hasTable('gurus')) {
            $this->markTestSkipped('Tabel gurus tidak ada');
        }

        $this->setTenant($this->schoolA->id);

        $guru = Guru::create([
            'school_id' => $this->schoolA->id,
            'nama' => 'Ibu Guru Test',
            'nip' => '199001012015012001',
            'jenis_kelamin' => 'P',
            'status_kepegawaian' => 'PNS',
        ]);

        $raw = DB::table('gurus')->where('id', $guru->id)->value('nip');

        $this->assertNotEquals(
            '199001012015012001',
            $raw,
            'NIP harus tersimpan terenkripsi'
        );
        $this->assertEquals(
            '199001012015012001',
            $guru->fresh()->nip,
            'Akses melalui model harus transparan'
        );
    }

    /** @test */
    public function encrypted_string_cast_produces_valid_crypt_payload(): void
    {
        $cast = new EncryptedString();
        $model = new Siswa();

        $encrypted = $cast->set($model, 'nik', '3201010101010001', []);

        // Harus bisa di-dekripsi oleh Laravel Crypt
        $decrypted = Crypt::decryptString($encrypted);

        $this->assertEquals('3201010101010001', $decrypted);
    }

    /** @test */
    public function encrypted_string_cast_returns_null_for_null_input(): void
    {
        $cast = new EncryptedString();
        $model = new Siswa();

        $encrypted = $cast->set($model, 'nik', null, []);
        $decrypted = $cast->get($model, 'nik', null, []);

        $this->assertNull($encrypted);
        $this->assertNull($decrypted);
    }

    /** @test */
    public function encrypted_json_cast_encrypts_and_decrypts_array(): void
    {
        $cast = new EncryptedJson();
        $model = new GlobalUser();

        $data = ['abc123', 'def456', 'ghi789'];
        $encrypted = $cast->set($model, 'two_factor_recovery_codes', $data, []);

        $this->assertIsString($encrypted, 'Output harus berupa string terenkripsi');
        $this->assertNotContains(
            'abc123',
            explode(',', $encrypted),
            'Nilai asli tidak boleh ada di ciphertext'
        );

        $decrypted = $cast->get($model, 'two_factor_recovery_codes', $encrypted, []);
        $this->assertEquals($data, $decrypted, 'Dekripsi harus mengembalikan array asli');
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Fix #6 — schools: soft delete
    // ══════════════════════════════════════════════════════════════════════════

    /** @test */
    public function schools_table_has_deleted_at_column(): void
    {
        $this->assertTrue(
            Schema::hasColumn('schools', 'deleted_at'),
            'Kolom deleted_at harus ada di tabel schools'
        );
    }

    /** @test */
    public function soft_deleting_school_does_not_hard_delete_from_database(): void
    {
        $school = $this->createSchool(['npsn' => '99999999']);

        $school->delete(); // soft delete

        // Masih ada di DB
        $this->assertDatabaseHas('schools', ['id' => $school->id]);

        // Tapi tidak muncul di query biasa
        $this->assertNull(School::find($school->id));

        // Bisa ditemukan dengan withTrashed
        $this->assertNotNull(School::withTrashed()->find($school->id));
    }

    /** @test */
    public function school_model_uses_soft_deletes_trait(): void
    {
        $school = new School();

        $this->assertContains(
            \Illuminate\Database\Eloquent\SoftDeletes::class,
            class_uses_recursive(get_class($school)),
            'Model School harus menggunakan trait SoftDeletes'
        );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Fix #7 — two_factor_recovery_codes: encrypted
    // ══════════════════════════════════════════════════════════════════════════

    /** @test */
    public function global_user_recovery_codes_are_stored_encrypted(): void
    {
        $user = GlobalUser::factory()->create([
            'two_factor_recovery_codes' => ['code-one', 'code-two', 'code-three'],
        ]);

        $raw = DB::table('global_users')->where('id', $user->id)->value('two_factor_recovery_codes');

        $this->assertStringNotContainsString(
            'code-one',
            (string) $raw,
            'Recovery codes harus terenkripsi — tidak boleh plaintext di DB'
        );

        $decoded = $user->fresh()->two_factor_recovery_codes;
        $this->assertIsArray($decoded);
        $this->assertContains('code-one', $decoded);
    }

    /** @test */
    public function global_user_two_factor_secret_is_stored_encrypted(): void
    {
        $user = GlobalUser::factory()->create([
            'two_factor_secret' => 'BASE32SECRETKEY==',
        ]);

        $raw = DB::table('global_users')->where('id', $user->id)->value('two_factor_secret');

        $this->assertNotEquals(
            'BASE32SECRETKEY==',
            $raw,
            'TOTP secret harus tersimpan terenkripsi'
        );

        $this->assertEquals('BASE32SECRETKEY==', $user->fresh()->two_factor_secret);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Bonus — plot_guru_mapels: unique constraint include school_id
    // ══════════════════════════════════════════════════════════════════════════

    /** @test */
    public function plot_guru_mapels_unique_constraint_includes_school_id(): void
    {
        if (!Schema::hasTable('plot_guru_mapels')) {
            $this->markTestSkipped('Tabel plot_guru_mapels tidak ada');
        }

        $index = DB::select("
            SELECT index_name FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'plot_guru_mapels'
              AND index_name = 'uq_plot_guru_mapel_school_kelas'
            LIMIT 1
        ");

        $this->assertNotEmpty(
            $index,
            'Unique constraint uq_plot_guru_mapel_school_kelas harus ada dan include school_id'
        );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Bonus — Financial + Academic tables: soft delete
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * @test
     * @dataProvider financialAcademicTables
     */
    public function critical_table_has_soft_delete_column(string $table): void
    {
        if (!Schema::hasTable($table)) {
            $this->markTestSkipped("Tabel {$table} tidak ada");
        }

        $this->assertTrue(
            Schema::hasColumn($table, 'deleted_at'),
            "Tabel {$table} harus memiliki kolom deleted_at untuk soft delete"
        );
    }

    public static function financialAcademicTables(): array
    {
        return [
            'tagihans' => ['tagihans'],
            'pembayarans' => ['pembayarans'],
            'nilai_akhirs' => ['nilai_akhirs'],
            'absensis' => ['absensis'],
        ];
    }
}