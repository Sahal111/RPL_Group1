<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Siswa extends Model
{
    protected $table = 'siswa';
    protected $primaryKey = 'nisn';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'nisn',
        'kode_anak',
        'nik',
        'no_induk',
        'nama_lengkap',
        'jenis_kelamin',
        'tanggal_lahir',
        'tempat_lahir',
        'agama',
        'status_dalam_keluarga',
        'anak_ke',
        'no_kk',
        'no_akta_lahir',
        'nama_ibu_kandung',
        'kewarganegaraan',
        'alamat_jalan',
        'rt',
        'rw',
        'desa',
        'kecamatan',
        'kabupaten',
        'provinsi',
        'kode_pos',
        'no_hp',
        'status_pd',
        'asal_sekolah',
        'tanggal_masuk',
        'foto',
    ];

    protected $casts = [
        'anak_ke' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (Siswa $siswa) {
            if (empty($siswa->kode_anak)) {
                $siswa->kode_anak = static::generateKodeAnak();
            }
        });
    }

    public static function generateKodeAnak(): string
    {
        do {
            $kode = strtoupper(\Illuminate\Support\Str::random(6));
        } while (static::where('kode_anak', $kode)->exists());

        return $kode;
    }

    public function kelas()
    {
        return $this->hasMany(SiswaKelas::class, 'nisn', 'nisn');
    }

    public function userOrtu()
    {
        return $this->hasMany(UserOrtu::class, 'nisn', 'nisn');
    }

    public function orangTua()
    {
        return $this->belongsToMany(OrangTua::class, 'siswa_orang_tua', 'nisn', 'id_ortu', 'nisn', 'id')
            ->withTimestamps();
    }
}
