<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JadwalPelajaran extends Model
{
    protected $table = 'jadwals';

    protected $fillable = [
        'plot_guru_mapel_id',
        'kelas_id',
        'semester_id',
        'hari',
        'jam_mulai',
        'jam_selesai',
        'ruangan',
    ];

    public function plotGuruMapel()
    {
        return $this->belongsTo(PlotGuruMapel::class, 'plot_guru_mapel_id');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class, 'semester_id');
    }

    // Shortcut ke guru via plot
    public function guru()
    {
        return $this->hasOneThrough(
            Guru::class,
            PlotGuruMapel::class,
            'id',           // FK di plot_guru_mapels → id
            'id',           // FK di gurus → id
            'plot_guru_mapel_id', // FK lokal di jadwals
            'guru_id'       // FK di plot_guru_mapels → guru_id
        );
    }

    // Shortcut ke mapel via plot
    public function mataPelajaran()
    {
        return $this->hasOneThrough(
            MataPelajaran::class,
            PlotGuruMapel::class,
            'id',
            'id',
            'plot_guru_mapel_id',
            'mapel_id'
        );
    }

    public function absensis()
    {
        return $this->hasMany(Absensi::class, 'jadwal_id');
    }
}
