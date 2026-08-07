<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GlobalUserSchool extends Model
{
    use HasFactory;

    protected $table = 'global_user_schools';

    protected $fillable = [
        'global_user_id',
        'school_id',
        'is_default',
        'last_accessed_at',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'last_accessed_at' => 'datetime',
    ];

    public function globalUser(): BelongsTo
    {
        return $this->belongsTo(GlobalUser::class, 'global_user_id');
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class, 'school_id');
    }
}
