<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;

class KalenderAkademik extends Model
{
    use HasSchoolScope;

    protected $table = 'kalender_akademiks';

    protected $fillable = [
        'school_id',
        'tahun_ajaran_id',
        'judul',
        'deskripsi',
        'jenis',
        'tanggal_mulai',
        'tanggal_selesai',
        'is_nasional',
        'dibuat_oleh',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'is_nasional' => 'boolean',
    ];

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }

    public function pembuat()
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }
}