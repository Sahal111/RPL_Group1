<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GuruKompetensi extends Model
{
    use SoftDeletes;
    protected $table = 'guru_kompetensi';

    protected $fillable = [
        'guru_id',
        'jenis',
        'nama',
        'tingkat',
        'keterangan',
    ];

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }
}