<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\OrangTua;
use Illuminate\Http\Request;

class MasterDataOrtuController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        $query = OrangTua::query()
            ->with(['siswa:nisn,nama_lengkap', 'siswa.userOrtu:id,nisn'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama_ayah', 'like', "%{$search}%")
                        ->orWhere('nama_ibu', 'like', "%{$search}%")
                        ->orWhere('nama_wali', 'like', "%{$search}%")
                        ->orWhere('nik_ayah', 'like', "%{$search}%")
                        ->orWhere('nik_ibu', 'like', "%{$search}%")
                        ->orWhere('nik_wali', 'like', "%{$search}%")
                        ->orWhere('no_hp_ayah', 'like', "%{$search}%")
                        ->orWhere('no_hp_ibu', 'like', "%{$search}%")
                        ->orWhere('no_hp_wali', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereHas('siswa', function ($siswaQuery) use ($search) {
                            $siswaQuery->where('nama_lengkap', 'like', "%{$search}%")
                                ->orWhere('nisn', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy('nama_ayah')
            ->orderBy('nama_ibu');

        $data = $request->boolean('paginate')
            ? $query->paginate(15)
            : $query->limit(10)->get();

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function show($id)
    {
        $orangTua = OrangTua::with([
            'siswa.userOrtu.user:id,nama_lengkap,username,email,no_hp,foto,is_active',
        ])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $orangTua]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_ayah' => 'nullable|string|max:100',
            'nik_ayah' => 'nullable|string|max:16',
            'tanggal_lahir_ayah' => 'nullable|date',
            'pendidikan_ayah' => 'nullable|string|max:50',
            'pekerjaan_ayah' => 'nullable|string|max:100',
            'penghasilan_ayah' => 'nullable|string|max:50',
            'no_hp_ayah' => 'nullable|string|max:20',

            'nama_ibu' => 'nullable|string|max:100',
            'nik_ibu' => 'nullable|string|max:16',
            'tanggal_lahir_ibu' => 'nullable|date',
            'pendidikan_ibu' => 'nullable|string|max:50',
            'pekerjaan_ibu' => 'nullable|string|max:100',
            'penghasilan_ibu' => 'nullable|string|max:50',
            'no_hp_ibu' => 'nullable|string|max:20',

            'nama_wali' => 'nullable|string|max:100',
            'nik_wali' => 'nullable|string|max:16',
            'hubungan_wali' => 'nullable|string|max:50',
            'pekerjaan_wali' => 'nullable|string|max:100',
            'penghasilan_wali' => 'nullable|string|max:50',
            'no_hp_wali' => 'nullable|string|max:20',

            'email' => 'nullable|email|max:100',
            'alamat' => 'nullable|string',
        ]);

        $orangTua = OrangTua::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Data orang tua berhasil ditambahkan.',
            'data' => $orangTua,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $orangTua = OrangTua::findOrFail($id);

        $data = $request->validate([
            'nama_ayah' => 'nullable|string|max:100',
            'nik_ayah' => 'nullable|string|max:16',
            'tanggal_lahir_ayah' => 'nullable|date',
            'pendidikan_ayah' => 'nullable|string|max:50',
            'pekerjaan_ayah' => 'nullable|string|max:100',
            'penghasilan_ayah' => 'nullable|string|max:50',
            'no_hp_ayah' => 'nullable|string|max:20',

            'nama_ibu' => 'nullable|string|max:100',
            'nik_ibu' => 'nullable|string|max:16',
            'tanggal_lahir_ibu' => 'nullable|date',
            'pendidikan_ibu' => 'nullable|string|max:50',
            'pekerjaan_ibu' => 'nullable|string|max:100',
            'penghasilan_ibu' => 'nullable|string|max:50',
            'no_hp_ibu' => 'nullable|string|max:20',

            'nama_wali' => 'nullable|string|max:100',
            'nik_wali' => 'nullable|string|max:16',
            'hubungan_wali' => 'nullable|string|max:50',
            'pekerjaan_wali' => 'nullable|string|max:100',
            'penghasilan_wali' => 'nullable|string|max:50',
            'no_hp_wali' => 'nullable|string|max:20',

            'email' => 'nullable|email|max:100',
            'alamat' => 'nullable|string',
        ]);

        $orangTua->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Data orang tua berhasil diperbarui.',
            'data' => $orangTua,
        ]);
    }

    public function destroy($id)
    {
        $orangTua = OrangTua::findOrFail($id);

        if ($orangTua->siswa()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Data ini masih tertaut ke siswa. Lepas tautan anak dulu sebelum hapus.',
            ], 422);
        }

        $orangTua->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data orang tua berhasil dihapus.',
        ]);
    }
}