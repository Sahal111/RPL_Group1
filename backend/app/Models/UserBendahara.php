<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserBendahara extends Model
{
    protected $table = 'bendaharas';

    protected $fillable = [
        'user_id',
        'guru_id',
        'jenis_bendahara',
        'no_sk',
        'tanggal_sk',
        'tmt',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'tanggal_sk' => 'date',
        'tmt' => 'date',
    ];

    // ── Relasi ──────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }
}