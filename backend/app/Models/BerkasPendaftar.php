<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;

class BerkasPendaftar extends Model
{
    use HasSchoolScope;

    protected $table = 'berkas_pendaftars';

    protected $fillable = [
        'school_id',
        'calon_siswa_id',
        'jenis_berkas',
        'file_path',
        'ukuran_file',
        'status_verifikasi',
        'catatan',
    ];

    // ── Relasi ───────────────────────────────────────────────

    public function calonSiswa()
    {
        return $this->belongsTo(CalonSiswa::class, 'calon_siswa_id');
    }

    // ── Scope ────────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('status_verifikasi', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status_verifikasi', 'approved');
    }
}