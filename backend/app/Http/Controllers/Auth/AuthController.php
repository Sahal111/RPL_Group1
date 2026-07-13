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
        $user->update(['last_login_at' => now()]);

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
                    'nama' => $user->name,
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
                'nama' => $user->name,
                'role' => $user->role->slug,
                'foto' => $user->foto,
                'last_login' => $user->last_login_at,
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
            'nama' => 'required|string|max:100',
            'no_hp' => 'required|string|max:20',
            'nisn' => 'required|string|size:10|exists:siswas,nisn',
            'kode_sekolah' => 'required|string',
            'hubungan' => 'required|in:Ayah,Ibu,Wali',
        ]);

        // Validasi kode unik sekolah
        $pengaturan = \App\Models\Pengaturan::where('key', 'kode_registrasi_ortu')->first();
        $kodeValid = $pengaturan ? $pengaturan->value : config('school.kode_registrasi');
        if ($request->kode_sekolah !== $kodeValid) {
            return response()->json([
                'success' => false,
                'message' => 'Kode sekolah tidak valid.',
            ], 422);
        }

        // Cari siswa berdasarkan NISN
        $siswa = \App\Models\Siswa::where('nisn', $request->nisn)->first();
        if (!$siswa) {
            return response()->json([
                'success' => false,
                'message' => 'NISN tidak ditemukan.',
            ], 422);
        }

        DB::transaction(function () use ($request, $siswa) {
            $user = User::create([
                'role_id' => 3, // ortu
                'name' => $request->nama_lengkap,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'is_active' => 0, // perlu approve operator
            ]);

            // Buat record orang_tua dan link ke user + siswa
            $ortu = \App\Models\OrangTua::create([
                'user_id' => $user->id,
                'nama' => $request->nama_lengkap,
                'hubungan' => $request->hubungan,
                'no_hp' => $request->no_hp,
            ]);

            // Link ortu ke siswa via orang_tua_siswa
            \Illuminate\Support\Facades\DB::table('orang_tua_siswa')->insert([
                'siswa_id' => $siswa->id,
                'orang_tua_id' => $ortu->id,
                'created_at' => now(),
                'updated_at' => now(),
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
            2 => $user->guru,
            3 => $user->orangTua()->with('siswa')->get(),
            4 => $user->guru, // kepsek juga guru
            5 => $user->bendaharaProfile,
            6 => $user->waliKelasProfile?->load('kelas'),
            default => null,
        };
    }
}