<?php

namespace App\Models;

use App\Models\Scopes\SchoolScope;
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    /**
     * Override tokenable relation — bypass SchoolScope.
     * Sanctum akses $accessToken->tokenable saat resolve user dari token.
     * SchoolScope tidak boleh aktif di titik ini karena school_id
     * baru diketahui setelah user ter-resolve.
     */
    public function tokenable()
    {
        return $this->morphTo('tokenable')->withoutGlobalScope(SchoolScope::class);
    }
}