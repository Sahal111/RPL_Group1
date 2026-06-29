<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiswaKelas extends Model
{
    protected $table = 'siswa_kelas';
    public $timestamps = false;

    protected $fillable = [
        'nisn',
        'id_kelas',
        'no_absen',
        'semester',
        'tahun_ajaran',
        'status_masuk',
        'tanggal_masuk',
        'status_keluar',
        'tanggal_keluar',
        'alasan_keluar',
    ];

    protected $casts = [
        'tanggal_masuk' => 'date',
        'tanggal_keluar' => 'date',
    ];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'nisn', 'nisn');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'id_kelas', 'id');
    }
}