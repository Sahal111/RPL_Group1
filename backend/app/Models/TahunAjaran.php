<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TahunAjaran extends Model
{
    protected $table = 'tahun_ajarans';

    protected $fillable = [
        'nama',
        'tahun_mulai',
        'tahun_selesai',
        'is_active',
    ];

    protected $casts = [
        'is_active'    => 'boolean',
        'tahun_mulai'  => 'integer',
        'tahun_selesai'=> 'integer',
    ];

    public function semesters()
    {
        return $this->hasMany(Semester::class, 'tahun_ajaran_id');
    }

    public function kelas()
    {
        return $this->hasMany(Kelas::class, 'tahun_ajaran_id');
    }

    // Scope: ambil tahun ajaran yang sedang aktif
    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }
}
