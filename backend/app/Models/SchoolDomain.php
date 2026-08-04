<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolDomain extends Model
{
    public $timestamps = false;

    protected $table = 'school_domains';

    protected $fillable = [
        'school_id',
        'domain',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}