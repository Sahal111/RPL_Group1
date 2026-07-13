<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JadwalPelajaran extends Model
{
    protected $table = 'jadwals';

    protected $fillable = [
        'plot_id',      // FK ke plot_guru_mapels.id
        'kelas_id',
        'guru_id',
        'mapel_id',
        'semester_id',
        'hari',
        'jam_ke',
        'jam_mulai',
        'jam_selesai',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'jam_ke' => 'integer',
    ];

    // ── Relasi ──────────────────────────────────────────────

    public function plotGuruMapel()
    {
        return $this->belongsTo(PlotGuruMapel::class, 'plot_id');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }

    public function mataPelajaran()
    {
        return $this->belongsTo(MataPelajaran::class, 'mapel_id');
    }

    // Alias
    public function mapel()
    {
        return $this->mataPelajaran();
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class, 'semester_id');
    }

    public function absensis()
    {
        return $this->hasMany(Absensi::class, 'jadwal_id');
    }
}