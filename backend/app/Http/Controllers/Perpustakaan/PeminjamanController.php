<?php

namespace App\Http\Controllers\Perpustakaan;

use App\Http\Controllers\Controller;
use App\Models\PerpustakaanBuku;
use App\Models\PerpustakaanPeminjaman;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PeminjamanController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = PerpustakaanPeminjaman::with([
            'buku:id,kode_buku,judul',
            'peminjam:id,name',
            'petugas:id,name',
        ])
            ->when(
                $request->search,
                fn($q) =>
                $q->whereHas(
                    'buku',
                    fn($b) =>
                    $b->where('judul', 'like', "%{$request->search}%")
                        ->orWhere('kode_buku', 'like', "%{$request->search}%")
                )
            )
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->peminjam_id, fn($q) => $q->where('peminjam_id', $request->peminjam_id))
            ->when($request->terlambat, fn($q) => $q->terlambat())
            ->latest('tanggal_pinjam');

        return $this->success($query->paginate((int) $request->get('per_page', 20)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'buku_id' => 'required|exists:perpustakaan_buku,id',
            'peminjam_id' => 'required|exists:users,id',
            'peminjam_tipe' => 'required|in:siswa,guru,staff',
            'tanggal_pinjam' => 'required|date',
            'tanggal_kembali_rencana' => 'required|date|after:tanggal_pinjam',
            'catatan' => 'nullable|string|max:500',
        ]);

        return DB::transaction(function () use ($data) {
            $buku = PerpustakaanBuku::lockForUpdate()->findOrFail($data['buku_id']);

            if ($buku->stok_tersedia < 1) {
                return $this->conflict('Stok buku tidak tersedia.');
            }

            $data['petugas_id'] = auth()->id();
            $data['status'] = 'dipinjam';

            $peminjaman = PerpustakaanPeminjaman::create($data);
            $buku->decrement('stok_tersedia');

            return $this->created(
                $peminjaman->load(['buku:id,kode_buku,judul', 'peminjam:id,name']),
                'Peminjaman berhasil dicatat.'
            );
        });
    }

    public function show(int $id): JsonResponse
    {
        $peminjaman = PerpustakaanPeminjaman::with([
            'buku:id,kode_buku,judul,pengarang',
            'peminjam:id,name',
            'petugas:id,name',
        ])->findOrFail($id);

        return $this->success($peminjaman);
    }

    public function kembalikan(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'tanggal_kembali_aktual' => 'required|date',
            'denda' => 'nullable|integer|min:0',
            'catatan' => 'nullable|string|max:500',
        ]);

        return DB::transaction(function () use ($id, $data) {
            $peminjaman = PerpustakaanPeminjaman::lockForUpdate()
                ->where('status', 'dipinjam')
                ->findOrFail($id);

            $peminjaman->update([
                'tanggal_kembali_aktual' => $data['tanggal_kembali_aktual'],
                'denda' => $data['denda'] ?? 0,
                'catatan' => $data['catatan'] ?? $peminjaman->catatan,
                'status' => 'dikembalikan',
            ]);

            $peminjaman->buku()->increment('stok_tersedia');

            return $this->success(
                $peminjaman->fresh(['buku:id,judul', 'peminjam:id,name']),
                'Buku berhasil dikembalikan.'
            );
        });
    }

    public function laporan(Request $request): JsonResponse
    {
        $terlambat = PerpustakaanPeminjaman::terlambat()->count();
        $dipinjamTotal = PerpustakaanPeminjaman::dipinjam()->count();
        $bulanIni = PerpustakaanPeminjaman::whereMonth('tanggal_pinjam', now()->month)->count();
        $totalDenda = PerpustakaanPeminjaman::where('status', 'dikembalikan')->sum('denda');

        $bukuPopuler = PerpustakaanPeminjaman::selectRaw('buku_id, count(*) as total_pinjam')
            ->with('buku:id,judul,pengarang')
            ->groupBy('buku_id')
            ->orderByDesc('total_pinjam')
            ->limit(5)
            ->get();

        return $this->success([
            'dipinjam' => $dipinjamTotal,
            'terlambat' => $terlambat,
            'bulan_ini' => $bulanIni,
            'total_denda' => $totalDenda,
            'buku_populer' => $bukuPopuler,
        ]);
    }
}