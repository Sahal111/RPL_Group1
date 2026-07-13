<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengaturan extends Model
{
    protected $table = 'pengaturans';
    public $timestamps = false;

    protected $fillable = [
        'key',
        'value',
        'label',
        'tipe',
        'grup',
    ];
}
