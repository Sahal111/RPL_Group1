<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ulid' => $this->ulid,
            'global_user_id' => $this->global_user_id,
            'school_id' => $this->school_id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'foto' => $this->foto,
            'foto_url' => $this->foto ? asset('storage/' . $this->foto) : null,
            'is_active' => (bool) $this->is_active,
            'role_slug' => $this->getRoleSlug(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
