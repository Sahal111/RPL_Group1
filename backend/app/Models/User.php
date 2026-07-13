<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'users';
    protected $fillable = ['name', 'username', 'email', 'password', 'foto', 'is_active', 'last_login_at', 'last_login_ip'];
    protected $hidden = ['password', 'remember_token'];
    protected $casts = [
        'is_active' => 'boolean',
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
    ];

    // Many-to-many roles
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id')->withTimestamps();
    }

    // Helper: ambil role pertama (untuk kompatibilitas kode lama)
    public function getRoleSlug(): ?string
    {
        return $this->roles->first()?->slug;
    }

    public function hasRole(string $slug): bool
    {
        return $this->roles->contains('slug', $slug);
    }

    // Relasi profil
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
        return $this->hasOne(UserWaliKelas::class, 'user_id');
    }
}