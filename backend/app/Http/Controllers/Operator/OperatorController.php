<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Guru;
use App\Models\UserGuru;
use App\Models\UserKepsek;
use App\Models\UserOrtu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class OperatorController extends Controller
{
    // -------------------------------------------------------
    // PENGATURAN KODE REGISTRASI ORTU
    // -------------------------------------------------------
    public function getKodeRegistrasi()
    {
        $pengaturan = \App\Models\Pengaturan::where('key', 'kode_registrasi')->first();
        $kode = $pengaturan ? $pengaturan->value : config('school.kode_registrasi');

        return response()->json([
            'success' => true,
            'data' => [
                'kode_registrasi' => $kode
            ]
        ]);
    }

    public function updateKodeRegistrasi(Request $request)
    {
        $request->validate([
            'kode_registrasi' => 'required|string|max:20'
        ]);

        $pengaturan = \App\Models\Pengaturan::firstOrCreate(
            ['key' => 'kode_registrasi'],
            ['value' => $request->kode_registrasi]
        );
        $pengaturan->update(['value' => $request->kode_registrasi]);

        return response()->json([
            'success' => true,
            'message' => 'Kode registrasi berhasil diperbarui.',
            'data' => [
                'kode_registrasi' => $pengaturan->value
            ]
        ]);
    }

    // -------------------------------------------------------
    // LIST SEMUA USER (semua role)
    // -------------------------------------------------------
    public function index(Request $request)
    {
        $query = User::with('role')
            ->when($request->role, function ($q) use ($request) {
                $slugMap = ['operator' => 1, 'guru' => 2, 'ortu' => 3, 'kepsek' => 4];
                $roleId = $slugMap[$request->role] ?? null;
                if ($roleId)
                    $q->where('role_id', $roleId);
            })
            ->when($request->search, function ($q) use ($request) {
                $q->where('nama_lengkap', 'like', "%{$request->search}%")
                    ->orWhere('username', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $query,
        ]);
    }

    // -------------------------------------------------------
    // BUAT AKUN GURU
    // -------------------------------------------------------
    public function createGuru(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|max:100|unique:users,email',
            'password' => 'required|string|min:8',
            'nama_lengkap' => 'required|string|max:100',
            'no_hp' => 'nullable|string|max:20',
            'nuptk' => 'required|string|max:16|exists:guru,nuptk',
        ]);

        // Cek nuptk belum punya akun
        $sudahAda = UserGuru::where('nuptk', $request->nuptk)->exists();
        if ($sudahAda) {
            return response()->json([
                'success' => false,
                'message' => 'NUPTK ini sudah terdaftar akun guru.',
            ], 422);
        }

        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'role_id' => 2,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'nama_lengkap' => $request->nama_lengkap,
                'no_hp' => $request->no_hp,
                'is_active' => 1,
                'created_by' => auth()->id(),
            ]);

            UserGuru::create([
                'user_id' => $user->id,
                'nuptk' => $request->nuptk,
            ]);

            return $user->load('guruProfile.guru');
        });

        return response()->json([
            'success' => true,
            'message' => 'Akun guru berhasil dibuat.',
            'data' => $user,
        ], 201);
    }

    // -------------------------------------------------------
    // BUAT AKUN KEPSEK
    // -------------------------------------------------------
    public function createKepsek(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|max:100|unique:users,email',
            'password' => 'required|string|min:8',
            'nama_lengkap' => 'required|string|max:100',
            'no_hp' => 'nullable|string|max:20',
            'nuptk' => 'required|string|max:16|exists:guru,nuptk',
            'no_sk' => 'nullable|string|max:50',
            'tmt_jabatan' => 'nullable|date',
        ]);

        $sudahAda = UserKepsek::where('nuptk', $request->nuptk)->exists();
        if ($sudahAda) {
            return response()->json([
                'success' => false,
                'message' => 'NUPTK ini sudah terdaftar akun kepsek.',
            ], 422);
        }

        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'role_id' => 4,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'nama_lengkap' => $request->nama_lengkap,
                'no_hp' => $request->no_hp,
                'is_active' => 1,
                'created_by' => auth()->id(),
            ]);

            UserKepsek::create([
                'user_id' => $user->id,
                'nuptk' => $request->nuptk,
                'no_sk' => $request->no_sk,
                'tmt_jabatan' => $request->tmt_jabatan,
            ]);

            return $user->load('kepsekProfile');
        });

        return response()->json([
            'success' => true,
            'message' => 'Akun kepala sekolah berhasil dibuat.',
            'data' => $user,
        ], 201);
    }

    // -------------------------------------------------------
    // BUAT AKUN OPERATOR
    // -------------------------------------------------------
    public function createOperator(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|max:100|unique:users,email',
            'password' => 'required|string|min:8',
            'nama_lengkap' => 'required|string|max:100',
            'no_hp' => 'nullable|string|max:20',
        ]);

        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'role_id' => 1,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'nama_lengkap' => $request->nama_lengkap,
                'no_hp' => $request->no_hp,
                'is_active' => 1,
                'created_by' => auth()->id(),
            ]);

            \App\Models\UserOperator::create([
                'user_id' => $user->id,
            ]);

            return $user->load('operatorProfile');
        });

        return response()->json([
            'success' => true,
            'message' => 'Akun operator berhasil dibuat.',
            'data' => $user,
        ], 201);
    }

    // -------------------------------------------------------
    // BUAT AKUN ORTU
    // -------------------------------------------------------
    public function createOrtu(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|max:100|unique:users,email',
            'password' => 'required|string|min:8',
            'nama_lengkap' => 'required|string|max:100',
            'no_hp' => 'nullable|string|max:20',
            'nisn' => 'required|string|max:10|exists:siswa,nisn',
            'hubungan' => 'required|in:Ayah,Ibu,Wali',
        ]);

        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'role_id' => 3,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'nama_lengkap' => $request->nama_lengkap,
                'no_hp' => $request->no_hp,
                'is_active' => 1,
                'created_by' => auth()->id(),
            ]);

            UserOrtu::create([
                'user_id' => $user->id,
                'nisn' => $request->nisn,
                'hubungan' => $request->hubungan,
            ]);

            return $user->load(['ortuProfile.siswa', 'ortuProfiles.siswa']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Akun orang tua berhasil dibuat.',
            'data' => $user,
        ], 201);
    }

    // -------------------------------------------------------
    // TOGGLE AKTIF/NON-AKTIF USER
    // -------------------------------------------------------
    public function toggleActive(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Jangan non-aktifkan diri sendiri
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa menonaktifkan akun sendiri.',
            ], 422);
        }

        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'success' => true,
            'message' => $user->is_active ? 'Akun berhasil diaktifkan.' : 'Akun berhasil dinonaktifkan.',
            'data' => ['is_active' => $user->is_active],
        ]);
    }

    // -------------------------------------------------------
    // APPROVE ORTU (yang register sendiri)
    // -------------------------------------------------------
    public function approveOrtu(Request $request, $id)
    {
        $user = User::where('id', $id)->where('role_id', 3)->firstOrFail();

        if ($user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun ortu ini sudah aktif.',
            ], 422);
        }

        $user->update(['is_active' => 1]);

        return response()->json([
            'success' => true,
            'message' => 'Akun orang tua berhasil disetujui.',
        ]);
    }

    // -------------------------------------------------------
    // LIST ORTU PENDING (belum diapprove)
    // -------------------------------------------------------
    public function pendingOrtu()
    {
        $pending = User::with(['ortuProfile.siswa', 'ortuProfiles.siswa'])
            ->where('role_id', 3)
            ->where('is_active', 0)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pending,
        ]);
    }

    // -------------------------------------------------------
    // LIST SEMUA ORTU (untuk master data)
    // -------------------------------------------------------
    public function listOrtu(Request $request)
    {
        $query = User::with(['ortuProfile.siswa.orangTua', 'ortuProfiles.siswa.orangTua'])
            ->where('role_id', 3);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_lengkap', 'like', "%{$request->search}%")
                  ->orWhere('username', 'like', "%{$request->search}%")
                  ->orWhere('no_hp', 'like', "%{$request->search}%")
                  ->orWhereHas('ortuProfiles.siswa', function ($q) use ($request) {
                      $q->where('nama_lengkap', 'like', "%{$request->search}%")
                        ->orWhere('nisn', 'like', "%{$request->search}%");
                  });
            });
        }

        if ($request->status) {
            $query->where('is_active', $request->status === 'aktif' ? 1 : 0);
        }

        $ortu = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $ortu,
        ]);
    }

    // -------------------------------------------------------
    // DETAIL ORTU (untuk master data)
    // -------------------------------------------------------
    public function detailOrtu($id)
    {
        $user = User::with(['ortuProfile.siswa.orangTua', 'ortuProfiles.siswa.orangTua'])
            ->where('role_id', 3)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    // -------------------------------------------------------
    // UPDATE ORTU (untuk master data)
    // -------------------------------------------------------
    public function updateOrtu(Request $request, $id)
    {
        $user = User::where('role_id', 3)->findOrFail($id);

        $request->validate([
            'email' => 'nullable|email|max:100|unique:users,email,' . $user->id,
            'no_hp' => 'nullable|string|max:20',
            'hubungan' => 'nullable|in:Ayah,Ibu,Wali',
        ]);

        DB::transaction(function () use ($request, $user) {
            if ($request->filled('email')) {
                $user->email = $request->email;
            }
            if ($request->filled('no_hp')) {
                $user->no_hp = $request->no_hp;
            }
            $user->save();

            if ($request->filled('hubungan')) {
                $user->ortuProfiles()->update(['hubungan' => $request->hubungan]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Data orang tua berhasil diperbarui.',
            'data' => $user->load(['ortuProfile.siswa.orangTua', 'ortuProfiles.siswa.orangTua']),
        ]);
    }

    // -------------------------------------------------------
    // TAUTKAN ANAK TAMBAHAN KE AKUN ORTU
    // -------------------------------------------------------
    public function attachAnakOrtu(Request $request, $id)
    {
        $user = User::where('role_id', 3)->findOrFail($id);

        $request->validate([
            'nisn' => 'required|string|max:10|exists:siswa,nisn',
            'hubungan' => 'required|in:Ayah,Ibu,Wali',
        ]);

        $exists = UserOrtu::where('user_id', $user->id)
            ->where('nisn', $request->nisn)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Anak ini sudah tertaut ke akun orang tua tersebut.',
            ], 422);
        }

        UserOrtu::create([
            'user_id' => $user->id,
            'nisn' => $request->nisn,
            'hubungan' => $request->hubungan,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Anak berhasil ditautkan ke akun orang tua.',
            'data' => $user->load(['ortuProfile.siswa.orangTua', 'ortuProfiles.siswa.orangTua']),
        ], 201);
    }

    // -------------------------------------------------------
    // RESET PASSWORD USER
    // -------------------------------------------------------
    public function resetPassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::findOrFail($id);
        $user->update(['password' => Hash::make($request->password)]);

        // Hapus semua token aktif user tersebut
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil direset. User harus login ulang.',
        ]);
    }

    // -------------------------------------------------------
    // HAPUS USER
    // -------------------------------------------------------
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa menghapus akun sendiri.',
            ], 422);
        }

        DB::transaction(function () use ($user) {
            // Hapus profil dulu
            $user->operatorProfile?->delete();
            $user->guruProfile?->delete();
            $user->ortuProfiles()->delete();
            $user->kepsekProfile?->delete();
            // Hapus semua token
            $user->tokens()->delete();
            // Hapus user
            $user->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Akun berhasil dihapus.',
        ]);
    }
}
