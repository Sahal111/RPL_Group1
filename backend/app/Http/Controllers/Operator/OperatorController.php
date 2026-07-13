<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Guru;
// use App\Models\UserGuru; // digantikan oleh Guru (user_id FK)
// use App\Models\UserKepsek; // tidak ada tabel terpisah di skema baru
// use App\Models\UserOrtu; // digantikan oleh OrangTua (user_id FK)
use App\Models\UserBendahara;
use App\Models\UserWaliKelas;
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
                $slugMap = ['operator' => 1, 'gurus' => 2, 'ortu' => 3, 'kepsek' => 4, 'bendahara' => 5, 'walikelas' => 6];
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
            'nama' => 'required|string|max:100',
            'no_hp' => 'nullable|string|max:20',
            'nuptk' => 'required|string|max:16|exists:gurus,nuptk',
        ]);

        // Cek nuptk belum punya akun
        $sudahAda = \App\Models\Guru::where('nuptk', $request->nuptk)->whereNotNull('user_id')->exists();
        if ($sudahAda) {
            return response()->json(['success' => false, 'message' => 'NUPTK ini sudah terdaftar akun guru.'], 422);
        }

        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'role_id' => 2,
                'name' => $request->nama,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'is_active' => 1,
            ]);

            // Di skema baru: guru.user_id FK langsung ke users
            \App\Models\Guru::where('nuptk', $request->nuptk)->update(['user_id' => $user->id]);

            return $user->load('guru');
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
            'nama' => 'required|string|max:100',
            'no_hp' => 'nullable|string|max:20',
            'nuptk' => 'required|string|max:16|exists:gurus,nuptk',
            'no_sk' => 'nullable|string|max:50',
            'tmt_jabatan' => 'nullable|date',
        ]);

        $sudahAda = \App\Models\Guru::where('nuptk', $request->nuptk)->whereNotNull('user_id')->exists();
        if ($sudahAda) {
            return response()->json(['success' => false, 'message' => 'NUPTK ini sudah terdaftar akun kepsek.'], 422);
        }

        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'role_id' => 4,
                'name' => $request->nama,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'is_active' => 1,
            ]);

            \App\Models\Guru::where('nuptk', $request->nuptk)->update(['user_id' => $user->id]);

            return $user->load('guru');
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
            'nama' => 'required|string|max:100',
            'no_hp' => 'nullable|string|max:20',
        ]);

        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'role_id' => 1,
                'name' => $request->nama,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'is_active' => 1,
            ]);

            \App\Models\OperatorProfile::create(['user_id' => $user->id]);

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
            'nama' => 'required|string|max:100',
            'no_hp' => 'nullable|string|max:20',
            'nisn' => 'required|string|max:10|exists:siswas,nisn',
            'hubungan' => 'required|in:Ayah,Ibu,Wali',
        ]);

        $siswa = \App\Models\Siswa::where('nisn', $request->nisn)->firstOrFail();

        $user = DB::transaction(function () use ($request, $siswa) {
            $user = User::create([
                'role_id' => 3,
                'name' => $request->nama,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'is_active' => 1,
            ]);

            $ortu = \App\Models\OrangTua::create([
                'user_id' => $user->id,
                'nama' => $request->nama,
                'hubungan' => $request->hubungan,
                'no_hp' => $request->no_hp,
            ]);

            \Illuminate\Support\Facades\DB::table('orang_tua_siswa')->insert([
                'siswa_id' => $siswa->id,
                'orang_tua_id' => $ortu->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return $user->load('orangTua.siswa');
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
                $user->guru->no_hp = $request->no_hp;
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
            'nisn' => 'required|string|max:10|exists:siswas,nisn',
            'hubungan' => 'required|in:Ayah,Ibu,Wali',
        ]);

        $siswa = \App\Models\Siswa::where('nisn', $request->nisn)->firstOrFail();
        $exists = \App\Models\OrangTua::where('user_id', $user->id)
            ->whereHas('siswa', fn($q) => $q->where('id', $siswa->id))
            ->exists();

        if ($exists) {
            return response()->json(['success' => false, 'message' => 'Anak ini sudah tertaut ke akun orang tua tersebut.'], 422);
        }

        DB::transaction(function () use ($user, $siswa, $request) {
            $ortu = \App\Models\OrangTua::firstOrCreate(
                ['user_id' => $user->id, 'hubungan' => $request->hubungan],
                ['nama' => $user->name, 'no_hp' => null]
            );
            DB::table('orang_tua_siswa')->insertOrIgnore([
                'siswa_id' => $siswa->id,
                'orang_tua_id' => $ortu->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Anak berhasil ditautkan ke akun orang tua.',
            'data' => $user->load('orangTua.siswa'),
        ], 201);
    }

    // -------------------------------------------------------
    // RESET PASSWORD USER
    // -------------------------------------------------------
    // -------------------------------------------------------
    // BUAT AKUN BENDAHARA
    // -------------------------------------------------------
    public function createBendahara(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|max:100|unique:users,email',
            'password' => 'required|string|min:8',
            'nama' => 'required|string|max:100',
            'no_hp' => 'nullable|string|max:20',
            'nip' => 'nullable|string|max:18',
            'jabatan' => 'nullable|string|max:100',
            'no_sk' => 'nullable|string|max:60',
            'tmt_jabatan' => 'nullable|date',
        ]);

        DB::transaction(function () use ($request) {
            $user = User::create([
                'role_id' => 5,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'nama' => $request->nama_lengkap,
                'no_hp' => $request->no_hp,
                'is_active' => 1,
                'created_by' => auth()->id(),
            ]);

            UserBendahara::create([
                'user_id' => $user->id,
                'nip' => $request->nip,
                'jabatan' => $request->jabatan ?? 'Bendahara Sekolah',
                'no_sk' => $request->no_sk,
                'tmt_jabatan' => $request->tmt_jabatan,
                'akses_modul' => json_encode(['keuangan', 'tagihan', 'pembayaran']),
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Akun bendahara berhasil dibuat.',
        ], 201);
    }

    // -------------------------------------------------------
    // BUAT AKUN WALI KELAS
    // (Wali kelas harus sudah terdaftar sebagai guru dulu)
    // -------------------------------------------------------
    public function createWaliKelas(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|max:100|unique:users,email',
            'password' => 'required|string|min:8',
            'nama' => 'required|string|max:100',
            'no_hp' => 'nullable|string|max:20',
            'nuptk' => 'required|string|max:16|exists:gurus,nuptk',
            'kelas_id' => 'nullable|string|max:20|exists:kelas,id',
            'no_sk' => 'nullable|string|max:60',
            'tmt_jabatan' => 'nullable|date',
        ]);

        // Cek NUPTK belum punya akun walikelas
        $sudahAda = UserWaliKelas::where('nuptk', $request->nuptk)->exists();
        if ($sudahAda) {
            return response()->json([
                'success' => false,
                'message' => 'NUPTK ini sudah terdaftar sebagai wali kelas.',
            ], 422);
        }

        DB::transaction(function () use ($request) {
            $user = User::create([
                'role_id' => 6,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'nama' => $request->nama_lengkap,
                'no_hp' => $request->no_hp,
                'is_active' => 1,
                'created_by' => auth()->id(),
            ]);

            UserWaliKelas::create([
                'user_id' => $user->id,
                'nuptk' => $request->nuptk,
                'kelas_id' => $request->kelas_id,
                'no_sk' => $request->no_sk,
                'tmt_jabatan' => $request->tmt_jabatan,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Akun wali kelas berhasil dibuat.',
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
            $user->bendaharaProfile?->delete();
            $user->waliKelasProfile?->delete();
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