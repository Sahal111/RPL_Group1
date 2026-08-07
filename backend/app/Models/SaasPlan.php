<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SaasPlan extends Model
{
    use HasFactory;

    protected $table = 'plans';

    protected $fillable = [
        'slug',
        'nama',
        'harga_bulan',
        'harga_tahun',
        'max_users',
        'max_storage_gb',
        'is_active',
    ];

    protected $casts = [
        'harga_bulan' => 'decimal:2',
        'harga_tahun' => 'decimal:2',
        'max_users' => 'integer',
        'max_storage_gb' => 'integer',
        'is_active' => 'boolean',
    ];

    public function features(): HasMany
    {
        return $this->hasMany(SaasPlanFeature::class, 'plan_id');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(SchoolSubscription::class, 'plan_id');
    }

    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }
}
