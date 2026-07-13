<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, SoftDeletes;

    protected $table = 'users';

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'foto',
        'is_active',
        'last_login_at',
        'last_login_ip',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
    ];

    // ── Roles (many-to-many) ─────────────────────────────────

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id')
            ->withTimestamps();
    }

    public function getRoleSlug(): ?string
    {
        return $this->roles->first()?->slug;
    }

    public function hasRole(string $slug): bool
    {
        return $this->roles->contains('slug', $slug);
    }

    // ── Relasi profil ────────────────────────────────────────

    public function guru()
    {
        return $this->hasOne(Guru::class, 'user_id');
    }

    public function orangTua()
    {
        return $this->hasMany(OrangTua::class, 'user_id');
    }

    public function operatorProfile()
    {
        return $this->hasOne(OperatorProfile::class, 'user_id');
    }

    public function bendaharaProfile()
    {
        return $this->hasOne(UserBendahara::class, 'user_id');
    }

    public function waliKelasProfile()
    {
        // Wali kelas diakses via tabel wali_kelas join guru
        return $this->hasOneThrough(UserWaliKelas::class, Guru::class, 'user_id', 'guru_id', 'id', 'id');
    }
}