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
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id');
        // ponytail: removed withTimestamps() because user_roles lacks updated_at
    }

    public function getRoleSlug(): ?string
    {
        $slugs = $this->roles->pluck('slug')->toArray();
        foreach (['operator', 'kepsek', 'guru', 'ortu'] as $role) {
            if (in_array($role, $slugs)) {
                return $role;
            }
        }
        return $this->roles->first()?->slug;
    }

    public function hasRole(string $slug): bool
    {
        return $this->roles->contains('slug', $slug);
    }

    // ── Accessor ─────────────────────────────────────────────

    /**
     * Alias 'nama_lengkap' → kolom 'name' di tabel users.
     * Banyak controller lama memakai $user->nama_lengkap; accessor ini
     * mencegah error tanpa harus ganti semua controller sekaligus.
     */
    public function getNamaLengkapAttribute(): string
    {
        return $this->name ?? '';
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