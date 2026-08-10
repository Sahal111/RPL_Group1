<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Keuangan\StoreJenisTagihanRequest;
use App\Http\Requests\Keuangan\UpdateJenisTagihanRequest;
use App\Models\JenisTagihan;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class JenisTagihanController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = JenisTagihan::with(['tahunAjaran:id,nama', 'createdBy:id,name'])
            ->when(
                $request->search,
                fn($q) =>
                $q->where('nama_tagihan', 'like', "%{$request->search}%")
            )
            ->when(
                $request->kategori,
                fn($q) =>
                $q->where('kategori', $request->kategori)
            )
            ->when(
                $request->filled('is_active'),
                fn($q) =>
                $q->where('is_active', $request->boolean('is_active'))
            )
            ->when(
                $request->tahun_ajaran_id,
                fn($q) =>
                $q->where('tahun_ajaran_id', $request->tahun_ajaran_id)
            )
            ->latest();

        $data = $request->boolean('all')
            ? $query->get()
            : $query->paginate(15);

        return $this->success($data);
    }

    public function store(StoreJenisTagihanRequest $request)
    {
        $jenis = JenisTagihan::create([
            ...$request->validated(),
            'created_by' => auth()->id(),
        ]);

        return $this->created($jenis->load('tahunAjaran:id,nama'), 'Jenis tagihan berhasil ditambahkan.');
    }

    public function show($id)
    {
        $jenis = JenisTagihan::with(['tahunAjaran:id,nama', 'createdBy:id,name'])
            ->findOrFail($id);

        return $this->success($jenis);
    }

    public function update(UpdateJenisTagihanRequest $request, $id)
    {
        $jenis = JenisTagihan::findOrFail($id);
        $jenis->update($request->validated());

        return $this->success($jenis->fresh('tahunAjaran:id,nama'), 'Jenis tagihan berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $jenis = JenisTagihan::findOrFail($id);

        if ($jenis->tagihans()->exists()) {
            return $this->conflict('Jenis tagihan ini sudah digunakan. Nonaktifkan saja daripada menghapus.');
        }

        $jenis->delete();

        return $this->success(null, 'Jenis tagihan berhasil dihapus.');
    }

    public function toggleActive($id)
    {
        $jenis = JenisTagihan::findOrFail($id);
        $jenis->update(['is_active' => !$jenis->is_active]);

        $status = $jenis->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return $this->success($jenis, "Jenis tagihan berhasil {$status}.");
    }
}