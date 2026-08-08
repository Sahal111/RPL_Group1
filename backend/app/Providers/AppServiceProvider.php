<?php

namespace App\Providers;

use App\Models\Guru;
use App\Models\Kelas;
use App\Models\Siswa;
use App\Policies\GuruPolicy;
use App\Policies\KelasPolicy;
use App\Policies\SiswaPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Model → Policy mapping.
     * Gate akan otomatis discover method di Policy yang sesuai nama action.
     */
    protected array $policies = [
        Guru::class  => GuruPolicy::class,
        Siswa::class => SiswaPolicy::class,
        Kelas::class => KelasPolicy::class,
    ];

    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }
    }
}
