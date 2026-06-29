<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JadwalPelajaran extends Model
{
    protected $table = 'jadwal_pelajaran';
    public $timestamps = false;

    protected $fillable = [
        'id_kelas',
        'id_mapel',
        'nuptk',
        'hari',
        'jam_mulai',
        'jam_selesai',
        'semester',
        'tahun_ajaran',
    ];

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'id_kelas', 'id');
    }

    public function mataPelajaran()
    {
        return $this->belongsTo(MataPelajaran::class, 'id_mapel', 'id');
    }

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'nuptk', 'nuptk');
    }
}
