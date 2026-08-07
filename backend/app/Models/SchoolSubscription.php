<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SchoolSubscription extends Model
{
    use HasFactory;

    protected $table = 'school_subscriptions';

    protected $fillable = [
        'school_id',
        'plan_id',
        'status',
        'siklus',
        'starts_at',
        'ends_at',
        'trial_ends_at',
        'cancels_at',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'cancels_at' => 'datetime',
    ];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class, 'school_id');
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SaasPlan::class, 'plan_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(SaasInvoice::class, 'subscription_id');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['active', 'trialing']);
    }
}
