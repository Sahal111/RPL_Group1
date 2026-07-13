<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrangTua extends Model
{
    use HasFactory;

    protected $table = 'orang_tuas';

    protected $fillable = [
        'nama_ayah',
        'nik_ayah',
        'tanggal_lahir_ayah',
        'pendidikan_ayah',
        'pekerjaan_ayah',
        'penghasilan_ayah',
        'nama_ibu',
        'nik_ibu',
        'tanggal_lahir_ibu',
        'pendidikan_ibu',
        'pekerjaan_ibu',
        'penghasilan_ibu',
        'nama_wali',
        'nik_wali',
        'hubungan_wali',
        'pekerjaan_wali',
        'penghasilan_wali',
        'no_hp_ayah',
        'no_hp_ibu',
        'no_hp_wali',
        'email',
        'alamat',
    ];

    public function siswa()
    {
        return $this->belongsToMany(Siswa::class, 'orang_tua_siswa', 'orang_tua_id', 'siswa_id', 'id', 'id')
            ->withTimestamps();
    }


}