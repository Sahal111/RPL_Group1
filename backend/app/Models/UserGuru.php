<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserGuru extends Model
{
    protected $table = 'user_guru';
    public $timestamps = false;

    protected $fillable = ['user_id', 'nuptk'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'nuptk', 'nuptk');
    }
}