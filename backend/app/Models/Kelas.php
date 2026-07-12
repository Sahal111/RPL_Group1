<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kelas extends Model
{
    protected $table = 'kelas';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'id_tahun_ajaran',
        'nama_kelas',
        'tingkat',
        'semester',
        'nuptk_wali',
        'kurikulum',
        'kapasitas',
        'ruangan',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'kapasitas' => 'integer',
    ];

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'id_tahun_ajaran', 'id');
    }

    public function wali()
    {
        return $this->belongsTo(Guru::class, 'nuptk_wali', 'nuptk');
    }

    public function siswaKelas()
    {
        return $this->hasMany(SiswaKelas::class, 'id_kelas', 'id');
    }

    public function absensi()
    {
        return $this->hasMany(Absensi::class, 'id_kelas', 'id');
    }
}