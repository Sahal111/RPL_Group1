<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;

class PerpustakaanPeminjaman extends Model
{
    use HasSchoolScope;

    protected $table = 'perpustakaan_peminjaman';

    protected $fillable = [
        'school_id',
        'buku_id',
        'peminjam_id',
        'peminjam_tipe',
        'petugas_id',
        'tanggal_pinjam',
        'tanggal_kembali_rencana',
        'tanggal_kembali_aktual',
        'status',
        'denda',
        'catatan',
    ];

    protected $casts = [
        'tanggal_pinjam' => 'date',
        'tanggal_kembali_rencana' => 'date',
        'tanggal_kembali_aktual' => 'date',
        'denda' => 'integer',
    ];

    public function buku()
    {
        return $this->belongsTo(PerpustakaanBuku::class, 'buku_id');
    }

    public function peminjam()
    {
        return $this->belongsTo(User::class, 'peminjam_id');
    }

    public function petugas()
    {
        return $this->belongsTo(User::class, 'petugas_id');
    }

    public function scopeDipinjam($query)
    {
        return $query->where('status', 'dipinjam');
    }

    public function scopeTerlambat($query)
    {
        return $query->where('status', 'dipinjam')
            ->where('tanggal_kembali_rencana', '<', now()->toDateString());
    }

    public function isTerlambat(): bool
    {
        return $this->status === 'dipinjam'
            && $this->tanggal_kembali_rencana->isPast();
    }
}