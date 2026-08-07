<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SaasCoupon extends Model
{
    use HasFactory;

    protected $table = 'saas_coupons';

    protected $fillable = [
        'code',
        'type',
        'value',
        'currency_code',
        'max_uses',
        'max_uses_per_school',
        'valid_from',
        'valid_until',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'max_uses' => 'integer',
        'max_uses_per_school' => 'integer',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function usages(): HasMany
    {
        return $this->hasMany(SaasCouponUsage::class, 'coupon_id');
    }

    public function scopeValid($query)
    {
        return $query->where('is_active', true)
            ->where('valid_from', '<=', now())
            ->where(function ($q) {
                $q->whereNull('valid_until')->orWhere('valid_until', '>=', now());
            });
    }
}
