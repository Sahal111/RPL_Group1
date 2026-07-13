<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * PlotGuruMapel — penugasan resmi guru mengajar mapel di kelas tertentu
 * sesuai standar Dapodik (PTK → penugasan → jadwal)
 */
class PlotGuruMapel extends Model
{
    protected $table = 'plot_guru_mapels';

    protected $fillable = [
        'guru_id',
        'mapel_id',
        'kelas_id',
        'semester_id',
        'jam_per_minggu',
        'is_active',
    ];

    protected $casts = [
        'is_active'      => 'boolean',
        'jam_per_minggu' => 'integer',
    ];

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }

    public function mapel()
    {
        return $this->belongsTo(MataPelajaran::class, 'mapel_id');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class, 'semester_id');
    }

    public function jadwals()
    {
        return $this->hasMany(JadwalPelajaran::class, 'plot_guru_mapel_id');
    }
}
