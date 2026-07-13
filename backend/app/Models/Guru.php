<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Guru extends Model
{
    use SoftDeletes;

    protected $table = 'gurus';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'nuptk',
        'nip',
        'nip_lama',
        'no_karpeg',
        'no_karis_karsu',
        'nik',
        'no_kk',
        'nama',
        'gelar_depan',
        'gelar_belakang',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'golongan_darah',
        'agama',
        'nama_ibu_kandung',
        'alamat_jalan',
        'rt',
        'rw',
        'desa_kelurahan',
        'kecamatan',
        'kota_kabupaten',
        'provinsi',
        'kode_pos',
        'no_hp',
        'email',
        'jenis_ptk',
        'status_kepegawaian',
        'status_aktif',
        'tanggal_bergabung',
        'tmt_pns',
        'tmt_gty',
        'foto',
        'is_verified',
        'verified_at',
        'verified_by',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'status_aktif' => 'boolean',
        'is_verified' => 'boolean',
        'tanggal_lahir' => 'date',
        'tanggal_bergabung' => 'date',
        'tmt_pns' => 'date',
        'tmt_gty' => 'date',
        'verified_at' => 'datetime',
    ];

    // ── Helper nama lengkap dengan gelar ────────────────────

    public function getNamaLengkapAttribute(): string
    {
        $depan = $this->gelar_depan ? $this->gelar_depan . ' ' : '';
        $belakang = $this->gelar_belakang ? ', ' . $this->gelar_belakang : '';
        return $depan . $this->nama . $belakang;
    }

    // ── Relasi ──────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function kelasWali()
    {
        return $this->hasMany(Kelas::class, 'wali_kelas_id');
    }

    // Alias backward-compat
    public function kelas()
    {
        return $this->kelasWali();
    }

    public function plotGuruMapels()
    {
        return $this->hasMany(PlotGuruMapel::class, 'guru_id');
    }

    public function jadwals()
    {
        return $this->hasMany(JadwalPelajaran::class, 'guru_id');
    }

    public function waliKelas()
    {
        return $this->hasMany(UserWaliKelas::class, 'guru_id');
    }
}