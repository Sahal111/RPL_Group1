<?php

namespace App\Services;

use App\Models\GuruDokumen;
use App\Models\GuruDokumenVersion;
use App\Models\GuruDokumenLog;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GuruDokumenService
{
    /**
     * Upload dokumen baru
     */
    public function upload(int $guruId, array $data, UploadedFile $file, int $uploadedBy): GuruDokumen
    {
        $path = $this->storeFile($file, $guruId);
        $hash = hash_file('sha256', $file->getRealPath());
        $originalName = $file->getClientOriginalName();

        $dokumen = GuruDokumen::create([
            ...$data,
            'guru_id' => $guruId,
            'file_path' => $path,
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'file_hash' => $hash,
            'original_filename' => $originalName,
            'versi' => 1,
            'status' => GuruDokumen::STATUS_MENUNGGU_REVIEW,
            'uploaded_by' => $uploadedBy,
        ]);

        // Simpan versi pertama
        GuruDokumenVersion::create([
            'guru_dokumen_id' => $dokumen->id,
            'versi' => 1,
            'file_path' => $path,
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'file_hash' => $hash,
            'original_filename' => $originalName,
            'uploaded_by' => $uploadedBy,
            'catatan' => 'Upload pertama',
        ]);

        $this->log($dokumen->id, $uploadedBy, 'upload', "Upload versi 1: {$originalName}");

        return $dokumen->fresh(['uploader', 'versions']);
    }

    /**
     * Replace file — simpan versi baru, file lama tidak dihapus
     */
    public function replace(GuruDokumen $dokumen, UploadedFile $file, int $uploadedBy, ?string $catatan = null): GuruDokumen
    {
        $newVersi = $dokumen->versi + 1;
        $path = $this->storeFile($file, $dokumen->guru_id);
        $hash = hash_file('sha256', $file->getRealPath());
        $originalName = $file->getClientOriginalName();

        // Simpan versi baru
        GuruDokumenVersion::create([
            'guru_dokumen_id' => $dokumen->id,
            'versi' => $newVersi,
            'file_path' => $path,
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'file_hash' => $hash,
            'original_filename' => $originalName,
            'uploaded_by' => $uploadedBy,
            'catatan' => $catatan ?? "Revisi v{$newVersi}",
        ]);

        // Update dokumen utama ke versi baru
        $dokumen->update([
            'file_path' => $path,
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'file_hash' => $hash,
            'original_filename' => $originalName,
            'versi' => $newVersi,
            'status' => GuruDokumen::STATUS_MENUNGGU_REVIEW,  // reset ke review
            'verified_by' => null,
            'verified_at' => null,
            'uploaded_by' => $uploadedBy,
        ]);

        $this->log($dokumen->id, $uploadedBy, 'replace', "Replace ke versi {$newVersi}: {$originalName}");

        return $dokumen->fresh(['uploader', 'versions']);
    }

    /**
     * Approve dokumen
     */
    public function approve(GuruDokumen $dokumen, int $verifiedBy): GuruDokumen
    {
        $dokumen->update([
            'status' => GuruDokumen::STATUS_DISETUJUI,
            'is_verified' => true,
            'verified_by' => $verifiedBy,
            'verified_at' => now(),
            'rejection_reason' => null,
        ]);

        $this->log($dokumen->id, $verifiedBy, 'approve', 'Dokumen disetujui');

        return $dokumen->fresh(['verifier']);
    }

    /**
     * Reject dokumen
     */
    public function reject(GuruDokumen $dokumen, int $verifiedBy, string $reason): GuruDokumen
    {
        $dokumen->update([
            'status' => GuruDokumen::STATUS_DITOLAK,
            'is_verified' => false,
            'verified_by' => $verifiedBy,
            'verified_at' => now(),
            'rejection_reason' => $reason,
        ]);

        $this->log($dokumen->id, $verifiedBy, 'reject', "Ditolak: {$reason}");

        return $dokumen->fresh(['verifier']);
    }

    /**
     * Tandai perlu revisi
     */
    public function requestRevisi(GuruDokumen $dokumen, int $verifiedBy, string $catatan): GuruDokumen
    {
        $dokumen->update([
            'status' => GuruDokumen::STATUS_PERLU_REVISI,
            'verified_by' => $verifiedBy,
            'verified_at' => now(),
            'rejection_reason' => $catatan,
        ]);

        $this->log($dokumen->id, $verifiedBy, 'revisi', "Perlu revisi: {$catatan}");

        return $dokumen->fresh();
    }

    /**
     * Catat log download/preview
     */
    public function logAkses(GuruDokumen $dokumen, int $userId, string $aksi): void
    {
        $this->log($dokumen->id, $userId, $aksi);
    }

    /**
     * Hitung statistik dokumen untuk satu guru
     */
    public function getStatistik(int $guruId): array
    {
        $rows = GuruDokumen::where('guru_id', $guruId)
            ->whereNull('deleted_at')
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $total = array_sum($rows);
        $disetujui = $rows[GuruDokumen::STATUS_DISETUJUI] ?? 0;
        $menunggu = $rows[GuruDokumen::STATUS_MENUNGGU_REVIEW] ?? 0;
        $ditolak = $rows[GuruDokumen::STATUS_DITOLAK] ?? 0;
        $revisi = $rows[GuruDokumen::STATUS_PERLU_REVISI] ?? 0;
        $kadaluarsa = $rows[GuruDokumen::STATUS_KADALUARSA] ?? 0;

        return [
            'total' => $total,
            'disetujui' => $disetujui,
            'menunggu' => $menunggu,
            'ditolak' => $ditolak,
            'revisi' => $revisi,
            'kadaluarsa' => $kadaluarsa,
            'persen' => $total > 0 ? round(($disetujui / $total) * 100) : 0,
        ];
    }

    // ── Private helpers ──

    private function storeFile(UploadedFile $file, int $guruId): string
    {
        $ext = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $ext;
        return $file->storeAs("guru-dokumen/{$guruId}", $filename, 'local');
    }

    private function log(int $dokumenId, ?int $userId, string $aksi, ?string $keterangan = null): void
    {
        GuruDokumenLog::create([
            'guru_dokumen_id' => $dokumenId,
            'user_id' => $userId,
            'aksi' => $aksi,
            'keterangan' => $keterangan,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}