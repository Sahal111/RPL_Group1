<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Absensi extends Model
{
    protected $table = 'absensis';

    protected $fillable = [
        'siswa_id',
        'kelas_id',
        'jadwal_id',
        'semester_id',
        'tanggal',
        'status',
        'keterangan',
        'dicatat_oleh',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];

    // Status konstanta
    const STATUS_HADIR  = 'hadir';
    const STATUS_SAKIT  = 'sakit';
    const STATUS_IZIN   = 'izin';
    const STATUS_ALPHA  = 'alpha';

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }

    public function jadwal()
    {
        return $this->belongsTo(JadwalPelajaran::class, 'jadwal_id');
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class, 'semester_id');
    }

    public function pencatat()
    {
        return $this->belongsTo(User::class, 'dicatat_oleh');
    }
}
