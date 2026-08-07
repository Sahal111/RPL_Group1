<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;

class JadwalPelajaran extends Model
{
    use HasSchoolScope;

    protected $table = 'jadwals';

    protected $fillable = [
        'school_id',
        'plot_id',
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

    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }

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

    public function gurus()
    {
        return $this->guru();
    }

    public function mataPelajaran()
    {
        return $this->belongsTo(MataPelajaran::class, 'mapel_id');
    }

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