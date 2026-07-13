<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OperatorProfile extends Model
{
    protected $table = 'operator_profiles';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'nip',
        'jabatan',
        'no_sk',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
