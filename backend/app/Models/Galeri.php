<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Galeri extends Model
{
    protected $table = 'galeri';

    protected $fillable = [
        'judul',
        'deskripsi',
        'kategori',
        'foto',
        'uploaded_by',
    ];

    protected $appends = ['foto_url'];

    // Append URL foto agar mudah diakses di frontend
    public function getFotoUrlAttribute(): string
    {
        return asset('storage/' . $this->foto);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
