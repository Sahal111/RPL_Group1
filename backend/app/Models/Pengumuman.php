<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pengumuman extends Model
{
    use SoftDeletes, HasSchoolScope;

    protected $table = 'pengumumans';

    protected $fillable = [
        'school_id',
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