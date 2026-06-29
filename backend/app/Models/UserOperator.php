<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserOperator extends Model
{
    protected $table = 'user_operator';
    public $timestamps = false;

    protected $fillable = ['user_id', 'nip_operator', 'jabatan', 'akses_modul'];

    protected $casts = [
        'akses_modul' => 'array',
    ];
}