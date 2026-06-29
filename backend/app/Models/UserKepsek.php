<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserKepsek extends Model
{
    protected $table = 'user_kepsek';
    public $timestamps = false;

    protected $fillable = ['user_id', 'nuptk', 'no_sk', 'tmt_jabatan'];
}