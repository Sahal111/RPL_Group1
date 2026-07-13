<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kelas extends Model
{
    protected $table = 'kelas';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = true;

    protected $fillable = [
        'tahun_ajaran_id',
        'semester_id',
        'nama_kelas',
        'tingkat',
        'kurikulum',
        'wali_kelas_id',
        'kapasitas',
        'ruangan',
        'is_active',
    ];

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }

    public function wali()
    {
        return $this->belongsTo(Guru::class, 'wali_kelas_id');
    }

    public function riwayatKelas()
    {
        return $this->hasMany(RiwayatKelas::class, 'kelas_id', 'id');
    }

    public function absensis()
    {
        return $this->hasMany(Absensi::class, 'kelas_id', 'id');
    }
}