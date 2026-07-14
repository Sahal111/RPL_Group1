<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\MataPelajaran;
use Illuminate\Http\Request;

class MasterDataMapelController extends Controller
{
    public function index(Request $request)
    {
        $query = MataPelajaran::query()
            ->when(
                $request->search,
                fn($q) =>
                $q->where('nama_mapel', 'like', "%{$request->search}%")
                    ->orWhere('kode_mapel', 'like', "%{$request->search}%")
            )
            ->when($request->kelompok, fn($q) => $q->where('kelompok', $request->kelompok))
            ->when($request->tingkat, fn($q) => $q->where('tingkat', $request->tingkat))
            ->orderBy('kelompok')
            ->orderBy('nama_mapel')
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $query]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_mapel' => 'required|string|max:20|unique:mapels,kode',
            'nama_mapel' => 'required|string|max:100',
            'kelompok' => 'required|in:A - Wajib,B - Wajib,C - Muatan Lokal,Pengembangan Diri,Ekstrakurikuler',
            'tingkat' => 'required|in:Semua,1,2,3,4,5,6',
            'jam_per_minggu' => 'required|integer|min:1|max:40',
            'kurikulum' => 'required|in:Kurikulum 2013,Kurikulum Merdeka,Keduanya',
        ]);

        $mapel = MataPelajaran::create([
            ...$request->only([
                'kode_mapel',
                'nama_mapel',
                'kelompok',
                'tingkat',
                'jam_per_minggu',
                'kurikulum',
            ]),
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mata pelajaran berhasil ditambahkan.',
            'data' => $mapel,
        ], 201);
    }

    public function show($id)
    {
        $mapel = MataPelajaran::findOrFail($id);
        return response()->json(['success' => true, 'data' => $mapel]);
    }

    public function update(Request $request, $id)
    {
        $mapel = MataPelajaran::findOrFail($id);

        $request->validate([
            'kode_mapel' => "required|string|max:20|unique:mapels,kode,{$id}",
            'nama_mapel' => 'required|string|max:100',
            'kelompok' => 'required|in:A - Wajib,B - Wajib,C - Muatan Lokal,Pengembangan Diri,Ekstrakurikuler',
            'tingkat' => 'required|in:Semua,1,2,3,4,5,6',
            'jam_per_minggu' => 'required|integer|min:1|max:40',
            'kurikulum' => 'required|in:Kurikulum 2013,Kurikulum Merdeka,Keduanya',
            'is_active' => 'boolean',
        ]);

        $mapel->update($request->only([
            'kode_mapel',
            'nama_mapel',
            'kelompok',
            'tingkat',
            'jam_per_minggu',
            'kurikulum',
            'is_active',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Mata pelajaran berhasil diperbarui.',
            'data' => $mapel->fresh(),
        ]);
    }

    public function toggleActive($id)
    {
        $mapel = MataPelajaran::findOrFail($id);
        $mapel->update(['is_active' => !$mapel->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Status mata pelajaran berhasil diubah.',
            'data' => $mapel->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $mapel = MataPelajaran::findOrFail($id);
        $mapel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mata pelajaran berhasil dihapus.',
        ]);
    }

    /** Dropdown untuk keperluan jadwal, dll */
    public function dropdown()
    {
        $data = MataPelajaran::where('is_active', true)
            ->orderBy('kelompok')
            ->orderBy('nama_mapel')
            ->get(['id', 'kode_mapel', 'nama_mapel', 'kelompok', 'tingkat']);

        return response()->json(['success' => true, 'data' => $data]);
    }
}
