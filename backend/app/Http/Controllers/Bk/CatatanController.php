<?php

namespace App\Http\Controllers\Bk;

use App\Http\Controllers\Controller;
use App\Models\BkCatatan;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatatanController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = BkCatatan::with(['siswa:id,nisn,nama', 'dibuatOleh:id,name'])
            ->when($request->siswa_id, fn($q) => $q->where('siswa_id', $request->siswa_id))
            ->when($request->tipe, fn($q) => $q->where('tipe', $request->tipe))
            ->when($request->tingkat, fn($q) => $q->where('tingkat', $request->tingkat))
            ->when($request->konseling_id, fn($q) => $q->where('konseling_id', $request->konseling_id))
            ->latest();

        return $this->success($query->paginate((int) $request->get('per_page', 15)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'konseling_id' => 'nullable|exists:bk_konseling,id',
            'siswa_id' => 'required|exists:siswas,id',
            'tipe' => 'required|in:pelanggaran,prestasi,observasi,rekomendasi',
            'judul' => 'required|string|max:200',
            'isi' => 'required|string|max:3000',
            'tingkat' => 'nullable|in:rendah,sedang,tinggi',
        ]);

        $data['dibuat_oleh'] = auth()->id();

        $catatan = BkCatatan::create($data);

        return $this->created(
            $catatan->load(['siswa:id,nisn,nama', 'dibuatOleh:id,name']),
            'Catatan BK berhasil ditambahkan.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $catatan = BkCatatan::with([
            'siswa:id,nisn,nama',
            'dibuatOleh:id,name',
            'konseling',
        ])->findOrFail($id);

        return $this->success($catatan);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $catatan = BkCatatan::findOrFail($id);

        $data = $request->validate([
            'tipe' => 'sometimes|in:pelanggaran,prestasi,observasi,rekomendasi',
            'judul' => 'sometimes|string|max:200',
            'isi' => 'sometimes|string|max:3000',
            'tingkat' => 'nullable|in:rendah,sedang,tinggi',
        ]);

        $catatan->update($data);

        return $this->success($catatan->fresh(), 'Catatan BK berhasil diperbarui.');
    }

    public function destroy(int $id): JsonResponse
    {
        BkCatatan::findOrFail($id)->delete();

        return $this->success(null, 'Catatan BK berhasil dihapus.');
    }

    public function bySiswa(int $siswaId): JsonResponse
    {
        $catatan = BkCatatan::with(['dibuatOleh:id,name', 'konseling:id,tanggal,kategori'])
            ->where('siswa_id', $siswaId)
            ->latest()
            ->get();

        $summary = [
            'total' => $catatan->count(),
            'pelanggaran' => $catatan->where('tipe', 'pelanggaran')->count(),
            'prestasi' => $catatan->where('tipe', 'prestasi')->count(),
        ];

        return $this->success(['catatan' => $catatan, 'summary' => $summary]);
    }
}