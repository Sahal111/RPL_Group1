<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Galeri extends Model
{
    protected $table = 'galeris';

    protected $fillable = [
        'judul',
        'deskripsi',
        'foto',
        'kategori',
        'is_published',
        'uploaded_by',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
