<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuruKompetensi extends Model
{
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