<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GuruMutasi extends Model
{
    use SoftDeletes;

    protected $table = 'guru_mutasi';

    protected $fillable = [
        'guru_id',
        'jenis_mutasi',
        'sekolah_asal',
        'npsn_asal',
        'sekolah_tujuan',
        'npsn_tujuan',
        'tanggal_mutasi',
        'no_sk',
        'tanggal_sk',
        'file_sk',
        'keterangan',
    ];

    protected $casts = [
        'tanggal_mutasi' => 'date',
        'tanggal_sk' => 'date',
    ];

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }
}