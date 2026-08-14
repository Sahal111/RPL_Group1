<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BkKonseling extends Model
{
    use HasSchoolScope, SoftDeletes;

    protected $table = 'bk_konseling';

    protected $fillable = [
        'school_id',
        'guru_bk_id',
        'siswa_id',
        'jenis',
        'kategori',
        'tanggal',
        'jam_mulai',
        'jam_selesai',
        'keluhan',
        'hasil_konseling',
        'rencana_tindak_lanjut',
        'status',
        'rahasia',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'rahasia' => 'boolean',
    ];

    public function guruBk()
    {
        return $this->belongsTo(User::class, 'guru_bk_id');
    }

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    public function catatan()
    {
        return $this->hasMany(BkCatatan::class, 'konseling_id');
    }

    public function scopeRahasia($query)
    {
        return $query->where('rahasia', true);
    }

    public function scopePerluTindakLanjut($query)
    {
        return $query->where('status', 'perlu_tindak_lanjut');
    }
}