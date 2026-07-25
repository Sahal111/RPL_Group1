<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GuruDokumen extends Model
{
    use SoftDeletes;
    protected $table = 'guru_dokumens';
    protected $fillable = [
        'guru_id',
        'kategori',
        'nama_dokumen',
        'nomor_dokumen',
        'tanggal_dokumen',
        'tanggal_berlaku',
        'tanggal_kadaluarsa',
        'penerbit',
        'file_path',
        'file_type',
        'file_size',
        'is_verified',
        'keterangan',
    ];
    protected $casts = [
        'is_verified' => 'boolean',
        'tanggal_dokumen' => 'date',
        'tanggal_berlaku' => 'date',
        'tanggal_kadaluarsa' => 'date',
    ];
    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }
}