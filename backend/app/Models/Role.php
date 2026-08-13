<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasSchoolScope;

    protected $table = 'roles';

    protected $fillable = [
        'school_id',
        'slug',
        'nama',
        'deskripsi',
        'is_active',
        'is_system',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_system' => 'boolean',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_roles', 'role_id', 'user_id');
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_permissions', 'role_id', 'permission_id')
            ->withoutGlobalScope(\App\Models\Scopes\SchoolScope::class);
    }

    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }
}