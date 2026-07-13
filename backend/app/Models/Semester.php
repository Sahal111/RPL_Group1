<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Semester extends Model
{
    protected $table = 'semesters';

    protected $fillable = [
        'tahun_ajaran_id',
        'nama',
        'urutan',
        'tanggal_mulai',
        'tanggal_selesai',
        'is_active',
    ];

    protected $casts = [
        'is_active'       => 'boolean',
        'tanggal_mulai'   => 'date',
        'tanggal_selesai' => 'date',
        'urutan'          => 'integer',
    ];

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }

    public function absensis()
    {
        return $this->hasMany(Absensi::class, 'semester_id');
    }

    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }
}
