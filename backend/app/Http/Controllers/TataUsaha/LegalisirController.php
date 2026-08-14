<?php

namespace App\Http\Controllers\TataUsaha;

use App\Http\Controllers\Controller;
use App\Models\Legalisir;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LegalisirController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Legalisir::with([
            'siswa:id,nisn,nama',
            'diprosesOleh:id,name',
        ])
            ->when(
                $request->search,
                fn($q) =>
                $q->whereHas(
                    'siswa',
                    fn($s) =>
                    $s->where('nama', 'like', "%{$request->search}%")
                        ->orWhere('nisn', 'like', "%{$request->search}%")
                )
            )
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->jenis_dokumen, fn($q) => $q->where('jenis_dokumen', $request->jenis_dokumen))
            ->latest('tanggal_pengajuan');

        return $this->success($query->paginate((int) $request->get('per_page', 20)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'siswa_id' => 'required|exists:siswas,id',
            'jenis_dokumen' => 'required|in:ijazah,rapor,skhun,surat_keterangan,piagam,lainnya',
            'jumlah_lembar' => 'required|integer|min:1|max:50',
            'catatan' => 'nullable|string|max:500',
        ]);

        $data['tanggal_pengajuan'] = now()->toDateString();
        $data['status'] = 'menunggu';

        $legalisir = Legalisir::create($data);

        return $this->created(
            $legalisir->load('siswa:id,nisn,nama'),
            'Permohonan legalisir berhasil diajukan.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $legalisir = Legalisir::with([
            'siswa:id,nisn,nama',
            'diprosesOleh:id,name',
        ])->findOrFail($id);

        return $this->success($legalisir);
    }

    public function proses(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:diproses,selesai,ditolak',
            'catatan' => 'nullable|string|max:500',
        ]);

        $legalisir = Legalisir::findOrFail($id);

        $legalisir->update([
            'status' => $data['status'],
            'catatan' => $data['catatan'] ?? $legalisir->catatan,
            'diproses_oleh' => auth()->id(),
            'tanggal_selesai' => $data['status'] === 'selesai' ? now()->toDateString() : null,
        ]);

        $pesan = match ($data['status']) {
            'diproses' => 'Legalisir sedang diproses.',
            'selesai' => 'Legalisir selesai.',
            'ditolak' => 'Legalisir ditolak.',
            default => 'Status diperbarui.',
        };

        return $this->success($legalisir->fresh(['siswa:id,nisn,nama']), $pesan);
    }

    public function stats(): JsonResponse
    {
        return $this->success([
            'total' => Legalisir::count(),
            'menunggu' => Legalisir::menunggu()->count(),
            'diproses' => Legalisir::where('status', 'diproses')->count(),
            'selesai' => Legalisir::selesai()->count(),
            'bulan_ini' => Legalisir::whereMonth('tanggal_pengajuan', now()->month)->count(),
        ]);
    }
}