<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuruAnak extends Model
{
    protected $table = 'guru_anaks';

    protected $fillable = [
        'guru_id',
        'nama',
        'jenis_kelamin',
        'tanggal_lahir',
        'urutan',
        'keterangan',
    ];

    protected $casts = ['tanggal_lahir' => 'date'];

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }
}