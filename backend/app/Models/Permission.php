<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasSchoolScope;

    protected $table = 'permissions';

    protected $fillable = [
        'school_id',
        'slug',
        'nama',
        'modul',
        'deskripsi',
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions', 'permission_id', 'role_id');
    }
}