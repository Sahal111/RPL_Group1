<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolSetting extends Model
{
    // Tidak pakai SchoolScope — setting diakses via relasi School
    public $timestamps = false;

    protected $table = 'school_settings';

    protected $fillable = [
        'school_id',
        'key',
        'value',
        'grup',
        'deskripsi',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}