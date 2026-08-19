<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiswaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'ulid' => $this->ulid,
            'nisn' => $this->nisn,
            'nis' => $this->nis,
            'nama' => $this->nama,
            'jenis_kelamin' => $this->jenis_kelamin,
            'tempat_lahir' => $this->tempat_lahir,
            'tanggal_lahir' => $this->tanggal_lahir?->format('Y-m-d'),
            'agama' => $this->agama,
            'tingkat' => $this->tingkat,
            'status' => $this->status,
            'kebutuhan_khusus' => $this->kebutuhan_khusus,
            'asal_sekolah' => $this->asal_sekolah,
            'tanggal_masuk' => $this->tanggal_masuk?->format('Y-m-d'),
            'foto_url' => $this->foto ? asset('storage/' . $this->foto) : null,
            'address_details' => $this->address_details ?? [],
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}