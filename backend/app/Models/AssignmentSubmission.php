<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;

class AssignmentSubmission extends Model
{
    use HasSchoolScope;

    protected $table = 'assignment_submissions';

    protected $fillable = [
        'school_id',
        'assignment_id',
        'siswa_id',
        'catatan_siswa',
        'storage_path',
        'url_eksternal',
        'status',
        'submitted_at',
        'nilai',
        'feedback_guru',
        'dinilai_oleh',
        'dinilai_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'dinilai_at' => 'datetime',
        'nilai' => 'decimal:2',
    ];

    // ── Relasi ───────────────────────────────────────────────

    public function assignment()
    {
        return $this->belongsTo(Assignment::class, 'assignment_id');
    }

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    public function dinilaiOleh()
    {
        return $this->belongsTo(User::class, 'dinilai_oleh');
    }

    // ── Scope ────────────────────────────────────────────────

    public function scopeSubmitted($query)
    {
        return $query->whereIn('status', ['submitted', 'late', 'graded']);
    }

    public function scopeBelumDinilai($query)
    {
        return $query->whereIn('status', ['submitted', 'late'])
            ->whereNull('nilai');
    }
}