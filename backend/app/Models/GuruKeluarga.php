<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GuruKeluarga extends Model
{
    use SoftDeletes;
    protected $table = 'guru_keluargas';

    protected $fillable = [
        'guru_id',
        'status_perkawinan',
        'nama_pasangan',
        'nik_pasangan',
        'pekerjaan_pasangan',
        'jumlah_anak',
    ];

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }
}