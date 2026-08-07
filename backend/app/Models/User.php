<?php

namespace App\Models;

use App\Models\Scopes\SchoolScope;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, SoftDeletes;

    protected $table = 'users';

    protected $fillable = [
        'school_id',
        'ulid',
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

    // ── Boot ─────────────────────────────────────────────────

    protected static function booted(): void
    {
        static::addGlobalScope(new SchoolScope);

        static::creating(function (User $model) {
            $model->ulid ??= (string) Str::ulid();
        });
    }

    // ── Roles (many-to-many) ─────────────────────────────────

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id');
        // ponytail: removed withTimestamps() because user_roles lacks updated_at
    }

    public function getRoleSlug(): ?string
    {
        $slugs = $this->roles->pluck('slug')->toArray();
        foreach (['operator', 'kepsek', 'guru', 'wali_kelas', 'bendahara', 'admin_ppdb', 'ortu', 'siswa'] as $role) {
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

    /**
     * Cek apakah user punya permission tertentu.
     * Permission di-cache di property supaya tidak query DB berulang kali dalam satu request.
     */
    public function hasPermission(string $slug): bool
    {
        return $this->getAllPermissions()->contains('slug', $slug);
    }

    public function getAllPermissions(): \Illuminate\Support\Collection
    {
        if (!$this->relationLoaded('roles')) {
            $this->load('roles.permissions');
        }

        return $this->roles
            ->flatMap(fn($role) => $role->permissions)
            ->unique('slug');
    }

    // ── Relasi school ─────────────────────────────────────────

    public function school()
    {
        return $this->belongsTo(School::class);
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