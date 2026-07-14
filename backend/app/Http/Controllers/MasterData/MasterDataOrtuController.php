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
            ->with(['siswa:id,nisn,nama'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    // Skema baru: satu baris per individu (kolom: nama, nik, no_hp)
                    $q->where('nama', 'like', "%{$search}%")
                        ->orWhere('nik', 'like', "%{$search}%")
                        ->orWhere('no_hp', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereHas('siswa', function ($siswaQuery) use ($search) {
                        $siswaQuery->where('nama', 'like', "%{$search}%")
                            ->orWhere('nisn', 'like', "%{$search}%");
                    });
                });
            })
            ->orderBy('nama');

        $data = $request->boolean('paginate')
            ? $query->paginate(15)
            : $query->limit(10)->get();

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function show($id)
    {
        $orangTua = OrangTua::with([
            'siswa:id,nisn,nama',
            'user:id,name,username,email,foto,is_active',
        ])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $orangTua]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            // Skema baru: satu baris per individu orang tua/wali
            'nama' => 'required|string|max:150',
            'nik' => 'nullable|string|max:16',
            'hubungan' => 'required|in:Ayah,Ibu,Wali,Kakek,Nenek,Paman,Bibi,Kakak,Lainnya',
            'status' => 'required|in:Kandung,Tiri,Angkat,Wali',
            'status_hidup' => 'nullable|in:Masih Hidup,Meninggal,Tidak Diketahui',
            'tempat_lahir' => 'nullable|string|max:100',
            'tahun_lahir' => 'nullable|integer|min:1900|max:' . now()->year,
            'jenis_kelamin' => 'nullable|in:L,P',
            'agama' => 'nullable|string|max:30',
            'pendidikan' => 'nullable|string|max:50',
            'pekerjaan' => 'nullable|string|max:100',
            'penghasilan' => 'nullable|string|max:100',
            'no_hp' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
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
            'nama' => 'sometimes|required|string|max:150',
            'nik' => 'nullable|string|max:16',
            'hubungan' => 'sometimes|required|in:Ayah,Ibu,Wali,Kakek,Nenek,Paman,Bibi,Kakak,Lainnya',
            'status' => 'sometimes|required|in:Kandung,Tiri,Angkat,Wali',
            'status_hidup' => 'nullable|in:Masih Hidup,Meninggal,Tidak Diketahui',
            'tempat_lahir' => 'nullable|string|max:100',
            'tahun_lahir' => 'nullable|integer|min:1900|max:' . now()->year,
            'jenis_kelamin' => 'nullable|in:L,P',
            'agama' => 'nullable|string|max:30',
            'pendidikan' => 'nullable|string|max:50',
            'pekerjaan' => 'nullable|string|max:100',
            'penghasilan' => 'nullable|string|max:100',
            'no_hp' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
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