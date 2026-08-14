<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BkCatatan extends Model
{
    use HasSchoolScope, SoftDeletes;

    protected $table = 'bk_catatan';

    protected $fillable = [
        'school_id',
        'konseling_id',
        'siswa_id',
        'dibuat_oleh',
        'tipe',
        'judul',
        'isi',
        'tingkat',
    ];

    public function konseling()
    {
        return $this->belongsTo(BkKonseling::class, 'konseling_id');
    }

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    public function dibuatOleh()
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    public function scopePelanggaran($query)
    {
        return $query->where('tipe', 'pelanggaran');
    }

    public function scopePrestasi($query)
    {
        return $query->where('tipe', 'prestasi');
    }
}