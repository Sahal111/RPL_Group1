<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guru extends Model
{
    protected $table = 'gurus';
    protected $primaryKey = 'nuptk';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = true;

    protected $fillable = [
        'nuptk',
        'nip',
        'nik',
        'nama_lengkap',
        'jenis_kelamin',
        'tanggal_lahir',
        'tempat_lahir',
        'agama',
        'status_perkawinan',
        'jenis_ptk',
        'status_kepegawaian',
        'golongan',
        'tmt_golongan',
        'no_hp',
        'email',
        'alamat_jalan',
        'rt',
        'rw',
        'desa',
        'kecamatan',
        'kabupaten',
        'provinsi',
        'kode_pos',
        'foto',
        'is_active',
    ];

    public function kelasWali()
    {
        return $this->hasMany(Kelas::class, 'nuptk_wali', 'nuptk');
    }
}