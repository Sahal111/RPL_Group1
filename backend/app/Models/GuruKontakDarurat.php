<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuruKontakDarurat extends Model
{
    protected $table = 'guru_kontak_darurat';

    protected $fillable = [
        'guru_id',
        'nama',
        'hubungan',
        'no_hp',
        'alamat',
        'is_primary',
    ];

    protected $casts = ['is_primary' => 'boolean'];

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }
}