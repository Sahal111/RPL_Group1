<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KelasResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama_kelas' => $this->nama_kelas,
            'tingkat' => $this->tingkat,
            'kurikulum' => $this->kurikulum,
            'ruangan' => $this->ruangan,
            'kapasitas' => $this->kapasitas,
            'is_active' => (bool) $this->is_active,
            'tahun_ajaran_id' => $this->tahun_ajaran_id,
            'semester_id' => $this->semester_id,
            'wali_kelas_id' => $this->wali_kelas_id,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'wali_kelas' => $this->whenLoaded('waliKelas', fn() => [
                'id' => $this->waliKelas->id,
                'nama' => $this->waliKelas->nama_lengkap,
                'nuptk' => $this->waliKelas->nuptk,
            ]),
        ];
    }
}