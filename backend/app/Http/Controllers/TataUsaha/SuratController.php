<?php

namespace App\Http\Controllers\TataUsaha;

use App\Http\Controllers\Controller;
use App\Models\Surat;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SuratController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Surat::with(['dibuatOleh:id,name'])
            ->when(
                $request->search,
                fn($q) =>
                $q->where('perihal', 'like', "%{$request->search}%")
                    ->orWhere('nomor_surat', 'like', "%{$request->search}%")
                    ->orWhere('pengirim', 'like', "%{$request->search}%")
            )
            ->when($request->jenis, fn($q) => $q->where('jenis', $request->jenis))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->tanggal_dari, fn($q) => $q->where('tanggal_surat', '>=', $request->tanggal_dari))
            ->when($request->tanggal_sampai, fn($q) => $q->where('tanggal_surat', '<=', $request->tanggal_sampai))
            ->latest('tanggal_surat');

        return $this->success($query->paginate((int) $request->get('per_page', 20)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nomor_surat' => 'nullable|string|max:100',
            'jenis' => 'required|in:masuk,keluar,internal,legalisir',
            'perihal' => 'required|string|max:300',
            'pengirim' => 'nullable|string|max:200',
            'penerima' => 'nullable|string|max:200',
            'tanggal_surat' => 'required|date',
            'tanggal_terima' => 'nullable|date',
            'keterangan' => 'nullable|string|max:2000',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('surat', 'public');
        }

        $data['dibuat_oleh'] = auth()->id();
        $data['status'] = 'aktif';

        $surat = Surat::create($data);

        return $this->created($surat->load('dibuatOleh:id,name'), 'Surat berhasil ditambahkan.');
    }

    public function show(int $id): JsonResponse
    {
        $surat = Surat::with([
            'dibuatOleh:id,name',
            'diarsipOleh:id,name',
        ])->findOrFail($id);

        return $this->success($surat);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $surat = Surat::findOrFail($id);

        if ($surat->status === 'diarsip') {
            return $this->conflict('Surat yang sudah diarsip tidak bisa diubah.');
        }

        $data = $request->validate([
            'nomor_surat' => 'nullable|string|max:100',
            'perihal' => 'sometimes|string|max:300',
            'pengirim' => 'nullable|string|max:200',
            'penerima' => 'nullable|string|max:200',
            'tanggal_surat' => 'sometimes|date',
            'tanggal_terima' => 'nullable|date',
            'keterangan' => 'nullable|string|max:2000',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        if ($request->hasFile('file')) {
            if ($surat->file_path)
                Storage::disk('public')->delete($surat->file_path);
            $data['file_path'] = $request->file('file')->store('surat', 'public');
        }

        $surat->update($data);

        return $this->success($surat->fresh(), 'Surat berhasil diperbarui.');
    }

    public function destroy(int $id): JsonResponse
    {
        $surat = Surat::findOrFail($id);

        if ($surat->file_path)
            Storage::disk('public')->delete($surat->file_path);
        $surat->delete();

        return $this->success(null, 'Surat berhasil dihapus.');
    }

    public function arsip(int $id): JsonResponse
    {
        $surat = Surat::findOrFail($id);

        if ($surat->status === 'diarsip') {
            return $this->conflict('Surat sudah diarsip.');
        }

        $surat->update([
            'status' => 'diarsip',
            'diarsip_oleh' => auth()->id(),
            'diarsip_at' => now(),
        ]);

        return $this->success($surat->fresh(), 'Surat berhasil diarsipkan.');
    }

    public function stats(): JsonResponse
    {
        return $this->success([
            'total' => Surat::count(),
            'masuk' => Surat::masuk()->count(),
            'keluar' => Surat::keluar()->count(),
            'diarsip' => Surat::where('status', 'diarsip')->count(),
            'bulan_ini' => Surat::whereMonth('tanggal_surat', now()->month)->count(),
        ]);
    }
}