<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KalenderAkademik extends Model
{
    protected $table = 'kalender_akademiks';

    protected $fillable = [
        'tahun_ajaran_id',
        'judul',
        'deskripsi',
        'tanggal_mulai',
        'tanggal_selesai',
        'jenis',
        'warna',
    ];

    protected $casts = [
        'tanggal_mulai'   => 'date',
        'tanggal_selesai' => 'date',
    ];

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }
}
