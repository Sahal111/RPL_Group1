<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class School extends Model
{
    use SoftDeletes;

    protected $table = 'schools';

    protected $fillable = [
        'ulid',
        'nama',
        'npsn',
        'jenis',
        'status',
        'trial_ends_at',
        'logo',
        'timezone',
        'locale',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (School $model) {
            $model->ulid ??= (string) Str::ulid();
        });
    }

    // ── Relasi ──────────────────────────────────────────────

    public function settings()
    {
        return $this->hasMany(SchoolSetting::class);
    }

    public function domains()
    {
        return $this->hasMany(SchoolDomain::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function roles()
    {
        return $this->hasMany(Role::class);
    }

    public function permissions()
    {
        return $this->hasMany(Permission::class);
    }

    // ── Helper ──────────────────────────────────────────────

    public function getSetting(string $key, mixed $default = null): mixed
    {
        return $this->settings->where('key', $key)->first()?->value ?? $default;
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isOnTrial(): bool
    {
        return $this->status === 'trial' &&
            ($this->trial_ends_at === null || $this->trial_ends_at->isFuture());
    }

    public function isAccessible(): bool
    {
        return $this->isActive() || $this->isOnTrial();
    }
}