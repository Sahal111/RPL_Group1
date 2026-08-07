<?php

namespace App\Traits;

use App\Models\School;
use App\Models\Scopes\SchoolScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait HasSchoolScope
{
    /**
     * Boot the HasSchoolScope trait for a model.
     */
    protected static function bootHasSchoolScope(): void
    {
        static::addGlobalScope(new SchoolScope);

        static::creating(function ($model) {
            if (empty($model->school_id) && app()->bound('current_school_id')) {
                $schoolId = app('current_school_id');
                if ($schoolId) {
                    $model->school_id = $schoolId;
                }
            }
        });
    }

    /**
     * Relasi ke model School.
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class, 'school_id');
    }
}
