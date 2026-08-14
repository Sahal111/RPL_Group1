<?php

namespace App\Http\Controllers\Bk;

use App\Http\Controllers\Controller;
use App\Models\BkKonseling;
use App\Models\Siswa;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KonselingController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = BkKonseling::with([
            'siswa:id,nisn,nama',
            'guruBk:id,name',
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
            ->when($request->siswa_id, fn($q) => $q->where('siswa_id', $request->siswa_id))
            ->when($request->guru_bk_id, fn($q) => $q->where('guru_bk_id', $request->guru_bk_id))
            ->when($request->kategori, fn($q) => $q->where('kategori', $request->kategori))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->tanggal_dari, fn($q) => $q->where('tanggal', '>=', $request->tanggal_dari))
            ->when($request->tanggal_sampai, fn($q) => $q->where('tanggal', '<=', $request->tanggal_sampai))
            ->latest('tanggal');

        // Guru BK hanya lihat konseling miliknya
        if (auth()->user()->getRoleSlug() === 'guru_bk') {
            $query->where('guru_bk_id', auth()->id());
        }

        return $this->success($query->paginate((int) $request->get('per_page', 15)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'siswa_id' => 'required|exists:siswas,id',
            'jenis' => 'required|in:individual,kelompok,klasikal',
            'kategori' => 'required|in:pribadi,sosial,belajar,karir,keluarga,lainnya',
            'tanggal' => 'required|date',
            'jam_mulai' => 'nullable|date_format:H:i',
            'jam_selesai' => 'nullable|date_format:H:i|after:jam_mulai',
            'keluhan' => 'nullable|string|max:2000',
            'hasil_konseling' => 'nullable|string|max:2000',
            'rencana_tindak_lanjut' => 'nullable|string|max:2000',
            'status' => 'required|in:berlangsung,selesai,perlu_tindak_lanjut',
            'rahasia' => 'boolean',
        ]);

        $data['guru_bk_id'] = auth()->id();

        $konseling = BkKonseling::create($data);

        return $this->created(
            $konseling->load(['siswa:id,nisn,nama', 'guruBk:id,name']),
            'Sesi konseling berhasil dicatat.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $konseling = BkKonseling::with([
            'siswa:id,nisn,nama,kelas_id',
            'guruBk:id,name',
            'catatan',
        ])->findOrFail($id);

        return $this->success($konseling);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $konseling = BkKonseling::findOrFail($id);

        $data = $request->validate([
            'jenis' => 'sometimes|in:individual,kelompok,klasikal',
            'kategori' => 'sometimes|in:pribadi,sosial,belajar,karir,keluarga,lainnya',
            'tanggal' => 'sometimes|date',
            'jam_mulai' => 'nullable|date_format:H:i',
            'jam_selesai' => 'nullable|date_format:H:i',
            'keluhan' => 'nullable|string|max:2000',
            'hasil_konseling' => 'nullable|string|max:2000',
            'rencana_tindak_lanjut' => 'nullable|string|max:2000',
            'status' => 'sometimes|in:berlangsung,selesai,perlu_tindak_lanjut',
            'rahasia' => 'boolean',
        ]);

        $konseling->update($data);

        return $this->success(
            $konseling->fresh(['siswa:id,nisn,nama', 'guruBk:id,name']),
            'Sesi konseling berhasil diperbarui.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $konseling = BkKonseling::findOrFail($id);
        $konseling->delete();

        return $this->success(null, 'Sesi konseling berhasil dihapus.');
    }

    public function stats(Request $request): JsonResponse
    {
        $total = BkKonseling::count();
        $perluTindakLanjut = BkKonseling::where('status', 'perlu_tindak_lanjut')->count();
        $bulanIni = BkKonseling::whereMonth('tanggal', now()->month)->count();

        $perKategori = BkKonseling::selectRaw('kategori, count(*) as total')
            ->groupBy('kategori')
            ->pluck('total', 'kategori');

        $siswaSeringKonseling = BkKonseling::selectRaw('siswa_id, count(*) as jumlah')
            ->with('siswa:id,nisn,nama')
            ->groupBy('siswa_id')
            ->orderByDesc('jumlah')
            ->limit(5)
            ->get();

        return $this->success([
            'total' => $total,
            'perlu_tindak_lanjut' => $perluTindakLanjut,
            'bulan_ini' => $bulanIni,
            'per_kategori' => $perKategori,
            'sering_konseling' => $siswaSeringKonseling,
        ]);
    }
}