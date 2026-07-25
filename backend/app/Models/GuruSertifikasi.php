<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GuruSertifikasi extends Model
{
    use SoftDeletes;
    protected $table = 'guru_sertifikasis';
    protected $fillable = [
        'guru_id',
        'jenis_sertifikasi',
        'no_sertifikat',
        'nrg',
        'tahun_sertifikasi',
        'lptk',
        'bidang_studi',
        'file_sertifikat',
        'tanggal_terbit',
        'expired_at',
    ];
    protected $casts = ['tanggal_terbit' => 'date', 'expired_at' => 'date'];
    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }
}