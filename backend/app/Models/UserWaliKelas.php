<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserWaliKelas extends Model
{
    protected $table = 'wali_kelas';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'nuptk',
        'id_kelas',
        'no_sk',
        'tmt_jabatan',
    ];

    protected $casts = [
        'tmt_jabatan' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'nuptk', 'nuptk');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'id_kelas');
    }
}