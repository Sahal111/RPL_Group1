<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengumuman extends Model
{
    protected $table = 'pengumumans';

    protected $fillable = [
        'judul',
        'konten',
        'kategori',
        'target',
        'penulis_id',
        'publish_at',
    ];
    protected $casts = [
        'publish_at' => 'datetime',
    ];

    public function penulis()
    {
        return $this->belongsTo(User::class, 'penulis_id', 'id');
    }
}
