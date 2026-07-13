<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserWaliKelas extends Model
{
    protected $table = 'wali_kelas';

    protected $fillable = [
        'guru_id',
        'kelas_id',
        'tahun_ajaran_id',
        'semester_id',
        'no_sk',
        'tanggal_sk',
        'tmt',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'tanggal_sk' => 'date',
        'tmt' => 'date',
    ];

    // ── Relasi ──────────────────────────────────────────────

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class, 'semester_id');
    }

    // Helper: akses user via guru
    public function user()
    {
        return $this->hasOneThrough(User::class, Guru::class, 'id', 'id', 'guru_id', 'user_id');
    }
}