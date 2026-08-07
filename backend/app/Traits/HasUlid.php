<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait HasUlid
{
    /**
     * Boot the HasUlid trait for a model.
     */
    protected static function bootHasUlid(): void
    {
        static::creating(function ($model) {
            if (empty($model->ulid)) {
                $model->ulid = (string) Str::ulid();
            }
        });
    }

    /**
     * Get route key for the model (use ULID for public URLs instead of ID).
     */
    public function getRouteKeyName(): string
    {
        return 'ulid';
    }
}
