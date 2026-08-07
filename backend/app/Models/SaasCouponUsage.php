<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaasCouponUsage extends Model
{
    use HasFactory;

    protected $table = 'saas_coupon_usages';

    public $timestamps = false;

    protected $fillable = [
        'coupon_id',
        'school_id',
        'subscription_id',
        'discount_applied',
        'used_at',
    ];

    protected $casts = [
        'discount_applied' => 'decimal:2',
        'used_at' => 'datetime',
    ];

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(SaasCoupon::class, 'coupon_id');
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class, 'school_id');
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(SchoolSubscription::class, 'subscription_id');
    }
}
