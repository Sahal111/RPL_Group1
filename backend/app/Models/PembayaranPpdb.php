<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;

class PembayaranPpdb extends Model
{
    use HasSchoolScope;

    protected $table = 'pembayaran_ppdb';

    protected $fillable = [
        'school_id',
        'calon_siswa_id',
        'jenis',
        'nominal',
        'status',
        'tanggal_bayar',
        'no_bukti',
    ];

    protected $casts = [
        'nominal' => 'decimal:2',
        'tanggal_bayar' => 'date',
    ];

    // ── Relasi ───────────────────────────────────────────────

    public function calonSiswa()
    {
        return $this->belongsTo(CalonSiswa::class, 'calon_siswa_id');
    }
}