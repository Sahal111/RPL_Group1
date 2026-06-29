<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserOrtu extends Model
{
    protected $table = 'user_ortu';
    public $timestamps = false;

    protected $fillable = ['user_id', 'nisn', 'hubungan'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'nisn', 'nisn');
    }
}