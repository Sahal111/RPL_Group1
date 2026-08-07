<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GuruResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ulid' => $this->ulid,
            'school_id' => $this->school_id,
            'nama' => $this->nama,
            'nama_lengkap' => $this->nama_lengkap,
            'gelar_depan' => $this->gelar_depan,
            'gelar_belakang' => $this->gelar_belakang,
            'nik' => $this->nik,
            'nuptk' => $this->nuptk,
            'nip' => $this->nip,
            'jenis_kelamin' => $this->jenis_kelamin,
            'tempat_lahir' => $this->tempat_lahir,
            'tanggal_lahir' => $this->tanggal_lahir?->format('Y-m-d'),
            'agama' => $this->agama,
            'no_hp' => $this->no_hp,
            'no_wa' => $this->no_wa,
            'email' => $this->email,
            'status_kepegawaian' => $this->status_kepegawaian,
            'status_aktif' => (bool) $this->status_aktif,
            'jenis_ptk' => $this->jenis_ptk,
            'foto_url' => $this->foto ? asset('storage/' . $this->foto) : null,
            'is_verified' => (bool) $this->is_verified,
            'national_ids' => $this->national_ids ?? [],
            'address_details' => $this->address_details ?? [],
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'user' => new UserResource($this->whenLoaded('user')),
            'dokumens' => GuruDokumenResource::collection($this->whenLoaded('dokumens')),
        ];
    }
}