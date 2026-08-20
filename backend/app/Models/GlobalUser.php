<?php

namespace App\Models;

use App\Casts\EncryptedJson;
use App\Casts\EncryptedString;
use App\Traits\HasUlid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class GlobalUser extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUlid, SoftDeletes;

    protected $table = 'global_users';

    protected $fillable = [
        'ulid',
        'email',
        'email_verified_at',
        'password',
        'remember_token',
        'name',
        'foto',
        'phone',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
        'is_active',
        'last_login_at',
        'last_login_ip',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'two_factor_confirmed_at' => 'datetime',
        'last_login_at' => 'datetime',
        'is_active' => 'boolean',
        'password' => 'hashed',
        // Keamanan 2FA — dienkripsi di DB, plaintext hanya di memory
        'two_factor_secret' => EncryptedString::class,
        'two_factor_recovery_codes' => EncryptedJson::class,
    ];

    public function schools(): BelongsToMany
    {
        return $this->belongsToMany(School::class, 'global_user_schools', 'global_user_id', 'school_id')
            ->withPivot(['is_default', 'last_accessed_at'])
            ->withTimestamps();
    }

    public function localUsers(): HasMany
    {
        return $this->hasMany(User::class, 'global_user_id');
    }

    public function platformAdmin(): HasOne
    {
        return $this->hasOne(PlatformAdmin::class, 'global_user_id');
    }

    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }
}