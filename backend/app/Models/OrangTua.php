<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrangTua extends Model
{
    use HasFactory;

    protected $table = 'orang_tua';

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
        return $this->belongsToMany(Siswa::class, 'siswa_orang_tua', 'id_ortu', 'nisn', 'id', 'nisn')
            ->withTimestamps();
    }

    public function dokumen()
    {
        return $this->hasMany(OrangTuaDokumen::class, 'id_ortu');
    }
}