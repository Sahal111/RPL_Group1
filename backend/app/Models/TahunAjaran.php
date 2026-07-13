<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TahunAjaran extends Model
{
    use SoftDeletes;

    protected $table = 'tahun_ajarans';

    protected $fillable = [
        'tahun',       // format: "2025/2026"
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ── Relasi ──────────────────────────────────────────────

    public function semesters()
    {
        return $this->hasMany(Semester::class, 'tahun_ajaran_id');
    }

    public function kelas()
    {
        return $this->hasMany(Kelas::class, 'tahun_ajaran_id');
    }

    // ── Scopes ──────────────────────────────────────────────

    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }
}