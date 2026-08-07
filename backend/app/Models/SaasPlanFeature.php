<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaasPlanFeature extends Model
{
    use HasFactory;

    protected $table = 'plan_features';

    public $timestamps = false;

    protected $fillable = [
        'plan_id',
        'feature',
        'value',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SaasPlan::class, 'plan_id');
    }
}
