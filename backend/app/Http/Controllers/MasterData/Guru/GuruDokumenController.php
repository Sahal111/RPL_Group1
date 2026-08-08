<?php

namespace App\Http\Controllers\MasterData\Guru;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guru\UploadDokumenRequest;
use App\Http\Requests\Guru\RejectDokumenRequest;
use App\Models\Guru;
use App\Models\GuruDokumen;
use App\Services\GuruDokumenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class GuruDokumenController extends Controller
{
    public function __construct(private GuruDokumenService $service)
    {
    }

    // ────────────────────────────────────────
    // SECTION: DOKUMEN
    // ────────────────────────────────────────

    public function getDokumen($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $dokumens = $guru->dokumens()
            ->with(['uploader:id,username,name', 'verifier:id,username,name'])
            ->withCount('versions')
            ->orderBy('kategori')
            ->orderByDesc('updated_at')
            ->get();

        $statistik = $this->service->getStatistik($guru->id);

        $uploaded = $dokumens->pluck('jenis_dokumen')->filter()->unique()->toArray();
        $checklist = [];
        foreach (GuruDokumen::JENIS_WAJIB as $kategori => $jenisMap) {
            foreach ($jenisMap as $key => $label) {
                $checklist[] = [
                    'jenis' => $key,
                    'label' => $label,
                    'kategori' => $kategori,
                    'uploaded' => in_array($key, $uploaded),
                ];
            }
        }

        return $this->success([
            'dokumens' => $dokumens,
            'statistik' => $statistik,
            'checklist' => $checklist,
        ]);
    }

    public function uploadDokumen(UploadDokumenRequest $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'kategori' => 'required|in:identitas,kepegawaian,pendidikan,sertifikasi,administrasi,penghargaan,lainnya',
            'jenis_dokumen' => 'nullable|string|max:80',
            'nama_dokumen' => 'nullable|string|max:150',
            'nomor_dokumen' => 'nullable|string|max:80',
            'tanggal_dokumen' => 'nullable|date',
            'tanggal_berlaku' => 'nullable|date',
            'tanggal_kadaluarsa' => 'nullable|date|after_or_equal:tanggal_berlaku',
            'penerbit' => 'nullable|string|max:150',
            'keterangan' => 'nullable|string|max:500',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        $dokumen = $this->service->upload(
            guruId: $guru->id,
            data: [
                'kategori' => $request->kategori,
                'jenis_dokumen' => $request->jenis_dokumen,
                'nama_dokumen' => $request->nama_dokumen ?? ($request->jenis_dokumen ?? $request->kategori),
                'nomor_dokumen' => $request->nomor_dokumen,
                'tanggal_dokumen' => $request->tanggal_dokumen,
                'tanggal_berlaku' => $request->tanggal_berlaku,
                'tanggal_kadaluarsa' => $request->tanggal_kadaluarsa,
                'penerbit' => $request->penerbit,
                'keterangan' => $request->keterangan,
            ],
            file: $request->file('file'),
            uploadedBy: auth()->id(),
        );

        return $this->created($dokumen, 'Dokumen berhasil diupload.');
    }

    public function updateDokumen(UploadDokumenRequest $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $dokumen = $guru->dokumens()->findOrFail($id);

        $request->validate([
            'kategori' => 'required|in:identitas,kepegawaian,pendidikan,sertifikasi,administrasi,lainnya',
            'jenis_dokumen' => 'nullable|string|max:80',
            'nama_dokumen' => 'nullable|string|max:150',
            'nomor_dokumen' => 'nullable|string|max:80',
            'tanggal_dokumen' => 'nullable|date',
            'tanggal_berlaku' => 'nullable|date',
            'tanggal_kadaluarsa' => 'nullable|date|after_or_equal:tanggal_berlaku',
            'penerbit' => 'nullable|string|max:150',
            'keterangan' => 'nullable|string|max:500',
            'catatan_versi' => 'nullable|string|max:255',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        $dokumen->update([
            'kategori' => $request->kategori,
            'jenis_dokumen' => $request->jenis_dokumen,
            'nama_dokumen' => $request->nama_dokumen ?? $dokumen->nama_dokumen,
            'nomor_dokumen' => $request->nomor_dokumen,
            'tanggal_dokumen' => $request->tanggal_dokumen,
            'tanggal_berlaku' => $request->tanggal_berlaku,
            'tanggal_kadaluarsa' => $request->tanggal_kadaluarsa,
            'penerbit' => $request->penerbit,
            'keterangan' => $request->keterangan,
        ]);

        if ($request->hasFile('file')) {
            $this->service->replace(
                dokumen: $dokumen,
                file: $request->file('file'),
                uploadedBy: auth()->id(),
                catatan: $request->catatan_versi,
            );
        }

        return $this->success($dokumen->fresh(['uploader', 'verifier', 'versions']), 'Dokumen berhasil diperbarui.');
    }

    public function destroyDokumen($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $dokumen = $guru->dokumens()->findOrFail($id);

        Storage::disk('public')->delete($dokumen->file_path);
        $dokumen->delete();

        return $this->success(message: 'Dokumen dihapus.');
    }

    public function approveDokumen(Request $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $dokumen = $guru->dokumens()->findOrFail($id);
        $updated = $this->service->approve($dokumen, auth()->id());

        return $this->success($updated, 'Dokumen berhasil disetujui.');
    }

    public function rejectDokumen(RejectDokumenRequest $request, $nuptk, $id)
    {
        $request->validate(['alasan' => 'required|string|max:500']);

        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $dokumen = $guru->dokumens()->findOrFail($id);
        $updated = $this->service->reject($dokumen, auth()->id(), $request->alasan);

        return $this->success($updated, 'Dokumen ditolak.');
    }

    public function getDokumenVersions($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $dokumen = $guru->dokumens()->findOrFail($id);

        return $this->success($dokumen->versions()->with('uploader:id,username,name')->get());
    }

    public function getDokumenLogs($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $dokumen = $guru->dokumens()->findOrFail($id);

        return $this->success($dokumen->logs()->with('user:id,username,name')->get());
    }

    // ────────────────────────────────────────
    // SECTION: DOWNLOAD
    // ────────────────────────────────────────

    public function downloadDokumen($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $dokumen = $guru->dokumens()->findOrFail($id);

        $path = storage_path('app/public/' . $dokumen->file_path);

        if (!file_exists($path)) {
            return $this->notFound('File tidak ditemukan.');
        }

        return response()->download(
            $path,
            $dokumen->nama_dokumen . '.' . pathinfo($path, PATHINFO_EXTENSION)
        );
    }

    public function downloadFile(Request $request, $nuptk)
    {
        Guru::where('nuptk', $nuptk)->firstOrFail();

        $filePath = $request->query('path');
        $namaFile = $request->query('nama', 'dokumen');

        if (!$filePath) {
            return $this->error('Path tidak ditemukan.', 'NOT_FOUND', 400);
        }

        $fullPath = storage_path('app/public/' . $filePath);

        if (!file_exists($fullPath)) {
            return $this->notFound('File tidak ditemukan.');
        }

        $ext = pathinfo($fullPath, PATHINFO_EXTENSION);
        $safeName = preg_replace('/[\/\\\:*?"<>|]/', '_', $namaFile);

        return response()->download($fullPath, $safeName . '.' . $ext);
    }

    public function bulkDownload(Request $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $query = $guru->dokumens()->whereNotNull('file_path');

        if ($request->has('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        $dokumens = $query->get();

        if ($dokumens->isEmpty()) {
            return $this->notFound('Tidak ada dokumen.');
        }

        $zip = new ZipArchive();
        $filename = "Dokumen_{$guru->nama}_{$nuptk}_" . now()->format('Ymd') . '.zip';
        $tmpPath = storage_path("app/tmp/{$filename}");

        if (!is_dir(storage_path('app/tmp'))) {
            mkdir(storage_path('app/tmp'), 0755, true);
        }

        if ($zip->open($tmpPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return $this->error('Gagal membuat ZIP.', 'SERVER_ERROR', 500);
        }

        foreach ($dokumens as $dok) {
            $fullPath = storage_path('app/public/' . $dok->file_path);
            if (file_exists($fullPath)) {
                $ext = pathinfo($fullPath, PATHINFO_EXTENSION);
                $entryName = "{$dok->kategori}/{$dok->nama_dokumen}.{$ext}";
                $zip->addFile($fullPath, $entryName);
            }
        }

        $zip->close();

        return response()->download($tmpPath, $filename)->deleteFileAfterSend(true);
    }
}