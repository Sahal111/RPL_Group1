<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MataPelajaran extends Model
{
    protected $table      = 'mapels';
    protected $primaryKey = 'id';
    public $timestamps    = false;

    protected $fillable = [
        'kode_mapel',
        'nama_mapel',
        'kelompok',
        'tingkat',
        'jam_per_minggu',
        'kurikulum',
        'is_active',
    ];

    protected $casts = [
        'is_active'      => 'boolean',
        'jam_per_minggu' => 'integer',
    ];
}
