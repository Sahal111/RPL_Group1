<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'users';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'role_id',
        'username',
        'email',
        'password',
        'nama_lengkap',
        'no_hp',
        'foto',
        'is_active',
        'created_by',
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relasi ke roles
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    // Relasi ke profil
    public function operatorProfile()
    {
        return $this->hasOne(UserOperator::class, 'user_id');
    }

    public function guruProfile()
    {
        return $this->hasOne(UserGuru::class, 'user_id');
    }

    public function ortuProfile()
    {
        return $this->hasOne(UserOrtu::class, 'user_id');
    }

    public function ortuProfiles()
    {
        return $this->hasMany(UserOrtu::class, 'user_id');
    }

    public function kepsekProfile()
    {
        return $this->hasOne(UserKepsek::class, 'user_id');
    }

    public function bendaharaProfile()
    {
        return $this->hasOne(UserBendahara::class, 'user_id');
    }

    public function waliKelasProfile()
    {
        return $this->hasOne(UserWaliKelas::class, 'user_id');
    }

    // Helper: cek role
    public function isOperator(): bool
    {
        return $this->role_id === 1;
    }
    public function isGuru(): bool
    {
        return $this->role_id === 2;
    }
    public function isOrtu(): bool
    {
        return $this->role_id === 3;
    }
    public function isKepsek(): bool
    {
        return $this->role_id === 4;
    }
    public function isBendahara(): bool
    {
        return $this->role_id === 5;
    }
    public function isWaliKelas(): bool
    {
        return $this->role_id === 6;
    }
}