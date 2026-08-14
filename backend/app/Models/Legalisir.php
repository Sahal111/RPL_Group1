<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;

class Legalisir extends Model
{
    use HasSchoolScope;

    protected $table = 'legalisir';

    protected $fillable = [
        'school_id',
        'siswa_id',
        'diproses_oleh',
        'jenis_dokumen',
        'jumlah_lembar',
        'tanggal_pengajuan',
        'tanggal_selesai',
        'status',
        'catatan',
    ];

    protected $casts = [
        'tanggal_pengajuan' => 'date',
        'tanggal_selesai' => 'date',
        'jumlah_lembar' => 'integer',
    ];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    public function diprosesOleh()
    {
        return $this->belongsTo(User::class, 'diproses_oleh');
    }

    public function scopeMenunggu($query)
    {
        return $query->where('status', 'menunggu');
    }

    public function scopeSelesai($query)
    {
        return $query->where('status', 'selesai');
    }
}