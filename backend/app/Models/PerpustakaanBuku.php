<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PerpustakaanBuku extends Model
{
    use HasSchoolScope, SoftDeletes;

    protected $table = 'perpustakaan_buku';

    protected $fillable = [
        'school_id',
        'kode_buku',
        'isbn',
        'judul',
        'pengarang',
        'penerbit',
        'tahun_terbit',
        'kategori',
        'lokasi_rak',
        'stok_total',
        'stok_tersedia',
        'cover',
        'deskripsi',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'stok_total' => 'integer',
        'stok_tersedia' => 'integer',
    ];

    public function peminjaman()
    {
        return $this->hasMany(PerpustakaanPeminjaman::class, 'buku_id');
    }

    public function peminjamanAktif()
    {
        return $this->hasMany(PerpustakaanPeminjaman::class, 'buku_id')
            ->where('status', 'dipinjam');
    }

    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeTersedia($query)
    {
        return $query->where('stok_tersedia', '>', 0);
    }
}