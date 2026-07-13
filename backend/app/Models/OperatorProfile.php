<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OperatorProfile extends Model
{
    protected $table = 'operator_profiles';

    protected $fillable = [
        'user_id',
        'nip_operator',
        'jabatan',
        'akses_modul',
    ];

    protected $casts = [
        'akses_modul' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}