<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guru\StoreGuruDokumenRequest;
use App\Http\Resources\GuruDokumenResource;
use App\Models\Guru;
use App\Models\GuruDokumen;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GuruDokumenController extends Controller
{
    /**
     * Display a listing of teacher documents.
     */
    public function index(string $guruId): JsonResponse
    {
        $guru = Guru::find($guruId) ?? Guru::where('ulid', $guruId)->first();

        if (!$guru) {
            return $this->notFound('Data guru tidak ditemukan.');
        }

        $dokumens = GuruDokumen::where('guru_id', $guru->id)->latest()->get();

        return $this->success(GuruDokumenResource::collection($dokumens));
    }

    /**
     * Upload a new teacher document (DMS).
     */
    public function store(StoreGuruDokumenRequest $request, string $guruId): JsonResponse
    {
        $guru = Guru::find($guruId) ?? Guru::where('ulid', $guruId)->first();

        if (!$guru) {
            return $this->notFound('Data guru tidak ditemukan.');
        }

        $schoolId = (app()->bound('current_school_id') ? app('current_school_id') : null) ?? $guru->school_id;
        $path = $request->file('berkas')->store("schools/{$schoolId}/dokumen-guru/{$guru->id}", 'public');

        $dokumen = GuruDokumen::create([
            'guru_id' => $guru->id,
            'school_id' => $schoolId,
            'jenis_dokumen' => $request->jenis_dokumen,
            'nama_dokumen' => $request->nama_dokumen,
            'file_path' => $path,
            'nomor_dokumen' => $request->nomor_dokumen,
            'tgl_terbit' => $request->tgl_terbit,
            'keterangan' => $request->keterangan,
            'status_verifikasi' => 'pending',
        ]);

        return $this->created(new GuruDokumenResource($dokumen), 'Dokumen berhasil diunggah.');
    }

    /**
     * Verify/Approve a teacher document (Kepsek/Admin).
     */
    public function verify(Request $request, string $dokumenId): JsonResponse
    {
        $dokumen = GuruDokumen::find($dokumenId);

        if (!$dokumen) {
            return $this->notFound('Dokumen tidak ditemukan.');
        }

        $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'catatan' => ['nullable', 'string'],
        ]);

        $dokumen->update([
            'status_verifikasi' => $request->status,
            'catatan_verifikasi' => $request->catatan,
            'verified_at' => now(),
            'verified_by' => auth()->id(),
        ]);

        return $this->success(new GuruDokumenResource($dokumen), 'Status verifikasi dokumen berhasil diperbarui.');
    }

    /**
     * Delete a teacher document.
     */
    public function destroy(string $dokumenId): JsonResponse
    {
        $dokumen = GuruDokumen::find($dokumenId);

        if (!$dokumen) {
            return $this->notFound('Dokumen tidak ditemukan.');
        }

        if ($dokumen->file_path && Storage::disk('public')->exists($dokumen->file_path)) {
            Storage::disk('public')->delete($dokumen->file_path);
        }

        $dokumen->delete();

        return $this->success(null, 'Dokumen berhasil dihapus.');
    }
}
