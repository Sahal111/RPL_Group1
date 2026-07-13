<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MataPelajaran extends Model
{
    protected $table = 'mapels';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
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
        'tingkat' => 'integer',
        'urutan_rapor' => 'integer',
    ];

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