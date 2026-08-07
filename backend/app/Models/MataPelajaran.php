<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;

class MataPelajaran extends Model
{
    use HasSchoolScope;

    protected $table = 'mapels';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'school_id',
        'kode',
        'nama_mapel',
        'kelompok',
        'tingkat',
        'kurikulum',
        'jam_per_minggu',
        'is_active',
        'urutan_rapor',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'jam_per_minggu' => 'integer',
        'tingkat' => 'string',
        'urutan_rapor' => 'integer',
    ];

    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }

    // ── Relasi ──────────────────────────────────────────────

    public function plotGuruMapels()
    {
        return $this->hasMany(PlotGuruMapel::class, 'mapel_id');
    }

    public function jadwals()
    {
        return $this->hasMany(JadwalPelajaran::class, 'mapel_id');
    }
}