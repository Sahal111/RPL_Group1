<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Siswa extends Model
{
    protected $table = 'siswas';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = true;

    protected $fillable = [
        'nisn',
        'kode_anak',
        'nik',
        'nis',
        'nama',
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
        'desa_kelurahan',
        'kecamatan',
        'kota_kabupaten',
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
        return $this->hasMany(RiwayatKelas::class, 'siswa_id', 'id');
    }

    public function kelasAktif()
    {
        return $this->belongsToMany(Kelas::class, 'riwayat_kelas', 'siswa_id', 'kelas_id', 'id', 'id')
            ->wherePivot('status_keluar', 'Aktif')
            ->where('kelas.is_active', 1)
            ->withPivot('no_absen', 'tanggal_masuk', 'tanggal_keluar', 'jenis_perubahan');
    }

    public function orangTua()
    {
        return $this->belongsToMany(OrangTua::class, 'orang_tua_siswa', 'siswa_id', 'orang_tua_id', 'id', 'id')
            ->withTimestamps();
    }
}