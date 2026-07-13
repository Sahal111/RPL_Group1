<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pengumuman extends Model
{
    use SoftDeletes;

    protected $table = 'pengumumans';

    protected $fillable = [
        'judul',
        'konten',
        'kategori',
        'target',
        'penulis_id',
        'publish_at',
        'expired_at',
        'is_pinned',
    ];

    protected $casts = [
        'publish_at' => 'datetime',
        'expired_at' => 'datetime',
        'is_pinned' => 'boolean',
    ];

    public function penulis()
    {
        return $this->belongsTo(User::class, 'penulis_id');
    }
}