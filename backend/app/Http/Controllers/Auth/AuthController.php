<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // -------------------------------------------------------
    // LOGIN
    // -------------------------------------------------------
    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string', // bisa username atau email
            'password' => 'required|string',
        ]);

        // Cari user by username atau email
        $user = User::with('role')
            ->where('username', $request->login)
            ->orWhere('email', $request->login)
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

        // Hapus token lama (single session)
        $user->tokens()->delete();

        // Buat token baru
        $token = $user->createToken('auth_token')->plainTextToken;

        // Update last_login
        $user->update(['last_login' => now()]);

        // Load profil sesuai role
        $profile = $this->getProfile($user);

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'nama_lengkap' => $user->nama_lengkap,
                    'role' => $user->role->slug,
                    'foto' => $user->foto,
                    'profile' => $profile,
                ],
            ],
        ]);
    }

    // -------------------------------------------------------
    // LOGOUT
    // -------------------------------------------------------
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }

    // -------------------------------------------------------
    // ME — data user yang sedang login
    // -------------------------------------------------------
    public function me(Request $request)
    {
        $user = $request->user()->load('role');
        $profile = $this->getProfile($user);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'nama_lengkap' => $user->nama_lengkap,
                'role' => $user->role->slug,
                'foto' => $user->foto,
                'last_login' => $user->last_login,
                'profile' => $profile,
            ],
        ]);
    }

    // -------------------------------------------------------
    // REGISTER ORTU
    // -------------------------------------------------------
    public function registerOrtu(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|max:100|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'nama_lengkap' => 'required|string|max:100',
            'no_hp' => 'required|string|max:20',
            'nisn' => 'required|string|size:10|exists:siswa,nisn',
            'kode_sekolah' => 'required|string',
            'hubungan' => 'required|in:Ayah,Ibu,Wali',
        ]);

        // Validasi kode unik sekolah
        $pengaturan = \App\Models\Pengaturan::where('key', 'kode_registrasi')->first();
        $kodeValid = $pengaturan ? $pengaturan->value : config('school.kode_registrasi');
        if ($request->kode_sekolah !== $kodeValid) {
            return response()->json([
                'success' => false,
                'message' => 'Kode sekolah tidak valid.',
            ], 422);
        }

        // Cek apakah NISN sudah punya akun ortu
        $sudahAda = \App\Models\UserOrtu::where('nisn', $request->nisn)->exists();
        if ($sudahAda) {
            return response()->json([
                'success' => false,
                'message' => 'NISN ini sudah terdaftar akun orang tua.',
            ], 422);
        }

        DB::transaction(function () use ($request) {
            $user = User::create([
                'role_id' => 3, // ortu
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'nama_lengkap' => $request->nama_lengkap,
                'no_hp' => $request->no_hp,
                'is_active' => 0, // perlu approve operator
            ]);

            \App\Models\UserOrtu::create([
                'user_id' => $user->id,
                'nisn' => $request->nisn,
                'hubungan' => $request->hubungan,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil. Akun kamu sedang menunggu persetujuan operator sekolah.',
        ], 201);
    }

    // -------------------------------------------------------
    // Helper: load profil sesuai role
    // -------------------------------------------------------
    private function getProfile(User $user): mixed
    {
        return match ($user->role_id) {
            1 => $user->operatorProfile,
            2 => $user->guruProfile?->load('guru'),
            3 => $user->ortuProfiles()->with('siswa')->get(),
            4 => $user->kepsekProfile,
            default => null,
        };
    }
}
