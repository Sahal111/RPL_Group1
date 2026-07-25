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
        'jabatan',
        'golongan',
        'pangkat',
        'status_kepegawaian',
        'no_sk',
        'tanggal_sk',
        'tmt_jabatan',
        'tanggal_selesai',
        'is_current',
        'created_by',
        'updated_by',
    ];
    protected $casts = [
        'is_current' => 'boolean',
        'tanggal_sk' => 'date',
        'tmt_jabatan' => 'date',
        'tanggal_selesai' => 'date',
    ];
    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }
}