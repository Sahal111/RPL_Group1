<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GuruRekening extends Model
{
    use SoftDeletes;
    protected $table = 'guru_rekenings';
    protected $fillable = [
        'guru_id',
        'nama_bank',
        'no_rekening',
        'atas_nama',
        'cabang',
        'npwp',
        'no_bpjs_kesehatan',
        'no_bpjs_ketenagakerjaan',
        'gaji_pokok',
        'tunjangan_fungsional',
        'tunjangan_profesi',
        'is_primary',
    ];
    protected $casts = ['is_primary' => 'boolean'];
    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }
}