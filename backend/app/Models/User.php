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
        'name',
        'username',
        'email',
        'password',
        'foto',
        'is_active',
        'last_login_at',
        'last_login_ip',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'is_active'         => 'boolean',
        'email_verified_at' => 'datetime',
        'last_login_at'     => 'datetime',
    ];

    // Relasi ke roles (tetap single role_id untuk kompatibilitas middleware)
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    // Profil guru (tabel gurus)
    public function guru()
    {
        return $this->hasOne(Guru::class, 'user_id');
    }

    // Profil ortu (tabel orang_tuas)
    public function orangTua()
    {
        return $this->hasMany(OrangTua::class, 'user_id');
    }

    // Profil operator
    public function operatorProfile()
    {
        return $this->hasOne(OperatorProfile::class, 'user_id');
    }

    // Profil bendahara
    public function bendaharaProfile()
    {
        return $this->hasOne(UserBendahara::class, 'user_id');
    }

    // Profil wali kelas
    public function waliKelasProfile()
    {
        return $this->hasOne(UserWaliKelas::class, 'user_id');
    }

    // Helper: cek role (slug-based, sesuai RoleMiddleware)
    public function getRoleSlug(): ?string
    {
        return $this->role?->slug;
    }

    public function isOperator(): bool { return $this->role_id === 1; }
    public function isGuru(): bool     { return $this->role_id === 2; }
    public function isOrtu(): bool     { return $this->role_id === 3; }
    public function isKepsek(): bool   { return $this->role_id === 4; }
    public function isBendahara(): bool { return $this->role_id === 5; }
    public function isWaliKelas(): bool { return $this->role_id === 6; }
    public function isAdminPpdb(): bool { return $this->role_id === 7; }
}