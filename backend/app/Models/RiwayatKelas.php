<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiwayatKelas extends Model
{
    protected $table = 'riwayat_kelas';

    protected $fillable = [
        'siswa_id',
        'kelas_id',
        'nama_kelas_snapshot',
        'tahun_ajaran_id',
        'semester_id',
        'no_absen',
        'tanggal_masuk',
        'tanggal_keluar',
        'jenis_perubahan',
        'catatan',
    ];

    protected $casts = [
        'tanggal_masuk'  => 'date',
        'tanggal_keluar' => 'date',
    ];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }

    // Scope: siswa yang aktif di kelas (belum keluar)
    public function scopeAktif($query)
    {
        return $query->whereNull('tanggal_keluar')
                     ->whereNotIn('jenis_perubahan', ['mutasi_keluar', 'lulus', 'nonaktif', 'meninggal']);
    }
}
