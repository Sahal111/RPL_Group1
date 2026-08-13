<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterOrtuRequest;
use App\Models\OrangTua;
use App\Models\Role;
use App\Models\Siswa;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {

        $user = User::withoutGlobalScope(\App\Models\Scopes\SchoolScope::class)
            ->with('roles')
            ->where(function ($q) use ($request) {
                $q->where('username', $request->login)
                    ->orWhere('email', $request->login);
            })
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['Username/email atau password salah.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun kamu belum aktif. Hubungi operator sekolah.',
            ], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;
        $user->update(['last_login_at' => now()]);

        $profile = $this->getProfile($user);

        $cookie = cookie(
            name: 'auth_token',
            value: $token,
            minutes: 60 * 24 * 7,
            path: '/',
            domain: null,
            secure: app()->isProduction(),
            httpOnly: true,
            raw: false,
            sameSite: 'Lax',
        );

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'nama' => $user->name,
                    'role' => $user->getRoleSlug(),
                    'foto' => $user->foto,
                    'profile' => $profile,
                ],
            ],
        ])->withCookie($cookie);
    }

    public function logout(Request $request)
    {
        $token = $request->user()->currentAccessToken();

        // TransientToken dipakai saat testing dengan actingAs() — tidak perlu/bisa di-delete
        if (method_exists($token, 'delete')) {
            $token->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ])->withoutCookie('auth_token');
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('roles');
        $profile = $this->getProfile($user);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'nama' => $user->name,
                'role' => $user->getRoleSlug(),
                'foto' => $user->foto,
                'last_login' => $user->last_login_at,
                'profile' => $profile,
            ],
        ]);
    }

    public function registerOrtu(RegisterOrtuRequest $request)
    {

        $pengaturan = \App\Models\Pengaturan::where('key', 'kode_registrasi_ortu')->first();
        $kodeValid = $pengaturan ? $pengaturan->value : config('school.kode_registrasi');
        if ($request->kode_sekolah !== $kodeValid) {
            return response()->json([
                'success' => false,
                'message' => 'Kode sekolah tidak valid.',
            ], 422);
        }

        $siswa = \App\Models\Siswa::where('nisn', $request->nisn)->first();
        if (!$siswa) {
            return response()->json([
                'success' => false,
                'message' => 'NISN tidak ditemukan.',
            ], 422);
        }

        DB::transaction(function () use ($request, $siswa) {
            // Buat user tanpa role_id (skema baru pakai user_roles)
            $user = User::create([
                'name' => $request->nama,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'is_active' => 0,
            ]);

            // Assign role ortu via Eloquent
            $role = Role::where('slug', 'ortu')->firstOrFail();
            $user->roles()->syncWithoutDetaching([$role->id]);

            // Buat record orang_tua
            $ortu = OrangTua::create([
                'user_id' => $user->id,
                'nama' => $request->nama,
                'hubungan' => $request->hubungan,
                'no_hp' => $request->no_hp,
            ]);

            // Link ortu ke siswa via Eloquent
            $ortu->siswa()->syncWithoutDetaching([$siswa->id]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil. Akun menunggu persetujuan operator sekolah.',
        ], 201);
    }

    private function getProfile(User $user): mixed
    {
        $slug = $user->getRoleSlug();
        return match ($slug) {
            'operator' => $user->operatorProfile,
            'guru',
            'kepsek',
            'wali_kelas' => $user->guru,
            'ortu' => $user->orangTua()->with('siswa')->get(),
            'bendahara' => $user->bendaharaProfile,
            default => null,
        };
    }
}