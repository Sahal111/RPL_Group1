<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GuruAbsensi extends Model
{
    use SoftDeletes;
    protected $table = 'guru_absensis';
    protected $fillable = [
        'guru_id',
        'tanggal',
        'jam_masuk',
        'jam_pulang',
        'status',
        'keterangan',
    ];
    protected $casts = ['tanggal' => 'date'];
    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }
}