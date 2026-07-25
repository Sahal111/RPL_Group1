<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GuruDiklat extends Model
{
    use SoftDeletes;
    protected $table = 'guru_diklats';
    protected $fillable = [
        'guru_id',
        'nama_diklat',
        'penyelenggara',
        'jenis',
        'tingkat',
        'tanggal_mulai',
        'tanggal_selesai',
        'jumlah_jam',
        'no_sertifikat',
        'peran',
        'file_sertifikat',
        'keterangan',
    ];
    protected $casts = ['tanggal_mulai' => 'date', 'tanggal_selesai' => 'date'];
    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }
}