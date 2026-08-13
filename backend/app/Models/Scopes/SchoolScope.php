<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Global Scope yang otomatis menyuntikkan WHERE school_id = ?
 * ke SEMUA query model yang pakai scope ini.
 *
 * Cara pakai di model:
 *
 *   protected static function booted(): void
 *   {
 *       static::addGlobalScope(new SchoolScope);
 *   }
 *
 * School ID diambil dari app container — di-set oleh TenantMiddleware
 * di awal setiap request.
 *
 * Untuk bypass scope (misal: platform admin cek lintas tenant):
 *
 *   Guru::withoutGlobalScope(SchoolScope::class)->find($id);
 *
 * JANGAN bypass scope di controller biasa — hanya boleh di:
 *   - PlatformAdminController
 *   - Command/Artisan untuk maintenance
 *   - SchoolProvisioningService
 */
class SchoolScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $schoolId = app()->bound('current_school_id') ? app('current_school_id') : null;

        if ($schoolId !== null) {
            $builder->where($model->getTable() . '.school_id', $schoolId);
        } else {
            // Coba resolve dari authenticated user sebagai fallback.
            // Ini handle kasus TenantMiddleware belum resolve school_id
            // tapi user sudah ter-auth via Sanctum.
            $user = auth('sanctum')->user();
            if ($user && $user->school_id) {
                app()->instance('current_school_id', $user->school_id);
                $builder->where($model->getTable() . '.school_id', $user->school_id);
            } else {
                // Benar-benar tidak ada tenant — fail-closed.
                $builder->whereRaw('1 = 0');
            }
        }
    }
}