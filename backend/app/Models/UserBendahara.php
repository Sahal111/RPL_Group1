<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserBendahara extends Model
{
    protected $table = 'user_bendahara';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'nip',
        'jabatan',
        'no_sk',
        'tmt_jabatan',
        'akses_modul',
    ];

    protected $casts = [
        'akses_modul' => 'array',
        'tmt_jabatan' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}