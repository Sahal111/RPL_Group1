<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuruPkg extends Model
{
    protected $table = 'guru_pkgs';

    protected $fillable = [
        'guru_id',
        'tahun_ajaran_id',
        'semester_id',
        'nilai',
        'predikat',
        'catatan',
        'dinilai_oleh',
        'tanggal_penilaian',
    ];

    protected $casts = [
        'nilai' => 'decimal:2',
        'tanggal_penilaian' => 'date',
    ];

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class, 'semester_id');
    }

    public function penilai()
    {
        return $this->belongsTo(User::class, 'dinilai_oleh');
    }
}