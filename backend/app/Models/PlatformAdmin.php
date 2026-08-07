<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlatformAdmin extends Model
{
    use HasFactory;

    protected $table = 'platform_admins';

    protected $fillable = [
        'global_user_id',
        'level',
        'last_tenant_id',
        'last_impersonate_at',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_impersonate_at' => 'datetime',
    ];

    public function globalUser(): BelongsTo
    {
        return $this->belongsTo(GlobalUser::class, 'global_user_id');
    }

    public function lastTenant(): BelongsTo
    {
        return $this->belongsTo(School::class, 'last_tenant_id');
    }

    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }
}
