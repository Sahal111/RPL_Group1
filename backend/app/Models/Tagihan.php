<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;

class Tagihan extends Model
{
    use HasSchoolScope;

    protected $table = 'tagihans';

    protected $fillable = [
        'school_id',
        'siswa_id',
        'jenis_tagihan_id',
        'tahun_ajaran_id',
        'bulan',
        'nominal_tagihan',
        'nominal_diskon',
        'nominal_bersih',
        'jatuh_tempo',
        'status',
        'keterangan',
        'created_by',
    ];

    protected $casts = [
        'nominal_tagihan' => 'decimal:2',
        'nominal_diskon' => 'decimal:2',
        'nominal_bersih' => 'decimal:2',
        'jatuh_tempo' => 'date',
    ];

    // ── Relasi ───────────────────────────────────────────────

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    public function jenisTagihan()
    {
        return $this->belongsTo(JenisTagihan::class, 'jenis_tagihan_id');
    }

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }

    public function pembayarans()
    {
        return $this->hasMany(Pembayaran::class, 'tagihan_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ── Scope ────────────────────────────────────────────────

    public function scopeBelumLunas($query)
    {
        return $query->whereIn('status', ['belum', 'cicil']);
    }

    public function scopeTunggakan($query)
    {
        return $query->where('status', 'belum')
            ->where('jatuh_tempo', '<', now()->toDateString());
    }
}