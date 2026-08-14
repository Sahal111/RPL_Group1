<?php

namespace App\Http\Controllers\Perpustakaan;

use App\Http\Controllers\Controller;
use App\Models\PerpustakaanBuku;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BukuController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = PerpustakaanBuku::withCount('peminjamanAktif')
            ->when(
                $request->search,
                fn($q) =>
                $q->where('judul', 'like', "%{$request->search}%")
                    ->orWhere('pengarang', 'like', "%{$request->search}%")
                    ->orWhere('kode_buku', 'like', "%{$request->search}%")
                    ->orWhere('isbn', 'like', "%{$request->search}%")
            )
            ->when($request->kategori, fn($q) => $q->where('kategori', $request->kategori))
            ->when($request->tersedia, fn($q) => $q->where('stok_tersedia', '>', 0))
            ->when(isset($request->is_active), fn($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy('judul');

        return $this->success($query->paginate((int) $request->get('per_page', 20)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'kode_buku' => 'nullable|string|max:50|unique:perpustakaan_buku,kode_buku',
            'isbn' => 'nullable|string|max:20',
            'judul' => 'required|string|max:300',
            'pengarang' => 'nullable|string|max:200',
            'penerbit' => 'nullable|string|max:200',
            'tahun_terbit' => 'nullable|digits:4|integer',
            'kategori' => 'nullable|string|max:100',
            'lokasi_rak' => 'nullable|string|max:50',
            'stok_total' => 'required|integer|min:1',
            'deskripsi' => 'nullable|string|max:2000',
            'cover' => 'nullable|image|max:2048',
        ]);

        $data['stok_tersedia'] = $data['stok_total'];

        if ($request->hasFile('cover')) {
            $data['cover'] = $request->file('cover')->store('perpustakaan/cover', 'public');
        }

        $buku = PerpustakaanBuku::create($data);

        return $this->created($buku, 'Buku berhasil ditambahkan.');
    }

    public function show(int $id): JsonResponse
    {
        $buku = PerpustakaanBuku::withCount(['peminjaman', 'peminjamanAktif'])
            ->with(['peminjamanAktif.peminjam:id,name'])
            ->findOrFail($id);

        return $this->success($buku);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $buku = PerpustakaanBuku::findOrFail($id);

        $data = $request->validate([
            'kode_buku' => "nullable|string|max:50|unique:perpustakaan_buku,kode_buku,{$id}",
            'isbn' => 'nullable|string|max:20',
            'judul' => 'sometimes|string|max:300',
            'pengarang' => 'nullable|string|max:200',
            'penerbit' => 'nullable|string|max:200',
            'tahun_terbit' => 'nullable|digits:4|integer',
            'kategori' => 'nullable|string|max:100',
            'lokasi_rak' => 'nullable|string|max:50',
            'stok_total' => 'sometimes|integer|min:1',
            'deskripsi' => 'nullable|string|max:2000',
            'is_active' => 'boolean',
            'cover' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('cover')) {
            if ($buku->cover)
                Storage::disk('public')->delete($buku->cover);
            $data['cover'] = $request->file('cover')->store('perpustakaan/cover', 'public');
        }

        // Sinkronisasi stok_tersedia kalau stok_total berubah
        if (isset($data['stok_total'])) {
            $dipinjam = $buku->stok_total - $buku->stok_tersedia;
            $data['stok_tersedia'] = max(0, $data['stok_total'] - $dipinjam);
        }

        $buku->update($data);

        return $this->success($buku->fresh(), 'Data buku berhasil diperbarui.');
    }

    public function destroy(int $id): JsonResponse
    {
        $buku = PerpustakaanBuku::findOrFail($id);

        if ($buku->peminjamanAktif()->exists()) {
            return $this->conflict('Buku sedang dipinjam, tidak bisa dihapus.');
        }

        if ($buku->cover)
            Storage::disk('public')->delete($buku->cover);
        $buku->delete();

        return $this->success(null, 'Buku berhasil dihapus.');
    }

    public function dropdown(Request $request): JsonResponse
    {
        $buku = PerpustakaanBuku::aktif()->tersedia()
            ->when(
                $request->search,
                fn($q) =>
                $q->where('judul', 'like', "%{$request->search}%")
            )
            ->select('id', 'kode_buku', 'judul', 'pengarang', 'stok_tersedia')
            ->orderBy('judul')
            ->limit(30)
            ->get();

        return $this->success($buku);
    }

    public function stats(): JsonResponse
    {
        return $this->success([
            'total_judul' => PerpustakaanBuku::count(),
            'total_tersedia' => PerpustakaanBuku::sum('stok_tersedia'),
            'total_dipinjam' => PerpustakaanBuku::sum('stok_total') - PerpustakaanBuku::sum('stok_tersedia'),
            'per_kategori' => PerpustakaanBuku::selectRaw('kategori, count(*) as total')
                ->groupBy('kategori')->pluck('total', 'kategori'),
        ]);
    }
}