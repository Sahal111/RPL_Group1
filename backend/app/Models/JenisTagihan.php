<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;

class JenisTagihan extends Model
{
    use HasSchoolScope;

    protected $table = 'jenis_tagihans';

    protected $fillable = [
        'school_id',
        'nama_tagihan',
        'kategori',
        'nominal_default',
        'is_rutin',
        'tahun_ajaran_id',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'nominal_default' => 'decimal:2',
        'is_rutin' => 'boolean',
        'is_active' => 'boolean',
    ];

    // ── Relasi ───────────────────────────────────────────────

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }

    public function tagihans()
    {
        return $this->hasMany(Tagihan::class, 'jenis_tagihan_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ── Scope ────────────────────────────────────────────────

    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeRutin($query)
    {
        return $query->where('is_rutin', true);
    }
}