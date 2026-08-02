<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GuruCuti extends Model
{
    use SoftDeletes;

    protected $table = 'guru_cuti';

    protected $fillable = [
        'guru_id',
        'jenis_cuti',
        'tanggal_mulai',
        'tanggal_selesai',
        'jumlah_hari',
        'no_sk',
        'tanggal_sk',
        'pejabat_pemberi',
        'alasan',
        'file_sk',
        'status',
        'keterangan',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'tanggal_sk' => 'date',
    ];

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }

    // Scope: cuti yang sedang aktif (Disetujui dan tanggal belum selesai)
    public function scopeAktif($query)
    {
        return $query->where('status', 'Disetujui')
            ->where('tanggal_mulai', '<=', now()->toDateString())
            ->where('tanggal_selesai', '>=', now()->toDateString());
    }
}