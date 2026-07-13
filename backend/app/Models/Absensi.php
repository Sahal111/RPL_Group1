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
        'plot_id',
        'tahun_ajaran_id',
        'semester_id',
        'tanggal',
        'status',
        'keterangan',
        'dicatat_oleh',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];

    // Status enum values sesuai DB
    const STATUS_HADIR = 'Hadir';
    const STATUS_SAKIT = 'Sakit';
    const STATUS_IZIN = 'Izin';
    const STATUS_ALPA = 'Alpa';

    // ── Relasi ──────────────────────────────────────────────

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

    public function plotGuruMapel()
    {
        return $this->belongsTo(PlotGuruMapel::class, 'plot_id');
    }

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
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