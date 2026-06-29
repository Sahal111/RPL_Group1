<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengumuman extends Model
{
    protected $table = 'pengumuman';

    protected $fillable = [
        'judul',
        'konten',
        'kategori',
        'penulis_id'
    ];

    public function penulis()
    {
        return $this->belongsTo(User::class, 'penulis_id', 'id');
    }
}
