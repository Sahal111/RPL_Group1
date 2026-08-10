<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;

class CalonSiswa extends Model
{
    use HasSchoolScope;

    protected $table = 'calon_siswas';

    protected $fillable = [
        'school_id',
        'tahun_ajaran_id',
        'no_pendaftaran',
        'nama_lengkap',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'agama',
        'alamat',
        'asal_sekolah',
        'nama_orang_tua',
        'no_hp',
        'email',
        'jalur',
        'status',
        'siswa_id',
        'catatan_verifikasi',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];

    // ── Relasi ───────────────────────────────────────────────

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    public function berkas()
    {
        return $this->hasMany(BerkasPendaftar::class, 'calon_siswa_id');
    }

    public function pembayaranPpdb()
    {
        return $this->hasMany(PembayaranPpdb::class, 'calon_siswa_id');
    }

    // ── Scope ────────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeLulus($query)
    {
        return $query->where('status', 'lulus');
    }
}