<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GuruDokumenResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'guru_id' => $this->guru_id,
            'school_id' => $this->school_id,
            'jenis_dokumen' => $this->jenis_dokumen,
            'nama_dokumen' => $this->nama_dokumen,
            'file_path' => $this->file_path,
            'has_file' => (bool) $this->file_path,
            'nomor_dokumen' => $this->nomor_dokumen,
            'status_verifikasi' => $this->status_verifikasi ?? 'pending',
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}