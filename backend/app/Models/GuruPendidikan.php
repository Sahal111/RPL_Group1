<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GuruPendidikan extends Model
{
    use SoftDeletes;
    protected $table = 'guru_pendidikans';
    protected $fillable = [
        'guru_id',
        'jenjang',
        'nama_sekolah',
        'jurusan',
        'prodi',
        'tahun_masuk',
        'tahun_lulus',
        'no_ijazah',
        'file_ijazah',
    ];
    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }
}