<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GuruInpassing extends Model
{
    use SoftDeletes;
    protected $table = 'guru_inpassings';
    protected $fillable = [
        'guru_id',
        'no_sk',
        'tanggal_sk',
        'tmt_inpassing',
        'golongan_sesudah',
        'jabatan_fungsional',
        'angka_kredit',
        'file_sk',
    ];
    protected $casts = ['tanggal_sk' => 'date', 'tmt_inpassing' => 'date'];
    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }
}