<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ortu\StoreOrtuRequest;
use App\Http\Requests\Ortu\UpdateOrtuRequest;
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

    public function store(StoreOrtuRequest $request)
    {
        $orangTua = OrangTua::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Data orang tua berhasil ditambahkan.',
            'data' => $orangTua,
        ], 201);
    }

    public function update(UpdateOrtuRequest $request, $id)
    {
        $orangTua = OrangTua::findOrFail($id);
        $orangTua->update($request->validated());

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