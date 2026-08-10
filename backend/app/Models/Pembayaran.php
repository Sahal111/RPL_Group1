<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pembayaran extends Model
{
    use SoftDeletes, HasSchoolScope;

    protected $table = 'pembayarans';

    protected $fillable = [
        'school_id',
        'tagihan_id',
        'siswa_id',
        'nominal_bayar',
        'tanggal_bayar',
        'metode_bayar',
        'no_bukti',
        'catatan',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'nominal_bayar' => 'decimal:2',
        'tanggal_bayar' => 'date',
    ];

    // ── Relasi ───────────────────────────────────────────────

    public function tagihan()
    {
        return $this->belongsTo(Tagihan::class, 'tagihan_id');
    }

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // ── Scope ────────────────────────────────────────────────

    public function scopeValid($query)
    {
        return $query->where('status', 'valid');
    }
}