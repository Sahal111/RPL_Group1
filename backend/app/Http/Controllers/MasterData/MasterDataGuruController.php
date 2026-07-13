<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Guru;
use Illuminate\Http\Request;

class MasterDataGuruController extends Controller
{
    // LIST semua guru (dengan pagination + search)
    public function index(Request $request)
    {
        $query = Guru::query()
            ->when($request->search, function ($q) use ($request) {
                $q->where('nama_lengkap', 'like', "%{$request->search}%")
                    ->orWhere('nuptk', 'like', "%{$request->search}%")
                    ->orWhere('nip', 'like', "%{$request->search}%");
            })
            ->when($request->jenis_ptk, function ($q) use ($request) {
                $q->where('jenis_ptk', $request->jenis_ptk);
            })
            ->when($request->status, function ($q) use ($request) {
                $q->where('status_kepegawaian', $request->status);
            })
            ->orderBy('nama_lengkap')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $query,
        ]);
    }

    // DETAIL satu guru
    public function show($nuptk)
    {
        $guru = Guru::with('userGuru.user')->where('nuptk', $nuptk)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $guru,
        ]);
    }

    // TAMBAH guru baru
    public function store(Request $request)
    {
        $request->validate([
            'nuptk' => 'required|string|max:16|unique:guru,nuptk',
            'nip' => 'nullable|string|max:18|unique:guru,nip',
            'nik' => 'nullable|string|max:16',
            'nama' => 'required|string|max:100',
            'jenis_kelamin' => 'required|in:L,P',
            'tanggal_lahir' => 'required|date',
            'tempat_lahir' => 'required|string|max:60',
            'agama' => 'required|in:Islam,Kristen Protestan,KristenKatolik,Hindu,Buddha,Khonghucu',
            'status_perkawinan' => 'nullable|in:Belum Kawin,Kawin,Cerai Hidup,Cerai Mati',
            'jenis_ptk' => 'required|string',
            'status_kepegawaian' => 'required|string',
            'golongan' => 'nullable|string|max:10',
            'tmt_golongan' => 'nullable|date',
            'no_hp' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'alamat_jalan' => 'nullable|string',
            'rt' => 'nullable|string|max:5',
            'rw' => 'nullable|string|max:5',
            'desa' => 'nullable|string|max:60',
            'kecamatan' => 'nullable|string|max:60',
            'kabupaten' => 'nullable|string|max:60',
            'provinsi' => 'nullable|string|max:60',
            'kode_pos' => 'nullable|string|max:10',
        ]);

        $guru = Guru::create($request->only([
            'nuptk',
            'nip',
            'nik',
            'nama_lengkap',
            'jenis_kelamin',
            'tanggal_lahir',
            'tempat_lahir',
            'agama',
            'status_perkawinan',
            'jenis_ptk',
            'status_kepegawaian',
            'golongan',
            'tmt_golongan',
            'no_hp',
            'email',
            'alamat_jalan',
            'rt',
            'rw',
            'desa',
            'kecamatan',
            'kabupaten',
            'provinsi',
            'kode_pos',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Data guru berhasil ditambahkan.',
            'data' => $guru,
        ], 201);
    }

    public function update(Request $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'nip' => "nullable|string|max:18|unique:guru,nip,{$nuptk},nuptk",
            'nik' => 'nullable|string|max:16',
            'nama' => 'required|string|max:100',
            'jenis_kelamin' => 'required|in:L,P',
            'tanggal_lahir' => 'required|date',
            'tempat_lahir' => 'required|string|max:60',
            'agama' => 'required|in:Islam,Kristen Protestan,KristenKatolik,Hindu,Buddha,Khonghucu',
            'status_perkawinan' => 'nullable|in:Belum Kawin,Kawin,Cerai Hidup,Cerai Mati',
            'jenis_ptk' => 'required|string',
            'status_kepegawaian' => 'required|string',
            'golongan' => 'nullable|string|max:10',
            'tmt_golongan' => 'nullable|date',
            'no_hp' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'alamat_jalan' => 'nullable|string',
            'rt' => 'nullable|string|max:5',
            'rw' => 'nullable|string|max:5',
            'desa' => 'nullable|string|max:60',
            'kecamatan' => 'nullable|string|max:60',
            'kabupaten' => 'nullable|string|max:60',
            'provinsi' => 'nullable|string|max:60',
            'kode_pos' => 'nullable|string|max:10',
            'is_active' => 'boolean',
        ]);

        $guru->update($request->only([
            'nip',
            'nik',
            'nama_lengkap',
            'jenis_kelamin',
            'tanggal_lahir',
            'tempat_lahir',
            'agama',
            'status_perkawinan',
            'jenis_ptk',
            'status_kepegawaian',
            'golongan',
            'tmt_golongan',
            'no_hp',
            'email',
            'alamat_jalan',
            'rt',
            'rw',
            'desa',
            'kecamatan',
            'kabupaten',
            'provinsi',
            'kode_pos',
            'is_active',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Data guru berhasil diperbarui.',
            'data' => $guru,
        ]);
    }

    // HAPUS guru
    public function destroy($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        // Cek kalau guru punya akun user, tolak hapus
        if ($guru->userGuru()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Guru ini memiliki akun login. Hapus akun loginnya terlebih dahulu.',
            ], 422);
        }

        $guru->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data guru berhasil dihapus.',
        ]);
    }

    public function uploadFoto(Request $request, $nuptk)
    {
        $request->validate([
            'foto' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        // Hapus foto lama
        if ($guru->foto && file_exists(storage_path('app/public/' . $guru->foto))) {
            unlink(storage_path('app/public/' . $guru->foto));
        }

        $path = $request->file('foto')->store('foto-guru', 'public');
        $guru->update(['foto' => $path]);

        return response()->json([
            'success' => true,
            'message' => 'Foto berhasil diupload.',
            'data' => ['foto_url' => asset('storage/' . $path)],
        ]);
    }
}