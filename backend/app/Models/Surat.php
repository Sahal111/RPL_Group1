<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Surat extends Model
{
    use HasSchoolScope, SoftDeletes;

    protected $table = 'surat';

    protected $fillable = [
        'school_id',
        'nomor_surat',
        'jenis',
        'perihal',
        'pengirim',
        'penerima',
        'tanggal_surat',
        'tanggal_terima',
        'file_path',
        'keterangan',
        'status',
        'dibuat_oleh',
        'diarsip_oleh',
        'diarsip_at',
    ];

    protected $casts = [
        'tanggal_surat' => 'date',
        'tanggal_terima' => 'date',
        'diarsip_at' => 'datetime',
    ];

    public function dibuatOleh()
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    public function diarsipOleh()
    {
        return $this->belongsTo(User::class, 'diarsip_oleh');
    }

    public function arsip(): static
    {
        $this->update([
            'status' => 'diarsip',
            'diarsip_at' => now(),
        ]);
        return $this;
    }

    public function scopeMasuk($query)
    {
        return $query->where('jenis', 'masuk');
    }

    public function scopeKeluar($query)
    {
        return $query->where('jenis', 'keluar');
    }

    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }
}