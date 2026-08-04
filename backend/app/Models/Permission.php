<?php

namespace App\Models;

use App\Models\Scopes\SchoolScope;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $table = 'permissions';

    protected $fillable = [
        'school_id',
        'slug',
        'nama',
        'modul',
        'deskripsi',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new SchoolScope);
    }

    // ── Relasi ──────────────────────────────────────────────

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions', 'permission_id', 'role_id');
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}