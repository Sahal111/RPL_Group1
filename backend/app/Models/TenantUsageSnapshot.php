<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantUsageSnapshot extends Model
{
    use HasFactory;

    protected $table = 'tenant_usage_snapshots';

    protected $fillable = [
        'school_id',
        'snapshot_date',
        'total_users',
        'total_gurus',
        'total_siswas',
        'storage_used_bytes',
        'active_subscriptions_count',
        'raw_metrics',
    ];

    protected $casts = [
        'snapshot_date' => 'date',
        'total_users' => 'integer',
        'total_gurus' => 'integer',
        'total_siswas' => 'integer',
        'storage_used_bytes' => 'integer',
        'active_subscriptions_count' => 'integer',
        'raw_metrics' => 'array',
    ];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class, 'school_id');
    }
}
