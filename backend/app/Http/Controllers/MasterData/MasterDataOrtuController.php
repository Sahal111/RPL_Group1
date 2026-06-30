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
}
