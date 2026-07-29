<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GuruJabatan extends Model
{
    use SoftDeletes;
    protected $table = 'guru_jabatans';
    protected $fillable = [
        'guru_id',
        'jenis_jabatan',
        'jenis_pengangkatan',
        'jabatan',
        'unit_kerja',
        'instansi_pengangkat',
        'golongan',
        'pangkat',
        'status_kepegawaian',
        'no_sk',
        'tanggal_sk',
        'pejabat_penandatangan',
        'tmt_jabatan',
        'tanggal_selesai',
        'masa_berlaku',
        'alasan_berakhir',
        'status_jabatan',
        'uraian_tugas',
        'is_current',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_current' => 'boolean',
        'tanggal_sk' => 'date',
        'tmt_jabatan' => 'date',
        'tanggal_selesai' => 'date',
        'masa_berlaku' => 'date',
    ];
    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }
}